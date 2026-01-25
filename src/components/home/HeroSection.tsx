import { Link } from 'react-router-dom';
import { Play, BookOpen, Sparkles, Star, Crown, Gem, Award } from 'lucide-react';
import { Button } from '@/components/ui/button';
import logo from '@/assets/logo.png';

// Decorative Icons around Logo
const DecorativeElements = () => {
  const elements = [
    { Icon: Star, angle: 0, distance: 160, size: 24, delay: '0s' },
    { Icon: Crown, angle: 45, distance: 180, size: 28, delay: '0.3s' },
    { Icon: Gem, angle: 90, distance: 155, size: 22, delay: '0.6s' },
    { Icon: Sparkles, angle: 135, distance: 175, size: 26, delay: '0.9s' },
    { Icon: Award, angle: 180, distance: 165, size: 24, delay: '1.2s' },
    { Icon: Star, angle: 225, distance: 185, size: 20, delay: '1.5s' },
    { Icon: Gem, angle: 270, distance: 160, size: 26, delay: '1.8s' },
    { Icon: Crown, angle: 315, distance: 170, size: 22, delay: '2.1s' },
  ];

  return (
    <>
      {elements.map((item, index) => {
        const x = Math.cos((item.angle * Math.PI) / 180) * item.distance;
        const y = Math.sin((item.angle * Math.PI) / 180) * item.distance;
        const IconComponent = item.Icon;
        
        return (
          <div
            key={index}
            className="absolute animate-float-icon"
            style={{
              left: `calc(50% + ${x}px)`,
              top: `calc(50% + ${y}px)`,
              transform: 'translate(-50%, -50%)',
              animationDelay: item.delay,
            }}
          >
            <div className="relative">
              <div className="absolute inset-0 bg-gold/30 blur-lg rounded-full" />
              <IconComponent 
                size={item.size} 
                className="relative text-gold drop-shadow-lg"
                style={{ filter: 'drop-shadow(0 0 8px rgba(212, 175, 55, 0.6))' }}
              />
            </div>
          </div>
        );
      })}
    </>
  );
};

// Floating Arabic Letters
const FloatingLetters = () => {
  const letters = ['ع', 'ر', 'ب', 'ي', 'ة'];
  
  return (
    <>
      {letters.map((letter, index) => {
        const angle = (index * 72) + 18; // Distribute evenly
        const distance = 220 + (index % 2) * 20;
        const x = Math.cos((angle * Math.PI) / 180) * distance;
        const y = Math.sin((angle * Math.PI) / 180) * distance;
        
        return (
          <span
            key={index}
            className="absolute text-4xl md:text-5xl font-black text-gold/30 select-none animate-float-letter"
            style={{
              left: `calc(50% + ${x}px)`,
              top: `calc(50% + ${y}px)`,
              transform: 'translate(-50%, -50%)',
              animationDelay: `${index * 0.5}s`,
              textShadow: '0 0 20px rgba(212, 175, 55, 0.3)',
            }}
          >
            {letter}
          </span>
        );
      })}
    </>
  );
};

const HeroSection = () => {
  return (
    <section className="relative min-h-screen flex items-center overflow-hidden bg-gradient-hero">
      {/* Animated Background */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-gradient-to-br from-purple-950 via-purple-900 to-purple-950" />
        
        {/* Gradient Orbs */}
        <div className="absolute top-1/4 right-1/3 w-[500px] h-[500px] bg-purple-600/20 rounded-full blur-[120px] animate-pulse" />
        <div className="absolute bottom-1/3 left-1/4 w-[400px] h-[400px] bg-gold/10 rounded-full blur-[100px] animate-pulse" style={{ animationDelay: '1s' }} />
        
        {/* Star Particles */}
        {[...Array(30)].map((_, i) => (
          <div
            key={i}
            className="absolute rounded-full animate-pulse"
            style={{
              width: `${2 + Math.random() * 3}px`,
              height: `${2 + Math.random() * 3}px`,
              background: i % 3 === 0 ? 'rgba(212, 175, 55, 0.6)' : 'rgba(255, 255, 255, 0.4)',
              top: `${Math.random() * 100}%`,
              left: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 3}s`,
              animationDuration: `${2 + Math.random() * 2}s`,
            }}
          />
        ))}
      </div>

      {/* Subtle Pattern */}
      <div 
        className="absolute inset-0 opacity-[0.02]"
        style={{
          backgroundImage: `radial-gradient(circle at 1px 1px, white 1px, transparent 1px)`,
          backgroundSize: '32px 32px',
        }}
      />

      <div className="container mx-auto px-4 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center min-h-[85vh]">
          
          {/* Right Side - Logo Section */}
          <div className="order-1 lg:order-2 flex justify-center">
            <div className="relative w-[380px] h-[380px] md:w-[480px] md:h-[480px]">
              
              {/* Outer Decorative Ring */}
              <div className="absolute inset-0 rounded-full border-2 border-gold/20 animate-spin-slow" style={{ animationDuration: '60s' }} />
              <div className="absolute inset-4 rounded-full border border-gold/10 animate-spin-slow" style={{ animationDuration: '45s', animationDirection: 'reverse' }} />
              
              {/* Glow Background */}
              <div className="absolute inset-12 rounded-full bg-gradient-to-br from-gold/20 via-purple-500/10 to-gold/20 blur-2xl" />
              
              {/* Main Glass Circle */}
              <div className="absolute inset-16 md:inset-20 rounded-full bg-white/5 backdrop-blur-xl border-2 border-gold/30 shadow-2xl">
                <div className="absolute inset-0 rounded-full bg-gradient-to-br from-gold/10 to-transparent" />
              </div>
              
              {/* Inner Gold Ring */}
              <div className="absolute inset-[4.5rem] md:inset-24 rounded-full border border-gold/40" />
              
              {/* Logo */}
              <div className="absolute inset-0 flex items-center justify-center z-20">
                <div className="relative">
                  <div className="absolute inset-0 bg-gold/20 blur-2xl rounded-full scale-150" />
                  <img 
                    src={logo} 
                    alt="منصة العربية" 
                    className="w-28 h-28 md:w-36 md:h-36 object-contain relative z-10 drop-shadow-2xl"
                    style={{ filter: 'drop-shadow(0 0 25px rgba(212, 175, 55, 0.5))' }}
                  />
                </div>
              </div>
              
              {/* Decorative Icons */}
              <DecorativeElements />
              
              {/* Floating Arabic Letters */}
              <FloatingLetters />
            </div>
          </div>

          {/* Left Side - Content */}
          <div className="order-2 lg:order-1 text-center lg:text-right space-y-8">
            
            {/* Premium Badge */}
            <div className="inline-flex items-center gap-3 bg-gold/10 backdrop-blur-md text-gold px-6 py-3 rounded-full border border-gold/30 animate-fade-in">
              <Crown className="h-5 w-5" />
              <span className="font-bold">المنصة الأولى لتعلم اللغة العربية</span>
              <Sparkles className="h-4 w-4" />
            </div>

            {/* Main Heading */}
            <div className="space-y-4 animate-fade-in" style={{ animationDelay: '0.15s' }}>
              <h1 className="text-5xl md:text-6xl lg:text-7xl font-black leading-tight text-white">
                أتقن{' '}
                <span className="relative inline-block">
                  <span className="text-gold" style={{ textShadow: '0 0 30px rgba(212, 175, 55, 0.5)' }}>
                    العربية
                  </span>
                </span>
              </h1>
              <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold text-white/80">
                بطريقة <span className="text-gold/80">احترافية</span> ومبتكرة
              </h2>
            </div>

            {/* Description */}
            <p 
              className="text-lg md:text-xl text-white/60 max-w-xl leading-relaxed animate-fade-in"
              style={{ animationDelay: '0.25s' }}
            >
              انطلق في رحلة تعلم اللغة العربية مع أفضل المعلمين والمناهج التفاعلية.
              كورسات متنوعة تناسب جميع المستويات.
            </p>

            {/* CTA Buttons - Gold Theme */}
            <div 
              className="flex flex-col sm:flex-row items-center lg:justify-end justify-center gap-4 animate-fade-in"
              style={{ animationDelay: '0.35s' }}
            >
              <Button 
                size="lg" 
                className="bg-gold hover:bg-gold-dark text-purple-950 text-lg px-10 py-7 rounded-2xl font-bold shadow-lg transition-all hover:scale-105 group" 
                style={{ boxShadow: '0 10px 40px -10px rgba(212, 175, 55, 0.5)' }}
                asChild
              >
                <Link to="/courses">
                  <BookOpen className="ml-3 h-6 w-6 group-hover:rotate-6 transition-transform" />
                  تصفح الكورسات
                </Link>
              </Button>
              <Button 
                size="lg" 
                className="text-lg px-10 py-7 rounded-2xl font-bold border-2 border-gold/50 text-gold bg-gold/10 backdrop-blur-sm hover:bg-gold/20 hover:border-gold transition-all hover:scale-105 group" 
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
              style={{ animationDelay: '0.45s' }}
            >
              {[
                { icon: Award, text: 'شهادات معتمدة' },
                { icon: Star, text: 'محتوى حصري' },
                { icon: Gem, text: 'جودة عالية' },
              ].map((item, index) => (
                <span 
                  key={index}
                  className="inline-flex items-center gap-2 bg-white/5 backdrop-blur-sm px-4 py-2 rounded-full text-sm text-white/70 border border-white/10 hover:border-gold/30 hover:text-gold/80 transition-all cursor-default"
                >
                  <item.icon className="h-4 w-4 text-gold/70" />
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
