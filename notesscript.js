// script.js
let savedNotes = JSON.parse(localStorage.getItem('notes')) || [];

function saveNote() {
    const noteInput = document.getElementById('noteInput');
    const noteContent = noteInput.value.trim();

    if (noteContent !== "") {
        savedNotes.push(noteContent);
        localStorage.setItem('notes', JSON.stringify(savedNotes));
        noteInput.value = '';  // Clear the textarea after saving
        displaySavedNotes();
    } else {
        alert("Please write something before saving.");
    }
}

function displaySavedNotes() {
    const savedNotesContainer = document.getElementById('savedNotes');
    savedNotesContainer.innerHTML = '';  // Clear any existing notes

    savedNotes.forEach((note, index) => {
        const noteElement = document.createElement('div');
        noteElement.classList.add('note');
        noteElement.innerHTML = `<p>${note}</p>`;

        savedNotesContainer.appendChild(noteElement);
    });
}

// Display saved notes when the page loads
window.onload = function() {
    displaySavedNotes();
};
