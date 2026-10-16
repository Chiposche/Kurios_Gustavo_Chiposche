export interface Creator {
  id: string
  name: string
  avatar: string
  bio: string
  totalSales: number
  totalNfts: number
  followers: number
  verified: boolean
  joinedAt: string
  socialLinks: {
    twitter?: string
    instagram?: string
    website?: string
  }
}
