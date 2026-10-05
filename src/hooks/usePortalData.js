import { useCallback, useEffect, useState } from 'react'
import { listJobs } from '../services/jobService'
import { listCompanies } from '../services/companyService'
import { getCV } from '../services/cvService'
import { listAllApplications, listApplicationsByUser } from '../services/applicationService'

/**
 * Load the data most pages need, in parallel.
 * Returns { data, loading, error, reload } — the same shape you would get
 * from a data-fetching library such as TanStack Query, so moving to one
 * later is easy.
 */
export function usePortalData(user, { allApplications = false } = {}) {
  const [data, setData] = useState({ jobs: [], companies: [], cv: null, applications: [] })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const reload = useCallback(async () => {
    try {
      // Promise.all runs the requests at the same time instead of one by one.
      const [jobs, companies, cv, applications] = await Promise.all([
        listJobs(),
        listCompanies(),
        user.panel === 'general' ? getCV(user.id) : null,
        allApplications ? listAllApplications() : listApplicationsByUser(user.id),
      ])
      setData({ jobs, companies, cv, applications })
      setError('')
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }, [user.id, user.panel, allApplications])

  useEffect(() => {
    reload()
  }, [reload])

  return { ...data, loading, error, reload }
}
