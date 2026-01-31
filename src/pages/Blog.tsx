import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Search, Calendar, ArrowLeft, BookOpen } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/i18n/LanguageContext';
import { supabase } from '@/integrations/supabase/client';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import PageTransition from '@/components/layout/PageTransition';

interface BlogPost {
  id: string;
  title_ar: string;
  title_en: string | null;
  title_ms: string | null;
  title_ur: string | null;
  title_id: string | null;
  title_fr: string | null;
  description_ar: string | null;
  description_en: string | null;
  description_ms: string | null;
  description_ur: string | null;
  description_id: string | null;
  description_fr: string | null;
  image_url: string | null;
  created_at: string;
}

const Blog = () => {
  const { t, language } = useLanguage();
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchPosts();
  }, []);

  const fetchPosts = async () => {
    setIsLoading(true);
    const { data, error } = await supabase
      .from('blog_posts')
      .select('id, title_ar, title_en, title_ms, title_ur, title_id, title_fr, description_ar, description_en, description_ms, description_ur, description_id, description_fr, image_url, created_at')
      .eq('is_published', true)
      .order('created_at', { ascending: false });

    if (!error && data) {
      setPosts(data);
    }
    setIsLoading(false);
  };

  const getLocalizedField = (post: BlogPost, field: 'title' | 'description') => {
    const langField = `${field}_${language}` as keyof BlogPost;
    const value = post[langField];
    if (value) return value as string;
    // Fallback to Arabic
    const arField = `${field}_ar` as keyof BlogPost;
    return (post[arField] as string) || '';
  };

  const filteredPosts = posts.filter(post => {
    const title = getLocalizedField(post, 'title').toLowerCase();
    const description = getLocalizedField(post, 'description').toLowerCase();
    const query = searchQuery.toLowerCase();
    return title.includes(query) || description.includes(query);
  });

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString(language === 'ar' ? 'ar-SA' : 'en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <PageTransition>
      <div className="min-h-screen flex flex-col bg-gradient-hero">
        <Navbar />
        <main className="flex-1 pt-28 pb-16">
          <div className="container mx-auto px-4">
            {/* Header */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="text-center mb-12"
            >
              <Badge className="bg-accent/20 text-accent border-accent/30 backdrop-blur-sm mb-4">
                <BookOpen className="w-4 h-4 ml-2" />
                {t('blog.badge')}
              </Badge>
              <h1 className="text-4xl md:text-5xl font-black text-white mb-4">
                {t('blog.discover')}{' '}
                <span className="text-accent" style={{ textShadow: '0 0 30px hsl(var(--accent) / 0.5)' }}>
                  {t('blog.ourBlog')}
                </span>
              </h1>
              <p className="text-white/70 text-lg max-w-2xl mx-auto">
                {t('blog.description')}
              </p>
            </motion.div>

            {/* Search */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="max-w-md mx-auto mb-12"
            >
              <div className="relative">
                <Search className="absolute right-4 top-1/2 transform -translate-y-1/2 text-white/50 h-5 w-5" />
                <Input
                  type="text"
                  placeholder={t('blog.searchPlaceholder')}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pr-12 bg-white/10 border-white/20 text-white placeholder:text-white/50 rounded-xl h-12"
                />
              </div>
            </motion.div>

            {/* Posts Grid */}
            {isLoading ? (
              <div className="flex justify-center items-center py-20">
                <div className="animate-spin rounded-full h-12 w-12 border-4 border-accent border-t-transparent" />
              </div>
            ) : filteredPosts.length === 0 ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-center py-20 glass-purple rounded-3xl"
              >
                <BookOpen className="h-16 w-16 text-white/30 mx-auto mb-4" />
                <h3 className="text-xl font-bold text-white mb-2">{t('blog.noPosts')}</h3>
                <p className="text-white/60">{t('blog.noPostsYet')}</p>
              </motion.div>
            ) : (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
              >
                {filteredPosts.map((post, index) => (
                  <motion.div
                    key={post.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.1 * index }}
                    className="group"
                  >
                    <Link to={`/blog/${post.id}`}>
                      <div className="glass-purple rounded-2xl overflow-hidden hover:shadow-gold transition-all duration-300 hover:-translate-y-1">
                        {/* Image */}
                        <div className="aspect-video overflow-hidden bg-white/5">
                          {post.image_url ? (
                            <img
                              src={post.image_url}
                              alt={getLocalizedField(post, 'title')}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <BookOpen className="h-12 w-12 text-white/20" />
                            </div>
                          )}
                        </div>

                        {/* Content */}
                        <div className="p-6">
                          <div className="flex items-center gap-2 text-white/50 text-sm mb-3">
                            <Calendar className="h-4 w-4" />
                            <span>{formatDate(post.created_at)}</span>
                          </div>
                          <h3 className="text-xl font-bold text-white mb-2 line-clamp-2 group-hover:text-accent transition-colors">
                            {getLocalizedField(post, 'title')}
                          </h3>
                          <p className="text-white/60 line-clamp-3 mb-4">
                            {getLocalizedField(post, 'description')}
                          </p>
                          <div className="flex items-center gap-2 text-accent font-semibold">
                            <span>{t('blog.readMore')}</span>
                            <ArrowLeft className={`h-4 w-4 group-hover:-translate-x-1 transition-transform ${language !== 'ar' ? 'rotate-180' : ''}`} />
                          </div>
                        </div>
                      </div>
                    </Link>
                  </motion.div>
                ))}
              </motion.div>
            )}
          </div>
        </main>
        <Footer />
      </div>
    </PageTransition>
  );
};

export default Blog;
