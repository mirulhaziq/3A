import type { Metadata } from 'next';
import { Nunito } from 'next/font/google';
import { ThemeProvider } from 'next-themes';
import './globals.css';
import { XPToastProvider } from '@/components/XPToast';
import ShellWrapper from '@/components/ShellWrapper';

const nunito = Nunito({
  variable: '--font-nunito',
  subsets: ['latin'],
  weight: ['400', '600', '700', '800'],
});

export const metadata: Metadata = {
  title: 'Cari — AI Career Co-Pilot',
  description: 'AI-powered career guidance for fresh tech graduates',
  icons: {
    icon: '/favicon.svg',
    apple: '/favicon.svg',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={nunito.variable} suppressHydrationWarning>
      <body>
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          enableSystem={false}
          storageKey="launchpad-theme"
        >
          <XPToastProvider>
            <ShellWrapper>{children}</ShellWrapper>
          </XPToastProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
