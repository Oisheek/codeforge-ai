import './globals.css';

export const metadata = {
  title: 'CodeForge AI',
  description: 'Autonomous software engineering agent',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}