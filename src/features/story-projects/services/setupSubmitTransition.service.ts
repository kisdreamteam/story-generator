/** Brief delay before navigating to the output page — UI transition only, not generation. */
export const SETUP_SUBMIT_TRANSITION_MS = 400

export function waitForSetupSubmitTransition(): Promise<void> {
  return new Promise((resolve) => {
    window.setTimeout(resolve, SETUP_SUBMIT_TRANSITION_MS)
  })
}
