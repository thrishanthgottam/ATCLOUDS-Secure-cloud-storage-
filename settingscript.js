// JavaScript for handling the form submission and actions
document.getElementById('settingsForm').addEventListener('submit', function(event) {
    event.preventDefault(); // Prevent form from submitting

    // Get settings values
    const theme = document.getElementById('theme').value;
    const notificationsEnabled = document.getElementById('notifications').checked;

    // Simulate saving settings (you can send data to a server here)
    console.log('Settings saved:', { theme, notificationsEnabled });

    // Show success message
    const responseMessage = document.getElementById('responseMessage');
    responseMessage.textContent = 'Settings saved successfully!';
    responseMessage.style.display = 'block';
});

// Random Storage Value Generator (when the page loads)
window.onload = function() {
    const totalStorage = 100; // Total storage (in MB)
    const usedStorage = Math.floor(Math.random() * totalStorage) + 1; // Random storage used (between 1 and totalStorage)

    // Display the storage info
    const storageValueText = `${usedStorage}MB / ${totalStorage}MB`;
    document.getElementById('storageValue').textContent = storageValueText;
};

// Clear documents button action
document.getElementById('clearDocuments').addEventListener('click', function() {
    const confirmClear = confirm("Are you sure you want to clear all documents?");
    if (confirmClear) {
        console.log("Documents cleared."); // Simulate clearing documents
        const responseMessage = document.getElementById('responseMessage');
        responseMessage.textContent = 'Documents have been cleared!';
        responseMessage.style.display = 'block';
    }
});
