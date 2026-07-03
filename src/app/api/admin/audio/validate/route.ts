import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { isAdminRequest } from '@/lib/auth';
import { checkAudioUrl } from '@/lib/audio-url';

export const dynamic = 'force-dynamic';

const bodySchema = z.object({ url: z.string().min(1) });

// POST /api/admin/audio/validate — teste qu'une URL audio est joignable.
// Le test se fait côté serveur pour éviter les blocages CORS des hébergeurs.
export async function POST(req: NextRequest) {
  if (!isAdminRequest(req)) {
    return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
  }
  const parsed = bodySchema.safeParse(await req.json());
  if (!parsed.success) {
    return NextResponse.json({ error: 'URL manquante' }, { status: 400 });
  }
  const result = await checkAudioUrl(parsed.data.url.trim());
  return NextResponse.json(result);
}
