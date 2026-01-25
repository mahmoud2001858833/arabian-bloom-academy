import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Users, BookOpen, DollarSign, TrendingUp, Plus, Video, FileText } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAuth } from '@/contexts/AuthContext';
import Navbar from '@/components/layout/Navbar';

const Admin = () => {
  const { user, loading, isAdmin } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && !user) {
      navigate('/auth');
    }
    if (!loading && user && !isAdmin) {
      navigate('/dashboard');
    }
  }, [user, loading, isAdmin, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  const stats = [
    { icon: Users, label: 'إجمالي الطلاب', value: '1,234', change: '+12%', color: 'text-primary' },
    { icon: BookOpen, label: 'الكورسات', value: '45', change: '+3', color: 'text-accent' },
    { icon: DollarSign, label: 'الإيرادات', value: '12,450 ر.س', change: '+8%', color: 'text-green-500' },
    { icon: TrendingUp, label: 'التسجيلات الجديدة', value: '89', change: '+15%', color: 'text-primary' },
  ];

  return (
    <div className="min-h-screen bg-secondary/30">
      <Navbar />
      <main className="pt-20 pb-12">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold">لوحة تحكم <span className="text-gradient">المسؤول</span></h1>
              <p className="text-muted-foreground">إدارة المنصة والكورسات والمستخدمين</p>
            </div>
            <Button className="bg-gradient-primary">
              <Plus className="ml-2 h-4 w-4" />
              كورس جديد
            </Button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            {stats.map((stat, i) => (
              <Card key={i} className="border-border/50">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">{stat.label}</p>
                      <p className="text-2xl font-bold">{stat.value}</p>
                      <p className="text-xs text-green-500">{stat.change}</p>
                    </div>
                    <div className={`p-3 rounded-xl bg-primary/10 ${stat.color}`}>
                      <stat.icon className="h-6 w-6" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Management Tabs */}
          <Tabs defaultValue="courses" className="space-y-6">
            <TabsList className="grid w-full grid-cols-4 lg:w-auto lg:inline-grid">
              <TabsTrigger value="courses">الكورسات</TabsTrigger>
              <TabsTrigger value="lessons">الدروس</TabsTrigger>
              <TabsTrigger value="users">المستخدمين</TabsTrigger>
              <TabsTrigger value="quizzes">الاختبارات</TabsTrigger>
            </TabsList>

            <TabsContent value="courses">
              <Card>
                <CardHeader>
                  <CardTitle>إدارة الكورسات</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground text-center py-8">
                    قم بإضافة كورسات جديدة وإدارة الكورسات الحالية من هنا
                  </p>
                  <Button className="w-full bg-gradient-primary">
                    <Plus className="ml-2 h-4 w-4" />
                    إضافة كورس جديد
                  </Button>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="lessons">
              <Card>
                <CardHeader><CardTitle>إدارة الدروس</CardTitle></CardHeader>
                <CardContent className="text-center py-8 text-muted-foreground">
                  قم برفع الفيديوهات وإدارة الدروس
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="users">
              <Card>
                <CardHeader><CardTitle>إدارة المستخدمين</CardTitle></CardHeader>
                <CardContent className="text-center py-8 text-muted-foreground">
                  عرض وإدارة جميع المستخدمين المسجلين
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="quizzes">
              <Card>
                <CardHeader><CardTitle>إدارة الاختبارات</CardTitle></CardHeader>
                <CardContent className="text-center py-8 text-muted-foreground">
                  إنشاء وإدارة الاختبارات
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </main>
    </div>
  );
};

export default Admin;
