'use client';

import { useEffect, useState } from 'react';
import 'intro.js/introjs.css';
import { usePathname } from 'next/navigation';

export function OnboardingProvider({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [hasSeenTour, setHasSeenTour] = useState(true); // Default to true to prevent flash

  useEffect(() => {
    // Check if user has seen the tour
    const seen = localStorage.getItem('hasSeenOnboarding');
    setHasSeenTour(!!seen);

    if (!seen && pathname === '/dashboard') {
      // Dynamically import intro.js to avoid SSR issues
      import('intro.js').then((mod) => {
        const introJs = mod.default;
        
        const intro = introJs();
        
        intro.setOptions({
          steps: [
            {
              intro: "Bem-vindo ao seu novo CMS! Vamos fazer um tour rápido?",
              title: "Boas-vindas",
            },
            {
              element: '[data-tour="sidebar"]', // Targeting the sidebar
              intro: "Aqui você navega entre Dashboard, Produtos e Configurações.",
              title: "Navegação",
            },
            {
              element: '[data-tour="date-picker"]', 
              intro: "Filtre seus dados por período aqui.",
              title: "Filtros",
            },
            {
              element: '[data-tour="metrics"]',
              intro: "Acompanhe visualizações e cliques no WhatsApp.",
              title: "Métricas",
            },
          ],
          showProgress: true,
          showBullets: false,
          exitOnOverlayClick: false,
          nextLabel: 'Próximo',
          prevLabel: 'Anterior',
          doneLabel: 'Pronto',
        });

        intro.oncomplete(() => {
          localStorage.setItem('hasSeenOnboarding', 'true');
          setHasSeenTour(true);
        });

        intro.onexit(() => {
          // Optional: decide if exit counts as completion
          localStorage.setItem('hasSeenOnboarding', 'true');
          setHasSeenTour(true);
        });

        // Simple delay to ensure elements are rendered
        setTimeout(() => {
          intro.start();
        }, 1000);
      });
    }
  }, [pathname]);

  return <>{children}</>;
}
