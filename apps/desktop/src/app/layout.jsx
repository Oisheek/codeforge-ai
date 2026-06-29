import './globals.css';

export const metadata = {
  title: 'CodeForge AI',
  description: 'Autonomous software engineering agent',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        {/* CSP allows inline styles (Tailwind) and localhost dev server */}
        <meta http-equiv="Content-Security-Policy" content="default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline'; img-src 'self' data: blob:; font-src 'self' data:;" />
      </head>
      <body className="bg-surface-0 text-slate-200 h-screen overflow-hidden">
        {children}
      </body>
    </html>
  );
}