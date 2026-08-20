import { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Users, BookOpen, DollarSign, TrendingUp, Plus, Video, 
  Edit, Trash2, Eye, EyeOff, Save, Layers, Crown, Sparkles,
  Calendar, CheckCircle, BarChart3, CreditCard, FileText,
  ChevronUp, ChevronDown, FileUp, HelpCircle, X, Upload, MessageCircle, Mic, Languages
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import Navbar from '@/components/layout/Navbar';
import DualVideoUploader from '@/components/dashboard/DualVideoUploader';
import VideoPlayer from '@/components/dashboard/VideoPlayer';
import PaymentManagement from '@/components/admin/PaymentManagement';
import BlogManagement from '@/components/admin/BlogManagement';
import ChatManagement from '@/components/admin/ChatManagement';
import NotificationBell from '@/components/admin/NotificationBell';
import ExamManagement from '@/components/admin/ExamManagement';
import IntroVideoManagement from '@/components/admin/IntroVideoManagement';
import AudioRecorder from '@/components/admin/AudioRecorder';
import AdminDashboard from '@/components/admin/AdminDashboard';
import OffersManagement from '@/components/admin/OffersManagement';
import BookManagement from '@/components/admin/BookManagement';
import SortableCoursesList from '@/components/admin/SortableCoursesList';
import SortableLessonsList from '@/components/admin/SortableLessonsList';

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
  pdf_url: string | null;
  duration_minutes: number;
  order_index: number;
}

interface QuizQuestion {
  id: string;
  quiz_id: string;
  question: string;
  options: string[];
  correct_answer: number;
  order_index: number;
  audio_url?: string | null;
}

interface Quiz {
  id: string;
  lesson_id: string;
  title: string;
  passing_score: number;
  questions?: QuizQuestion[];
}

const Admin = () => {
  const { user, loading, isAdmin } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  // State
  const [activeMainTab, setActiveMainTab] = useState('courses');
  const [courses, setCourses] = useState<Course[]>([]);
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  
  // Dialog states
  const [showCourseDialog, setShowCourseDialog] = useState(false);
  const [showLessonDialog, setShowLessonDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<{ type: 'course' | 'lesson'; id: string } | null>(null);
  const [isTranslating, setIsTranslating] = useState(false);
  
  // Quiz states
  const [showQuizDialog, setShowQuizDialog] = useState(false);
  const [currentLessonForQuiz, setCurrentLessonForQuiz] = useState<Lesson | null>(null);
  const [quizQuestions, setQuizQuestions] = useState<QuizQuestion[]>([]);
  const [currentQuiz, setCurrentQuiz] = useState<Quiz | null>(null);
  const [isUploadingPdf, setIsUploadingPdf] = useState(false);
  
  // Scroll ref for courses list
  const coursesListRef = useRef<HTMLDivElement>(null);
  
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
    currency: 'USD',
    sort_order: 0,
    title_en: '', title_fr: '', title_ms: '', title_ur: '', title_id: '',
    description_en: '', description_fr: '', description_ms: '', description_ur: '', description_id: '',
  });
  
  const [lessonForm, setLessonForm] = useState({
    id: '',
    course_id: '',
    title: '',
    description: '',
    video_url: '',
    pdf_url: '',
    duration_minutes: 0,
    order_index: 0,
    exam_id: '',
    is_free_preview: false,
    title_en: '', title_fr: '', title_ms: '', title_ur: '', title_id: '',
    description_en: '', description_fr: '', description_ms: '', description_ur: '', description_id: '',
  });
  const [allExams, setAllExams] = useState<{id: string; title: string}[]>([]);

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
      .order('sort_order', { ascending: true })
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

  const i18nFields = { title_en: '', title_fr: '', title_ms: '', title_ur: '', title_id: '', description_en: '', description_fr: '', description_ms: '', description_ur: '', description_id: '' };

  const translateContent = async (
    title: string,
    description: string,
    setter: (fn: (prev: any) => any) => void,
    options?: { table: 'courses' | 'lessons'; id?: string }
  ) => {
    if (!title) { toast({ title: 'خطأ', description: 'أدخل العنوان بالعربية أولاً', variant: 'destructive' }); return; }
    setIsTranslating(true);
    try {
      const { data, error } = await supabase.functions.invoke('translate-content', {
        body: { title, description: description || undefined },
      });
      if (error) throw error;
      const tr = data.translations;
      const translatedFields = {
        title_en: tr.en?.title || '',
        title_fr: tr.fr?.title || '',
        title_ms: tr.ms?.title || '',
        title_ur: tr.ur?.title || '',
        title_id: tr.id?.title || '',
        description_en: tr.en?.description || '',
        description_fr: tr.fr?.description || '',
        description_ms: tr.ms?.description || '',
        description_ur: tr.ur?.description || '',
        description_id: tr.id?.description || '',
      };

      setter((prev: any) => ({
        ...prev,
        ...translatedFields,
      }));

      if (options?.id) {
        const { error: saveError } = await supabase
          .from(options.table)
          .update(translatedFields)
          .eq('id', options.id);

        if (saveError) throw saveError;

        if (options.table === 'courses') {
          fetchCourses();
        } else if (selectedCourse?.id) {
          fetchLessons(selectedCourse.id);
        }

        toast({ title: 'تم بنجاح', description: 'تمت ترجمة المحتوى وحفظه لجميع اللغات' });
      } else {
        toast({ title: 'تم بنجاح', description: 'تمت ترجمة المحتوى لجميع اللغات، اضغط حفظ لتثبيت العنصر الجديد' });
      }
    } catch (e) {
      console.error(e);
      toast({ title: 'خطأ', description: 'فشل في الترجمة التلقائية', variant: 'destructive' });
    }
    setIsTranslating(false);
  };

  const handleSaveCourse = async () => {
    setIsLoading(true);
    const courseData = {
      title: courseForm.title,
      description: courseForm.description,
      thumbnail_url: courseForm.thumbnail_url,
      price: courseForm.is_free ? 0 : courseForm.price,
      is_free: courseForm.is_free,
      level: courseForm.level,
      is_published: courseForm.is_published,
      currency: courseForm.currency,
      sort_order: courseForm.sort_order,
      title_en: courseForm.title_en || null, title_fr: courseForm.title_fr || null,
      title_ms: courseForm.title_ms || null, title_ur: courseForm.title_ur || null, title_id: courseForm.title_id || null,
      description_en: courseForm.description_en || null, description_fr: courseForm.description_fr || null,
      description_ms: courseForm.description_ms || null, description_ur: courseForm.description_ur || null, description_id: courseForm.description_id || null,
    };
    
    if (courseForm.id) {
      const { error } = await supabase.from('courses').update(courseData).eq('id', courseForm.id);
      if (error) {
        toast({ title: 'خطأ', description: 'فشل في تحديث الكورس', variant: 'destructive' });
      } else {
        toast({ title: 'تم بنجاح', description: 'تم تحديث الكورس' });
        fetchCourses(); setShowCourseDialog(false);
      }
    } else {
      const { error } = await supabase.from('courses').insert(courseData);
      if (error) {
        toast({ title: 'خطأ', description: 'فشل في إنشاء الكورس', variant: 'destructive' });
      } else {
        toast({ title: 'تم بنجاح', description: 'تم إنشاء الكورس الجديد' });
        fetchCourses(); setShowCourseDialog(false);
      }
    }
    setIsLoading(false);
  };

  const handleSaveLesson = async () => {
    if (!selectedCourse) return;
    setIsLoading(true);
    const lessonData = {
      title: lessonForm.title,
      description: lessonForm.description,
      video_url: lessonForm.video_url,
      pdf_url: lessonForm.pdf_url || null,
      duration_minutes: lessonForm.duration_minutes,
      exam_id: lessonForm.exam_id || null,
      is_free_preview: lessonForm.is_free_preview,
      title_en: lessonForm.title_en || null, title_fr: lessonForm.title_fr || null,
      title_ms: lessonForm.title_ms || null, title_ur: lessonForm.title_ur || null, title_id: lessonForm.title_id || null,
      description_en: lessonForm.description_en || null, description_fr: lessonForm.description_fr || null,
      description_ms: lessonForm.description_ms || null, description_ur: lessonForm.description_ur || null, description_id: lessonForm.description_id || null,
    };
    
    if (lessonForm.id) {
      const { error } = await supabase.from('lessons').update({ ...lessonData, order_index: lessonForm.order_index }).eq('id', lessonForm.id);
      if (error) {
        toast({ title: 'خطأ', description: 'فشل في تحديث الدرس', variant: 'destructive' });
      } else {
        toast({ title: 'تم بنجاح', description: 'تم تحديث الدرس' });
        fetchLessons(selectedCourse.id); setShowLessonDialog(false);
      }
    } else {
      const { data: inserted, error } = await supabase
        .from('lessons')
        .insert({ ...lessonData, course_id: selectedCourse.id, order_index: lessons.length })
        .select('id')
        .maybeSingle();
      if (error) {
        toast({ title: 'خطأ', description: 'فشل في إنشاء الدرس', variant: 'destructive' });
      } else {
        toast({ title: 'تم بنجاح', description: 'تم إنشاء الدرس الجديد' });
        // Auto-generate subtitles (speech-to-text + translation) for new lessons with video.
        if (inserted?.id && lessonData.video_url) {
          toast({ title: 'جارٍ توليد الترجمة', description: 'يتم تفريغ صوت الفيديو وترجمته لكل اللغات، لا تغلق الصفحة.' });
          generateLessonSubtitles(inserted.id, lessonData.video_url)
            .then(() => {
              toast({ title: 'تمت الترجمة', description: 'أصبحت ترجمة الدرس متاحة للطلاب' });
            })
            .catch((fnError) => {
              console.error('Subtitle generation failed:', fnError);
              toast({ title: 'فشل توليد الترجمة', description: 'يمكنك إعادة المحاولة من زر الترجمة بجانب الدرس', variant: 'destructive' });
            })
            .finally(() => fetchLessons(selectedCourse.id));
        }
        fetchLessons(selectedCourse.id); setShowLessonDialog(false);
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

  const openEditCourse = (course: Course & Record<string, any>) => {
    setCourseForm({
      id: course.id,
      title: course.title,
      description: course.description || '',
      thumbnail_url: course.thumbnail_url || '',
      price: course.price,
      is_free: course.is_free,
      level: course.level,
      is_published: course.is_published,
      currency: course.currency || 'USD',
      sort_order: course.sort_order || 0,
      title_en: course.title_en || '', title_fr: course.title_fr || '', title_ms: course.title_ms || '',
      title_ur: course.title_ur || '', title_id: course.title_id || '',
      description_en: course.description_en || '', description_fr: course.description_fr || '', description_ms: course.description_ms || '',
      description_ur: course.description_ur || '', description_id: course.description_id || '',
    });
    setShowCourseDialog(true);
  };

  const openNewCourse = () => {
    setCourseForm({
      id: '', title: '', description: '', thumbnail_url: '', price: 0, is_free: true, level: 'beginner', is_published: true,
      currency: 'USD', sort_order: courses.length,
      ...i18nFields,
    });
    setShowCourseDialog(true);
  };

  const openEditLesson = (lesson: Lesson & Record<string, any>) => {
    setLessonForm({
      id: lesson.id,
      course_id: lesson.course_id,
      title: lesson.title,
      description: lesson.description || '',
      video_url: lesson.video_url || '',
      pdf_url: lesson.pdf_url || '',
      duration_minutes: lesson.duration_minutes,
      order_index: lesson.order_index,
      exam_id: (lesson as any).exam_id || '',
      is_free_preview: !!(lesson as any).is_free_preview,
      title_en: lesson.title_en || '', title_fr: lesson.title_fr || '', title_ms: lesson.title_ms || '',
      title_ur: lesson.title_ur || '', title_id: lesson.title_id || '',
      description_en: lesson.description_en || '', description_fr: lesson.description_fr || '', description_ms: lesson.description_ms || '',
      description_ur: lesson.description_ur || '', description_id: lesson.description_id || '',
    });
    fetchAllExams();
    setShowLessonDialog(true);
  };

  const openNewLesson = () => {
    if (!selectedCourse) return;
    setLessonForm({
      id: '', course_id: selectedCourse.id, title: '', description: '', video_url: '', pdf_url: '', duration_minutes: 0, order_index: lessons.length,
      exam_id: '', is_free_preview: false,
      ...i18nFields,
    });
    fetchAllExams();
    setShowLessonDialog(true);
  };

  const fetchAllExams = async () => {
    const { data } = await supabase.from('exams').select('id, title').order('title');
    setAllExams(data || []);
  };

  // Scroll functions for courses list
  const scrollCoursesUp = () => {
    if (coursesListRef.current) {
      coursesListRef.current.scrollBy({ top: -150, behavior: 'smooth' });
    }
  };

  const scrollCoursesDown = () => {
    if (coursesListRef.current) {
      coursesListRef.current.scrollBy({ top: 150, behavior: 'smooth' });
    }
  };

  // PDF upload handler
  const handlePdfUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    
    if (file.type !== 'application/pdf') {
      toast({ title: 'خطأ', description: 'يرجى اختيار ملف PDF فقط', variant: 'destructive' });
      return;
    }

    setIsUploadingPdf(true);
    const fileName = `${Date.now()}-${file.name}`;
    
    const { data, error } = await supabase.storage
      .from('lesson-pdfs')
      .upload(fileName, file);

    if (error) {
      toast({ title: 'خطأ', description: 'فشل في رفع الملف', variant: 'destructive' });
    } else {
      const { data: { publicUrl } } = supabase.storage
        .from('lesson-pdfs')
        .getPublicUrl(fileName);
      
      setLessonForm({ ...lessonForm, pdf_url: publicUrl });
      toast({ title: 'تم بنجاح', description: 'تم رفع ملف PDF' });
    }
    setIsUploadingPdf(false);
  };

  // Quiz management functions
  const openQuizDialog = async (lesson: Lesson) => {
    setCurrentLessonForQuiz(lesson);
    
    // Fetch existing quiz for this lesson
    const { data: quizData } = await supabase
      .from('quizzes')
      .select('*')
      .eq('lesson_id', lesson.id)
      .single();

    if (quizData) {
      setCurrentQuiz(quizData as Quiz);
      
      // Fetch questions
      const { data: questionsData } = await supabase
        .from('quiz_questions')
        .select('*')
        .eq('quiz_id', quizData.id)
        .order('order_index');
      
      if (questionsData) {
        setQuizQuestions(questionsData.map(q => ({
          ...q,
          options: Array.isArray(q.options) ? q.options : [],
          audio_url: (q as any).audio_url || null,
        })) as QuizQuestion[]);
      }
    } else {
      setCurrentQuiz(null);
      setQuizQuestions([]);
    }
    
    setShowQuizDialog(true);
  };

  const addNewQuestion = () => {
    const newQuestion: QuizQuestion = {
      id: `temp-${Date.now()}`,
      quiz_id: currentQuiz?.id || '',
      question: '',
      options: ['', '', '', ''],
      correct_answer: 0,
      order_index: quizQuestions.length,
      audio_url: null,
    };
    setQuizQuestions([...quizQuestions, newQuestion]);
  };

  const updateQuestion = (index: number, field: keyof QuizQuestion, value: any) => {
    const updated = [...quizQuestions];
    (updated[index] as any)[field] = value;
    setQuizQuestions(updated);
  };

  const updateQuestionOption = (qIndex: number, optIndex: number, value: string) => {
    const updated = [...quizQuestions];
    const current = updated[qIndex].options[optIndex];
    if (typeof current === 'object' && current !== null) {
      updated[qIndex].options[optIndex] = { ...(current as any), text: value };
    } else {
      updated[qIndex].options[optIndex] = value;
    }
    setQuizQuestions(updated);
  };

  const removeQuestion = (index: number) => {
    setQuizQuestions(quizQuestions.filter((_, i) => i !== index));
  };

  const saveQuiz = async () => {
    if (!currentLessonForQuiz) return;
    setIsLoading(true);

    try {
      let quizId = currentQuiz?.id;

      // Create or update quiz
      if (!quizId) {
        const { data: newQuiz, error } = await supabase
          .from('quizzes')
          .insert({
            lesson_id: currentLessonForQuiz.id,
            title: `اختبار ${currentLessonForQuiz.title}`,
            passing_score: 70,
          })
          .select()
          .single();

        if (error) throw error;
        quizId = newQuiz.id;
      }

      // Delete existing questions
      await supabase
        .from('quiz_questions')
        .delete()
        .eq('quiz_id', quizId);

      // Insert new questions
      if (quizQuestions.length > 0) {
        const questionsToInsert = quizQuestions.map((q, i) => ({
          quiz_id: quizId,
          question: q.question,
          options: q.options,
          correct_answer: q.correct_answer,
          order_index: i,
          audio_url: q.audio_url || null,
        }));

        const { error: insertError } = await supabase
          .from('quiz_questions')
          .insert(questionsToInsert);

        if (insertError) throw insertError;
      }

      toast({ title: 'تم بنجاح', description: 'تم حفظ الاختبار والأسئلة' });
      setShowQuizDialog(false);
    } catch (error) {
      console.error('Error saving quiz:', error);
      toast({ title: 'خطأ', description: 'فشل في حفظ الاختبار', variant: 'destructive' });
    }

    setIsLoading(false);
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
    { icon: DollarSign, label: 'الإيرادات', value: `$${totalRevenue}`, color: 'accent', subtitle: 'دولار أمريكي' },
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
               <NotificationBell />
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

          {/* Main Tabs */}
          <Tabs value={activeMainTab} onValueChange={setActiveMainTab} className="mb-6">
            <TabsList className="bg-white p-2 flex-wrap h-auto rounded-xl shadow-lg border border-primary/10">
              <TabsTrigger value="courses" className="gap-2 text-foreground/70 data-[state=active]:bg-primary data-[state=active]:text-white rounded-lg px-4 py-2">
                <BookOpen className="h-4 w-4" />
                إدارة الكورسات
              </TabsTrigger>
              <TabsTrigger value="blog" className="gap-2 text-foreground/70 data-[state=active]:bg-primary data-[state=active]:text-white rounded-lg px-4 py-2">
                <FileText className="h-4 w-4" />
                إدارة المدونة
              </TabsTrigger>
              <TabsTrigger value="payments" className="gap-2 text-foreground/70 data-[state=active]:bg-primary data-[state=active]:text-white rounded-lg px-4 py-2">
                <CreditCard className="h-4 w-4" />
                إدارة المدفوعات
              </TabsTrigger>
              <TabsTrigger value="chats" className="gap-2 text-foreground/70 data-[state=active]:bg-primary data-[state=active]:text-white rounded-lg px-4 py-2">
                <MessageCircle className="h-4 w-4" />
                المحادثات
              </TabsTrigger>
              <TabsTrigger value="exams" className="gap-2 text-foreground/70 data-[state=active]:bg-primary data-[state=active]:text-white rounded-lg px-4 py-2">
                <HelpCircle className="h-4 w-4" />
                الامتحانات
              </TabsTrigger>
              <TabsTrigger value="intro-video" className="gap-2 text-foreground/70 data-[state=active]:bg-primary data-[state=active]:text-white rounded-lg px-4 py-2">
                <Video className="h-4 w-4" />
                الفيديو التعريفي
              </TabsTrigger>
              <TabsTrigger value="dashboard" className="gap-2 text-foreground/70 data-[state=active]:bg-primary data-[state=active]:text-white rounded-lg px-4 py-2">
                <BarChart3 className="h-4 w-4" />
                لوحة المعلومات
              </TabsTrigger>
              <TabsTrigger value="offers" className="gap-2 text-foreground/70 data-[state=active]:bg-primary data-[state=active]:text-white rounded-lg px-4 py-2">
                <Sparkles className="h-4 w-4" />
                العروض
              </TabsTrigger>
              <TabsTrigger value="books" className="gap-2 text-foreground/70 data-[state=active]:bg-primary data-[state=active]:text-white rounded-lg px-4 py-2">
                <FileText className="h-4 w-4" />
                الكتب
              </TabsTrigger>
            </TabsList>

            {/* Courses Tab */}
            <TabsContent value="courses">
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
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-xl bg-accent/20">
                      <BookOpen className="h-5 w-5 text-accent" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-white">الكورسات</h3>
                      <p className="text-sm text-white/50">{courses.length} كورس</p>
                    </div>
                  </div>
                  {courses.length > 3 && (
                    <div className="flex flex-col gap-1">
                      <Button
                        size="icon"
                        variant="ghost"
                        className="h-7 w-7 text-white/60 hover:text-accent hover:bg-accent/10"
                        onClick={scrollCoursesUp}
                      >
                        <ChevronUp className="h-4 w-4" />
                      </Button>
                      <Button
                        size="icon"
                        variant="ghost"
                        className="h-7 w-7 text-white/60 hover:text-accent hover:bg-accent/10"
                        onClick={scrollCoursesDown}
                      >
                        <ChevronDown className="h-4 w-4" />
                      </Button>
                    </div>
                  )}
                </div>
              </div>
              <div ref={coursesListRef} className="max-h-[600px] overflow-y-auto scroll-smooth">
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
                  <SortableCoursesList
                    courses={courses}
                    setCourses={setCourses}
                    selectedId={selectedCourse?.id}
                    onSelect={selectCourse}
                    onTogglePublish={togglePublish}
                    onEdit={openEditCourse}
                    onDelete={(id) => {
                      setDeleteTarget({ type: 'course', id });
                      setShowDeleteDialog(true);
                    }}
                  />
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
                  <SortableLessonsList
                    lessons={lessons as any}
                    setLessons={(l) => setLessons(l as any)}
                    onEdit={(l) => openEditLesson(l as any)}
                    onQuiz={(l) => openQuizDialog(l as any)}
                    onDelete={(id) => {
                      setDeleteTarget({ type: 'lesson', id });
                      setShowDeleteDialog(true);
                    }}
                  />
                )}
              </div>
            </div>
          </motion.div>
            </TabsContent>

            {/* Blog Tab */}
            <TabsContent value="blog">
              <BlogManagement />
            </TabsContent>

            {/* Payments Tab */}
            <TabsContent value="payments">
              <PaymentManagement />
            </TabsContent>

            {/* Chats Tab */}
            <TabsContent value="chats">
              <ChatManagement />
            </TabsContent>

            {/* Exams Tab */}
            <TabsContent value="exams">
              <ExamManagement />
            </TabsContent>

            {/* Intro Video Tab */}
            <TabsContent value="intro-video">
              <IntroVideoManagement />
            </TabsContent>

            <TabsContent value="dashboard">
              <AdminDashboard />
            </TabsContent>

            <TabsContent value="offers">
              <OffersManagement />
            </TabsContent>

            <TabsContent value="books">
              <BookManagement />
            </TabsContent>
          </Tabs>
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
                <Label className="font-bold">السعر</Label>
                <div className="flex gap-2">
                  <Input
                    type="number"
                    value={courseForm.price}
                    onChange={(e) => setCourseForm({ ...courseForm, price: Number(e.target.value) })}
                    disabled={courseForm.is_free}
                    className="rounded-xl border-border flex-1"
                  />
                  <Select
                    value={courseForm.currency}
                    onValueChange={(v) => setCourseForm({ ...courseForm, currency: v })}
                    disabled={courseForm.is_free}
                  >
                    <SelectTrigger className="rounded-xl border-border w-28">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="USD">USD ($)</SelectItem>
                      <SelectItem value="JOD">JOD (د.أ)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
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

            {/* Auto Translation Button */}
            <Button
              type="button"
              variant="outline"
              className="rounded-xl gap-2 border-primary/30 text-primary hover:bg-primary/10"
              onClick={() => translateContent(courseForm.title, courseForm.description, setCourseForm, { table: 'courses', id: courseForm.id || undefined })}
              disabled={isTranslating || !courseForm.title}
            >
              <Languages className="h-4 w-4" />
              {isTranslating ? 'جاري الترجمة...' : 'ترجمة تلقائية لجميع اللغات'}
            </Button>

            {/* Show translated titles preview */}
            {courseForm.title_en && (
              <div className="p-3 rounded-xl bg-muted/50 space-y-1 text-sm">
                <p><span className="font-bold text-muted-foreground">EN:</span> {courseForm.title_en}</p>
                <p><span className="font-bold text-muted-foreground">FR:</span> {courseForm.title_fr}</p>
                <p><span className="font-bold text-muted-foreground">MS:</span> {courseForm.title_ms}</p>
                <p><span className="font-bold text-muted-foreground">UR:</span> {courseForm.title_ur}</p>
                <p><span className="font-bold text-muted-foreground">ID:</span> {courseForm.title_id}</p>
              </div>
            )}
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
            
            {/* PDF Upload Section */}
            <div className="grid gap-2">
              <Label className="font-bold">ملف PDF (اختياري)</Label>
              <div className="flex items-center gap-3">
                <label className="flex-1">
                  <div className="flex items-center justify-center gap-2 p-4 border-2 border-dashed border-border rounded-xl cursor-pointer hover:border-primary/50 transition-colors">
                    {isUploadingPdf ? (
                      <div className="animate-spin rounded-full h-5 w-5 border-2 border-primary border-t-transparent" />
                    ) : (
                      <>
                        <Upload className="h-5 w-5 text-muted-foreground" />
                        <span className="text-muted-foreground">اختر ملف PDF</span>
                      </>
                    )}
                  </div>
                  <input
                    type="file"
                    accept=".pdf"
                    className="hidden"
                    onChange={handlePdfUpload}
                    disabled={isUploadingPdf}
                  />
                </label>
              </div>
              {lessonForm.pdf_url && (
                <div className="flex items-center justify-between p-3 bg-blue-500/10 rounded-xl border border-blue-500/20">
                  <div className="flex items-center gap-2">
                    <FileUp className="h-5 w-5 text-blue-400" />
                    <span className="text-sm text-blue-400">تم رفع ملف PDF</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <a 
                      href={lessonForm.pdf_url} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-xs text-blue-400 hover:underline"
                    >
                      معاينة
                    </a>
                    <Button
                      size="icon"
                      variant="ghost"
                      className="h-6 w-6 text-destructive"
                      onClick={() => setLessonForm({ ...lessonForm, pdf_url: '' })}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              )}
            </div>

            {/* Free Preview Toggle */}
            <div className="flex items-center gap-3 p-3 rounded-xl border border-border bg-muted/30">
              <Switch 
                checked={lessonForm.is_free_preview} 
                onCheckedChange={(checked) => setLessonForm({ ...lessonForm, is_free_preview: checked })}
              />
              <div>
                <Label className="font-bold">معاينة مجانية</Label>
                <p className="text-xs text-muted-foreground">اجعل هذا الدرس متاحاً للجميع قبل الدفع</p>
              </div>
            </div>

            {/* Exam Linking */}
            <div className="grid gap-2">
              <Label className="font-bold">ربط امتحان بالدرس (اختياري)</Label>
              <Select value={lessonForm.exam_id || 'none'} onValueChange={(v) => setLessonForm({ ...lessonForm, exam_id: v === 'none' ? '' : v })}>
                <SelectTrigger className="rounded-xl border-border">
                  <SelectValue placeholder="اختر امتحان..." />
                </SelectTrigger>
                <SelectContent className="bg-card border-border">
                  <SelectItem value="none">بدون امتحان</SelectItem>
                  {allExams.map(exam => (
                    <SelectItem key={exam.id} value={exam.id}>{exam.title}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Auto Translation Button */}
            <Button
              type="button"
              variant="outline"
              className="rounded-xl gap-2 border-primary/30 text-primary hover:bg-primary/10"
              onClick={() => translateContent(lessonForm.title, lessonForm.description, setLessonForm, { table: 'lessons', id: lessonForm.id || undefined })}
              disabled={isTranslating || !lessonForm.title}
            >
              <Languages className="h-4 w-4" />
              {isTranslating ? 'جاري الترجمة...' : 'ترجمة تلقائية لجميع اللغات'}
            </Button>

            {lessonForm.title_en && (
              <div className="p-3 rounded-xl bg-muted/50 space-y-1 text-sm">
                <p><span className="font-bold text-muted-foreground">EN:</span> {lessonForm.title_en}</p>
                <p><span className="font-bold text-muted-foreground">FR:</span> {lessonForm.title_fr}</p>
              </div>
            )}
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

      {/* Quiz Management Dialog */}
      <Dialog open={showQuizDialog} onOpenChange={setShowQuizDialog}>
        <DialogContent className="max-w-3xl bg-card border-border max-h-[90vh] overflow-hidden flex flex-col">
          <DialogHeader>
            <DialogTitle className="text-2xl font-black flex items-center gap-2">
              <HelpCircle className="h-6 w-6 text-primary" />
              إدارة الأسئلة - {currentLessonForQuiz?.title}
            </DialogTitle>
            <DialogDescription>
              أضف أسئلة اختيارية للطلاب مع هذا الدرس
            </DialogDescription>
          </DialogHeader>
          
          <div className="flex-1 overflow-y-auto py-4 space-y-6">
            {quizQuestions.length === 0 ? (
              <div className="text-center py-12">
                <div className="w-20 h-20 rounded-full bg-muted flex items-center justify-center mx-auto mb-4">
                  <HelpCircle className="h-10 w-10 text-muted-foreground" />
                </div>
                <p className="text-muted-foreground mb-4">لا توجد أسئلة بعد</p>
                <Button onClick={addNewQuestion} variant="outline" className="rounded-xl">
                  <Plus className="ml-2 h-4 w-4" />
                  أضف أول سؤال
                </Button>
              </div>
            ) : (
              quizQuestions.map((question, qIndex) => (
                <Card key={question.id} className="border-border">
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg">السؤال {qIndex + 1}</CardTitle>
                      <Button
                        size="icon"
                        variant="ghost"
                        className="h-8 w-8 text-destructive"
                        onClick={() => removeQuestion(qIndex)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label className="font-bold">نص السؤال</Label>
                      <Textarea
                        value={question.question}
                        onChange={(e) => updateQuestion(qIndex, 'question', e.target.value)}
                        placeholder="اكتب السؤال هنا..."
                        className="mt-1 rounded-xl"
                      />
                      <div className="flex items-center gap-2 mt-2">
                        <Label className="text-sm text-muted-foreground">أو أضف تسجيل صوتي:</Label>
                        <AudioRecorder
                          audioUrl={question.audio_url || null}
                          onAudioChange={(url) => updateQuestion(qIndex, 'audio_url', url)}
                        />
                      </div>
                    </div>
                    
                    <div className="space-y-3">
                      <Label className="font-bold">الخيارات (اختر الإجابة الصحيحة)</Label>
                      {question.options.map((option, optIndex) => (
                        <div key={optIndex} className="flex items-center gap-3 p-2 rounded-xl border border-border bg-muted/30">
                          <input
                            type="radio"
                            name={`correct-${question.id}`}
                            checked={question.correct_answer === optIndex}
                            onChange={() => updateQuestion(qIndex, 'correct_answer', optIndex)}
                            className="w-4 h-4 text-primary"
                          />
                          <div className="flex-1 space-y-2">
                            <Input
                              value={typeof option === 'string' ? option : (option as any)?.text || ''}
                              onChange={(e) => updateQuestionOption(qIndex, optIndex, e.target.value)}
                              placeholder={`الخيار ${optIndex + 1} (نص)`}
                              className="flex-1 rounded-xl"
                            />
                            <div className="flex items-center gap-2">
                              <span className="text-xs text-muted-foreground">أو تسجيل صوتي:</span>
                              <AudioRecorder
                                audioUrl={typeof option === 'object' && option !== null ? (option as any).audio_url || null : null}
                                onAudioChange={(url) => {
                                  const updated = [...quizQuestions];
                                  const opts = [...updated[qIndex].options];
                                  const current = opts[optIndex];
                                  const text = typeof current === 'string' ? current : (current as any)?.text || '';
                                  if (url) {
                                    opts[optIndex] = { text, audio_url: url } as any;
                                  } else {
                                    opts[optIndex] = text;
                                  }
                                  updated[qIndex].options = opts;
                                  setQuizQuestions(updated);
                                }}
                              />
                            </div>
                          </div>
                          {question.correct_answer === optIndex && (
                            <Badge className="bg-emerald-500/20 text-emerald-600 border-emerald-500/30">
                              صحيح
                            </Badge>
                          )}
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
            
            {quizQuestions.length > 0 && (
              <Button onClick={addNewQuestion} variant="outline" className="w-full rounded-xl">
                <Plus className="ml-2 h-4 w-4" />
                أضف سؤال جديد
              </Button>
            )}
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowQuizDialog(false)} className="rounded-xl">
              إلغاء
            </Button>
            <Button onClick={saveQuiz} disabled={isLoading} variant="gold" className="rounded-xl">
              <Save className="ml-2 h-4 w-4" />
              {isLoading ? 'جاري الحفظ...' : 'حفظ الأسئلة'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Admin;
