import { useEffect, useState, useRef } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import PageTransition from '@/components/layout/PageTransition';
import { Button } from '@/components/ui/button';
import { CheckCircle, BookOpen, Loader2 } from 'lucide-react';

const BookPaymentSuccess = () => {
  const [searchParams] = useSearchParams();
  const bookId = searchParams.get('book');
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const [status, setStatus] = useState<'waiting' | 'confirmed' | 'timeout'>('waiting');
  const attemptsRef = useRef(0);

  useEffect(() => {
    if (!bookId || authLoading) return;
    if (!user) {
      navigate(`/auth?redirect=/book-success?book=${bookId}`);
      return;
    }

    let cancelled = false;

    const poll = async () => {
      while (!cancelled && attemptsRef.current < 20) {
        attemptsRef.current += 1;
        const { data } = await supabase
          .from('book_purchases')
          .select('id')
          .eq('user_id', user.id)
          .eq('book_id', bookId)
          .eq('status', 'completed')
          .maybeSingle();

        if (data) {
          setStatus('confirmed');
          setTimeout(() => navigate('/books'), 1500);
          return;
        }
        await new Promise(r => setTimeout(r, 1500));
      }
      if (!cancelled) setStatus('timeout');
    };

    poll();
    return () => { cancelled = true; };
  }, [bookId, user, authLoading, navigate]);

  return (
    <PageTransition>
      <Navbar />
      <div className="min-h-screen flex items-center justify-center bg-background px-4">
        <div className="text-center max-w-md space-y-6">
          <div className="mx-auto w-20 h-20 rounded-full bg-green-100 flex items-center justify-center">
            <CheckCircle className="w-12 h-12 text-green-600" />
          </div>
          <h1 className="text-3xl font-bold text-foreground">تم الدفع بنجاح! 🎉</h1>

          {status === 'waiting' && (
            <div className="flex items-center justify-center gap-2 text-muted-foreground">
              <Loader2 className="w-5 h-5 animate-spin" />
              <span>جاري تأكيد الدفع وفتح الكتاب...</span>
            </div>
          )}

          {status === 'confirmed' && (
            <div className="space-y-3">
              <p className="text-green-600 font-medium">✅ تم تفعيل الكتاب — يفتح الآن للتحميل</p>
              <Button size="lg" className="w-full" onClick={() => navigate('/books')}>
                <BookOpen className="w-5 h-5 ml-2" />
                اذهب لتحميل الكتاب
              </Button>
            </div>
          )}

          {status === 'timeout' && (
            <div className="space-y-3">
              <p className="text-muted-foreground">
                لم يصل تأكيد الدفع بعد. عادة يستغرق ثوانٍ معدودة. يمكنك العودة لصفحة الكتب وتحديثها بعد لحظات.
              </p>
              <Button size="lg" className="w-full" onClick={() => navigate('/books')}>العودة للكتب</Button>
            </div>
          )}

          <Link to="/books" className="text-sm text-muted-foreground hover:text-primary underline block">
            العودة لقائمة الكتب
          </Link>
        </div>
      </div>
      <Footer />
    </PageTransition>
  );
};

export default BookPaymentSuccess;
