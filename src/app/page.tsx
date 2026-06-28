export default function Home() {
  return (
    <main
      style={{
        maxWidth: 720,
        margin: '0 auto',
        padding: '64px 24px',
      }}
    >
      <h1 style={{ color: 'var(--bordeaux)', marginBottom: 8 }}>Hymnes &amp; Louanges</h1>
      <p style={{ color: 'var(--muted)', marginTop: 0 }}>
        Console d&apos;administration &amp; API de synchronisation des cantiques.
      </p>

      <a
        href="/admin"
        style={{
          display: 'inline-block',
          background: 'var(--bordeaux)',
          color: '#fff',
          textDecoration: 'none',
          fontWeight: 600,
          padding: '10px 18px',
          borderRadius: 8,
          marginTop: 16,
        }}
      >
        Accéder à l&apos;administration →
      </a>

      <section
        style={{
          background: 'var(--card)',
          border: '1px solid var(--border)',
          borderRadius: 12,
          padding: 24,
          marginTop: 24,
        }}
      >
        <h2 style={{ marginTop: 0, fontSize: 18 }}>État</h2>
        <ul style={{ color: 'var(--muted)' }}>
          <li>Structure Next.js + TypeScript ✅</li>
          <li>Schéma Prisma (Supabase / PostgreSQL) ✅</li>
          <li>Routes API de synchro &amp; admin ✅</li>
          <li>UI admin (login, CRUD cantiques &amp; collections, backup) ✅</li>
          <li>Connexion Supabase &amp; seed des données → à venir (mot de passe DB requis)</li>
        </ul>
      </section>

      <section style={{ marginTop: 24 }}>
        <h2 style={{ fontSize: 18 }}>Endpoints API</h2>
        <ul style={{ color: 'var(--muted)', fontFamily: 'monospace', fontSize: 14 }}>
          <li>GET /api/health</li>
          <li>GET /api/sync/manifest</li>
          <li>GET /api/hymns?since=ISO</li>
          <li>GET /api/collections?since=ISO</li>
          <li>GET/POST/PUT/DELETE /api/admin/hymns (auth)</li>
          <li>GET /api/admin/export (auth)</li>
        </ul>
      </section>
    </main>
  );
}
