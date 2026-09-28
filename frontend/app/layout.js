import './globals.css';
import { AuthProvider } from '../lib/AuthContext';
import Navbar from '../components/Navbar';

export const metadata = {
  title: 'Little Steps — Care, covered around the clock',
  description: 'Find verified daycare centres, crèches, and babysitters offering round-the-clock, transparent childcare.',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,300;9..144,500;9..144,600;9..144,700&family=Inter:wght@400;500;600;700&family=IBM+Plex+Mono:wght@400;500&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>
        <AuthProvider>
          <Navbar />
          <main className="mx-auto max-w-6xl px-6 pb-24">{children}</main>
          <footer className="mt-16 border-t border-line py-8 text-center text-xs text-ink-soft">
            Little Steps — a prototype build. Not for use with real payment or personal data.
          </footer>
        </AuthProvider>
      </body>
    </html>
  );
}
