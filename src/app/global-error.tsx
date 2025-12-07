'use client'

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <html>
      <body>
        <div style={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '1rem',
          fontFamily: 'system-ui, sans-serif',
          backgroundColor: '#fff'
        }}>
          <div style={{ textAlign: 'center', maxWidth: '400px' }}>
            <div style={{
              width: '80px',
              height: '80px',
              backgroundColor: '#fef2f2',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 1.5rem'
            }}>
              <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>

            <h1 style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '0.5rem' }}>
              เกิดข้อผิดพลาด
            </h1>
            <p style={{ color: '#6b7280', marginBottom: '1.5rem' }}>
              กรุณาลองใหม่อีกครั้ง หากปัญหายังคงอยู่ กรุณาติดต่อเรา
            </p>

            <button
              onClick={reset}
              style={{
                width: '100%',
                padding: '0.75rem',
                backgroundColor: '#000',
                color: '#fff',
                fontWeight: '600',
                borderRadius: '0.5rem',
                border: 'none',
                cursor: 'pointer',
                marginBottom: '0.75rem'
              }}
            >
              ลองใหม่
            </button>

            <a
              href="/"
              style={{
                display: 'block',
                width: '100%',
                padding: '0.75rem',
                border: '1px solid #d1d5db',
                fontWeight: '600',
                borderRadius: '0.5rem',
                textDecoration: 'none',
                color: '#000',
                boxSizing: 'border-box'
              }}
            >
              กลับหน้าแรก
            </a>

            <p style={{ marginTop: '2rem', fontSize: '0.875rem', color: '#9ca3af' }}>
              ติดต่อเรา: LINE @tapshop หรือ support@tapshop.me
            </p>
          </div>
        </div>
      </body>
    </html>
  )
}
