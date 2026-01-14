export function useRoundToSevenDecimals(number) {
  const factor = 10000000
  return Math.round(number * factor) / factor
}
