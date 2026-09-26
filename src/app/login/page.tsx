'use client';

import { Suspense, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { api } from '@/lib/api-client';

function LoginForm() {
  const params = useSearchParams();
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await api.post('/api/admin/login', { password });
      const next = params.get('next') || '/admin';
      // Navigation « dure » : recharge la page pour que le middleware revoie
      // le cookie fraîchement posé (évite le cache de redirection du routeur).
      window.location.assign(next);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Échec de la connexion');
      setLoading(false);
    }
  }

  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      {/* Left panel */}
      <div
        style={{
          flex: '0 0 52%',
          background: 'var(--bordeaux)',
          position: 'relative',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
          padding: '28px 40px',
          color: '#fff',
        }}
      >
        {/* Decorative circles */}
        <div style={{
          position: 'absolute', top: -80, right: -60,
          width: 280, height: 280, borderRadius: '50%',
          border: '1px solid rgba(255,255,255,0.15)',
        }} />
        <div style={{
          position: 'absolute', bottom: -100, right: -40,
          width: 340, height: 340, borderRadius: '50%',
          background: 'rgba(0,0,0,0.18)',
        }} />

        {/* Brand */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontWeight: 700, fontSize: 16, position: 'relative' }}>
          <span>♪</span>
          <span>Hymnes &amp; Louanges</span>
        </div>

        {/* Tagline */}
        <div style={{ marginTop: 'auto', marginBottom: 'auto', position: 'relative' }}>
          <p style={{ margin: '0 0 16px', fontSize: 11, fontWeight: 600, letterSpacing: '0.12em', textTransform: 'uppercase', opacity: 0.7 }}>
            Recueil de cantiques
          </p>
          <h1 style={{ margin: 0, fontSize: 52, fontWeight: 800, lineHeight: 1.1, letterSpacing: '-0.01em' }}>
            Louez<br />
            l&apos;Éternel<br />
            d&apos;un cœur<br />
            nouveau.
          </h1>
        </div>

        {/* Footer note */}
        <p style={{ margin: 0, fontSize: 12, opacity: 0.55, position: 'relative' }}>
          Espace d&apos;administration · Accès réservé
        </p>
      </div>

      {/* Right panel */}
      <div
        style={{
          flex: 1,
          background: '#f4f2f3',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '40px 32px',
        }}
      >
        <div style={{ width: '100%', maxWidth: 360 }}>
          <h2 style={{ margin: '0 0 6px', fontSize: 28, fontWeight: 700, color: 'var(--text)' }}>Connexion</h2>
          <p style={{ margin: '0 0 28px', color: 'var(--muted)', fontSize: 14 }}>
            Entrez votre mot de passe pour accéder au recueil.
          </p>

          <div
            style={{
              background: '#fff',
              borderRadius: 14,
              padding: '24px 20px',
              boxShadow: '0 1px 4px rgba(0,0,0,0.06)',
            }}
          >
            {error && <div className="alert error">{error}</div>}
            <form onSubmit={onSubmit}>
              <div className="field">
                <label htmlFor="pw">Mot de passe administrateur</label>
                <input
                  id="pw"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoFocus
                  placeholder="••••••••"
                />
              </div>
              <button
                className="btn"
                type="submit"
                disabled={loading || !password}
                style={{ width: '100%', justifyContent: 'center', marginTop: 8, padding: '13px', fontSize: 15 }}
              >
                {loading ? 'Connexion…' : 'Se connecter'}
              </button>
            </form>
          </div>

          <p style={{ textAlign: 'center', fontSize: 12, color: 'var(--muted)', marginTop: 28 }}>
            © Hymnes &amp; Louanges
          </p>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={null}>
      <LoginForm />
    </Suspense>
  );
}
