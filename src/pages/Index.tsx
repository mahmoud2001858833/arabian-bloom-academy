import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import HeroSection from '@/components/home/HeroSection';
import FeaturedCourses from '@/components/home/FeaturedCourses';
import WhyUs from '@/components/home/WhyUs';
import ReviewsSection from '@/components/home/ReviewsSection';
import AnnouncementBar from '@/components/home/AnnouncementBar';
import PageTransition from '@/components/layout/PageTransition';

const Index = () => {
  return (
    <PageTransition>
      <div className="min-h-screen flex flex-col bg-gradient-to-br from-purple-50/50 via-white to-purple-100/30">
        <Navbar />
        <div className="pt-24">
          <AnnouncementBar />
        </div>
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
