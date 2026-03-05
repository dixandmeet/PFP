export function deepClone<T>(obj: T): T {
  return JSON.parse(JSON.stringify(obj))
}

export function getChangedFields<T extends Record<string, any>>(
  initial: T,
  current: T
): Partial<T> {
  const changes: Partial<T> = {}

  for (const key of Object.keys(current) as (keyof T)[]) {
    const initialVal = initial[key]
    const currentVal = current[key]

    if (initialVal === currentVal) continue

    if (
      typeof initialVal === "object" &&
      initialVal !== null &&
      typeof currentVal === "object" &&
      currentVal !== null
    ) {
      if (JSON.stringify(initialVal) !== JSON.stringify(currentVal)) {
        changes[key] = currentVal
      }
    } else {
      changes[key] = currentVal
    }
  }

  return changes
}

export function isDeepEqual(a: any, b: any): boolean {
  if (a === b) return true
  if (a === null || b === null) return false
  if (typeof a !== typeof b) return false
  if (typeof a !== "object") return false
  return JSON.stringify(a) === JSON.stringify(b)
}

export function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
}

export function isValidDate(dateStr: string): boolean {
  if (!dateStr) return true
  const date = new Date(dateStr)
  return !isNaN(date.getTime()) && date < new Date()
}
