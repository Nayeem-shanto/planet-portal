import { db } from './db'
import { generateSalt, hashPassword } from '../utils/crypto'
import { ADMIN_ACCESS_CODE } from '../data/constants'

const SESSION_KEY = 'session'

/** Never let the password hash leave this service. */
const toPublicUser = ({ passwordHash, salt, ...user }) => user

const normalizeEmail = (email) => email.trim().toLowerCase()

/**
 * Create an account.
 * panel: 'general' (students and employees) or 'admin'.
 */
export async function register({ name, email, password, panel, role, department, accessCode }) {
  if (!name?.trim() || !email?.trim()) throw new Error('Name and email are required.')
  if (!password || password.length < 8) throw new Error('Password must be at least 8 characters.')

  if (panel === 'admin' && accessCode !== ADMIN_ACCESS_CODE) {
    throw new Error('The admin access code is not correct.')
  }

  const cleanEmail = normalizeEmail(email)
  const existing = await db.findOne('users', (u) => u.email === cleanEmail)
  if (existing) throw new Error('An account with this email already exists. Sign in instead.')

  const salt = generateSalt()
  const passwordHash = await hashPassword(password, salt)

  const user = await db.insert('users', {
    name: name.trim(),
    email: cleanEmail,
    panel,
    role: panel === 'admin' ? 'admin' : role,
    department: department?.trim() || '',
    salt,
    passwordHash,
  })
  return toPublicUser(user)
}

export async function login({ email, password, panel }) {
  const user = await db.findOne('users', (u) => u.email === normalizeEmail(email))

  // Same message for "no such user" and "wrong password": telling an attacker
  // which emails exist is called user enumeration, and it is a real vulnerability.
  const invalid = new Error('Email or password is incorrect.')
  if (!user) throw invalid

  const hash = await hashPassword(password, user.salt)
  if (hash !== user.passwordHash) throw invalid

  if (user.panel !== panel) {
    throw new Error(
      panel === 'admin'
        ? 'This account is not an admin account. Use the General sign-in.'
        : 'This is an admin account. Use the Admin sign-in.',
    )
  }

  db.setRaw(SESSION_KEY, JSON.stringify({ userId: user.id, at: Date.now() }))
  return toPublicUser(user)
}

export function logout() {
  db.removeRaw(SESSION_KEY)
}

export async function getCurrentUser() {
  try {
    const session = JSON.parse(db.getRaw(SESSION_KEY))
    if (!session?.userId) return null
    const user = await db.findById('users', session.userId)
    return user ? toPublicUser(user) : null
  } catch {
    return null
  }
}

export async function updateProfile(userId, changes) {
  const { name, department } = changes
  const user = await db.update('users', userId, { name, department })
  return toPublicUser(user)
}
