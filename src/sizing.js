/**
 * Ring, necklace and stud sizing helpers.
 *
 * Ring sizes follow ISO 8653, where the EU size IS the inner circumference in
 * millimetres. US and UK equivalents are the standard trade conversions, which
 * is why cross-border buying goes wrong so often: a US 6 is a UK M, not a UK 6.
 */
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const here = dirname(fileURLToPath(import.meta.url));
const DATA = JSON.parse(readFileSync(join(here, '..', 'data', 'sizing.json'), 'utf8'));

export const RING_SIZES = DATA.ring_sizes.rows;
export const NECKLACE_LENGTHS = DATA.necklace_lengths.rows;
export const STUD_SIZES = DATA.stud_sizes.rows;

/**
 * Convert a ring size between systems.
 * @param {number|string} value size in the source system
 * @param {'us'|'uk'|'eu'|'diameter_mm'} from
 */
export function convertRingSize(value, from = 'us') {
  const key = from === 'mm' ? 'diameter_mm' : from;
  if (!['us', 'uk', 'eu', 'diameter_mm'].includes(key)) {
    throw new Error(`unknown system: ${from}`);
  }
  if (key === 'uk') {
    const want = String(value).toUpperCase();
    const hit = RING_SIZES.find(r => String(r.uk).toUpperCase() === want);
    return hit ? { ...hit, exact: true } : nearestUnavailable(value, key);
  }
  const num = Number(value);
  if (!Number.isFinite(num)) throw new Error('value must be numeric for us/eu/mm');
  const exact = RING_SIZES.find(r => Math.abs(r[key] - num) < 1e-9);
  if (exact) return { ...exact, exact: true };
  // Not a listed size — return the closest and say so, rather than inventing one.
  let best = RING_SIZES[0];
  for (const r of RING_SIZES) {
    if (Math.abs(r[key] - num) < Math.abs(best[key] - num)) best = r;
  }
  return { ...best, exact: false, note: `${value} is between listed sizes; closest is shown` };
}

function nearestUnavailable(value, key) {
  return { error: `no ${key} size matching "${value}"`, available: RING_SIZES.map(r => r[key]) };
}

/** Necklace length lookup, by inches or cm. */
export function necklaceLength(value, unit = 'inches') {
  const key = unit === 'cm' ? 'cm' : 'inches';
  const num = Number(value);
  let best = NECKLACE_LENGTHS[0];
  for (const r of NECKLACE_LENGTHS) {
    if (Math.abs(r[key] - num) < Math.abs(best[key] - num)) best = r;
  }
  return { ...best, exact: Math.abs(best[key] - num) < 0.6 };
}

/** How a given stud diameter reads on the ear. */
export function studAppearance(diameterMm) {
  const num = Number(diameterMm);
  let best = STUD_SIZES[0];
  for (const r of STUD_SIZES) {
    if (Math.abs(r.diameter_mm - num) < Math.abs(best.diameter_mm - num)) best = r;
  }
  return { ...best, requested_mm: num, exact: Math.abs(best.diameter_mm - num) < 0.25 };
}

export const SIZING_NOTES = DATA.ring_sizes.notes;
