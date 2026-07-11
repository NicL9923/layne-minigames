import { lazy, Suspense, useRef, useState } from 'react'
import {
  ScannerLoadBoundary,
  ScannerLoadingFallback,
} from './ScannerLoadBoundary'
import {
  PRODUCTS,
  addToCart,
  cartItemCount,
  cartTotalCents,
  changeCartQuantity,
  formatMoney,
  productForBarcode,
  type CartLine,
  type Product,
} from './checkoutLogic'

const BarcodeScannerDialog = lazy(() =>
  import('./BarcodeScannerDialog').then((module) => ({
    default: module.BarcodeScannerDialog,
  })),
)

interface PurchaseSummary {
  itemCount: number
  totalCents: number
}

export function CheckoutGame() {
  const [cart, setCart] = useState<CartLine[]>([])
  const [scannerOpen, setScannerOpen] = useState(false)
  const [announcement, setAnnouncement] = useState(
    'Checkout game ready. Choose a product to begin.',
  )
  const [purchase, setPurchase] = useState<PurchaseSummary | null>(null)
  const scannerButtonRef = useRef<HTMLButtonElement>(null)

  const itemCount = cartItemCount(cart)
  const totalCents = cartTotalCents(cart)

  const addProduct = (product: Product) => {
    setCart((currentCart) => addToCart(currentCart, product))
    setPurchase(null)
    setAnnouncement(`${product.name} added to the cart.`)
  }

  const changeQuantity = (line: CartLine, amount: number) => {
    setCart((currentCart) =>
      changeCartQuantity(currentCart, line.product.id, amount),
    )
    setPurchase(null)
    setAnnouncement(
      amount > 0
        ? `Added another ${line.product.name}.`
        : `Removed one ${line.product.name}.`,
    )
  }

  const scanBarcode = (barcode: string) => {
    const product = productForBarcode(barcode)
    addProduct(product)
    closeScanner()
    setAnnouncement(
      product.id.startsWith('barcode-')
        ? `Unknown barcode found. Added a ${formatMoney(product.priceCents)} scanned item.`
        : `${product.name} scanned and added to the cart.`,
    )
  }

  const closeScanner = () => {
    setScannerOpen(false)
    window.requestAnimationFrame(() => scannerButtonRef.current?.focus())
  }

  const clearCart = () => {
    setCart([])
    setPurchase(null)
    setAnnouncement('Cart cleared.')
  }

  const completePurchase = () => {
    if (itemCount === 0) {
      return
    }

    setPurchase({ itemCount, totalCents })
    setCart([])
    setAnnouncement(
      `Purchase complete. ${itemCount} ${itemCount === 1 ? 'item' : 'items'} bought for ${formatMoney(totalCents)}.`,
    )
  }

  return (
    <section className="checkout-section" id="checkout" aria-labelledby="checkout-title">
      <div className="checkout-heading">
        <div>
          <p className="eyebrow">Now playing</p>
          <h2 id="checkout-title">Checkout</h2>
          <p>
            Tap groceries to ring them up, or use a camera to scan a real
            barcode.
          </p>
        </div>
        <button
          className="scan-button"
          type="button"
          onClick={() => setScannerOpen(true)}
          ref={scannerButtonRef}
        >
          <span aria-hidden="true">▥</span>
          Scan barcode
        </button>
      </div>

      {purchase && (
        <div className="purchase-message" role="status">
          <span aria-hidden="true">🎉</span>
          <div>
            <strong>Purchase complete!</strong>
            <p>
              You checked out {purchase.itemCount}{' '}
              {purchase.itemCount === 1 ? 'item' : 'items'} for{' '}
              {formatMoney(purchase.totalCents)}.
            </p>
          </div>
        </div>
      )}

      <p className="sr-only" aria-live="polite" aria-atomic="true">
        {announcement}
      </p>

      <div className="register">
        <div className="product-panel">
          <div className="panel-heading">
            <div>
              <span className="step-number">1</span>
              <h3>Choose groceries</h3>
            </div>
            <span>{PRODUCTS.length} items</span>
          </div>
          <div className="product-grid">
            {PRODUCTS.map((product) => (
              <button
                className="product-button"
                type="button"
                key={product.id}
                onClick={() => addProduct(product)}
                aria-label={`Add ${product.name} for ${formatMoney(product.priceCents)}`}
              >
                <span className="product-emoji" aria-hidden="true">
                  {product.emoji}
                </span>
                <span className="product-name">{product.name}</span>
                <span className="product-price">
                  {formatMoney(product.priceCents)}
                </span>
              </button>
            ))}
          </div>
        </div>

        <aside className="cart-panel" aria-labelledby="cart-title">
          <div className="panel-heading">
            <div>
              <span className="step-number">2</span>
              <h3 id="cart-title">Your cart</h3>
            </div>
            <span>
              {itemCount} {itemCount === 1 ? 'item' : 'items'}
            </span>
          </div>

          {cart.length === 0 ? (
            <div className="empty-cart">
              <span aria-hidden="true">🛒</span>
              <strong>Your cart is ready</strong>
              <p>Choose a grocery or scan a barcode to add an item.</p>
            </div>
          ) : (
            <ul className="cart-list">
              {cart.map((line) => (
                <li key={line.product.id}>
                  <span className="cart-emoji" aria-hidden="true">
                    {line.product.emoji}
                  </span>
                  <div className="cart-item-copy">
                    <strong>{line.product.name}</strong>
                    <span>{formatMoney(line.product.priceCents)} each</span>
                    <div className="quantity-controls">
                      <button
                        type="button"
                        onClick={() => changeQuantity(line, -1)}
                        aria-label={`Remove one ${line.product.name}`}
                      >
                        −
                      </button>
                      <output
                        aria-label={`${line.quantity} ${line.product.name} in cart`}
                      >
                        {line.quantity}
                      </output>
                      <button
                        type="button"
                        onClick={() => changeQuantity(line, 1)}
                        aria-label={`Add one ${line.product.name}`}
                      >
                        +
                      </button>
                    </div>
                  </div>
                  <strong className="line-total">
                    {formatMoney(line.product.priceCents * line.quantity)}
                  </strong>
                </li>
              ))}
            </ul>
          )}

          <div className="cart-summary">
            <span>Total</span>
            <output aria-label={`Cart total ${formatMoney(totalCents)}`}>
              {formatMoney(totalCents)}
            </output>
          </div>

          <div className="cart-actions">
            <button
              className="clear-button"
              type="button"
              onClick={clearCart}
              disabled={cart.length === 0}
            >
              Clear cart
            </button>
            <button
              className="purchase-button"
              type="button"
              onClick={completePurchase}
              disabled={cart.length === 0}
            >
              Purchase
              <span aria-hidden="true">→</span>
            </button>
          </div>
        </aside>
      </div>

      {scannerOpen && (
        <ScannerLoadBoundary
          onClose={closeScanner}
          onRetry={() => window.location.reload()}
        >
          <Suspense fallback={<ScannerLoadingFallback onClose={closeScanner} />}>
            <BarcodeScannerDialog onClose={closeScanner} onScan={scanBarcode} />
          </Suspense>
        </ScannerLoadBoundary>
      )}
    </section>
  )
}
