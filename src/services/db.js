/**
 * A tiny "fake database" on top of localStorage.
 *
 * WHY THIS EXISTS: this project has no backend yet. Every other service talks
 * to this file instead of touching localStorage directly, so later you can
 * replace these functions with real HTTP calls to an Express + MongoDB API
 * without rewriting the UI.
 *
 * Every function is async on purpose. A real API is asynchronous, so the UI is
 * already written the way it will need to be once a server exists.
 */

const PREFIX = 'planet:'

// Simulate a little network latency so loading states are real.
const delay = (ms = 120) => new Promise((resolve) => setTimeout(resolve, ms))

function readCollection(name) {
  try {
    return JSON.parse(localStorage.getItem(PREFIX + name)) ?? []
  } catch {
    return [] // corrupted data should not crash the app
  }
}

function writeCollection(name, rows) {
  localStorage.setItem(PREFIX + name, JSON.stringify(rows))
}

export const db = {
  async findAll(collection, predicate = () => true) {
    await delay()
    return readCollection(collection).filter(predicate)
  },

  async findOne(collection, predicate) {
    await delay()
    return readCollection(collection).find(predicate) ?? null
  },

  async findById(collection, id) {
    return this.findOne(collection, (row) => row.id === id)
  },

  async insert(collection, doc) {
    await delay()
    const now = new Date().toISOString()
    const row = { id: crypto.randomUUID(), createdAt: now, updatedAt: now, ...doc }
    writeCollection(collection, [...readCollection(collection), row])
    return row
  },

  async update(collection, id, changes) {
    await delay()
    const rows = readCollection(collection)
    const index = rows.findIndex((row) => row.id === id)
    if (index === -1) throw new Error(`Record not found in ${collection}`)
    rows[index] = { ...rows[index], ...changes, updatedAt: new Date().toISOString() }
    writeCollection(collection, rows)
    return rows[index]
  },

  async remove(collection, id) {
    await delay()
    writeCollection(collection, readCollection(collection).filter((row) => row.id !== id))
  },

  // Synchronous helpers used only for seeding and small key/value settings.
  getRaw: (key) => localStorage.getItem(PREFIX + key),
  setRaw: (key, value) => localStorage.setItem(PREFIX + key, value),
  removeRaw: (key) => localStorage.removeItem(PREFIX + key),
  replaceCollection: writeCollection,
}

/** Wipe every key this app owns. Handy while developing. */
export function resetAllData() {
  Object.keys(localStorage)
    .filter((key) => key.startsWith(PREFIX))
    .forEach((key) => localStorage.removeItem(key))
}
