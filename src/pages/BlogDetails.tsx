import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight, Calendar, BookOpen } from 'lucide-react';
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
  content_ar: string;
  content_en: string | null;
  content_ms: string | null;
  content_ur: string | null;
  content_id: string | null;
  content_fr: string | null;
  image_url: string | null;
  created_at: string;
}

const BlogDetails = () => {
  const { postId } = useParams();
  const { t, language } = useLanguage();
  const [post, setPost] = useState<BlogPost | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (postId) {
      fetchPost();
    }
  }, [postId]);

  const fetchPost = async () => {
    setIsLoading(true);
    const { data, error } = await supabase
      .from('blog_posts')
      .select('*')
      .eq('id', postId)
      .eq('is_published', true)
      .single();

    if (!error && data) {
      setPost(data);
    }
    setIsLoading(false);
  };

  const getLocalizedField = (field: 'title' | 'description' | 'content') => {
    if (!post) return '';
    const langField = `${field}_${language}` as keyof BlogPost;
    const value = post[langField];
    if (value) return value as string;
    // Fallback to Arabic
    const arField = `${field}_ar` as keyof BlogPost;
    return (post[arField] as string) || '';
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString(language === 'ar' ? 'ar-SA' : 'en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-hero">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-accent border-t-transparent" />
      </div>
    );
  }

  if (!post) {
    return (
      <PageTransition>
        <div className="min-h-screen flex flex-col bg-gradient-hero">
          <Navbar />
          <main className="flex-1 flex items-center justify-center pt-28 pb-16">
            <div className="text-center glass-purple rounded-3xl p-12">
              <BookOpen className="h-16 w-16 text-white/30 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-white mb-4">{t('blog.postNotFound')}</h2>
              <Button asChild variant="gold" className="rounded-xl">
                <Link to="/blog">{t('blog.backToBlog')}</Link>
              </Button>
            </div>
          </main>
          <Footer />
        </div>
      </PageTransition>
    );
  }

  return (
    <PageTransition>
      <div className="min-h-screen flex flex-col bg-gradient-hero">
        <Navbar />
        <main className="flex-1 pt-28 pb-16">
          <div className="container mx-auto px-4 max-w-4xl">
            {/* Back Button */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3 }}
              className="mb-8"
            >
              <Button
                asChild
                variant="ghost"
                className="text-white/70 hover:text-white hover:bg-white/10 rounded-xl"
              >
                <Link to="/blog" className="flex items-center gap-2">
                  <ArrowRight className={`h-4 w-4 ${language !== 'ar' ? 'rotate-180' : ''}`} />
                  {t('blog.backToBlog')}
                </Link>
              </Button>
            </motion.div>

            {/* Hero Image */}
            {post.image_url && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="aspect-video rounded-3xl overflow-hidden mb-8 shadow-xl"
              >
                <img
                  src={post.image_url}
                  alt={getLocalizedField('title')}
                  className="w-full h-full object-cover"
                />
              </motion.div>
            )}

            {/* Post Header */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="bg-white rounded-3xl p-8 mb-8 shadow-lg"
            >
              <div className="flex items-center gap-2 text-muted-foreground text-sm mb-4">
                <Calendar className="h-4 w-4" />
                <span>{formatDate(post.created_at)}</span>
              </div>
              <h1 className="text-3xl md:text-4xl lg:text-5xl font-black text-foreground mb-4">
                {getLocalizedField('title')}
              </h1>
              {getLocalizedField('description') && (
                <p className="text-xl text-muted-foreground">
                  {getLocalizedField('description')}
                </p>
              )}
            </motion.div>

            {/* Post Content */}
            <motion.article
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="bg-white rounded-3xl p-8 md:p-12 shadow-lg"
            >
              <div 
                className="prose prose-lg max-w-none
                  prose-headings:text-foreground prose-headings:font-bold
                  prose-p:text-foreground/80 prose-p:leading-relaxed
                  prose-a:text-primary prose-a:no-underline hover:prose-a:underline
                  prose-strong:text-foreground
                  prose-ul:text-foreground/80 prose-ol:text-foreground/80
                  prose-li:marker:text-primary
                  prose-blockquote:border-primary prose-blockquote:text-foreground/70"
                style={{ whiteSpace: 'pre-wrap' }}
              >
                {getLocalizedField('content')}
              </div>
            </motion.article>

            {/* Navigation */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="mt-12 text-center"
            >
              <Button asChild variant="gold" size="lg" className="rounded-xl">
                <Link to="/blog">{t('blog.viewAllPosts')}</Link>
              </Button>
            </motion.div>
          </div>
        </main>
        <Footer />
      </div>
    </PageTransition>
  );
};

export default BlogDetails;
