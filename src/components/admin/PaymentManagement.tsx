import { useState, useEffect, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { ar } from 'date-fns/locale';
import { 
  CreditCard, Settings, FileCheck, XCircle, CheckCircle, Clock, 
  Save, Eye, Loader2, RefreshCw, Image, BarChart3, CalendarIcon,
  Filter, Download, TrendingUp, DollarSign, FileText
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import PaymentReports from './PaymentReports';

interface PaymentSettings {
  id?: string;
  account_name: string;
  account_number: string;
  instructions: string;
  is_active: boolean;
}

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

const PaymentManagement = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('requests');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  
  // Payment settings state
  const [settings, setSettings] = useState<PaymentSettings>({
    account_name: '',
    account_number: '',
    instructions: '',
    is_active: true,
  });
  
  // Pending payments state
  const [pendingPayments, setPendingPayments] = useState<PendingPayment[]>([]);
  const [selectedPayment, setSelectedPayment] = useState<PendingPayment | null>(null);
  const [reviewNotes, setReviewNotes] = useState('');
  const [processing, setProcessing] = useState(false);
  const [showReceiptModal, setShowReceiptModal] = useState(false);
  const [receiptUrl, setReceiptUrl] = useState('');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    await Promise.all([fetchSettings(), fetchPendingPayments()]);
    setLoading(false);
  };

  const fetchSettings = async () => {
    try {
      const { data, error } = await supabase
        .from('payment_settings')
        .select('*')
        .single();

      if (data) {
        setSettings({
          id: data.id,
          account_name: data.account_name,
          account_number: data.account_number,
          instructions: data.instructions || '',
          is_active: data.is_active,
        });
      }
    } catch (error) {
      // No settings yet, that's ok
    }
  };

  const fetchPendingPayments = async () => {
    try {
      const { data, error } = await supabase
        .from('pending_payments')
        .select(`
          *,
          course:courses(title)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Fetch profiles separately
      const paymentsWithProfiles = await Promise.all(
        (data || []).map(async (payment) => {
          const { data: profile } = await supabase
            .from('profiles')
            .select('full_name')
            .eq('user_id', payment.user_id)
            .single();
          
          return {
            ...payment,
            profile,
          };
        })
      );

      setPendingPayments(paymentsWithProfiles as PendingPayment[]);
    } catch (error) {
      console.error('Error fetching pending payments:', error);
    }
  };

  const saveSettings = async () => {
    setSaving(true);
    try {
      if (settings.id) {
        const { error } = await supabase
          .from('payment_settings')
          .update({
            account_name: settings.account_name,
            account_number: settings.account_number,
            instructions: settings.instructions,
            is_active: settings.is_active,
          })
          .eq('id', settings.id);

        if (error) throw error;
      } else {
        const { data, error } = await supabase
          .from('payment_settings')
          .insert({
            account_name: settings.account_name,
            account_number: settings.account_number,
            instructions: settings.instructions,
            is_active: settings.is_active,
          })
          .select()
          .single();

        if (error) throw error;
        setSettings({ ...settings, id: data.id });
      }

      toast.success('تم حفظ إعدادات الدفع');
    } catch (error) {
      console.error('Error saving settings:', error);
      toast.error('حدث خطأ في حفظ الإعدادات');
    } finally {
      setSaving(false);
    }
  };

  const handleApprove = async (payment: PendingPayment) => {
    setProcessing(true);
    try {
      // Update payment status
      const { error: updateError } = await supabase
        .from('pending_payments')
        .update({
          status: 'approved',
          admin_notes: reviewNotes,
          reviewed_at: new Date().toISOString(),
          reviewed_by: user?.id,
        })
        .eq('id', payment.id);

      if (updateError) throw updateError;

      // Create enrollment
      const { error: enrollError } = await supabase
        .from('enrollments')
        .insert({
          user_id: payment.user_id,
          course_id: payment.course_id,
        });

      if (enrollError) throw enrollError;

      // Create purchase record
      const { error: purchaseError } = await supabase
        .from('purchases')
        .insert({
          user_id: payment.user_id,
          course_id: payment.course_id,
          amount: payment.amount,
          status: 'completed',
        });

      if (purchaseError) throw purchaseError;

      toast.success('تمت الموافقة على الدفع وتسجيل الطالب');
      setSelectedPayment(null);
      setReviewNotes('');
      fetchPendingPayments();
    } catch (error) {
      console.error('Error approving payment:', error);
      toast.error('حدث خطأ في الموافقة على الدفع');
    } finally {
      setProcessing(false);
    }
  };

  const handleReject = async (payment: PendingPayment) => {
    if (!reviewNotes.trim()) {
      toast.error('الرجاء كتابة سبب الرفض');
      return;
    }

    setProcessing(true);
    try {
      const { error } = await supabase
        .from('pending_payments')
        .update({
          status: 'rejected',
          admin_notes: reviewNotes,
          reviewed_at: new Date().toISOString(),
          reviewed_by: user?.id,
        })
        .eq('id', payment.id);

      if (error) throw error;

      toast.success('تم رفض طلب الدفع');
      setSelectedPayment(null);
      setReviewNotes('');
      fetchPendingPayments();
    } catch (error) {
      console.error('Error rejecting payment:', error);
      toast.error('حدث خطأ في رفض الطلب');
    } finally {
      setProcessing(false);
    }
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

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-accent" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3 bg-white/10">
          <TabsTrigger value="requests" className="gap-2">
            <FileCheck className="h-4 w-4" />
            طلبات الدفع
          </TabsTrigger>
          <TabsTrigger value="reports" className="gap-2">
            <BarChart3 className="h-4 w-4" />
            التقارير
          </TabsTrigger>
          <TabsTrigger value="settings" className="gap-2">
            <Settings className="h-4 w-4" />
            إعدادات الكلك
          </TabsTrigger>
        </TabsList>

        {/* Payment Requests Tab */}
        <TabsContent value="requests" className="mt-6">
          <Card className="bg-card/50 backdrop-blur border-border/50">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <FileCheck className="h-5 w-5 text-accent" />
                    طلبات الدفع المعلقة
                  </CardTitle>
                  <CardDescription>
                    {pendingPayments.filter(p => p.status === 'pending').length} طلب قيد المراجعة
                  </CardDescription>
                </div>
                <Button variant="outline" size="sm" onClick={fetchPendingPayments} className="gap-2">
                  <RefreshCw className="h-4 w-4" />
                  تحديث
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {pendingPayments.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                  <FileCheck className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>لا توجد طلبات دفع</p>
                </div>
              ) : (
                <div className="space-y-4">
                  <AnimatePresence>
                    {pendingPayments.map((payment) => (
                      <motion.div
                        key={payment.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="p-4 rounded-xl bg-muted/50 border border-border/50"
                      >
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              {getStatusBadge(payment.status)}
                              <span className="text-xs text-muted-foreground">
                                {new Date(payment.created_at).toLocaleDateString('ar-SA')}
                              </span>
                            </div>
                            <h4 className="font-bold">{payment.course?.title}</h4>
                            <p className="text-sm text-muted-foreground">
                              الطالب: {payment.profile?.full_name || 'غير معروف'}
                            </p>
                            <p className="text-lg font-bold text-accent mt-1">
                              ${payment.amount}
                            </p>
                          </div>
                          <div className="flex items-center gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                setReceiptUrl(payment.receipt_url);
                                setShowReceiptModal(true);
                              }}
                              className="gap-1"
                            >
                              <Eye className="h-4 w-4" />
                              الوصل
                            </Button>
                            {payment.status === 'pending' && (
                              <Button
                                size="sm"
                                onClick={() => setSelectedPayment(payment)}
                                className="gap-1"
                                variant="gold"
                              >
                                مراجعة
                              </Button>
                            )}
                          </div>
                        </div>
                        {payment.admin_notes && (
                          <p className="mt-2 text-sm text-muted-foreground border-t border-border/50 pt-2">
                            ملاحظات: {payment.admin_notes}
                          </p>
                        )}
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Reports Tab */}
        <TabsContent value="reports" className="mt-6">
          <PaymentReports payments={pendingPayments} />
        </TabsContent>

        {/* Settings Tab */}
        <TabsContent value="settings" className="mt-6">
          <Card className="bg-card/50 backdrop-blur border-border/50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CreditCard className="h-5 w-5 text-accent" />
                إعدادات حساب الكلك
              </CardTitle>
              <CardDescription>
                هذه المعلومات ستظهر للعملاء عند الدفع
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid gap-4">
                <div className="grid gap-2">
                  <Label className="font-bold">اسم صاحب الحساب *</Label>
                  <Input
                    value={settings.account_name}
                    onChange={(e) => setSettings({ ...settings, account_name: e.target.value })}
                    placeholder="مثال: محمد أحمد"
                    className="h-12 rounded-xl"
                  />
                </div>

                <div className="grid gap-2">
                  <Label className="font-bold">رقم الحساب *</Label>
                  <Input
                    value={settings.account_number}
                    onChange={(e) => setSettings({ ...settings, account_number: e.target.value })}
                    placeholder="أدخل رقم حساب الكلك"
                    className="h-12 rounded-xl font-mono"
                    dir="ltr"
                  />
                </div>

                <div className="grid gap-2">
                  <Label className="font-bold">تعليمات إضافية</Label>
                  <Textarea
                    value={settings.instructions}
                    onChange={(e) => setSettings({ ...settings, instructions: e.target.value })}
                    placeholder="مثال: يرجى كتابة اسم الكورس في الملاحظات عند التحويل"
                    rows={3}
                    className="rounded-xl"
                  />
                </div>
              </div>

              <Button
                onClick={saveSettings}
                disabled={!settings.account_name || !settings.account_number || saving}
                className="w-full gap-2"
                variant="gold"
              >
                {saving ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    جاري الحفظ...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4" />
                    حفظ الإعدادات
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Review Payment Dialog */}
      <Dialog open={!!selectedPayment} onOpenChange={() => setSelectedPayment(null)}>
        <DialogContent className="max-w-md bg-card border-border">
          <DialogHeader>
            <DialogTitle>مراجعة طلب الدفع</DialogTitle>
          </DialogHeader>
          {selectedPayment && (
            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-muted/50 space-y-2">
                <p><strong>الكورس:</strong> {selectedPayment.course?.title}</p>
                <p><strong>الطالب:</strong> {selectedPayment.profile?.full_name || 'غير معروف'}</p>
                <p><strong>المبلغ:</strong> ${selectedPayment.amount}</p>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setReceiptUrl(selectedPayment.receipt_url);
                    setShowReceiptModal(true);
                  }}
                  className="w-full gap-2 mt-2"
                >
                  <Image className="h-4 w-4" />
                  عرض صورة الوصل
                </Button>
              </div>

              <div className="grid gap-2">
                <Label>ملاحظات (اختياري للموافقة، إجباري للرفض)</Label>
                <Textarea
                  value={reviewNotes}
                  onChange={(e) => setReviewNotes(e.target.value)}
                  placeholder="أدخل ملاحظاتك هنا..."
                  rows={3}
                  className="rounded-xl"
                />
              </div>

              <DialogFooter className="gap-2">
                <Button
                  variant="destructive"
                  onClick={() => handleReject(selectedPayment)}
                  disabled={processing}
                  className="flex-1"
                >
                  <XCircle className="h-4 w-4 mr-2" />
                  رفض
                </Button>
                <Button
                  variant="gold"
                  onClick={() => handleApprove(selectedPayment)}
                  disabled={processing}
                  className="flex-1"
                >
                  <CheckCircle className="h-4 w-4 mr-2" />
                  موافقة
                </Button>
              </DialogFooter>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Receipt Image Modal */}
      <Dialog open={showReceiptModal} onOpenChange={setShowReceiptModal}>
        <DialogContent className="max-w-2xl bg-card border-border">
          <DialogHeader>
            <DialogTitle>صورة الوصل</DialogTitle>
          </DialogHeader>
          <div className="flex items-center justify-center">
            <img
              src={receiptUrl}
              alt="Receipt"
              className="max-w-full max-h-[70vh] object-contain rounded-lg"
            />
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default PaymentManagement;
