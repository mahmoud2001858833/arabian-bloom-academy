import { useEffect, useState } from 'react';
import { BookOpen, Download, ShoppingCart, Loader2 } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { useLanguage } from '@/i18n/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { usePaddleCheckout } from '@/hooks/usePaddleCheckout';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import PageTransition from '@/components/layout/PageTransition';

interface Book {
  id: string;
  title: string;
  description: string | null;
  price: number;
  currency: string;
  pdf_url: string | null;
  cover_image_url: string | null;
}

// Map book UUIDs to Paddle price IDs (must match payments-webhook PRODUCT_TO_BOOK)
const BOOK_PRICE_MAP: Record<string, string> = {
  'fc989232-a403-465d-a582-ba66d70fa308': 'book_electrical_camel_onetime',
};

const Books = () => {
  const { t } = useLanguage();
  const { user } = useAuth();
  const { toast } = useToast();
  const { openCheckout } = usePaddleCheckout();
  const [books, setBooks] = useState<Book[]>([]);
  const [purchases, setPurchases] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [buying, setBuying] = useState<string | null>(null);

  useEffect(() => {
    fetchBooks();
    if (user) fetchPurchases();
  }, [user]);

  const fetchBooks = async () => {
    const { data } = await supabase.from('books').select('*').eq('is_published', true).order('created_at', { ascending: false });
    setBooks((data as Book[]) || []);
    setLoading(false);
  };

  const fetchPurchases = async () => {
    if (!user) return;
    const { data } = await supabase.from('book_purchases').select('book_id').eq('user_id', user.id).eq('status', 'completed');
    setPurchases((data || []).map(p => p.book_id));
  };

  const handleBuy = async (book: Book) => {
    if (!user) {
      toast({ title: t('exams.loginRequired'), variant: 'destructive' });
      return;
    }

    // Free book — record completed purchase directly
    if (book.price === 0) {
      setBuying(book.id);
      await supabase.from('book_purchases').insert({
        user_id: user.id,
        book_id: book.id,
        amount: 0,
        status: 'completed',
      });
      toast({ title: t('books.purchaseSuccess') });
      fetchPurchases();
      setBuying(null);
      return;
    }

    // Paid book — open Paddle checkout
    const priceId = BOOK_PRICE_MAP[book.id];
    if (!priceId) {
      toast({
        title: 'الدفع غير متاح',
        description: 'هذا الكتاب غير مربوط بنظام الدفع بعد. يرجى التواصل مع الدعم.',
        variant: 'destructive',
      });
      return;
    }

    setBuying(book.id);
    try {
      await openCheckout({
        priceId,
        customerEmail: user.email,
        customData: { userId: user.id, bookId: book.id },
        successUrl: `${window.location.origin}/book-success?book=${book.id}`,
      });
    } catch (e) {
      toast({ title: 'تعذر فتح صفحة الدفع', variant: 'destructive' });
    } finally {
      setBuying(null);
    }
  };

  const handleDownload = async (book: Book) => {
    if (!book.pdf_url) {
      toast({ title: 'لا يوجد ملف للتحميل بعد', variant: 'destructive' });
      return;
    }
    // Re-verify the purchase server-side via RLS
    const { data: ok } = await supabase
      .from('book_purchases')
      .select('id')
      .eq('user_id', user!.id)
      .eq('book_id', book.id)
      .eq('status', 'completed')
      .maybeSingle();
    if (!ok) {
      toast({ title: 'الشراء غير مؤكد بعد', variant: 'destructive' });
      return;
    }
    const { data } = await supabase.storage.from('book-files').createSignedUrl(book.pdf_url, 3600);
    if (data?.signedUrl) {
      window.open(data.signedUrl, '_blank');
    } else {
      toast({ title: 'خطأ', description: 'فشل في تحميل الكتاب', variant: 'destructive' });
    }
  };

  const currencySymbol = (c: string) => c === 'JOD' ? 'د.أ' : '$';

  return (
    <PageTransition>
      <div className="min-h-screen flex flex-col bg-gradient-to-br from-purple-50/50 via-white to-purple-100/30">
        <Navbar />
        <main className="flex-1 pt-28 pb-16">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-2 rounded-full mb-4">
                <BookOpen className="h-4 w-4" />
                <span className="font-bold text-sm">{t('books.badge')}</span>
              </div>
              <h1 className="text-4xl md:text-5xl font-black text-foreground mb-3">{t('books.title')}</h1>
              <p className="text-muted-foreground max-w-lg mx-auto">{t('books.subtitle')}</p>
            </div>

            {loading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[1, 2, 3].map(i => <div key={i} className="h-72 bg-white/60 rounded-3xl animate-pulse" />)}
              </div>
            ) : books.length === 0 ? (
              <div className="text-center py-20 text-muted-foreground">
                <BookOpen className="h-16 w-16 mx-auto mb-4 opacity-30" />
                <p className="text-lg">{t('books.noBooks')}</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {books.map(book => {
                  const owned = purchases.includes(book.id);
                  return (
                    <Card key={book.id} className="border-primary/10 hover:shadow-xl transition-shadow rounded-3xl overflow-hidden">
                      {book.cover_image_url && (
                        <img src={book.cover_image_url} alt={book.title} className="w-full h-48 object-cover" />
                      )}
                      <CardContent className="p-6 space-y-3">
                        <h3 className="font-bold text-xl">{book.title}</h3>
                        {book.description && <p className="text-muted-foreground text-sm line-clamp-2">{book.description}</p>}
                        <div className="flex items-center justify-between pt-2">
                          <Badge className="text-lg font-bold px-3 py-1">
                            {book.price === 0 ? t('courses.free') : `${book.price} ${currencySymbol(book.currency)}`}
                          </Badge>
                          {owned ? (
                            <Button onClick={() => handleDownload(book)} className="gap-2 rounded-xl" variant="gold">
                              <Download className="h-4 w-4" />
                              {t('books.download')}
                            </Button>
                          ) : (
                            <Button onClick={() => handleBuy(book)} disabled={buying === book.id} className="gap-2 rounded-xl">
                              {buying === book.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <ShoppingCart className="h-4 w-4" />}
                              {t('books.buy')}
                            </Button>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            )}
          </div>
        </main>
        <Footer />
      </div>
    </PageTransition>
  );
};

export default Books;
