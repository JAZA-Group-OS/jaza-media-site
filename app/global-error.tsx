'use client'; // Replaces the root layout when it crashes, so it owns <html>/<body>

// Root-layout failures render without globals.css or the font pipeline, so
// everything here is inline-styled and system-font on purpose.
export default function GlobalError({
  error,
  unstable_retry,
}: {
  error: Error & { digest?: string };
  unstable_retry: () => void;
}) {
  return (
    <html lang="en">
      <body
        style={{
          margin: 0,
          fontFamily:
            "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
          background: '#ffffff',
          color: '#181818',
        }}
      >
        <main
          style={{
            minHeight: '100vh',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            textAlign: 'center',
            padding: '24px',
          }}
        >
          <div style={{ letterSpacing: '0.15em', fontSize: 32 }}>JAZA</div>
          <div
            style={{
              letterSpacing: '0.4em',
              fontSize: 11,
              color: '#FFC400',
              marginTop: 4,
            }}
          >
            MEDIA
          </div>
          <h1 style={{ fontSize: 28, fontWeight: 900, marginTop: 32 }}>
            Something went wrong.
          </h1>
          <p style={{ maxWidth: 420, lineHeight: 1.6, color: '#333333' }}>
            An unexpected error kept this page from loading. Please try again.
            {error.digest ? (
              <span
                style={{
                  display: 'block',
                  marginTop: 8,
                  fontSize: 12,
                  color: '#999999',
                }}
              >
                Reference: {error.digest}
              </span>
            ) : null}
          </p>
          <button
            type="button"
            onClick={() => unstable_retry()}
            style={{
              marginTop: 24,
              background: '#FFC400',
              color: '#181818',
              fontWeight: 700,
              border: 'none',
              borderRadius: 999,
              padding: '14px 32px',
              fontSize: 16,
              cursor: 'pointer',
            }}
          >
            Try Again
          </button>
        </main>
      </body>
    </html>
  );
}
