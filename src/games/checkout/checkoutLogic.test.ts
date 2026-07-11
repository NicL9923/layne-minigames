import { describe, expect, it } from 'vitest'
import {
  PRODUCTS,
  addToCart,
  cartItemCount,
  cartTotalCents,
  changeCartQuantity,
  hashBarcodeToPriceCents,
  productForBarcode,
} from './checkoutLogic'

describe('barcode pricing', () => {
  it('returns the same pretend price for the same unknown barcode', () => {
    expect(hashBarcodeToPriceCents('987654321')).toBe(
      hashBarcodeToPriceCents('987654321'),
    )
  })

  it('keeps pretend prices in the expected tiered range', () => {
    for (const barcode of ['1', 'ABC-123', '9876543210123', '🛒']) {
      expect(hashBarcodeToPriceCents(barcode)).toBeGreaterThanOrEqual(1)
      expect(hashBarcodeToPriceCents(barcode)).toBeLessThanOrEqual(20_000)
    }
  })

  it('preserves deterministic prices across all three price tiers', () => {
    expect(hashBarcodeToPriceCents('1')).toBe(50)
    expect(hashBarcodeToPriceCents('X0')).toBe(4_777)
    expect(hashBarcodeToPriceCents('X30')).toBe(16_198)
  })

  it('returns a valid price for unusually long scanner data', () => {
    const price = hashBarcodeToPriceCents('A'.repeat(10_000))

    expect(Number.isInteger(price)).toBe(true)
    expect(price).toBeGreaterThanOrEqual(1)
    expect(price).toBeLessThanOrEqual(20_000)
  })

  it('maps known barcodes to catalog products', () => {
    const product = PRODUCTS[0]
    expect(productForBarcode(product.barcode ?? '')).toBe(product)
  })

  it('creates a stable mystery grocery for an unknown barcode', () => {
    const firstResult = productForBarcode('  NOT-IN-CATALOG  ')
    const secondResult = productForBarcode('NOT-IN-CATALOG')

    expect(firstResult).toEqual(secondResult)
    expect(firstResult.name).toBe('Scanned item')
    expect(firstResult.priceCents).toBe(
      hashBarcodeToPriceCents('NOT-IN-CATALOG'),
    )
  })

  it('rejects an empty barcode', () => {
    expect(() => productForBarcode('   ')).toThrow('A barcode is required.')
  })
})

describe('cart calculations', () => {
  it('adds products and increases the quantity of a repeated product', () => {
    const product = PRODUCTS[0]
    const once = addToCart([], product)
    const twice = addToCart(once, product)

    expect(twice).toEqual([{ product, quantity: 2 }])
    expect(cartItemCount(twice)).toBe(2)
    expect(cartTotalCents(twice)).toBe(product.priceCents * 2)
  })

  it('removes a line when its quantity reaches zero', () => {
    const product = PRODUCTS[1]
    const cart = addToCart([], product)

    expect(changeCartQuantity(cart, product.id, -1)).toEqual([])
  })

  it('totals several cart lines in integer cents', () => {
    const cart = [
      { product: PRODUCTS[0], quantity: 2 },
      { product: PRODUCTS[2], quantity: 3 },
    ]

    expect(cartTotalCents(cart)).toBe(
      PRODUCTS[0].priceCents * 2 + PRODUCTS[2].priceCents * 3,
    )
    expect(cartItemCount(cart)).toBe(5)
  })
})
