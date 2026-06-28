import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { toHymnSync } from '@/lib/serialize';
import type { SyncDelta, Hymn } from '@/types/hymn';

export const dynamic = 'force-dynamic';

// GET /api/hymns            → téléchargement complet (hors supprimés)
// GET /api/hymns?since=ISO  → delta : créés/modifiés/supprimés depuis `since`
export async function GET(req: NextRequest) {
  const sinceParam = req.nextUrl.searchParams.get('since');
  const serverTime = new Date();

  let since: Date | null = null;
  if (sinceParam) {
    const d = new Date(sinceParam);
    if (!Number.isNaN(d.getTime())) since = d;
  }

  const rows = await prisma.hymn.findMany({
    // Sur un delta on inclut les soft-deletes ; sur un full download on les exclut.
    where: since
      ? { updatedAt: { gt: since } }
      : { deletedAt: null },
    orderBy: { updatedAt: 'asc' },
  });

  const meta = await prisma.appMeta.findUnique({ where: { id: 1 } });

  const payload: SyncDelta<Hymn> = {
    since: sinceParam,
    serverTime: serverTime.toISOString(),
    dataVersion: meta?.dataVersion ?? 1,
    items: rows.map(toHymnSync),
  };

  return NextResponse.json(payload, { headers: { 'Cache-Control': 'no-store' } });
}
