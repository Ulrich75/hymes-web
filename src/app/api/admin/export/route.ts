import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { isAdminRequest } from '@/lib/auth';
import { toHymn, toCollection } from '@/lib/serialize';

export const dynamic = 'force-dynamic';

// GET /api/admin/export — dump JSON complet pour les backups.
// Inclut tout (y compris soft-deletes) afin d'avoir une sauvegarde fidèle.
export async function GET(req: NextRequest) {
  if (!isAdminRequest(req)) {
    return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
  }

  const [hymns, collections, meta] = await Promise.all([
    prisma.hymn.findMany({ orderBy: [{ collectionId: 'asc' }, { numero: 'asc' }] }),
    prisma.collection.findMany({ orderBy: { id: 'asc' } }),
    prisma.appMeta.findUnique({ where: { id: 1 } }),
  ]);

  const backup = {
    exportedAt: new Date().toISOString(),
    dataVersion: meta?.dataVersion ?? 1,
    collections: collections.map((c) => ({
      ...toCollection(c),
      _deleted: c.deletedAt?.toISOString() ?? null,
    })),
    hymns: hymns.map((h) => ({
      ...toHymn(h),
      _deleted: h.deletedAt?.toISOString() ?? null,
    })),
  };

  const filename = `hymes-backup-${new Date().toISOString().slice(0, 10)}.json`;
  return new NextResponse(JSON.stringify(backup, null, 2), {
    headers: {
      'Content-Type': 'application/json',
      'Content-Disposition': `attachment; filename="${filename}"`,
      'Cache-Control': 'no-store',
    },
  });
}
