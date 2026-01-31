import { Link } from 'react-router-dom';
import { ArrowLeft, Sparkles, BookOpen, Award, Gem } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/i18n/LanguageContext';

const FeaturedCourses = () => {
  const { t } = useLanguage();

  const features = [
    {
      icon: BookOpen,
      title: t('home.interactiveContent'),
      description: t('home.interactiveContentDesc'),
    },
    {
      icon: Award,
      title: t('home.certifiedCerts'),
      description: t('home.certifiedCertsDesc'),
    },
    {
      icon: Gem,
      title: t('home.highQualityContent'),
      description: t('home.highQualityContentDesc'),
    },
  ];

  return (
    <section className="py-28 bg-gradient-to-br from-white via-purple-50/70 to-white relative overflow-hidden">
      {/* Background Elements - Enhanced Purple & Gold */}
      <div className="absolute inset-0">
        <div className="absolute top-0 right-0 w-[700px] h-[700px] bg-primary/10 rounded-full blur-[150px]" />
        <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-accent/15 rounded-full blur-[120px]" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-primary/5 rounded-full blur-[100px]" />
      </div>
      
      {/* Islamic Decorative Elements */}
      <div className="absolute top-32 left-16 w-28 h-28 rounded-full bg-gradient-to-br from-primary/15 to-accent/10 backdrop-blur-sm border border-primary/20 animate-float flex items-center justify-center">
        <span className="text-4xl text-primary/50">۞</span>
      </div>
      <div className="absolute bottom-40 right-24 w-24 h-24 rounded-full bg-gradient-to-br from-accent/20 to-primary/10 backdrop-blur-sm border border-accent/30 animate-float flex items-center justify-center" style={{ animationDelay: '1.5s' }}>
        <span className="text-3xl text-accent">﴿</span>
      </div>
      <div className="absolute top-48 right-10 text-5xl text-primary/10 animate-float" style={{ animationDelay: '0.5s' }}>۝</div>

      <div className="container mx-auto px-4 relative z-10">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-20">
          <div className="inline-flex items-center gap-2 bg-accent/10 backdrop-blur-sm px-6 py-3 rounded-full text-sm font-bold mb-8 border border-accent/30 text-accent">
            <Sparkles className="h-5 w-5" />
            {t('home.learningStartsHere')}
          </div>
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-black mb-8">
            {t('home.startJourneyWith')}{' '}
            <span className="text-accent" style={{ textShadow: '0 0 30px rgba(212, 175, 55, 0.3)' }}>
              {t('home.arabic')}
            </span>
          </h2>
          <p className="text-xl text-muted-foreground leading-relaxed">
            {t('home.featuredDescription')}
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-20">
          {features.map((feature, index) => {
            const IconComponent = feature.icon;
            return (
              <div 
                key={index}
                className="group relative animate-fade-in"
                style={{ animationDelay: `${index * 0.15}s` }}
              >
                {/* Glow */}
                <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-accent/10 to-transparent rounded-3xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                
                {/* Card - Enhanced Glassmorphism */}
                <div className="relative bg-white/60 backdrop-blur-xl rounded-3xl p-8 border border-primary/20 hover:border-primary/40 transition-all duration-300 hover:-translate-y-2 h-full shadow-lg shadow-primary/5 hover:shadow-xl hover:shadow-primary/15">
                  <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary/20 to-accent/10 border border-primary/30 flex items-center justify-center mb-6 group-hover:scale-110 group-hover:from-primary/30 group-hover:to-accent/20 transition-all">
                    <IconComponent className="h-8 w-8 text-primary" />
                  </div>
                  <h3 className="text-xl font-bold mb-4 group-hover:text-primary transition-colors">{feature.title}</h3>
                  <p className="text-muted-foreground leading-relaxed">{feature.description}</p>
                </div>
              </div>
            );
          })}
        </div>

        {/* CTA Section - Enhanced */}
        <div className="relative">
          {/* Background Glow */}
          <div className="absolute inset-0 bg-gradient-to-r from-primary/25 via-accent/15 to-primary/25 rounded-3xl blur-2xl" />
          
          {/* Card - Glassmorphism */}
          <div className="relative bg-white/70 backdrop-blur-2xl rounded-3xl p-12 md:p-16 border border-primary/20 text-center overflow-hidden shadow-xl shadow-primary/10">
            {/* Decorative Elements - Islamic Symbols */}
            <div className="absolute top-4 right-4 opacity-30">
              <span className="text-6xl text-primary">۞</span>
            </div>
            <div className="absolute bottom-4 left-4 opacity-30">
              <span className="text-5xl text-accent">﴾</span>
            </div>
            
            <h3 className="text-3xl md:text-4xl lg:text-5xl font-black mb-6">
              {t('home.readyToStart')}{' '}
              <span className="text-accent">{t('home.learningJourney')}</span>؟
            </h3>
            <p className="text-lg md:text-xl text-muted-foreground mb-10 max-w-2xl mx-auto leading-relaxed">
              {t('home.joinThousands')}
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Button 
                size="lg" 
                className="rounded-2xl px-12 py-7 text-lg"
                asChild
              >
                <Link to="/courses">
                  {t('home.browseCourses')}
                  <ArrowLeft className="mr-2 h-5 w-5" />
                </Link>
              </Button>
              <Button 
                size="lg" 
                className="bg-primary hover:bg-primary/90 text-primary-foreground rounded-2xl px-12 py-7 text-lg"
                asChild
              >
                <Link to="/auth?tab=signup">
                  {t('home.createFreeAccount')}
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
