/**
 * How well does a candidate's CV fit a job?
 * A simple, explainable score: skill overlap (70%) + experience fit (30%).
 * Real job platforms use many more signals, but when users need to trust a
 * number, "explainable" beats "clever".
 */

const normalize = (s) => s.toLowerCase().trim()

export function yearsOfExperience(cv) {
  if (!cv?.experience?.length) return 0
  return cv.experience.reduce((total, item) => {
    const start = parseInt(item.start, 10)
    const end = item.current ? new Date().getFullYear() : parseInt(item.end, 10)
    if (Number.isNaN(start) || Number.isNaN(end) || end < start) return total
    return total + (end - start)
  }, 0)
}

export function matchScore(job, cv) {
  if (!cv || !cv.skills?.length) return null
  const cvSkills = new Set(cv.skills.map(normalize))
  const jobSkills = job.skills ?? []

  const matchedSkills = jobSkills.filter((s) => cvSkills.has(normalize(s)))
  const missingSkills = jobSkills.filter((s) => !cvSkills.has(normalize(s)))
  const skillPart = jobSkills.length ? matchedSkills.length / jobSkills.length : 0.5

  const required = Number(job.experienceMin) || 0
  const expPart = required === 0 ? 1 : Math.min(yearsOfExperience(cv) / required, 1)

  return { score: Math.round((skillPart * 0.7 + expPart * 0.3) * 100), matchedSkills, missingSkills }
}
