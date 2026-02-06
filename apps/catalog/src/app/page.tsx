// =============================================================================
// Landing Page
// =============================================================================
// Root page for the catalog app - no tenant data exposed.
// =============================================================================

import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function LandingPage() {
  return (
    <main className="min-h-screen bg-background text-foreground flex flex-col">
      {/* Header */}
      <header className="border-b border-border bg-card/50 backdrop-blur supports-[backdrop-filter]:bg-card/50">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          <div className="flex items-center gap-2">
            <span className="text-orange-500 text-xl">✦</span>
            <h1 className="text-xl font-bold tracking-tight">
              Catálogo White Label
            </h1>
          </div>
          <Button asChild variant="ghost" className="rounded-none border-2 border-transparent hover:border-black dark:hover:border-white">
            <Link href={`${process.env.NEXT_PUBLIC_ADMIN_URL || 'http://localhost:3001'}/login`} className="flex items-center gap-2 font-bold">
               <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-log-in"><path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"/><polyline points="10 17 15 12 10 7"/><line x1="15" x2="3" y1="12" y2="12"/></svg>
               Login
            </Link>
          </Button>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-24 px-4 relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-orange-400/20 via-background to-background" />
        <div className="container mx-auto max-w-4xl text-center relative z-10">
          <div className="inline-flex items-center rounded-none border-2 border-orange-500 bg-orange-500/10 px-3 py-1 text-sm text-orange-600 font-bold mb-6">
            <span className="flex h-2 w-2 rounded-full bg-orange-500 mr-2 animate-pulse"></span>
            Plataforma de Catálogos Digitais
          </div>
          <h2 className="text-5xl md:text-7xl font-bold tracking-tight mb-8 text-foreground">
            Seu catálogo digital <br/>
            <span className="text-primary">premium e personalizado</span>
          </h2>
          <p className="text-xl text-muted-foreground mb-10 max-w-2xl mx-auto leading-relaxed">
            Crie uma experiência de compra incrível para seus clientes. 
            Acesse sua loja favorita diretamente pela URL.
          </p>

          {/* Demo Actions */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/properar"
              className="inline-flex items-center gap-2 px-8 py-4 bg-orange-500 text-white font-bold rounded-none border-2 border-orange-600 hover:bg-orange-600 transition-all shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] hover:shadow-none hover:translate-x-[2px] hover:translate-y-[2px]"
            >
              Ver demonstração
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
              </svg>
            </Link>
            <div className="px-6 py-4 bg-card/50 border border-border rounded-full backdrop-blur">
              <code className="text-sm font-mono text-muted-foreground">
                seusite.com/<span className="text-orange-400">nome-da-loja</span>
              </code>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-24 px-4 bg-card border-y border-border">
        <div className="container mx-auto max-w-5xl">
          <div className="text-center mb-16">
            <h3 className="text-3xl font-bold tracking-tight mb-4">
              Recursos Poderosos
            </h3>
            <p className="text-muted-foreground">Tudo que você precisa para vender online</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <div className="p-8 rounded-none bg-background border-2 border-border hover:border-black dark:hover:border-white transition-all group shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] hover:shadow-none hover:translate-x-[4px] hover:translate-y-[4px]">
              <div className="w-12 h-12 bg-orange-500/10 rounded-none border-2 border-orange-500 flex items-center justify-center mb-6 group-hover:bg-orange-500/20 transition-colors">
                <svg className="w-6 h-6 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" />
                </svg>
              </div>
              <h4 className="text-xl font-bold mb-3">Identidade Visual</h4>
              <p className="text-muted-foreground leading-relaxed">
                Personalize cores, logo e layout para combinar perfeitamente com sua marca.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="p-8 rounded-none bg-background border-2 border-border hover:border-black dark:hover:border-white transition-all group shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] hover:shadow-none hover:translate-x-[4px] hover:translate-y-[4px]">
              <div className="w-12 h-12 bg-orange-500/10 rounded-none border-2 border-orange-500 flex items-center justify-center mb-6 group-hover:bg-orange-500/20 transition-colors">
                <svg className="w-6 h-6 text-orange-500" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                </svg>
              </div>
              <h4 className="text-xl font-bold mb-3">WhatsApp Order</h4>
              <p className="text-muted-foreground leading-relaxed">
                Integração direta com WhatsApp para fechar vendas mais rápido.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="p-8 rounded-none bg-background border-2 border-border hover:border-black dark:hover:border-white transition-all group shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] hover:shadow-none hover:translate-x-[4px] hover:translate-y-[4px]">
              <div className="w-12 h-12 bg-orange-500/10 rounded-none border-2 border-orange-500 flex items-center justify-center mb-6 group-hover:bg-orange-500/20 transition-colors">
                <svg className="w-6 h-6 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
                </svg>
              </div>
              <h4 className="text-xl font-bold mb-3">Mobile First</h4>
              <p className="text-muted-foreground leading-relaxed">
                Experiência de app nativo, ultra-rápido e otimizado para celular.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 bg-background border-t border-border mt-auto">
        <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
          <p>&copy; {new Date().getFullYear()} Catálogo White Label. Todos os direitos reservados.</p>
        </div>
      </footer>
    </main>
  );
}
