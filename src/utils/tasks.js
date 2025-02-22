// do the CRUD operations for the tasks
// use the DB.js to connect to the DB
// use the DB.js to create the tasks object store
// use the DB.js to Update the tasks object store
// use the DB.js to Delete the tasks object store
// use the DB.js to Get the tasks object store
// use the DB.js to Get the tasks of the day
import db from './DB'

// 1. Create the tasks object store

const sampleTasks = [
  {
    saterday: [
      {
        id: 1,
        title: 'Task 1',
        description: 'Description 1',
        completed: false,
      },
    ],
  },
]

// 2. Create the tasks object store

class Tasks {
  constructor() {
    this.__db = null
    this.init()
  }

  async init() {
    try {
      // Wait for the database connection to be established
      const dbRequest = await db
      this.__db = dbRequest.result
      // Create store if it doesn't exist
      if (!this.__db.objectStoreNames.contains('tasks')) {
        await this.createTasksObjectStore()
      }
    } catch (error) {
      console.error('Failed to initialize database:', error)
    }
  }

  async createTasksObjectStore() {
    try {
      const transaction = this.__db.transaction('tasks', 'readwrite')
      const store = transaction.objectStore('tasks')

      for (const task of sampleTasks) {
        await store.add(task)
      }

      return new Promise((resolve, reject) => {
        transaction.oncomplete = () => resolve()
        transaction.onerror = () => reject(transaction.error)
      })
    } catch (error) {
      console.error('Error creating tasks store:', error)
      throw error
    }
  }

  async getTasksObjectStore(day) {
    try {
      const transaction = this.__db.transaction('tasks', 'readonly')
      const store = transaction.objectStore('tasks')
      return await store.get(day)
    } catch (error) {
      console.error('Error getting tasks:', error)
      return null
    }
  }

  async updateTasksObjectStore(day, task) {
    try {
      const transaction = this.__db.transaction('tasks', 'readwrite')
      const store = transaction.objectStore('tasks')
      await store.put(task)
    } catch (error) {
      console.error('Error updating tasks:', error)
      throw error
    }
  }

  async deleteTasksObjectStore(day, task) {
    try {
      const transaction = this.__db.transaction('tasks', 'readwrite')
      const store = transaction.objectStore('tasks')
      await store.delete(day, task)
    } catch (error) {
      console.error('Error deleting tasks:', error)
      throw error
    }
  }
}

// Export a single instance
export const tasksManager = new Tasks()
