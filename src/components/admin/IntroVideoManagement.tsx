import { useState, useEffect } from 'react';
import { Video, Upload, Trash2, AlertTriangle, ArrowUp, ArrowDown } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import DualVideoUploader from '@/components/dashboard/DualVideoUploader';
import VideoPlayer from '@/components/dashboard/VideoPlayer';
import { fetchIntroVideos, saveIntroVideos, type IntroVideo } from '@/lib/introVideos';

const IntroVideoManagement = () => {
  const { toast } = useToast();
  const [videos, setVideos] = useState<IntroVideo[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showUploader, setShowUploader] = useState(false);
  const [deleteIndex, setDeleteIndex] = useState<number | null>(null);

  useEffect(() => {
    fetchIntroVideos().then(setVideos);
  }, []);

  const persist = async (next: IntroVideo[]) => {
    setIsLoading(true);
    try {
      await saveIntroVideos(next);
      setVideos(next);
      return true;
    } catch {
      toast({ title: 'خطأ', description: 'فشل في حفظ الفيديوهات التعريفية', variant: 'destructive' });
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const move = (index: number, direction: -1 | 1) => {
    const target = index + direction;
    if (target < 0 || target >= videos.length) return;
    const next = [...videos];
    [next[index], next[target]] = [next[target], next[index]];
    persist(next);
  };

  const rename = (index: number, title: string) => {
    setVideos((prev) => prev.map((v, i) => (i === index ? { ...v, title } : v)));
  };

  return (
    <div className="space-y-6">
      <Card className="bg-white border border-primary/10 shadow-lg rounded-2xl">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-foreground">
            <Video className="h-5 w-5 text-primary" />
            الفيديوهات التعريفية
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            يمكنك رفع أكثر من فيديو تعريفي، وسيظهرون جميعاً في صفحة الفيديو التعريفي بالترتيب المحدد.
          </p>
        </CardHeader>
        <CardContent className="space-y-6">
          {videos.length > 0 && (
            <div className="space-y-5">
              {videos.map((video, index) => (
                <div key={video.key} className="space-y-3 rounded-2xl border border-primary/10 p-4">
                  <div className="flex items-center justify-between gap-3">
                    <span className="text-xs font-bold text-primary">
                      {index === 0 ? 'الفيديو الرئيسي (يظهر بالصفحة الرئيسية)' : `فيديو رقم ${index + 1}`}
                    </span>
                    <div className="flex items-center gap-1">
                      <Button variant="ghost" size="icon" disabled={index === 0 || isLoading} onClick={() => move(index, -1)}>
                        <ArrowUp className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" disabled={index === videos.length - 1 || isLoading} onClick={() => move(index, 1)}>
                        <ArrowDown className="h-4 w-4" />
                      </Button>
                      <Button variant="destructive" size="icon" disabled={isLoading} onClick={() => setDeleteIndex(index)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>

                  <div className="rounded-xl overflow-hidden border border-primary/10">
                    <VideoPlayer videoKey={video.key} />
                  </div>

                  <div className="flex flex-col gap-2 sm:flex-row">
                    <Input
                      value={video.title ?? ''}
                      placeholder="عنوان الفيديو (اختياري)"
                      onChange={(e) => rename(index, e.target.value)}
                      className="rounded-xl"
                    />
                    <Button
                      variant="outline"
                      className="rounded-xl"
                      disabled={isLoading}
                      onClick={async () => {
                        const ok = await persist(videos);
                        if (ok) toast({ title: 'تم الحفظ', description: 'تم تحديث عنوان الفيديو' });
                      }}
                    >
                      حفظ العنوان
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}

          <AlertDialog open={deleteIndex !== null} onOpenChange={(open) => !open && setDeleteIndex(null)}>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle className="flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5 text-destructive" />
                  تأكيد حذف الفيديو التعريفي
                </AlertDialogTitle>
                <AlertDialogDescription>
                  هل أنت متأكد من حذف هذا الفيديو؟ سيتم إزالته من صفحة الفيديو التعريفي.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter className="gap-2">
                <AlertDialogCancel>إلغاء</AlertDialogCancel>
                <AlertDialogAction
                  onClick={async () => {
                    if (deleteIndex === null) return;
                    const next = videos.filter((_, i) => i !== deleteIndex);
                    setDeleteIndex(null);
                    const ok = await persist(next);
                    if (ok) toast({ title: 'تم بنجاح', description: 'تم حذف الفيديو التعريفي' });
                  }}
                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                >
                  حذف
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>

          {/* Upload Section */}
          <div className="space-y-3">
            <Label className="text-foreground font-semibold">إضافة فيديو تعريفي جديد</Label>
            <Button
              variant="outline"
              onClick={() => setShowUploader(!showUploader)}
              className="rounded-xl w-full"
            >
              <Upload className="ml-2 h-4 w-4" />
              {showUploader ? 'إخفاء أداة الرفع' : 'رفع فيديو من جهازك'}
            </Button>

            {showUploader && (
              <DualVideoUploader
                onUploadComplete={async (_url, key) => {
                  setShowUploader(false);
                  const ok = await persist([...videos, { key, title: '' }]);
                  if (ok) toast({ title: 'تم بنجاح', description: 'تمت إضافة الفيديو التعريفي' });
                }}
              />
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default IntroVideoManagement;
