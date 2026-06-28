'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';

export default function AdminHeader() {
  const pathname = usePathname();
  const router = useRouter();

  // Pas d'en-tête sur la page de connexion.
  if (pathname === '/admin/login') return null;

  async function logout() {
    await fetch('/api/admin/logout', { method: 'POST' });
    router.replace('/admin/login');
  }

  return (
    <header className="admin-header">
      <span className="brand">🎵 Hymnes &amp; Louanges</span>
      <Link href="/admin">Tableau de bord</Link>
      <Link href="/admin/hymns">Cantiques</Link>
      <Link href="/admin/collections">Collections</Link>
      <a href="/api/admin/export">Backup</a>
      <button className="btn secondary sm" onClick={logout}>
        Déconnexion
      </button>
    </header>
  );
}
