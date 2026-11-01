/*
 * Rate limiting "best effort" per le route pubbliche.
 *
 * I contatori vivono in memoria: su Vercel ogni istanza serverless ha i
 * suoi, quindi il limite è approssimativo ma ferma comunque script semplici
 * e invii ripetuti. Per una protezione rigorosa aggiungi anche le regole
 * del firewall Vercel (WAF) oppure un contatore condiviso (es. Upstash Redis).
 */

type Bucket = {
  count: number;
  resetAt: number;
};

const buckets = new Map<string, Bucket>();

const MAX_TRACKED_KEYS = 5000;

export function getClientIp(request: Request): string {
  const forwarded = request.headers.get("x-forwarded-for");

  if (forwarded) {
    const first = forwarded.split(",")[0]?.trim();

    if (first) {
      return first;
    }
  }

  return request.headers.get("x-real-ip")?.trim() || "unknown";
}

export function rateLimit(
  key: string,
  limit: number,
  windowMs: number
): { ok: boolean; retryAfterSeconds: number } {
  const now = Date.now();

  if (buckets.size > MAX_TRACKED_KEYS) {
    for (const [storedKey, bucket] of buckets) {
      if (bucket.resetAt <= now) {
        buckets.delete(storedKey);
      }
    }
  }

  const current = buckets.get(key);

  if (!current || current.resetAt <= now) {
    buckets.set(key, { count: 1, resetAt: now + windowMs });

    return { ok: true, retryAfterSeconds: 0 };
  }

  current.count += 1;

  if (current.count > limit) {
    return {
      ok: false,
      retryAfterSeconds: Math.max(1, Math.ceil((current.resetAt - now) / 1000)),
    };
  }

  return { ok: true, retryAfterSeconds: 0 };
}

export function tooManyRequestsResponse(retryAfterSeconds: number) {
  return new Response(
    JSON.stringify({
      error: "Troppe richieste. Riprova tra qualche minuto.",
    }),
    {
      status: 429,
      headers: {
        "Content-Type": "application/json",
        "Cache-Control": "no-store, max-age=0",
        "Retry-After": String(retryAfterSeconds),
      },
    }
  );
}
