import { useEffect, useState } from 'react';
import { Star, Plus, MessageSquare } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { useLanguage } from '@/i18n/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import PageTransition from '@/components/layout/PageTransition';

interface Review {
  id: string;
  rating: number;
  comment: string | null;
  created_at: string;
  user_id: string;
  profile?: { full_name: string | null };
}

const Reviews = () => {
  const { t } = useLanguage();
  const { user } = useAuth();
  const { toast } = useToast();
  const [reviews, setReviews] = useState<Review[]>([]);
  const [showDialog, setShowDialog] = useState(false);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [userReview, setUserReview] = useState<Review | null>(null);

  useEffect(() => {
    fetchReviews();
  }, []);

  const fetchReviews = async () => {
    const { data } = await supabase
      .from('reviews')
      .select('*')
      .eq('is_approved', true)
      .order('created_at', { ascending: false });

    if (data) {
      const userIds = data.map(r => r.user_id);
      const { data: profiles } = await supabase
        .from('profiles')
        .select('user_id, full_name')
        .in('user_id', userIds);

      setReviews(data.map(r => ({
        ...r,
        profile: profiles?.find(p => p.user_id === r.user_id) || { full_name: null },
      })));
    }

    if (user) {
      // No longer restricting to single review - user can add multiple
      setUserReview(null);
    }
  };

  const handleSubmit = async () => {
    if (!user) return;
    setSubmitting(true);
    await supabase.from('reviews').insert({ user_id: user.id, rating, comment });
    toast({ title: t('reviews.thankYou'), description: t('reviews.reviewSaved') });
    setShowDialog(false);
    setRating(5);
    setComment('');
    fetchReviews();
    setSubmitting(false);
  };

  const avgRating = reviews.length > 0
    ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1)
    : '0';

  return (
    <PageTransition>
      <div className="min-h-screen flex flex-col bg-gradient-to-br from-purple-50/50 via-white to-purple-100/30">
        <Navbar />
        <main className="flex-1 pt-28 pb-16">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <div className="inline-flex items-center gap-2 bg-accent/10 text-accent px-4 py-2 rounded-full mb-4">
                <Star className="h-4 w-4 fill-accent" />
                <span className="font-bold text-sm">{t('reviews.badge')}</span>
              </div>
              <h1 className="text-4xl md:text-5xl font-black text-foreground mb-3">
                {t('reviews.title')}
              </h1>
              <p className="text-muted-foreground max-w-lg mx-auto">{t('reviews.subtitle')}</p>

              {reviews.length > 0 && (
                <div className="flex items-center justify-center gap-2 mt-4">
                  <div className="flex">
                    {[1, 2, 3, 4, 5].map(s => (
                      <Star key={s} className={`h-6 w-6 ${s <= Math.round(Number(avgRating)) ? 'fill-accent text-accent' : 'text-muted-foreground/30'}`} />
                    ))}
                  </div>
                  <span className="text-3xl font-black text-foreground">{avgRating}</span>
                  <span className="text-muted-foreground">({reviews.length} {t('reviews.reviewsCount')})</span>
                </div>
              )}

              {user && (
                <Button onClick={() => { setRating(5); setComment(''); setShowDialog(true); }} className="mt-6 rounded-xl gap-2">
                  <Plus className="h-4 w-4" />
                  {t('reviews.addReview')}
                </Button>
              )}
            </div>

            {reviews.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {reviews.map(review => (
                  <Card key={review.id} className="border-primary/10 hover:shadow-lg transition-shadow">
                    <CardContent className="p-6">
                      <div className="flex items-center gap-3 mb-3">
                        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold">
                          {(review.profile?.full_name || '?').charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p className="font-bold text-sm">{review.profile?.full_name || t('reviews.anonymous')}</p>
                          <div className="flex">
                            {[1, 2, 3, 4, 5].map(s => (
                              <Star key={s} className={`h-3 w-3 ${s <= review.rating ? 'fill-accent text-accent' : 'text-muted-foreground/30'}`} />
                            ))}
                          </div>
                        </div>
                      </div>
                      {review.comment && (
                        <p className="text-muted-foreground text-sm leading-relaxed">{review.comment}</p>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="text-center py-16 text-muted-foreground">
                <MessageSquare className="h-16 w-16 mx-auto mb-4 opacity-30" />
                <p className="text-lg">{t('reviews.noReviews')}</p>
              </div>
            )}
          </div>
        </main>
        <Footer />

        <Dialog open={showDialog} onOpenChange={setShowDialog}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle className="text-xl font-black">
                {userReview ? t('reviews.editReview') : t('reviews.addReview')}
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="flex justify-center gap-2">
                {[1, 2, 3, 4, 5].map(s => (
                  <button key={s} onClick={() => setRating(s)} className="transition-transform hover:scale-125">
                    <Star className={`h-8 w-8 ${s <= rating ? 'fill-accent text-accent' : 'text-muted-foreground/30'}`} />
                  </button>
                ))}
              </div>
              <Textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder={t('reviews.commentPlaceholder')}
                rows={4}
                className="rounded-xl"
              />
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowDialog(false)} className="rounded-xl">
                {t('common.cancel')}
              </Button>
              <Button onClick={handleSubmit} disabled={submitting} className="rounded-xl">
                {submitting ? t('common.loading') : t('common.save')}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </PageTransition>
  );
};

export default Reviews;