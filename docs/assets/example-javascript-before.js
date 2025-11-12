// Callback-based async pattern
function fetchUserData(userId, callback) {
  fetch(`/api/users/${userId}`)
    .then(response => response.json())
    .then(data => callback(null, data))
    .catch(error => callback(error, null))
}

function processUser(userId) {
  fetchUserData(userId, (error, user) => {
    if (error) {
      console.error('Failed to fetch user:', error)
      return
    }

    console.log('User:', user.name)
    console.log('Email:', user.email)
  })
}

processUser(123)
