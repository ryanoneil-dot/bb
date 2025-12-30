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
    <main className="content">
      <div className="panel" style={{ maxWidth: 420, margin: '40px auto' }}>
        <h1 style={{ marginTop: 0 }}>Sign in</h1>
        {!sent ? (
          <form onSubmit={submit}>
            <label style={{ display: 'block', marginBottom: 8 }}>Email</label>
            <input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@company.com" />
            <button style={{ marginTop: 12 }} type="submit">Send magic link</button>
          </form>
        ) : (
          <p>Check your email for a sign-in link.</p>
        )}
      </div>
    </main>
  )
}
