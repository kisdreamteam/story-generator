/** True when an error likely stems from connectivity rather than validation or auth. */
export function isNetworkRelatedError(error: unknown): boolean {
  if (!error) return false

  const message =
    error instanceof Error
      ? error.message
      : typeof error === 'string'
        ? error
        : ''

  return /network|offline|fetch|failed to fetch|connection|timeout|ECONNREFUSED|ERR_INTERNET_DISCONNECTED/i.test(
    message,
  )
}
