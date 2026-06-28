import { prisma } from '@/lib/prisma';

// Incrémente la version globale des données après chaque écriture admin.
// Le mobile s'en sert pour détecter qu'une synchro est nécessaire.
export async function bumpDataVersion(): Promise<number> {
  const meta = await prisma.appMeta.upsert({
    where: { id: 1 },
    create: { id: 1, dataVersion: 2 },
    update: { dataVersion: { increment: 1 } },
  });
  return meta.dataVersion;
}
