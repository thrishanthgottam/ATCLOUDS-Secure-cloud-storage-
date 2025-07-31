require('dotenv').config();  // Load environment variables

const express = require('express');
const path = require('path');
const multer = require('multer');
const bcrypt = require('bcrypt');
const { createPool } = require('mysql2');
const fs = require('fs');
const session = require('express-session');
const rateLimit = require('express-rate-limit');  

const app = express();
const port = process.env.PORT || 3032;
const uploadDir = path.join(__dirname, 'uploads');

if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir);
}

const upload = multer({ dest: uploadDir });

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static(path.join(__dirname)));

app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  cookie: {
    httpOnly: true,
    secure:false,       // set to true when to ensure cookies sent only over HTTPS when you convert it through https
    sameSite: 'strict',
    maxAge: 2 * 60 * 60 * 1000,  // 2 hours in milliseconds  
  }
}));


// MySQL connection pool
const connection = createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    connectionLimit: 10
});


// Rate limiter for the registration route
const registerLimiter = rateLimit({
    windowMs: 1440 * 60 * 1000, // 1day 
    max: 5, // Limit each IP to 5 requests per windowMs
    message: 'Too many registration attempts, please try again later',
    standardHeaders: true,
    legacyHeaders: false,
});

// Rate limiter for the login route
const loginLimiter = rateLimit({
    windowMs: 11* 60 * 1000, // 11 minutes
    max: 5, // Limit each IP to 5 requests per windowMs
    message: 'Too many login attempts, please try again later. <a href="/too-many-login-attempts">Click here</a> to view more information.',
    standardHeaders: true,
    legacyHeaders: false,
});

// Static Pages
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'cloud.html'));
});

app.get('/register', (req, res) => {
    res.sendFile(path.join(__dirname, 'register.html'));
});

app.get('/success', (req, res) => {
    res.sendFile(path.join(__dirname, 'success.html'));
});
app.get('/uploadsuccess', (req, res) => {
    if (!req.session.username) {
        return res.status(401).send('You must be logged in');
    }
    res.sendFile(path.join(__dirname, 'uploadsuccess.html'));
});

app.get('/settings', (req, res) => {
    if (!req.session.username) {
        return res.status(401).send('You must be logged in to view settings');
    }
    res.sendFile(path.join(__dirname, 'settings.html'));
});


// Register User (Sign Up)
app.post('/register',registerLimiter, async (req, res) => {
    const { username, password } = req.body;
    if (!username || !password) {
        return res.status(400).send('Username and password are required');
    }

    // Check if username already exists
    connection.query("SELECT * FROM register WHERE username = ?", [username], async (err, results) => {
        if (err) {
            console.error(err);
            return res.status(500).send('Error checking username availability');
        }

        if (results.length > 0) {
            return res.status(400).send('Username is already taken');
        }

        try {
            const hashedPassword = await bcrypt.hash(password, 14);
            connection.query(
                "INSERT INTO register (username, password) VALUES (?, ?)",
                [username, hashedPassword],
                (err) => {
                    if (err) {
                        console.error(err);
                        return res.status(500).send('Error registering user');
                    }
                    res.redirect('sregister.html');
                }
            );
        } catch (err) {
            res.status(500).send('Server error');
        }
    });
});

// Login
app.post('/submit', loginLimiter,(req, res) => {
    const { username, password } = req.body;

    if (!username || !password) {
        return res.status(400).send('Username and password are required');
    }

    connection.query("SELECT * FROM register WHERE username = ?", [username], async (err, results) => {
        if (err) return res.status(500).send('Error checking credentials');
        if (!results.length) return res.status(404).send('User not found');

        const user = results[0];
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return res.status(401).send('Invalid password');

        req.session.username = username;
        res.redirect('/success');
    });
});

// Add this route to serve the "Too many login attempts" page
app.get('/too-many-login-attempts', (req, res) => {
    res.sendFile(path.join(__dirname, 'too-many-login-attempts.html'));
});

// Upload File
app.post('/uploads', upload.single('file'), (req, res) => {
    if (!req.session.username) {
        return res.status(401).send('You must be logged in to upload');
    }

    if (!req.file) {
        return res.status(400).send('No file uploaded');
    }

    const fileBuffer = fs.readFileSync(req.file.path);
    const username = req.session.username;

    connection.query(
        "UPDATE register SET file_name = ?, file_size = ?, description = ?, data = ? WHERE username = ?",
        [req.file.originalname, req.file.size, req.file.mimetype, fileBuffer, username],
        (err) => {
            if (err) return res.status(500).send('Error saving file');
            res.redirect('/uploadsuccess');
        }
    );
});

// Get User Files (Shelf)
app.get('/shelf', (req, res) => {
    if (!req.session.username) {
        return res.status(401).send('You must be logged in to view your shelf');
    }

    const username = req.session.username;
    connection.query("SELECT file_name FROM register WHERE username = ?", [username], (err, results) => {
        if (err) return res.status(500).send('Error fetching files');
        if (results.length === 0) return res.send('No files uploaded');

        res.json(results);
    });
});

// Delete File for Logged-in User
app.post('/delete-file', (req, res) => {
    if (!req.session.username) {
        return res.status(401).send('You must be logged in to delete files');
    }

    const { file_name } = req.body;
    if (!file_name) {
        return res.status(400).send('file_name is required');
    }

    const username = req.session.username;

    // Remove file fields only if they match username and file_name
    const query = `
        UPDATE register 
        SET file_name = NULL, file_size = NULL, description = NULL, data = NULL 
        WHERE username = ? AND file_name = ?
    `;

    connection.query(query, [username, file_name], (err, results) => {
        if (err) {
            console.error('Error deleting file:', err);
            return res.status(500).send('Error deleting file');
        }

        if (results.affectedRows === 0) {
            return res.status(404).send('File not found or does not belong to you');
        }

        res.json({ message: 'File deleted successfully' });
    });
});


// File Preview (POST)
app.post('/preview', (req, res) => {
    const file_name = req.body.file_name;
    if (!file_name) return res.status(400).send('file_name is required');

    const query = 'SELECT * FROM register WHERE file_name = ? AND username = ?';
    connection.query(query, [file_name, req.session.username], (err, results) => {
        if (err) return res.status(500).send('Database error');
        if (!results.length) return res.status(404).send('File not found');

        const file = results[0];
        renderPreview(res, file);
    });
});

// File Preview (GET)
app.get('/preview', (req, res) => {
    const file_name = req.query.file_name;
    if (!file_name) return res.status(400).send('file_name is required');

    const query = 'SELECT * FROM register WHERE file_name = ?';
    connection.query(query, [file_name], (err, results) => {
        if (err) return res.status(500).send('Database error');
        if (!results.length) return res.status(404).send('File not found');

        const file = results[0];
        renderPreview(res, file);
    });
});

// Preview Renderer Function
function renderPreview(res, file) {
    const ext = path.extname(file.file_name).toLowerCase();
    const mimeTypes = {
        '.jpg': 'image/jpeg',
        '.jpeg': 'image/jpeg',
        '.png': 'image/png',
        '.pdf': 'application/pdf',
        '.txt': 'text/plain'
    };

    const contentType = mimeTypes[ext] || 'application/octet-stream';

    if (['.jpg', '.jpeg', '.png'].includes(ext)) {
        const base64 = Buffer.from(file.data).toString('base64');
        return res.send(`
            <html><body>
                <button onclick="toggle()">_</button>
                <div id="preview"><img src="data:${contentType};base64,${base64}" style="max-width:100%;" /></div>
                <script>
                    function toggle() {
                        const el = document.getElementById('preview');
                        el.style.display = el.style.display === 'none' ? 'block' : 'none';
                    }
                </script>
            </body></html>
        `);
    }

    if (ext === '.pdf') {
        const base64 = Buffer.from(file.data).toString('base64');
        return res.send(`
            <html><body>
                <button onclick="toggle()">_</button>
                <div id="preview">
                    <iframe src="data:${contentType};base64,${base64}" width="100%" height="500px" style="border:none;"></iframe>
                </div>
                <script>
                    function toggle() {
                        const el = document.getElementById('preview');
                        el.style.display = el.style.display === 'none' ? 'block' : 'none';
                    }
                </script>
            </body></html>
        `);
    }

    if (ext === '.txt') {
        const text = Buffer.from(file.data).toString('utf-8');
        return res.send(`
            <html><body>
                <button onclick="toggle()">_</button>
                <div id="preview"><pre>${text}</pre></div>
                <script>
                    function toggle() {
                        const el = document.getElementById('preview');
                        el.style.display = el.style.display === 'none' ? 'block' : 'none';
                    }
                </script>
            </body></html>
        `);
    }

    res.setHeader('Content-Type', contentType);
    res.send(file.data);
}

// Update User Settings
app.post('/updateSettings', (req, res) => {
    const { theme, notifications } = req.body;
    const username = req.session.username;

    if (!username) return res.status(401).send('You must be logged in to save settings');
    if (theme === undefined || notifications === undefined) {
        return res.status(400).send('Both theme and notifications are required');
    }

    connection.query("UPDATE register SET theme = ?, notifications = ? WHERE username = ?", [theme, notifications, username], (err) => {
        if (err) return res.status(500).send('Error saving settings');
        res.json({ message: 'Settings saved successfully' });
    });
});

// Get Storage Usage
app.get('/getStorageUsage', (req, res) => {
    const username = req.session.username;
    if (!username) return res.status(401).send('You must be logged in to view storage');

    connection.query("SELECT SUM(file_size) AS usedSpace FROM register WHERE username = ?", [username], (err, results) => {
        if (err) return res.status(500).send('Error fetching storage data');
        res.json({ usedSpace: results[0].usedSpace || 0 });
    });
});

// Clear User Documents
app.post('/clearDocuments', (req, res) => {
    const username = req.session.username;
    if (!username) return res.status(401).send('You must be logged in to clear documents');

    connection.query("DELETE FROM register WHERE username = ?", [username], (err) => {
        if (err) return res.status(500).send('Error deleting documents');
        res.json({ message: 'Documents cleared successfully' });
    });
});
app.post('/changePassword', (req, res) => {
    const username = req.session.username;
    const { oldPassword, newPassword } = req.body;

    if (!username) return res.status(401).json({ message: 'You must be logged in' });
    if (!oldPassword || !newPassword) {
        return res.status(400).json({ message: 'Both fields are required' });
    }

    connection.query("SELECT * FROM register WHERE username = ?", [username], async (err, results) => {
        if (err || results.length === 0) return res.status(500).json({ message: 'User not found' });

        const user = results[0];
        const match = await bcrypt.compare(oldPassword, user.password);
        if (!match) return res.status(401).json({ message: 'Current password is incorrect' });

        const hashedNew = await bcrypt.hash(newPassword, 10);
        connection.query("UPDATE register SET password = ? WHERE username = ?", [hashedNew, username], (err) => {
            if (err) return res.status(500).json({ message: 'Error updating password' });
            res.json({ message: 'Password updated successfully' });
        });
    });
});

app.post('/logout', (req, res) => {
    req.session.destroy(err => {
        if (err) {
            console.error('Logout error:', err);
            return res.status(500).send('Error logging out');
        }
        res.clearCookie('connect.sid'); // Optional: clears the session cookie
        res.sendStatus(200);
    });
});

// Start Server
app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});
