import { Link } from 'react-router-dom';
import { Play, BookOpen, Sparkles, GraduationCap, Star } from 'lucide-react';
import { Button } from '@/components/ui/button';
import logo from '@/assets/logo.png';

// Floating Arabic Letters Component
const FloatingLetters = () => {
  const letters = [
    { char: 'ع', top: '15%', right: '8%', size: 'text-[12rem]', delay: '0s', duration: '8s' },
    { char: 'ر', top: '60%', left: '5%', size: 'text-[14rem]', delay: '2s', duration: '10s' },
    { char: 'ب', top: '25%', left: '15%', size: 'text-[8rem]', delay: '1s', duration: '9s' },
    { char: 'ي', top: '70%', right: '12%', size: 'text-[10rem]', delay: '3s', duration: '11s' },
    { char: 'ة', top: '40%', right: '20%', size: 'text-[6rem]', delay: '0.5s', duration: '7s' },
    { char: 'ل', top: '80%', left: '25%', size: 'text-[9rem]', delay: '4s', duration: '12s' },
    { char: 'ا', top: '10%', left: '40%', size: 'text-[7rem]', delay: '1.5s', duration: '8s' },
    { char: 'ن', top: '50%', left: '35%', size: 'text-[11rem]', delay: '2.5s', duration: '9s' },
  ];

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {letters.map((letter, index) => (
        <span
          key={index}
          className={`absolute ${letter.size} font-black text-white/[0.03] select-none animate-float-letter`}
          style={{
            top: letter.top,
            right: letter.right,
            left: letter.left,
            animationDelay: letter.delay,
            animationDuration: letter.duration,
          }}
        >
          {letter.char}
        </span>
      ))}
    </div>
  );
};

const HeroSection = () => {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-gradient-hero">
      {/* Animated Background Elements */}
      <div className="absolute inset-0">
        {/* Gradient Orbs */}
        <div className="absolute top-1/4 right-1/4 w-[500px] h-[500px] bg-purple-500/20 rounded-full blur-[120px] animate-pulse" />
        <div className="absolute bottom-1/4 left-1/4 w-[600px] h-[600px] bg-purple-600/15 rounded-full blur-[150px] animate-pulse" style={{ animationDelay: '1s' }} />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] bg-gold/10 rounded-full blur-[100px] animate-pulse" style={{ animationDelay: '2s' }} />
        
        {/* Decorative Circles */}
        <div className="absolute top-20 right-20 w-3 h-3 bg-gold rounded-full animate-bounce-soft" />
        <div className="absolute top-40 left-32 w-2 h-2 bg-purple-300 rounded-full animate-bounce-soft" style={{ animationDelay: '0.5s' }} />
        <div className="absolute bottom-40 right-40 w-4 h-4 bg-gold/60 rounded-full animate-bounce-soft" style={{ animationDelay: '1s' }} />
        <div className="absolute bottom-20 left-20 w-2 h-2 bg-purple-400 rounded-full animate-bounce-soft" style={{ animationDelay: '1.5s' }} />
      </div>

      {/* Floating Arabic Letters */}
      <FloatingLetters />

      {/* Grid Pattern Overlay */}
      <div 
        className="absolute inset-0 opacity-[0.02]"
        style={{
          backgroundImage: `linear-gradient(rgba(255,255,255,.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.1) 1px, transparent 1px)`,
          backgroundSize: '60px 60px',
        }}
      />

      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-5xl mx-auto text-center space-y-10">
          
          {/* Logo with Glow Effect */}
          <div className="relative inline-block animate-fade-in">
            <div className="absolute inset-0 blur-3xl bg-gold/30 rounded-full scale-150" />
            <img 
              src={logo} 
              alt="منصة العربية" 
              className="h-32 md:h-40 w-auto mx-auto relative z-10 drop-shadow-2xl"
            />
          </div>

          {/* Sparkle Badge */}
          <div 
            className="inline-flex items-center gap-3 bg-white/10 backdrop-blur-md text-white px-6 py-3 rounded-full border border-white/20 animate-fade-in"
            style={{ animationDelay: '0.2s' }}
          >
            <Sparkles className="h-5 w-5 text-gold animate-pulse" />
            <span className="font-semibold">المنصة الأولى لتعلم اللغة العربية</span>
            <Star className="h-4 w-4 text-gold fill-gold" />
          </div>

          {/* Main Heading */}
          <div className="space-y-4 animate-fade-in" style={{ animationDelay: '0.3s' }}>
            <h1 className="text-5xl md:text-7xl lg:text-8xl font-black leading-tight text-white">
              أتقن{' '}
              <span className="relative inline-block">
                <span className="relative z-10 text-transparent bg-clip-text bg-gradient-to-l from-gold via-gold-light to-gold">
                  العربية
                </span>
                <span className="absolute -bottom-2 left-0 right-0 h-4 bg-gold/20 blur-xl" />
              </span>
            </h1>
            <h2 className="text-3xl md:text-5xl font-bold text-white/90">
              بطريقة <span className="text-purple-200">احترافية</span> ومبتكرة
            </h2>
          </div>

          {/* Description */}
          <p 
            className="text-xl md:text-2xl text-white/70 max-w-3xl mx-auto leading-relaxed animate-fade-in"
            style={{ animationDelay: '0.4s' }}
          >
            انطلق في رحلة تعلم اللغة العربية مع أفضل المعلمين والمناهج التفاعلية.
            كورسات متنوعة تناسب جميع المستويات مع متابعة شاملة لتقدمك.
          </p>

          {/* CTA Buttons */}
          <div 
            className="flex flex-col sm:flex-row items-center justify-center gap-5 animate-fade-in"
            style={{ animationDelay: '0.5s' }}
          >
            <Button 
              size="lg" 
              className="bg-gradient-gold text-purple-900 hover:opacity-90 text-lg px-10 py-7 rounded-2xl font-bold shadow-gold glow-gold transition-all hover:scale-105" 
              asChild
            >
              <Link to="/courses">
                <BookOpen className="ml-3 h-6 w-6" />
                تصفح الكورسات
              </Link>
            </Button>
            <Button 
              size="lg" 
              variant="outline" 
              className="text-lg px-10 py-7 rounded-2xl border-2 border-white/30 text-white bg-white/5 backdrop-blur-sm hover:bg-white/10 hover:border-white/50 transition-all hover:scale-105" 
              asChild
            >
              <Link to="/auth?tab=signup">
                <Play className="ml-3 h-6 w-6" />
                ابدأ مجاناً
              </Link>
            </Button>
          </div>

          {/* Stats with Glass Effect */}
          <div 
            className="grid grid-cols-3 gap-6 pt-16 max-w-3xl mx-auto animate-fade-in"
            style={{ animationDelay: '0.6s' }}
          >
            {[
              { value: '+500', label: 'درس تعليمي', icon: BookOpen },
              { value: '+1000', label: 'طالب مسجل', icon: GraduationCap },
              { value: '+50', label: 'كورس متاح', icon: Star },
            ].map((stat, index) => (
              <div 
                key={index}
                className="relative group"
              >
                <div className="absolute inset-0 bg-white/5 rounded-2xl blur-xl group-hover:bg-white/10 transition-all" />
                <div className="relative bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/10 hover:border-gold/30 transition-all hover:-translate-y-1">
                  <stat.icon className="h-8 w-8 text-gold mx-auto mb-3" />
                  <div className="text-4xl md:text-5xl font-black text-white mb-1">{stat.value}</div>
                  <div className="text-sm text-white/60">{stat.label}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom Wave */}
      <div className="absolute bottom-0 left-0 right-0">
        <svg viewBox="0 0 1440 120" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full">
          <path 
            d="M0,60 C360,120 720,0 1080,60 C1260,90 1380,40 1440,60 L1440,120 L0,120 Z" 
            fill="hsl(270 30% 99%)"
          />
        </svg>
      </div>
    </section>
  );
};

export default HeroSection;
