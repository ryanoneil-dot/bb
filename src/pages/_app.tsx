import type { AppProps } from 'next/app'
import { SessionProvider } from 'next-auth/react'
import Head from 'next/head'
import Layout from '../components/Layout'

export default function App({ Component, pageProps: { session, ...pageProps } }: AppProps) {
  return (
    <SessionProvider session={session}>
      <Head>
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#ff7a1a" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link
          href="https://fonts.googleapis.com/css2?family=Oswald:wght@400;600;700&family=Source+Sans+3:wght@400;600&display=swap"
          rel="stylesheet"
        />
      </Head>
      <Layout>
        <Component {...pageProps} />
      </Layout>
      <style jsx global>{`
        :root {
          --brand: #ff7a1a;
          --dark: #2a2f37;
          --light: #f5f5f5;
          --card: #ffffff;
          --muted: #6b7380;
          --border: #e4e7ec;
        }

        * {
          box-sizing: border-box;
        }

        body {
          margin: 0;
          font-family: 'Source Sans 3', sans-serif;
          background: var(--light);
          color: #1f1f1f;
        }

        a {
          color: inherit;
        }

        .page {
          min-height: 100vh;
          background: var(--light);
        }

        .topbar {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 18px 28px;
          background: #ffffff;
          border-bottom: 1px solid var(--border);
          position: sticky;
          top: 0;
          z-index: 10;
        }

        .brand {
          display: flex;
          align-items: center;
          gap: 12px;
          text-decoration: none;
        }

        .brand-icon {
          width: 44px;
          height: 44px;
          border-radius: 12px;
          background: var(--brand);
          color: #fff;
          font-weight: 700;
          display: flex;
          align-items: center;
          justify-content: center;
          font-family: 'Oswald', sans-serif;
          letter-spacing: 0.5px;
        }

        .brand-text {
          line-height: 1;
        }

        .brand-title {
          font-size: 18px;
          font-weight: 700;
        }

        .brand-sub {
          font-size: 18px;
          font-weight: 700;
          color: var(--brand);
        }

        .btn-outline {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          border: 2px solid var(--dark);
          padding: 8px 16px;
          border-radius: 10px;
          color: var(--dark);
          text-decoration: none;
          font-weight: 600;
          background: #fff;
        }

        .content {
          max-width: 1100px;
          margin: 0 auto;
          padding: 24px 20px 60px;
        }

        .panel {
          background: var(--card);
          border: 1px solid var(--border);
          border-radius: 14px;
          padding: 20px;
          box-shadow: 0 8px 20px rgba(24, 32, 42, 0.08);
        }

        input,
        textarea,
        select {
          width: 100%;
          padding: 10px 12px;
          border-radius: 10px;
          border: 1px solid var(--border);
          font-family: inherit;
          font-size: 15px;
        }

        button {
          font-family: inherit;
          font-weight: 600;
          border-radius: 10px;
          border: none;
          padding: 10px 14px;
          background: var(--brand);
          color: #fff;
          cursor: pointer;
        }

        button:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        @media (max-width: 600px) {
          .topbar {
            padding: 16px;
          }
        }
      `}</style>
    </SessionProvider>
  )
}
