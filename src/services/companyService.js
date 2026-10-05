import { db } from './db'

export const listCompanies = () => db.findAll('companies')
export const getCompany = (id) => db.findById('companies', id)
export const createCompany = (data) => db.insert('companies', data)
export const updateCompany = (id, data) => db.update('companies', id, data)

export async function deleteCompany(id) {
  const jobs = await db.findAll('jobs', (j) => j.companyId === id)
  if (jobs.length) throw new Error(`Remove this company’s ${jobs.length} job post(s) first.`)
  return db.remove('companies', id)
}
