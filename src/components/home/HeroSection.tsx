import { Link } from 'react-router-dom';
import { BookOpen } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/i18n/LanguageContext';
import heroLogo from '@/assets/new-logo.png';

const HeroSection = () => {
  const { t } = useLanguage();

  return <section className="relative min-h-screen flex items-center overflow-hidden bg-gradient-to-br from-purple-50 via-white to-purple-100/50">
      {/* Purple & Gold Decorative Section at Top */}
      <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-primary via-accent to-primary" />
      
      {/* Islamic Pattern Background */}
      <div className="absolute inset-0 opacity-[0.03]" style={{
      backgroundImage: `url("data:image/svg+xml,%3Csvg width='80' height='80' viewBox='0 0 80 80' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M40 0L40 80M0 40L80 40M0 0L80 80M80 0L0 80' stroke='%238B5CF6' stroke-width='0.5' fill='none'/%3E%3Ccircle cx='40' cy='40' r='20' stroke='%238B5CF6' stroke-width='0.3' fill='none'/%3E%3C/svg%3E")`
    }} />

      {/* Animated Background Elements */}
      <div className="absolute inset-0">
        {/* Soft Purple & Gold Gradient Orbs */}
        <div className="absolute top-1/4 right-1/4 w-[600px] h-[600px] bg-primary/10 rounded-full blur-[150px] animate-pulse" />
        <div className="absolute bottom-1/4 left-1/4 w-[500px] h-[500px] bg-accent/15 rounded-full blur-[120px] animate-pulse" style={{
        animationDelay: '1s'
      }} />
        
        {/* Floating Particles - Subtle */}
        {[...Array(20)].map((_, i) => <div key={i} className="absolute rounded-full animate-float-particle" style={{
        width: `${2 + Math.random() * 4}px`,
        height: `${2 + Math.random() * 4}px`,
        background: i % 2 === 0 ? 'hsl(270 70% 50% / 0.3)' : 'hsl(42 95% 55% / 0.4)',
        top: `${Math.random() * 100}%`,
        left: `${Math.random() * 100}%`,
        animationDelay: `${Math.random() * 5}s`,
        animationDuration: `${4 + Math.random() * 4}s`
      }} />)}
        
        {/* Subtle Islamic Symbols */}
        <div className="absolute top-24 left-12 text-5xl text-primary/10 animate-float-symbol" style={{
        animationDelay: '0s'
      }}>۞</div>
        <div className="absolute top-40 right-20 text-4xl text-accent/15 animate-float-symbol" style={{
        animationDelay: '0.8s'
      }}>﴾</div>
        <div className="absolute bottom-32 left-24 text-4xl text-accent/15 animate-float-symbol" style={{
        animationDelay: '1.6s'
      }}>﴿</div>
        <div className="absolute bottom-48 right-12 text-5xl text-primary/10 animate-float-symbol" style={{
        animationDelay: '1.2s'
      }}>۝</div>
      </div>

      <div className="container mx-auto px-4 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center min-h-[85vh]">
          
          {/* Right Side - Logo Section - Clean & Simple */}
          <div className="order-1 lg:order-2 flex justify-center">
            <div className="relative animate-logo-container">
              
              {/* Soft Glow Behind Logo */}
              <div className="absolute inset-0 bg-primary/5 blur-[60px] rounded-full scale-110" />
              
              {/* Logo - Clean without circle */}
              <div className="relative animate-logo-appear">
                <img 
                  src={heroLogo} 
                  alt="منصة النجاة" 
                  className="w-64 h-64 md:w-80 md:h-80 lg:w-96 lg:h-96 object-contain relative z-10 animate-logo-float" 
                  style={{
                    filter: 'drop-shadow(0 4px 20px hsl(var(--primary) / 0.2))'
                  }} 
                />
              </div>
            </div>
          </div>

          {/* Left Side - Content */}
          <div className="order-2 lg:order-1 text-center lg:text-right space-y-8">
            
            {/* Premium Badge */}
            <div className="inline-flex items-center gap-3 bg-primary/10 backdrop-blur-md text-primary px-6 py-3 rounded-full border border-primary/20 animate-fade-in" style={{
            animationDelay: '0.1s'
          }}>
              <span className="text-2xl font-black text-accent" style={{
              textShadow: '0 0 20px hsl(var(--accent) / 0.5)'
            }}>{t('home.platformName')}</span>
              <span className="font-bold">{t('home.platformBadge')}</span>
              <span className="text-accent">✦</span>
            </div>

            {/* Main Heading */}
            <div className="space-y-4 animate-fade-in" style={{
            animationDelay: '0.2s'
          }}>
              <h1 className="text-5xl md:text-7xl lg:text-8xl font-black leading-tight text-foreground">
                {t('home.masterArabic')}{' '}
                <span className="relative inline-block">
                  <span className="text-primary text-6xl md:text-8xl lg:text-9xl" style={{
                  textShadow: '0 0 60px hsl(var(--primary) / 0.4)'
                }}>
                    {t('home.arabic')}
                  </span>
                </span>
              </h1>
              <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold text-muted-foreground">
                {t('home.professionalWay')} <span className="text-primary/80">{t('home.professional')}</span> {t('home.andInnovative')}
              </h2>
            </div>

            {/* Description */}
            <p className="text-lg md:text-xl text-muted-foreground max-w-xl leading-relaxed animate-fade-in" style={{
            animationDelay: '0.3s'
          }}>
              {t('home.heroDescription')}
            </p>

            {/* CTA Button */}
            <div className="flex items-center lg:justify-end justify-center animate-fade-in" style={{
            animationDelay: '0.4s'
          }}>
              <Button size="lg" className="bg-primary hover:bg-primary/90 text-primary-foreground text-lg px-10 py-7 rounded-2xl font-bold shadow-lg shadow-primary/25 transition-all hover:scale-105 hover:shadow-xl hover:shadow-primary/30 group" asChild>
                <Link to="/courses">
                  <BookOpen className="ml-3 h-6 w-6 group-hover:rotate-6 transition-transform" />
                  {t('home.browseCourses')}
                </Link>
              </Button>
            </div>

            {/* Feature Tags */}
            <div className="flex flex-wrap items-center lg:justify-end justify-center gap-3 pt-2 animate-fade-in" style={{
            animationDelay: '0.5s'
          }}>
              {[
                { icon: '🏆', text: t('home.certifiedCertificates') },
                { icon: '⭐', text: t('home.interactiveContent') },
                { icon: '💎', text: t('home.highQuality') }
              ].map((item, index) => <span key={index} className="inline-flex items-center gap-2 bg-white/80 backdrop-blur-sm px-4 py-2 rounded-full text-sm text-foreground/80 border border-primary/10 hover:border-primary/30 hover:bg-primary/5 transition-all cursor-default shadow-sm">
                  <span>{item.icon}</span>
                  {item.text}
                </span>)}
            </div>
          </div>
        </div>
      </div>

      {/* Purple & Gold Bottom Accent */}
      <div className="absolute bottom-0 left-0 right-0">
        <div className="h-1 bg-gradient-to-r from-transparent via-accent/50 to-transparent" />
        <div className="h-32 bg-gradient-to-t from-background to-transparent" />
      </div>
    </section>;
};

export default HeroSection;
