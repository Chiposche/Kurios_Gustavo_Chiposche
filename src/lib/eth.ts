import Decimal from 'decimal.js-light'

Decimal.set({ precision: 20, rounding: Decimal.ROUND_HALF_UP })

export function ethAdd(a: string, b: string): string {
  return new Decimal(a).plus(new Decimal(b)).toFixed()
}

export function ethSubtract(a: string, b: string): string {
  return new Decimal(a).minus(new Decimal(b)).toFixed()
}

export function ethMultiply(value: string, quantity: number): string {
  return new Decimal(value).times(quantity).toFixed()
}

export function formatEth(value: string, decimals = 2): string {
  return new Decimal(value).toFixed(decimals)
}

export function ethCompare(a: string, b: string): number {
  return new Decimal(a).comparedTo(new Decimal(b))
}
