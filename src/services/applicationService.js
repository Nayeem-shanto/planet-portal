import { db } from './db'

export async function applyToJob({ job, user, cv, coverLetter }) {
  if (!cv?.personal?.fullName) throw new Error('Complete your CV before applying.')
  if (job.status !== 'open') throw new Error('This job is no longer accepting applications.')
  if (new Date(job.deadline) < new Date()) throw new Error('The deadline for this job has passed.')

  const duplicate = await db.findOne('applications', (a) => a.jobId === job.id && a.userId === user.id)
  if (duplicate) throw new Error('You have already applied to this job.')

  // Store a snapshot of the CV. If the candidate edits their CV later, the
  // employer still sees exactly what was submitted. This is a common
  // real-world pattern: applications are historical records.
  return db.insert('applications', {
    jobId: job.id,
    companyId: job.companyId,
    userId: user.id,
    applicantName: user.name,
    applicantEmail: user.email,
    cvSnapshot: structuredClone(cv),
    coverLetter: coverLetter?.trim() ?? '',
    status: 'Submitted',
  })
}

export const listApplicationsByUser = (userId) => db.findAll('applications', (a) => a.userId === userId)
export const listAllApplications = () => db.findAll('applications')
export const updateApplicationStatus = (id, status) => db.update('applications', id, { status })

export async function withdrawApplication(id, userId) {
  const application = await db.findById('applications', id)
  if (!application || application.userId !== userId) throw new Error('Application not found.')
  if (application.status !== 'Submitted') throw new Error('Only applications not yet reviewed can be withdrawn.')
  return db.remove('applications', id)
}
