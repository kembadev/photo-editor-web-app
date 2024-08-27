export async function getInternetConnectionStatus () {
  try {
    await fetch('https://www.google.com/', { mode: 'no-cors' })
    return true
  } catch {
    return false
  }
}
