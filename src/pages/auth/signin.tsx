import { useState } from 'react'
import { signIn } from 'next-auth/react'

export default function SignIn() {
  const [email, setEmail] = useState('')
  const [sent, setSent] = useState(false)

  const submit = async (e: any) => {
    e.preventDefault()
    await signIn('email', { email, callbackUrl: '/account' })
    setSent(true)
  }

  return (
    <main style={{ padding: 20, fontFamily: 'sans-serif' }}>
      <h1>Sign in — Builders Bargains</h1>
      {!sent ? (
        <form onSubmit={submit} style={{ maxWidth: 400 }}>
          <label style={{ display: 'block', marginBottom: 8 }}>Email</label>
          <input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@company.com" style={{ width: '100%', padding: 8 }} />
          <button style={{ marginTop: 12, padding: '8px 12px' }} type="submit">Send magic link</button>
        </form>
      ) : (
        <p>Check your email for a sign-in link.</p>
      )}
    </main>
  )
}
