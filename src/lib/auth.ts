import { NextRequest } from 'next/server';

// Protection temporaire des routes /api/admin/* (Phase 1).
// Vérifie un en-tête `Authorization: Bearer <ADMIN_TOKEN>`.
// TODO Phase 3 : remplacer par une vraie auth (Supabase Auth / session).
export function isAdminRequest(req: NextRequest): boolean {
  const token = process.env.ADMIN_TOKEN;
  if (!token) return false;
  const header = req.headers.get('authorization') ?? '';
  const provided = header.replace(/^Bearer\s+/i, '').trim();
  return provided.length > 0 && provided === token;
}
