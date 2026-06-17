export const formatCurrency = (value: number | string): string => {
  const numericValue = typeof value === "string" ? Number(value) : value
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(Number.isNaN(numericValue) ? 0 : numericValue)
}

export const formatDate = (value?: string | null): string => {
  if (!value) {
    return "-"
  }
  return new Intl.DateTimeFormat("id-ID", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(new Date(value))
}
