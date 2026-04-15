import { useEffect, useState } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/i18n/LanguageContext';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import PageTransition from '@/components/layout/PageTransition';
import { Button } from '@/components/ui/button';
import { CheckCircle, BookOpen, Loader2 } from 'lucide-react';

const PaymentSuccess = () => {
  const [searchParams] = useSearchParams();
  const courseId = searchParams.get('course');
  const navigate = useNavigate();
  const { user } = useAuth();
  const { t } = useLanguage();
  const [courseName, setCourseName] = useState('');
  const [enrolled, setEnrolled] = useState(false);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    if (!courseId) return;

    const fetchCourse = async () => {
      const { data } = await supabase
        .from('courses')
        .select('title')
        .eq('id', courseId)
        .maybeSingle();
      if (data) setCourseName(data.title);
    };

    fetchCourse();
  }, [courseId]);

  // Poll for enrollment (webhook may take a moment)
  useEffect(() => {
    if (!courseId || !user) return;

    let attempts = 0;
    const maxAttempts = 15;

    const checkEnrollment = async () => {
      const { data } = await supabase
        .from('enrollments')
        .select('id')
        .eq('course_id', courseId)
        .eq('user_id', user.id)
        .maybeSingle();

      if (data) {
        setEnrolled(true);
        setChecking(false);
        return true;
      }
      return false;
    };

    const poll = async () => {
      const found = await checkEnrollment();
      if (!found && attempts < maxAttempts) {
        attempts++;
        setTimeout(poll, 2000);
      } else if (!found) {
        setChecking(false);
      }
    };

    poll();
  }, [courseId, user]);

  return (
    <PageTransition>
      <Navbar />
      <div className="min-h-screen flex items-center justify-center bg-background px-4">
        <div className="text-center max-w-md space-y-6">
          <div className="mx-auto w-20 h-20 rounded-full bg-green-100 flex items-center justify-center">
            <CheckCircle className="w-12 h-12 text-green-600" />
          </div>

          <h1 className="text-3xl font-bold text-foreground">
            تم الدفع بنجاح! 🎉
          </h1>

          <p className="text-muted-foreground text-lg">
            {courseName
              ? `تم تسجيلك في "${courseName}" بنجاح`
              : 'تم إتمام عملية الدفع بنجاح'}
          </p>

          {checking ? (
            <div className="flex items-center justify-center gap-2 text-muted-foreground">
              <Loader2 className="w-5 h-5 animate-spin" />
              <span>جاري تفعيل الكورس...</span>
            </div>
          ) : enrolled ? (
            <div className="space-y-3">
              <p className="text-green-600 font-medium">
                ✅ تم تفعيل الكورس — يمكنك البدء فوراً!
              </p>
              <Button
                size="lg"
                className="w-full"
                onClick={() => navigate(`/courses/${courseId}`)}
              >
                <BookOpen className="w-5 h-5 ml-2" />
                ابدأ الدراسة الآن
              </Button>
            </div>
          ) : (
            <div className="space-y-3">
              <p className="text-amber-600 text-sm">
                قد يستغرق تفعيل الكورس دقيقة واحدة. يمكنك الانتقال للكورس وتحديث الصفحة.
              </p>
              <Button
                size="lg"
                className="w-full"
                onClick={() => navigate(`/courses/${courseId}`)}
              >
                <BookOpen className="w-5 h-5 ml-2" />
                الذهاب للكورس
              </Button>
            </div>
          )}

          <Link
            to="/courses"
            className="text-sm text-muted-foreground hover:text-primary underline block"
          >
            العودة لقائمة الدروس
          </Link>
        </div>
      </div>
      <Footer />
    </PageTransition>
  );
};

export default PaymentSuccess;
