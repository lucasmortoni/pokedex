import { TOTAL_SPECIES_COUNT } from './generations';

export type ParsedRouteTarget =
  | {
      ok: true;
      lookupKey: string;
      numericId: number | null;
      initialFormSlug: string | null;
    }
  | {
      ok: false;
      reason: 'INVALID_PARAM';
    };

const FORM_SUFFIX_REGEX =
  /^([a-z0-9-]+?)-(alola|galar|hisui|paldea|mega-x|mega-y|mega|gmax)$/;

const VALID_SLUG_REGEX = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

export function parsePokemonRouteParam(
  rawParam: string | string[] | undefined
): ParsedRouteTarget {
  const raw = Array.isArray(rawParam) ? rawParam[0] : rawParam;
  if (!raw) {
    return { ok: false, reason: 'INVALID_PARAM' };
  }

  const trimmed = raw.trim().toLowerCase();
  if (!trimmed) {
    return { ok: false, reason: 'INVALID_PARAM' };
  }

  // Handle numeric IDs including #0025, 0025, 25
  if (/^#?-?\d+$/.test(trimmed)) {
    const unsigned = trimmed.startsWith('#') ? trimmed.slice(1) : trimmed;
    if (!/^\d+$/.test(unsigned)) {
      return { ok: false, reason: 'INVALID_PARAM' };
    }
    const parsedId = Number.parseInt(unsigned, 10);
    if (!Number.isInteger(parsedId) || parsedId < 1 || parsedId > TOTAL_SPECIES_COUNT) {
      return { ok: false, reason: 'INVALID_PARAM' };
    }
    return {
      ok: true,
      lookupKey: String(parsedId),
      numericId: parsedId,
      initialFormSlug: null,
    };
  }

  if (!VALID_SLUG_REGEX.test(trimmed)) {
    return { ok: false, reason: 'INVALID_PARAM' };
  }

  const formMatch = trimmed.match(FORM_SUFFIX_REGEX);
  if (formMatch && formMatch[1]) {
    return {
      ok: true,
      lookupKey: formMatch[1],
      numericId: null,
      initialFormSlug: trimmed,
    };
  }

  return {
    ok: true,
    lookupKey: trimmed,
    numericId: null,
    initialFormSlug: null,
  };
}
