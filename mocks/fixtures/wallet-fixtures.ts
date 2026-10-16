import type { Wallet } from '../../src/api/types/wallet.types'

export const walletFixtures: Record<string, Wallet[]> = {
  'user-001': [
    {
      id: 'wallet-001',
      type: 'primary',
      displayName: 'Nova Sato',
      nickname: 'nova-wallet',
      network: 'ethereum',
      profileName: 'nova.sato',
      address: '0xA91F...E82C',
      walletType: 'MetaMask',
      email: 'contato@email.com',
      ensName: 'nova.kurio.eth',
    },
  ],
  'user-002': [
    {
      id: 'wallet-002',
      type: 'primary',
      displayName: 'Kai Tanaka',
      nickname: 'kai-wallet',
      network: 'polygon',
      profileName: 'kai.tanaka',
      address: '0xB02G...F93D',
      walletType: 'Coinbase Wallet',
      email: 'kai@email.com',
      ensName: 'kai.kurio.eth',
    },
  ],
}
