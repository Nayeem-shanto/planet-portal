/**
 * Password hashing with PBKDF2 (Web Crypto API).
 *
 * IMPORTANT LESSON: hashing in the browser does NOT make this secure. Anyone
 * can open DevTools and edit localStorage. Real authentication must happen on
 * a server. We still hash so plain-text passwords are never stored anywhere,
 * a habit that matters when you build the real backend.
 */

const ITERATIONS = 100_000

const toHex = (buffer) =>
  [...new Uint8Array(buffer)].map((b) => b.toString(16).padStart(2, '0')).join('')

export function generateSalt() {
  return toHex(crypto.getRandomValues(new Uint8Array(16)))
}

export async function hashPassword(password, salt) {
  const encoder = new TextEncoder()
  const key = await crypto.subtle.importKey('raw', encoder.encode(password), 'PBKDF2', false, [
    'deriveBits',
  ])
  const bits = await crypto.subtle.deriveBits(
    { name: 'PBKDF2', salt: encoder.encode(salt), iterations: ITERATIONS, hash: 'SHA-256' },
    key,
    256,
  )
  return toHex(bits)
}
