import Brand from '../../components/ui/Brand'

/**
 * The one bold moment of the design: topographic contour lines drawing
 * themselves in, like a survey map of the ground the group works on.
 */
function ContourArt() {
  const rings = Array.from({ length: 9 }, (_, i) => i)
  return (
    <svg viewBox="0 0 600 700" className="contour absolute inset-0 h-full w-full" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
      {rings.map((i) => (
        <path
          key={`a${i}`}
          d={`M ${80 - i * 18} ${330} C ${100 - i * 10} ${170 - i * 22}, ${380 + i * 12} ${120 - i * 26}, ${470 + i * 16} ${270} S ${360 + i * 10} ${560 + i * 22}, ${190 - i * 8} ${500 + i * 18} S ${60 - i * 18} ${420}, ${80 - i * 18} ${330} Z`}
          fill="none"
          stroke={i % 3 === 0 ? '#9bc53d' : '#5f9a6b'}
          strokeWidth={i % 3 === 0 ? 1.6 : 1}
          style={{ animationDelay: `${i * 0.12}s` }}
        />
      ))}
      {rings.slice(0, 5).map((i) => (
        <path
          key={`b${i}`}
          d={`M ${430 - i * 10} ${600} C ${470} ${560 - i * 16}, ${590 + i * 8} ${580 - i * 14}, ${600 + i * 12} ${640} S ${520} ${720 + i * 10}, ${430 - i * 10} ${600} Z`}
          fill="none"
          stroke="#5f9a6b"
          strokeWidth="1"
          style={{ animationDelay: `${0.6 + i * 0.12}s` }}
        />
      ))}
    </svg>
  )
}

export default function AuthLayout({ children }) {
  return (
    <div className="grid min-h-screen lg:grid-cols-[1.05fr_1fr]">
      <section className="relative hidden overflow-hidden bg-primary p-12 text-primary-content lg:flex lg:flex-col">
        <ContourArt />
        {/* Darken the lower half so the headline stays readable over the lines */}
        <div className="absolute inset-x-0 bottom-0 h-2/3 bg-gradient-to-t from-primary via-primary/85 to-transparent" />
        <div className="relative"><Brand light /></div>
        <div className="relative mt-auto max-w-md">
          <h1 className="font-display text-5xl font-extrabold leading-[1.05]">
            One portal for every job in the Planet group.
          </h1>
          <p className="mt-5 text-lg text-primary-content/75">
            Agriculture, energy, logistics and software. Build your CV once, then apply to any Planet company in a few clicks.
          </p>
          <dl className="mt-10 grid grid-cols-3 gap-6 border-t border-white/15 pt-6">
            {[['4', 'Companies'], ['2,700+', 'People'], ['1 CV', 'For every job']].map(([value, label]) => (
              <div key={label}>
                <dt className="text-sm text-primary-content/60">{label}</dt>
                <dd className="font-display text-2xl font-bold">{value}</dd>
              </div>
            ))}
          </dl>
        </div>
      </section>

      <section className="flex flex-col px-6 py-10 sm:px-12">
        <div className="lg:hidden"><Brand /></div>
        <div className="mx-auto my-auto w-full max-w-md py-10">{children}</div>
      </section>
    </div>
  )
}
