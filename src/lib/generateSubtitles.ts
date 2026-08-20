import { supabase } from '@/integrations/supabase/client';
import { extractAudioChunks } from '@/lib/audioExtract';

interface Segment {
  start: number;
  end: number;
  text: string;
}

const WORKER_URL = 'https://bitter-cloud-d66f.janamuhmad.workers.dev';

const buildVideoUrl = (videoKey: string) =>
  videoKey.startsWith('http') ? videoKey : `${WORKER_URL}/video/${videoKey}`;

const invoke = async <T,>(body: Record<string, unknown>): Promise<T> => {
  const { data, error } = await supabase.functions.invoke('transcribe-lesson-video', { body });
  if (error) {
    const details = 'context' in error ? await (error as { context: Response }).context.text().catch(() => '') : '';
    throw new Error(details || error.message);
  }
  if ((data as { error?: string })?.error) throw new Error((data as { error: string }).error);
  return data as T;
};

/**
 * Extracts the lesson video audio, transcribes it to Arabic text with timings,
 * then translates and stores subtitles for every supported language.
 */
export async function generateLessonSubtitles(
  lessonId: string,
  videoKey: string,
  onProgress?: (message: string) => void,
): Promise<{ languages: string[]; segments: number }> {
  const chunks = await extractAudioChunks(buildVideoUrl(videoKey), onProgress);

  const allSegments: Segment[] = [];
  for (let i = 0; i < chunks.length; i++) {
    onProgress?.(`تفريغ الصوت (${i + 1}/${chunks.length})...`);
    const result = await invoke<{ segments: Segment[] }>({
      action: 'transcribe_chunk',
      lesson_id: lessonId,
      offset: chunks[i].offset,
      audio_base64: chunks[i].base64,
    });
    allSegments.push(...(result.segments ?? []));
  }

  onProgress?.('جارٍ الترجمة لجميع اللغات...');
  return invoke<{ languages: string[]; segments: number }>({
    action: 'finalize',
    lesson_id: lessonId,
    segments: allSegments,
  });
}