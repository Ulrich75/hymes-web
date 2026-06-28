import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { isAdminRequest } from '@/lib/auth';
import { bumpDataVersion } from '@/lib/meta';
import { toCollection } from '@/lib/serialize';

export const dynamic = 'force-dynamic';

const collectionSchema = z.object({
  id: z.string().min(1),
  nom: z.string().min(1),
  langue: z.string().min(1),
  couleur: z.string().min(1),
  emoji: z.string().min(1),
  description: z.string(),
});

function unauthorized() {
  return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
}

// GET /api/admin/collections — liste complète (inclut les soft-deletes)
export async function GET(req: NextRequest) {
  if (!isAdminRequest(req)) return unauthorized();
  const rows = await prisma.collection.findMany({ orderBy: { id: 'asc' } });
  return NextResponse.json(rows.map(toCollection));
}

// POST /api/admin/collections — créer
export async function POST(req: NextRequest) {
  if (!isAdminRequest(req)) return unauthorized();
  const parsed = collectionSchema.safeParse(await req.json());
  if (!parsed.success) {
    return NextResponse.json({ error: 'Données invalides', details: parsed.error.flatten() }, { status: 400 });
  }
  const created = await prisma.collection.create({ data: { ...parsed.data, deletedAt: null } });
  await bumpDataVersion();
  return NextResponse.json(toCollection(created), { status: 201 });
}

// PUT /api/admin/collections — modifier (réactive si soft-deleted)
export async function PUT(req: NextRequest) {
  if (!isAdminRequest(req)) return unauthorized();
  const parsed = collectionSchema.safeParse(await req.json());
  if (!parsed.success) {
    return NextResponse.json({ error: 'Données invalides', details: parsed.error.flatten() }, { status: 400 });
  }
  const { id, ...rest } = parsed.data;
  const updated = await prisma.collection.update({ where: { id }, data: { ...rest, deletedAt: null } });
  await bumpDataVersion();
  return NextResponse.json(toCollection(updated));
}

// DELETE /api/admin/collections?id=... — soft-delete
// Refuse si la collection contient encore des cantiques actifs.
export async function DELETE(req: NextRequest) {
  if (!isAdminRequest(req)) return unauthorized();
  const id = req.nextUrl.searchParams.get('id');
  if (!id) return NextResponse.json({ error: 'id manquant' }, { status: 400 });

  const remaining = await prisma.hymn.count({ where: { collectionId: id, deletedAt: null } });
  if (remaining > 0) {
    return NextResponse.json(
      { error: `Impossible : ${remaining} cantique(s) encore dans cette collection.` },
      { status: 409 },
    );
  }

  await prisma.collection.update({ where: { id }, data: { deletedAt: new Date() } });
  await bumpDataVersion();
  return NextResponse.json({ ok: true });
}
