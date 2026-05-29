export function formatVND(amount: number): string {
  return amount.toLocaleString('vi-VN') + 'đ'
}

/** Parse raw digits to number, e.g. "1.000.000" → 1000000 */
export function parseAmount(formatted: string): number {
  return parseInt(formatted.replace(/\./g, ''), 10) || 0
}

/** Format digits-only string with dot separators, e.g. "1000000" → "1.000.000" */
export function formatAmountInput(raw: string): string {
  const digits = raw.replace(/\D/g, '')
  if (!digits) return ''
  return parseInt(digits, 10).toLocaleString('vi-VN').replace(/,/g, '.')
}

export function formatDate(date: string | Date): string {
  const d = new Date(date)
  const day = String(d.getDate()).padStart(2, '0')
  const month = String(d.getMonth() + 1).padStart(2, '0')
  const year = d.getFullYear()
  return `${day}/${month}/${year}`
}

export function formatDateShort(date: string | Date): string {
  const d = new Date(date)
  const day = String(d.getDate()).padStart(2, '0')
  const month = String(d.getMonth() + 1).padStart(2, '0')
  return `${day}/${month}`
}
