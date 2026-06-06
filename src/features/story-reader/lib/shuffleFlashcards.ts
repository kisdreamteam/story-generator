/** Fisher–Yates shuffle returning original indices in random order. */
export function createShuffledIndices(length: number): number[] {
  const indices = Array.from({ length }, (_, index) => index)

  for (let index = indices.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(Math.random() * (index + 1))
    ;[indices[index], indices[swapIndex]] = [indices[swapIndex], indices[index]]
  }

  return indices
}

export function createSequentialIndices(length: number): number[] {
  return Array.from({ length }, (_, index) => index)
}
