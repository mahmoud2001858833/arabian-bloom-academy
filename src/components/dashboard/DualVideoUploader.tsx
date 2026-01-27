import { useState, useRef, useCallback } from 'react';
import { Upload, X, CheckCircle, AlertCircle, Loader2, Video, Cloud } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/hooks/use-toast';
import { useR2VideoUrl } from '@/hooks/useR2VideoUrl';
import { cn } from '@/lib/utils';

const CHUNK_SIZE = 10 * 1024 * 1024; // 10MB per chunk

interface DualVideoUploaderProps {
  onUploadComplete: (videoUrl: string, videoKey: string) => void;
  currentVideoUrl?: string;
  className?: string;
}

type UploadStatus = 'idle' | 'uploading' | 'success' | 'error';

interface UploadState {
  status: UploadStatus;
  progress: number;
  currentPart: number;
  totalParts: number;
  error?: string;
}

const DualVideoUploader = ({ onUploadComplete, currentVideoUrl, className }: DualVideoUploaderProps) => {
  const { toast } = useToast();
  const { startUpload, uploadPart, completeUpload, abortUpload, getVideoUrl } = useR2VideoUrl();
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const abortControllerRef = useRef<AbortController | null>(null);
  const uploadIdRef = useRef<string | null>(null);
  const keyRef = useRef<string | null>(null);
  
  const [isDragging, setIsDragging] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploadState, setUploadState] = useState<UploadState>({
    status: 'idle',
    progress: 0,
    currentPart: 0,
    totalParts: 0,
  });

  const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

  const uploadWithRetry = async (
    uploadId: string,
    key: string,
    partNumber: number,
    chunk: Blob,
    signal: AbortSignal,
    maxRetries = 3
  ) => {
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        const result = await uploadPart(uploadId, key, partNumber, chunk, signal);
        return result;
      } catch (error) {
        if (signal.aborted) throw error;
        if (attempt === maxRetries) throw error;
        await delay(1000 * attempt); // Exponential backoff
        console.log(`إعادة المحاولة ${attempt} للجزء ${partNumber}`);
      }
    }
    throw new Error('فشل الرفع بعد جميع المحاولات');
  };

  const handleUpload = async (file: File) => {
    setSelectedFile(file);
    const totalParts = Math.ceil(file.size / CHUNK_SIZE);
    
    setUploadState({
      status: 'uploading',
      progress: 0,
      currentPart: 0,
      totalParts,
    });

    abortControllerRef.current = new AbortController();
    const signal = abortControllerRef.current.signal;

    try {
      // 1. بدء عملية الرفع
      const { uploadId, key } = await startUpload(file.name, file.type);
      uploadIdRef.current = uploadId;
      keyRef.current = key;

      // 2. رفع الأجزاء
      const parts: { etag: string; partNumber: number }[] = [];

      for (let i = 0; i < totalParts; i++) {
        if (signal.aborted) {
          throw new Error('تم إلغاء الرفع');
        }

        const start = i * CHUNK_SIZE;
        const end = Math.min(start + CHUNK_SIZE, file.size);
        const chunk = file.slice(start, end);
        const partNumber = i + 1;

        setUploadState(prev => ({
          ...prev,
          currentPart: partNumber,
        }));

        const result = await uploadWithRetry(uploadId, key, partNumber, chunk, signal);
        parts.push({ etag: result.etag, partNumber: result.partNumber });

        const progress = Math.round(((i + 1) / totalParts) * 100);
        setUploadState(prev => ({
          ...prev,
          progress,
        }));
      }

      // 3. إكمال الرفع
      const { url } = await completeUpload(uploadId, key, parts);
      
      setUploadState({
        status: 'success',
        progress: 100,
        currentPart: totalParts,
        totalParts,
      });

      onUploadComplete(url, key);
      
      toast({
        title: 'تم الرفع بنجاح',
        description: 'تم رفع الفيديو بنجاح',
      });

    } catch (error) {
      if ((error as Error).message === 'تم إلغاء الرفع') {
        // تنظيف بعد الإلغاء
        if (uploadIdRef.current && keyRef.current) {
          await abortUpload(uploadIdRef.current, keyRef.current);
        }
        setUploadState({
          status: 'idle',
          progress: 0,
          currentPart: 0,
          totalParts: 0,
        });
        setSelectedFile(null);
      } else {
        console.error('خطأ في الرفع:', error);
        setUploadState(prev => ({
          ...prev,
          status: 'error',
          error: (error as Error).message,
        }));
        toast({
          title: 'خطأ في الرفع',
          description: (error as Error).message,
          variant: 'destructive',
        });
      }
    }
  };

  const handleCancel = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
  };

  const handleReset = () => {
    setUploadState({
      status: 'idle',
      progress: 0,
      currentPart: 0,
      totalParts: 0,
    });
    setSelectedFile(null);
    uploadIdRef.current = null;
    keyRef.current = null;
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.startsWith('video/')) {
        toast({
          title: 'ملف غير صالح',
          description: 'يرجى اختيار ملف فيديو',
          variant: 'destructive',
        });
        return;
      }
      handleUpload(file);
    }
  };

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    const file = e.dataTransfer.files?.[0];
    if (file) {
      if (!file.type.startsWith('video/')) {
        toast({
          title: 'ملف غير صالح',
          description: 'يرجى اختيار ملف فيديو',
          variant: 'destructive',
        });
        return;
      }
      handleUpload(file);
    }
  }, []);

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className={cn("space-y-4", className)}>
      <input
        ref={fileInputRef}
        type="file"
        accept="video/*"
        onChange={handleFileSelect}
        className="hidden"
      />

      <AnimatePresence mode="wait">
        {uploadState.status === 'idle' && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
          >
            <div
              onClick={() => fileInputRef.current?.click()}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              className={cn(
                "relative border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all",
                isDragging
                  ? "border-accent bg-accent/10"
                  : "border-white/20 hover:border-accent/50 hover:bg-white/5"
              )}
            >
              <div className="flex flex-col items-center gap-4">
                <div className={cn(
                  "p-4 rounded-full transition-colors",
                  isDragging ? "bg-accent/20" : "bg-white/10"
                )}>
                  <Cloud className={cn(
                    "h-8 w-8 transition-colors",
                    isDragging ? "text-accent" : "text-white/60"
                  )} />
                </div>
                <div>
                  <p className="text-lg font-bold text-white mb-1">
                    {isDragging ? 'أفلت الملف هنا' : 'اسحب الفيديو أو انقر للاختيار'}
                  </p>
                  <p className="text-sm text-white/50">
                    MP4, WebM, MOV (أقصى حجم: غير محدود)
                  </p>
                </div>
                <Button variant="gold-outline" className="rounded-xl">
                  <Upload className="ml-2 h-4 w-4" />
                  اختر ملف
                </Button>
              </div>

              {currentVideoUrl && (
                <div className="mt-4 pt-4 border-t border-white/10">
                  <p className="text-sm text-white/50 mb-2">الفيديو الحالي:</p>
                  <div className="flex items-center gap-2 justify-center text-accent">
                    <Video className="h-4 w-4" />
                    <span className="text-sm truncate max-w-[200px]">{currentVideoUrl}</span>
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        )}

        {uploadState.status === 'uploading' && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="border border-white/20 rounded-xl p-6 bg-white/5"
          >
            <div className="flex items-center gap-4 mb-4">
              <div className="p-3 rounded-full bg-accent/20 animate-pulse">
                <Loader2 className="h-6 w-6 text-accent animate-spin" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-bold text-white truncate">{selectedFile?.name}</p>
                <p className="text-sm text-white/50">
                  {formatFileSize(selectedFile?.size || 0)} • الجزء {uploadState.currentPart} من {uploadState.totalParts}
                </p>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={handleCancel}
                className="text-white/60 hover:text-destructive"
              >
                <X className="h-5 w-5" />
              </Button>
            </div>
            
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-white/60">جاري الرفع...</span>
                <span className="text-accent font-bold">{uploadState.progress}%</span>
              </div>
              <Progress value={uploadState.progress} className="h-2" />
            </div>
          </motion.div>
        )}

        {uploadState.status === 'success' && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="border border-accent/30 rounded-xl p-6 bg-accent/10"
          >
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-full bg-accent/20">
                <CheckCircle className="h-6 w-6 text-accent" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-bold text-white">تم الرفع بنجاح!</p>
                <p className="text-sm text-white/50 truncate">{selectedFile?.name}</p>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleReset}
                className="text-white/60 hover:text-white"
              >
                رفع آخر
              </Button>
            </div>
          </motion.div>
        )}

        {uploadState.status === 'error' && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="border border-destructive/30 rounded-xl p-6 bg-destructive/10"
          >
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-full bg-destructive/20">
                <AlertCircle className="h-6 w-6 text-destructive" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-bold text-white">فشل الرفع</p>
                <p className="text-sm text-white/50">{uploadState.error}</p>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleReset}
                className="text-white/60 hover:text-white"
              >
                حاول مجدداً
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default DualVideoUploader;
