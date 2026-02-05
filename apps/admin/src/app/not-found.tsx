export default function NotFound() {
  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="text-center">
        <h1 className="text-4xl font-bold mb-4">404</h1>
        <p className="text-slate-600 mb-8">Page not found</p>
        <a
          href="/"
          className="inline-block px-6 py-3 bg-slate-900 text-white rounded-lg hover:bg-slate-800"
        >
          Go Home
        </a>
      </div>
    </div>
  );
}
