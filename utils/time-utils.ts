export function convertMinutesToDecimalHours(minutes: number): string {
  if (!minutes) return ""
  const hours = Math.floor(minutes / 60)
  const mins = minutes % 60
  return `${hours}.${mins.toString().padStart(2, "0")}`
}

export function convertDecimalHoursToMinutes(timeString: string): number {
  if (!timeString) return 0
  const [hours, minutes] = timeString.split(".").map(Number)
  return (hours || 0) * 60 + (minutes || 0)
}

export function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  })
}

export function validateTimeFormat(timeString: string): boolean {
  return /^\d*\.?\d*$/.test(timeString)
}
