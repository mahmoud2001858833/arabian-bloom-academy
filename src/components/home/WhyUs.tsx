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
      gradient: 'from-purple-500 to-violet-600',
      bg: 'from-purple-500/20 to-violet-500/10',
      glow: 'group-hover:shadow-purple-500/25',
    },
    {
      icon: GraduationCap,
      title: t('home.specializedTeachers'),
      description: t('home.specializedTeachersDesc'),
      gradient: 'from-violet-500 to-purple-600',
      bg: 'from-violet-500/20 to-purple-500/10',
      glow: 'group-hover:shadow-violet-500/25',
    },
    {
      icon: Clock,
      title: t('home.flexibleLearning'),
      description: t('home.flexibleLearningDesc'),
      gradient: 'from-indigo-500 to-purple-600',
      bg: 'from-indigo-500/20 to-purple-500/10',
      glow: 'group-hover:shadow-indigo-500/25',
    },
    {
      icon: Award,
      title: t('home.certifiedCertificates2'),
      description: t('home.certifiedCertificatesDesc'),
      gradient: 'from-purple-600 to-fuchsia-500',
      bg: 'from-purple-600/20 to-fuchsia-500/10',
      glow: 'group-hover:shadow-purple-600/25',
    },
    {
      icon: Headphones,
      title: t('home.continuousSupport'),
      description: t('home.continuousSupportDesc'),
      gradient: 'from-fuchsia-500 to-purple-500',
      bg: 'from-fuchsia-500/20 to-purple-500/10',
      glow: 'group-hover:shadow-fuchsia-500/25',
    },
    {
      icon: Users,
      title: t('home.learningCommunity'),
      description: t('home.learningCommunityDesc'),
      gradient: 'from-violet-600 to-indigo-500',
      bg: 'from-violet-600/20 to-indigo-500/10',
      glow: 'group-hover:shadow-violet-600/25',
    },
  ];

  return (
    <section className="py-28 bg-gradient-to-br from-purple-100/60 via-white to-purple-50/80 relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0">
        <div className="absolute top-1/4 left-1/4 w-[600px] h-[600px] bg-purple-400/15 rounded-full blur-[150px]" />
        <div className="absolute bottom-1/4 right-1/4 w-[500px] h-[500px] bg-violet-400/15 rounded-full blur-[120px]" />
        <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-fuchsia-300/10 rounded-full blur-[100px]" />
        <div className="absolute bottom-0 left-1/3 w-[300px] h-[300px] bg-indigo-300/10 rounded-full blur-[80px]" />
      </div>

      {/* Decorative Elements */}
      <div className="absolute top-20 right-16 w-20 h-20 rounded-full bg-purple-500/10 backdrop-blur-sm border border-purple-400/20 flex items-center justify-center animate-float">
        <span className="text-3xl text-purple-500/60">۞</span>
      </div>
      <div className="absolute bottom-32 left-20 w-16 h-16 rounded-full bg-violet-400/15 backdrop-blur-sm border border-violet-400/30 flex items-center justify-center animate-float" style={{ animationDelay: '2s' }}>
        <span className="text-2xl text-violet-500">﴾</span>
      </div>
      <div className="absolute top-1/2 right-10 text-5xl text-purple-400/10 animate-float" style={{ animationDelay: '1s' }}>۝</div>

      <div className="container mx-auto px-4 relative z-10">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-20">
          <div className="inline-flex items-center gap-2 bg-purple-500/10 backdrop-blur-sm px-6 py-3 rounded-full text-sm font-bold mb-8 border border-purple-400/30 text-purple-700">
            <Sparkles className="h-5 w-5" />
            {t('home.whyChooseUs')}
          </div>
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-black mb-8">
            {t('home.whatMakesUsDifferent')}{' '}
            <span className="bg-gradient-to-r from-purple-600 via-violet-500 to-fuchsia-500 bg-clip-text text-transparent">
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
                <div className={`relative bg-white/70 backdrop-blur-xl rounded-3xl p-8 border border-purple-200/50 hover:border-purple-400/60 transition-all duration-500 hover:-translate-y-3 h-full shadow-lg shadow-purple-500/5 hover:shadow-2xl ${feature.glow}`}>
                  {/* Purple Glow on Hover */}
                  <div className={`absolute inset-0 bg-gradient-to-br ${feature.bg} rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500`} />
                  
                  {/* Top accent line */}
                  <div className={`absolute top-0 left-8 right-8 h-1 bg-gradient-to-r ${feature.gradient} rounded-b-full opacity-0 group-hover:opacity-100 transition-opacity duration-500`} />
                  
                  <div className="relative">
                    <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${feature.gradient} flex items-center justify-center mb-6 group-hover:scale-110 transition-all duration-500 shadow-lg group-hover:shadow-xl`}>
                      <IconComponent className="h-8 w-8 text-white" />
                    </div>
                    <h3 className="text-xl font-bold mb-3 group-hover:text-purple-700 transition-colors duration-300">{feature.title}</h3>
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
              className="rounded-2xl px-12 py-7 text-lg bg-gradient-to-r from-purple-600 to-violet-600 hover:from-purple-700 hover:to-violet-700 shadow-lg shadow-purple-500/25 hover:shadow-xl hover:shadow-purple-500/30 transition-all duration-300"
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
              className="rounded-2xl px-12 py-7 text-lg border-purple-300 text-purple-700 hover:bg-purple-50 hover:border-purple-400"
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
