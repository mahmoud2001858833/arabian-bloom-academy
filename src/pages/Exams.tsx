import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Search, ClipboardList, Clock, Target, Sparkles } from 'lucide-react';
import { motion, Easing } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import PageTransition from '@/components/layout/PageTransition';
import { supabase } from '@/integrations/supabase/client';
import { useLanguage } from '@/i18n/LanguageContext';

interface Exam {
  id: string;
  title: string;
  description: string | null;
  duration_minutes: number;
  passing_score: number;
  is_published: boolean;
  created_at: string;
}

const easeOut: Easing = [0.25, 0.46, 0.45, 0.94];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1 },
  },
};

const cardVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: easeOut },
  },
};

const Exams = () => {
  const { t } = useLanguage();
  const [exams, setExams] = useState<Exam[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchExams();
  }, []);

  const fetchExams = async () => {
    try {
      // Get exams that are published
      const { data, error } = await supabase
        .from('exams')
        .select('*')
        .eq('is_published', true)
        .order('created_at', { ascending: false });

      if (!error && data) {
        // Filter out exams linked to lessons
        const { data: linkedExamIds } = await supabase
          .from('lessons')
          .select('exam_id')
          .not('exam_id', 'is', null);
        
        const linkedIds = new Set((linkedExamIds || []).map(l => l.exam_id));
        setExams(data.filter(exam => !linkedIds.has(exam.id)));
      }
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredExams = exams.filter((exam) =>
    exam.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    exam.description?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <PageTransition>
      <div className="min-h-screen flex flex-col bg-gradient-to-br from-purple-50/50 via-white to-purple-100/30">
        <Navbar />
        <main className="flex-1 pt-24">
          {/* Hero Section */}
          <section className="relative py-16 overflow-hidden">
            <div className="absolute inset-0">
              <div className="absolute top-1/4 right-1/4 w-[500px] h-[500px] bg-primary/15 rounded-full blur-[150px] animate-pulse" />
              <div className="absolute bottom-1/4 left-1/4 w-[400px] h-[400px] bg-accent/20 rounded-full blur-[120px] animate-pulse" style={{ animationDelay: '1s' }} />
              <div className="absolute top-16 left-12 text-5xl text-primary/10 animate-float">۞</div>
              <div className="absolute top-24 right-20 text-4xl text-accent/15 animate-float" style={{ animationDelay: '1s' }}>﴾</div>
            </div>

            <div className="container mx-auto px-4 relative z-10">
              <motion.div
                className="max-w-3xl mx-auto text-center space-y-6"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
              >
                <div className="inline-flex items-center gap-3 bg-primary/10 backdrop-blur-md text-primary px-6 py-3 rounded-full border border-primary/20">
                  <ClipboardList className="h-5 w-5" />
                  <span className="font-bold">{t('exams.badge')}</span>
                  <span className="text-accent">✦</span>
                </div>

                <h1 className="text-4xl md:text-5xl lg:text-6xl font-black text-foreground">
                  {t('exams.discover')}{' '}
                  <span className="text-primary" style={{ textShadow: '0 0 40px hsl(var(--primary) / 0.3)' }}>
                    {t('exams.ourExams')}
                  </span>
                </h1>

                <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto">
                  {t('exams.description')}
                </p>

                <motion.div
                  className="flex flex-col sm:flex-row gap-4 max-w-xl mx-auto pt-4"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.2 }}
                >
                  <div className="relative flex-1">
                    <Search className="absolute right-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                    <Input
                      placeholder={t('exams.searchPlaceholder')}
                      className="pr-12 h-14 rounded-2xl bg-white/70 backdrop-blur-sm border-primary/20 focus:border-primary/40 text-lg"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                  </div>
                </motion.div>
              </motion.div>
            </div>
          </section>

          {/* Exams Grid */}
          <section className="py-16">
            <div className="container mx-auto px-4">
              {loading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="bg-white/60 backdrop-blur-xl rounded-3xl p-6 animate-pulse">
                      <div className="h-8 bg-primary/10 rounded-lg mb-4 w-3/4" />
                      <div className="h-4 bg-primary/10 rounded-lg mb-2 w-full" />
                      <div className="h-4 bg-primary/10 rounded-lg w-1/2" />
                    </div>
                  ))}
                </div>
              ) : filteredExams.length === 0 ? (
                <motion.div
                  className="text-center py-20"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.5 }}
                >
                  <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-primary/10 flex items-center justify-center">
                    <ClipboardList className="h-12 w-12 text-primary" />
                  </div>
                  <h3 className="text-2xl font-bold text-foreground mb-2">{t('exams.noExams')}</h3>
                  <p className="text-muted-foreground text-lg">{t('exams.noExamsYet')}</p>
                </motion.div>
              ) : (
                <motion.div
                  className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
                  variants={containerVariants}
                  initial="hidden"
                  animate="visible"
                >
                  {filteredExams.map((exam) => (
                    <motion.div key={exam.id} variants={cardVariants} whileHover={{ y: -8, transition: { duration: 0.3 } }} className="group">
                      <div className="relative bg-white/60 backdrop-blur-xl border border-primary/20 rounded-3xl overflow-hidden hover:shadow-2xl hover:shadow-primary/20 transition-all duration-500 p-6 space-y-4">
                        {/* Icon */}
                        <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center">
                          <ClipboardList className="h-7 w-7 text-primary" />
                        </div>

                        <h3 className="font-bold text-xl text-foreground group-hover:text-primary transition-colors">
                          {exam.title}
                        </h3>

                        <p className="text-muted-foreground line-clamp-2 leading-relaxed">
                          {exam.description || t('exams.defaultDescription')}
                        </p>

                        {/* Info badges */}
                        <div className="flex flex-wrap gap-2">
                          <Badge variant="secondary" className="gap-1">
                            <Clock className="h-3 w-3" />
                            {exam.duration_minutes} {t('exams.minutes')}
                          </Badge>
                          <Badge variant="secondary" className="gap-1">
                            <Target className="h-3 w-3" />
                            {t('exams.passingScore')}: {exam.passing_score}%
                          </Badge>
                        </div>

                        <Button
                          className="w-full bg-primary hover:bg-primary/90 text-primary-foreground rounded-xl h-12 font-bold text-base shadow-lg shadow-primary/25 hover:shadow-xl hover:shadow-primary/30 transition-all group/btn"
                          asChild
                        >
                          <Link to={`/exams/${exam.id}`}>
                            <Sparkles className="h-5 w-5 ml-2 group-hover/btn:rotate-12 transition-transform" />
                            {t('exams.startExam')}
                          </Link>
                        </Button>

                        <div className="absolute -bottom-10 -right-10 text-8xl text-primary/5 font-arabic">
                          ص
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </motion.div>
              )}
            </div>
          </section>
        </main>
        <Footer />
      </div>
    </PageTransition>
  );
};

export default Exams;
