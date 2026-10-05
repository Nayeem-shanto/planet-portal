import { db } from './db'

export const listJobs = () => db.findAll('jobs')
export const getJob = (id) => db.findById('jobs', id)
export const createJob = (data) => db.insert('jobs', { status: 'open', ...data })
export const updateJob = (id, data) => db.update('jobs', id, data)

export async function deleteJob(id) {
  const applications = await db.findAll('applications', (a) => a.jobId === id)
  if (applications.length) {
    throw new Error('This job has applications. Close it instead of deleting it, so applicant records are kept.')
  }
  return db.remove('jobs', id)
}

/* ---- Saved (bookmarked) jobs, stored per user ---- */
const savedKey = (userId) => `saved:${userId}`

export function getSavedJobIds(userId) {
  try {
    return JSON.parse(db.getRaw(savedKey(userId))) ?? []
  } catch {
    return []
  }
}

export function toggleSavedJob(userId, jobId) {
  const saved = getSavedJobIds(userId)
  const next = saved.includes(jobId) ? saved.filter((id) => id !== jobId) : [...saved, jobId]
  db.setRaw(savedKey(userId), JSON.stringify(next))
  return next
}
