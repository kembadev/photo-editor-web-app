export async function getNetworkConnectionStatus () {
  try {
    await fetch('https://www.google.com/', { mode: 'no-cors' })
    return true
  } catch {
    return false
  }
}
