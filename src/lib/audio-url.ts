// Validation des URLs audio saisies dans le formulaire admin.
// Objectif : empêcher d'enregistrer un lien mort (ex. soundjay → 404) que
// l'app mobile ne pourrait pas jouer.

export const AUDIO_VOICE_FIELDS = ['soprano', 'alto', 'tenor', 'bass', 'full'] as const;
export type AudioUrlField = (typeof AUDIO_VOICE_FIELDS)[number];

/** Vérifie que la chaîne est une URL http(s) syntaxiquement valide. */
export function isHttpUrl(value: string): boolean {
  try {
    const u = new URL(value);
    return u.protocol === 'http:' || u.protocol === 'https:';
  } catch {
    return false;
  }
}

export interface AudioUrlCheck {
  ok: boolean;
  status?: number;
  contentType?: string | null;
  /** Message explicatif quand ok === false. */
  reason?: string;
  /** true si joignable mais le type ne ressemble pas à de l'audio. */
  suspiciousType?: boolean;
}

const CHECK_TIMEOUT = 10_000;

/**
 * Teste qu'une URL audio est réellement joignable (côté serveur → pas de CORS).
 * Essaie HEAD, puis GET Range si HEAD n'est pas supporté.
 */
export async function checkAudioUrl(url: string): Promise<AudioUrlCheck> {
  if (!isHttpUrl(url)) {
    return { ok: false, reason: "L'URL doit commencer par http:// ou https://" };
  }

  const attempt = async (method: 'HEAD' | 'GET'): Promise<Response> => {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), CHECK_TIMEOUT);
    try {
      return await fetch(url, {
        method,
        redirect: 'follow',
        signal: controller.signal,
        // Range minimal pour ne pas télécharger tout le fichier en GET.
        headers: method === 'GET' ? { Range: 'bytes=0-0' } : undefined,
      });
    } finally {
      clearTimeout(timer);
    }
  };

  let res: Response;
  try {
    res = await attempt('HEAD');
    // Beaucoup d'hébergeurs refusent HEAD (405/501) → on retente en GET.
    if (res.status === 405 || res.status === 501 || res.status === 403) {
      res = await attempt('GET');
    }
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    const reason =
      err instanceof Error && err.name === 'AbortError'
        ? 'Le serveur audio ne répond pas (délai dépassé).'
        : `Impossible de joindre le serveur audio (${msg}).`;
    return { ok: false, reason };
  }

  if (!res.ok) {
    return {
      ok: false,
      status: res.status,
      reason: `Le lien renvoie une erreur HTTP ${res.status}. Vérifiez que le fichier existe et est public.`,
    };
  }

  const contentType = res.headers.get('content-type');
  const suspiciousType = !!contentType && !/audio\/|application\/octet-stream|video\/|mpegurl/i.test(contentType);

  return { ok: true, status: res.status, contentType, suspiciousType };
}
