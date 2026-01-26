import { motion, Easing } from 'framer-motion';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import PageTransition from '@/components/layout/PageTransition';
import { BookOpen, Users, Target, Award, Heart, Sparkles } from 'lucide-react';

const easeOut: Easing = [0.25, 0.46, 0.45, 0.94];

const About = () => {
  const values = [
    {
      icon: BookOpen,
      title: 'التعليم المتميز',
      description: 'نقدم محتوى تعليمي عالي الجودة يجمع بين الأصالة والمعاصرة',
      symbol: '۞',
    },
    {
      icon: Users,
      title: 'المجتمع التعليمي',
      description: 'نبني مجتمعاً من المتعلمين المتحمسين للغة العربية حول العالم',
      symbol: '﴾',
    },
    {
      icon: Target,
      title: 'الأهداف الواضحة',
      description: 'نساعدك على تحقيق أهدافك التعليمية بخطوات واضحة ومدروسة',
      symbol: '﴿',
    },
    {
      icon: Award,
      title: 'الشهادات المعتمدة',
      description: 'احصل على شهادات معترف بها تثبت إتقانك للغة العربية',
      symbol: '۝',
    },
  ];

  const features = [
    { number: '﴾', title: 'منهج متكامل', desc: 'تغطية شاملة لجميع جوانب اللغة' },
    { number: '﴿', title: 'تفاعلي', desc: 'تمارين وأنشطة تفاعلية ممتعة' },
    { number: '۞', title: 'مرن', desc: 'تعلم في أي وقت ومن أي مكان' },
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.15 },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5, ease: easeOut },
    },
  };

  return (
    <PageTransition>
      <div className="min-h-screen flex flex-col bg-gradient-to-br from-purple-50/50 via-white to-purple-100/30">
        <Navbar />
        <main className="flex-1 pt-24">
          
          {/* Hero Section */}
          <section className="relative py-20 overflow-hidden">
            {/* Background Elements */}
            <div className="absolute inset-0">
              <div className="absolute top-1/4 right-1/4 w-[600px] h-[600px] bg-primary/15 rounded-full blur-[150px] animate-pulse" />
              <div className="absolute bottom-1/4 left-1/4 w-[500px] h-[500px] bg-accent/20 rounded-full blur-[120px] animate-pulse" style={{ animationDelay: '1s' }} />
              
              {/* Islamic Decorative Symbols */}
              <div className="absolute top-20 left-16 text-6xl text-primary/10 animate-float" style={{ animationDelay: '0s' }}>۞</div>
              <div className="absolute top-32 right-24 text-5xl text-accent/15 animate-float" style={{ animationDelay: '1s' }}>﴾</div>
              <div className="absolute bottom-32 left-32 text-5xl text-accent/15 animate-float" style={{ animationDelay: '2s' }}>﴿</div>
              <div className="absolute bottom-20 right-16 text-6xl text-primary/10 animate-float" style={{ animationDelay: '1.5s' }}>۝</div>
            </div>

            <div className="container mx-auto px-4 relative z-10">
              <motion.div 
                className="text-center max-w-4xl mx-auto space-y-8"
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
              >
                {/* Badge */}
                <div className="inline-flex items-center gap-3 bg-primary/10 backdrop-blur-md text-primary px-6 py-3 rounded-full border border-primary/20">
                  <Heart className="h-5 w-5" />
                  <span className="font-bold">نحن نحب اللغة العربية</span>
                  <span className="text-accent">✦</span>
                </div>

                {/* Main Title */}
                <h1 className="text-5xl md:text-6xl lg:text-7xl font-black text-foreground">
                  من{' '}
                  <span className="text-primary" style={{ textShadow: '0 0 40px hsl(var(--primary) / 0.3)' }}>
                    نحن
                  </span>
                </h1>

                {/* Description */}
                <p className="text-xl md:text-2xl text-muted-foreground leading-relaxed">
                  منصة تعليمية رائدة تهدف إلى نشر اللغة العربية حول العالم بأساليب حديثة ومبتكرة
                </p>
              </motion.div>
            </div>
          </section>

          {/* Mission Section */}
          <section className="py-20 relative">
            <div className="container mx-auto px-4">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
                
                {/* Content */}
                <motion.div 
                  className="space-y-8 text-right"
                  initial={{ opacity: 0, x: -30 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6 }}
                >
                  <div className="inline-flex items-center gap-2 text-accent text-2xl">
                    <Sparkles className="h-6 w-6" />
                    <span className="font-bold">رسالتنا</span>
                  </div>
                  
                  <h2 className="text-4xl md:text-5xl font-black text-foreground">
                    نشر{' '}
                    <span className="text-primary">جمال</span>
                    {' '}اللغة العربية
                  </h2>
                  
                  <p className="text-lg text-muted-foreground leading-relaxed">
                    نؤمن بأن اللغة العربية هي أجمل اللغات وأغناها، ونسعى لتقديمها للعالم بأسلوب عصري يجمع بين الأصالة والحداثة. 
                    هدفنا أن نجعل تعلم العربية تجربة ممتعة وسهلة للجميع.
                  </p>
                  
                  <p className="text-lg text-muted-foreground leading-relaxed">
                    نستخدم أحدث التقنيات التعليمية ونعمل مع نخبة من المعلمين المتخصصين لضمان 
                    تقديم أفضل تجربة تعليمية لطلابنا حول العالم.
                  </p>
                </motion.div>

                {/* Decorative Element */}
                <motion.div 
                  className="relative flex justify-center"
                  initial={{ opacity: 0, scale: 0.8 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: 0.2 }}
                >
                  <div className="relative w-[400px] h-[400px]">
                    {/* Rings */}
                    <div className="absolute inset-0 rounded-full border-2 border-primary/20 animate-spin-slow" style={{ animationDuration: '50s' }} />
                    <div className="absolute inset-8 rounded-full border border-accent/20 animate-spin-slow" style={{ animationDuration: '40s', animationDirection: 'reverse' }} />
                    <div className="absolute inset-16 rounded-full border border-primary/15 animate-spin-slow" style={{ animationDuration: '60s' }} />
                    
                    {/* Glass Center */}
                    <div className="absolute inset-20 rounded-full bg-white/60 backdrop-blur-2xl border-2 border-primary/30 shadow-2xl shadow-primary/20 flex items-center justify-center">
                      <div className="text-center">
                        <span className="text-7xl text-primary font-black block" style={{ textShadow: '0 0 30px hsl(var(--primary) / 0.3)' }}>
                          ض
                        </span>
                        <span className="text-accent text-lg font-bold">حرف الضاد</span>
                      </div>
                    </div>

                    {/* Floating Letters */}
                    <motion.div 
                      className="absolute top-0 left-1/2 -translate-x-1/2 text-4xl text-primary/30"
                      animate={{ y: [-10, 10, -10] }}
                      transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                    >
                      ع
                    </motion.div>
                    <motion.div 
                      className="absolute bottom-0 left-1/2 -translate-x-1/2 text-4xl text-primary/30"
                      animate={{ y: [10, -10, 10] }}
                      transition={{ duration: 4, repeat: Infinity, ease: "easeInOut", delay: 1 }}
                    >
                      ر
                    </motion.div>
                    <motion.div 
                      className="absolute left-0 top-1/2 -translate-y-1/2 text-4xl text-primary/30"
                      animate={{ x: [-10, 10, -10] }}
                      transition={{ duration: 4, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
                    >
                      ب
                    </motion.div>
                    <motion.div 
                      className="absolute right-0 top-1/2 -translate-y-1/2 text-4xl text-primary/30"
                      animate={{ x: [10, -10, 10] }}
                      transition={{ duration: 4, repeat: Infinity, ease: "easeInOut", delay: 1.5 }}
                    >
                      ي
                    </motion.div>
                  </div>
                </motion.div>
              </div>
            </div>
          </section>

          {/* Values Section */}
          <section className="py-20 relative bg-gradient-to-b from-transparent via-primary/5 to-transparent">
            <div className="container mx-auto px-4">
              <motion.div 
                className="text-center mb-16"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6 }}
              >
                <h2 className="text-4xl md:text-5xl font-black text-foreground mb-4">
                  قيمنا{' '}
                  <span className="text-primary">الأساسية</span>
                </h2>
                <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                  نلتزم بمجموعة من القيم التي توجه عملنا وتحدد هويتنا
                </p>
              </motion.div>

              <motion.div 
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8"
                variants={containerVariants}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
              >
                {values.map((value, index) => (
                  <motion.div
                    key={index}
                    variants={itemVariants}
                    whileHover={{ y: -8, transition: { duration: 0.3 } }}
                    className="group relative bg-white/60 backdrop-blur-xl border border-primary/20 rounded-3xl p-8 hover:shadow-2xl hover:shadow-primary/20 transition-all duration-500"
                  >
                    {/* Symbol Background */}
                    <div className="absolute top-4 left-4 text-4xl text-accent/20 group-hover:text-accent/40 transition-colors">
                      {value.symbol}
                    </div>

                    {/* Icon */}
                    <div className="relative z-10 w-16 h-16 rounded-2xl bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform shadow-lg shadow-primary/30">
                      <value.icon className="h-8 w-8 text-primary-foreground" />
                    </div>

                    {/* Content */}
                    <h3 className="text-xl font-bold text-foreground mb-3">{value.title}</h3>
                    <p className="text-muted-foreground leading-relaxed">{value.description}</p>
                  </motion.div>
                ))}
              </motion.div>
            </div>
          </section>

          {/* Features Section */}
          <section className="py-20 relative">
            <div className="container mx-auto px-4">
              <motion.div 
                className="bg-gradient-to-br from-primary/10 via-primary/5 to-accent/10 backdrop-blur-xl border border-primary/20 rounded-[3rem] p-12 md:p-16"
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6 }}
              >
                <div className="text-center mb-12">
                  <h2 className="text-3xl md:text-4xl font-black text-foreground mb-4">
                    لماذا تختار{' '}
                    <span className="text-primary">منصتنا</span>؟
                  </h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                  {features.map((feature, index) => (
                    <motion.div 
                      key={index} 
                      className="text-center space-y-4"
                      initial={{ opacity: 0, y: 20 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.5, delay: index * 0.1 }}
                    >
                      <span className="text-5xl text-accent block">{feature.number}</span>
                      <h3 className="text-2xl font-bold text-foreground">{feature.title}</h3>
                      <p className="text-muted-foreground">{feature.desc}</p>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            </div>
          </section>

          {/* CTA Section */}
          <section className="py-20 relative">
            <div className="container mx-auto px-4">
              <motion.div 
                className="text-center max-w-3xl mx-auto space-y-8"
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6 }}
              >
                <h2 className="text-4xl md:text-5xl font-black text-foreground">
                  ابدأ رحلتك مع{' '}
                  <span className="text-primary">العربية</span>
                  {' '}اليوم
                </h2>
                <p className="text-xl text-muted-foreground">
                  انضم إلى آلاف المتعلمين حول العالم واكتشف جمال اللغة العربية
                </p>
                <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                  <motion.a
                    href="/courses"
                    className="bg-primary hover:bg-primary/90 text-primary-foreground text-lg px-10 py-4 rounded-2xl font-bold shadow-lg shadow-primary/25 transition-all hover:scale-105 hover:shadow-xl inline-flex items-center gap-3"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <BookOpen className="h-6 w-6" />
                    تصفح الكورسات
                  </motion.a>
                  <motion.a
                    href="/auth?tab=signup"
                    className="text-lg px-10 py-4 rounded-2xl font-bold border-2 border-primary/40 text-primary bg-primary/5 hover:bg-primary/10 hover:border-primary/60 transition-all inline-flex items-center gap-3"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <Users className="h-6 w-6" />
                    انضم إلينا
                  </motion.a>
                </div>
              </motion.div>
            </div>
          </section>

        </main>
        <Footer />
      </div>
    </PageTransition>
  );
};

export default About;
