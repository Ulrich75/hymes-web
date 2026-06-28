import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import type { SyncManifest } from '@/types/hymn';

export const dynamic = 'force-dynamic';

// GET /api/sync/manifest
// Le mobile compare `dataVersion` au sien pour décider s'il doit synchroniser,
// et `latestAppVersion` pour proposer une mise à jour de l'app.
export async function GET() {
  const [meta, hymns, collections, lastHymn] = await Promise.all([
    prisma.appMeta.findUnique({ where: { id: 1 } }),
    prisma.hymn.count({ where: { deletedAt: null } }),
    prisma.collection.count({ where: { deletedAt: null } }),
    prisma.hymn.findFirst({ orderBy: { updatedAt: 'desc' }, select: { updatedAt: true } }),
  ]);

  const manifest: SyncManifest = {
    dataVersion: meta?.dataVersion ?? 1,
    lastUpdated: (meta?.updatedAt ?? lastHymn?.updatedAt ?? new Date()).toISOString(),
    counts: { hymns, collections },
    latestAppVersion: meta?.latestAppVersion ?? null,
    minAppVersion: meta?.minAppVersion ?? null,
    updateUrl: meta?.updateUrl ?? null,
  };

  return NextResponse.json(manifest, {
    headers: { 'Cache-Control': 'no-store' },
  });
}
