import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Users, DollarSign, BookOpen, TrendingUp, Save, Mail, Loader2, Search } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from 'recharts';

interface UserInfo {
  id: string;
  email: string;
  full_name: string | null;
  created_at: string;
  enrolledCourses: number;
}

const COLORS = ['hsl(270,70%,50%)', 'hsl(42,95%,55%)', 'hsl(150,60%,45%)', 'hsl(0,70%,55%)'];

const AdminDashboard = () => {
  const { toast } = useToast();
  const [users, setUsers] = useState<UserInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const [platformEmail, setPlatformEmail] = useState('');
  const [savingEmail, setSavingEmail] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Stats
  const [totalRevenue, setTotalRevenue] = useState(0);
  const [totalEnrollments, setTotalEnrollments] = useState(0);
  const [totalCourses, setTotalCourses] = useState(0);
  const [monthlyData, setMonthlyData] = useState<any[]>([]);
  const [courseDistribution, setCourseDistribution] = useState<any[]>([]);

  useEffect(() => {
    fetchAll();
  }, []);

  const fetchAll = async () => {
    setLoading(true);
    await Promise.all([fetchUsers(), fetchStats(), fetchPlatformEmail()]);
    setLoading(false);
  };

  const fetchUsers = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      const { data, error } = await supabase.functions.invoke('get-users', {
        headers: { Authorization: `Bearer ${session.access_token}` },
      });
      
      // Fetch all enrollments to count per user
      const { data: enrollments } = await supabase.from('enrollments').select('user_id');
      const enrollmentMap: Record<string, number> = {};
      (enrollments || []).forEach(e => {
        enrollmentMap[e.user_id] = (enrollmentMap[e.user_id] || 0) + 1;
      });

      if (!error && data?.users) {
        setUsers(data.users.map((u: any) => ({
          ...u,
          enrolledCourses: enrollmentMap[u.id] || 0,
        })));
      }
    } catch (e) {
      console.error('Error fetching users:', e);
    }
  };

  const fetchStats = async () => {
    // Revenue
    const { data: purchases } = await supabase.from('purchases').select('amount, created_at').eq('status', 'completed');
    const rev = (purchases || []).reduce((s, p) => s + (p.amount || 0), 0);
    setTotalRevenue(rev);

    // Enrollments
    const { data: enrollments } = await supabase.from('enrollments').select('enrolled_at, course_id');
    setTotalEnrollments(enrollments?.length || 0);

    // Courses
    const { data: courses } = await supabase.from('courses').select('id, title, is_published');
    setTotalCourses(courses?.length || 0);

    // Monthly enrollments data (last 6 months)
    const months: any[] = [];
    for (let i = 5; i >= 0; i--) {
      const d = new Date();
      d.setMonth(d.getMonth() - i);
      const monthName = d.toLocaleDateString('ar-SA', { month: 'short' });
      const monthStart = new Date(d.getFullYear(), d.getMonth(), 1);
      const monthEnd = new Date(d.getFullYear(), d.getMonth() + 1, 0);
      const count = (enrollments || []).filter(e => {
        const ed = new Date(e.enrolled_at);
        return ed >= monthStart && ed <= monthEnd;
      }).length;
      const revenue = (purchases || []).filter(p => {
        const pd = new Date(p.created_at);
        return pd >= monthStart && pd <= monthEnd;
      }).reduce((s, p) => s + (p.amount || 0), 0);
      months.push({ name: monthName, enrollments: count, revenue });
    }
    setMonthlyData(months);

    // Course distribution
    if (courses && enrollments) {
      const dist = courses.slice(0, 5).map(c => ({
        name: c.title.substring(0, 15),
        value: enrollments.filter(e => e.course_id === c.id).length,
      })).filter(d => d.value > 0);
      setCourseDistribution(dist);
    }
  };

  const fetchPlatformEmail = async () => {
    const { data } = await supabase.from('site_settings').select('value').eq('key', 'platform_email').single();
    if (data?.value) setPlatformEmail(data.value);
  };

  const savePlatformEmail = async () => {
    setSavingEmail(true);
    const { data: existing } = await supabase.from('site_settings').select('id').eq('key', 'platform_email').single();
    if (existing) {
      await supabase.from('site_settings').update({ value: platformEmail }).eq('key', 'platform_email');
    } else {
      await supabase.from('site_settings').insert({ key: 'platform_email', value: platformEmail });
    }
    toast({ title: 'تم الحفظ', description: 'تم حفظ البريد الإلكتروني للمنصة' });
    setSavingEmail(false);
  };

  const filteredUsers = users.filter(u =>
    (u.email || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
    (u.full_name || '').toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'إجمالي المستخدمين', value: users.length, icon: Users, color: 'text-primary' },
          { label: 'إجمالي الإيرادات', value: `$${totalRevenue}`, icon: DollarSign, color: 'text-emerald-500' },
          { label: 'إجمالي التسجيلات', value: totalEnrollments, icon: TrendingUp, color: 'text-accent' },
          { label: 'إجمالي الكورسات', value: totalCourses, icon: BookOpen, color: 'text-blue-500' },
        ].map((stat, i) => (
          <Card key={i} className="bg-white border-primary/10">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">{stat.label}</p>
                  <p className="text-3xl font-black mt-1">{stat.value}</p>
                </div>
                <div className={`p-3 rounded-xl bg-primary/5`}>
                  <stat.icon className={`h-6 w-6 ${stat.color}`} />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Monthly Enrollments Chart */}
        <Card className="bg-white border-primary/10">
          <CardHeader>
            <CardTitle className="text-lg">التسجيلات الشهرية</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[250px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={monthlyData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="name" fontSize={12} />
                  <YAxis fontSize={12} />
                  <Tooltip />
                  <Bar dataKey="enrollments" fill="hsl(270,70%,50%)" radius={[6, 6, 0, 0]} name="التسجيلات" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Revenue Chart */}
        <Card className="bg-white border-primary/10">
          <CardHeader>
            <CardTitle className="text-lg">الإيرادات الشهرية</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[250px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={monthlyData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="name" fontSize={12} />
                  <YAxis fontSize={12} />
                  <Tooltip />
                  <Line type="monotone" dataKey="revenue" stroke="hsl(42,95%,55%)" strokeWidth={3} dot={{ fill: 'hsl(42,95%,55%)' }} name="الإيرادات ($)" />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Course Distribution */}
      {courseDistribution.length > 0 && (
        <Card className="bg-white border-primary/10">
          <CardHeader>
            <CardTitle className="text-lg">توزيع الطلاب على الكورسات</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[250px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={courseDistribution} cx="50%" cy="50%" outerRadius={80} dataKey="value" label={({ name, value }) => `${name} (${value})`}>
                    {courseDistribution.map((_, i) => (
                      <Cell key={i} fill={COLORS[i % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Platform Email Settings */}
      <Card className="bg-white border-primary/10">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Mail className="h-5 w-5 text-primary" />
            البريد الإلكتروني للمنصة
          </CardTitle>
          <CardDescription>هذا البريد سيظهر للطلاب في تذييل الصفحة وصفحة التواصل</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-3">
            <Input
              value={platformEmail}
              onChange={(e) => setPlatformEmail(e.target.value)}
              placeholder="info@example.com"
              className="h-12 rounded-xl flex-1"
              dir="ltr"
            />
            <Button onClick={savePlatformEmail} disabled={savingEmail} className="rounded-xl gap-2 h-12">
              {savingEmail ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
              حفظ
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Users Table */}
      <Card className="bg-white border-primary/10">
        <CardHeader>
          <div className="flex items-center justify-between flex-wrap gap-4">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Users className="h-5 w-5 text-primary" />
              المستخدمون المسجلون ({users.length})
            </CardTitle>
            <div className="relative w-64">
              <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="بحث بالاسم أو الإيميل..."
                className="pr-9 rounded-xl h-10"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="rounded-xl border overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/50">
                  <TableHead className="text-right font-bold">#</TableHead>
                  <TableHead className="text-right font-bold">الاسم</TableHead>
                  <TableHead className="text-right font-bold">البريد الإلكتروني</TableHead>
                  <TableHead className="text-right font-bold">الحالة</TableHead>
                  <TableHead className="text-right font-bold">تاريخ التسجيل</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredUsers.map((user, i) => (
                  <TableRow key={user.id} className="hover:bg-muted/30">
                    <TableCell className="font-mono text-muted-foreground">{i + 1}</TableCell>
                    <TableCell className="font-medium">{user.full_name || '—'}</TableCell>
                    <TableCell dir="ltr" className="text-left">{user.email}</TableCell>
                    <TableCell>
                      {user.enrolledCourses > 0 ? (
                        <Badge className="bg-primary/15 text-primary border-primary/30">مسجل ({user.enrolledCourses} كورس)</Badge>
                      ) : (
                        <Badge variant="secondary">غير مسجل</Badge>
                      )}
                    </TableCell>
                    <TableCell>{new Date(user.created_at).toLocaleDateString('ar-SA')}</TableCell>
                  </TableRow>
                ))}
                {filteredUsers.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center text-muted-foreground py-8">
                      لا توجد نتائج
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminDashboard;
