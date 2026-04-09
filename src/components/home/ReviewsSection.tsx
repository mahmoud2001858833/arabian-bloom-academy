import { useEffect, useState } from 'react';
import { Star, MessageSquare, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { useLanguage } from '@/i18n/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface Review {
  id: string;
  rating: number;
  comment: string | null;
  created_at: string;
  user_id: string;
  profile?: { full_name: string | null };
}

const ReviewsSection = () => {
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
      .order('created_at', { ascending: false })
      .limit(10);

    if (data) {
      // Fetch profiles for display names
      const userIds = data.map(r => r.user_id);
      const { data: profiles } = await supabase
        .from('profiles')
        .select('user_id, full_name')
        .in('user_id', userIds);

      const enriched = data.map(r => ({
        ...r,
        profile: profiles?.find(p => p.user_id === r.user_id) || { full_name: null },
      }));
      setReviews(enriched);
    }

    // Check if current user has a review
    if (user) {
      const { data: myReview } = await supabase
        .from('reviews')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();
      if (myReview) {
        setUserReview(myReview as Review);
        setRating(myReview.rating);
        setComment(myReview.comment || '');
      }
    }
  };

  const handleSubmit = async () => {
    if (!user) return;
    setSubmitting(true);

    if (userReview) {
      await supabase
        .from('reviews')
        .update({ rating, comment, updated_at: new Date().toISOString() })
        .eq('id', userReview.id);
    } else {
      await supabase
        .from('reviews')
        .insert({ user_id: user.id, rating, comment });
    }

    toast({ title: t('reviews.thankYou'), description: t('reviews.reviewSaved') });
    setShowDialog(false);
    fetchReviews();
    setSubmitting(false);
  };

  const avgRating = reviews.length > 0
    ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1)
    : '0';

  return (
    <section className="py-20 bg-gradient-to-b from-white to-purple-50/50">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 bg-accent/10 text-accent px-4 py-2 rounded-full mb-4">
            <Star className="h-4 w-4 fill-accent" />
            <span className="font-bold text-sm">{t('reviews.badge')}</span>
          </div>
          <h2 className="text-3xl md:text-4xl font-black text-foreground mb-2">
            {t('reviews.title')}
          </h2>
          <p className="text-muted-foreground max-w-lg mx-auto">{t('reviews.subtitle')}</p>
          
          {/* Average rating */}
          {reviews.length > 0 && (
            <div className="flex items-center justify-center gap-2 mt-4">
              <div className="flex">
                {[1, 2, 3, 4, 5].map(s => (
                  <Star key={s} className={`h-5 w-5 ${s <= Math.round(Number(avgRating)) ? 'fill-accent text-accent' : 'text-muted-foreground/30'}`} />
                ))}
              </div>
              <span className="text-2xl font-black text-foreground">{avgRating}</span>
              <span className="text-muted-foreground">({reviews.length} {t('reviews.reviewsCount')})</span>
            </div>
          )}
        </div>

        {/* Reviews Grid */}
        {reviews.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            {reviews.map(review => (
              <Card key={review.id} className="border-primary/10 hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-center gap-2 mb-3">
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
          <div className="text-center py-8 text-muted-foreground">
            <MessageSquare className="h-12 w-12 mx-auto mb-3 opacity-30" />
            <p>{t('reviews.noReviews')}</p>
          </div>
        )}

        {/* Add Review Button */}
        {user && (
          <div className="text-center">
            <Button
              onClick={() => setShowDialog(true)}
              className="rounded-xl gap-2"
              variant="outline"
            >
              <Plus className="h-4 w-4" />
              {userReview ? t('reviews.editReview') : t('reviews.addReview')}
            </Button>
          </div>
        )}

        {/* Review Dialog */}
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
    </section>
  );
};

export default ReviewsSection;
