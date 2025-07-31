document.addEventListener('DOMContentLoaded', function() {
    const searchInput = document.getElementById('searchInput');
    const searchButton = document.getElementById('searchButton');
    const mainContent = document.getElementById('mainContent');

    // Sample data (you can replace this with actual data or dynamically load it)
    const trashFiles = [
        { name: 'Document 1.txt', date: '2025-01-25' },
        { name: 'Image 2.jpg', date: '2025-01-22' },
        { name: 'Presentation.ppt', date: '2025-01-20' },
        { name: 'Video.mp4', date: '2025-01-18' }
    ];

    // Function to display files
    function displayFiles(files) {
        mainContent.innerHTML = ''; // Clear existing content
        files.forEach(file => {
            const fileElement = document.createElement('div');
            fileElement.classList.add('file-item');
            fileElement.innerHTML = `
                <p><strong>${file.name}</strong><br><small>Deleted on: ${file.date}</small></p>
            `;
            mainContent.appendChild(fileElement);
        });
    }

    // Display all files initially
    displayFiles(trashFiles);

    // Search functionality
    searchButton.addEventListener('click', function() {
        const query = searchInput.value.toLowerCase();
        const filteredFiles = trashFiles.filter(file => file.name.toLowerCase().includes(query));
        displayFiles(filteredFiles);
    });

    // Optional: Search on Enter key press
    searchInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            searchButton.click();
        }
    });
});








// Login
app.post('/submit', (req, res) => {
    const { username, password } = req.body;

    if (!username || !password) {
        return res.status(400).send('Username and password are required');
    }

    connection.query("SELECT * FROM register WHERE username = ? AND password = ?", [username, password], (err, result) => {
        if (err) return res.status(500).send('Error checking credentials');
        if (!result.length) return res.status(404).send('User not found');

        req.session.username = username;
        req.session.password = password;
        res.redirect('/success');
    });
});