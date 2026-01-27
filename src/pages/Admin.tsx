import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Users, BookOpen, DollarSign, TrendingUp, Plus, Video, 
  Edit, Trash2, Eye, EyeOff, Save, Layers, Crown, Sparkles,
  Calendar, CheckCircle, BarChart3
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Progress } from '@/components/ui/progress';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import Navbar from '@/components/layout/Navbar';
import DualVideoUploader from '@/components/dashboard/DualVideoUploader';
import VideoPlayer from '@/components/dashboard/VideoPlayer';

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
    is_published: true,
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

  // Stats state
  const [totalStudents, setTotalStudents] = useState(0);
  const [totalRevenue, setTotalRevenue] = useState(0);
  const [newEnrollments, setNewEnrollments] = useState(0);
  const [recentEnrollments, setRecentEnrollments] = useState<{course_title: string; date: string}[]>([]);
  const [totalLessons, setTotalLessons] = useState(0);
  const [publishedCourses, setPublishedCourses] = useState(0);

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
      fetchStats();
    }
  }, [isAdmin]);

  const fetchStats = async () => {
    try {
      // Get total unique students (from enrollments)
      const { data: enrollmentsData, error: enrollmentsError } = await supabase
        .from('enrollments')
        .select('user_id');
      
      if (!enrollmentsError && enrollmentsData) {
        const uniqueStudents = new Set(enrollmentsData.map(e => e.user_id));
        setTotalStudents(uniqueStudents.size);
      }

      // Get total revenue from completed purchases
      const { data: purchasesData, error: purchasesError } = await supabase
        .from('purchases')
        .select('amount')
        .eq('status', 'completed');
      
      if (!purchasesError && purchasesData) {
        const revenue = purchasesData.reduce((sum, p) => sum + (p.amount || 0), 0);
        setTotalRevenue(revenue);
      }

      // Get new enrollments in last 7 days
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
      
      const { data: recentEnrollments, error: recentError } = await supabase
        .from('enrollments')
        .select('id')
        .gte('enrolled_at', sevenDaysAgo.toISOString());
      
      if (!recentError && recentEnrollments) {
        setNewEnrollments(recentEnrollments.length);
      }

      // Get recent enrollments with course titles
      const { data: latestEnrollments } = await supabase
        .from('enrollments')
        .select('course_id, enrolled_at')
        .order('enrolled_at', { ascending: false })
        .limit(5);

      if (latestEnrollments) {
        const enrichedEnrollments = await Promise.all(
          latestEnrollments.map(async (enrollment) => {
            const { data: course } = await supabase
              .from('courses')
              .select('title')
              .eq('id', enrollment.course_id)
              .single();
            
            return {
              course_title: course?.title || 'كورس غير معروف',
              date: new Date(enrollment.enrolled_at).toLocaleDateString('ar-SA'),
            };
          })
        );
        setRecentEnrollments(enrichedEnrollments);
      }

      // Get total lessons count
      const { data: lessonsData } = await supabase
        .from('lessons')
        .select('id');
      
      setTotalLessons(lessonsData?.length || 0);
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  // Update published courses count when courses change
  useEffect(() => {
    const published = courses.filter(c => c.is_published).length;
    setPublishedCourses(published);
  }, [courses]);

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
      is_published: true,
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
      <div className="min-h-screen flex items-center justify-center bg-gradient-hero">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-accent border-t-transparent"></div>
      </div>
    );
  }

  const stats = [
    { icon: Users, label: 'إجمالي الطلاب', value: totalStudents.toString(), color: 'primary', subtitle: 'طالب مسجل' },
    { icon: BookOpen, label: 'الكورسات', value: courses.length.toString(), color: 'primary', subtitle: `${publishedCourses} منشور` },
    { icon: DollarSign, label: 'الإيرادات', value: `${totalRevenue}`, color: 'accent', subtitle: 'ريال سعودي' },
    { icon: TrendingUp, label: 'التسجيلات الجديدة', value: newEnrollments.toString(), color: 'primary', subtitle: 'آخر 7 أيام' },
  ];

  const quickStats = [
    { label: 'إجمالي الدروس', value: totalLessons, icon: Video },
    { label: 'الكورسات المنشورة', value: publishedCourses, icon: CheckCircle },
    { label: 'معدل التحويل', value: totalStudents > 0 ? `${Math.round((newEnrollments / totalStudents) * 100)}%` : '0%', icon: BarChart3 },
  ];

  const levelLabels = {
    beginner: 'مبتدئ',
    intermediate: 'متوسط',
    advanced: 'متقدم',
  };

  const levelColors = {
    beginner: 'bg-emerald-500/10 text-emerald-600 border-emerald-500/30',
    intermediate: 'bg-amber-500/10 text-amber-600 border-amber-500/30',
    advanced: 'bg-rose-500/10 text-rose-600 border-rose-500/30',
  };

  return (
    <div className="min-h-screen bg-gradient-hero">
      <Navbar />
      <main className="pt-28 pb-16">
        <div className="container mx-auto px-4">
          {/* Header */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="flex flex-col md:flex-row items-start md:items-center justify-between mb-10 gap-6"
          >
            <div className="flex items-center gap-4">
              <div className="p-4 rounded-2xl bg-accent/20 backdrop-blur-xl border border-accent/30 shadow-gold">
                <Crown className="h-8 w-8 text-accent" />
              </div>
              <div>
                <h1 className="text-4xl font-black text-white">
                  لوحة تحكم <span className="text-accent" style={{ textShadow: '0 0 20px hsl(var(--accent) / 0.5)' }}>المسؤول</span>
                </h1>
                <p className="text-white/60 mt-1">إدارة المنصة والكورسات والمستخدمين</p>
              </div>
            </div>
            <Button 
              onClick={openNewCourse} 
              variant="gold"
              className="rounded-xl text-lg px-6 py-6 shadow-gold hover:shadow-lg transition-all"
            >
              <Plus className="ml-2 h-5 w-5" />
              كورس جديد
            </Button>
          </motion.div>

          {/* Stats */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6"
          >
            {stats.map((stat, i) => (
              <motion.div 
                key={i} 
                className="glass-purple rounded-2xl p-6 hover-lift transition-all"
                whileHover={{ scale: 1.02 }}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-white/60 font-medium">{stat.label}</p>
                    <p className="text-3xl font-black text-white mt-2">{stat.value}</p>
                    <p className="text-xs text-white/40 mt-1">{stat.subtitle}</p>
                  </div>
                  <div className={`p-4 rounded-2xl ${stat.color === 'accent' ? 'bg-accent/20' : 'bg-white/10'} backdrop-blur`}>
                    <stat.icon className={`h-6 w-6 ${stat.color === 'accent' ? 'text-accent' : 'text-white'}`} />
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>

          {/* Quick Stats & Recent Activity */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.15 }}
            className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-10"
          >
            {/* Quick Stats */}
            <div className="glass-purple rounded-2xl p-6">
              <div className="flex items-center gap-2 mb-4">
                <BarChart3 className="h-5 w-5 text-accent" />
                <h3 className="font-bold text-white">إحصائيات سريعة</h3>
              </div>
              <div className="space-y-4">
                {quickStats.map((stat, i) => (
                  <div key={i} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-white/10">
                        <stat.icon className="h-4 w-4 text-white/70" />
                      </div>
                      <span className="text-white/70 text-sm">{stat.label}</span>
                    </div>
                    <span className="text-white font-bold">{stat.value}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Recent Enrollments */}
            <div className="lg:col-span-2 glass-purple rounded-2xl p-6">
              <div className="flex items-center gap-2 mb-4">
                <Calendar className="h-5 w-5 text-accent" />
                <h3 className="font-bold text-white">آخر التسجيلات</h3>
              </div>
              {recentEnrollments.length === 0 ? (
                <p className="text-white/50 text-sm">لا توجد تسجيلات حديثة</p>
              ) : (
                <div className="space-y-3">
                  {recentEnrollments.map((enrollment, i) => (
                    <div key={i} className="flex items-center justify-between py-2 border-b border-white/10 last:border-0">
                      <div className="flex items-center gap-3">
                        <div className="w-2 h-2 rounded-full bg-accent" />
                        <span className="text-white text-sm">{enrollment.course_title}</span>
                      </div>
                      <span className="text-white/50 text-xs">{enrollment.date}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </motion.div>

          {/* Main Content */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="grid grid-cols-1 lg:grid-cols-3 gap-6"
          >
            {/* Courses List */}
            <div className="lg:col-span-1 glass-purple rounded-2xl overflow-hidden">
              <div className="p-6 border-b border-white/10">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-xl bg-accent/20">
                    <BookOpen className="h-5 w-5 text-accent" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-white">الكورسات</h3>
                    <p className="text-sm text-white/50">{courses.length} كورس</p>
                  </div>
                </div>
              </div>
              <div className="max-h-[600px] overflow-y-auto">
                {courses.length === 0 ? (
                  <div className="p-8 text-center">
                    <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mx-auto mb-4">
                      <BookOpen className="h-8 w-8 text-white/30" />
                    </div>
                    <p className="text-white/50 mb-4">لا توجد كورسات بعد</p>
                    <Button onClick={openNewCourse} variant="gold-outline" className="rounded-xl">
                      أضف كورس جديد
                    </Button>
                  </div>
                ) : (
                  <div className="divide-y divide-white/10">
                    <AnimatePresence>
                      {courses.map((course) => (
                        <motion.div
                          key={course.id}
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                          onClick={() => selectCourse(course)}
                          className={`p-4 cursor-pointer transition-all ${
                            selectedCourse?.id === course.id 
                              ? 'bg-accent/20 border-r-4 border-accent' 
                              : 'hover:bg-white/5'
                          }`}
                        >
                          <div className="flex items-start justify-between gap-3">
                            <div className="flex-1 min-w-0">
                              <h4 className="font-bold text-white truncate">{course.title}</h4>
                              <div className="flex flex-wrap items-center gap-2 mt-2">
                                <Badge 
                                  className={`text-xs ${
                                    course.is_published 
                                      ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30' 
                                      : 'bg-white/10 text-white/60 border-white/20'
                                  }`}
                                >
                                  {course.is_published ? 'منشور' : 'مسودة'}
                                </Badge>
                                <Badge className={`text-xs border ${levelColors[course.level as keyof typeof levelColors]}`}>
                                  {levelLabels[course.level as keyof typeof levelLabels]}
                                </Badge>
                                {course.is_free ? (
                                  <Badge className="bg-accent/20 text-accent border-accent/30 text-xs">مجاني</Badge>
                                ) : (
                                  <Badge className="bg-white/10 text-white/70 border-white/20 text-xs">{course.price} ر.س</Badge>
                                )}
                              </div>
                            </div>
                            <div className="flex items-center gap-1">
                              <Button
                                size="icon"
                                variant="ghost"
                                className="h-8 w-8 text-white/60 hover:text-accent hover:bg-accent/10"
                                onClick={(e) => { e.stopPropagation(); togglePublish(course.id, course.is_published); }}
                              >
                                {course.is_published ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                              </Button>
                              <Button
                                size="icon"
                                variant="ghost"
                                className="h-8 w-8 text-white/60 hover:text-accent hover:bg-accent/10"
                                onClick={(e) => { e.stopPropagation(); openEditCourse(course); }}
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button
                                size="icon"
                                variant="ghost"
                                className="h-8 w-8 text-white/60 hover:text-destructive hover:bg-destructive/10"
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
                        </motion.div>
                      ))}
                    </AnimatePresence>
                  </div>
                )}
              </div>
            </div>

            {/* Lessons Panel */}
            <div className="lg:col-span-2 glass-purple rounded-2xl overflow-hidden">
              <div className="p-6 border-b border-white/10">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-xl bg-primary/20">
                      <Video className="h-5 w-5 text-primary-foreground" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-white">
                        {selectedCourse ? `دروس: ${selectedCourse.title}` : 'الدروس'}
                      </h3>
                      <p className="text-sm text-white/50">
                        {selectedCourse ? `${lessons.length} درس` : 'اختر كورس لعرض دروسه'}
                      </p>
                    </div>
                  </div>
                  {selectedCourse && (
                    <Button onClick={openNewLesson} variant="gold" className="rounded-xl">
                      <Plus className="ml-2 h-4 w-4" />
                      درس جديد
                    </Button>
                  )}
                </div>
              </div>
              <div className="min-h-[400px]">
                {!selectedCourse ? (
                  <div className="p-12 text-center">
                    <div className="w-20 h-20 rounded-full bg-white/5 flex items-center justify-center mx-auto mb-6">
                      <Layers className="h-10 w-10 text-white/20" />
                    </div>
                    <p className="text-lg text-white/50">اختر كورس من القائمة لعرض وإدارة دروسه</p>
                  </div>
                ) : lessons.length === 0 ? (
                  <div className="p-12 text-center">
                    <div className="w-20 h-20 rounded-full bg-white/5 flex items-center justify-center mx-auto mb-6">
                      <Video className="h-10 w-10 text-white/20" />
                    </div>
                    <p className="text-lg text-white/50 mb-6">لا توجد دروس في هذا الكورس</p>
                    <Button onClick={openNewLesson} variant="gold" className="rounded-xl">
                      <Plus className="ml-2 h-4 w-4" />
                      أضف أول درس
                    </Button>
                  </div>
                ) : (
                  <div className="divide-y divide-white/10">
                    <AnimatePresence>
                      {lessons.map((lesson, index) => (
                        <motion.div 
                          key={lesson.id} 
                          initial={{ opacity: 0, x: 20 }}
                          animate={{ opacity: 1, x: 0 }}
                          exit={{ opacity: 0, x: -20 }}
                          transition={{ delay: index * 0.05 }}
                          className="p-4 hover:bg-white/5 transition-colors"
                        >
                          <div className="flex items-center gap-4">
                            <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-accent/20 text-accent font-black text-lg">
                              {index + 1}
                            </div>
                            <div className="flex-1 min-w-0">
                              <h4 className="font-bold text-white">{lesson.title}</h4>
                              <p className="text-sm text-white/50 truncate">{lesson.description}</p>
                              <div className="flex items-center gap-3 mt-1 text-xs text-white/40">
                                {lesson.duration_minutes > 0 && (
                                  <span>{lesson.duration_minutes} دقيقة</span>
                                )}
                                {lesson.video_url && (
                                  <Badge className="bg-primary/20 text-primary-foreground border-0 text-xs">
                                    <Sparkles className="h-3 w-3 ml-1" />
                                    فيديو
                                  </Badge>
                                )}
                              </div>
                            </div>
                            <div className="flex items-center gap-1">
                              <Button
                                size="icon"
                                variant="ghost"
                                className="h-9 w-9 text-white/60 hover:text-accent hover:bg-accent/10"
                                onClick={() => openEditLesson(lesson)}
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button
                                size="icon"
                                variant="ghost"
                                className="h-9 w-9 text-white/60 hover:text-destructive hover:bg-destructive/10"
                                onClick={() => {
                                  setDeleteTarget({ type: 'lesson', id: lesson.id });
                                  setShowDeleteDialog(true);
                                }}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        </motion.div>
                      ))}
                    </AnimatePresence>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        </div>
      </main>

      {/* Course Dialog */}
      <Dialog open={showCourseDialog} onOpenChange={setShowCourseDialog}>
        <DialogContent className="max-w-2xl bg-card border-border">
          <DialogHeader>
            <DialogTitle className="text-2xl font-black">
              {courseForm.id ? 'تعديل الكورس' : 'كورس جديد'}
            </DialogTitle>
            <DialogDescription>
              {courseForm.id ? 'قم بتعديل بيانات الكورس' : 'أدخل بيانات الكورس الجديد'}
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid gap-6 py-4">
            <div className="grid gap-2">
              <Label htmlFor="title" className="font-bold">عنوان الكورس *</Label>
              <Input
                id="title"
                value={courseForm.title}
                onChange={(e) => setCourseForm({ ...courseForm, title: e.target.value })}
                placeholder="أدخل عنوان الكورس"
                className="h-12 rounded-xl border-border focus:ring-primary"
              />
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="description" className="font-bold">وصف الكورس</Label>
              <Textarea
                id="description"
                value={courseForm.description}
                onChange={(e) => setCourseForm({ ...courseForm, description: e.target.value })}
                placeholder="أدخل وصف الكورس"
                rows={4}
                className="rounded-xl border-border focus:ring-primary"
              />
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="thumbnail" className="font-bold">رابط صورة الغلاف</Label>
              <Input
                id="thumbnail"
                value={courseForm.thumbnail_url}
                onChange={(e) => setCourseForm({ ...courseForm, thumbnail_url: e.target.value })}
                placeholder="https://example.com/image.jpg"
                className="rounded-xl border-border"
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label className="font-bold">المستوى</Label>
                <Select value={courseForm.level} onValueChange={(v) => setCourseForm({ ...courseForm, level: v })}>
                  <SelectTrigger className="rounded-xl border-border">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-card border-border">
                    <SelectItem value="beginner">مبتدئ</SelectItem>
                    <SelectItem value="intermediate">متوسط</SelectItem>
                    <SelectItem value="advanced">متقدم</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="grid gap-2">
                <Label className="font-bold">السعر (ر.س)</Label>
                <Input
                  type="number"
                  value={courseForm.price}
                  onChange={(e) => setCourseForm({ ...courseForm, price: Number(e.target.value) })}
                  disabled={courseForm.is_free}
                  className="rounded-xl border-border"
                />
              </div>
            </div>
            
            <div className="flex items-center justify-between gap-4 p-4 rounded-xl bg-muted/50">
              <div className="flex items-center gap-3">
                <Switch
                  checked={courseForm.is_free}
                  onCheckedChange={(v) => setCourseForm({ ...courseForm, is_free: v, price: v ? 0 : courseForm.price })}
                />
                <Label className="font-medium">كورس مجاني</Label>
              </div>
              
              <div className="flex items-center gap-3">
                <Switch
                  checked={courseForm.is_published}
                  onCheckedChange={(v) => setCourseForm({ ...courseForm, is_published: v })}
                />
                <Label className="font-medium">نشر الكورس</Label>
              </div>
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCourseDialog(false)} className="rounded-xl">
              إلغاء
            </Button>
            <Button onClick={handleSaveCourse} disabled={!courseForm.title || isLoading} variant="gold" className="rounded-xl">
              <Save className="ml-2 h-4 w-4" />
              {isLoading ? 'جاري الحفظ...' : 'حفظ'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Lesson Dialog */}
      <Dialog open={showLessonDialog} onOpenChange={setShowLessonDialog}>
        <DialogContent className="max-w-xl bg-card border-border max-h-[90vh] overflow-hidden flex flex-col">
          <DialogHeader>
            <DialogTitle className="text-2xl font-black">
              {lessonForm.id ? 'تعديل الدرس' : 'درس جديد'}
            </DialogTitle>
            <DialogDescription>
              {lessonForm.id ? 'قم بتعديل بيانات الدرس' : 'أدخل بيانات الدرس الجديد'}
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid gap-6 py-4 overflow-y-auto flex-1 pr-2">
            <div className="grid gap-2">
              <Label htmlFor="lesson-title" className="font-bold">عنوان الدرس *</Label>
              <Input
                id="lesson-title"
                value={lessonForm.title}
                onChange={(e) => setLessonForm({ ...lessonForm, title: e.target.value })}
                placeholder="أدخل عنوان الدرس"
                className="h-12 rounded-xl border-border"
              />
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="lesson-description" className="font-bold">وصف الدرس</Label>
              <Textarea
                id="lesson-description"
                value={lessonForm.description}
                onChange={(e) => setLessonForm({ ...lessonForm, description: e.target.value })}
                placeholder="أدخل وصف الدرس"
                rows={3}
                className="rounded-xl border-border"
              />
            </div>
            
            <div className="grid gap-2">
              <Label className="font-bold">فيديو الدرس</Label>
              <DualVideoUploader
                currentVideoUrl={lessonForm.video_url}
                onUploadComplete={(url, key) => {
                  // نخزن key بدلاً من url لأن VideoPlayer يستخدم key
                  setLessonForm({ ...lessonForm, video_url: key });
                }}
              />
              {lessonForm.video_url && (
                <div className="mt-4">
                  <Label className="font-bold mb-2 block">معاينة الفيديو</Label>
                  <VideoPlayer videoKey={lessonForm.video_url} className="max-h-64" />
                </div>
              )}
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="duration" className="font-bold">مدة الدرس (بالدقائق)</Label>
              <Input
                id="duration"
                type="number"
                value={lessonForm.duration_minutes}
                onChange={(e) => setLessonForm({ ...lessonForm, duration_minutes: Number(e.target.value) })}
                className="rounded-xl border-border"
              />
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowLessonDialog(false)} className="rounded-xl">
              إلغاء
            </Button>
            <Button onClick={handleSaveLesson} disabled={!lessonForm.title || isLoading} variant="gold" className="rounded-xl">
              <Save className="ml-2 h-4 w-4" />
              {isLoading ? 'جاري الحفظ...' : 'حفظ'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent className="max-w-md bg-card border-border">
          <DialogHeader>
            <DialogTitle className="text-2xl font-black text-destructive">تأكيد الحذف</DialogTitle>
            <DialogDescription>
              هل أنت متأكد من حذف {deleteTarget?.type === 'course' ? 'هذا الكورس' : 'هذا الدرس'}؟ لا يمكن التراجع عن هذا الإجراء.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDeleteDialog(false)} className="rounded-xl">
              إلغاء
            </Button>
            <Button variant="destructive" onClick={handleDelete} disabled={isLoading} className="rounded-xl">
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
