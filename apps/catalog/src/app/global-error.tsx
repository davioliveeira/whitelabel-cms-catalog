'use client';

/**
 * Global Error Boundary for the Catalog Application
 * This component catches errors at the root level
 */
export default function GlobalError({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh',
        fontFamily: 'system-ui, -apple-system, sans-serif',
        padding: '20px',
        textAlign: 'center',
        backgroundColor: '#fff',
      }}
    >
      <h2 style={{ marginBottom: '16px', fontSize: '24px' }}>
        Algo deu errado!
      </h2>
      <p style={{ marginBottom: '24px', color: '#666' }}>
        Ocorreu um erro inesperado. Por favor, tente novamente.
      </p>
      <button
        onClick={() => reset()}
        style={{
          padding: '12px 24px',
          backgroundColor: '#0f172a',
          color: 'white',
          border: 'none',
          borderRadius: '8px',
          cursor: 'pointer',
          fontSize: '16px',
        }}
      >
        Tentar novamente
      </button>
    </div>
  );
}
