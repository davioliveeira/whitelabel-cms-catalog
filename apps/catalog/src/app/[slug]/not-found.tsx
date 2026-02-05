// =============================================================================
// 404 Not Found Page
// =============================================================================
// Displayed when a tenant slug does not exist.
// Brand-neutral design to avoid showing any tenant data.
// =============================================================================

import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center px-4">
      <div className="text-center max-w-md">
        {/* Error Icon */}
        <div className="mb-6">
          <svg
            className="w-24 h-24 mx-auto text-gray-300"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
        </div>

        {/* Error Message */}
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Loja não encontrada
        </h1>
        <p className="text-gray-600 mb-8">
          A loja que você está procurando não existe ou pode ter sido removida.
        </p>

        {/* Back Button */}
        <Link
          href="/"
          className="inline-flex items-center gap-2 px-6 py-3 bg-gray-900 text-white font-medium rounded-lg hover:bg-gray-800 transition-colors"
        >
          <svg
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M10 19l-7-7m0 0l7-7m-7 7h18"
            />
          </svg>
          Voltar para início
        </Link>
      </div>

      {/* Footer */}
      <div className="absolute bottom-8 text-center text-sm text-gray-400">
        <p>Erro 404 - Página não encontrada</p>
      </div>
    </div>
  );
}
