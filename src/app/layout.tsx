// src/app/layout.tsx
// Root layout — aplica tema inicial, fuentes, QueryClient y store
// ThemeScript inline evita flash of wrong theme (FOWT)

import type { Metadata } from 'next'
import '@/styles/globals.css'
import { Providers } from './providers'


export const metadata: Metadata = {
  title: 'FleetControl — Monitor de Vehículo en Tiempo Real',
  description: 'Control Room Component conectado a la API de Traccar. Monitoreo GPS en tiempo real con accesibilidad WCAG 2.1 AA.',
  robots: 'noindex', // prueba técnica — no indexar
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es" data-theme="dark" className="dark" suppressHydrationWarning>
      <head>
        {/* Script inline — previene FOWT antes de que React hidrate */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              try {
                const saved = localStorage.getItem('fleet-theme') || 'dark';
                document.documentElement.setAttribute('data-theme', saved);
                document.documentElement.classList.toggle('dark', saved === 'dark');
              } catch(e) {}
            `,
          }}
        />
      </head>
      <body className="font-sans">
        <Providers>{children}</Providers>
      </body>
    </html>
  )
}
