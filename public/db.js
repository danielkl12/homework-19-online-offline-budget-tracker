const db;
const request = indexedDB.open("budget", 1);

request.onupgradeneeded = function(event) {
    const db = event.target.result;
    db.createObjectStore("pending", {autoIncrement: true})
};
//if navigator is online--check database function
request.onsuccess = ({target}) =>  {
    db = target.result;


    if (navigator.onLine) {
        checkDatabase();
    }
};

//shows error and type of error
request.onerror = ({event}) =>  {
    console.log("error " + event.target.errorCode);
};
//save function
function save(record) {
 const transaction = db.transaction(["pending"] , "readwrite");
 const store = transaction.objectStore("pending");
 store.add(record);
};
//check database function
function checkDatabase() {
    const transaction = db.transaction(["pending"] , "readwrite");
    const store = transaction.objectStore("pending");
    const getAll = store.getAll();
    getAll.onsuccess = function() {
        if(getAll.result.length > 0) {
            fetch("/api/transaction/bulk", {
                method: "POST",
                body: JSON.stringify(getAll.result),
                headers: {
                  Accept: "application/json, text/plain, */*",
                  "Content-Type": "application/json"
                }
              })
              .then(response => {    
                return response.json();
              })
              .then(() => {
                const transaction = db.transaction(["pending"] , "readwrite");
                const store = transaction.objectStore("pending");
                store.clear();
              });
        }
    };
   }

window.addEventListener("onLine", checkDatabase);
   
   

