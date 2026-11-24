import type { Metadata } from 'next';
import './globals.css';
import Navbar from '@/components/layout/Navbar';
import ProjectCredits from '@/components/layout/ProjectCredits';

export const metadata: Metadata = {
  title: 'Trim & Tone | Boutique Salon Queue System',
  description: 'MSc IT Vibe Coding Lab Project - Developed by Neha Tadvi (202612123), DAU (DAIICT)',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="bg-cream text-darkText min-h-screen flex flex-col antialiased selection:bg-blush selection:text-cherry">
        <Navbar />
        <main className="flex-1 flex flex-col">
          {children}
        </main>
        <ProjectCredits />
      </body>
    </html>
  );
}
