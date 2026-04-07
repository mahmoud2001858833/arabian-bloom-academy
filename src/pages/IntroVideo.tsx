import { useEffect, useState } from 'react';
import { useLanguage } from '@/i18n/LanguageContext';
import { supabase } from '@/integrations/supabase/client';
import VideoPlayer from '@/components/dashboard/VideoPlayer';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import PageTransition from '@/components/layout/PageTransition';
import { Play } from 'lucide-react';

const IntroVideo = () => {
  const { t } = useLanguage();
  const [introVideoUrl, setIntroVideoUrl] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchIntroVideo = async () => {
      const { data } = await supabase
        .from('site_settings')
        .select('value')
        .eq('key', 'intro_video_url')
        .single();
      if (data?.value) setIntroVideoUrl(data.value);
      setIsLoading(false);
    };
    fetchIntroVideo();
  }, []);

  return (
    <PageTransition>
      <div className="min-h-screen flex flex-col bg-gradient-to-br from-purple-50/50 via-white to-purple-100/30">
        <Navbar />
        <main className="flex-1 pt-24">
          <section className="py-20 bg-gradient-to-b from-background to-purple-50/30">
            <div className="container mx-auto px-4">
              <div className="text-center mb-10 space-y-3">
                <h1 className="text-3xl md:text-4xl font-black text-foreground flex items-center justify-center gap-3">
                  <Play className="h-8 w-8 text-primary" />
                  {t('home.introVideoTitle')}
                </h1>
                <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
                  {t('home.introVideoDescription')}
                </p>
              </div>

              {isLoading ? (
                <div className="flex items-center justify-center py-20">
                  <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary border-t-transparent" />
                </div>
              ) : introVideoUrl ? (
                <div className="max-w-4xl mx-auto rounded-2xl overflow-hidden shadow-2xl shadow-primary/10 border border-primary/10">
                  <VideoPlayer videoKey={introVideoUrl} />
                </div>
              ) : (
                <div className="text-center py-20">
                  <p className="text-muted-foreground text-lg">لا يوجد فيديو تعريفي حالياً</p>
                </div>
              )}
            </div>
          </section>
        </main>
        <Footer />
      </div>
    </PageTransition>
  );
};

export default IntroVideo;
