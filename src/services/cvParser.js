/**
 * Turn an uploaded CV (PDF, DOCX or image) into our structured CV format.
 *
 * Two separate steps, on purpose:
 *   1. extractText(file)  -> plain text   (depends on the file type)
 *   2. parseCVText(text)  -> structured CV (same for every file type)
 *
 * Keeping them separate means each step can be tested and improved alone.
 *
 * The libraries are loaded with dynamic import() only when a file is uploaded,
 * so people who never import a CV don't download several megabytes of code.
 *
 * HONEST LIMITATION: CVs have no standard layout, so parsing is heuristic.
 * The result is a pre-filled draft the candidate must review, not a final CV.
 */
import { emptyCV, newEducation, newExperience } from './cvService'

/* ---------------- Step 1: text extraction ---------------- */

async function extractFromPdf(file) {
  const pdfjs = await import('pdfjs-dist')
  const workerUrl = (await import('pdfjs-dist/build/pdf.worker.min.mjs?url')).default
  pdfjs.GlobalWorkerOptions.workerSrc = workerUrl

  const pdf = await pdfjs.getDocument({ data: await file.arrayBuffer() }).promise
  let text = ''
  for (let pageNumber = 1; pageNumber <= pdf.numPages; pageNumber++) {
    const page = await pdf.getPage(pageNumber)
    const content = await page.getTextContent()
    for (const item of content.items) {
      text += item.str + (item.hasEOL ? '\n' : ' ')
    }
    text += '\n'
  }
  return text
}

async function extractFromDocx(file) {
  const mammoth = await import('mammoth')
  const result = await mammoth.extractRawText({ arrayBuffer: await file.arrayBuffer() })
  return result.value
}

async function extractFromImage(file, onProgress) {
  const { createWorker } = await import('tesseract.js')
  const worker = await createWorker('eng', 1, {
    logger: (m) => m.status === 'recognizing text' && onProgress?.(Math.round(m.progress * 100)),
  })
  try {
    const { data } = await worker.recognize(file)
    return data.text
  } finally {
    await worker.terminate() // always free the worker, even if recognition fails
  }
}

export const SUPPORTED_CV_TYPES = '.pdf,.docx,image/png,image/jpeg,image/webp'

export async function extractText(file, onProgress) {
  const name = file.name.toLowerCase()
  if (file.type === 'application/pdf' || name.endsWith('.pdf')) return extractFromPdf(file)
  if (name.endsWith('.docx')) return extractFromDocx(file)
  if (name.endsWith('.doc')) {
    throw new Error('Old .doc files cannot be read in the browser. Save it as .docx or PDF and upload again.')
  }
  if (file.type.startsWith('image/')) return extractFromImage(file, onProgress)
  throw new Error('Unsupported file. Upload a PDF, DOCX, PNG or JPG.')
}

/* ---------------- Step 2: text -> structured CV ---------------- */

const SECTION_PATTERNS = {
  summary: /^(summary|profile|professional summary|career objective|objective|about me)\b/i,
  experience: /^(experience|work experience|employment( history)?|professional experience|work history)\b/i,
  education: /^(education|academic( background| qualifications?)?|qualifications?)\b/i,
  skills: /^(skills|technical skills|key skills|core competencies|competencies)\b/i,
  languages: /^(languages?)\b/i,
  certifications: /^(certifications?|certificates?|training|courses)\b/i,
}

const EMAIL = /[\w.+-]+@[\w-]+\.[\w.-]+/
const PHONE = /(\+?\d[\d\s-]{8,}\d)/
const LINKEDIN = /(https?:\/\/)?(www\.)?linkedin\.com\/[^\s,]+/i
const URL = /https?:\/\/[^\s,]+/i
const YEAR_RANGE = /((?:19|20)\d{2})\s*(?:-|–|—|to)\s*((?:19|20)\d{2}|present|current|now)/i

function detectSection(line) {
  // Headings are short; "Skills: React, Node" also counts.
  const candidate = line.replace(/[:|]+$/, '').trim()
  if (candidate.length > 40) return null
  return Object.keys(SECTION_PATTERNS).find((key) => SECTION_PATTERNS[key].test(candidate)) ?? null
}

/** Split lines into entries, starting a new entry at each line with a year range. */
function chunkByDates(lines) {
  const entries = []
  let current = null
  lines.forEach((line, index) => {
    const range = line.match(YEAR_RANGE)
    if (range) {
      // The heading is usually this line, or the line just before it.
      const withoutDates = line.replace(YEAR_RANGE, '').replace(/[|,()–-]+\s*$/, '').trim()
      const heading = withoutDates || lines[index - 1] || ''
      if (!withoutDates && current?.details.at(-1) === heading) current.details.pop()
      current = { heading, start: range[1], end: range[2], details: [] }
      entries.push(current)
    } else if (current) {
      current.details.push(line)
    } else {
      entries.push((current = { heading: line, start: '', end: '', details: [] }))
    }
  })
  return entries
}

const splitHeading = (heading) => {
  const [first, ...rest] = heading.split(/\s+(?:at|@|\||–|-)\s+|,\s+/)
  return [first?.trim() ?? '', rest.join(', ').trim()]
}

export function parseCVText(rawText) {
  const cv = emptyCV()
  const lines = rawText
    .split(/\r?\n/)
    .map((l) => l.replace(/\s+/g, ' ').trim())
    .filter(Boolean)

  const fullText = lines.join('\n')
  cv.personal.email = fullText.match(EMAIL)?.[0] ?? ''
  cv.personal.phone = fullText.match(PHONE)?.[0]?.trim() ?? ''
  cv.personal.linkedin = fullText.match(LINKEDIN)?.[0] ?? ''
  const otherUrl = fullText.match(URL)?.[0]
  if (otherUrl && !otherUrl.includes('linkedin')) cv.personal.website = otherUrl

  // Group lines under the section heading they belong to.
  const sections = { header: [] }
  let currentSection = 'header'
  for (const line of lines) {
    const section = detectSection(line)
    if (section) {
      currentSection = section
      sections[section] ??= []
      const inline = line.split(':').slice(1).join(':').trim() // "Skills: React, Node"
      if (inline) sections[section].push(inline)
    } else {
      sections[currentSection].push(line)
    }
  }

  // Name: first header line that looks like a name (2–4 words, no digits or @).
  const isNameLike = (l) => /^[A-Za-z.'\s-]+$/.test(l) && l.split(' ').length >= 2 && l.split(' ').length <= 4
  cv.personal.fullName = sections.header.find(isNameLike) ?? ''
  const nameIndex = sections.header.indexOf(cv.personal.fullName)
  const titleLine = sections.header[nameIndex + 1]
  if (titleLine && !EMAIL.test(titleLine) && !PHONE.test(titleLine) && titleLine.length < 60) {
    cv.personal.title = titleLine
  }

  cv.personal.summary = (sections.summary ?? []).join(' ')

  cv.skills = [...new Set((sections.skills ?? []).flatMap((l) => l.split(/[,•|;]+/)).map((s) => s.replace(/^[-*]\s*/, '').trim()).filter((s) => s && s.length < 40))]
  cv.languages = (sections.languages ?? []).flatMap((l) => l.split(/[,•|;]+/)).map((s) => s.trim()).filter(Boolean)

  cv.experience = chunkByDates(sections.experience ?? []).map((entry) => {
    const [role, company] = splitHeading(entry.heading)
    const isCurrent = /present|current|now/i.test(entry.end)
    return { ...newExperience(), role, company, start: entry.start, end: isCurrent ? '' : entry.end, current: isCurrent, details: entry.details.map((d) => d.replace(/^[-•*]\s*/, '')).join('\n') }
  })

  cv.education = chunkByDates(sections.education ?? []).map((entry) => {
    const [degree, institution] = splitHeading(entry.heading)
    return { ...newEducation(), degree, institution: institution || entry.details.find((d) => !/cgpa|gpa|grade|result|%/i.test(d)) || '', start: entry.start, end: entry.end, result: entry.details.find((d) => /cgpa|gpa|grade|result|%/i.test(d)) ?? '' }
  })

  cv.certifications = (sections.certifications ?? []).map((line) => ({ id: crypto.randomUUID(), name: line.replace(/^[-•*]\s*/, ''), issuer: '', year: line.match(/(19|20)\d{2}/)?.[0] ?? '' }))

  return cv
}
