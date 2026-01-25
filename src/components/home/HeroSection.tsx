import { Link } from 'react-router-dom';
import { Play, BookOpen } from 'lucide-react';
import { Button } from '@/components/ui/button';
import heroLogo from '@/assets/hero-logo.png';

// Floating Arabic Letters around the logo - ض is the leader
const FloatingArabicLetters = () => {
  const letters = [
    { letter: 'ض', angle: 270, distance: 180, size: 'text-5xl md:text-6xl', isLeader: true },
    { letter: 'ع', angle: 315, distance: 165, size: 'text-3xl md:text-4xl', isLeader: false },
    { letter: 'ر', angle: 0, distance: 175, size: 'text-3xl md:text-4xl', isLeader: false },
    { letter: 'ب', angle: 45, distance: 160, size: 'text-3xl md:text-4xl', isLeader: false },
    { letter: 'ي', angle: 90, distance: 170, size: 'text-3xl md:text-4xl', isLeader: false },
    { letter: 'ة', angle: 135, distance: 165, size: 'text-3xl md:text-4xl', isLeader: false },
    { letter: 'ل', angle: 180, distance: 175, size: 'text-3xl md:text-4xl', isLeader: false },
    { letter: 'ن', angle: 225, distance: 160, size: 'text-3xl md:text-4xl', isLeader: false },
  ];

  return (
    <>
      {letters.map((item, index) => {
        const x = Math.cos((item.angle * Math.PI) / 180) * item.distance;
        const y = Math.sin((item.angle * Math.PI) / 180) * item.distance;
        
        return (
          <span
            key={index}
            className={`absolute ${item.size} font-black select-none animate-float-letter ${
              item.isLeader 
                ? 'text-primary drop-shadow-lg' 
                : 'text-primary/40'
            }`}
            style={{
              left: `calc(50% + ${x}px)`,
              top: `calc(50% + ${y}px)`,
              transform: 'translate(-50%, -50%)',
              animationDelay: `${index * 0.3}s`,
              textShadow: item.isLeader 
                ? '0 0 30px hsl(var(--primary) / 0.5)' 
                : '0 0 15px hsl(var(--primary) / 0.2)',
            }}
          >
            {item.letter}
          </span>
        );
      })}
    </>
  );
};

const HeroSection = () => {
  return (
    <section className="relative min-h-screen flex items-center overflow-hidden bg-gradient-to-b from-white via-purple-50/50 to-white">
      {/* Animated Background Elements */}
      <div className="absolute inset-0">
        {/* Soft Purple Gradient Orbs */}
        <div className="absolute top-1/4 right-1/4 w-[600px] h-[600px] bg-primary/5 rounded-full blur-[150px] animate-pulse" />
        <div className="absolute bottom-1/4 left-1/4 w-[500px] h-[500px] bg-gold/5 rounded-full blur-[120px] animate-pulse" style={{ animationDelay: '1s' }} />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] bg-purple-200/20 rounded-full blur-[180px]" />
        
        {/* Floating Particles */}
        {[...Array(25)].map((_, i) => (
          <div
            key={i}
            className="absolute rounded-full animate-pulse"
            style={{
              width: `${3 + Math.random() * 4}px`,
              height: `${3 + Math.random() * 4}px`,
              background: i % 2 === 0 
                ? 'hsl(270 70% 50% / 0.3)' 
                : 'hsl(42 95% 55% / 0.4)',
              top: `${Math.random() * 100}%`,
              left: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 3}s`,
              animationDuration: `${2 + Math.random() * 3}s`,
            }}
          />
        ))}
      </div>

      {/* Subtle Grid Pattern */}
      <div 
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: `radial-gradient(circle at 1px 1px, hsl(var(--primary)) 1px, transparent 1px)`,
          backgroundSize: '40px 40px',
        }}
      />

      <div className="container mx-auto px-4 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center min-h-[85vh]">
          
          {/* Right Side - Logo Section */}
          <div className="order-1 lg:order-2 flex justify-center animate-scale-in" style={{ animationDelay: '0.2s' }}>
            <div className="relative w-[400px] h-[400px] md:w-[500px] md:h-[500px]">
              
              {/* Outer Decorative Rings */}
              <div className="absolute inset-0 rounded-full border-2 border-primary/20 animate-spin-slow" style={{ animationDuration: '50s' }} />
              <div className="absolute inset-6 rounded-full border border-primary/10 animate-spin-slow" style={{ animationDuration: '40s', animationDirection: 'reverse' }} />
              <div className="absolute inset-12 rounded-full border border-gold/20 animate-spin-slow" style={{ animationDuration: '60s' }} />
              
              {/* Glow Background */}
              <div className="absolute inset-16 rounded-full bg-gradient-to-br from-primary/10 via-gold/5 to-primary/10 blur-2xl" />
              
              {/* Main Glass Circle */}
              <div className="absolute inset-20 md:inset-24 rounded-full bg-white/80 backdrop-blur-xl border-2 border-primary/20 shadow-2xl">
                <div className="absolute inset-0 rounded-full bg-gradient-to-br from-primary/5 to-transparent" />
              </div>
              
              {/* Inner Purple Ring */}
              <div className="absolute inset-[5.5rem] md:inset-28 rounded-full border border-primary/30" />
              
              {/* Logo */}
              <div className="absolute inset-0 flex items-center justify-center z-20">
                <div className="relative">
                  <div className="absolute inset-0 bg-gold/15 blur-3xl rounded-full scale-150" />
                  <img 
                    src={heroLogo} 
                    alt="منصة العربية" 
                    className="w-32 h-32 md:w-44 md:h-44 object-contain relative z-10 drop-shadow-xl"
                  />
                </div>
              </div>
              
              {/* Floating Arabic Letters */}
              <FloatingArabicLetters />
            </div>
          </div>

          {/* Left Side - Content */}
          <div className="order-2 lg:order-1 text-center lg:text-right space-y-8">
            
            {/* Premium Badge */}
            <div 
              className="inline-flex items-center gap-3 bg-primary/10 backdrop-blur-md text-primary px-6 py-3 rounded-full border border-primary/20 animate-fade-in"
              style={{ animationDelay: '0.1s' }}
            >
              <span className="text-lg font-bold">ض</span>
              <span className="font-bold">المنصة الأولى لتعلم اللغة العربية</span>
              <span className="text-gold">✦</span>
            </div>

            {/* Main Heading */}
            <div className="space-y-4 animate-fade-in" style={{ animationDelay: '0.2s' }}>
              <h1 className="text-5xl md:text-6xl lg:text-7xl font-black leading-tight text-foreground">
                أتقن{' '}
                <span className="relative inline-block">
                  <span className="text-primary" style={{ textShadow: '0 0 40px hsl(var(--primary) / 0.3)' }}>
                    العربية
                  </span>
                </span>
              </h1>
              <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold text-muted-foreground">
                بطريقة <span className="text-primary/80">احترافية</span> ومبتكرة
              </h2>
            </div>

            {/* Description */}
            <p 
              className="text-lg md:text-xl text-muted-foreground max-w-xl leading-relaxed animate-fade-in"
              style={{ animationDelay: '0.3s' }}
            >
              انطلق في رحلة تعلم اللغة العربية مع أفضل المعلمين والمناهج التفاعلية.
              كورسات متنوعة تناسب جميع المستويات.
            </p>

            {/* CTA Buttons - Purple Theme */}
            <div 
              className="flex flex-col sm:flex-row items-center lg:justify-end justify-center gap-4 animate-fade-in"
              style={{ animationDelay: '0.4s' }}
            >
              <Button 
                size="lg" 
                className="bg-primary hover:bg-primary/90 text-primary-foreground text-lg px-10 py-7 rounded-2xl font-bold shadow-lg shadow-primary/25 transition-all hover:scale-105 hover:shadow-xl hover:shadow-primary/30 group" 
                asChild
              >
                <Link to="/courses">
                  <BookOpen className="ml-3 h-6 w-6 group-hover:rotate-6 transition-transform" />
                  تصفح الكورسات
                </Link>
              </Button>
              <Button 
                size="lg" 
                variant="outline"
                className="text-lg px-10 py-7 rounded-2xl font-bold border-2 border-primary/40 text-primary bg-primary/5 backdrop-blur-sm hover:bg-primary/10 hover:border-primary/60 transition-all hover:scale-105 group" 
                asChild
              >
                <Link to="/auth?tab=signup">
                  <Play className="ml-3 h-6 w-6 group-hover:scale-110 transition-transform" />
                  ابدأ مجاناً
                </Link>
              </Button>
            </div>

            {/* Feature Tags */}
            <div 
              className="flex flex-wrap items-center lg:justify-end justify-center gap-3 pt-2 animate-fade-in"
              style={{ animationDelay: '0.5s' }}
            >
              {[
                { icon: '🏆', text: 'شهادات معتمدة' },
                { icon: '⭐', text: 'محتوى حصري' },
                { icon: '💎', text: 'جودة عالية' },
              ].map((item, index) => (
                <span 
                  key={index}
                  className="inline-flex items-center gap-2 bg-white/80 backdrop-blur-sm px-4 py-2 rounded-full text-sm text-foreground/80 border border-primary/10 hover:border-primary/30 hover:bg-primary/5 transition-all cursor-default shadow-sm"
                >
                  <span>{item.icon}</span>
                  {item.text}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Gradient Fade */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-background to-transparent" />
    </section>
  );
};

export default HeroSection;
