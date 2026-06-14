import type { Metadata, Viewport } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: "Ghost's War Room | NBA 2K26 Dynasty Builder",
  description: 'Build your perfect NBA 2K26 dynasty roster',
};

export const viewport: Viewport = {
  themeColor: '#080815',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark">
      <body className="min-h-screen bg-bg text-white antialiased">
        {children}
      </body>
    </html>
  );
}
