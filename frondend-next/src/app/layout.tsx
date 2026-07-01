import type { Metadata } from 'next';
import './globals.css';
import Navbar from '../components/Navbar/Navbar';

export const metadata: Metadata = {
  title: 'ShopNest',
  description: 'E-commerce powered by NestJS + Next.js',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <Navbar />
        {children}
      </body>
    </html>
  );
}