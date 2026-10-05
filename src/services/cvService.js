import { db } from './db'

export const emptyCV = () => ({
  personal: { fullName: '', title: '', email: '', phone: '', address: '', linkedin: '', website: '', summary: '' },
  experience: [],
  education: [],
  skills: [],
  languages: [],
  certifications: [],
})

export const newExperience = () => ({ id: crypto.randomUUID(), role: '', company: '', location: '', start: '', end: '', current: false, details: '' })
export const newEducation = () => ({ id: crypto.randomUUID(), degree: '', institution: '', start: '', end: '', result: '' })
export const newCertification = () => ({ id: crypto.randomUUID(), name: '', issuer: '', year: '' })

export async function getCV(userId) {
  const record = await db.findOne('cvs', (cv) => cv.userId === userId)
  return record ? record.data : null
}

export async function saveCV(userId, data) {
  const existing = await db.findOne('cvs', (cv) => cv.userId === userId)
  if (existing) return (await db.update('cvs', existing.id, { data })).data
  return (await db.insert('cvs', { userId, data })).data
}

/** Rough completeness score for nudging the candidate. */
export function cvCompleteness(cv) {
  if (!cv) return 0
  const checks = [
    cv.personal.fullName, cv.personal.title, cv.personal.email, cv.personal.phone,
    cv.personal.summary?.length > 40, cv.experience.length > 0 || cv.education.length > 0,
    cv.education.length > 0, cv.skills.length >= 3,
  ]
  return Math.round((checks.filter(Boolean).length / checks.length) * 100)
}
