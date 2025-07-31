# 🛡️ Atclouds – Secure Cloud Storage Platform

**Atclouds** is a secure, session-based cloud storage web application built using **Node.js**, **Express**, and **MySQL**. It enables users to register, log in, and manage files with features like dynamic previews and storage tracking — all without relying on third-party cloud platforms.

## 🔧 Features

- 🔐 **User Authentication:** Passwords are hashed securely with `bcrypt`, and sessions are managed via `express-session`.
- 📁 **File Handling:** Users can upload, preview (PDF, image, text), and delete their files.
- ⚙️ **User Preferences:** Includes theme settings, notifications toggle, and password change functionality.
- 🛑 **Security Measures:** Rate limiting applied to login and registration routes to prevent brute-force attacks.
- 📊 **Storage Usage:** Displays total storage consumed per user.
- 🌐 **Frontend Integration:** Works with dynamic HTML templates for a seamless UX.

## 🛠️ Tech Stack

- **Backend:** Node.js, Express.js
- **Database:** MySQL (MySQL2 connection pool)
- **Security:** Bcrypt, Express-session, Rate-limiter
- **Middleware:** Multer (file uploads), fs (file system)
- **File Preview:** Renders `.jpg`, `.png`, `.pdf`, and `.txt` files in-browser using base64 encoding.

## 📌 Future Enhancements

- Implement AES encryption for client-side file protection.
- Add user roles and access controls for shared file functionality.
- Improve UI/UX with modern front-end frameworks.

## 🧑‍💻 Author

**Thrishanth Reddy Gottam**  
📧 gottamthrishanthreddy@gmail.com  
🔗 [LinkedIn](https://www.linkedin.com/in/gottam-thrishanthreddy)  
💻 [GitHub](https://github.com/thrishanthgottam)
