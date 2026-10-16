import { Component, type ReactNode } from 'react'

interface Props {
  children: ReactNode
}

interface State {
  hasError: boolean
}

// Error boundary pra capturar erros de render
export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError(): State {
    return { hasError: true }
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-[60vh] flex flex-col items-center justify-center px-4 text-center">
          <div className="w-16 h-16 rounded-full border-2 border-[#D4944C] flex items-center justify-center mb-6">
            <span className="text-[#D4944C] text-2xl font-mono">!</span>
          </div>
          <h2 className="text-white text-xl font-bold mb-2">Algo deu errado</h2>
          <p className="text-[#A78B6E] text-sm mb-6 max-w-md">
            Ocorreu um erro inesperado. Tente recarregar a página.
          </p>
          <button
            onClick={() => {
              this.setState({ hasError: false })
              window.location.reload()
            }}
            className="bg-[#D4944C] text-black px-6 py-3 rounded font-bold hover:bg-[#E0A55D] transition-colors"
          >
            Tentar novamente
          </button>
        </div>
      )
    }

    return this.props.children
  }
}
