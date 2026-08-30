import { supabase } from '@/integrations/supabase/client';

export interface IntroVideo {
  key: string;
  title?: string;
}

const LIST_KEY = 'intro_videos';
const LEGACY_KEY = 'intro_video_url';

const upsertSetting = async (key: string, value: string) => {
  const updated_at = new Date().toISOString();
  const { data: existing } = await supabase
    .from('site_settings')
    .select('id')
    .eq('key', key)
    .maybeSingle();

  if (existing?.id) {
    const { error } = await supabase
      .from('site_settings')
      .update({ value, updated_at })
      .eq('id', existing.id);
    if (error) throw error;
    return;
  }

  const { error } = await supabase.from('site_settings').insert({ key, value, updated_at });
  if (error) throw error;
};

/** Reads the intro video playlist, falling back to the legacy single-video setting. */
export const fetchIntroVideos = async (): Promise<IntroVideo[]> => {
  const { data } = await supabase
    .from('site_settings')
    .select('key, value')
    .in('key', [LIST_KEY, LEGACY_KEY]);

  const list = data?.find((row) => row.key === LIST_KEY)?.value;
  if (list) {
    try {
      const parsed = JSON.parse(list);
      if (Array.isArray(parsed)) {
        return parsed
          .map((item): IntroVideo =>
            typeof item === 'string' ? { key: item } : { key: String(item?.key ?? ''), title: item?.title },
          )
          .filter((item) => Boolean(item.key));
      }
    } catch {
      /* fall through to legacy */
    }
  }

  const legacy = data?.find((row) => row.key === LEGACY_KEY)?.value;
  return legacy ? [{ key: legacy }] : [];
};

/** Persists the playlist and keeps the legacy key pointing at the first video. */
export const saveIntroVideos = async (videos: IntroVideo[]) => {
  await upsertSetting(LIST_KEY, JSON.stringify(videos));
  await upsertSetting(LEGACY_KEY, videos[0]?.key ?? '');
};
