import Link from 'next/link';

/**
 * 404 Not Found Page for Catalog Application
 */
export default function NotFound() {
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
      }}
    >
      <h1 style={{ fontSize: '72px', margin: '0', fontWeight: 'bold' }}>404</h1>
      <h2 style={{ marginBottom: '16px', fontSize: '24px' }}>
        Página não encontrada
      </h2>
      <p style={{ marginBottom: '24px', color: '#666' }}>
        A página que você está procurando não existe.
      </p>
      <Link
        href="/"
        style={{
          padding: '12px 24px',
          backgroundColor: '#0f172a',
          color: 'white',
          textDecoration: 'none',
          borderRadius: '8px',
          fontSize: '16px',
        }}
      >
        Voltar ao início
      </Link>
    </div>
  );
}
