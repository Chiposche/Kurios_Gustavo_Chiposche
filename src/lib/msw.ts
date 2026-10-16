// A camada de mocks (MSW) fica ativa em desenvolvimento
// ou quando o build de produção é feito com VITE_ENABLE_MSW=true
export const mswEnabled = import.meta.env.DEV || import.meta.env.VITE_ENABLE_MSW === 'true'
