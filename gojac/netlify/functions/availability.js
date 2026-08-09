// netlify/functions/availability.js
//
// Fusionne les calendriers iCal (.ics) exportés par Airbnb et Booking.com
// pour exposer une seule liste de dates indisponibles, consommée par le
// calendrier du site (voir index.html, section #disponibilites).
//
// Configuration (variables d'environnement Netlify) :
//   AIRBNB_ICAL_URL   -> URL d'export iCal de l'annonce Airbnb
//   BOOKING_ICAL_URL  -> URL d'export iCal de l'annonce Booking.com
//
// Comment récupérer ces URL :
//   - Airbnb  : Espace hôte > Annonce > Disponibilités > Synchroniser les calendriers
//               > "Exporter le calendrier" (URL en .ics, à copier telle quelle).
//   - Booking : Extranet > Tarifs et disponibilités > Synchroniser les calendriers
//               > "Exporter le calendrier".
//
// Si une ou deux variables sont absentes (site pas encore branché sur de
// vraies annonces), la fonction renvoie un jeu de données de démonstration
// généré dynamiquement à partir de la date du jour, avec source: "demo",
// pour que le site reste utilisable/démonstrable sans configuration.

const CACHE_TTL_MS = 15 * 60 * 1000; // 15 minutes
let cache = { at: 0, payload: null };

exports.handler = async function handler(event) {
  const headers = {
    'Content-Type': 'application/json; charset=utf-8',
    'Cache-Control': 'public, max-age=300',
    'Access-Control-Allow-Origin': '*',
  };

  try {
    const now = Date.now();
    if (cache.payload && now - cache.at < CACHE_TTL_MS) {
      return { statusCode: 200, headers, body: JSON.stringify(cache.payload) };
    }

    const airbnbUrl = process.env.AIRBNB_ICAL_URL;
    const bookingUrl = process.env.BOOKING_ICAL_URL;

    if (!airbnbUrl && !bookingUrl) {
      const payload = buildDemoPayload();
      cache = { at: now, payload };
      return { statusCode: 200, headers, body: JSON.stringify(payload) };
    }

    const warnings = [];
    const [airbnbRanges, bookingRanges] = await Promise.all([
      airbnbUrl ? fetchRanges(airbnbUrl, 'airbnb', warnings) : Promise.resolve([]),
      bookingUrl ? fetchRanges(bookingUrl, 'booking', warnings) : Promise.resolve([]),
    ]);

    const ranges = mergeRanges([...airbnbRanges, ...bookingRanges]);
    const payload = {
      generatedAt: new Date().toISOString(),
      source: 'live',
      warnings,
      ranges,
    };
    cache = { at: now, payload };
    return { statusCode: 200, headers, body: JSON.stringify(payload) };
  } catch (err) {
    // En cas d'erreur inattendue, on ne casse jamais l'affichage du site :
    // on retombe sur la démo plutôt que de renvoyer une 500.
    const payload = buildDemoPayload();
    payload.warnings = [`Erreur serveur, bascule en démo : ${String(err && err.message || err)}`];
    return { statusCode: 200, headers, body: JSON.stringify(payload) };
  }
};

async function fetchRanges(url, source, warnings) {
  try {
    const res = await fetch(url, { headers: { 'User-Agent': 'gojac-availability-sync/1.0' } });
    if (!res.ok) {
      warnings.push(`${source} : réponse HTTP ${res.status} en récupérant le flux iCal`);
      return [];
    }
    const text = await res.text();
    return parseICS(text, source);
  } catch (err) {
    warnings.push(`${source} : échec de récupération du flux iCal (${String(err && err.message || err)})`);
    return [];
  }
}

// Parseur iCal minimal : suffisant pour les exports Airbnb/Booking, qui sont
// des VEVENT simples en dates "toute la journée" (DTSTART/DTEND en VALUE=DATE).
function parseICS(raw, source) {
  const unfolded = unfoldLines(raw);
  const events = [];
  let current = null;

  for (const line of unfolded) {
    if (line === 'BEGIN:VEVENT') {
      current = {};
      continue;
    }
    if (line === 'END:VEVENT') {
      if (current && current.start && current.end) {
        events.push({ start: current.start, end: current.end, source });
      }
      current = null;
      continue;
    }
    if (!current) continue;

    const sep = line.indexOf(':');
    if (sep === -1) continue;
    const rawKey = line.slice(0, sep);
    const value = line.slice(sep + 1).trim();
    const key = rawKey.split(';')[0];

    if (key === 'DTSTART') current.start = toISODate(value);
    if (key === 'DTEND') current.end = toISODate(value);
    if (key === 'SUMMARY') current.summary = value;
  }

  return events.filter((e) => e.start && e.end);
}

function unfoldLines(raw) {
  const rawLines = raw.replace(/\r\n/g, '\n').split('\n');
  const lines = [];
  for (const line of rawLines) {
    if ((line.startsWith(' ') || line.startsWith('\t')) && lines.length) {
      lines[lines.length - 1] += line.slice(1);
    } else if (line.trim() !== '') {
      lines.push(line.trimEnd());
    }
  }
  return lines;
}

// "20260814" ou "20260814T000000Z" -> "2026-08-14"
function toISODate(value) {
  const digits = value.replace(/[^0-9]/g, '');
  if (digits.length < 8) return null;
  return `${digits.slice(0, 4)}-${digits.slice(4, 6)}-${digits.slice(6, 8)}`;
}

// Fusionne les plages qui se chevauchent (même source) pour un payload plus compact.
function mergeRanges(ranges) {
  const bySource = ranges.reduce((acc, r) => {
    (acc[r.source] = acc[r.source] || []).push(r);
    return acc;
  }, {});

  const merged = [];
  for (const source of Object.keys(bySource)) {
    const sorted = bySource[source]
      .slice()
      .sort((a, b) => a.start.localeCompare(b.start));

    let cur = null;
    for (const r of sorted) {
      if (!cur) {
        cur = { ...r };
        continue;
      }
      if (r.start <= cur.end) {
        if (r.end > cur.end) cur.end = r.end;
      } else {
        merged.push(cur);
        cur = { ...r };
      }
    }
    if (cur) merged.push(cur);
  }

  return merged.sort((a, b) => a.start.localeCompare(b.start));
}

function buildDemoPayload() {
  const today = new Date();
  today.setUTCHours(0, 0, 0, 0);
  const add = (n) => {
    const d = new Date(today);
    d.setUTCDate(d.getUTCDate() + n);
    return d.toISOString().slice(0, 10);
  };

  return {
    generatedAt: new Date().toISOString(),
    source: 'demo',
    warnings: [
      'AIRBNB_ICAL_URL et/ou BOOKING_ICAL_URL non configurées : données de démonstration générées côté serveur.',
    ],
    ranges: [
      { start: add(4), end: add(9), source: 'airbnb' },
      { start: add(18), end: add(21), source: 'booking' },
      { start: add(33), end: add(40), source: 'airbnb' },
      { start: add(33), end: add(36), source: 'booking' },
      { start: add(55), end: add(58), source: 'booking' },
    ],
  };
}
