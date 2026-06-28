'use client';

import Link from 'next/link';

export default function AdminHeader() {
  async function logout() {
    await fetch('/api/admin/logout', { method: 'POST' });
    // Navigation « dure » pour repartir d'un état propre (cookie supprimé).
    window.location.assign('/login');
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
