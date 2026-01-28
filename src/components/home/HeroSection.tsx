import { Link } from 'react-router-dom';
import { Play, BookOpen } from 'lucide-react';
import { Button } from '@/components/ui/button';
import heroLogo from '@/assets/hero-logo.png';

// Floating Arabic Letters around the logo - ض is the leader
const FloatingArabicLetters = () => {
  const letters = [{
    letter: 'ض',
    angle: 270,
    distance: 220,
    size: 'text-6xl md:text-7xl',
    isLeader: true
  }, {
    letter: 'ع',
    angle: 315,
    distance: 200,
    size: 'text-4xl md:text-5xl',
    isLeader: false
  }, {
    letter: 'ر',
    angle: 0,
    distance: 210,
    size: 'text-4xl md:text-5xl',
    isLeader: false
  }, {
    letter: 'ب',
    angle: 45,
    distance: 195,
    size: 'text-4xl md:text-5xl',
    isLeader: false
  }, {
    letter: 'ي',
    angle: 90,
    distance: 205,
    size: 'text-4xl md:text-5xl',
    isLeader: false
  }, {
    letter: 'ة',
    angle: 135,
    distance: 200,
    size: 'text-4xl md:text-5xl',
    isLeader: false
  }, {
    letter: 'ل',
    angle: 180,
    distance: 210,
    size: 'text-4xl md:text-5xl',
    isLeader: false
  }, {
    letter: 'ن',
    angle: 225,
    distance: 195,
    size: 'text-4xl md:text-5xl',
    isLeader: false
  }];
  return <>
      {letters.map((item, index) => {
      const x = Math.cos(item.angle * Math.PI / 180) * item.distance;
      const y = Math.sin(item.angle * Math.PI / 180) * item.distance;
      return <span key={index} className={`absolute ${item.size} font-black select-none ${item.isLeader ? 'text-primary drop-shadow-lg animate-logo-bounce' : 'text-primary/50 animate-float-letter'}`} style={{
        left: `calc(50% + ${x}px)`,
        top: `calc(50% + ${y}px)`,
        transform: 'translate(-50%, -50%)',
        animationDelay: `${index * 0.15}s`,
        textShadow: item.isLeader ? '0 0 40px hsl(var(--primary) / 0.6), 0 0 80px hsl(var(--primary) / 0.3)' : '0 0 20px hsl(var(--primary) / 0.3)'
      }}>
            {item.letter}
          </span>;
    })}
    </>;
};
const HeroSection = () => {
  return <section className="relative min-h-screen flex items-center overflow-hidden bg-gradient-to-br from-purple-50 via-white to-purple-100/50">
      {/* Purple & Gold Decorative Section at Top */}
      <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-primary via-accent to-primary" />
      
      {/* Islamic Pattern Background */}
      <div className="absolute inset-0 opacity-[0.05]" style={{
      backgroundImage: `url("data:image/svg+xml,%3Csvg width='80' height='80' viewBox='0 0 80 80' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M40 0L40 80M0 40L80 40M0 0L80 80M80 0L0 80' stroke='%238B5CF6' stroke-width='0.5' fill='none'/%3E%3Ccircle cx='40' cy='40' r='20' stroke='%238B5CF6' stroke-width='0.3' fill='none'/%3E%3C/svg%3E")`
    }} />

      {/* Animated Background Elements */}
      <div className="absolute inset-0">
        {/* Strong Purple & Gold Gradient Orbs */}
        <div className="absolute top-1/4 right-1/4 w-[800px] h-[800px] bg-primary/20 rounded-full blur-[180px] animate-pulse" />
        <div className="absolute bottom-1/4 left-1/4 w-[700px] h-[700px] bg-accent/25 rounded-full blur-[150px] animate-pulse" style={{
        animationDelay: '1s'
      }} />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[900px] h-[900px] bg-primary/15 rounded-full blur-[220px]" />
        
        {/* Golden Accents - Enhanced */}
        <div className="absolute top-10 left-10 w-[400px] h-[400px] bg-accent/20 rounded-full blur-[120px] animate-pulse" style={{
        animationDelay: '0.5s'
      }} />
        <div className="absolute bottom-10 right-10 w-[350px] h-[350px] bg-accent/25 rounded-full blur-[100px] animate-pulse" style={{
        animationDelay: '1.5s'
      }} />
        <div className="absolute top-1/3 right-10 w-[300px] h-[300px] bg-primary/20 rounded-full blur-[90px]" />
        
        {/* Floating Particles - More Dense Purple & Gold */}
        {[...Array(50)].map((_, i) => <div key={i} className="absolute rounded-full animate-float-particle" style={{
        width: `${3 + Math.random() * 8}px`,
        height: `${3 + Math.random() * 8}px`,
        background: i % 4 === 0 ? 'hsl(270 70% 50% / 0.6)' : i % 4 === 1 ? 'hsl(42 95% 55% / 0.7)' : i % 4 === 2 ? 'hsl(270 70% 65% / 0.5)' : 'hsl(42 95% 60% / 0.5)',
        top: `${Math.random() * 100}%`,
        left: `${Math.random() * 100}%`,
        animationDelay: `${Math.random() * 5}s`,
        animationDuration: `${3 + Math.random() * 4}s`,
        boxShadow: i % 3 === 0 ? '0 0 10px hsl(270 70% 50% / 0.4)' : '0 0 8px hsl(42 95% 55% / 0.4)'
      }} />)}
        
        {/* Islamic Decorative Symbols - Enhanced */}
        <div className="absolute top-24 left-12 text-7xl text-primary/15 animate-float-symbol" style={{
        animationDelay: '0s'
      }}>۞</div>
        <div className="absolute top-40 right-20 text-6xl text-accent/30 animate-float-symbol" style={{
        animationDelay: '0.8s'
      }}>﴾</div>
        <div className="absolute bottom-32 left-24 text-6xl text-accent/30 animate-float-symbol" style={{
        animationDelay: '1.6s'
      }}>﴿</div>
        <div className="absolute bottom-48 right-12 text-7xl text-primary/15 animate-float-symbol" style={{
        animationDelay: '1.2s'
      }}>۝</div>
        <div className="absolute top-1/4 left-8 text-5xl text-primary/20 animate-float-symbol" style={{
        animationDelay: '0.4s'
      }}>﷽</div>
        <div className="absolute bottom-1/4 right-8 text-5xl text-accent/25 animate-float-symbol" style={{
        animationDelay: '2s'
      }}>۩</div>
        <div className="absolute top-1/2 left-4 text-4xl text-primary/15 animate-float-symbol" style={{
        animationDelay: '2.5s'
      }}>٭</div>
        <div className="absolute top-16 left-1/3 text-4xl text-accent/20 animate-float-symbol" style={{
        animationDelay: '1.8s'
      }}>❁</div>
      </div>

      {/* Subtle Grid Pattern */}
      <div className="absolute inset-0 opacity-[0.03]" style={{
      backgroundImage: `radial-gradient(circle at 1px 1px, hsl(var(--primary)) 1px, transparent 1px)`,
      backgroundSize: '40px 40px'
    }} />

      <div className="container mx-auto px-4 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center min-h-[85vh]">
          
          {/* Right Side - Logo Section - BIGGER */}
          <div className="order-1 lg:order-2 flex justify-center">
            <div className="relative w-[450px] h-[450px] md:w-[580px] md:h-[580px] animate-logo-container">
              
              {/* Outer Decorative Rings - Enhanced */}
              <div className="absolute inset-0 rounded-full border-2 border-primary/30 animate-spin-slow" style={{
              animationDuration: '60s'
            }} />
              <div className="absolute inset-4 rounded-full border-2 border-accent/20 animate-spin-slow" style={{
              animationDuration: '45s',
              animationDirection: 'reverse'
            }} />
              <div className="absolute inset-8 rounded-full border border-primary/15 animate-spin-slow" style={{
              animationDuration: '50s'
            }} />
              <div className="absolute inset-12 rounded-full border border-accent/15 animate-spin-slow" style={{
              animationDuration: '55s',
              animationDirection: 'reverse'
            }} />
              
              {/* Glow Background - Enhanced */}
              <div className="absolute inset-16 rounded-full bg-gradient-to-br from-primary/25 via-accent/15 to-primary/20 blur-3xl animate-pulse" style={{
              animationDuration: '3s'
            }} />
              
              {/* Main Glass Circle - Enhanced Glassmorphism */}
              <div className="absolute inset-20 md:inset-24 rounded-full bg-white/70 backdrop-blur-3xl border-2 border-primary/40 shadow-2xl shadow-primary/30 animate-glass-appear">
                <div className="absolute inset-0 rounded-full bg-gradient-to-br from-primary/15 via-accent/10 to-transparent" />
                <div className="absolute inset-2 rounded-full border border-accent/30" />
                <div className="absolute inset-4 rounded-full border border-primary/15" />
              </div>
              
              {/* Inner Purple Ring with Gold Accent */}
              <div className="absolute inset-[5rem] md:inset-[6.5rem] rounded-full border-2 border-primary/40 animate-pulse-glow" />
              <div className="absolute inset-[5.5rem] md:inset-[7rem] rounded-full border border-accent/30" />
              
              {/* Logo - BIGGER with Enhanced Animation */}
              <div className="absolute inset-0 flex items-center justify-center z-20">
                <div className="relative animate-logo-appear flex flex-col items-center">
                  <div className="absolute inset-0 bg-accent/20 blur-[60px] rounded-full scale-[2] animate-pulse" style={{
                  animationDuration: '2s'
                }} />
                  <div className="absolute inset-0 bg-primary/15 blur-[40px] rounded-full scale-[1.5] animate-pulse" style={{
                  animationDuration: '2.5s',
                  animationDelay: '0.5s'
                }} />
                  
                  {/* النص الذهبي فوق اللوقو */}
                  
                  
                  <img src={heroLogo} alt="منصة العربية" className="w-44 h-44 md:w-60 md:h-60 object-contain relative z-10 drop-shadow-2xl animate-logo-float" style={{
                  filter: 'drop-shadow(0 0 30px hsl(var(--primary) / 0.3)) drop-shadow(0 0 60px hsl(var(--accent) / 0.2))'
                }} />
                </div>
              </div>
              
              {/* Floating Arabic Letters */}
              <FloatingArabicLetters />
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
            }}>النجاة</span>
              <span className="font-bold">المنصة الأولى لتعلم اللغة العربية</span>
              <span className="text-accent">✦</span>
            </div>

            {/* Main Heading */}
            <div className="space-y-4 animate-fade-in" style={{
            animationDelay: '0.2s'
          }}>
              <h1 className="text-5xl md:text-7xl lg:text-8xl font-black leading-tight text-foreground">
                أتقن{' '}
                <span className="relative inline-block">
                  <span className="text-primary text-6xl md:text-8xl lg:text-9xl" style={{
                  textShadow: '0 0 60px hsl(var(--primary) / 0.4)'
                }}>
                    العربية
                  </span>
                </span>
              </h1>
              <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold text-muted-foreground">
                بطريقة <span className="text-primary/80">احترافية</span> ومبتكرة
              </h2>
            </div>

            {/* Description */}
            <p className="text-lg md:text-xl text-muted-foreground max-w-xl leading-relaxed animate-fade-in" style={{
            animationDelay: '0.3s'
          }}>
              انطلق في رحلة تعلم اللغة العربية مع أفضل المعلمين والمناهج التفاعلية.
              كورسات متنوعة تناسب جميع المستويات.
            </p>

            {/* CTA Button */}
            <div className="flex items-center lg:justify-end justify-center animate-fade-in" style={{
            animationDelay: '0.4s'
          }}>
              <Button size="lg" className="bg-primary hover:bg-primary/90 text-primary-foreground text-lg px-10 py-7 rounded-2xl font-bold shadow-lg shadow-primary/25 transition-all hover:scale-105 hover:shadow-xl hover:shadow-primary/30 group" asChild>
                <Link to="/courses">
                  <BookOpen className="ml-3 h-6 w-6 group-hover:rotate-6 transition-transform" />
                  تصفح الكورسات
                </Link>
              </Button>
            </div>

            {/* Feature Tags */}
            <div className="flex flex-wrap items-center lg:justify-end justify-center gap-3 pt-2 animate-fade-in" style={{
            animationDelay: '0.5s'
          }}>
              {[{
              icon: '🏆',
              text: 'شهادات معتمدة'
            }, {
              icon: '⭐',
              text: 'محتوى حصري'
            }, {
              icon: '💎',
              text: 'جودة عالية'
            }].map((item, index) => <span key={index} className="inline-flex items-center gap-2 bg-white/80 backdrop-blur-sm px-4 py-2 rounded-full text-sm text-foreground/80 border border-primary/10 hover:border-primary/30 hover:bg-primary/5 transition-all cursor-default shadow-sm">
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