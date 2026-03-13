import { useState, useEffect } from 'react';
import { Save, Video, Upload, Trash2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
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

  const handleSave = async () => {
    setIsLoading(true);
    const { error } = await supabase
      .from('site_settings')
      .update({ value: videoUrl, updated_at: new Date().toISOString() })
      .eq('key', 'intro_video_url');

    if (error) {
      toast({ title: 'خطأ', description: 'فشل في حفظ الفيديو التعريفي', variant: 'destructive' });
    } else {
      setSavedUrl(videoUrl);
      toast({ title: 'تم بنجاح', description: 'تم حفظ الفيديو التعريفي' });
    }
    setIsLoading(false);
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
                onClick={handleRemove}
                disabled={isLoading}
                className="rounded-xl"
              >
                <Trash2 className="ml-2 h-4 w-4" />
                حذف الفيديو
              </Button>
            </div>
          )}

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
                onUploadComplete={(url) => {
                  setVideoUrl(url);
                  setShowUploader(false);
                  toast({ title: 'تم الرفع', description: 'اضغط حفظ لتطبيق التغييرات' });
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
            onClick={handleSave}
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
