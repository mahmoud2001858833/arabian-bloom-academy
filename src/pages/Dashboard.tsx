import { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { BookOpen, Clock, Award, TrendingUp, Play, GraduationCap, Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';

interface EnrolledCourse {
  id: string;
  title: string;
  description: string | null;
  thumbnail_url: string | null;
  level: string | null;
  totalLessons: number;
  completedLessons: number;
  progress: number;
}

const levelLabels: Record<string, { label: string; color: string }> = {
  beginner: { label: 'مبتدئ', color: 'bg-emerald-500/20 text-emerald-600 border-emerald-500/30' },
  intermediate: { label: 'متوسط', color: 'bg-amber-500/20 text-amber-600 border-amber-500/30' },
  advanced: { label: 'متقدم', color: 'bg-rose-500/20 text-rose-600 border-rose-500/30' },
};

const Dashboard = () => {
  const { user, loading, isAdmin } = useAuth();
  const navigate = useNavigate();
  const [enrolledCourses, setEnrolledCourses] = useState<EnrolledCourse[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [stats, setStats] = useState({
    totalCourses: 0,
    totalHours: 0,
    completedQuizzes: 0,
    progressRate: 0,
  });

  useEffect(() => {
    if (!loading && !user) {
      navigate('/auth');
    }
    if (!loading && isAdmin) {
      navigate('/admin');
    }
  }, [user, loading, isAdmin, navigate]);

  useEffect(() => {
    if (user && !isAdmin) {
      fetchEnrolledCourses();
      fetchStats();
    }
  }, [user, isAdmin]);

  const fetchEnrolledCourses = async () => {
    if (!user) return;
    
    try {
      // Get user's enrollments with course data
      const { data: enrollments, error: enrollError } = await supabase
        .from('enrollments')
        .select('course_id')
        .eq('user_id', user.id);

      if (enrollError) throw enrollError;

      if (!enrollments || enrollments.length === 0) {
        setEnrolledCourses([]);
        setIsLoading(false);
        return;
      }

      const courseIds = enrollments.map(e => e.course_id);

      // Get course details
      const { data: courses, error: courseError } = await supabase
        .from('courses')
        .select('*')
        .in('id', courseIds);

      if (courseError) throw courseError;

      // Get lessons for each course and progress
      const enrichedCourses: EnrolledCourse[] = await Promise.all(
        (courses || []).map(async (course) => {
          // Get total lessons
          const { data: lessons } = await supabase
            .from('lessons')
            .select('id')
            .eq('course_id', course.id);

          const totalLessons = lessons?.length || 0;

          // Get completed lessons
          const { data: progress } = await supabase
            .from('lesson_progress')
            .select('lesson_id')
            .eq('user_id', user.id)
            .eq('completed', true)
            .in('lesson_id', lessons?.map(l => l.id) || []);

          const completedLessons = progress?.length || 0;
          const progressPercent = totalLessons > 0 ? Math.round((completedLessons / totalLessons) * 100) : 0;

          return {
            id: course.id,
            title: course.title,
            description: course.description,
            thumbnail_url: course.thumbnail_url,
            level: course.level,
            totalLessons,
            completedLessons,
            progress: progressPercent,
          };
        })
      );

      setEnrolledCourses(enrichedCourses);
    } catch (error) {
      console.error('Error fetching enrolled courses:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchStats = async () => {
    if (!user) return;

    try {
      // Total enrolled courses
      const { data: enrollments } = await supabase
        .from('enrollments')
        .select('id')
        .eq('user_id', user.id);

      // Completed quizzes
      const { data: quizAttempts } = await supabase
        .from('quiz_attempts')
        .select('id')
        .eq('user_id', user.id)
        .eq('passed', true);

      // Calculate total study hours (estimate based on completed lessons * avg 10 min)
      const { data: completedProgress } = await supabase
        .from('lesson_progress')
        .select('id')
        .eq('user_id', user.id)
        .eq('completed', true);

      const totalMinutes = (completedProgress?.length || 0) * 10;
      const totalHours = Math.round(totalMinutes / 60);

      // Calculate overall progress
      const totalEnrolled = enrollments?.length || 0;
      const avgProgress = enrolledCourses.length > 0 
        ? Math.round(enrolledCourses.reduce((sum, c) => sum + c.progress, 0) / enrolledCourses.length)
        : 0;

      setStats({
        totalCourses: totalEnrolled,
        totalHours,
        completedQuizzes: quizAttempts?.length || 0,
        progressRate: avgProgress,
      });
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  // Recalculate progress when enrolledCourses change
  useEffect(() => {
    if (enrolledCourses.length > 0) {
      const avgProgress = Math.round(
        enrolledCourses.reduce((sum, c) => sum + c.progress, 0) / enrolledCourses.length
      );
      setStats(prev => ({ ...prev, progressRate: avgProgress }));
    }
  }, [enrolledCourses]);

  if (loading || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50/50 via-white to-purple-100/30">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary border-t-transparent"></div>
      </div>
    );
  }

  const statItems = [
    { icon: BookOpen, label: 'كورسات مسجلة', value: stats.totalCourses.toString(), color: 'primary' },
    { icon: Clock, label: 'ساعات دراسة', value: stats.totalHours.toString(), color: 'accent' },
    { icon: Award, label: 'اختبارات ناجحة', value: stats.completedQuizzes.toString(), color: 'emerald' },
    { icon: TrendingUp, label: 'معدل التقدم', value: `${stats.progressRate}%`, color: 'primary' },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-purple-50/50 via-white to-purple-100/30">
      <Navbar />
      <main className="flex-1 pt-28 pb-16">
        <div className="container mx-auto px-4">
          {/* Welcome Header */}
          <motion.div 
            className="mb-10"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="flex items-center gap-4 mb-4">
              <div className="p-4 rounded-2xl bg-primary/10 backdrop-blur-xl border border-primary/20">
                <GraduationCap className="h-8 w-8 text-primary" />
              </div>
              <div>
                <h1 className="text-3xl md:text-4xl font-black text-foreground">
                  مرحباً، <span className="text-primary" style={{ textShadow: '0 0 30px hsl(var(--primary) / 0.3)' }}>{user?.user_metadata?.full_name || 'طالب'}</span>
                </h1>
                <p className="text-muted-foreground mt-1">تابع تقدمك في رحلة تعلم اللغة العربية</p>
              </div>
            </div>
          </motion.div>

          {/* Stats Grid */}
          <motion.div 
            className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-10"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            {statItems.map((stat, index) => (
              <motion.div
                key={index}
                whileHover={{ y: -4, transition: { duration: 0.2 } }}
                className="relative bg-white/60 backdrop-blur-xl border border-primary/20 rounded-2xl p-6 hover:shadow-xl hover:shadow-primary/10 transition-all"
              >
                <div className="flex items-center gap-4">
                  <div className={`p-3 rounded-xl ${
                    stat.color === 'accent' ? 'bg-accent/20' : 
                    stat.color === 'emerald' ? 'bg-emerald-500/20' : 'bg-primary/10'
                  }`}>
                    <stat.icon className={`h-6 w-6 ${
                      stat.color === 'accent' ? 'text-accent' :
                      stat.color === 'emerald' ? 'text-emerald-600' : 'text-primary'
                    }`} />
                  </div>
                  <div>
                    <p className="text-2xl font-black text-foreground">{stat.value}</p>
                    <p className="text-sm text-muted-foreground">{stat.label}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>

          {/* My Courses */}
          <motion.div 
            className="space-y-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Sparkles className="h-6 w-6 text-accent" />
                <h2 className="text-2xl font-black text-foreground">كورساتي</h2>
              </div>
              <Button 
                variant="outline" 
                onClick={() => navigate('/courses')}
                className="rounded-xl border-primary/30 hover:bg-primary/10"
              >
                تصفح الكورسات
              </Button>
            </div>

            {enrolledCourses.length === 0 ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="relative bg-white/60 backdrop-blur-xl border border-primary/20 rounded-3xl p-12 text-center"
              >
                <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-6">
                  <BookOpen className="h-10 w-10 text-primary" />
                </div>
                <h3 className="text-xl font-bold text-foreground mb-2">لم تسجل في أي كورس بعد</h3>
                <p className="text-muted-foreground mb-6">ابدأ رحلة التعلم بالتسجيل في أحد كورساتنا المميزة</p>
                <Button 
                  onClick={() => navigate('/courses')}
                  className="rounded-xl px-8"
                >
                  <GraduationCap className="h-5 w-5 ml-2" />
                  تصفح الكورسات
                </Button>
              </motion.div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {enrolledCourses.map((course, index) => (
                  <motion.div
                    key={course.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    whileHover={{ y: -8, transition: { duration: 0.3 } }}
                    className="group"
                  >
                    <div className="relative bg-white/60 backdrop-blur-xl border border-primary/20 rounded-3xl overflow-hidden hover:shadow-2xl hover:shadow-primary/20 transition-all duration-500">
                      {/* Thumbnail */}
                      <div className="relative h-40 overflow-hidden">
                        <img
                          src={course.thumbnail_url || 'https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?w=400&h=300&fit=crop'}
                          alt={course.title}
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
                        
                        {/* Progress Overlay */}
                        <div className="absolute bottom-3 left-3 right-3">
                          <div className="flex justify-between text-white text-sm mb-1">
                            <span>التقدم</span>
                            <span className="font-bold">{course.progress}%</span>
                          </div>
                          <div className="h-2 bg-white/30 rounded-full overflow-hidden">
                            <div 
                              className="h-full bg-accent rounded-full transition-all duration-500"
                              style={{ width: `${course.progress}%` }}
                            />
                          </div>
                        </div>

                        {/* Level Badge */}
                        <div className="absolute top-3 right-3">
                          <Badge className={`font-bold px-3 py-1 border ${levelLabels[course.level || 'beginner']?.color || 'bg-primary/20 text-primary'}`}>
                            {levelLabels[course.level || 'beginner']?.label || 'مبتدئ'}
                          </Badge>
                        </div>
                      </div>

                      {/* Content */}
                      <div className="p-5 space-y-4">
                        <h3 className="font-bold text-lg text-foreground line-clamp-1 group-hover:text-primary transition-colors">
                          {course.title}
                        </h3>
                        
                        <p className="text-sm text-muted-foreground">
                          {course.completedLessons} من {course.totalLessons} درس مكتمل
                        </p>

                        <Button 
                          className="w-full rounded-xl h-11 font-bold shadow-lg shadow-primary/25 hover:shadow-xl"
                          asChild
                        >
                          <Link to={`/courses/${course.id}`}>
                            <Play className="h-4 w-4 ml-2" />
                            متابعة التعلم
                          </Link>
                        </Button>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </motion.div>

          {/* Quick Actions */}
          <motion.div 
            className="mt-12"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            <div className="bg-gradient-to-br from-primary/10 via-primary/5 to-accent/10 backdrop-blur-xl border border-primary/20 rounded-3xl p-8 text-center">
              <h3 className="text-2xl font-black text-foreground mb-3">
                هل تريد استكشاف المزيد؟
              </h3>
              <p className="text-muted-foreground mb-6">
                اكتشف كورسات جديدة وطوّر مهاراتك في اللغة العربية
              </p>
              <Button 
                size="lg"
                onClick={() => navigate('/courses')}
                className="rounded-xl px-8 font-bold shadow-lg shadow-primary/25"
              >
                <Sparkles className="h-5 w-5 ml-2" />
                استكشف الكورسات
              </Button>
            </div>
          </motion.div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Dashboard;
