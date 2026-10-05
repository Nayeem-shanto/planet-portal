/**
 * The CV in a standard, ATS-friendly reverse-chronological format:
 * single column, clear headings, no tables or images. Applicant tracking
 * systems used by employers read this layout most reliably.
 */
function Heading({ children }) {
  return <h3 className="mb-2 mt-5 border-b border-neutral-300 pb-1 text-[13px] font-bold tracking-wide text-[#1e3a2b]">{children}</h3>
}

const period = (start, end, current) => [start, current ? 'Present' : end].filter(Boolean).join(' – ')

export default function CVPreview({ cv, id }) {
  const { personal, experience, education, skills, languages, certifications } = cv
  const contact = [personal.email, personal.phone, personal.address, personal.linkedin, personal.website].filter(Boolean)
  const isEmpty = !personal.fullName && !experience.length && !education.length

  return (
    <div id={id} className="mx-auto min-h-[640px] w-full max-w-[794px] rounded-sm bg-white p-[7%] font-sans text-[12px] leading-relaxed text-neutral-800 shadow-xl ring-1 ring-black/5">
      {isEmpty ? (
        <div className="grid min-h-[520px] place-items-center text-center text-neutral-400">
          <p>Your CV preview appears here as you fill in the form.</p>
        </div>
      ) : (
        <>
          <header className="border-b-2 border-[#1e3a2b] pb-3">
            <h2 className="font-display text-[26px] font-bold leading-tight text-[#1e3a2b]">{personal.fullName || 'Your name'}</h2>
            {personal.title && <p className="text-[14px] font-medium text-neutral-600">{personal.title}</p>}
            {contact.length > 0 && (
              <p className="mt-1.5 flex flex-wrap gap-x-3 gap-y-0.5 text-[11px] text-neutral-600">
                {contact.map((c) => <span key={c}>{c}</span>)}
              </p>
            )}
          </header>

          {personal.summary && (<><Heading>Professional summary</Heading><p>{personal.summary}</p></>)}

          {experience.length > 0 && (
            <>
              <Heading>Work experience</Heading>
              <div className="space-y-3">
                {experience.map((item) => (
                  <div key={item.id}>
                    <div className="flex justify-between gap-4">
                      <p className="font-semibold">{item.role}{item.company && <span className="font-normal">, {item.company}</span>}</p>
                      <p className="shrink-0 text-neutral-500">{period(item.start, item.end, item.current)}</p>
                    </div>
                    {item.location && <p className="text-neutral-500">{item.location}</p>}
                    {item.details && (
                      <ul className="mt-1 list-disc space-y-0.5 pl-4">
                        {item.details.split('\n').filter(Boolean).map((line, i) => <li key={i}>{line}</li>)}
                      </ul>
                    )}
                  </div>
                ))}
              </div>
            </>
          )}

          {education.length > 0 && (
            <>
              <Heading>Education</Heading>
              <div className="space-y-2">
                {education.map((item) => (
                  <div key={item.id} className="flex justify-between gap-4">
                    <div>
                      <p className="font-semibold">{item.degree}</p>
                      <p>{item.institution}{item.result && <span className="text-neutral-500">, {item.result}</span>}</p>
                    </div>
                    <p className="shrink-0 text-neutral-500">{period(item.start, item.end)}</p>
                  </div>
                ))}
              </div>
            </>
          )}

          {skills.length > 0 && (<><Heading>Skills</Heading><p>{skills.join(', ')}</p></>)}

          {certifications.length > 0 && (
            <>
              <Heading>Certifications</Heading>
              <ul className="space-y-0.5">
                {certifications.map((c) => (
                  <li key={c.id}><span className="font-semibold">{c.name}</span>{c.issuer && `, ${c.issuer}`}{c.year && <span className="text-neutral-500"> ({c.year})</span>}</li>
                ))}
              </ul>
            </>
          )}

          {languages.length > 0 && (<><Heading>Languages</Heading><p>{languages.join(', ')}</p></>)}
        </>
      )}
    </div>
  )
}
