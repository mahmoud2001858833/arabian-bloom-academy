import { useEffect, useState, useRef } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import PageTransition from '@/components/layout/PageTransition';
import { Button } from '@/components/ui/button';
import { CheckCircle, BookOpen, Loader2 } from 'lucide-react';

const PaymentSuccess = () => {
  const [searchParams] = useSearchParams();
  const courseId = searchParams.get('course');
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const [courseName, setCourseName] = useState('');
  const [enrolled, setEnrolled] = useState(false);
  const [working, setWorking] = useState(true);
  const ranRef = useRef(false);

  useEffect(() => {
    if (!courseId) return;
    supabase
      .from('courses')
      .select('title')
      .eq('id', courseId)
      .maybeSingle()
      .then(({ data }) => data && setCourseName(data.title));
  }, [courseId]);

  // Immediately ensure enrollment exists (client-side fallback) then redirect
  useEffect(() => {
    if (!courseId || authLoading || ranRef.current) return;
    if (!user) {
      // Need login — send to auth then back here
      navigate(`/auth?redirect=/payment-success?course=${courseId}`);
      return;
    }
    ranRef.current = true;

    const ensureEnrollmentAndGo = async () => {
      // Check existing
      const { data: existing } = await supabase
        .from('enrollments')
        .select('id')
        .eq('course_id', courseId)
        .eq('user_id', user.id)
        .maybeSingle();

      if (!existing) {
        // Create instantly (RLS allows users to insert their own)
        await supabase.from('enrollments').insert({
          course_id: courseId,
          user_id: user.id,
        });
      }

      setEnrolled(true);
      setWorking(false);

      // Auto-redirect after a short celebratory pause
      setTimeout(() => {
        navigate(`/courses/${courseId}`);
      }, 1500);
    };

    ensureEnrollmentAndGo();
  }, [courseId, user, authLoading, navigate]);

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

          {working ? (
            <div className="flex items-center justify-center gap-2 text-muted-foreground">
              <Loader2 className="w-5 h-5 animate-spin" />
              <span>جاري تفعيل الكورس وفتحه...</span>
            </div>
          ) : (
            <div className="space-y-3">
              <p className="text-green-600 font-medium">
                ✅ تم تفعيل الكورس — يتم فتحه الآن...
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
