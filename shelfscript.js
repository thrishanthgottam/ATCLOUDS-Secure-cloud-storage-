// script.js
let fileList = [];

function addFiles() {
    const fileInput = document.getElementById('fileInput');
    const files = fileInput.files;

    for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const fileObject = {
            name: file.name,
            size: file.size,
            type: file.type
        };
        fileList.push(fileObject);
    }

    displayFiles();
    fileInput.value = '';  // Clear the file input
}

function displayFiles() {
    const shelf = document.getElementById('shelf');
    shelf.innerHTML = '';  // Clear shelf before re-rendering

    fileList.forEach((file, index) => {
        const fileItem = document.createElement('div');
        fileItem.classList.add('file-item');
        fileItem.innerHTML = `<p>${file.name}</p>`;

        // Optional: Add click functionality to open or download files
        fileItem.addEventListener('click', () => {
            alert(`File: ${file.name}\nSize: ${file.size} bytes\nType: ${file.type}`);
        });

        shelf.appendChild(fileItem);
    });
}
