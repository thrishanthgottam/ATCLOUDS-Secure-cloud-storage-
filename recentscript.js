// Dummy data for recent files
alert("You can access your recents here")
const recentFiles = [
    { name: 'Document1.pdf', type: 'PDF', lastAccessed: '2025-01-28', size: '2.5 MB' },
    { name: 'Report.docx', type: 'Word Document', lastAccessed: '2025-01-25', size: '1.8 MB' },
    { name: 'Presentation.pptx', type: 'PowerPoint', lastAccessed: '2025-01-23', size: '5 MB' },
    { name: 'Spreadsheet.xlsx', type: 'Excel', lastAccessed: '2025-01-20', size: '3.2 MB' },
    { name: 'Notes.txt', type: 'Text File', lastAccessed: '2025-01-18', size: '50 KB' }
];

// Function to display files in the 'recentFiles' section
function displayFiles(files) {
    const filesContainer = document.getElementById('recentFiles');
    filesContainer.innerHTML = ''; // Clear existing files
    files.forEach(file => {
        const fileElement = document.createElement('div');
        fileElement.classList.add('file');
        fileElement.innerHTML = `
            <h2>${file.name}</h2>
            <p>Type: ${file.type}</p>
            <p>Size: ${file.size}</p>
            <p>Last Accessed: ${file.lastAccessed}</p>
        `;
        filesContainer.appendChild(fileElement);
    });
}

// Event listener for the search button
document.getElementById('searchButton').addEventListener('click', function() {
    const query = document.getElementById('searchInput').value.toLowerCase();
    const filteredFiles = recentFiles.filter(file =>
        file.name.toLowerCase().includes(query) || file.type.toLowerCase().includes(query)
    );
    displayFiles(filteredFiles);
});

// Initial display of files
displayFiles(recentFiles);
