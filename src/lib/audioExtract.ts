/**
 * Extracts the audio track of a video and encodes it as 16 kHz mono WAV chunks,
 * ready to be sent to the speech-to-text backend.
 */

export interface AudioChunk {
  /** Offset of this chunk inside the original video, in seconds. */
  offset: number;
  /** Duration of this chunk, in seconds. */
  duration: number;
  /** Base64-encoded 16 kHz mono WAV. */
  base64: string;
}

const TARGET_RATE = 16000;
const CHUNK_SECONDS = 180;

function encodeWav(samples: Float32Array, sampleRate: number): Blob {
  const buffer = new ArrayBuffer(44 + samples.length * 2);
  const view = new DataView(buffer);

  const writeString = (offset: number, value: string) => {
    for (let i = 0; i < value.length; i++) view.setUint8(offset + i, value.charCodeAt(i));
  };

  writeString(0, 'RIFF');
  view.setUint32(4, 36 + samples.length * 2, true);
  writeString(8, 'WAVE');
  writeString(12, 'fmt ');
  view.setUint32(16, 16, true);
  view.setUint16(20, 1, true);
  view.setUint16(22, 1, true);
  view.setUint32(24, sampleRate, true);
  view.setUint32(28, sampleRate * 2, true);
  view.setUint16(32, 2, true);
  view.setUint16(34, 16, true);
  writeString(36, 'data');
  view.setUint32(40, samples.length * 2, true);

  let offset = 44;
  for (let i = 0; i < samples.length; i++) {
    const s = Math.max(-1, Math.min(1, samples[i]));
    view.setInt16(offset, s < 0 ? s * 0x8000 : s * 0x7fff, true);
    offset += 2;
  }

  return new Blob([view], { type: 'audio/wav' });
}

async function blobToBase64(blob: Blob): Promise<string> {
  const bytes = new Uint8Array(await blob.arrayBuffer());
  let binary = '';
  const step = 0x8000;
  for (let i = 0; i < bytes.length; i += step) {
    binary += String.fromCharCode(...bytes.subarray(i, i + step));
  }
  return btoa(binary);
}

export async function extractAudioChunks(
  videoUrl: string,
  onProgress?: (message: string) => void,
): Promise<AudioChunk[]> {
  onProgress?.('جارٍ تحميل الفيديو...');
  const response = await fetch(videoUrl);
  if (!response.ok) throw new Error('تعذّر تحميل الفيديو لاستخراج الصوت');
  const arrayBuffer = await response.arrayBuffer();

  onProgress?.('جارٍ استخراج الصوت...');
  const AudioCtx: typeof AudioContext =
    window.AudioContext ?? (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
  const decodeCtx = new AudioCtx();
  const decoded = await decodeCtx.decodeAudioData(arrayBuffer.slice(0));
  await decodeCtx.close();

  // Resample to 16 kHz mono to keep the uploads small.
  const offline = new OfflineAudioContext(1, Math.ceil(decoded.duration * TARGET_RATE), TARGET_RATE);
  const source = offline.createBufferSource();
  source.buffer = decoded;
  source.connect(offline.destination);
  source.start();
  const rendered = await offline.startRendering();
  const data = rendered.getChannelData(0);

  const chunks: AudioChunk[] = [];
  const samplesPerChunk = CHUNK_SECONDS * TARGET_RATE;
  for (let start = 0; start < data.length; start += samplesPerChunk) {
    const slice = data.slice(start, Math.min(start + samplesPerChunk, data.length));
    if (slice.length < TARGET_RATE) continue; // skip sub-second tails
    onProgress?.(`تجهيز المقطع الصوتي ${chunks.length + 1}...`);
    const wav = encodeWav(slice, TARGET_RATE);
    chunks.push({
      offset: start / TARGET_RATE,
      duration: slice.length / TARGET_RATE,
      base64: await blobToBase64(wav),
    });
  }

  if (chunks.length === 0) throw new Error('لم يتم العثور على صوت في الفيديو');
  return chunks;
}