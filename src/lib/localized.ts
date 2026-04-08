/**
 * Helper to get localized field from a record that has
 * title / title_en / title_fr / title_ms / title_ur / title_id
 * and description / description_en / description_fr / description_ms / description_ur / description_id
 *
 * Falls back to the base field (Arabic) when the localized value is empty.
 */

type LocaleKey = 'ar' | 'en' | 'fr' | 'ms' | 'ur' | 'id';

const SUFFIX_MAP: Record<string, string> = {
  ar: '',   // base field
  en: '_en',
  fr: '_fr',
  ms: '_ms',
  ur: '_ur',
  id: '_id',
};

export function getLocalizedField(
  record: Record<string, any>,
  field: string,
  language: string,
): string {
  const suffix = SUFFIX_MAP[language] ?? '';
  const localizedKey = suffix ? `${field}${suffix}` : field;
  const value = record[localizedKey];
  if (value && typeof value === 'string' && value.trim()) return value;
  // fallback to base (Arabic)
  return record[field] ?? '';
}
