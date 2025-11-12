// Modern async/await pattern
async function fetchUserData(userId) {
  const response = await fetch(`/api/users/${userId}`)
  return await response.json()
}

async function processUser(userId) {
  try {
    const user = await fetchUserData(userId)
    console.log('User:', user.name)
    console.log('Email:', user.email)
  } catch (error) {
    console.error('Failed to fetch user:', error)
  }
}

processUser(123)
