import { Link } from 'react-router-dom';
import { Users, Award, Clock, Headphones, BookOpen, GraduationCap, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/i18n/LanguageContext';

const WhyUs = () => {
  const { t } = useLanguage();

  const features = [
    {
      icon: BookOpen,
      title: t('home.integratedContent'),
      description: t('home.integratedContentDesc'),
    },
    {
      icon: GraduationCap,
      title: t('home.specializedTeachers'),
      description: t('home.specializedTeachersDesc'),
    },
    {
      icon: Clock,
      title: t('home.flexibleLearning'),
      description: t('home.flexibleLearningDesc'),
    },
    {
      icon: Award,
      title: t('home.certifiedCertificates2'),
      description: t('home.certifiedCertificatesDesc'),
    },
    {
      icon: Headphones,
      title: t('home.continuousSupport'),
      description: t('home.continuousSupportDesc'),
    },
    {
      icon: Users,
      title: t('home.learningCommunity'),
      description: t('home.learningCommunityDesc'),
    },
  ];

  return (
    <section className="py-28 bg-gradient-to-br from-purple-100/60 via-white to-purple-50/80 relative overflow-hidden">
      {/* Background Elements - Enhanced */}
      <div className="absolute inset-0">
        <div className="absolute top-1/4 left-1/4 w-[600px] h-[600px] bg-primary/10 rounded-full blur-[150px]" />
        <div className="absolute bottom-1/4 right-1/4 w-[500px] h-[500px] bg-accent/15 rounded-full blur-[120px]" />
        <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-accent/10 rounded-full blur-[100px]" />
      </div>

      {/* Islamic Decorative Elements */}
      <div className="absolute top-20 right-16 w-20 h-20 rounded-full bg-primary/10 backdrop-blur-sm border border-primary/20 flex items-center justify-center animate-float">
        <span className="text-3xl text-primary/60">۞</span>
      </div>
      <div className="absolute bottom-32 left-20 w-16 h-16 rounded-full bg-accent/15 backdrop-blur-sm border border-accent/30 flex items-center justify-center animate-float" style={{ animationDelay: '2s' }}>
        <span className="text-2xl text-accent">﴾</span>
      </div>
      <div className="absolute top-1/2 right-10 text-5xl text-primary/10 animate-float" style={{ animationDelay: '1s' }}>۝</div>

      <div className="container mx-auto px-4 relative z-10">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-20">
          <div className="inline-flex items-center gap-2 bg-accent/10 backdrop-blur-sm px-6 py-3 rounded-full text-sm font-bold mb-8 border border-accent/30 text-accent">
            <Sparkles className="h-5 w-5" />
            {t('home.whyChooseUs')}
          </div>
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-black mb-8">
            {t('home.whatMakesUsDifferent')}{' '}
            <span className="text-accent" style={{ textShadow: '0 0 30px rgba(212, 175, 55, 0.3)' }}>
              {t('home.others')}
            </span>
          </h2>
          <p className="text-xl text-muted-foreground leading-relaxed">
            {t('home.whyUsDescription')}
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
                <div className="relative bg-white/60 backdrop-blur-xl rounded-3xl p-8 border border-primary/20 hover:border-primary/40 transition-all duration-300 hover:-translate-y-2 h-full shadow-lg shadow-primary/5 hover:shadow-xl hover:shadow-primary/10">
                  {/* Glow on Hover */}
                  <div className="absolute inset-0 bg-gradient-to-br from-primary/15 via-accent/5 to-transparent rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  
                  <div className="relative">
                    <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary/20 to-primary/10 border border-primary/30 flex items-center justify-center mb-6 group-hover:scale-110 group-hover:from-primary/30 group-hover:to-accent/20 transition-all">
                      <IconComponent className="h-7 w-7 text-primary" />
                    </div>
                    <h3 className="text-xl font-bold mb-3 group-hover:text-primary transition-colors">{feature.title}</h3>
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
                {t('home.startLearningNow')}
              </Link>
            </Button>
            <Button 
              size="lg" 
              variant="outline"
              className="rounded-2xl px-12 py-7 text-lg"
              asChild
            >
              <Link to="/courses">
                {t('home.browseCourses')}
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default WhyUs;
