export interface Product {
  id: string
  name: string
  emoji: string
  priceCents: number
  barcode?: string
}

export interface CartLine {
  product: Product
  quantity: number
}

export const PRODUCTS: Product[] = [
  {
    id: 'apple',
    name: 'Apple',
    emoji: '🍎',
    priceCents: 199,
    barcode: '123456789',
  },
  {
    id: 'banana',
    name: 'Banana',
    emoji: '🍌',
    priceCents: 99,
    barcode: '987654321',
  },
  {
    id: 'milk',
    name: 'Milk',
    emoji: '🥛',
    priceCents: 349,
    barcode: '456789123',
  },
  {
    id: 'bread',
    name: 'Bread',
    emoji: '🍞',
    priceCents: 299,
    barcode: '789123456',
  },
  {
    id: 'cheese',
    name: 'Cheese',
    emoji: '🧀',
    priceCents: 499,
    barcode: '321654987',
  },
  {
    id: 'eggs',
    name: 'Eggs',
    emoji: '🥚',
    priceCents: 399,
    barcode: '654987321',
  },
  {
    id: 'orange',
    name: 'Orange',
    emoji: '🍊',
    priceCents: 249,
    barcode: '147258369',
  },
  {
    id: 'carrot',
    name: 'Carrot',
    emoji: '🥕',
    priceCents: 179,
    barcode: '369258147',
  },
  {
    id: 'chicken',
    name: 'Chicken',
    emoji: '🍗',
    priceCents: 899,
    barcode: '258147369',
  },
  {
    id: 'tomato',
    name: 'Tomato',
    emoji: '🍅',
    priceCents: 299,
    barcode: '741852963',
  },
]

const productsByBarcode = new Map(
  PRODUCTS.flatMap((product) =>
    product.barcode ? [[product.barcode, product] as const] : [],
  ),
)

export function formatMoney(cents: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(cents / 100)
}

export function hashBarcodeToPriceCents(barcode: string): number {
  let tierHash = 0
  let priceHash = 0

  for (let index = 0; index < barcode.length; index += 1) {
    const character = barcode.charCodeAt(index)
    tierHash = (tierHash << 5) - tierHash + character
    priceHash = (priceHash * 31 + character) % 10_000
  }

  const tierRoll = Math.abs(tierHash) % 100
  const priceRoll = Math.abs(priceHash) % 10_000

  if (tierRoll < 70) {
    return (priceRoll % 2_000) + 1
  }

  if (tierRoll < 95) {
    return (priceRoll % 8_000) + 2_001
  }

  return (priceRoll % 90_000) + 10_001
}

export function productForBarcode(rawBarcode: string): Product {
  const barcode = rawBarcode.trim()

  if (!barcode) {
    throw new Error('A barcode is required.')
  }

  const knownProduct = productsByBarcode.get(barcode)
  if (knownProduct) {
    return knownProduct
  }

  return {
    id: `barcode-${barcode}`,
    name: 'Scanned item',
    emoji: '📦',
    priceCents: hashBarcodeToPriceCents(barcode),
    barcode,
  }
}

export function addToCart(cart: CartLine[], product: Product): CartLine[] {
  const existingLine = cart.find((line) => line.product.id === product.id)

  if (!existingLine) {
    return [...cart, { product, quantity: 1 }]
  }

  return cart.map((line) =>
    line.product.id === product.id
      ? { ...line, quantity: line.quantity + 1 }
      : line,
  )
}

export function changeCartQuantity(
  cart: CartLine[],
  productId: string,
  amount: number,
): CartLine[] {
  return cart
    .map((line) =>
      line.product.id === productId
        ? { ...line, quantity: Math.max(0, line.quantity + amount) }
        : line,
    )
    .filter((line) => line.quantity > 0)
}

export function cartItemCount(cart: CartLine[]): number {
  return cart.reduce((count, line) => count + line.quantity, 0)
}

export function cartTotalCents(cart: CartLine[]): number {
  return cart.reduce(
    (total, line) => total + line.product.priceCents * line.quantity,
    0,
  )
}
