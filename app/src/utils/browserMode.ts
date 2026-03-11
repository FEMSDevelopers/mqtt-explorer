/**
 * Utility to detect if the application is running in browser mode
 * Browser mode is when the app runs in a web browser (not Electron desktop app)
 *
 * Even when built with the browser webpack config (which sets BROWSER_MODE=true),
 * we should detect Electron and treat it as desktop mode.
 */
const isElectron =
  typeof navigator !== 'undefined' && navigator.userAgent.includes('Electron')

export const isBrowserMode =
  typeof window !== 'undefined' &&
  !isElectron &&
  (typeof process === 'undefined' || process.env?.BROWSER_MODE === 'true')
