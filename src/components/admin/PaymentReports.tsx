import { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { ar } from 'date-fns/locale';
import { 
  XCircle, CheckCircle, Clock, BarChart3, CalendarIcon,
  Filter, Download, TrendingUp, DollarSign, FileText
} from 'lucide-react';

interface PendingPayment {
  id: string;
  user_id: string;
  course_id: string;
  amount: number;
  receipt_url: string;
  status: 'pending' | 'approved' | 'rejected';
  admin_notes: string | null;
  created_at: string;
  course?: { title: string };
  profile?: { full_name: string | null } | null;
}

interface PaymentReportsProps {
  payments: PendingPayment[];
}

const PaymentReports = ({ payments }: PaymentReportsProps) => {
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [dateFrom, setDateFrom] = useState<Date | undefined>(undefined);
  const [dateTo, setDateTo] = useState<Date | undefined>(undefined);

  const filteredPayments = useMemo(() => {
    return payments.filter(payment => {
      // Status filter
      if (statusFilter !== 'all' && payment.status !== statusFilter) {
        return false;
      }

      // Date filter
      const paymentDate = new Date(payment.created_at);
      if (dateFrom && paymentDate < dateFrom) {
        return false;
      }
      if (dateTo) {
        const endOfDay = new Date(dateTo);
        endOfDay.setHours(23, 59, 59, 999);
        if (paymentDate > endOfDay) {
          return false;
        }
      }

      return true;
    });
  }, [payments, statusFilter, dateFrom, dateTo]);

  const stats = useMemo(() => {
    const approved = filteredPayments.filter(p => p.status === 'approved');
    const pending = filteredPayments.filter(p => p.status === 'pending');
    const rejected = filteredPayments.filter(p => p.status === 'rejected');
    
    return {
      total: filteredPayments.length,
      approved: approved.length,
      pending: pending.length,
      rejected: rejected.length,
      totalRevenue: approved.reduce((sum, p) => sum + p.amount, 0),
      pendingRevenue: pending.reduce((sum, p) => sum + p.amount, 0),
    };
  }, [filteredPayments]);

  const clearFilters = () => {
    setStatusFilter('all');
    setDateFrom(undefined);
    setDateTo(undefined);
  };

  const exportToCSV = () => {
    const headers = ['التاريخ', 'الكورس', 'الطالب', 'المبلغ', 'الحالة', 'الملاحظات'];
    const rows = filteredPayments.map(p => [
      format(new Date(p.created_at), 'yyyy-MM-dd'),
      p.course?.title || '',
      p.profile?.full_name || 'غير معروف',
      p.amount.toString(),
      p.status === 'approved' ? 'مقبول' : p.status === 'pending' ? 'قيد المراجعة' : 'مرفوض',
      p.admin_notes || '',
    ]);

    const csvContent = [headers, ...rows]
      .map(row => row.map(cell => `"${cell}"`).join(','))
      .join('\n');

    const blob = new Blob(['\ufeff' + csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `payment-report-${format(new Date(), 'yyyy-MM-dd')}.csv`;
    link.click();
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge className="bg-accent/20 text-accent border-accent/30"><Clock className="h-3 w-3 mr-1" />قيد المراجعة</Badge>;
      case 'approved':
        return <Badge className="bg-primary/20 text-primary border-primary/30"><CheckCircle className="h-3 w-3 mr-1" />مقبول</Badge>;
      case 'rejected':
        return <Badge className="bg-destructive/20 text-destructive border-destructive/30"><XCircle className="h-3 w-3 mr-1" />مرفوض</Badge>;
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-card/50 backdrop-blur border-border/50">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">إجمالي الطلبات</p>
                <p className="text-2xl font-bold">{stats.total}</p>
              </div>
              <FileText className="h-8 w-8 text-muted-foreground/50" />
            </div>
          </CardContent>
        </Card>
        <Card className="bg-card/50 backdrop-blur border-border/50">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">الإيرادات المحصلة</p>
                <p className="text-2xl font-bold text-primary">${stats.totalRevenue}</p>
              </div>
              <DollarSign className="h-8 w-8 text-primary/50" />
            </div>
          </CardContent>
        </Card>
        <Card className="bg-card/50 backdrop-blur border-border/50">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">قيد المراجعة</p>
                <p className="text-2xl font-bold text-accent">{stats.pending}</p>
                <p className="text-xs text-muted-foreground">${stats.pendingRevenue}</p>
              </div>
              <Clock className="h-8 w-8 text-accent/50" />
            </div>
          </CardContent>
        </Card>
        <Card className="bg-card/50 backdrop-blur border-border/50">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">نسبة القبول</p>
                <p className="text-2xl font-bold">
                  {stats.total > 0 ? Math.round((stats.approved / stats.total) * 100) : 0}%
                </p>
              </div>
              <TrendingUp className="h-8 w-8 text-muted-foreground/50" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card className="bg-card/50 backdrop-blur border-border/50">
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Filter className="h-5 w-5 text-accent" />
            فلاتر البحث
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-4 items-end">
            {/* Status Filter */}
            <div className="grid gap-2 min-w-[160px]">
              <Label className="text-sm">الحالة</Label>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="rounded-xl bg-background">
                  <SelectValue placeholder="اختر الحالة" />
                </SelectTrigger>
                <SelectContent className="bg-card border-border">
                  <SelectItem value="all">الكل</SelectItem>
                  <SelectItem value="pending">قيد المراجعة</SelectItem>
                  <SelectItem value="approved">مقبول</SelectItem>
                  <SelectItem value="rejected">مرفوض</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Date From */}
            <div className="grid gap-2">
              <Label className="text-sm">من تاريخ</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-[180px] justify-start text-left font-normal rounded-xl",
                      !dateFrom && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="ml-2 h-4 w-4" />
                    {dateFrom ? format(dateFrom, "PPP", { locale: ar }) : "اختر التاريخ"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0 bg-card border-border" align="start">
                  <Calendar
                    mode="single"
                    selected={dateFrom}
                    onSelect={setDateFrom}
                    initialFocus
                    className="pointer-events-auto"
                  />
                </PopoverContent>
              </Popover>
            </div>

            {/* Date To */}
            <div className="grid gap-2">
              <Label className="text-sm">إلى تاريخ</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-[180px] justify-start text-left font-normal rounded-xl",
                      !dateTo && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="ml-2 h-4 w-4" />
                    {dateTo ? format(dateTo, "PPP", { locale: ar }) : "اختر التاريخ"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0 bg-card border-border" align="start">
                  <Calendar
                    mode="single"
                    selected={dateTo}
                    onSelect={setDateTo}
                    initialFocus
                    className="pointer-events-auto"
                  />
                </PopoverContent>
              </Popover>
            </div>

            {/* Action Buttons */}
            <Button variant="outline" onClick={clearFilters} className="rounded-xl">
              مسح الفلاتر
            </Button>
            <Button variant="gold" onClick={exportToCSV} className="rounded-xl gap-2">
              <Download className="h-4 w-4" />
              تصدير CSV
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Data Table */}
      <Card className="bg-card/50 backdrop-blur border-border/50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5 text-accent" />
            تقرير المدفوعات
          </CardTitle>
          <CardDescription>
            {filteredPayments.length} نتيجة
          </CardDescription>
        </CardHeader>
        <CardContent>
          {filteredPayments.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>لا توجد نتائج تطابق الفلاتر المحددة</p>
            </div>
          ) : (
            <div className="rounded-xl border border-border/50 overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/30">
                    <TableHead className="text-right">التاريخ</TableHead>
                    <TableHead className="text-right">الكورس</TableHead>
                    <TableHead className="text-right">الطالب</TableHead>
                    <TableHead className="text-right">المبلغ</TableHead>
                    <TableHead className="text-right">الحالة</TableHead>
                    <TableHead className="text-right">الملاحظات</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredPayments.map((payment) => (
                    <TableRow key={payment.id} className="hover:bg-muted/20">
                      <TableCell className="text-sm">
                        {format(new Date(payment.created_at), "dd/MM/yyyy", { locale: ar })}
                      </TableCell>
                      <TableCell className="font-medium">{payment.course?.title}</TableCell>
                      <TableCell>{payment.profile?.full_name || 'غير معروف'}</TableCell>
                      <TableCell className="font-bold">${payment.amount}</TableCell>
                      <TableCell>{getStatusBadge(payment.status)}</TableCell>
                      <TableCell className="text-sm text-muted-foreground max-w-[200px] truncate">
                        {payment.admin_notes || '-'}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default PaymentReports;
