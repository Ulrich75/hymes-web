import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { isAdminRequest } from '@/lib/auth';
import { toHymn } from '@/lib/serialize';

export const dynamic = 'force-dynamic';

// GET /api/admin/hymns/:id — un cantique (pour l'édition)
export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!isAdminRequest(req)) {
    return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
  }
  const { id } = await params;
  const row = await prisma.hymn.findUnique({ where: { id } });
  if (!row) return NextResponse.json({ error: 'Introuvable' }, { status: 404 });
  return NextResponse.json(toHymn(row));
}
