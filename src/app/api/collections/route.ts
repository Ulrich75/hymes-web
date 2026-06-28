import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { toCollectionSync } from '@/lib/serialize';
import type { SyncDelta, Collection } from '@/types/hymn';

export const dynamic = 'force-dynamic';

// GET /api/collections            → liste complète
// GET /api/collections?since=ISO  → delta depuis `since`
export async function GET(req: NextRequest) {
  const sinceParam = req.nextUrl.searchParams.get('since');
  const serverTime = new Date();

  let since: Date | null = null;
  if (sinceParam) {
    const d = new Date(sinceParam);
    if (!Number.isNaN(d.getTime())) since = d;
  }

  const rows = await prisma.collection.findMany({
    where: since ? { updatedAt: { gt: since } } : { deletedAt: null },
    orderBy: { updatedAt: 'asc' },
  });

  const meta = await prisma.appMeta.findUnique({ where: { id: 1 } });

  const payload: SyncDelta<Collection> = {
    since: sinceParam,
    serverTime: serverTime.toISOString(),
    dataVersion: meta?.dataVersion ?? 1,
    items: rows.map(toCollectionSync),
  };

  return NextResponse.json(payload, { headers: { 'Cache-Control': 'no-store' } });
}
