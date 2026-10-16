import { useEffect, useRef, useCallback } from 'react'
import { cn } from '../../utils/cn'
import { X } from 'lucide-react'

// Dialog simples no padrão shadcn/ui com focus trap
interface DialogProps {
  open: boolean
  onClose: () => void
  children: React.ReactNode
  className?: string
}

export function Dialog({ open, onClose, children, className }: DialogProps) {
  const overlayRef = useRef<HTMLDivElement>(null)
  const contentRef = useRef<HTMLDivElement>(null)
  const previousFocusRef = useRef<Element | null>(null)

  // Busca todos os elementos focáveis dentro do dialog
  const getFocusableElements = useCallback(() => {
    if (!contentRef.current) return []
    return Array.from(
      contentRef.current.querySelectorAll<HTMLElement>(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      )
    ).filter((el) => !el.hasAttribute('disabled'))
  }, [])

  // Fecha com ESC e faz o focus trap com Tab/Shift+Tab
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose()
        return
      }

      // Focus trap: Tab e Shift+Tab ciclam dentro do dialog
      if (e.key === 'Tab') {
        const focusable = getFocusableElements()
        if (focusable.length === 0) return

        const first = focusable[0]
        const last = focusable[focusable.length - 1]

        if (e.shiftKey) {
          if (document.activeElement === first) {
            e.preventDefault()
            last.focus()
          }
        } else {
          if (document.activeElement === last) {
            e.preventDefault()
            first.focus()
          }
        }
      }
    }

    if (open) {
      // Salva o elemento que tinha foco antes de abrir
      previousFocusRef.current = document.activeElement

      document.addEventListener('keydown', handleKeyDown)

      // Foca o primeiro elemento focável do dialog
      setTimeout(() => {
        const focusable = getFocusableElements()
        if (focusable.length > 0) {
          focusable[0].focus()
        }
      }, 0)
    }

    return () => {
      document.removeEventListener('keydown', handleKeyDown)
      // Restaura o foco ao fechar
      if (previousFocusRef.current instanceof HTMLElement) {
        previousFocusRef.current.focus()
      }
    }
  }, [open, onClose, getFocusableElements])

  if (!open) return null

  return (
    <div
      ref={overlayRef}
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      onClick={(e) => {
        if (e.target === overlayRef.current) onClose()
      }}
    >
      <div className="fixed inset-0 bg-black/60" />
      <div
        ref={contentRef}
        role="dialog"
        aria-modal="true"
        className={cn(
          'relative bg-[#2A1F1A] rounded-xl p-6 max-w-md w-full shadow-xl',
          className,
        )}
      >
        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-[#A78B6E] hover:text-white"
          aria-label="Fechar"
        >
          <X size={18} />
        </button>
        {children}
      </div>
    </div>
  )
}

export function DialogTitle({ children, className }: { children: React.ReactNode; className?: string }) {
  return <h2 className={cn('text-white font-bold text-lg mb-2', className)}>{children}</h2>
}

export function DialogDescription({ children, className }: { children: React.ReactNode; className?: string }) {
  return <p className={cn('text-[#A78B6E] text-sm mb-4', className)}>{children}</p>
}
