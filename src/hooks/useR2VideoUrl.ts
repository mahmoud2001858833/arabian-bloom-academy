const R2_VIDEO_API = 'https://bitter-cloud-d66f.janamuhmad.workers.dev';

interface UploadStartResponse {
  uploadId: string;
  key: string;
}

interface UploadPartResponse {
  etag: string;
  partNumber: number;
}

interface UploadCompleteResponse {
  success: boolean;
  key: string;
  url: string;
}

export const useR2VideoUrl = () => {
  /**
   * بدء عملية رفع جديدة
   */
  const startUpload = async (filename: string, contentType: string): Promise<UploadStartResponse> => {
    const response = await fetch(`${R2_VIDEO_API}/upload/start`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        filename,
        contentType,
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`فشل بدء الرفع: ${error}`);
    }

    return response.json();
  };

  /**
   * رفع جزء من الفيديو
   */
  const uploadPart = async (
    uploadId: string,
    key: string,
    partNumber: number,
    chunk: Blob,
    signal?: AbortSignal
  ): Promise<UploadPartResponse> => {
    const url = `${R2_VIDEO_API}/upload/part?uploadId=${encodeURIComponent(uploadId)}&key=${encodeURIComponent(key)}&partNumber=${partNumber}`;
    
    const response = await fetch(url, {
      method: 'PUT',
      body: chunk,
      signal,
      headers: {
        'Content-Type': 'application/octet-stream',
      },
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`فشل رفع الجزء ${partNumber}: ${error}`);
    }

    return response.json();
  };

  /**
   * إكمال عملية الرفع
   */
  const completeUpload = async (
    uploadId: string,
    key: string,
    parts: { etag: string; partNumber: number }[]
  ): Promise<UploadCompleteResponse> => {
    const response = await fetch(`${R2_VIDEO_API}/upload/complete`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        uploadId,
        key,
        parts,
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`فشل إكمال الرفع: ${error}`);
    }

    return response.json();
  };

  /**
   * إلغاء عملية الرفع
   */
  const abortUpload = async (uploadId: string, key: string): Promise<void> => {
    try {
      await fetch(`${R2_VIDEO_API}/upload/abort`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          uploadId,
          key,
        }),
      });
    } catch (error) {
      console.error('فشل إلغاء الرفع:', error);
    }
  };

  /**
   * الحصول على رابط تشغيل الفيديو
   */
  const getVideoUrl = (key: string): string => {
    if (!key) return '';
    return `${R2_VIDEO_API}/video/${key}`;
  };

  return {
    startUpload,
    uploadPart,
    completeUpload,
    abortUpload,
    getVideoUrl,
    apiUrl: R2_VIDEO_API,
  };
};

export default useR2VideoUrl;
