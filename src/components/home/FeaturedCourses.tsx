import { Link } from 'react-router-dom';
import { Clock, Users, Star, Play, ArrowLeft, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

const demoCourses = [
  {
    id: '1',
    title: 'أساسيات اللغة العربية للمبتدئين',
    description: 'تعلم أساسيات القراءة والكتابة العربية من الصفر مع منهج متكامل',
    thumbnail: 'https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?w=500&h=350&fit=crop',
    level: 'beginner',
    is_free: true,
    price: 0,
    duration: 20,
    students: 450,
    rating: 4.8,
  },
  {
    id: '2',
    title: 'قواعد النحو العربي المتقدمة',
    description: 'إتقان قواعد النحو والإعراب بطريقة مبسطة وعملية',
    thumbnail: 'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=500&h=350&fit=crop',
    level: 'intermediate',
    is_free: false,
    price: 99,
    duration: 35,
    students: 280,
    rating: 4.9,
  },
  {
    id: '3',
    title: 'البلاغة والأدب العربي',
    description: 'اكتشف جماليات الأدب العربي والبلاغة والفصاحة',
    thumbnail: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=500&h=350&fit=crop',
    level: 'advanced',
    is_free: false,
    price: 149,
    duration: 40,
    students: 150,
    rating: 4.7,
  },
];

const levelLabels = {
  beginner: { label: 'مبتدئ', color: 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20' },
  intermediate: { label: 'متوسط', color: 'bg-amber-500/10 text-amber-600 border-amber-500/20' },
  advanced: { label: 'متقدم', color: 'bg-rose-500/10 text-rose-600 border-rose-500/20' },
};

const FeaturedCourses = () => {
  return (
    <section className="py-24 bg-gradient-purple-soft relative overflow-hidden">
      {/* Background Decorations */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-gold/5 rounded-full blur-3xl" />

      <div className="container mx-auto px-4 relative z-10">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-5 py-2.5 rounded-full text-sm font-semibold mb-6 border border-primary/20">
            <Sparkles className="h-4 w-4" />
            كورسات مميزة
          </div>
          <h2 className="text-4xl md:text-5xl font-black mb-6">
            اكتشف <span className="text-gradient">كورساتنا المميزة</span>
          </h2>
          <p className="text-xl text-muted-foreground">
            مجموعة منتقاة من أفضل الكورسات لتعلم اللغة العربية بجميع مستوياتها
          </p>
        </div>

        {/* Courses Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {demoCourses.map((course, index) => (
            <Card 
              key={course.id} 
              className="group overflow-hidden border-0 bg-white shadow-lg hover-lift animate-fade-in"
              style={{ animationDelay: `${index * 0.15}s` }}
            >
              {/* Thumbnail */}
              <div className="relative overflow-hidden">
                <img
                  src={course.thumbnail}
                  alt={course.title}
                  className="w-full h-56 object-cover group-hover:scale-110 transition-transform duration-500"
                />
                {/* Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-purple-900/80 via-purple-900/20 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-300 flex items-center justify-center">
                  <Button size="lg" className="rounded-full bg-white text-primary hover:bg-white/90 shadow-xl">
                    <Play className="h-6 w-6 fill-current" />
                  </Button>
                </div>
                
                {/* Price Badge */}
                <div className="absolute top-4 left-4">
                  {course.is_free ? (
                    <Badge className="bg-gold text-purple-900 font-bold px-4 py-1.5 text-sm shadow-gold">
                      مجاني
                    </Badge>
                  ) : (
                    <Badge className="bg-white/95 text-primary font-bold px-4 py-1.5 text-sm shadow-lg">
                      {course.price} ر.س
                    </Badge>
                  )}
                </div>
                
                {/* Level Badge */}
                <div className="absolute top-4 right-4">
                  <Badge className={`${levelLabels[course.level as keyof typeof levelLabels].color} border font-medium`}>
                    {levelLabels[course.level as keyof typeof levelLabels].label}
                  </Badge>
                </div>
              </div>

              <CardHeader className="pb-3">
                <h3 className="font-bold text-xl line-clamp-2 group-hover:text-primary transition-colors">
                  {course.title}
                </h3>
              </CardHeader>

              <CardContent className="pb-4">
                <p className="text-muted-foreground line-clamp-2 mb-5">
                  {course.description}
                </p>
                
                {/* Meta Info */}
                <div className="flex items-center gap-5 text-sm text-muted-foreground">
                  <div className="flex items-center gap-1.5">
                    <Clock className="h-4 w-4 text-primary" />
                    <span>{course.duration} درس</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Users className="h-4 w-4 text-primary" />
                    <span>{course.students}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Star className="h-4 w-4 fill-gold text-gold" />
                    <span className="font-semibold text-foreground">{course.rating}</span>
                  </div>
                </div>
              </CardContent>

              <CardFooter className="pt-0">
                <Button className="w-full bg-gradient-primary hover:opacity-90 rounded-xl h-12 font-bold" asChild>
                  <Link to={`/courses/${course.id}`}>
                    عرض الكورس
                    <ArrowLeft className="mr-2 h-4 w-4" />
                  </Link>
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>

        {/* View All Button */}
        <div className="text-center mt-14">
          <Button 
            size="lg" 
            variant="outline" 
            className="rounded-xl px-10 py-6 text-lg border-2 border-primary text-primary hover:bg-primary hover:text-white transition-all"
            asChild
          >
            <Link to="/courses">
              عرض جميع الكورسات
              <ArrowLeft className="mr-2 h-5 w-5" />
            </Link>
          </Button>
        </div>
      </div>
    </section>
  );
};

export default FeaturedCourses;
