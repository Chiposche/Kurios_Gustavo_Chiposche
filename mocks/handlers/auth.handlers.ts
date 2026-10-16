import { http, HttpResponse, delay } from 'msw'
import { networkGate } from './network'
import { getDB, persistDB } from '../db'

function generateToken(): string {
  return `mock_token_${crypto.randomUUID()}`
}

function getUserFromToken(authHeader: string | null) {
  if (!authHeader?.startsWith('Bearer ')) return null
  const token = authHeader.slice(7)
  const db = getDB()
  const session = db.sessions.get(token)
  if (!session) return null
  if (Date.now() > session.expiresAt) {
    db.sessions.delete(token)
    persistDB()
    return null
  }
  return db.users.find((u) => u.id === session.userId) ?? null
}

export { getUserFromToken }

export const authHandlers = [
  http.post('/api/auth/login', async ({ request }) => {
    const gate = await networkGate(request)
    if (gate) return gate
    await delay(300)
    const body = (await request.json()) as { email: string; password: string }
    const db = getDB()

    const user = db.users.find((u) => u.email === body.email)
    if (!user || user.passwordHash !== `hashed_${body.password}`) {
      return HttpResponse.json(
        { message: 'E-mail ou senha inválidos', code: 'INVALID_CREDENTIALS' },
        { status: 401 },
      )
    }

    const token = generateToken()
    const expiresAt = Date.now() + 60 * 60 * 1000
    db.sessions.set(token, { userId: user.id, expiresAt })
    persistDB()

    const { passwordHash: _, ...safeUser } = user
    return HttpResponse.json({ user: safeUser, token, expiresAt })
  }),

  http.post('/api/auth/register', async ({ request }) => {
    const gate = await networkGate(request)
    if (gate) return gate
    await delay(400)
    const body = (await request.json()) as {
      username: string
      email: string
      password: string
      confirmPassword: string
    }
    const db = getDB()

    const errors: Record<string, string[]> = {}
    if (!body.username || body.username.length < 3) errors.username = ['Mínimo 3 caracteres']
    if (!body.email?.includes('@')) errors.email = ['E-mail inválido']
    if (!body.password || body.password.length < 6) errors.password = ['Mínimo 6 caracteres']
    if (body.password !== body.confirmPassword) errors.confirmPassword = ['Senhas não conferem']
    if (Object.keys(errors).length > 0) {
      return HttpResponse.json({ message: 'Erro de validação', code: 'VALIDATION_ERROR', errors }, { status: 422 })
    }

    if (db.users.some((u) => u.email === body.email)) {
      return HttpResponse.json({ message: 'E-mail já cadastrado', code: 'EMAIL_CONFLICT' }, { status: 409 })
    }
    if (db.users.some((u) => u.username === body.username)) {
      return HttpResponse.json({ message: 'Nome de usuário já em uso', code: 'USERNAME_CONFLICT' }, { status: 409 })
    }

    const newUser = {
      id: `user-${crypto.randomUUID().slice(0, 8)}`,
      username: body.username,
      email: body.email,
      displayName: body.username,
      createdAt: new Date().toISOString(),
      passwordHash: `hashed_${body.password}`,
    }
    db.users.push(newUser)

    const token = generateToken()
    const expiresAt = Date.now() + 60 * 60 * 1000
    db.sessions.set(token, { userId: newUser.id, expiresAt })

    db.profiles.set(newUser.id, {
      displayName: newUser.displayName,
      username: newUser.username,
      email: newUser.email,
    })
    persistDB()

    const { passwordHash: _, ...safeUser } = newUser
    return HttpResponse.json({ user: safeUser, token, expiresAt }, { status: 201 })
  }),

  http.get('/api/auth/session', async ({ request }) => {
    const gate = await networkGate(request)
    if (gate) return gate
    await delay(100)
    const user = getUserFromToken(request.headers.get('Authorization'))
    if (!user) {
      return HttpResponse.json({ message: 'Sessão inválida', code: 'UNAUTHORIZED' }, { status: 401 })
    }

    const token = request.headers.get('Authorization')!.slice(7)
    const session = getDB().sessions.get(token)!
    const { passwordHash: _, ...safeUser } = user
    return HttpResponse.json({ user: safeUser, expiresAt: session.expiresAt })
  }),

  http.post('/api/auth/logout', async ({ request }) => {
    const gate = await networkGate(request)
    if (gate) return gate
    await delay(100)
    const authHeader = request.headers.get('Authorization')
    if (authHeader?.startsWith('Bearer ')) {
      const token = authHeader.slice(7)
      getDB().sessions.delete(token)
      persistDB()
    }
    return HttpResponse.json({ success: true })
  }),
]
