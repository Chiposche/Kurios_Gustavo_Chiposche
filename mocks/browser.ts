import { setupWorker } from 'msw/browser'
import { handlers } from './handlers'
import { socketHandlers } from './socket'

// Configura o worker do MSW com os handlers de API e Socket.IO
export const worker = setupWorker(...handlers, ...socketHandlers)
