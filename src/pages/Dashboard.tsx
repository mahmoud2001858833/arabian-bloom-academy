import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { BookOpen, Clock, Award, TrendingUp } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';

const Dashboard = () => {
  const { user, loading, isAdmin } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && !user) {
      navigate('/auth');
    }
    if (!loading && isAdmin) {
      navigate('/admin');
    }
  }, [user, loading, isAdmin, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  // Demo data for student dashboard
  const enrolledCourses = [
    {
      id: '1',
      title: 'أساسيات اللغة العربية للمبتدئين',
      progress: 65,
      totalLessons: 20,
      completedLessons: 13,
      thumbnail: 'https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?w=400&h=300&fit=crop',
    },
    {
      id: '2',
      title: 'قواعد النحو العربي',
      progress: 30,
      totalLessons: 35,
      completedLessons: 10,
      thumbnail: 'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=400&h=300&fit=crop',
    },
  ];

  const stats = [
    { icon: BookOpen, label: 'كورسات مسجلة', value: '3', color: 'text-primary' },
    { icon: Clock, label: 'ساعات دراسة', value: '24', color: 'text-accent' },
    { icon: Award, label: 'اختبارات ناجحة', value: '12', color: 'text-green-500' },
    { icon: TrendingUp, label: 'معدل التقدم', value: '78%', color: 'text-primary' },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-secondary/30">
      <Navbar />
      <main className="flex-1 pt-20 pb-12">
        <div className="container mx-auto px-4">
          {/* Welcome Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold mb-2">
              مرحباً، <span className="text-gradient">{user?.user_metadata?.full_name || 'طالب'}</span>
            </h1>
            <p className="text-muted-foreground">تابع تقدمك في رحلة تعلم اللغة العربية</p>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            {stats.map((stat, index) => (
              <Card key={index} className="border-border/50">
                <CardContent className="p-6">
                  <div className="flex items-center gap-4">
                    <div className={`p-3 rounded-xl bg-primary/10 ${stat.color}`}>
                      <stat.icon className="h-6 w-6" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold">{stat.value}</p>
                      <p className="text-sm text-muted-foreground">{stat.label}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* My Courses */}
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold">كورساتي</h2>
              <Button variant="outline" onClick={() => navigate('/courses')}>
                تصفح الكورسات
              </Button>
            </div>

            {enrolledCourses.length === 0 ? (
              <Card className="border-border/50">
                <CardContent className="p-12 text-center">
                  <BookOpen className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <h3 className="text-lg font-semibold mb-2">لم تسجل في أي كورس بعد</h3>
                  <p className="text-muted-foreground mb-4">ابدأ رحلة التعلم بالتسجيل في أحد كورساتنا</p>
                  <Button className="bg-gradient-primary" onClick={() => navigate('/courses')}>
                    تصفح الكورسات
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {enrolledCourses.map((course) => (
                  <Card key={course.id} className="border-border/50 overflow-hidden">
                    <div className="flex">
                      <img
                        src={course.thumbnail}
                        alt={course.title}
                        className="w-32 h-full object-cover"
                      />
                      <div className="flex-1 p-4">
                        <h3 className="font-bold mb-2 line-clamp-1">{course.title}</h3>
                        <p className="text-sm text-muted-foreground mb-3">
                          {course.completedLessons} من {course.totalLessons} درس مكتمل
                        </p>
                        <div className="space-y-2">
                          <div className="flex justify-between text-sm">
                            <span>التقدم</span>
                            <span className="text-primary font-medium">{course.progress}%</span>
                          </div>
                          <Progress value={course.progress} className="h-2" />
                        </div>
                        <Button 
                          className="w-full mt-4 bg-gradient-primary hover:opacity-90" 
                          size="sm"
                          onClick={() => navigate(`/courses/${course.id}/learn`)}
                        >
                          متابعة التعلم
                        </Button>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Dashboard;
