import { useState, useEffect } from 'react';
import { 
  Plus, Edit, Trash2, Eye, EyeOff, Save, Languages, 
  Upload, Image, Loader2, BookOpen 
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface BlogPost {
  id: string;
  title_ar: string;
  title_en: string | null;
  title_ms: string | null;
  title_ur: string | null;
  title_id: string | null;
  title_fr: string | null;
  description_ar: string | null;
  description_en: string | null;
  description_ms: string | null;
  description_ur: string | null;
  description_id: string | null;
  description_fr: string | null;
  content_ar: string;
  content_en: string | null;
  content_ms: string | null;
  content_ur: string | null;
  content_id: string | null;
  content_fr: string | null;
  image_url: string | null;
  is_published: boolean;
  created_at: string;
}

const LANGUAGES = [
  { code: 'ar', name: 'العربية', flag: '🇸🇦' },
  { code: 'en', name: 'English', flag: '🇬🇧' },
  { code: 'ms', name: 'Melayu', flag: '🇲🇾' },
  { code: 'ur', name: 'اردو', flag: '🇵🇰' },
  { code: 'id', name: 'Indonesia', flag: '🇮🇩' },
  { code: 'fr', name: 'Français', flag: '🇫🇷' },
];

const BlogManagement = () => {
  const { toast } = useToast();
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isTranslating, setIsTranslating] = useState(false);
  const [showPostDialog, setShowPostDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('ar');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  const [postForm, setPostForm] = useState({
    id: '',
    title_ar: '',
    title_en: '',
    title_ms: '',
    title_ur: '',
    title_id: '',
    title_fr: '',
    description_ar: '',
    description_en: '',
    description_ms: '',
    description_ur: '',
    description_id: '',
    description_fr: '',
    content_ar: '',
    content_en: '',
    content_ms: '',
    content_ur: '',
    content_id: '',
    content_fr: '',
    image_url: '',
    is_published: false,
  });

  useEffect(() => {
    fetchPosts();
  }, []);

  const fetchPosts = async () => {
    setIsLoading(true);
    const { data, error } = await supabase
      .from('blog_posts')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      toast({ title: 'خطأ', description: 'فشل في تحميل المدونات', variant: 'destructive' });
    } else {
      setPosts(data || []);
    }
    setIsLoading(false);
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        toast({ title: 'خطأ', description: 'الرجاء اختيار صورة فقط', variant: 'destructive' });
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        toast({ title: 'خطأ', description: 'حجم الصورة يجب أن يكون أقل من 5 ميجابايت', variant: 'destructive' });
        return;
      }
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const uploadImage = async (): Promise<string | null> => {
    if (!imageFile) return postForm.image_url || null;

    const fileExt = imageFile.name.split('.').pop();
    const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;

    const { error: uploadError } = await supabase.storage
      .from('blog-images')
      .upload(fileName, imageFile);

    if (uploadError) {
      console.error('Upload error:', uploadError);
      toast({ title: 'خطأ', description: 'فشل في رفع الصورة', variant: 'destructive' });
      return null;
    }

    const { data: urlData } = supabase.storage
      .from('blog-images')
      .getPublicUrl(fileName);

    return urlData.publicUrl;
  };

  const handleTranslate = async () => {
    if (!postForm.title_ar || !postForm.content_ar) {
      toast({ title: 'خطأ', description: 'الرجاء إدخال العنوان والمحتوى بالعربية أولاً', variant: 'destructive' });
      return;
    }

    setIsTranslating(true);
    try {
      const { data, error } = await supabase.functions.invoke('translate-blog', {
        body: {
          title: postForm.title_ar,
          description: postForm.description_ar,
          content: postForm.content_ar,
          sourceLang: 'ar',
        },
      });

      if (error) throw error;

      const translations = data.translations;
      
      setPostForm(prev => ({
        ...prev,
        title_en: translations.en?.title || prev.title_en,
        title_ms: translations.ms?.title || prev.title_ms,
        title_ur: translations.ur?.title || prev.title_ur,
        title_id: translations.id?.title || prev.title_id,
        title_fr: translations.fr?.title || prev.title_fr,
        description_en: translations.en?.description || prev.description_en,
        description_ms: translations.ms?.description || prev.description_ms,
        description_ur: translations.ur?.description || prev.description_ur,
        description_id: translations.id?.description || prev.description_id,
        description_fr: translations.fr?.description || prev.description_fr,
        content_en: translations.en?.content || prev.content_en,
        content_ms: translations.ms?.content || prev.content_ms,
        content_ur: translations.ur?.content || prev.content_ur,
        content_id: translations.id?.content || prev.content_id,
        content_fr: translations.fr?.content || prev.content_fr,
      }));

      toast({ title: 'نجاح', description: 'تمت الترجمة التلقائية بنجاح' });
    } catch (error) {
      console.error('Translation error:', error);
      toast({ title: 'خطأ', description: 'فشل في الترجمة التلقائية', variant: 'destructive' });
    } finally {
      setIsTranslating(false);
    }
  };

  const handleSavePost = async () => {
    if (!postForm.title_ar || !postForm.content_ar) {
      toast({ title: 'خطأ', description: 'العنوان والمحتوى بالعربية مطلوبان', variant: 'destructive' });
      return;
    }

    setIsLoading(true);

    // Upload image if new one selected
    const imageUrl = await uploadImage();

    const postData = {
      title_ar: postForm.title_ar,
      title_en: postForm.title_en || null,
      title_ms: postForm.title_ms || null,
      title_ur: postForm.title_ur || null,
      title_id: postForm.title_id || null,
      title_fr: postForm.title_fr || null,
      description_ar: postForm.description_ar || null,
      description_en: postForm.description_en || null,
      description_ms: postForm.description_ms || null,
      description_ur: postForm.description_ur || null,
      description_id: postForm.description_id || null,
      description_fr: postForm.description_fr || null,
      content_ar: postForm.content_ar,
      content_en: postForm.content_en || null,
      content_ms: postForm.content_ms || null,
      content_ur: postForm.content_ur || null,
      content_id: postForm.content_id || null,
      content_fr: postForm.content_fr || null,
      image_url: imageUrl,
      is_published: postForm.is_published,
    };

    if (postForm.id) {
      const { error } = await supabase
        .from('blog_posts')
        .update(postData)
        .eq('id', postForm.id);

      if (error) {
        toast({ title: 'خطأ', description: 'فشل في تحديث المدونة', variant: 'destructive' });
      } else {
        toast({ title: 'نجاح', description: 'تم تحديث المدونة بنجاح' });
        fetchPosts();
        setShowPostDialog(false);
      }
    } else {
      const { error } = await supabase
        .from('blog_posts')
        .insert(postData);

      if (error) {
        toast({ title: 'خطأ', description: 'فشل في إنشاء المدونة', variant: 'destructive' });
      } else {
        toast({ title: 'نجاح', description: 'تم إنشاء المدونة بنجاح' });
        fetchPosts();
        setShowPostDialog(false);
      }
    }
    setIsLoading(false);
  };

  const handleDelete = async () => {
    if (!deleteTargetId) return;
    setIsLoading(true);

    const { error } = await supabase
      .from('blog_posts')
      .delete()
      .eq('id', deleteTargetId);

    if (error) {
      toast({ title: 'خطأ', description: 'فشل في حذف المدونة', variant: 'destructive' });
    } else {
      toast({ title: 'نجاح', description: 'تم حذف المدونة بنجاح' });
      fetchPosts();
    }
    setShowDeleteDialog(false);
    setDeleteTargetId(null);
    setIsLoading(false);
  };

  const togglePublish = async (postId: string, currentStatus: boolean) => {
    const { error } = await supabase
      .from('blog_posts')
      .update({ is_published: !currentStatus })
      .eq('id', postId);

    if (error) {
      toast({ title: 'خطأ', description: 'فشل في تغيير حالة النشر', variant: 'destructive' });
    } else {
      fetchPosts();
      toast({ title: 'نجاح', description: currentStatus ? 'تم إلغاء نشر المدونة' : 'تم نشر المدونة' });
    }
  };

  const openNewPost = () => {
    setPostForm({
      id: '',
      title_ar: '', title_en: '', title_ms: '', title_ur: '', title_id: '', title_fr: '',
      description_ar: '', description_en: '', description_ms: '', description_ur: '', description_id: '', description_fr: '',
      content_ar: '', content_en: '', content_ms: '', content_ur: '', content_id: '', content_fr: '',
      image_url: '',
      is_published: false,
    });
    setImageFile(null);
    setImagePreview(null);
    setActiveTab('ar');
    setShowPostDialog(true);
  };

  const openEditPost = (post: BlogPost) => {
    setPostForm({
      id: post.id,
      title_ar: post.title_ar, title_en: post.title_en || '', title_ms: post.title_ms || '',
      title_ur: post.title_ur || '', title_id: post.title_id || '', title_fr: post.title_fr || '',
      description_ar: post.description_ar || '', description_en: post.description_en || '',
      description_ms: post.description_ms || '', description_ur: post.description_ur || '',
      description_id: post.description_id || '', description_fr: post.description_fr || '',
      content_ar: post.content_ar, content_en: post.content_en || '',
      content_ms: post.content_ms || '', content_ur: post.content_ur || '',
      content_id: post.content_id || '', content_fr: post.content_fr || '',
      image_url: post.image_url || '',
      is_published: post.is_published,
    });
    setImageFile(null);
    setImagePreview(post.image_url);
    setActiveTab('ar');
    setShowPostDialog(true);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-xl bg-accent/20">
            <BookOpen className="h-6 w-6 text-accent" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-white">إدارة المدونة</h2>
            <p className="text-white/50">{posts.length} مدونة</p>
          </div>
        </div>
        <Button onClick={openNewPost} variant="gold" className="rounded-xl">
          <Plus className="ml-2 h-5 w-5" />
          مدونة جديدة
        </Button>
      </div>

      {/* Posts List */}
      <div className="grid gap-4">
        {isLoading && posts.length === 0 ? (
          <div className="flex justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-accent" />
          </div>
        ) : posts.length === 0 ? (
          <div className="text-center py-12 glass-purple rounded-2xl">
            <BookOpen className="h-12 w-12 text-white/30 mx-auto mb-3" />
            <p className="text-white/50">لا توجد مدونات بعد</p>
          </div>
        ) : (
          posts.map((post) => (
            <motion.div
              key={post.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="glass-purple rounded-2xl p-6 flex flex-col md:flex-row items-start md:items-center gap-4"
            >
              {/* Image */}
              <div className="w-full md:w-24 h-24 rounded-xl bg-white/5 overflow-hidden flex-shrink-0">
                {post.image_url ? (
                  <img src={post.image_url} alt={post.title_ar} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <Image className="h-8 w-8 text-white/20" />
                  </div>
                )}
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="font-bold text-white truncate">{post.title_ar}</h3>
                  <Badge className={post.is_published ? 'bg-emerald-500/20 text-emerald-400' : 'bg-rose-500/20 text-rose-400'}>
                    {post.is_published ? 'منشور' : 'مسودة'}
                  </Badge>
                </div>
                <p className="text-white/50 text-sm line-clamp-2">{post.description_ar || 'بدون وصف'}</p>
                <p className="text-white/30 text-xs mt-1">
                  {new Date(post.created_at).toLocaleDateString('ar-SA')}
                </p>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-2 flex-shrink-0">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => togglePublish(post.id, post.is_published)}
                  className="text-white/70 hover:text-white hover:bg-white/10"
                >
                  {post.is_published ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => openEditPost(post)}
                  className="text-white/70 hover:text-accent hover:bg-accent/10"
                >
                  <Edit className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => {
                    setDeleteTargetId(post.id);
                    setShowDeleteDialog(true);
                  }}
                  className="text-rose-400 hover:text-rose-300 hover:bg-rose-500/10"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </motion.div>
          ))
        )}
      </div>

      {/* Post Dialog */}
      <Dialog open={showPostDialog} onOpenChange={setShowPostDialog}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto glass-purple border-white/20">
          <DialogHeader>
            <DialogTitle className="text-2xl text-white">
              {postForm.id ? 'تعديل المدونة' : 'مدونة جديدة'}
            </DialogTitle>
            <DialogDescription className="text-white/60">
              أدخل محتوى المدونة بالعربية ثم استخدم الترجمة التلقائية
            </DialogDescription>
          </DialogHeader>

          {/* Image Upload */}
          <div className="space-y-3">
            <Label className="text-white">صورة المدونة</Label>
            <div className="flex items-center gap-4">
              <div className="w-32 h-20 rounded-xl bg-white/5 overflow-hidden flex-shrink-0">
                {imagePreview ? (
                  <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <Image className="h-8 w-8 text-white/20" />
                  </div>
                )}
              </div>
              <div>
                <Input
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="hidden"
                  id="blog-image"
                />
                <Label
                  htmlFor="blog-image"
                  className="cursor-pointer inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white/10 text-white hover:bg-white/20 transition-colors"
                >
                  <Upload className="h-4 w-4" />
                  اختيار صورة
                </Label>
              </div>
            </div>
          </div>

          {/* Translate Button */}
          <Button
            onClick={handleTranslate}
            disabled={isTranslating || !postForm.title_ar || !postForm.content_ar}
            className="w-full bg-accent/20 text-accent hover:bg-accent/30 border border-accent/30"
          >
            {isTranslating ? (
              <>
                <Loader2 className="ml-2 h-4 w-4 animate-spin" />
                جاري الترجمة...
              </>
            ) : (
              <>
                <Languages className="ml-2 h-4 w-4" />
                ترجمة تلقائية لجميع اللغات
              </>
            )}
          </Button>

          {/* Language Tabs */}
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="bg-white/10 p-1 flex-wrap h-auto">
              {LANGUAGES.map((lang) => (
                <TabsTrigger
                  key={lang.code}
                  value={lang.code}
                  className="gap-1 data-[state=active]:bg-accent data-[state=active]:text-accent-foreground"
                >
                  <span>{lang.flag}</span>
                  <span className="hidden sm:inline">{lang.name}</span>
                </TabsTrigger>
              ))}
            </TabsList>

            {LANGUAGES.map((lang) => (
              <TabsContent key={lang.code} value={lang.code} className="space-y-4 mt-4">
                <div>
                  <Label className="text-white">العنوان ({lang.name})</Label>
                  <Input
                    value={(postForm as any)[`title_${lang.code}`] || ''}
                    onChange={(e) => setPostForm({ ...postForm, [`title_${lang.code}`]: e.target.value })}
                    placeholder={`العنوان بـ${lang.name}`}
                    className="bg-white/10 border-white/20 text-white mt-2"
                    dir={lang.code === 'ar' || lang.code === 'ur' ? 'rtl' : 'ltr'}
                  />
                </div>
                <div>
                  <Label className="text-white">الوصف ({lang.name})</Label>
                  <Textarea
                    value={(postForm as any)[`description_${lang.code}`] || ''}
                    onChange={(e) => setPostForm({ ...postForm, [`description_${lang.code}`]: e.target.value })}
                    placeholder={`الوصف بـ${lang.name}`}
                    className="bg-white/10 border-white/20 text-white mt-2 min-h-[80px]"
                    dir={lang.code === 'ar' || lang.code === 'ur' ? 'rtl' : 'ltr'}
                  />
                </div>
                <div>
                  <Label className="text-white">المحتوى ({lang.name})</Label>
                  <Textarea
                    value={(postForm as any)[`content_${lang.code}`] || ''}
                    onChange={(e) => setPostForm({ ...postForm, [`content_${lang.code}`]: e.target.value })}
                    placeholder={`المحتوى بـ${lang.name}`}
                    className="bg-white/10 border-white/20 text-white mt-2 min-h-[200px]"
                    dir={lang.code === 'ar' || lang.code === 'ur' ? 'rtl' : 'ltr'}
                  />
                </div>
              </TabsContent>
            ))}
          </Tabs>

          {/* Publish Switch */}
          <div className="flex items-center justify-between py-4 border-t border-white/10">
            <div>
              <Label className="text-white">نشر المدونة</Label>
              <p className="text-white/50 text-sm">المدونة المنشورة ستكون مرئية للجميع</p>
            </div>
            <Switch
              checked={postForm.is_published}
              onCheckedChange={(checked) => setPostForm({ ...postForm, is_published: checked })}
            />
          </div>

          <DialogFooter className="gap-2">
            <Button variant="ghost" onClick={() => setShowPostDialog(false)} className="text-white">
              إلغاء
            </Button>
            <Button onClick={handleSavePost} disabled={isLoading} variant="gold">
              {isLoading ? <Loader2 className="ml-2 h-4 w-4 animate-spin" /> : <Save className="ml-2 h-4 w-4" />}
              {postForm.id ? 'تحديث' : 'إنشاء'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Dialog */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent className="glass-purple border-white/20">
          <DialogHeader>
            <DialogTitle className="text-white">تأكيد الحذف</DialogTitle>
            <DialogDescription className="text-white/60">
              هل أنت متأكد من حذف هذه المدونة؟ لا يمكن التراجع عن هذا الإجراء.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2">
            <Button variant="ghost" onClick={() => setShowDeleteDialog(false)} className="text-white">
              إلغاء
            </Button>
            <Button onClick={handleDelete} disabled={isLoading} variant="destructive">
              {isLoading ? <Loader2 className="ml-2 h-4 w-4 animate-spin" /> : <Trash2 className="ml-2 h-4 w-4" />}
              حذف
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default BlogManagement;
