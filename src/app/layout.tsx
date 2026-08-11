import type { Metadata, Viewport } from 'next';
import { Toaster } from 'react-hot-toast';
import { Outfit } from 'next/font/google';
import { AuthProvider } from '@/lib/supabase/auth-context';
import ThemeProvider from '@/components/providers/ThemeProvider';
import PageLoader from '@/components/ui/PageLoader';
import BackToTop from '@/components/ui/BackToTop';
import '@/styles/globals.css';
import '@/styles/animations.css';

const outfit = Outfit({ subsets: ['latin'], variable: '--font-outfit', display: 'swap' });

export const metadata: Metadata = {
  title: {
    template: '%s | Amigo Moda',
    default: 'Amigo Moda — La Mode Algérienne',
  },
  description: 'Découvrez les dernières tendances de la mode chez Amigo Moda. Livraison dans les 58 wilayas d\'Algérie.',
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'Amigo Moda',
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: 'cover',
  themeColor: '#0D0D1A',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" dir="ltr" className={`scroll-smooth ${outfit.variable}`} suppressHydrationWarning>
      <head>
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="google" content="notranslate" />
      </head>
      <body>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
          <PageLoader />
        <AuthProvider>
          {children}
          <Toaster 
            position="top-center"
            toastOptions={{
              duration: 3000,
              style: {
                background: 'var(--color-bg-elevated)',
                color: 'var(--color-text-primary)',
                border: '1px solid var(--color-border)',
                borderRadius: 'var(--radius-md)',
                fontSize: 'var(--fs-sm)',
              },
              success: {
                iconTheme: {
                  primary: 'var(--color-success)',
                  secondary: 'white',
                },
              },
            }}
          />
          <BackToTop />
        </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
