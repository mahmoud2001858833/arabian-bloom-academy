import { Link } from 'react-router-dom';
import { Play, BookOpen, Sparkles, Star } from 'lucide-react';
import { Button } from '@/components/ui/button';
import logo from '@/assets/logo.png';

// Floating Arabic Letters around Logo Component
const FloatingLettersAroundLogo = () => {
  const letters = [
    { char: 'ع', angle: 0, distance: 180, size: 'text-5xl', delay: '0s' },
    { char: 'ر', angle: 45, distance: 200, size: 'text-4xl', delay: '0.5s' },
    { char: 'ب', angle: 90, distance: 170, size: 'text-6xl', delay: '1s' },
    { char: 'ي', angle: 135, distance: 190, size: 'text-4xl', delay: '1.5s' },
    { char: 'ة', angle: 180, distance: 175, size: 'text-5xl', delay: '2s' },
    { char: 'ل', angle: 225, distance: 195, size: 'text-4xl', delay: '2.5s' },
    { char: 'ا', angle: 270, distance: 185, size: 'text-6xl', delay: '3s' },
    { char: 'ن', angle: 315, distance: 165, size: 'text-5xl', delay: '3.5s' },
  ];

  return (
    <>
      {letters.map((letter, index) => {
        const x = Math.cos((letter.angle * Math.PI) / 180) * letter.distance;
        const y = Math.sin((letter.angle * Math.PI) / 180) * letter.distance;
        
        return (
          <span
            key={index}
            className={`absolute ${letter.size} font-black text-white/20 select-none animate-float-letter`}
            style={{
              left: `calc(50% + ${x}px)`,
              top: `calc(50% + ${y}px)`,
              transform: 'translate(-50%, -50%)',
              animationDelay: letter.delay,
              animationDuration: `${6 + index * 0.5}s`,
              textShadow: '0 0 40px rgba(212, 175, 55, 0.3)',
            }}
          >
            {letter.char}
          </span>
        );
      })}
    </>
  );
};

const HeroSection = () => {
  return (
    <section className="relative min-h-screen flex items-center overflow-hidden bg-gradient-hero">
      {/* Animated Background Elements */}
      <div className="absolute inset-0">
        {/* Main Gradient Orbs */}
        <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-purple-900 via-purple-800 to-purple-900" />
        <div className="absolute top-1/4 right-1/4 w-[600px] h-[600px] bg-purple-500/30 rounded-full blur-[150px] animate-pulse" />
        <div className="absolute bottom-1/4 left-1/4 w-[500px] h-[500px] bg-purple-600/20 rounded-full blur-[120px] animate-pulse" style={{ animationDelay: '1s' }} />
        <div className="absolute top-1/2 left-1/3 w-[400px] h-[400px] bg-gold/10 rounded-full blur-[100px] animate-pulse" style={{ animationDelay: '2s' }} />
        
        {/* Sparkle Particles */}
        {[...Array(20)].map((_, i) => (
          <div
            key={i}
            className="absolute w-1 h-1 bg-white/40 rounded-full animate-pulse"
            style={{
              top: `${Math.random() * 100}%`,
              left: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 3}s`,
              animationDuration: `${2 + Math.random() * 2}s`,
            }}
          />
        ))}
      </div>

      {/* Glass Pattern Overlay */}
      <div 
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: `radial-gradient(circle at 2px 2px, white 1px, transparent 1px)`,
          backgroundSize: '40px 40px',
        }}
      />

      <div className="container mx-auto px-4 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center min-h-[80vh]">
          
          {/* Right Side - Logo with Floating Letters */}
          <div className="order-1 lg:order-2 flex justify-center lg:justify-start">
            <div className="relative w-[400px] h-[400px] md:w-[500px] md:h-[500px]">
              {/* Outer Glow Ring */}
              <div className="absolute inset-0 rounded-full bg-gradient-to-r from-gold/20 via-purple-400/20 to-gold/20 blur-3xl animate-spin-slow" />
              
              {/* Glass Circle */}
              <div className="absolute inset-8 md:inset-12 rounded-full bg-white/5 backdrop-blur-xl border border-white/10 shadow-2xl" />
              
              {/* Inner Glow */}
              <div className="absolute inset-16 md:inset-20 rounded-full bg-gradient-to-br from-gold/20 to-purple-500/20 blur-2xl" />
              
              {/* Logo */}
              <div className="absolute inset-0 flex items-center justify-center">
                <img 
                  src={logo} 
                  alt="منصة العربية" 
                  className="w-32 h-32 md:w-44 md:h-44 object-contain drop-shadow-2xl animate-float z-10"
                  style={{ filter: 'drop-shadow(0 0 30px rgba(212, 175, 55, 0.4))' }}
                />
              </div>
              
              {/* Floating Arabic Letters */}
              <FloatingLettersAroundLogo />
              
              {/* Decorative Rings */}
              <div className="absolute inset-4 rounded-full border border-white/5 animate-spin-slow" style={{ animationDuration: '30s' }} />
              <div className="absolute inset-2 rounded-full border border-gold/10 animate-spin-slow" style={{ animationDuration: '40s', animationDirection: 'reverse' }} />
            </div>
          </div>

          {/* Left Side - Content */}
          <div className="order-2 lg:order-1 text-center lg:text-right space-y-8">
            {/* Sparkle Badge */}
            <div 
              className="inline-flex items-center gap-3 glass-effect text-white px-6 py-3 rounded-full border border-white/20 animate-fade-in"
            >
              <Sparkles className="h-5 w-5 text-gold animate-pulse" />
              <span className="font-semibold">المنصة الأولى لتعلم اللغة العربية</span>
              <Star className="h-4 w-4 text-gold fill-gold" />
            </div>

            {/* Main Heading */}
            <div className="space-y-4 animate-fade-in" style={{ animationDelay: '0.2s' }}>
              <h1 className="text-5xl md:text-6xl lg:text-7xl font-black leading-tight text-white">
                أتقن{' '}
                <span className="relative inline-block">
                  <span className="relative z-10 text-transparent bg-clip-text bg-gradient-to-l from-gold via-gold-light to-gold animate-shimmer">
                    العربية
                  </span>
                  <span className="absolute -bottom-2 left-0 right-0 h-4 bg-gold/30 blur-xl" />
                </span>
              </h1>
              <h2 className="text-2xl md:text-4xl font-bold text-white/90">
                بطريقة <span className="text-purple-200">احترافية</span> ومبتكرة
              </h2>
            </div>

            {/* Description */}
            <p 
              className="text-lg md:text-xl text-white/70 max-w-xl leading-relaxed animate-fade-in"
              style={{ animationDelay: '0.3s' }}
            >
              انطلق في رحلة تعلم اللغة العربية مع أفضل المعلمين والمناهج التفاعلية.
              كورسات متنوعة تناسب جميع المستويات مع متابعة شاملة لتقدمك.
            </p>

            {/* CTA Buttons */}
            <div 
              className="flex flex-col sm:flex-row items-center lg:justify-end justify-center gap-4 animate-fade-in"
              style={{ animationDelay: '0.4s' }}
            >
              <Button 
                size="lg" 
                className="bg-gradient-gold text-purple-900 hover:opacity-90 text-lg px-10 py-7 rounded-2xl font-bold shadow-gold glow-gold transition-all hover:scale-105 group" 
                asChild
              >
                <Link to="/courses">
                  <BookOpen className="ml-3 h-6 w-6 group-hover:rotate-12 transition-transform" />
                  تصفح الكورسات
                </Link>
              </Button>
              <Button 
                size="lg" 
                variant="outline" 
                className="text-lg px-10 py-7 rounded-2xl border-2 border-white/30 text-white glass-effect hover:bg-white/10 hover:border-white/50 transition-all hover:scale-105 group" 
                asChild
              >
                <Link to="/auth?tab=signup">
                  <Play className="ml-3 h-6 w-6 group-hover:scale-110 transition-transform" />
                  ابدأ مجاناً
                </Link>
              </Button>
            </div>

            {/* Features Mini Cards */}
            <div 
              className="flex flex-wrap items-center lg:justify-end justify-center gap-3 pt-4 animate-fade-in"
              style={{ animationDelay: '0.5s' }}
            >
              {['محتوى عربي أصيل', 'شهادات معتمدة', 'دعم مستمر'].map((feature, index) => (
                <span 
                  key={index}
                  className="glass-effect px-4 py-2 rounded-full text-sm text-white/80 border border-white/10 hover:border-gold/30 transition-all cursor-default"
                >
                  {feature}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Wave with Glass Effect */}
      <div className="absolute bottom-0 left-0 right-0">
        <div className="h-20 bg-gradient-to-t from-background/50 to-transparent backdrop-blur-sm" />
        <svg viewBox="0 0 1440 120" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full -mb-1">
          <path 
            d="M0,60 C360,120 720,0 1080,60 C1260,90 1380,40 1440,60 L1440,120 L0,120 Z" 
            className="fill-background"
          />
        </svg>
      </div>
    </section>
  );
};

export default HeroSection;
