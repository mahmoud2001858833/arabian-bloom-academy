import { useEffect, useState } from 'react';
import { useLanguage } from '@/i18n/LanguageContext';
import VideoPlayer from '@/components/dashboard/VideoPlayer';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import PageTransition from '@/components/layout/PageTransition';
import { Play } from 'lucide-react';
import { cn } from '@/lib/utils';
import { fetchIntroVideos, type IntroVideo as IntroVideoItem } from '@/lib/introVideos';
import najatSeal from '@/assets/najat-seal.png.asset.json';

const IntroVideo = () => {
  const { t } = useLanguage();
  const [videos, setVideos] = useState<IntroVideoItem[]>([]);
  const [activeIndex, setActiveIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchIntroVideos()
      .then(setVideos)
      .finally(() => setIsLoading(false));
  }, []);

  const active = videos[activeIndex];

  return (
    <PageTransition>
      <div className="min-h-screen flex flex-col bg-gradient-to-br from-purple-50/50 via-white to-purple-100/30">
        <Navbar />
        <main className="flex-1 pt-24">
          <section className="py-20 bg-gradient-to-b from-background to-purple-50/30">
            <div className="container mx-auto px-4">
              <div className="text-center mb-10 space-y-4">
                <div className="relative mx-auto w-32 h-32 md:w-40 md:h-40">
                  <div className="absolute inset-0 rounded-full bg-accent/20 blur-2xl" aria-hidden="true" />
                  <img
                    src={najatSeal.url}
                    alt="شعار النجاة لتعليم اللغة العربية"
                    loading="lazy"
                    className="relative w-full h-full object-contain drop-shadow-[0_10px_25px_hsl(var(--primary)/0.25)]"
                  />
                </div>
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
              ) : active ? (
                <div className="max-w-4xl mx-auto space-y-6">
                  <div className="rounded-2xl overflow-hidden shadow-2xl shadow-primary/10 border border-primary/10">
                    <VideoPlayer key={active.key} videoKey={active.key} />
                  </div>

                  {active.title && (
                    <h2 className="text-xl font-bold text-foreground text-center">{active.title}</h2>
                  )}

                  {videos.length > 1 && (
                    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                      {videos.map((video, index) => (
                        <button
                          key={video.key}
                          onClick={() => setActiveIndex(index)}
                          className={cn(
                            'flex items-center gap-3 rounded-xl border p-3 text-right transition-colors',
                            index === activeIndex
                              ? 'border-primary bg-primary/5'
                              : 'border-primary/10 bg-white hover:bg-primary/5',
                          )}
                        >
                          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                            <Play className="h-4 w-4" />
                          </span>
                          <span className="text-sm font-semibold text-foreground line-clamp-2">
                            {video.title?.trim() || `الفيديو التعريفي ${index + 1}`}
                          </span>
                        </button>
                      ))}
                    </div>
                  )}
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
