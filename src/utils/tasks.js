// do the CRUD operations for the tasks

const DB_NAME = 'tasks_db'
const STORE_NAME = 'tasks'
const DB_VERSION = 1

const sampleTasks = {
  thur: [
    {
      id: 1,
      title: 'Morning Exercise',
      description: 'Morning jog for 30 minutes',
      completed: false,
    },
    { id: 2, title: 'Team Meeting', description: 'Weekly sync with the team', completed: false },
  ],
  fri: [
    { id: 3, title: 'Project Review', description: 'Review project milestones', completed: false },
    {
      id: 4,
      title: 'Weekly Report',
      description: 'Prepare weekly status report',
      completed: false,
    },
  ],
  sat: [
    {
      id: 5,
      title: 'Weekend Shopping',
      description: 'Buy groceries for the week',
      completed: false,
    },
  ],
}

class TaskManager {
  constructor() {
    this.db = null
    this.dbInitialized = false
    this.initPromise = this.init()
  }

  async init() {
    try {
      return new Promise((resolve, reject) => {
        const request = indexedDB.open(DB_NAME, DB_VERSION)

        request.onerror = (event) => {
          console.error('Database error:', event.target.error)
          reject(event.target.error)
        }

        request.onupgradeneeded = (event) => {
          const db = event.target.result
          if (!db.objectStoreNames.contains(STORE_NAME)) {
            const store = db.createObjectStore(STORE_NAME, { keyPath: 'day' })
            // Seed initial data
            Object.entries(sampleTasks).forEach(([day, tasks]) => {
              store.add({ day, tasks })
            })
          }
        }

        request.onsuccess = (event) => {
          this.db = event.target.result
          this.dbInitialized = true
          console.log('Database initialized successfully')
          resolve()
        }
      })
    } catch (error) {
      console.error('Failed to initialize database:', error)
      throw error
    }
  }

  async getTasks(day) {
    // Wait for DB initialization before proceeding
    await this.initPromise

    return new Promise((resolve, reject) => {
      if (!this.db) {
        reject(new Error('Database not initialized'))
        return
      }

      const transaction = this.db.transaction([STORE_NAME], 'readonly')
      const store = transaction.objectStore(STORE_NAME)
      const request = store.get(day.toLowerCase())

      request.onsuccess = () => {
        const result = request.result
        resolve(result ? result.tasks : [])
      }

      request.onerror = () => {
        reject(request.error)
      }
    })
  }

  async addTask(day, task) {
    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction([STORE_NAME], 'readwrite')
      const store = transaction.objectStore(STORE_NAME)

      // First get existing tasks
      const getRequest = store.get(day.toLowerCase())

      getRequest.onsuccess = () => {
        const data = getRequest.result || { day: day.toLowerCase(), tasks: [] }
        const newTask = {
          id: Date.now(),
          title: task.title,
          completed: false,
          ...task,
        }

        data.tasks.push(newTask)
        store.put(data)
        resolve(newTask)
      }

      getRequest.onerror = () => reject(getRequest.error)
    })
  }

  async updateTask(day, taskId, updates) {
    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction([STORE_NAME], 'readwrite')
      const store = transaction.objectStore(STORE_NAME)

      const getRequest = store.get(day.toLowerCase())

      getRequest.onsuccess = () => {
        const data = getRequest.result
        if (!data) {
          reject(new Error('Day not found'))
          return
        }

        const taskIndex = data.tasks.findIndex((t) => t.id === taskId)
        if (taskIndex === -1) {
          reject(new Error('Task not found'))
          return
        }

        // Merge existing task with updates
        data.tasks[taskIndex] = {
          ...data.tasks[taskIndex],
          ...updates,
          // Ensure completed status is exactly as specified
          completed: Object.prototype.hasOwnProperty.call(updates, 'completed')
            ? updates.completed
            : data.tasks[taskIndex].completed,
        }

        const putRequest = store.put(data)
        putRequest.onsuccess = () => resolve(data.tasks[taskIndex])
        putRequest.onerror = () => reject(putRequest.error)
      }

      getRequest.onerror = () => reject(getRequest.error)
    })
  }

  async deleteTask(day, taskId) {
    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction([STORE_NAME], 'readwrite')
      const store = transaction.objectStore(STORE_NAME)

      const getRequest = store.get(day.toLowerCase())

      getRequest.onsuccess = () => {
        const data = getRequest.result
        if (!data) {
          reject(new Error('Day not found'))
          return
        }

        data.tasks = data.tasks.filter((t) => t.id !== taskId)
        store.put(data)
        resolve(true)
      }

      getRequest.onerror = () => reject(getRequest.error)
    })
  }

  async toggleTask(day, taskId) {
    // Get current task first to toggle its state
    const transaction = this.db.transaction([STORE_NAME], 'readonly')
    const store = transaction.objectStore(STORE_NAME)
    const data = await new Promise((resolve, reject) => {
      const request = store.get(day.toLowerCase())
      request.onsuccess = () => resolve(request.result)
      request.onerror = () => reject(request.error)
    })

    const task = data.tasks.find((t) => t.id === taskId)
    if (!task) throw new Error('Task not found')

    // Toggle the completed status
    return this.updateTask(day, taskId, { completed: !task.completed })
  }

  async updateTasksOrder(day, tasks) {
    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction([STORE_NAME], 'readwrite')
      const store = transaction.objectStore(STORE_NAME)
      const getRequest = store.get(day.toLowerCase())

      getRequest.onsuccess = () => {
        const data = getRequest.result
        if (!data) {
          reject(new Error('Day not found'))
          return
        }

        // Ensure we only store serializable data
        const cleanTasks = tasks.map((task) => ({
          id: task.id,
          title: task.title,
          description: task.description,
          completed: task.completed,
        }))

        data.tasks = cleanTasks
        const putRequest = store.put(data)
        putRequest.onsuccess = () => resolve(cleanTasks)
        putRequest.onerror = () => reject(putRequest.error)
      }

      getRequest.onerror = () => reject(getRequest.error)
    })
  }
}

export const taskManager = new TaskManager()
