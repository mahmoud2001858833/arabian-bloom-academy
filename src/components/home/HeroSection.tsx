import { Link } from 'react-router-dom';
import { Play, BookOpen, Users, Award } from 'lucide-react';
import { Button } from '@/components/ui/button';

const HeroSection = () => {
  return (
    <section className="relative min-h-[90vh] flex items-center justify-center overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-background to-accent/5" />
      <div className="absolute inset-0 opacity-30">
        <div className="absolute top-20 right-20 w-72 h-72 bg-primary/20 rounded-full blur-3xl animate-float" />
        <div className="absolute bottom-20 left-20 w-96 h-96 bg-accent/20 rounded-full blur-3xl animate-float" style={{ animationDelay: '1s' }} />
      </div>

      {/* Decorative Arabic Letters */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <span className="absolute top-1/4 right-10 text-9xl font-bold text-primary/5 select-none">ع</span>
        <span className="absolute bottom-1/4 left-10 text-9xl font-bold text-accent/10 select-none">ر</span>
        <span className="absolute top-1/2 left-1/4 text-8xl font-bold text-primary/5 select-none">ب</span>
      </div>

      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-4xl mx-auto text-center space-y-8">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 bg-accent/10 text-accent-foreground px-4 py-2 rounded-full text-sm font-medium animate-fade-in">
            <Award className="h-4 w-4 text-accent" />
            <span>المنصة الأولى لتعلم العربية</span>
          </div>

          {/* Main Heading */}
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold leading-tight animate-fade-in" style={{ animationDelay: '0.1s' }}>
            <span className="text-gradient">أتقن اللغة العربية</span>
            <br />
            <span className="text-foreground">بطريقة احترافية</span>
          </h1>

          {/* Description */}
          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto animate-fade-in" style={{ animationDelay: '0.2s' }}>
            انطلق في رحلة تعلم اللغة العربية مع أفضل المعلمين والمناهج التفاعلية.
            كورسات متنوعة تناسب جميع المستويات مع متابعة لتقدمك.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-fade-in" style={{ animationDelay: '0.3s' }}>
            <Button size="lg" className="bg-gradient-primary hover:opacity-90 text-lg px-8 py-6 shadow-elegant" asChild>
              <Link to="/courses">
                <BookOpen className="ml-2 h-5 w-5" />
                تصفح الكورسات
              </Link>
            </Button>
            <Button size="lg" variant="outline" className="text-lg px-8 py-6 border-2" asChild>
              <Link to="/auth?tab=signup">
                <Play className="ml-2 h-5 w-5" />
                ابدأ مجاناً
              </Link>
            </Button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-8 pt-12 animate-fade-in" style={{ animationDelay: '0.4s' }}>
            <div className="text-center">
              <div className="text-3xl md:text-4xl font-bold text-primary">+500</div>
              <div className="text-sm text-muted-foreground mt-1">درس تعليمي</div>
            </div>
            <div className="text-center">
              <div className="text-3xl md:text-4xl font-bold text-accent">+1000</div>
              <div className="text-sm text-muted-foreground mt-1">طالب مسجل</div>
            </div>
            <div className="text-center">
              <div className="text-3xl md:text-4xl font-bold text-primary">+50</div>
              <div className="text-sm text-muted-foreground mt-1">كورس متاح</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
