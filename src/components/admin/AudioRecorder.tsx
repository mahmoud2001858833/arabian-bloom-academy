import { useState, useRef } from 'react';
import { Mic, Square, Play, Pause, Trash2, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface AudioRecorderProps {
  audioUrl: string | null;
  onAudioChange: (url: string | null) => void;
}

const AudioRecorder = ({ audioUrl, onAudioChange }: AudioRecorderProps) => {
  const { toast } = useToast();
  const [isRecording, setIsRecording] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      chunksRef.current = [];

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };

      mediaRecorder.onstop = async () => {
        stream.getTracks().forEach(track => track.stop());
        const blob = new Blob(chunksRef.current, { type: 'audio/webm' });
        await uploadAudio(blob);
      };

      mediaRecorder.start();
      setIsRecording(true);
    } catch {
      toast({ title: 'خطأ', description: 'لا يمكن الوصول للميكروفون', variant: 'destructive' });
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current?.state === 'recording') {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  const uploadAudio = async (blob: Blob) => {
    setIsUploading(true);
    const fileName = `quiz-audio/${Date.now()}.webm`;
    
    const { error } = await supabase.storage
      .from('lesson-pdfs')
      .upload(fileName, blob, { contentType: 'audio/webm' });

    if (error) {
      toast({ title: 'خطأ', description: 'فشل رفع التسجيل الصوتي', variant: 'destructive' });
    } else {
      const { data: { publicUrl } } = supabase.storage
        .from('lesson-pdfs')
        .getPublicUrl(fileName);
      onAudioChange(publicUrl);
      toast({ title: 'تم بنجاح', description: 'تم حفظ التسجيل الصوتي' });
    }
    setIsUploading(false);
  };

  const togglePlayback = () => {
    if (!audioUrl) return;
    
    if (!audioRef.current) {
      audioRef.current = new Audio(audioUrl);
      audioRef.current.onended = () => setIsPlaying(false);
    }

    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      audioRef.current.play();
      setIsPlaying(true);
    }
  };

  const removeAudio = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
    }
    setIsPlaying(false);
    onAudioChange(null);
  };

  return (
    <div className="flex items-center gap-2">
      {isUploading ? (
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Loader2 className="h-4 w-4 animate-spin" />
          جاري الرفع...
        </div>
      ) : audioUrl ? (
        <>
          <Button type="button" size="icon" variant="outline" className="h-8 w-8 rounded-full" onClick={togglePlayback}>
            {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
          </Button>
          <span className="text-xs text-emerald-600 font-medium">تسجيل صوتي مرفق</span>
          <Button type="button" size="icon" variant="ghost" className="h-6 w-6 text-destructive" onClick={removeAudio}>
            <Trash2 className="h-3 w-3" />
          </Button>
        </>
      ) : isRecording ? (
        <Button type="button" size="sm" variant="destructive" className="rounded-xl gap-2" onClick={stopRecording}>
          <Square className="h-3 w-3" />
          إيقاف التسجيل
        </Button>
      ) : (
        <Button type="button" size="sm" variant="outline" className="rounded-xl gap-2" onClick={startRecording}>
          <Mic className="h-4 w-4 text-primary" />
          تسجيل صوتي
        </Button>
      )}
    </div>
  );
};

export default AudioRecorder;
