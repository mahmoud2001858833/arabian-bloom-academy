import { useState, useEffect } from 'react';
import { Save, Video, Upload, Trash2, AlertTriangle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import DualVideoUploader from '@/components/dashboard/DualVideoUploader';
import VideoPlayer from '@/components/dashboard/VideoPlayer';

const IntroVideoManagement = () => {
  const { toast } = useToast();
  const [videoUrl, setVideoUrl] = useState('');
  const [savedUrl, setSavedUrl] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showUploader, setShowUploader] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  useEffect(() => {
    fetchIntroVideo();
  }, []);

  const fetchIntroVideo = async () => {
    const { data, error } = await supabase
      .from('site_settings')
      .select('value')
      .eq('key', 'intro_video_url')
      .single();

    if (!error && data?.value) {
      setVideoUrl(data.value);
      setSavedUrl(data.value);
    }
  };

  const persistIntroVideo = async (value: string) => {
    const timestamp = new Date().toISOString();
    const { data: existingSetting, error: fetchError } = await supabase
      .from('site_settings')
      .select('id')
      .eq('key', 'intro_video_url')
      .maybeSingle();

    if (fetchError) {
      throw fetchError;
    }

    if (existingSetting?.id) {
      const { error } = await supabase
        .from('site_settings')
        .update({ value, updated_at: timestamp })
        .eq('id', existingSetting.id);

      if (error) throw error;
      return;
    }

    const { error } = await supabase
      .from('site_settings')
      .insert({ key: 'intro_video_url', value, updated_at: timestamp });

    if (error) throw error;
  };

  const handleSave = async (valueToSave = videoUrl) => {
    setIsLoading(true);

    try {
      await persistIntroVideo(valueToSave);
      setVideoUrl(valueToSave);
      setSavedUrl(valueToSave);
      toast({ title: 'تم بنجاح', description: 'تم حفظ الفيديو التعريفي' });
    } catch {
      toast({ title: 'خطأ', description: 'فشل في حفظ الفيديو التعريفي', variant: 'destructive' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleRemove = async () => {
    setIsLoading(true);
    const { error } = await supabase
      .from('site_settings')
      .update({ value: '', updated_at: new Date().toISOString() })
      .eq('key', 'intro_video_url');

    if (error) {
      toast({ title: 'خطأ', description: 'فشل في حذف الفيديو', variant: 'destructive' });
    } else {
      setVideoUrl('');
      setSavedUrl('');
      toast({ title: 'تم بنجاح', description: 'تم حذف الفيديو التعريفي' });
    }
    setIsLoading(false);
  };

  return (
    <div className="space-y-6">
      <Card className="bg-white border border-primary/10 shadow-lg rounded-2xl">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-foreground">
            <Video className="h-5 w-5 text-primary" />
            الفيديو التعريفي
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            ارفع الفيديو التعريفي الذي سيظهر في الصفحة الرئيسية
          </p>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Current Video Preview */}
          {savedUrl && (
            <div className="space-y-3">
              <Label className="text-foreground font-semibold">الفيديو الحالي</Label>
              <div className="rounded-xl overflow-hidden border border-primary/10">
                <VideoPlayer videoKey={savedUrl} />
              </div>
              <Button
                variant="destructive"
                size="sm"
                onClick={() => setShowDeleteConfirm(true)}
                disabled={isLoading}
                className="rounded-xl"
              >
                <Trash2 className="ml-2 h-4 w-4" />
                حذف الفيديو التعريفي
              </Button>
            </div>
          )}

          {/* Delete Confirmation Dialog */}
          <AlertDialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle className="flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5 text-destructive" />
                  تأكيد حذف الفيديو التعريفي
                </AlertDialogTitle>
                <AlertDialogDescription>
                  هل أنت متأكد من حذف الفيديو التعريفي؟ سيتم إزالته من الصفحة الرئيسية.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter className="gap-2">
                <AlertDialogCancel>إلغاء</AlertDialogCancel>
                <AlertDialogAction
                  onClick={handleRemove}
                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                >
                  حذف
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>

          {/* Upload Section */}
          <div className="space-y-3">
            <Label className="text-foreground font-semibold">رفع فيديو جديد</Label>
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
                  onUploadComplete={async (url) => {
                    setVideoUrl(url);
                    setShowUploader(false);
                    await handleSave(url);
                  }}
                />
              )}
            </div>

            {/* Manual URL Input */}
            <div className="space-y-2">
              <Label className="text-foreground font-semibold">أو أدخل رابط الفيديو يدوياً</Label>
              <Input
                value={videoUrl}
                onChange={(e) => setVideoUrl(e.target.value)}
                placeholder="أدخل رابط الفيديو..."
                className="rounded-xl"
                dir="ltr"
              />
            </div>

            {/* Save Button */}
            <Button
              onClick={() => void handleSave()}
              disabled={isLoading || videoUrl === savedUrl}
              className="rounded-xl w-full"
            >
            <Save className="ml-2 h-4 w-4" />
            {isLoading ? 'جاري الحفظ...' : 'حفظ الفيديو التعريفي'}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default IntroVideoManagement;
