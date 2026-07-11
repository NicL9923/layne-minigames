import { useCallback, useEffect, useRef, useState } from 'react'
import BarcodeScanner, {
  BarcodeStringFormat,
} from 'react-qr-barcode-scanner'

type CameraStatus =
  | 'idle'
  | 'starting'
  | 'active'
  | 'denied'
  | 'unavailable'
  | 'error'
  | 'stopping'

interface BarcodeScannerDialogProps {
  onClose: () => void
  onScan: (barcode: string) => void
}

const supportedFormats = [
  BarcodeStringFormat.UPC_A,
  BarcodeStringFormat.UPC_E,
  BarcodeStringFormat.EAN_8,
  BarcodeStringFormat.EAN_13,
  BarcodeStringFormat.CODE_39,
  BarcodeStringFormat.CODE_128,
  BarcodeStringFormat.QR_CODE,
]

function cameraErrorStatus(error: string | DOMException): CameraStatus {
  const name = typeof error === 'string' ? error : error.name

  if (name === 'NotAllowedError' || name === 'SecurityError') {
    return 'denied'
  }

  if (
    name === 'NotFoundError' ||
    name === 'DevicesNotFoundError' ||
    name === 'OverconstrainedError' ||
    name === 'NotReadableError' ||
    name === 'TrackStartError'
  ) {
    return 'unavailable'
  }

  return 'error'
}

export function BarcodeScannerDialog({
  onClose,
  onScan,
}: BarcodeScannerDialogProps) {
  const [cameraStatus, setCameraStatus] = useState<CameraStatus>('idle')
  const [stopStream, setStopStream] = useState(false)
  const [manualBarcode, setManualBarcode] = useState('')
  const dialogRef = useRef<HTMLElement>(null)
  const closeButtonRef = useRef<HTMLButtonElement>(null)
  const finishTimerRef = useRef<number | undefined>(undefined)
  const cameraTimerRef = useRef<number | undefined>(undefined)
  const scannedRef = useRef(false)

  const stopAndFinish = useCallback(
    (finish: () => void) => {
      setStopStream(true)
      setCameraStatus('stopping')
      window.clearTimeout(finishTimerRef.current)
      window.clearTimeout(cameraTimerRef.current)
      finishTimerRef.current = window.setTimeout(finish, 50)
    },
    [],
  )

  const requestClose = useCallback(() => {
    stopAndFinish(onClose)
  }, [onClose, stopAndFinish])

  useEffect(() => {
    closeButtonRef.current?.focus()

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        requestClose()
        return
      }

      if (event.key === 'Tab') {
        const focusableElements = dialogRef.current?.querySelectorAll<HTMLElement>(
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
    return () => {
      window.removeEventListener('keydown', handleKeyDown)
      window.clearTimeout(finishTimerRef.current)
      window.clearTimeout(cameraTimerRef.current)
    }
  }, [requestClose])

  const startCamera = () => {
    if (!window.isSecureContext || !navigator.mediaDevices?.getUserMedia) {
      setCameraStatus('unavailable')
      return
    }

    setStopStream(false)
    setCameraStatus('starting')
    window.clearTimeout(cameraTimerRef.current)
    cameraTimerRef.current = window.setTimeout(() => {
      setStopStream(true)
      setCameraStatus('unavailable')
    }, 10_000)
  }

  const handleCameraError = (error: string | DOMException) => {
    window.clearTimeout(cameraTimerRef.current)
    setStopStream(true)
    setCameraStatus(cameraErrorStatus(error))
  }

  const handleUpdate = (
    _error: unknown,
    result?: { getText: () => string },
  ) => {
    if (cameraStatus === 'starting') {
      window.clearTimeout(cameraTimerRef.current)
      setCameraStatus('active')
    }

    const barcode = result?.getText().trim()
    if (!barcode || scannedRef.current) {
      return
    }

    scannedRef.current = true
    stopAndFinish(() => onScan(barcode))
  }

  const submitManualBarcode = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const barcode = manualBarcode.trim()

    if (!barcode) {
      return
    }

    stopAndFinish(() => onScan(barcode))
  }

  const resetCamera = () => {
    setStopStream(false)
    setCameraStatus('idle')
    window.clearTimeout(cameraTimerRef.current)
  }

  const scannerVisible =
    cameraStatus === 'starting' ||
    cameraStatus === 'active' ||
    cameraStatus === 'stopping'

  return (
    <div className="dialog-backdrop" role="presentation">
      <section
        className="scanner-dialog"
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="scanner-title"
        aria-describedby="scanner-description"
      >
        <div className="dialog-heading">
          <div>
            <p className="eyebrow">Checkout helper</p>
            <h3 id="scanner-title">Scan a barcode</h3>
          </div>
          <button
            className="icon-button"
            type="button"
            onClick={requestClose}
            ref={closeButtonRef}
            aria-label="Close barcode scanner"
          >
            ×
          </button>
        </div>

        <p id="scanner-description" className="dialog-description">
          Point the camera at a grocery barcode. Camera images stay on this
          device.
        </p>

        {cameraStatus === 'idle' && (
          <div className="camera-message">
            <span aria-hidden="true">📷</span>
            <strong>Camera is off</strong>
            <p>Choose start when you are ready to allow camera access.</p>
            <button className="primary-button" type="button" onClick={startCamera}>
              Start camera
            </button>
          </div>
        )}

        {scannerVisible && (
          <div
            className="scanner-viewport"
            aria-busy={cameraStatus === 'starting'}
          >
            <BarcodeScanner
              width="100%"
              height="100%"
              facingMode="environment"
              formats={supportedFormats}
              delay={250}
              stopStream={stopStream}
              onError={handleCameraError}
              onUpdate={handleUpdate}
              videoConstraints={{
                facingMode: { ideal: 'environment' },
              }}
            />
            <div className="scanner-guide" aria-hidden="true" />
            {cameraStatus === 'starting' && (
              <p className="scanner-status">Starting camera…</p>
            )}
            {cameraStatus === 'active' && (
              <p className="scanner-status">Camera ready — hold barcode steady</p>
            )}
          </div>
        )}

        {cameraStatus === 'denied' && (
          <div className="camera-message camera-message-warning" role="alert">
            <span aria-hidden="true">🔒</span>
            <strong>Camera permission was denied</strong>
            <p>
              Allow camera access in your browser settings, then try again.
            </p>
            <button className="secondary-button" type="button" onClick={resetCamera}>
              Try again
            </button>
          </div>
        )}

        {cameraStatus === 'unavailable' && (
          <div className="camera-message camera-message-warning" role="alert">
            <span aria-hidden="true">🚫</span>
            <strong>Camera is unavailable</strong>
            <p>
              Use a device with a camera over HTTPS or localhost, or enter the
              barcode below.
            </p>
            <button className="secondary-button" type="button" onClick={resetCamera}>
              Check again
            </button>
          </div>
        )}

        {cameraStatus === 'error' && (
          <div className="camera-message camera-message-warning" role="alert">
            <span aria-hidden="true">⚠️</span>
            <strong>The camera could not start</strong>
            <p>Close other camera apps and try again, or enter the barcode.</p>
            <button className="secondary-button" type="button" onClick={resetCamera}>
              Try again
            </button>
          </div>
        )}

        <form className="manual-barcode" onSubmit={submitManualBarcode}>
          <label htmlFor="manual-barcode">No camera? Enter a barcode</label>
          <div>
            <input
              id="manual-barcode"
              type="text"
              value={manualBarcode}
              onChange={(event) => setManualBarcode(event.target.value)}
              autoComplete="off"
              inputMode="numeric"
              maxLength={128}
              placeholder="Example: 123456789"
            />
            <button
              className="secondary-button"
              type="submit"
              disabled={!manualBarcode.trim()}
            >
              Add item
            </button>
          </div>
        </form>
      </section>
    </div>
  )
}
