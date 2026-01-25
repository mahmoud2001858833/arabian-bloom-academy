import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import HeroSection from '@/components/home/HeroSection';
import FeaturedCourses from '@/components/home/FeaturedCourses';
import WhyUs from '@/components/home/WhyUs';

const Index = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 pt-16">
        <HeroSection />
        <FeaturedCourses />
        <WhyUs />
      </main>
      <Footer />
    </div>
  );
};

export default Index;
