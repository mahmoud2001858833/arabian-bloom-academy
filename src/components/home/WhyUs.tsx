import { Link } from 'react-router-dom';
import { Users, Award, Clock, Headphones, BookOpen, GraduationCap, Sparkles, Crown, Star } from 'lucide-react';
import { Button } from '@/components/ui/button';

const features = [
  {
    icon: BookOpen,
    title: 'محتوى متكامل',
    description: 'مناهج تعليمية شاملة تغطي جميع جوانب اللغة العربية من القواعد إلى الأدب',
  },
  {
    icon: GraduationCap,
    title: 'معلمون متخصصون',
    description: 'فريق من أفضل معلمي اللغة العربية بخبرة واسعة في التعليم',
  },
  {
    icon: Clock,
    title: 'تعلم بمرونة',
    description: 'تعلم في أي وقت ومن أي مكان بما يناسب جدولك الشخصي',
  },
  {
    icon: Award,
    title: 'شهادات معتمدة',
    description: 'احصل على شهادات إتمام معترف بها لتوثيق تقدمك',
  },
  {
    icon: Headphones,
    title: 'دعم مستمر',
    description: 'فريق دعم متواجد للإجابة على استفساراتك ومساعدتك',
  },
  {
    icon: Users,
    title: 'مجتمع تعليمي',
    description: 'انضم لمجتمع من المتعلمين وشارك تجربتك مع الآخرين',
  },
];

const WhyUs = () => {
  return (
    <section className="py-28 bg-secondary/30 relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0">
        <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-accent/5 rounded-full blur-[150px]" />
        <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] bg-primary/5 rounded-full blur-[120px]" />
      </div>

      {/* Floating Elements */}
      <div className="absolute top-20 right-16 w-16 h-16 rounded-full bg-accent/10 border border-accent/20 flex items-center justify-center animate-float">
        <Crown className="h-7 w-7 text-accent" />
      </div>
      <div className="absolute bottom-32 left-20 w-14 h-14 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center animate-float" style={{ animationDelay: '2s' }}>
        <Star className="h-6 w-6 text-primary" />
      </div>

      <div className="container mx-auto px-4 relative z-10">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-20">
          <div className="inline-flex items-center gap-2 bg-accent/10 backdrop-blur-sm px-6 py-3 rounded-full text-sm font-bold mb-8 border border-accent/30 text-accent">
            <Sparkles className="h-5 w-5" />
            لماذا تختارنا
          </div>
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-black mb-8">
            ما يميزنا عن{' '}
            <span className="text-accent" style={{ textShadow: '0 0 30px rgba(212, 175, 55, 0.3)' }}>
              الآخرين
            </span>
          </h2>
          <p className="text-xl text-muted-foreground leading-relaxed">
            نقدم تجربة تعليمية فريدة تجمع بين الجودة والاحترافية والمرونة
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-20">
          {features.map((feature, index) => {
            const IconComponent = feature.icon;
            return (
              <div 
                key={index}
                className="group animate-fade-in"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div className="relative bg-card/70 backdrop-blur-md rounded-3xl p-8 border border-border/50 hover:border-accent/40 transition-all duration-300 hover:-translate-y-2 h-full">
                  {/* Glow on Hover */}
                  <div className="absolute inset-0 bg-gradient-to-br from-accent/10 to-transparent rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  
                  <div className="relative">
                    <div className="w-14 h-14 rounded-2xl bg-accent/10 border border-accent/30 flex items-center justify-center mb-6 group-hover:scale-110 group-hover:bg-accent/20 transition-all">
                      <IconComponent className="h-7 w-7 text-accent" />
                    </div>
                    <h3 className="text-xl font-bold mb-3 group-hover:text-accent transition-colors">{feature.title}</h3>
                    <p className="text-muted-foreground leading-relaxed">{feature.description}</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* CTA Section */}
        <div className="text-center">
          <div className="inline-flex flex-col sm:flex-row items-center gap-4">
            <Button 
              size="lg" 
              className="rounded-2xl px-12 py-7 text-lg"
              asChild
            >
              <Link to="/auth?tab=signup">
                <Sparkles className="ml-2 h-5 w-5" />
                ابدأ رحلة التعلم الآن
              </Link>
            </Button>
            <Button 
              size="lg" 
              variant="outline"
              className="rounded-2xl px-12 py-7 text-lg"
              asChild
            >
              <Link to="/courses">
                تصفح الكورسات
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default WhyUs;
