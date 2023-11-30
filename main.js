const books = [];
const RENDER_EVENT = 'render-book';

document.addEventListener('DOMContentLoaded', function () {
    const submitForm = document.getElementById('inputBook');
    submitForm.addEventListener('submit', function (event) {
      event.preventDefault();
      addBook();
    });

    const searchForm = document.getElementById('searchBook');
    searchForm.addEventListener('submit', function (event) {
        const searchInput = document.getElementById('searchBookTitle')
        event.preventDefault();
        searchBooks();
        searchForm.reset();
        searchInput.placeholder = "Masukan nilai null untuk kembali";
    });

    if (isStorageExist()) {
        loadDataFromStorage();
    }
});

// Input book
function addBook() {
    const bookTitle = document.getElementById('inputBookTitle').value;
    const bookAuthor = document.getElementById('inputBookAuthor').value;
    const bookYearString = document.getElementById('inputBookYear').value;
    const bookYear = parseInt(bookYearString);
    const isComplete = document.getElementById('inputBookIsComplete').checked;

    const generatedID = generateId();
    const bookObject = generateBookObject(generatedID, bookTitle, bookAuthor, bookYear, isComplete);
    books.push(bookObject);
    alert("Buku berhasil ditambahkan!");
   
    document.dispatchEvent(new Event(RENDER_EVENT));
    saveData();
};

function generateId() {
    return +new Date();
};
   
function generateBookObject(id, title, author, year, isComplete) {
    return {
      id,
      title,
      author,
      year,
      isComplete
    }
};

// Changing the span element
document.addEventListener ('click', function() {
    const isComplete = document.getElementById('inputBookIsComplete').checked;
    const spanElement = document.querySelector("#bookSubmit span");
    spanElement.textContent = isComplete ? "Selesai dibaca" : "Belum selesai dibaca";
});

// Searching books
function searchBooks() {
    const searchInput = document.getElementById('searchBookTitle').value.toLowerCase();
    
    if (searchInput !== null) {
        const uncompletedBookList = document.getElementById('incompleteBookshelfList');
        uncompletedBookList.innerHTML = '';

        const completedBookList = document.getElementById('completeBookshelfList');
        completedBookList.innerHTML = '';

        const searchResult = books.filter(book => book.title.toLowerCase().includes(searchInput));

        for (const book of searchResult) {
            const bookElement = makeBookList(book);
            if (!book.isComplete) {
                uncompletedBookList.appendChild(bookElement);
            } else {
                completedBookList.appendChild(bookElement);
            }
        }
    }
}

// Showing book list
document.addEventListener(RENDER_EVENT, function () {
    const uncompletedBookList = document.getElementById('incompleteBookshelfList');
    uncompletedBookList.innerHTML = '';
   
    const completedBookList = document.getElementById('completeBookshelfList');
    completedBookList.innerHTML = '';
   
    for (const book of books) {
      const bookElement = makeBookList(book);
      if (!book.isComplete)
        uncompletedBookList.append(bookElement);
      else
        completedBookList.append(bookElement);
    }
});

function makeBookList(bookObject) {
    const newBook = document.createElement("article");
    newBook.className = "book_item";
    newBook.innerHTML = `
      <h3>${bookObject.title}</h3>
      <p>Penulis: ${bookObject.author}</p>
      <p>Tahun: ${bookObject.year}</p>
      <div class="action">
        <button class="green" id="changeButton" data-id="${bookObject.id}">${bookObject.isComplete ? "Belum selesai di Baca" : "Selesai dibaca"}</button>
        <button class="red" id="deleteButton" data-id="${bookObject.id}">Hapus buku</button>
      </div>
    `;

    // Changing book status
    const statusBtn = newBook.querySelector('#changeButton')
    statusBtn.addEventListener("click", function () {
        changingBookStatus(bookObject.id);
    });

    function changingBookStatus(bookId) {
        const book = books.find(book => book.id === bookId);
        if (book) {
            book.isComplete = !book.isComplete;
            document.dispatchEvent(new Event(RENDER_EVENT));
            saveData();
        }
    }

    // Delete book
    const deleteBtn = newBook.querySelector("#deleteButton");
    deleteBtn.addEventListener("click", function () {
        const response = window.confirm('Yakin akan hapus buku?')
        if (response) {
            deleteBook(bookObject.id);
        }
    });

    function deleteBook(bookId) {
        const bookIndex = books.findIndex(book => book.id === bookId);
        if (bookIndex !== -1) {
            books.splice(bookIndex, 1);
            document.dispatchEvent(new Event(RENDER_EVENT));
            saveData();
        }
    }

    return newBook;
}

// Saving on local storage
function saveData() {
    if (isStorageExist()) {
      const parsed = JSON.stringify(books);
      localStorage.setItem(STORAGE_KEY, parsed);
      document.dispatchEvent(new Event(SAVED_EVENT));
    }
}

const SAVED_EVENT = 'saved-books';
const STORAGE_KEY = 'BOOKSHELF_APPS';
 
function isStorageExist() {
  if (typeof (Storage) === undefined) {
    alert('Browser kamu tidak mendukung local storage');
    return false;
  }
  return true;
}

document.addEventListener(SAVED_EVENT, function () {
    console.log(localStorage.getItem(STORAGE_KEY));
});

// Loading the storage
function loadDataFromStorage() {
    const serializedData = localStorage.getItem(STORAGE_KEY);
    let data = JSON.parse(serializedData);
   
    if (data !== null) {
      for (const book of data) {
        books.push(book);
      }
    }
   
    document.dispatchEvent(new Event(RENDER_EVENT));
  }