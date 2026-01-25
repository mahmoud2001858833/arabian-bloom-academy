import { Link } from 'react-router-dom';
import { ArrowLeft, Sparkles, BookOpen, Star, Award, Gem, Crown } from 'lucide-react';
import { Button } from '@/components/ui/button';

const FeaturedCourses = () => {
  return (
    <section className="py-28 bg-background relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0">
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-accent/5 rounded-full blur-[150px]" />
        <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-primary/5 rounded-full blur-[120px]" />
      </div>
      
      {/* Floating Decorative Elements */}
      <div className="absolute top-32 left-16 w-24 h-24 rounded-full bg-gradient-to-br from-accent/20 to-accent/5 backdrop-blur-sm border border-accent/20 animate-float flex items-center justify-center">
        <Star className="h-10 w-10 text-accent/60" />
      </div>
      <div className="absolute bottom-40 right-24 w-20 h-20 rounded-full bg-gradient-to-br from-primary/20 to-primary/5 backdrop-blur-sm border border-primary/20 animate-float flex items-center justify-center" style={{ animationDelay: '1.5s' }}>
        <Crown className="h-8 w-8 text-primary/60" />
      </div>

      <div className="container mx-auto px-4 relative z-10">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-20">
          <div className="inline-flex items-center gap-2 bg-accent/10 backdrop-blur-sm px-6 py-3 rounded-full text-sm font-bold mb-8 border border-accent/30 text-accent">
            <Sparkles className="h-5 w-5" />
            رحلة التعلم تبدأ هنا
          </div>
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-black mb-8">
            ابدأ رحلتك مع{' '}
            <span className="text-accent" style={{ textShadow: '0 0 30px rgba(212, 175, 55, 0.3)' }}>
              العربية
            </span>
          </h2>
          <p className="text-xl text-muted-foreground leading-relaxed">
            منصتنا توفر لك تجربة تعليمية فريدة مع محتوى عربي أصيل ومعلمين متخصصين
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-20">
          {[
            {
              icon: BookOpen,
              title: 'محتوى تفاعلي',
              description: 'دروس فيديو عالية الجودة مع تمارين تفاعلية وأنشطة متنوعة تناسب جميع الأعمار',
            },
            {
              icon: Award,
              title: 'شهادات معتمدة',
              description: 'احصل على شهادات إتمام معتمدة بعد إنهاء كل كورس تثبت تقدمك',
            },
            {
              icon: Gem,
              title: 'جودة عالية',
              description: 'محتوى مصمم بعناية من قبل خبراء في تعليم اللغة العربية',
            },
          ].map((feature, index) => {
            const IconComponent = feature.icon;
            return (
              <div 
                key={index}
                className="group relative animate-fade-in"
                style={{ animationDelay: `${index * 0.15}s` }}
              >
                {/* Glow */}
                <div className="absolute inset-0 bg-gradient-to-br from-accent/20 to-transparent rounded-3xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                
                {/* Card */}
                <div className="relative bg-card/50 backdrop-blur-md rounded-3xl p-8 border border-border/50 hover:border-accent/40 transition-all duration-300 hover:-translate-y-2 h-full">
                  <div className="w-16 h-16 rounded-2xl bg-accent/10 border border-accent/30 flex items-center justify-center mb-6 group-hover:scale-110 group-hover:bg-accent/20 transition-all">
                    <IconComponent className="h-8 w-8 text-accent" />
                  </div>
                  <h3 className="text-xl font-bold mb-4 group-hover:text-accent transition-colors">{feature.title}</h3>
                  <p className="text-muted-foreground leading-relaxed">{feature.description}</p>
                </div>
              </div>
            );
          })}
        </div>

        {/* CTA Section */}
        <div className="relative">
          {/* Background Glow */}
          <div className="absolute inset-0 bg-gradient-to-r from-accent/20 via-accent/10 to-accent/20 rounded-3xl blur-2xl" />
          
          {/* Card */}
          <div className="relative bg-gradient-to-br from-card/80 to-card/60 backdrop-blur-xl rounded-3xl p-12 md:p-16 border border-accent/20 text-center overflow-hidden">
            {/* Decorative Elements */}
            <div className="absolute top-4 right-4 opacity-20">
              <Star className="h-20 w-20 text-accent" />
            </div>
            <div className="absolute bottom-4 left-4 opacity-20">
              <Gem className="h-16 w-16 text-accent" />
            </div>
            
            <h3 className="text-3xl md:text-4xl lg:text-5xl font-black mb-6">
              مستعد لبدء{' '}
              <span className="text-accent">رحلة التعلم</span>؟
            </h3>
            <p className="text-lg md:text-xl text-muted-foreground mb-10 max-w-2xl mx-auto leading-relaxed">
              انضم إلى آلاف الطلاب الذين يتعلمون اللغة العربية معنا. ابدأ اليوم واكتشف جمال اللغة العربية.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Button 
                size="lg" 
                className="rounded-2xl px-12 py-7 text-lg"
                asChild
              >
                <Link to="/courses">
                  تصفح الكورسات
                  <ArrowLeft className="mr-2 h-5 w-5" />
                </Link>
              </Button>
              <Button 
                size="lg" 
                variant="outline"
                className="rounded-2xl px-12 py-7 text-lg"
                asChild
              >
                <Link to="/auth?tab=signup">
                  إنشاء حساب مجاني
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default FeaturedCourses;
