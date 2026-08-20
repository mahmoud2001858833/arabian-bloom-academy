import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface SubtitleTrack {
  language: string;
  url: string;
}

const LANGUAGE_LABELS: Record<string, string> = {
  ar: 'العربية',
  en: 'English',
  fr: 'Français',
  ms: 'Bahasa Melayu',
  ur: 'اردو',
  id: 'Bahasa Indonesia',
};

export const getSubtitleLabel = (code: string) => LANGUAGE_LABELS[code] ?? code;

/**
 * Loads generated subtitles for a lesson and exposes them as blob track URLs.
 */
export const useLessonSubtitles = (lessonId?: string | null) => {
  const [tracks, setTracks] = useState<SubtitleTrack[]>([]);

  useEffect(() => {
    let cancelled = false;
    const created: string[] = [];

    const load = async () => {
      if (!lessonId) {
        setTracks([]);
        return;
      }

      const { data, error } = await supabase
        .from('lesson_subtitles')
        .select('language, content')
        .eq('lesson_id', lessonId);

      if (error || !data || cancelled) return;

      const next = data.map((row) => {
        const url = URL.createObjectURL(
          new Blob([row.content], { type: 'text/vtt' }),
        );
        created.push(url);
        return { language: row.language, url };
      });

      if (cancelled) {
        next.forEach((t) => URL.revokeObjectURL(t.url));
        return;
      }
      setTracks(next);
    };

    load();

    return () => {
      cancelled = true;
      created.forEach((url) => URL.revokeObjectURL(url));
    };
  }, [lessonId]);

  return { tracks };
};

export default useLessonSubtitles;