
// "Planet Green Energy" -> "GE", "Planet Logistics" -> "LO"
function logoLetters(name = '?') {
  const words = name.replace(/^Planet\s+/i, '').split(/\s+/).filter(Boolean)
  const letters = words.length > 1 ? words[0][0] + words[1][0] : (words[0] ?? '?').slice(0, 2)
  return letters.toUpperCase()
}

export default function CompanyLogo({ company, size = 'size-11' }) {
  return (
    <div
      className={`${size} grid shrink-0 place-items-center rounded-xl font-display text-sm font-bold text-white`}
      style={{ backgroundColor: company?.color ?? '#24332a' }}
      aria-hidden="true"
    >
      {logoLetters(company?.name)}
    </div>
  )
}
