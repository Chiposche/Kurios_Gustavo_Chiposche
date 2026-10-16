import { api } from '../client'
import type { Profile, UpdateProfileRequest, ChangePasswordRequest } from '../types/profile.types'
import type { ApiResponse } from '../types/common.types'

export const profileApi = {
  get: () =>
    api.get<ApiResponse<Profile>>('/profile').then((r) => r.data),

  update: (data: UpdateProfileRequest) =>
    api.put<ApiResponse<Profile>>('/profile', data).then((r) => r.data),

  uploadAvatar: (file: File) => {
    const formData = new FormData()
    formData.append('avatar', file)
    return api.post<ApiResponse<{ url: string }>>('/profile/avatar', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }).then((r) => r.data)
  },

  removeAvatar: () =>
    api.delete('/profile/avatar').then((r) => r.data),

  changePassword: (data: ChangePasswordRequest) =>
    api.put('/profile/password', data).then((r) => r.data),
}
