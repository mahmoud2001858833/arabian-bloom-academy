import { Link } from 'react-router-dom';
import { ArrowLeft, Sparkles, BookOpen } from 'lucide-react';
import { Button } from '@/components/ui/button';

const FeaturedCourses = () => {
  return (
    <section className="py-24 bg-gradient-to-b from-background via-purple-50/50 to-background relative overflow-hidden">
      {/* Background Decorations */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary/5 rounded-full blur-[100px]" />
      <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-gold/5 rounded-full blur-[100px]" />
      
      {/* Floating Elements */}
      <div className="absolute top-20 left-10 w-20 h-20 rounded-full bg-gradient-to-br from-primary/10 to-gold/10 backdrop-blur-sm border border-white/20 animate-float" />
      <div className="absolute bottom-40 right-20 w-16 h-16 rounded-full bg-gradient-to-br from-gold/10 to-primary/10 backdrop-blur-sm border border-white/20 animate-float" style={{ animationDelay: '1s' }} />

      <div className="container mx-auto px-4 relative z-10">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 glass-purple px-5 py-2.5 rounded-full text-sm font-semibold mb-6 border border-primary/20 text-primary">
            <Sparkles className="h-4 w-4" />
            رحلة التعلم تبدأ هنا
          </div>
          <h2 className="text-4xl md:text-5xl font-black mb-6">
            ابدأ رحلتك مع{' '}
            <span className="text-gradient">العربية</span>
          </h2>
          <p className="text-xl text-muted-foreground leading-relaxed">
            منصتنا توفر لك تجربة تعليمية فريدة مع محتوى عربي أصيل ومعلمين متخصصين. 
            انضم إلينا اليوم وابدأ رحلة إتقان اللغة العربية.
          </p>
        </div>

        {/* Features Grid with Glassmorphism */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
          {[
            {
              title: 'محتوى تفاعلي',
              description: 'دروس فيديو عالية الجودة مع تمارين تفاعلية وأنشطة متنوعة',
              gradient: 'from-purple-500/20 to-purple-600/10',
            },
            {
              title: 'متابعة شخصية',
              description: 'تتبع تقدمك بشكل مستمر مع تقارير مفصلة عن أدائك',
              gradient: 'from-gold/20 to-gold/10',
            },
            {
              title: 'شهادات معتمدة',
              description: 'احصل على شهادات إتمام معتمدة بعد إنهاء كل كورس',
              gradient: 'from-purple-400/20 to-gold/10',
            },
          ].map((feature, index) => (
            <div 
              key={index}
              className="group relative animate-fade-in"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              {/* Glow Effect */}
              <div className={`absolute inset-0 bg-gradient-to-br ${feature.gradient} rounded-3xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500`} />
              
              {/* Card */}
              <div className="relative glass-effect rounded-3xl p-8 border border-white/20 hover:border-primary/30 transition-all duration-300 hover:-translate-y-2">
                <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${feature.gradient} flex items-center justify-center mb-6 group-hover:scale-110 transition-transform`}>
                  <BookOpen className="h-8 w-8 text-primary" />
                </div>
                <h3 className="text-xl font-bold mb-3">{feature.title}</h3>
                <p className="text-muted-foreground leading-relaxed">{feature.description}</p>
              </div>
            </div>
          ))}
        </div>

        {/* CTA Section with Glass Effect */}
        <div className="relative">
          <div className="absolute inset-0 bg-gradient-to-r from-primary/20 via-purple-500/20 to-gold/20 rounded-3xl blur-2xl" />
          <div className="relative glass-purple rounded-3xl p-12 border border-primary/20 text-center">
            <h3 className="text-3xl md:text-4xl font-bold mb-4">
              مستعد لبدء رحلة التعلم؟
            </h3>
            <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
              انضم إلى آلاف الطلاب الذين يتعلمون اللغة العربية معنا. ابدأ اليوم واكتشف جمال اللغة العربية.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Button 
                size="lg" 
                className="bg-gradient-primary hover:opacity-90 rounded-xl px-10 py-6 text-lg font-bold shadow-purple glow-purple transition-all hover:scale-105"
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
                className="rounded-xl px-10 py-6 text-lg border-2 border-primary/30 hover:bg-primary/10 transition-all"
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
