import { useEffect, useState } from 'react';
import { Gift } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { useLanguage } from '@/i18n/LanguageContext';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import PageTransition from '@/components/layout/PageTransition';

interface Offer {
  id: string;
  title: string;
  description: string | null;
  image_url: string | null;
  video_url: string | null;
  is_active: boolean;
}

const Offers = () => {
  const { t } = useLanguage();
  const [offers, setOffers] = useState<Offer[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      const { data } = await supabase.from('offers').select('*').eq('is_active', true).order('created_at', { ascending: false });
      setOffers((data as Offer[]) || []);
      setLoading(false);
    };
    fetch();
  }, []);

  return (
    <PageTransition>
      <div className="min-h-screen flex flex-col bg-gradient-to-br from-purple-50/50 via-white to-purple-100/30">
        <Navbar />
        <main className="flex-1 pt-28 pb-16">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <div className="inline-flex items-center gap-2 bg-accent/10 text-accent px-4 py-2 rounded-full mb-4">
                <Gift className="h-4 w-4" />
                <span className="font-bold text-sm">{t('offers.badge')}</span>
              </div>
              <h1 className="text-4xl md:text-5xl font-black text-foreground mb-3">{t('offers.title')}</h1>
              <p className="text-muted-foreground max-w-lg mx-auto">{t('offers.subtitle')}</p>
            </div>

            {loading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[1, 2, 3].map(i => <div key={i} className="h-64 bg-white/60 rounded-3xl animate-pulse" />)}
              </div>
            ) : offers.length === 0 ? (
              <div className="text-center py-20 text-muted-foreground">
                <Gift className="h-16 w-16 mx-auto mb-4 opacity-30" />
                <p className="text-lg">{t('offers.noOffers')}</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {offers.map(offer => (
                  <Card key={offer.id} className="border-accent/20 hover:shadow-xl transition-shadow rounded-3xl overflow-hidden">
                    {offer.image_url && (
                      <img src={offer.image_url} alt={offer.title} className="w-full h-48 object-cover" />
                    )}
                    <CardContent className="p-6">
                      <h3 className="font-bold text-xl mb-2">{offer.title}</h3>
                      {offer.description && <p className="text-muted-foreground text-sm leading-relaxed">{offer.description}</p>}
                      {offer.video_url && (
                        <a href={offer.video_url} target="_blank" rel="noopener noreferrer" className="inline-block mt-3 text-sm text-primary font-bold hover:underline">
                          🎬 {t('offers.watchVideo')}
                        </a>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </main>
        <Footer />
      </div>
    </PageTransition>
  );
};

export default Offers;
