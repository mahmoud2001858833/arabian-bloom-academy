import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Search, Filter, Clock, Users, Star, Play } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import { supabase } from '@/integrations/supabase/client';

interface Course {
  id: string;
  title: string;
  description: string;
  thumbnail_url: string;
  level: string;
  is_free: boolean;
  price: number;
  is_published: boolean;
}

const levelLabels = {
  beginner: { label: 'مبتدئ', color: 'bg-green-500/10 text-green-600' },
  intermediate: { label: 'متوسط', color: 'bg-yellow-500/10 text-yellow-600' },
  advanced: { label: 'متقدم', color: 'bg-red-500/10 text-red-600' },
};

// Demo courses for initial display
const demoCourses: Course[] = [
  {
    id: '1',
    title: 'أساسيات اللغة العربية للمبتدئين',
    description: 'تعلم أساسيات القراءة والكتابة العربية من الصفر',
    thumbnail_url: 'https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?w=400&h=300&fit=crop',
    level: 'beginner',
    is_free: true,
    price: 0,
    is_published: true,
  },
  {
    id: '2',
    title: 'قواعد النحو العربي',
    description: 'إتقان قواعد النحو والإعراب بطريقة مبسطة',
    thumbnail_url: 'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=400&h=300&fit=crop',
    level: 'intermediate',
    is_free: false,
    price: 99,
    is_published: true,
  },
  {
    id: '3',
    title: 'البلاغة والأدب العربي',
    description: 'اكتشف جماليات الأدب العربي والبلاغة',
    thumbnail_url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=300&fit=crop',
    level: 'advanced',
    is_free: false,
    price: 149,
    is_published: true,
  },
  {
    id: '4',
    title: 'الإملاء والكتابة الصحيحة',
    description: 'تعلم قواعد الإملاء والكتابة بدون أخطاء',
    thumbnail_url: 'https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=400&h=300&fit=crop',
    level: 'beginner',
    is_free: true,
    price: 0,
    is_published: true,
  },
  {
    id: '5',
    title: 'فن الخطابة والتعبير',
    description: 'طور مهاراتك في التحدث والخطابة بالعربية',
    thumbnail_url: 'https://images.unsplash.com/photo-1524178232363-1fb2b075b655?w=400&h=300&fit=crop',
    level: 'intermediate',
    is_free: false,
    price: 79,
    is_published: true,
  },
  {
    id: '6',
    title: 'الأدب العربي القديم',
    description: 'رحلة في أعماق الشعر والنثر العربي',
    thumbnail_url: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=400&h=300&fit=crop',
    level: 'advanced',
    is_free: false,
    price: 199,
    is_published: true,
  },
];

const Courses = () => {
  const [courses, setCourses] = useState<Course[]>(demoCourses);
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
        // Keep demo courses if fetch fails
        return;
      }

      if (data && data.length > 0) {
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
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 pt-16">
        {/* Hero Section */}
        <section className="py-12 bg-gradient-to-br from-primary/5 via-background to-accent/5">
          <div className="container mx-auto px-4">
            <div className="max-w-2xl mx-auto text-center">
              <h1 className="text-3xl md:text-4xl font-bold mb-4">
                اكتشف <span className="text-gradient">كورساتنا</span>
              </h1>
              <p className="text-muted-foreground mb-8">
                مجموعة متنوعة من الكورسات لتعلم اللغة العربية بجميع مستوياتها
              </p>

              {/* Search & Filters */}
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="relative flex-1">
                  <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="ابحث عن كورس..."
                    className="pr-10"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
                <Select value={levelFilter} onValueChange={setLevelFilter}>
                  <SelectTrigger className="w-full sm:w-40">
                    <SelectValue placeholder="المستوى" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">جميع المستويات</SelectItem>
                    <SelectItem value="beginner">مبتدئ</SelectItem>
                    <SelectItem value="intermediate">متوسط</SelectItem>
                    <SelectItem value="advanced">متقدم</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={priceFilter} onValueChange={setPriceFilter}>
                  <SelectTrigger className="w-full sm:w-40">
                    <SelectValue placeholder="السعر" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">الكل</SelectItem>
                    <SelectItem value="free">مجاني</SelectItem>
                    <SelectItem value="paid">مدفوع</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        </section>

        {/* Courses Grid */}
        <section className="py-12">
          <div className="container mx-auto px-4">
            {filteredCourses.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-muted-foreground text-lg">لا توجد كورسات تطابق بحثك</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredCourses.map((course, index) => (
                  <Card 
                    key={course.id} 
                    className="group overflow-hidden border-border/50 hover:shadow-elegant transition-all duration-300 animate-fade-in"
                    style={{ animationDelay: `${index * 0.05}s` }}
                  >
                    {/* Thumbnail */}
                    <div className="relative overflow-hidden">
                      <img
                        src={course.thumbnail_url || 'https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?w=400&h=300&fit=crop'}
                        alt={course.title}
                        className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <Button size="icon" variant="secondary" className="rounded-full">
                          <Play className="h-5 w-5" />
                        </Button>
                      </div>
                      <div className="absolute top-3 left-3">
                        {course.is_free ? (
                          <Badge className="bg-accent text-accent-foreground">مجاني</Badge>
                        ) : (
                          <Badge variant="secondary">{course.price} ر.س</Badge>
                        )}
                      </div>
                      <div className="absolute top-3 right-3">
                        <Badge className={levelLabels[course.level as keyof typeof levelLabels]?.color || ''}>
                          {levelLabels[course.level as keyof typeof levelLabels]?.label || course.level}
                        </Badge>
                      </div>
                    </div>

                    <CardHeader className="pb-2">
                      <h3 className="font-bold text-lg line-clamp-2 group-hover:text-primary transition-colors">
                        {course.title}
                      </h3>
                    </CardHeader>

                    <CardContent className="pb-2">
                      <p className="text-muted-foreground text-sm line-clamp-2">
                        {course.description}
                      </p>
                    </CardContent>

                    <CardFooter>
                      <Button className="w-full bg-gradient-primary hover:opacity-90" asChild>
                        <Link to={`/courses/${course.id}`}>
                          عرض الكورس
                        </Link>
                      </Button>
                    </CardFooter>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default Courses;
