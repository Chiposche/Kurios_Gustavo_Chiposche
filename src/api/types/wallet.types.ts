export interface Wallet {
  id: string
  type: 'primary' | 'secondary'
  displayName: string
  nickname: string
  network: string
  profileName: string
  address: string
  secondaryAddress?: string
  walletType: string
  referralCode?: string
  email: string
  ensName?: string
}

export interface CreateWalletRequest {
  type: 'primary' | 'secondary'
  displayName: string
  nickname: string
  network: string
  profileName: string
  address: string
  secondaryAddress?: string
  walletType: string
  referralCode?: string
  email: string
  ensName?: string
}

export type UpdateWalletRequest = Partial<CreateWalletRequest>
