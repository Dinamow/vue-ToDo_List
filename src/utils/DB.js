// this is DB file for index DB for day based tasks

// 1. check if the DB is already connected
// 2. if not, connect to the DB
// 3. if yes, return the DB

const DB_NAME = 'tasks'
const DB_VERSION = 1

const dbRequest = new Promise((resolve, reject) => {
  const request = indexedDB.open(DB_NAME, DB_VERSION)

  request.onerror = (event) => {
    reject('Database error: ' + event.target.error)
  }

  request.onsuccess = (event) => {
    resolve(event.target)
  }

  request.onupgradeneeded = (event) => {
    const db = event.target.result
    if (!db.objectStoreNames.contains('tasks')) {
      db.createObjectStore('tasks', { keyPath: 'id', autoIncrement: true })
    }
  }
})

// 3. if yes, return the DB
export default dbRequest
