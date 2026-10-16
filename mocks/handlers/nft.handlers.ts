import { http, HttpResponse, delay } from 'msw'
import { networkGate } from './network'
import { getDB } from '../db'
import type { NFTFilters } from '../../src/api/types/nft.types'

export const nftHandlers = [
  http.get('/api/nfts', async ({ request }) => {
    const gate = await networkGate(request)
    if (gate) return gate
    await delay(200)
    const url = new URL(request.url)
    const db = getDB()

    const filters: NFTFilters = {
      search: url.searchParams.get('search') || undefined,
      category: url.searchParams.get('category') || undefined,
      network: url.searchParams.get('network') || undefined,
      minPrice: url.searchParams.get('minPrice') || undefined,
      maxPrice: url.searchParams.get('maxPrice') || undefined,
      tab: (url.searchParams.get('tab') as NFTFilters['tab']) || 'all',
      sort: (url.searchParams.get('sort') as NFTFilters['sort']) || 'recent',
      page: parseInt(url.searchParams.get('page') || '1', 10),
      perPage: parseInt(url.searchParams.get('perPage') || '9', 10),
    }

    let results = [...db.nfts]

    if (filters.search) {
      const q = filters.search.toLowerCase()
      results = results.filter(
        (n) =>
          n.name.toLowerCase().includes(q) ||
          n.collection.toLowerCase().includes(q) ||
          n.attributes.some((a) => a.toLowerCase().includes(q)),
      )
    }

    if (filters.category) {
      results = results.filter((n) => n.category === filters.category)
    }

    if (filters.network) {
      results = results.filter((n) => n.network === filters.network)
    }

    if (filters.minPrice) {
      const min = parseFloat(filters.minPrice)
      results = results.filter((n) => parseFloat(n.price) >= min)
    }

    if (filters.maxPrice) {
      const max = parseFloat(filters.maxPrice)
      results = results.filter((n) => parseFloat(n.price) <= max)
    }

    switch (filters.sort) {
      case 'price_asc':
        results.sort((a, b) => parseFloat(a.price) - parseFloat(b.price))
        break
      case 'price_desc':
        results.sort((a, b) => parseFloat(b.price) - parseFloat(a.price))
        break
      case 'name':
        results.sort((a, b) => a.name.localeCompare(b.name))
        break
      default:
        break
    }

    const page = filters.page || 1
    const perPage = filters.perPage || 9
    const total = results.length
    const totalPages = Math.ceil(total / perPage)
    const start = (page - 1) * perPage
    const data = results.slice(start, start + perPage)

    return HttpResponse.json({
      data,
      meta: { page, perPage, total, totalPages },
    })
  }),

  http.get('/api/nfts/:id', async ({ request, params }) => {
    const gate = await networkGate(request)
    if (gate) return gate
    await delay(150)
    const db = getDB()
    const nft = db.nfts.find((n) => n.id === params.id)
    if (!nft) {
      return HttpResponse.json({ message: 'NFT não encontrado', code: 'NOT_FOUND' }, { status: 404 })
    }
    return HttpResponse.json({ data: nft })
  }),
]
