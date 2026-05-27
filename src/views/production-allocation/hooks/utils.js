export function useRoundToSevenDecimals(number = 0) {
  const factor = 10000000
  return Math.round(number * factor) / factor
}
