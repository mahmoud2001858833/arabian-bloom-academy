import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Users, BookOpen, DollarSign, TrendingUp, Plus, Video, 
  FileText, Edit, Trash2, Eye, EyeOff, GripVertical, X,
  Save, Upload, ChevronDown, ChevronUp, Layers
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import Navbar from '@/components/layout/Navbar';

interface Course {
  id: string;
  title: string;
  description: string;
  thumbnail_url: string;
  price: number;
  is_free: boolean;
  level: string;
  is_published: boolean;
  created_at: string;
}

interface Lesson {
  id: string;
  course_id: string;
  title: string;
  description: string;
  video_url: string;
  duration_minutes: number;
  order_index: number;
}

const Admin = () => {
  const { user, loading, isAdmin } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  // State
  const [courses, setCourses] = useState<Course[]>([]);
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  
  // Dialog states
  const [showCourseDialog, setShowCourseDialog] = useState(false);
  const [showLessonDialog, setShowLessonDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<{ type: 'course' | 'lesson'; id: string } | null>(null);
  
  // Form states
  const [courseForm, setCourseForm] = useState({
    id: '',
    title: '',
    description: '',
    thumbnail_url: '',
    price: 0,
    is_free: true,
    level: 'beginner',
    is_published: false,
  });
  
  const [lessonForm, setLessonForm] = useState({
    id: '',
    course_id: '',
    title: '',
    description: '',
    video_url: '',
    duration_minutes: 0,
    order_index: 0,
  });

  useEffect(() => {
    if (!loading && !user) {
      navigate('/auth');
    }
    if (!loading && user && !isAdmin) {
      navigate('/dashboard');
    }
  }, [user, loading, isAdmin, navigate]);

  useEffect(() => {
    if (isAdmin) {
      fetchCourses();
    }
  }, [isAdmin]);

  const fetchCourses = async () => {
    setIsLoading(true);
    const { data, error } = await supabase
      .from('courses')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      toast({ title: 'خطأ', description: 'فشل في تحميل الكورسات', variant: 'destructive' });
    } else {
      setCourses(data || []);
    }
    setIsLoading(false);
  };

  const fetchLessons = async (courseId: string) => {
    const { data, error } = await supabase
      .from('lessons')
      .select('*')
      .eq('course_id', courseId)
      .order('order_index');

    if (error) {
      toast({ title: 'خطأ', description: 'فشل في تحميل الدروس', variant: 'destructive' });
    } else {
      setLessons(data || []);
    }
  };

  const handleSaveCourse = async () => {
    setIsLoading(true);
    
    if (courseForm.id) {
      // Update existing course
      const { error } = await supabase
        .from('courses')
        .update({
          title: courseForm.title,
          description: courseForm.description,
          thumbnail_url: courseForm.thumbnail_url,
          price: courseForm.is_free ? 0 : courseForm.price,
          is_free: courseForm.is_free,
          level: courseForm.level,
          is_published: courseForm.is_published,
        })
        .eq('id', courseForm.id);

      if (error) {
        toast({ title: 'خطأ', description: 'فشل في تحديث الكورس', variant: 'destructive' });
      } else {
        toast({ title: 'تم بنجاح', description: 'تم تحديث الكورس' });
        fetchCourses();
        setShowCourseDialog(false);
      }
    } else {
      // Create new course
      const { error } = await supabase
        .from('courses')
        .insert({
          title: courseForm.title,
          description: courseForm.description,
          thumbnail_url: courseForm.thumbnail_url,
          price: courseForm.is_free ? 0 : courseForm.price,
          is_free: courseForm.is_free,
          level: courseForm.level,
          is_published: courseForm.is_published,
        });

      if (error) {
        toast({ title: 'خطأ', description: 'فشل في إنشاء الكورس', variant: 'destructive' });
      } else {
        toast({ title: 'تم بنجاح', description: 'تم إنشاء الكورس الجديد' });
        fetchCourses();
        setShowCourseDialog(false);
      }
    }
    setIsLoading(false);
  };

  const handleSaveLesson = async () => {
    if (!selectedCourse) return;
    setIsLoading(true);
    
    if (lessonForm.id) {
      // Update existing lesson
      const { error } = await supabase
        .from('lessons')
        .update({
          title: lessonForm.title,
          description: lessonForm.description,
          video_url: lessonForm.video_url,
          duration_minutes: lessonForm.duration_minutes,
          order_index: lessonForm.order_index,
        })
        .eq('id', lessonForm.id);

      if (error) {
        toast({ title: 'خطأ', description: 'فشل في تحديث الدرس', variant: 'destructive' });
      } else {
        toast({ title: 'تم بنجاح', description: 'تم تحديث الدرس' });
        fetchLessons(selectedCourse.id);
        setShowLessonDialog(false);
      }
    } else {
      // Create new lesson
      const { error } = await supabase
        .from('lessons')
        .insert({
          course_id: selectedCourse.id,
          title: lessonForm.title,
          description: lessonForm.description,
          video_url: lessonForm.video_url,
          duration_minutes: lessonForm.duration_minutes,
          order_index: lessons.length,
        });

      if (error) {
        toast({ title: 'خطأ', description: 'فشل في إنشاء الدرس', variant: 'destructive' });
      } else {
        toast({ title: 'تم بنجاح', description: 'تم إنشاء الدرس الجديد' });
        fetchLessons(selectedCourse.id);
        setShowLessonDialog(false);
      }
    }
    setIsLoading(false);
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setIsLoading(true);
    
    const table = deleteTarget.type === 'course' ? 'courses' : 'lessons';
    const { error } = await supabase
      .from(table)
      .delete()
      .eq('id', deleteTarget.id);

    if (error) {
      toast({ title: 'خطأ', description: 'فشل في الحذف', variant: 'destructive' });
    } else {
      toast({ title: 'تم بنجاح', description: 'تم الحذف بنجاح' });
      if (deleteTarget.type === 'course') {
        fetchCourses();
        if (selectedCourse?.id === deleteTarget.id) {
          setSelectedCourse(null);
          setLessons([]);
        }
      } else if (selectedCourse) {
        fetchLessons(selectedCourse.id);
      }
    }
    setShowDeleteDialog(false);
    setDeleteTarget(null);
    setIsLoading(false);
  };

  const togglePublish = async (courseId: string, currentStatus: boolean) => {
    const { error } = await supabase
      .from('courses')
      .update({ is_published: !currentStatus })
      .eq('id', courseId);

    if (error) {
      toast({ title: 'خطأ', description: 'فشل في تغيير حالة النشر', variant: 'destructive' });
    } else {
      fetchCourses();
      toast({ 
        title: 'تم بنجاح', 
        description: currentStatus ? 'تم إلغاء نشر الكورس' : 'تم نشر الكورس' 
      });
    }
  };

  const openEditCourse = (course: Course) => {
    setCourseForm({
      id: course.id,
      title: course.title,
      description: course.description || '',
      thumbnail_url: course.thumbnail_url || '',
      price: course.price,
      is_free: course.is_free,
      level: course.level,
      is_published: course.is_published,
    });
    setShowCourseDialog(true);
  };

  const openNewCourse = () => {
    setCourseForm({
      id: '',
      title: '',
      description: '',
      thumbnail_url: '',
      price: 0,
      is_free: true,
      level: 'beginner',
      is_published: false,
    });
    setShowCourseDialog(true);
  };

  const openEditLesson = (lesson: Lesson) => {
    setLessonForm({
      id: lesson.id,
      course_id: lesson.course_id,
      title: lesson.title,
      description: lesson.description || '',
      video_url: lesson.video_url || '',
      duration_minutes: lesson.duration_minutes,
      order_index: lesson.order_index,
    });
    setShowLessonDialog(true);
  };

  const openNewLesson = () => {
    if (!selectedCourse) return;
    setLessonForm({
      id: '',
      course_id: selectedCourse.id,
      title: '',
      description: '',
      video_url: '',
      duration_minutes: 0,
      order_index: lessons.length,
    });
    setShowLessonDialog(true);
  };

  const selectCourse = (course: Course) => {
    setSelectedCourse(course);
    fetchLessons(course.id);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-purple-soft">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary border-t-transparent"></div>
      </div>
    );
  }

  const stats = [
    { icon: Users, label: 'إجمالي الطلاب', value: '1,234', change: '+12%', color: 'from-primary to-purple-600' },
    { icon: BookOpen, label: 'الكورسات', value: courses.length.toString(), change: '', color: 'from-purple-500 to-primary' },
    { icon: DollarSign, label: 'الإيرادات', value: '12,450 ر.س', change: '+8%', color: 'from-gold to-gold-dark' },
    { icon: TrendingUp, label: 'التسجيلات الجديدة', value: '89', change: '+15%', color: 'from-primary to-purple-700' },
  ];

  const levelLabels = {
    beginner: 'مبتدئ',
    intermediate: 'متوسط',
    advanced: 'متقدم',
  };

  return (
    <div className="min-h-screen bg-gradient-purple-soft">
      <Navbar />
      <main className="pt-24 pb-12">
        <div className="container mx-auto px-4">
          {/* Header */}
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-8 gap-4">
            <div>
              <h1 className="text-4xl font-black">
                لوحة تحكم <span className="text-gradient">المسؤول</span>
              </h1>
              <p className="text-muted-foreground mt-2">إدارة المنصة والكورسات والمستخدمين</p>
            </div>
            <Button onClick={openNewCourse} className="bg-gradient-primary hover:opacity-90 shadow-purple rounded-xl">
              <Plus className="ml-2 h-5 w-5" />
              كورس جديد
            </Button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            {stats.map((stat, i) => (
              <Card key={i} className="border-0 shadow-lg hover-lift">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground font-medium">{stat.label}</p>
                      <p className="text-3xl font-black mt-1">{stat.value}</p>
                      {stat.change && (
                        <p className="text-xs text-emerald-600 font-semibold mt-1">{stat.change}</p>
                      )}
                    </div>
                    <div className={`p-4 rounded-2xl bg-gradient-to-br ${stat.color} shadow-lg`}>
                      <stat.icon className="h-6 w-6 text-white" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Main Content */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Courses List */}
            <Card className="lg:col-span-1 border-0 shadow-lg">
              <CardHeader className="border-b bg-primary/5">
                <CardTitle className="flex items-center gap-2">
                  <BookOpen className="h-5 w-5 text-primary" />
                  الكورسات
                </CardTitle>
                <CardDescription>{courses.length} كورس</CardDescription>
              </CardHeader>
              <CardContent className="p-0 max-h-[600px] overflow-y-auto">
                {courses.length === 0 ? (
                  <div className="p-8 text-center text-muted-foreground">
                    <BookOpen className="h-12 w-12 mx-auto mb-3 opacity-30" />
                    <p>لا توجد كورسات بعد</p>
                    <Button onClick={openNewCourse} variant="link" className="mt-2">
                      أضف كورس جديد
                    </Button>
                  </div>
                ) : (
                  <div className="divide-y">
                    {courses.map((course) => (
                      <div
                        key={course.id}
                        onClick={() => selectCourse(course)}
                        className={`p-4 cursor-pointer hover:bg-primary/5 transition-colors ${
                          selectedCourse?.id === course.id ? 'bg-primary/10 border-r-4 border-primary' : ''
                        }`}
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex-1 min-w-0">
                            <h4 className="font-bold truncate">{course.title}</h4>
                            <div className="flex items-center gap-2 mt-2">
                              <Badge variant={course.is_published ? 'default' : 'secondary'} className="text-xs">
                                {course.is_published ? 'منشور' : 'مسودة'}
                              </Badge>
                              <Badge variant="outline" className="text-xs">
                                {levelLabels[course.level as keyof typeof levelLabels]}
                              </Badge>
                              {course.is_free ? (
                                <Badge className="bg-gold/10 text-gold-dark text-xs">مجاني</Badge>
                              ) : (
                                <Badge variant="outline" className="text-xs">{course.price} ر.س</Badge>
                              )}
                            </div>
                          </div>
                          <div className="flex items-center gap-1">
                            <Button
                              size="icon"
                              variant="ghost"
                              className="h-8 w-8"
                              onClick={(e) => { e.stopPropagation(); togglePublish(course.id, course.is_published); }}
                            >
                              {course.is_published ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                            </Button>
                            <Button
                              size="icon"
                              variant="ghost"
                              className="h-8 w-8"
                              onClick={(e) => { e.stopPropagation(); openEditCourse(course); }}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              size="icon"
                              variant="ghost"
                              className="h-8 w-8 text-destructive"
                              onClick={(e) => { 
                                e.stopPropagation(); 
                                setDeleteTarget({ type: 'course', id: course.id });
                                setShowDeleteDialog(true);
                              }}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Lessons Panel */}
            <Card className="lg:col-span-2 border-0 shadow-lg">
              <CardHeader className="border-b bg-primary/5">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <Video className="h-5 w-5 text-primary" />
                      {selectedCourse ? `دروس: ${selectedCourse.title}` : 'الدروس'}
                    </CardTitle>
                    <CardDescription>
                      {selectedCourse ? `${lessons.length} درس` : 'اختر كورس لعرض دروسه'}
                    </CardDescription>
                  </div>
                  {selectedCourse && (
                    <Button onClick={openNewLesson} className="bg-gradient-primary rounded-xl">
                      <Plus className="ml-2 h-4 w-4" />
                      درس جديد
                    </Button>
                  )}
                </div>
              </CardHeader>
              <CardContent className="p-0">
                {!selectedCourse ? (
                  <div className="p-12 text-center text-muted-foreground">
                    <Layers className="h-16 w-16 mx-auto mb-4 opacity-20" />
                    <p className="text-lg">اختر كورس من القائمة لعرض وإدارة دروسه</p>
                  </div>
                ) : lessons.length === 0 ? (
                  <div className="p-12 text-center text-muted-foreground">
                    <Video className="h-16 w-16 mx-auto mb-4 opacity-20" />
                    <p className="text-lg mb-4">لا توجد دروس في هذا الكورس</p>
                    <Button onClick={openNewLesson} className="bg-gradient-primary">
                      <Plus className="ml-2 h-4 w-4" />
                      أضف أول درس
                    </Button>
                  </div>
                ) : (
                  <div className="divide-y">
                    {lessons.map((lesson, index) => (
                      <div key={lesson.id} className="p-4 hover:bg-primary/5 transition-colors">
                        <div className="flex items-center gap-4">
                          <div className="flex items-center justify-center w-10 h-10 rounded-full bg-primary/10 text-primary font-bold">
                            {index + 1}
                          </div>
                          <div className="flex-1 min-w-0">
                            <h4 className="font-bold">{lesson.title}</h4>
                            <p className="text-sm text-muted-foreground truncate">{lesson.description}</p>
                            <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
                              {lesson.duration_minutes > 0 && (
                                <span>{lesson.duration_minutes} دقيقة</span>
                              )}
                              {lesson.video_url && (
                                <Badge variant="outline" className="text-xs">فيديو مرفق</Badge>
                              )}
                            </div>
                          </div>
                          <div className="flex items-center gap-1">
                            <Button
                              size="icon"
                              variant="ghost"
                              className="h-8 w-8"
                              onClick={() => openEditLesson(lesson)}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              size="icon"
                              variant="ghost"
                              className="h-8 w-8 text-destructive"
                              onClick={() => {
                                setDeleteTarget({ type: 'lesson', id: lesson.id });
                                setShowDeleteDialog(true);
                              }}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </main>

      {/* Course Dialog */}
      <Dialog open={showCourseDialog} onOpenChange={setShowCourseDialog}>
        <DialogContent className="max-w-2xl bg-white">
          <DialogHeader>
            <DialogTitle className="text-2xl">
              {courseForm.id ? 'تعديل الكورس' : 'كورس جديد'}
            </DialogTitle>
            <DialogDescription>
              {courseForm.id ? 'قم بتعديل بيانات الكورس' : 'أدخل بيانات الكورس الجديد'}
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid gap-6 py-4">
            <div className="grid gap-2">
              <Label htmlFor="title">عنوان الكورس *</Label>
              <Input
                id="title"
                value={courseForm.title}
                onChange={(e) => setCourseForm({ ...courseForm, title: e.target.value })}
                placeholder="أدخل عنوان الكورس"
                className="h-12"
              />
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="description">وصف الكورس</Label>
              <Textarea
                id="description"
                value={courseForm.description}
                onChange={(e) => setCourseForm({ ...courseForm, description: e.target.value })}
                placeholder="أدخل وصف الكورس"
                rows={4}
              />
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="thumbnail">رابط صورة الغلاف</Label>
              <Input
                id="thumbnail"
                value={courseForm.thumbnail_url}
                onChange={(e) => setCourseForm({ ...courseForm, thumbnail_url: e.target.value })}
                placeholder="https://example.com/image.jpg"
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label>المستوى</Label>
                <Select value={courseForm.level} onValueChange={(v) => setCourseForm({ ...courseForm, level: v })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-white">
                    <SelectItem value="beginner">مبتدئ</SelectItem>
                    <SelectItem value="intermediate">متوسط</SelectItem>
                    <SelectItem value="advanced">متقدم</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="grid gap-2">
                <Label>السعر (ر.س)</Label>
                <Input
                  type="number"
                  value={courseForm.price}
                  onChange={(e) => setCourseForm({ ...courseForm, price: Number(e.target.value) })}
                  disabled={courseForm.is_free}
                />
              </div>
            </div>
            
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <Switch
                  checked={courseForm.is_free}
                  onCheckedChange={(v) => setCourseForm({ ...courseForm, is_free: v, price: v ? 0 : courseForm.price })}
                />
                <Label>كورس مجاني</Label>
              </div>
              
              <div className="flex items-center gap-3">
                <Switch
                  checked={courseForm.is_published}
                  onCheckedChange={(v) => setCourseForm({ ...courseForm, is_published: v })}
                />
                <Label>نشر الكورس</Label>
              </div>
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCourseDialog(false)}>
              إلغاء
            </Button>
            <Button onClick={handleSaveCourse} disabled={!courseForm.title || isLoading} className="bg-gradient-primary">
              <Save className="ml-2 h-4 w-4" />
              {isLoading ? 'جاري الحفظ...' : 'حفظ'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Lesson Dialog */}
      <Dialog open={showLessonDialog} onOpenChange={setShowLessonDialog}>
        <DialogContent className="max-w-xl bg-white">
          <DialogHeader>
            <DialogTitle className="text-2xl">
              {lessonForm.id ? 'تعديل الدرس' : 'درس جديد'}
            </DialogTitle>
            <DialogDescription>
              {lessonForm.id ? 'قم بتعديل بيانات الدرس' : 'أدخل بيانات الدرس الجديد'}
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid gap-6 py-4">
            <div className="grid gap-2">
              <Label htmlFor="lesson-title">عنوان الدرس *</Label>
              <Input
                id="lesson-title"
                value={lessonForm.title}
                onChange={(e) => setLessonForm({ ...lessonForm, title: e.target.value })}
                placeholder="أدخل عنوان الدرس"
                className="h-12"
              />
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="lesson-description">وصف الدرس</Label>
              <Textarea
                id="lesson-description"
                value={lessonForm.description}
                onChange={(e) => setLessonForm({ ...lessonForm, description: e.target.value })}
                placeholder="أدخل وصف الدرس"
                rows={3}
              />
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="video-url">رابط الفيديو (YouTube/Vimeo)</Label>
              <Input
                id="video-url"
                value={lessonForm.video_url}
                onChange={(e) => setLessonForm({ ...lessonForm, video_url: e.target.value })}
                placeholder="https://www.youtube.com/watch?v=..."
              />
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="duration">مدة الدرس (بالدقائق)</Label>
              <Input
                id="duration"
                type="number"
                value={lessonForm.duration_minutes}
                onChange={(e) => setLessonForm({ ...lessonForm, duration_minutes: Number(e.target.value) })}
              />
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowLessonDialog(false)}>
              إلغاء
            </Button>
            <Button onClick={handleSaveLesson} disabled={!lessonForm.title || isLoading} className="bg-gradient-primary">
              <Save className="ml-2 h-4 w-4" />
              {isLoading ? 'جاري الحفظ...' : 'حفظ'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent className="max-w-md bg-white">
          <DialogHeader>
            <DialogTitle className="text-2xl text-destructive">تأكيد الحذف</DialogTitle>
            <DialogDescription>
              هل أنت متأكد من حذف {deleteTarget?.type === 'course' ? 'هذا الكورس' : 'هذا الدرس'}؟ لا يمكن التراجع عن هذا الإجراء.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDeleteDialog(false)}>
              إلغاء
            </Button>
            <Button variant="destructive" onClick={handleDelete} disabled={isLoading}>
              <Trash2 className="ml-2 h-4 w-4" />
              {isLoading ? 'جاري الحذف...' : 'حذف'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Admin;
