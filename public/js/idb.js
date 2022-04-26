// create variable to hold db connection
let db;
// establish a connection to IndexedDB database called 'budget-tracker' and set it to version 1
const request = indexedDB.open('budget-tracker', 1);
// this event will emit if the database version changes (nonexistant to version 1, v1 to v2, etc.)
request.onupgradeneeded = function(event) {
    // save a reference to the database 
    const db = event.target.result;
    // create an object store (table) called `new_transaction`, set it to have an auto incrementing primary key of sorts 
    db.createObjectStore('new_transaction', { autoIncrement: true });
  };
  // upon a successful 
request.onsuccess = function(event) {
    // when db is successfully created with its object store (from onupgradedneeded event above) or simply established a connection, save reference to db in global variable
    db = event.target.result;
  
    // check if app is online
    if (navigator.onLine) {
        uploadTransaction();
    }
  };
  
  request.onerror = function(event) {
    // log error here
    console.log(event.target.errorCode);
  };

  function saveTransaction() {
    const transaction = db.transaction(['new_transaction'], 'readwrite');
  
    const transactionObjectStore = transaction.objectStore('new_transaction');
  
    // add record to your store with add method.
    transactionObjectStore.add(record);
  }
  
  function uploadTransaction() {
    const transaction = db.transaction(['new_transaction'], 'readwrite');


    const transactionObjectStore = transaction.objectStore('new_transaction');


    const getAll = transactionObjectStore.getAll();


    getAll.onsuccess = function()  {
        if (getAll.result.length > 0) {
            fetch('/api/transaction', {
                method: 'POST',
                body: JSON.stringify(getAll.result),
                headers: {
                    Accept: 'application/json, text/plain, */*',
                    'Content-Type': 'application/json'
                }
            })
            .then(response => response.json())
            .then(serverResponse => {
                if (serverResponse.message) {
                    throw new Error(serverResponse);
                }


                const transaction = db.transaction(['new_transaction'], 'readwrite');


                const transactionObjectStore = transaction.objectStore('new_transaction');


                transactionObjectStore.clear();


                alert('All saved transactions have been submitted!');
            })
            .catch(err => {
                console.log(err);
            });
        }
    };
  };

window.addEventListener('online', uploadTransaction);
