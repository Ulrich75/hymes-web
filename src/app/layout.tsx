import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Hymnes & Louanges — Admin',
  description: "Console d'administration et API de synchronisation des cantiques",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr">
      <body>{children}</body>
    </html>
  );
}
