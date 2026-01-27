const CLOUDFLARE_WORKER_URL = 'https://empty-art-c37e.mdfmmdfds.workers.dev';

export const useCloudflareVideoUrl = () => {
  /**
   * توليد رابط تشغيل الفيديو من Cloudflare R2
   */
  const getVideoUrl = (videoKey: string): string => {
    if (!videoKey) return '';
    
    // إذا كان الرابط كامل، نستخرج المفتاح فقط
    if (videoKey.startsWith('http')) {
      try {
        const url = new URL(videoKey);
        const pathParts = url.pathname.split('/');
        videoKey = pathParts[pathParts.length - 1];
      } catch {
        // إذا فشل التحليل، نستخدم الرابط كما هو
        return videoKey;
      }
    }
    
    return `${CLOUDFLARE_WORKER_URL}/video/${videoKey}`;
  };

  /**
   * التحقق من صلاحية رابط الفيديو
   */
  const isValidVideoKey = (videoKey: string): boolean => {
    return !!videoKey && videoKey.length > 0;
  };

  /**
   * توليد رابط صورة مصغرة للفيديو (إذا كان مدعوماً)
   */
  const getThumbnailUrl = (videoKey: string): string => {
    if (!videoKey) return '';
    return `${CLOUDFLARE_WORKER_URL}/thumbnail/${videoKey}`;
  };

  return {
    getVideoUrl,
    isValidVideoKey,
    getThumbnailUrl,
    workerUrl: CLOUDFLARE_WORKER_URL,
  };
};

export default useCloudflareVideoUrl;
