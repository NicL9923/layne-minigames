import {
  Component,
  useEffect,
  useRef,
  type ErrorInfo,
  type RefObject,
  type ReactNode,
} from 'react'

interface ScannerLoadBoundaryProps {
  children: ReactNode
  onClose: () => void
  onRetry: () => void
}

interface ScannerLoadBoundaryState {
  hasError: boolean
}

export class ScannerLoadBoundary extends Component<
  ScannerLoadBoundaryProps,
  ScannerLoadBoundaryState
> {
  state: ScannerLoadBoundaryState = { hasError: false }

  static getDerivedStateFromError(): ScannerLoadBoundaryState {
    return { hasError: true }
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('Barcode scanner failed to load.', error, info)
  }

  render() {
    if (this.state.hasError) {
      return (
        <ScannerLoadError
          onClose={this.props.onClose}
          onRetry={this.props.onRetry}
        />
      )
    }

    return this.props.children
  }
}

interface ScannerOverlayMessageProps {
  onClose: () => void
}

function useDismissibleOverlay(
  onClose: () => void,
  containerRef: RefObject<HTMLElement | null>,
  buttonRef: RefObject<HTMLButtonElement | null>,
) {
  useEffect(() => {
    buttonRef.current?.focus()

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose()
        return
      }

      if (event.key === 'Tab') {
        const focusableElements =
          containerRef.current?.querySelectorAll<HTMLElement>(
            'button:not(:disabled), input:not(:disabled), [href]',
          )

        if (!focusableElements?.length) {
          return
        }

        const firstElement = focusableElements[0]
        const lastElement = focusableElements[focusableElements.length - 1]

        if (event.shiftKey && document.activeElement === firstElement) {
          event.preventDefault()
          lastElement.focus()
        } else if (!event.shiftKey && document.activeElement === lastElement) {
          event.preventDefault()
          firstElement.focus()
        }
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [buttonRef, containerRef, onClose])
}

export function ScannerLoadingFallback({
  onClose,
}: ScannerOverlayMessageProps) {
  const cardRef = useRef<HTMLElement>(null)
  const closeButtonRef = useRef<HTMLButtonElement>(null)
  useDismissibleOverlay(onClose, cardRef, closeButtonRef)

  return (
    <div className="dialog-backdrop" role="presentation">
      <section
        className="scanner-load-card"
        ref={cardRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="scanner-loading-title"
      >
        <p id="scanner-loading-title">Loading scanner…</p>
        <button
          className="secondary-button"
          type="button"
          onClick={onClose}
          ref={closeButtonRef}
        >
          Cancel
        </button>
      </section>
    </div>
  )
}

function ScannerLoadError({
  onClose,
  onRetry,
}: ScannerOverlayMessageProps & { onRetry: () => void }) {
  const cardRef = useRef<HTMLElement>(null)
  const closeButtonRef = useRef<HTMLButtonElement>(null)
  useDismissibleOverlay(onClose, cardRef, closeButtonRef)

  return (
    <div className="dialog-backdrop" role="presentation">
      <section
        className="scanner-load-card"
        ref={cardRef}
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="scanner-load-error-title"
        aria-describedby="scanner-load-error-description"
      >
        <span aria-hidden="true">⚠️</span>
        <h3 id="scanner-load-error-title">Scanner could not load</h3>
        <p id="scanner-load-error-description">
          Check the connection and try again. The rest of the game is still
          ready to play.
        </p>
        <div>
          <button
            className="secondary-button"
            type="button"
            onClick={onClose}
            ref={closeButtonRef}
          >
            Back to checkout
          </button>
          <button className="primary-button" type="button" onClick={onRetry}>
            Try again
          </button>
        </div>
      </section>
    </div>
  )
}
