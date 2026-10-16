import { http, HttpResponse } from 'msw'
import { authHandlers } from './auth.handlers'
import { nftHandlers } from './nft.handlers'
import { favoritesHandlers } from './favorites.handlers'
import { cartHandlers } from './cart.handlers'
import { ordersHandlers } from './orders.handlers'
import { profileHandlers } from './profile.handlers'
import { walletsHandlers } from './wallets.handlers'
import { creatorsHandlers } from './creators.handlers'
import { learnHandlers } from './learn.handlers'
import { scenarioHandlers } from './scenarios'
import { resetDB } from '../db'

export const handlers = [
  ...authHandlers,
  ...nftHandlers,
  ...favoritesHandlers,
  ...cartHandlers,
  ...ordersHandlers,
  ...profileHandlers,
  ...walletsHandlers,
  ...creatorsHandlers,
  ...learnHandlers,
  ...scenarioHandlers,

  http.post('/api/__reset', () => {
    resetDB()
    return HttpResponse.json({ success: true })
  }),
]
