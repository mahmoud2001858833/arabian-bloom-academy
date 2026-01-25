import { BookOpen, Video, Award, Clock, Users, Headphones } from 'lucide-react';

const features = [
  {
    icon: Video,
    title: 'فيديوهات عالية الجودة',
    description: 'محتوى مرئي احترافي مع شرح واضح ومفصل لكل درس',
  },
  {
    icon: BookOpen,
    title: 'اختبارات تفاعلية',
    description: 'اختبر معلوماتك بعد كل درس مع تقييم فوري لأدائك',
  },
  {
    icon: Award,
    title: 'شهادات معتمدة',
    description: 'احصل على شهادة إتمام بعد إكمال كل كورس',
  },
  {
    icon: Clock,
    title: 'تعلم بوقتك',
    description: 'ادرس في أي وقت يناسبك بدون قيود زمنية',
  },
  {
    icon: Users,
    title: 'مجتمع تعليمي',
    description: 'انضم لمجتمع من المتعلمين وشارك تجربتك معهم',
  },
  {
    icon: Headphones,
    title: 'دعم متواصل',
    description: 'فريق دعم جاهز للإجابة على جميع استفساراتك',
  },
];

const WhyUs = () => {
  return (
    <section className="py-20">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            لماذا <span className="text-gradient">تختارنا؟</span>
          </h2>
          <p className="text-muted-foreground">
            نقدم لك تجربة تعليمية متكاملة ومميزة تساعدك على إتقان اللغة العربية
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <div
              key={index}
              className="group p-6 rounded-2xl bg-card border border-border/50 hover:border-primary/30 hover:shadow-elegant transition-all duration-300 animate-fade-in"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <div className="w-14 h-14 rounded-xl bg-gradient-primary flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <feature.icon className="h-7 w-7 text-primary-foreground" />
              </div>
              <h3 className="text-xl font-bold mb-2">{feature.title}</h3>
              <p className="text-muted-foreground">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default WhyUs;
