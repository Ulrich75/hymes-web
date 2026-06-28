'use client';

import { Suspense, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { api } from '@/lib/api-client';

function LoginForm() {
  const router = useRouter();
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
      router.replace(next);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Échec de la connexion');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{ maxWidth: 360, margin: '80px auto', padding: '0 20px' }}>
      <h1 style={{ color: 'var(--bordeaux)' }}>Administration</h1>
      <p className="muted">Hymnes &amp; Louanges</p>
      <form onSubmit={onSubmit} className="card">
        {error && <div className="alert error">{error}</div>}
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
        <button className="btn" type="submit" disabled={loading || !password}>
          {loading ? 'Connexion…' : 'Se connecter'}
        </button>
      </form>
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
