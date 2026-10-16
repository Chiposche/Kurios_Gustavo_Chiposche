export interface Profile {
  displayName: string
  username: string
  email: string
  ensName?: string
  walletNickname?: string
  avatar?: string
}

export interface UpdateProfileRequest {
  displayName?: string
  username?: string
  email?: string
  ensName?: string
  walletNickname?: string
}

export interface ChangePasswordRequest {
  currentPassword: string
  newPassword: string
  confirmPassword: string
}
