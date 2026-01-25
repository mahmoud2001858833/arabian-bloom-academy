import { BookOpen, Video, Award, Clock, Users, Headphones, CheckCircle2 } from 'lucide-react';

const features = [
  {
    icon: Video,
    title: 'فيديوهات عالية الجودة',
    description: 'محتوى مرئي احترافي مع شرح واضح ومفصل لكل درس',
    color: 'from-purple-500 to-purple-600',
  },
  {
    icon: BookOpen,
    title: 'اختبارات تفاعلية',
    description: 'اختبر معلوماتك بعد كل درس مع تقييم فوري لأدائك',
    color: 'from-purple-600 to-purple-700',
  },
  {
    icon: Award,
    title: 'شهادات معتمدة',
    description: 'احصل على شهادة إتمام بعد إكمال كل كورس',
    color: 'from-gold to-gold-dark',
  },
  {
    icon: Clock,
    title: 'تعلم بوقتك',
    description: 'ادرس في أي وقت يناسبك بدون قيود زمنية',
    color: 'from-purple-500 to-purple-600',
  },
  {
    icon: Users,
    title: 'مجتمع تعليمي',
    description: 'انضم لمجتمع من المتعلمين وشارك تجربتك معهم',
    color: 'from-purple-600 to-purple-700',
  },
  {
    icon: Headphones,
    title: 'دعم متواصل',
    description: 'فريق دعم جاهز للإجابة على جميع استفساراتك',
    color: 'from-gold to-gold-dark',
  },
];

const WhyUs = () => {
  return (
    <section className="py-24 relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-b from-background via-purple-50/50 to-background" />
      
      {/* Floating Elements */}
      <div className="absolute top-20 right-20 w-32 h-32 bg-primary/10 rounded-full blur-2xl animate-pulse" />
      <div className="absolute bottom-20 left-20 w-40 h-40 bg-gold/10 rounded-full blur-2xl animate-pulse" style={{ animationDelay: '1s' }} />

      <div className="container mx-auto px-4 relative z-10">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-4xl md:text-5xl font-black mb-6">
            لماذا <span className="text-gradient">تختارنا؟</span>
          </h2>
          <p className="text-xl text-muted-foreground">
            نقدم لك تجربة تعليمية متكاملة ومميزة تساعدك على إتقان اللغة العربية
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <div
              key={index}
              className="group relative animate-fade-in"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              {/* Hover Glow */}
              <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-transparent rounded-3xl opacity-0 group-hover:opacity-100 blur-xl transition-opacity duration-500" />
              
              <div className="relative p-8 rounded-3xl bg-white border border-border/50 hover:border-primary/30 shadow-sm hover:shadow-purple transition-all duration-300 hover:-translate-y-2">
                {/* Icon */}
                <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${feature.color} flex items-center justify-center mb-6 group-hover:scale-110 transition-transform shadow-lg`}>
                  <feature.icon className="h-8 w-8 text-white" />
                </div>
                
                {/* Content */}
                <h3 className="text-xl font-bold mb-3 group-hover:text-primary transition-colors">
                  {feature.title}
                </h3>
                <p className="text-muted-foreground leading-relaxed">
                  {feature.description}
                </p>
                
                {/* Decorative Check */}
                <div className="absolute top-6 left-6 opacity-0 group-hover:opacity-100 transition-opacity">
                  <CheckCircle2 className="h-6 w-6 text-primary" />
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Bottom CTA */}
        <div className="mt-20 text-center">
          <div className="inline-block p-8 rounded-3xl bg-gradient-primary text-white shadow-purple">
            <h3 className="text-2xl md:text-3xl font-bold mb-4">
              جاهز لبدء رحلة التعلم؟
            </h3>
            <p className="text-white/80 mb-6 max-w-xl mx-auto">
              انضم لآلاف الطلاب الذين يتعلمون اللغة العربية معنا
            </p>
            <a 
              href="/auth?tab=signup"
              className="inline-flex items-center gap-2 bg-white text-primary px-8 py-4 rounded-xl font-bold hover:bg-white/90 transition-all hover:scale-105 shadow-lg"
            >
              ابدأ الآن مجاناً
              <Award className="h-5 w-5" />
            </a>
          </div>
        </div>
      </div>
    </section>
  );
};

export default WhyUs;
