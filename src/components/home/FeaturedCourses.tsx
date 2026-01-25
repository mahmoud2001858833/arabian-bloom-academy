import { Link } from 'react-router-dom';
import { Clock, Users, Star, Play } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

// Demo courses for display
const demoCourses = [
  {
    id: '1',
    title: 'أساسيات اللغة العربية للمبتدئين',
    description: 'تعلم أساسيات القراءة والكتابة العربية من الصفر',
    thumbnail: 'https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?w=400&h=300&fit=crop',
    level: 'beginner',
    is_free: true,
    price: 0,
    duration: 20,
    students: 450,
    rating: 4.8,
  },
  {
    id: '2',
    title: 'قواعد النحو العربي',
    description: 'إتقان قواعد النحو والإعراب بطريقة مبسطة',
    thumbnail: 'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=400&h=300&fit=crop',
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
    description: 'اكتشف جماليات الأدب العربي والبلاغة',
    thumbnail: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=300&fit=crop',
    level: 'advanced',
    is_free: false,
    price: 149,
    duration: 40,
    students: 150,
    rating: 4.7,
  },
];

const levelLabels = {
  beginner: { label: 'مبتدئ', color: 'bg-green-500/10 text-green-600' },
  intermediate: { label: 'متوسط', color: 'bg-yellow-500/10 text-yellow-600' },
  advanced: { label: 'متقدم', color: 'bg-red-500/10 text-red-600' },
};

const FeaturedCourses = () => {
  return (
    <section className="py-20 bg-secondary/30">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-12">
          <Badge variant="outline" className="mb-4 text-primary border-primary">
            كورسات مميزة
          </Badge>
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            اكتشف <span className="text-gradient">كورساتنا المميزة</span>
          </h2>
          <p className="text-muted-foreground">
            مجموعة منتقاة من أفضل الكورسات لتعلم اللغة العربية بجميع مستوياتها
          </p>
        </div>

        {/* Courses Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {demoCourses.map((course, index) => (
            <Card 
              key={course.id} 
              className="group overflow-hidden border-border/50 hover:shadow-elegant transition-all duration-300 animate-fade-in"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              {/* Thumbnail */}
              <div className="relative overflow-hidden">
                <img
                  src={course.thumbnail}
                  alt={course.title}
                  className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                />
                {/* Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <Button size="icon" variant="secondary" className="rounded-full">
                    <Play className="h-5 w-5" />
                  </Button>
                </div>
                {/* Price Badge */}
                <div className="absolute top-3 left-3">
                  {course.is_free ? (
                    <Badge className="bg-accent text-accent-foreground">مجاني</Badge>
                  ) : (
                    <Badge variant="secondary">{course.price} ر.س</Badge>
                  )}
                </div>
                {/* Level Badge */}
                <div className="absolute top-3 right-3">
                  <Badge className={levelLabels[course.level as keyof typeof levelLabels].color}>
                    {levelLabels[course.level as keyof typeof levelLabels].label}
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
                
                {/* Meta Info */}
                <div className="flex items-center gap-4 mt-4 text-sm text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <Clock className="h-4 w-4" />
                    <span>{course.duration} درس</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Users className="h-4 w-4" />
                    <span>{course.students}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Star className="h-4 w-4 fill-accent text-accent" />
                    <span>{course.rating}</span>
                  </div>
                </div>
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

        {/* View All Button */}
        <div className="text-center mt-12">
          <Button size="lg" variant="outline" asChild>
            <Link to="/courses">عرض جميع الكورسات</Link>
          </Button>
        </div>
      </div>
    </section>
  );
};

export default FeaturedCourses;
