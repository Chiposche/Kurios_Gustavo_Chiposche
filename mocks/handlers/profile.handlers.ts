import { http, HttpResponse, delay } from 'msw'
import { networkGate } from './network'
import { getDB, persistDB } from '../db'
import { getUserFromToken } from './auth.handlers'

export const profileHandlers = [
  http.get('/api/profile', async ({ request }) => {
    const gate = await networkGate(request)
    if (gate) return gate
    await delay(150)
    const user = getUserFromToken(request.headers.get('Authorization'))
    if (!user) return HttpResponse.json({ message: 'Não autorizado', code: 'UNAUTHORIZED' }, { status: 401 })

    const db = getDB()
    const profile = db.profiles.get(user.id)
    if (!profile) return HttpResponse.json({ message: 'Perfil não encontrado', code: 'NOT_FOUND' }, { status: 404 })

    return HttpResponse.json({ data: profile })
  }),

  http.put('/api/profile', async ({ request }) => {
    const gate = await networkGate(request)
    if (gate) return gate
    await delay(300)
    const user = getUserFromToken(request.headers.get('Authorization'))
    if (!user) return HttpResponse.json({ message: 'Não autorizado', code: 'UNAUTHORIZED' }, { status: 401 })

    const body = (await request.json()) as Record<string, string>
    const db = getDB()
    const profile = db.profiles.get(user.id)
    if (!profile) return HttpResponse.json({ message: 'Perfil não encontrado', code: 'NOT_FOUND' }, { status: 404 })

    Object.assign(profile, body)
    persistDB()
    return HttpResponse.json({ data: profile })
  }),

  http.post('/api/profile/avatar', async ({ request }) => {
    const gate = await networkGate(request)
    if (gate) return gate
    await delay(400)
    const user = getUserFromToken(request.headers.get('Authorization'))
    if (!user) return HttpResponse.json({ message: 'Não autorizado', code: 'UNAUTHORIZED' }, { status: 401 })

    const db = getDB()
    const profile = db.profiles.get(user.id)
    if (!profile) return HttpResponse.json({ message: 'Perfil não encontrado', code: 'NOT_FOUND' }, { status: 404 })

    const url = `/assets/avatars/avatar-${Date.now()}.jpg`
    profile.avatar = url
    persistDB()
    return HttpResponse.json({ data: { url } })
  }),

  http.delete('/api/profile/avatar', async ({ request }) => {
    const gate = await networkGate(request)
    if (gate) return gate
    await delay(200)
    const user = getUserFromToken(request.headers.get('Authorization'))
    if (!user) return HttpResponse.json({ message: 'Não autorizado', code: 'UNAUTHORIZED' }, { status: 401 })

    const db = getDB()
    const profile = db.profiles.get(user.id)
    if (profile) {
      profile.avatar = undefined
      persistDB()
    }
    return HttpResponse.json({ success: true })
  }),

  http.put('/api/profile/password', async ({ request }) => {
    const gate = await networkGate(request)
    if (gate) return gate
    await delay(300)
    const user = getUserFromToken(request.headers.get('Authorization'))
    if (!user) return HttpResponse.json({ message: 'Não autorizado', code: 'UNAUTHORIZED' }, { status: 401 })

    const body = (await request.json()) as { currentPassword: string; newPassword: string; confirmPassword: string }
    const db = getDB()
    const dbUser = db.users.find((u) => u.id === user.id)
    if (!dbUser) return HttpResponse.json({ message: 'Usuário não encontrado', code: 'NOT_FOUND' }, { status: 404 })

    if (dbUser.passwordHash !== `hashed_${body.currentPassword}`) {
      return HttpResponse.json({ message: 'Senha atual incorreta', code: 'INVALID_PASSWORD', errors: { currentPassword: ['Senha atual incorreta'] } }, { status: 422 })
    }

    if (body.newPassword.length < 6) {
      return HttpResponse.json({ message: 'Erro de validação', code: 'VALIDATION_ERROR', errors: { newPassword: ['Mínimo 6 caracteres'] } }, { status: 422 })
    }

    if (body.newPassword !== body.confirmPassword) {
      return HttpResponse.json({ message: 'Erro de validação', code: 'VALIDATION_ERROR', errors: { confirmPassword: ['Senhas não conferem'] } }, { status: 422 })
    }

    dbUser.passwordHash = `hashed_${body.newPassword}`
    persistDB()
    return HttpResponse.json({ success: true })
  }),
]
