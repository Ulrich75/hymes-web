import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { isAdminRequest } from '@/lib/auth';
import { bumpDataVersion } from '@/lib/meta';
import { toHymn } from '@/lib/serialize';

export const dynamic = 'force-dynamic';

const versetSchema = z.object({
  id: z.string(),
  numero: z.number(),
  type: z.enum(['couplet', 'refrain', 'pont']),
  contenu: z.string(),
});

const audioSchema = z
  .object({
    soprano: z.string().optional(),
    alto: z.string().optional(),
    tenor: z.string().optional(),
    bass: z.string().optional(),
    full: z.string().optional(),
    tempo: z.number().optional(),
    key: z.string().optional(),
    duration: z.number().optional(),
  })
  .optional();

const hymnSchema = z.object({
  id: z.string().min(1),
  numero: z.number(),
  titre: z.string().min(1),
  collection_id: z.string().min(1),
  auteur: z.string().optional(),
  versets: z.array(versetSchema),
  audio: audioSchema,
});

function unauthorized() {
  return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
}

// GET /api/admin/hymns — liste complète (admin, inclut les soft-deletes)
export async function GET(req: NextRequest) {
  if (!isAdminRequest(req)) return unauthorized();
  const rows = await prisma.hymn.findMany({ orderBy: [{ collectionId: 'asc' }, { numero: 'asc' }] });
  return NextResponse.json(rows.map(toHymn));
}

// POST /api/admin/hymns — créer
export async function POST(req: NextRequest) {
  if (!isAdminRequest(req)) return unauthorized();
  const parsed = hymnSchema.safeParse(await req.json());
  if (!parsed.success) {
    return NextResponse.json({ error: 'Données invalides', details: parsed.error.flatten() }, { status: 400 });
  }
  const h = parsed.data;
  let created;
  try {
    created = await prisma.hymn.create({
      data: {
        id: h.id,
        numero: h.numero,
        titre: h.titre,
        collectionId: h.collection_id,
        auteur: h.auteur ?? null,
        versets: h.versets,
        audio: h.audio ?? undefined,
      },
    });
  } catch (e: unknown) {
    if ((e as { code?: string }).code === 'P2002') {
      return NextResponse.json({ error: `Un cantique avec l'identifiant « ${h.id} » existe déjà.` }, { status: 409 });
    }
    throw e;
  }
  await bumpDataVersion();
  return NextResponse.json(toHymn(created), { status: 201 });
}

// PUT /api/admin/hymns — modifier (réactive aussi un cantique soft-deleted)
export async function PUT(req: NextRequest) {
  if (!isAdminRequest(req)) return unauthorized();
  const parsed = hymnSchema.safeParse(await req.json());
  if (!parsed.success) {
    return NextResponse.json({ error: 'Données invalides', details: parsed.error.flatten() }, { status: 400 });
  }
  const h = parsed.data;
  const updated = await prisma.hymn.update({
    where: { id: h.id },
    data: {
      numero: h.numero,
      titre: h.titre,
      collectionId: h.collection_id,
      auteur: h.auteur ?? null,
      versets: h.versets,
      audio: h.audio ?? undefined,
      deletedAt: null,
    },
  });
  await bumpDataVersion();
  return NextResponse.json(toHymn(updated));
}

// DELETE /api/admin/hymns?id=... — soft-delete (indispensable pour la synchro)
export async function DELETE(req: NextRequest) {
  if (!isAdminRequest(req)) return unauthorized();
  const id = req.nextUrl.searchParams.get('id');
  if (!id) return NextResponse.json({ error: 'id manquant' }, { status: 400 });
  await prisma.hymn.update({ where: { id }, data: { deletedAt: new Date() } });
  await bumpDataVersion();
  return NextResponse.json({ ok: true });
}
