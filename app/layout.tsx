import './global.css';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Crypto Dashboard',
  description: 'TopN + Others chart with precomputed metrics',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <nav className="border-b bg-white">
          <div className="container mx-auto p-4 flex items-center justify-between">
            <span className="font-semibold">Crypto Dashboard</span>
            <span className="text-xs text-zinc-500">Next 15 • SSR • Streaming</span>
          </div>
        </nav>
        {children}
      </body>
    </html>
  );
}
