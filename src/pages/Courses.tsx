import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Search, Play, BookOpen, Sparkles, GraduationCap } from 'lucide-react';
import { motion, Easing } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import PageTransition from '@/components/layout/PageTransition';
import { supabase } from '@/integrations/supabase/client';

interface Course {
  id: string;
  title: string;
  description: string | null;
  thumbnail_url: string | null;
  level: string | null;
  is_free: boolean | null;
  price: number | null;
  is_published: boolean | null;
}

const levelLabels = {
  beginner: { label: 'مبتدئ', color: 'bg-emerald-500/20 text-emerald-600 border-emerald-500/30' },
  intermediate: { label: 'متوسط', color: 'bg-amber-500/20 text-amber-600 border-amber-500/30' },
  advanced: { label: 'متقدم', color: 'bg-rose-500/20 text-rose-600 border-rose-500/30' },
};

const easeOut: Easing = [0.25, 0.46, 0.45, 0.94];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const cardVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.5,
      ease: easeOut,
    },
  },
};

const Courses = () => {
  const [courses, setCourses] = useState<Course[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [levelFilter, setLevelFilter] = useState('all');
  const [priceFilter, setPriceFilter] = useState('all');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCourses();
  }, []);

  const fetchCourses = async () => {
    try {
      const { data, error } = await supabase
        .from('courses')
        .select('*')
        .eq('is_published', true);

      if (error) {
        console.error('Error fetching courses:', error);
        return;
      }

      if (data) {
        setCourses(data);
      }
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredCourses = courses.filter((course) => {
    const matchesSearch = course.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         course.description?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesLevel = levelFilter === 'all' || course.level === levelFilter;
    const matchesPrice = priceFilter === 'all' || 
                        (priceFilter === 'free' && course.is_free) ||
                        (priceFilter === 'paid' && !course.is_free);
    
    return matchesSearch && matchesLevel && matchesPrice;
  });

  return (
    <PageTransition>
      <div className="min-h-screen flex flex-col bg-gradient-to-br from-purple-50/50 via-white to-purple-100/30">
        <Navbar />
        <main className="flex-1 pt-24">
          {/* Hero Section */}
          <section className="relative py-16 overflow-hidden">
            {/* Background Elements */}
            <div className="absolute inset-0">
              <div className="absolute top-1/4 right-1/4 w-[500px] h-[500px] bg-primary/15 rounded-full blur-[150px] animate-pulse" />
              <div className="absolute bottom-1/4 left-1/4 w-[400px] h-[400px] bg-accent/20 rounded-full blur-[120px] animate-pulse" style={{ animationDelay: '1s' }} />
              
              {/* Islamic Decorative Symbols */}
              <div className="absolute top-16 left-12 text-5xl text-primary/10 animate-float">۞</div>
              <div className="absolute top-24 right-20 text-4xl text-accent/15 animate-float" style={{ animationDelay: '1s' }}>﴾</div>
              <div className="absolute bottom-20 left-24 text-4xl text-accent/15 animate-float" style={{ animationDelay: '2s' }}>﴿</div>
            </div>

            <div className="container mx-auto px-4 relative z-10">
              <motion.div 
                className="max-w-3xl mx-auto text-center space-y-6"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
              >
                {/* Badge */}
                <div className="inline-flex items-center gap-3 bg-primary/10 backdrop-blur-md text-primary px-6 py-3 rounded-full border border-primary/20">
                  <GraduationCap className="h-5 w-5" />
                  <span className="font-bold">كورسات تعليمية متميزة</span>
                  <span className="text-accent">✦</span>
                </div>

                {/* Title */}
                <h1 className="text-4xl md:text-5xl lg:text-6xl font-black text-foreground">
                  اكتشف{' '}
                  <span className="text-primary" style={{ textShadow: '0 0 40px hsl(var(--primary) / 0.3)' }}>
                    كورساتنا
                  </span>
                </h1>

                <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto">
                  مجموعة متنوعة من الكورسات لتعلم اللغة العربية بجميع مستوياتها مع أفضل المعلمين
                </p>

                {/* Search & Filters */}
                <motion.div 
                  className="flex flex-col sm:flex-row gap-4 max-w-2xl mx-auto pt-4"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.2 }}
                >
                  <div className="relative flex-1">
                    <Search className="absolute right-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                    <Input
                      placeholder="ابحث عن كورس..."
                      className="pr-12 h-14 rounded-2xl bg-white/70 backdrop-blur-sm border-primary/20 focus:border-primary/40 text-lg"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                  </div>
                  <Select value={levelFilter} onValueChange={setLevelFilter}>
                    <SelectTrigger className="w-full sm:w-44 h-14 rounded-2xl bg-white/70 backdrop-blur-sm border-primary/20">
                      <SelectValue placeholder="المستوى" />
                    </SelectTrigger>
                    <SelectContent className="rounded-xl">
                      <SelectItem value="all">جميع المستويات</SelectItem>
                      <SelectItem value="beginner">مبتدئ</SelectItem>
                      <SelectItem value="intermediate">متوسط</SelectItem>
                      <SelectItem value="advanced">متقدم</SelectItem>
                    </SelectContent>
                  </Select>
                  <Select value={priceFilter} onValueChange={setPriceFilter}>
                    <SelectTrigger className="w-full sm:w-36 h-14 rounded-2xl bg-white/70 backdrop-blur-sm border-primary/20">
                      <SelectValue placeholder="السعر" />
                    </SelectTrigger>
                    <SelectContent className="rounded-xl">
                      <SelectItem value="all">الكل</SelectItem>
                      <SelectItem value="free">مجاني</SelectItem>
                      <SelectItem value="paid">مدفوع</SelectItem>
                    </SelectContent>
                  </Select>
                </motion.div>
              </motion.div>
            </div>
          </section>

          {/* Courses Grid */}
          <section className="py-16">
            <div className="container mx-auto px-4">
              {loading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                  {[1, 2, 3, 4, 5, 6].map((i) => (
                    <div key={i} className="bg-white/60 backdrop-blur-xl rounded-3xl p-6 animate-pulse">
                      <div className="h-48 bg-primary/10 rounded-2xl mb-4" />
                      <div className="h-6 bg-primary/10 rounded-lg mb-2 w-3/4" />
                      <div className="h-4 bg-primary/10 rounded-lg w-1/2" />
                    </div>
                  ))}
                </div>
              ) : filteredCourses.length === 0 ? (
                <motion.div 
                  className="text-center py-20"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.5 }}
                >
                  <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-primary/10 flex items-center justify-center">
                    <BookOpen className="h-12 w-12 text-primary" />
                  </div>
                  <h3 className="text-2xl font-bold text-foreground mb-2">لا توجد كورسات متاحة</h3>
                  <p className="text-muted-foreground text-lg">
                    {courses.length === 0 
                      ? 'لم يتم إضافة كورسات بعد. ترقب المزيد قريباً!'
                      : 'لا توجد كورسات تطابق معايير البحث'}
                  </p>
                </motion.div>
              ) : (
                <motion.div 
                  className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
                  variants={containerVariants}
                  initial="hidden"
                  animate="visible"
                >
                  {filteredCourses.map((course) => (
                    <motion.div
                      key={course.id}
                      variants={cardVariants}
                      whileHover={{ y: -8, transition: { duration: 0.3 } }}
                      className="group"
                    >
                      <Link to={`/courses/${course.id}`} className="block">
                      <div className="relative bg-white/60 backdrop-blur-xl border border-primary/20 rounded-3xl overflow-hidden hover:shadow-2xl hover:shadow-primary/20 transition-all duration-500">
                        {/* Thumbnail */}
                        <div className="relative h-52 overflow-hidden">
                          <img
                            src={course.thumbnail_url || 'https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?w=400&h=300&fit=crop'}
                            alt={course.title}
                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                            <motion.div
                              initial={{ scale: 0 }}
                              whileHover={{ scale: 1.1 }}
                              className="w-16 h-16 rounded-full bg-primary/90 flex items-center justify-center shadow-lg shadow-primary/30"
                            >
                              <Play className="h-8 w-8 text-primary-foreground mr-[-2px]" />
                            </motion.div>
                          </div>
                          
                          {/* Price Badge */}
                          <div className="absolute top-4 left-4">
                            {course.is_free ? (
                              <Badge className="bg-accent text-accent-foreground font-bold px-4 py-1.5 text-sm shadow-lg">
                                مجاني
                              </Badge>
                            ) : (
                              <Badge className="bg-white/90 text-foreground font-bold px-4 py-1.5 text-sm shadow-lg">
                                {course.price} ر.س
                              </Badge>
                            )}
                          </div>
                          
                          {/* Level Badge */}
                          <div className="absolute top-4 right-4">
                            <Badge 
                              className={`font-bold px-3 py-1.5 text-sm border ${
                                levelLabels[course.level as keyof typeof levelLabels]?.color || 'bg-primary/20 text-primary'
                              }`}
                            >
                              {levelLabels[course.level as keyof typeof levelLabels]?.label || course.level || 'مبتدئ'}
                            </Badge>
                          </div>
                        </div>

                        {/* Content */}
                        <div className="p-6 space-y-4">
                          <h3 className="font-bold text-xl text-foreground line-clamp-2 group-hover:text-primary transition-colors">
                            {course.title}
                          </h3>
                          
                          <p className="text-muted-foreground line-clamp-2 leading-relaxed">
                            {course.description || 'اكتشف محتوى هذا الكورس الرائع وابدأ رحلة التعلم'}
                          </p>

                          <Button 
                            className="w-full bg-primary hover:bg-primary/90 text-primary-foreground rounded-xl h-12 font-bold text-base shadow-lg shadow-primary/25 hover:shadow-xl hover:shadow-primary/30 transition-all group/btn" 
                            asChild
                          >
                            <Link to={`/courses/${course.id}`}>
                              <Sparkles className="h-5 w-5 ml-2 group-hover/btn:rotate-12 transition-transform" />
                              عرض الكورس
                            </Link>
                          </Button>
                        </div>

                        {/* Decorative Element */}
                        <div className="absolute -bottom-10 -right-10 text-8xl text-primary/5 font-arabic">
                          ض
                        </div>
                      </div>
                      </Link>
                    </motion.div>
                  ))}
                </motion.div>
              )}
            </div>
          </section>

          {/* CTA Section */}
          <section className="py-16 relative">
            <div className="container mx-auto px-4">
              <motion.div 
                className="bg-gradient-to-br from-primary/10 via-primary/5 to-accent/10 backdrop-blur-xl border border-primary/20 rounded-[3rem] p-12 md:p-16 text-center"
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6 }}
              >
                <h2 className="text-3xl md:text-4xl font-black text-foreground mb-4">
                  لم تجد ما تبحث عنه؟
                </h2>
                <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
                  نحن نعمل على إضافة المزيد من الكورسات باستمرار. تابعنا للحصول على آخر التحديثات
                </p>
                <Button 
                  size="lg"
                  className="bg-primary hover:bg-primary/90 text-primary-foreground text-lg px-10 py-7 rounded-2xl font-bold shadow-lg shadow-primary/25"
                  asChild
                >
                  <Link to="/auth?tab=signup">
                    <GraduationCap className="h-6 w-6 ml-3" />
                    سجل الآن للحصول على التحديثات
                  </Link>
                </Button>
              </motion.div>
            </div>
          </section>
        </main>
        <Footer />
      </div>
    </PageTransition>
  );
};

export default Courses;
