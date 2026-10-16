import type { User } from '../../src/api/types/auth.types'

export interface MockUser extends User {
  passwordHash: string
}

export const userFixtures: MockUser[] = [
  {
    id: 'user-001',
    username: 'nova.sato',
    email: 'contato@email.com',
    displayName: 'Nova Sato',
    avatar: '/assets/avatars/avatar-1.jpg',
    walletNickname: 'nova-wallet',
    ensName: 'nova.kurio.eth',
    createdAt: '2026-01-15T10:00:00Z',
    passwordHash: 'hashed_Senha123!',
  },
  {
    id: 'user-002',
    username: 'kai.tanaka',
    email: 'kai@email.com',
    displayName: 'Kai Tanaka',
    avatar: '/assets/avatars/avatar-2.jpg',
    walletNickname: 'kai-wallet',
    ensName: 'kai.kurio.eth',
    createdAt: '2026-02-20T14:30:00Z',
    passwordHash: 'hashed_Senha456!',
  },
]

export const defaultCredentials = [
  { email: 'contato@email.com', password: 'Senha123!' },
  { email: 'kai@email.com', password: 'Senha456!' },
]
