import { useState } from 'react'
import { signIn } from 'next-auth/react'
import { useRouter } from 'next/router'

const defaultQuestion = 'What was the name of your first pet?'

export default function SignIn() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [name, setName] = useState('')
  const [securityQuestion, setSecurityQuestion] = useState(defaultQuestion)
  const [securityAnswer, setSecurityAnswer] = useState('')
  const [mode, setMode] = useState<'signin' | 'signup' | 'reset'>('signin')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const submit = async (e: any) => {
    e.preventDefault()
    setError(null)
    setLoading(true)

    const payload: any = {
      redirect: false,
      email,
      password,
      mode,
      callbackUrl: '/',
    }

    if (mode === 'signup') {
      payload.name = name
      payload.securityQuestion = securityQuestion
      payload.securityAnswer = securityAnswer
    }

    if (mode === 'reset') {
      payload.securityAnswer = securityAnswer
    }

    const res = await signIn('credentials', payload)
    setLoading(false)

    if (!res || res.error) {
      if (mode === 'signup') setError('Unable to sign up with that email.')
      else if (mode === 'reset') setError('Invalid email or security answer.')
      else setError('Invalid email or password.')
      return
    }

    router.push(res.url || '/')
  }

  return (
    <main className="content">
      <div className="panel" style={{ maxWidth: 460, margin: '40px auto' }}>
        <h1 style={{ marginTop: 0 }}>
          {mode === 'signup' ? 'Create account' : mode === 'reset' ? 'Reset password' : 'Sign in'}
        </h1>
        <div style={{ display: 'flex', gap: 10, marginBottom: 16, flexWrap: 'wrap' }}>
          <button
            type="button"
            onClick={() => setMode('signin')}
            style={{ background: mode === 'signin' ? 'var(--brand)' : '#2a2f37' }}
          >
            Sign in
          </button>
          <button
            type="button"
            onClick={() => setMode('signup')}
            style={{ background: mode === 'signup' ? 'var(--brand)' : '#2a2f37' }}
          >
            Create account
          </button>
          <button
            type="button"
            onClick={() => setMode('reset')}
            style={{ background: mode === 'reset' ? 'var(--brand)' : '#2a2f37' }}
          >
            Reset password
          </button>
        </div>

        <form onSubmit={submit}>
          {mode === 'signup' && (
            <>
              <label style={{ display: 'block', marginBottom: 8 }}>Name</label>
              <input value={name} onChange={(e) => setName(e.target.value)} required />
            </>
          )}

          <label style={{ display: 'block', marginTop: mode === 'signup' ? 12 : 0, marginBottom: 8 }}>Email</label>
          <input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@company.com" required />

          <label style={{ display: 'block', marginTop: 12, marginBottom: 8 }}>
            {mode === 'reset' ? 'New password' : 'Password'}
          </label>
          <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />

          {mode === 'signup' && (
            <>
              <label style={{ display: 'block', marginTop: 12, marginBottom: 8 }}>Security question</label>
              <input value={securityQuestion} onChange={(e) => setSecurityQuestion(e.target.value)} required />
            </>
          )}

          {mode !== 'signin' && (
            <>
              <label style={{ display: 'block', marginTop: 12, marginBottom: 8 }}>Security answer</label>
              <input value={securityAnswer} onChange={(e) => setSecurityAnswer(e.target.value)} required />
            </>
          )}

          {error && <p style={{ color: 'red' }}>{error}</p>}

          <button style={{ marginTop: 12 }} type="submit" disabled={loading}>
            {loading
              ? 'Please wait…'
              : mode === 'signup'
              ? 'Create account'
              : mode === 'reset'
              ? 'Reset password'
              : 'Sign in'}
          </button>
        </form>
      </div>
    </main>
  )
}
