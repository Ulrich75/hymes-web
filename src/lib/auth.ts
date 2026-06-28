import { NextRequest } from 'next/server';

export const ADMIN_COOKIE = 'admin_session';

// Protection des routes /api/admin/*.
// Accepte soit un en-tête `Authorization: Bearer <ADMIN_TOKEN>` (mobile/scripts),
// soit le cookie de session posé par /api/admin/login (UI web).
// TODO (futur) : migrer vers Supabase Auth (sessions utilisateurs).
export function isAdminRequest(req: NextRequest): boolean {
  const token = process.env.ADMIN_TOKEN;
  if (!token) return false;

  const header = req.headers.get('authorization') ?? '';
  const bearer = header.replace(/^Bearer\s+/i, '').trim();
  if (bearer && bearer === token) return true;

  const cookie = req.cookies.get(ADMIN_COOKIE)?.value;
  return !!cookie && cookie === token;
}
