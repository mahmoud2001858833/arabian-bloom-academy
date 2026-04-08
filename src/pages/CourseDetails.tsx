import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/i18n/LanguageContext';
import { getLocalizedField } from '@/lib/localized';
import VideoPlayer from '@/components/dashboard/VideoPlayer';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import PageTransition from '@/components/layout/PageTransition';
import ClickPaymentModal from '@/components/payment/ClickPaymentModal';
import PaymentMethodSelector from '@/components/payment/PaymentMethodSelector';
import PayPalPaymentModal from '@/components/payment/PayPalPaymentModal';
import PayPalGuestModal from '@/components/payment/PayPalGuestModal';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Skeleton } from '@/components/ui/skeleton';
import { 
  PlayCircle, 
  CheckCircle, 
  Clock, 
  BookOpen, 
  ChevronLeft,
  Lock,
  GraduationCap,
  CreditCard
} from 'lucide-react';
import { toast } from 'sonner';

interface Course {
  id: string;
  title: string;
  description: string | null;
  thumbnail_url: string | null;
  level: string | null;
  is_free: boolean | null;
  price: number | null;
}

interface Lesson {
  id: string;
  title: string;
  description: string | null;
  video_url: string | null;
  duration_minutes: number | null;
  order_index: number;
}

interface LessonProgress {
  lesson_id: string;
  completed: boolean;
}

const CourseDetails = () => {
  const { courseId } = useParams<{ courseId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { t, language } = useLanguage();
  
  const [course, setCourse] = useState<Course | null>(null);
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [progress, setProgress] = useState<LessonProgress[]>([]);
  const [isEnrolled, setIsEnrolled] = useState(false);
  const [selectedLesson, setSelectedLesson] = useState<Lesson | null>(null);
  const [loading, setLoading] = useState(true);
  const [enrolling, setEnrolling] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [showPaymentSelector, setShowPaymentSelector] = useState(false);
  const [showPayPalModal, setShowPayPalModal] = useState(false);
  const [showPayPalGuestModal, setShowPayPalGuestModal] = useState(false);

  useEffect(() => {
    if (courseId) {
      fetchCourseData();
    }
  }, [courseId, user]);

  const fetchCourseData = async () => {
    try {
      setLoading(true);
      
      // جلب بيانات الكورس
      const { data: courseData, error: courseError } = await supabase
        .from('courses')
        .select('*')
        .eq('id', courseId)
        .maybeSingle();

      if (courseError) throw courseError;
      if (!courseData) {
        toast.error(t('courseDetails.courseNotFound'));
        navigate('/courses');
        return;
      }

      setCourse(courseData);

      // جلب الدروس
      const { data: lessonsData, error: lessonsError } = await supabase
        .from('lessons')
        .select('*')
        .eq('course_id', courseId)
        .order('order_index', { ascending: true });

      if (lessonsError) throw lessonsError;
      setLessons(lessonsData || []);

      // تحديد الدرس الأول كافتراضي
      if (lessonsData && lessonsData.length > 0) {
        setSelectedLesson(lessonsData[0]);
      }

      // التحقق من التسجيل وجلب التقدم إذا كان المستخدم مسجل
      if (user) {
        const { data: enrollmentData } = await supabase
          .from('enrollments')
          .select('id')
          .eq('course_id', courseId)
          .eq('user_id', user.id)
          .maybeSingle();

        setIsEnrolled(!!enrollmentData);

        if (enrollmentData) {
          const { data: progressData } = await supabase
            .from('lesson_progress')
            .select('lesson_id, completed')
            .eq('user_id', user.id)
            .in('lesson_id', lessonsData?.map(l => l.id) || []);

          setProgress(progressData || []);
        }
      }
    } catch (error) {
      console.error('Error fetching course:', error);
      toast.error(t('courseDetails.errorLoading'));
    } finally {
      setLoading(false);
    }
  };

  const handleEnroll = async () => {
    if (!user) {
      toast.error(t('courseDetails.loginRequired'));
      navigate('/auth');
      return;
    }

    // إذا كان الكورس مدفوع، نعرض نافذة الدفع
    if (!course?.is_free && course?.price && course.price > 0) {
      setShowPaymentSelector(true);
      return;
    }

    // إذا كان الكورس مجاني، نسجل مباشرة
    try {
      setEnrolling(true);
      
      const { error } = await supabase
        .from('enrollments')
        .insert({
          course_id: courseId,
          user_id: user.id
        });

      if (error) throw error;

      setIsEnrolled(true);
      toast.success(t('courseDetails.enrollSuccess'));
    } catch (error) {
      console.error('Error enrolling:', error);
      toast.error(t('courseDetails.errorEnrolling'));
    } finally {
      setEnrolling(false);
    }
  };

  const handlePaymentSuccess = () => {
    // تحديث البيانات بعد إرسال طلب الدفع
    fetchCourseData();
    toast.success(t('payment.paymentSuccess'));
  };

  const markLessonComplete = async (lessonId: string) => {
    if (!user || !isEnrolled) return;

    try {
      const existingProgress = progress.find(p => p.lesson_id === lessonId);
      
      if (existingProgress) {
        await supabase
          .from('lesson_progress')
          .update({ completed: true, completed_at: new Date().toISOString() })
          .eq('lesson_id', lessonId)
          .eq('user_id', user.id);
      } else {
        await supabase
          .from('lesson_progress')
          .insert({
            lesson_id: lessonId,
            user_id: user.id,
            completed: true,
            completed_at: new Date().toISOString()
          });
      }

      setProgress(prev => {
        const existing = prev.find(p => p.lesson_id === lessonId);
        if (existing) {
          return prev.map(p => p.lesson_id === lessonId ? { ...p, completed: true } : p);
        }
        return [...prev, { lesson_id: lessonId, completed: true }];
      });

      toast.success(t('courseDetails.lessonMarkedComplete'));
    } catch (error) {
      console.error('Error marking complete:', error);
    }
  };

  const isLessonCompleted = (lessonId: string) => {
    return progress.some(p => p.lesson_id === lessonId && p.completed);
  };

  const completedCount = progress.filter(p => p.completed).length;
  const progressPercentage = lessons.length > 0 ? (completedCount / lessons.length) * 100 : 0;

  const getLevelColor = (level: string | null) => {
    switch (level) {
      case 'beginner': return 'bg-green-500/20 text-green-400 border-green-500/30';
      case 'intermediate': return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
      case 'advanced': return 'bg-red-500/20 text-red-400 border-red-500/30';
      default: return 'bg-accent/20 text-accent border-accent/30';
    }
  };

  const getLevelText = (level: string | null) => {
    switch (level) {
      case 'beginner': return t('courses.beginner');
      case 'intermediate': return t('courses.intermediate');
      case 'advanced': return t('courses.advanced');
      default: return level;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container mx-auto px-4 py-8">
          <Skeleton className="h-8 w-48 mb-6" />
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
              <Skeleton className="aspect-video w-full rounded-lg" />
              <Skeleton className="h-6 w-3/4 mt-4" />
              <Skeleton className="h-4 w-full mt-2" />
            </div>
            <div>
              <Skeleton className="h-96 w-full rounded-lg" />
            </div>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  if (!course) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">{t('courseDetails.courseNotFound')}</h1>
          <Button onClick={() => navigate('/courses')}>
            {t('courseDetails.backToCourses')}
          </Button>
        </div>
      </div>
    );
  }

  return (
    <PageTransition>
      <div className="min-h-screen bg-background">
        <Navbar />
        
        <main className="container mx-auto px-4 py-8">
          {/* رأس الصفحة */}
          <div className="flex items-center gap-4 mb-6">
            <Button 
              variant="ghost" 
              onClick={() => navigate('/courses')}
              className="gap-2"
            >
              <ChevronLeft className="w-4 h-4" />
              {t('courseDetails.backToCourses')}
            </Button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* القسم الرئيسي - الفيديو */}
            <div className="lg:col-span-2 space-y-6">
              {/* مشغل الفيديو */}
              <Card className="overflow-hidden bg-card/50 backdrop-blur-sm border-border/50">
                <CardContent className="p-0">
                  {/* التحقق من الاشتراك قبل عرض الفيديو */}
                  {isEnrolled || course.is_free ? (
                    selectedLesson?.video_url ? (
                      <VideoPlayer 
                        videoKey={selectedLesson.video_url} 
                        className="w-full"
                      />
                    ) : (
                      <div className="aspect-video bg-muted flex items-center justify-center">
                        <div className="text-center text-muted-foreground">
                          <PlayCircle className="w-16 h-16 mx-auto mb-4 opacity-50" />
                          <p>{t('courseDetails.noVideo')}</p>
                        </div>
                      </div>
                    )
                  ) : (
                    <div className="aspect-video bg-gradient-to-br from-muted to-muted/50 flex items-center justify-center">
                      <div className="text-center p-8">
                        <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-accent/10 flex items-center justify-center">
                          <Lock className="w-10 h-10 text-accent" />
                        </div>
                        <h3 className="text-xl font-bold mb-2">{t('courseDetails.contentLocked')}</h3>
                        <p className="text-muted-foreground mb-6 max-w-sm">
                          {t('courseDetails.subscribeToAccess')}
                        </p>
                        <Button onClick={handleEnroll} disabled={enrolling} className="gap-2">
                          {enrolling ? t('courseDetails.enrolling') : t('courseDetails.subscribeNow')}
                        </Button>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* معلومات الدرس الحالي */}
              {selectedLesson && (
                <Card className="bg-card/50 backdrop-blur-sm border-border/50">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-xl">{getLocalizedField(selectedLesson, 'title', language)}</CardTitle>
                      {isEnrolled && (
                        <Button
                          variant={isLessonCompleted(selectedLesson.id) ? "secondary" : "default"}
                          size="sm"
                          onClick={() => markLessonComplete(selectedLesson.id)}
                          disabled={isLessonCompleted(selectedLesson.id)}
                          className="gap-2"
                        >
                          <CheckCircle className="w-4 h-4" />
                          {isLessonCompleted(selectedLesson.id) ? t('courseDetails.completed') : t('courseDetails.markComplete')}
                        </Button>
                      )}
                    </div>
                  </CardHeader>
                  <CardContent>
                    {getLocalizedField(selectedLesson, 'description', language) && (
                      <p className="text-muted-foreground">{getLocalizedField(selectedLesson, 'description', language)}</p>
                    )}
                    {selectedLesson.duration_minutes && (
                      <div className="flex items-center gap-2 mt-4 text-sm text-muted-foreground">
                        <Clock className="w-4 h-4" />
                        <span>{selectedLesson.duration_minutes} {t('courseDetails.minute')}</span>
                      </div>
                    )}
                  </CardContent>
                </Card>
              )}

              {/* معلومات الكورس */}
              <Card className="bg-card/50 backdrop-blur-sm border-border/50">
                <CardHeader>
                  <CardTitle>{t('courseDetails.aboutCourse')}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground mb-4">{getLocalizedField(course, 'description', language)}</p>
                  <div className="flex flex-wrap gap-3">
                    <Badge variant="outline" className={getLevelColor(course.level)}>
                      <GraduationCap className="w-3 h-3 mr-1" />
                      {getLevelText(course.level)}
                    </Badge>
                    <Badge variant="outline" className="bg-accent/20 text-accent border-accent/30">
                      <BookOpen className="w-3 h-3 mr-1" />
                      {lessons.length} {t('courseDetails.lessons')}
                    </Badge>
                    {course.is_free ? (
                      <Badge variant="outline" className="bg-primary/20 text-primary border-primary/30">
                        {t('courses.free')}
                      </Badge>
                    ) : (
                      <Badge variant="outline" className="bg-accent/20 text-accent border-accent/30">
                        {course.price} {t('payment.sar')}
                      </Badge>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* الشريط الجانبي - قائمة الدروس */}
            <div className="space-y-6">
              {/* التسجيل والتقدم */}
              <Card className="bg-card/50 backdrop-blur-sm border-border/50">
                <CardHeader>
                  <CardTitle className="text-lg">{course.title}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {!isEnrolled ? (
                    <div className="space-y-3">
                      <Button 
                        onClick={handleEnroll} 
                        className="w-full gap-2"
                        disabled={enrolling}
                        variant={course.is_free ? 'default' : 'gold'}
                      >
                        {!course.is_free && <CreditCard className="h-4 w-4" />}
                        {enrolling ? t('courseDetails.enrolling') : (course.is_free ? t('courseDetails.enrollInCourse') : `${t('courseDetails.buyNow')} - ${course.price} ${t('payment.sar')}`)}
                      </Button>
                      {!course.is_free && (
                        <p className="text-xs text-center text-muted-foreground">
                          {t('courseDetails.paymentViaClick')}
                        </p>
                      )}
                    </div>
                  ) : (
                    <div className="space-y-3">
                      <div className="flex items-center justify-between text-sm">
                        <span>{t('dashboard.progress')}</span>
                        <span className="text-accent font-medium">
                          {completedCount} / {lessons.length}
                        </span>
                      </div>
                      <Progress value={progressPercentage} className="h-2" />
                      <p className="text-xs text-muted-foreground text-center">
                        {progressPercentage.toFixed(0)}% {t('courseDetails.completed2')}
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* قائمة الدروس - تظهر فقط بعد الاشتراك */}
              {(isEnrolled || course.is_free) && (
                <Card className="bg-card/50 backdrop-blur-sm border-border/50">
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <BookOpen className="w-5 h-5" />
                      {t('courseDetails.lesson')}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-0">
                    <div className="divide-y divide-border/50">
                      {lessons.map((lesson, index) => {
                        const isCompleted = isLessonCompleted(lesson.id);
                        const isSelected = selectedLesson?.id === lesson.id;

                        return (
                          <button
                            key={lesson.id}
                            onClick={() => setSelectedLesson(lesson)}
                            className={`w-full p-4 text-right transition-colors ${
                              isSelected 
                                ? 'bg-accent/10 border-r-2 border-accent' 
                                : 'hover:bg-muted/50'
                            } cursor-pointer`}
                          >
                            <div className="flex items-center gap-3">
                              <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                                isCompleted 
                                  ? 'bg-green-500/20 text-green-400' 
                                  : isSelected 
                                    ? 'bg-accent/20 text-accent'
                                    : 'bg-muted text-muted-foreground'
                              }`}>
                                {isCompleted ? (
                                  <CheckCircle className="w-4 h-4" />
                                ) : (
                                  <span className="text-sm font-medium">{index + 1}</span>
                                )}
                              </div>
                              <div className="flex-1 min-w-0">
                                <h4 className={`font-medium truncate ${
                                  isSelected ? 'text-accent' : ''
                                }`}>
                                  {lesson.title}
                                </h4>
                                {lesson.duration_minutes && (
                                  <p className="text-xs text-muted-foreground mt-1">
                                    {lesson.duration_minutes} {t('courseDetails.minute')}
                                  </p>
                                )}
                              </div>
                              {isSelected && lesson.video_url && (
                                <PlayCircle className="w-5 h-5 text-accent flex-shrink-0" />
                              )}
                            </div>
                          </button>
                        );
                      })}
                    </div>

                    {lessons.length === 0 && (
                      <div className="p-8 text-center text-muted-foreground">
                        <BookOpen className="w-12 h-12 mx-auto mb-3 opacity-50" />
                        <p>{t('courses.noCourses')}</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </main>

        <Footer />

        {/* نافذة اختيار طريقة الدفع */}
        {course && (
          <>
            <PaymentMethodSelector
              open={showPaymentSelector}
              onOpenChange={setShowPaymentSelector}
              courseTitle={course.title}
              coursePrice={course.price || 0}
              onSelectPayPal={() => setShowPayPalModal(true)}
              onSelectClick={() => setShowPaymentModal(true)}
              onSelectPayPalGuest={() => setShowPayPalGuestModal(true)}
            />
            <ClickPaymentModal
              open={showPaymentModal}
              onOpenChange={setShowPaymentModal}
              courseId={course.id}
              courseTitle={course.title}
              coursePrice={course.price || 0}
              onSuccess={handlePaymentSuccess}
            />
            <PayPalPaymentModal
              open={showPayPalModal}
              onOpenChange={setShowPayPalModal}
              courseId={course.id}
              courseTitle={course.title}
              coursePrice={course.price || 0}
              onSuccess={handlePaymentSuccess}
            />
            <PayPalGuestModal
              open={showPayPalGuestModal}
              onOpenChange={setShowPayPalGuestModal}
              courseId={course.id}
              courseTitle={course.title}
              coursePrice={course.price || 0}
              onSuccess={handlePaymentSuccess}
            />
          </>
        )}
      </div>
    </PageTransition>
  );
};

export default CourseDetails;
