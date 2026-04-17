import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useLanguage } from '@/i18n/LanguageContext';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import HeroSection from '@/components/home/HeroSection';
import FeaturedCourses from '@/components/home/FeaturedCourses';
import WhyUs from '@/components/home/WhyUs';
import ReviewsSection from '@/components/home/ReviewsSection';
import AnnouncementBar from '@/components/home/AnnouncementBar';
import PageTransition from '@/components/layout/PageTransition';

const Index = () => {
  const { language } = useLanguage();
  const [hasAnnouncement, setHasAnnouncement] = useState(false);

  useEffect(() => {
    const check = async () => {
      const { data: activeData } = await supabase
        .from('site_settings')
        .select('value')
        .eq('key', 'announcement_bar_active')
        .maybeSingle();
      const isActive = activeData?.value === 'true';
      if (!isActive) {
        setHasAnnouncement(false);
        return;
      }
      const keys = [
        'announcement_bar_text',
        `announcement_bar_text_${language}`,
      ];
      const { data } = await supabase
        .from('site_settings')
        .select('key, value')
        .in('key', keys);
      const hasText = (data || []).some((d) => d.value && d.value.trim().length > 0);
      setHasAnnouncement(hasText);
    };
    check();
  }, [language]);

  return (
    <PageTransition>
      <div className="min-h-screen flex flex-col bg-gradient-to-br from-purple-50/50 via-white to-purple-100/30">
        <Navbar />
        {hasAnnouncement && (
          <div className="pt-24">
            <AnnouncementBar />
          </div>
        )}
        <main className="flex-1">
          <HeroSection />
          <FeaturedCourses />
          <ReviewsSection />
          <WhyUs />
        </main>
        <Footer />
      </div>
    </PageTransition>
  );
};

export default Index;
