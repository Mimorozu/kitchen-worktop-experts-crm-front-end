import { createUser } from './auth.js'

// Creates a CRM user. The password is read from stdin so it stays out of the command line and shell history.
// Usage: "your-password" | node server/create-user.js you@example.com
const email = process.argv[2]
if (!email) {
  console.error('Usage: <password> | node server/create-user.js <email>')
  process.exit(1)
}
if (process.stdin.isTTY) {
  console.error('Pipe the password in, e.g. "your-password" | node server/create-user.js <email>')
  process.exit(1)
}

let input = ''
process.stdin.setEncoding('utf8')
process.stdin.on('data', (chunk) => { input += chunk })
process.stdin.on('end', async () => {
  const password = input.replace(/\r?\n$/, '')
  try {
    await createUser(email, password)
    console.log('User created. Check the console above for the verification link.')
  } catch (err) {
    console.error(err.message)
    process.exit(1)
  }
})
