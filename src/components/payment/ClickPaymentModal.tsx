import { useState, useEffect, useRef } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/i18n/LanguageContext';
import { toast } from 'sonner';
import { Upload, Copy, CheckCircle, CreditCard, Loader2, Image } from 'lucide-react';

interface PaymentSettings {
  id: string;
  account_name: string;
  account_number: string;
  instructions: string | null;
}

interface ClickPaymentModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  courseId: string;
  courseTitle: string;
  coursePrice: number;
  onSuccess: () => void;
}

const ClickPaymentModal = ({
  open,
  onOpenChange,
  courseId,
  courseTitle,
  coursePrice,
  onSuccess,
}: ClickPaymentModalProps) => {
  const { user } = useAuth();
  const { t } = useLanguage();
  const [paymentSettings, setPaymentSettings] = useState<PaymentSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [receiptFile, setReceiptFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [copied, setCopied] = useState(false);
  const [pendingPayment, setPendingPayment] = useState<{status: string} | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (open) {
      fetchPaymentSettings();
      checkPendingPayment();
    }
  }, [open, courseId]);

  const fetchPaymentSettings = async () => {
    try {
      const { data, error } = await supabase
        .from('payment_settings')
        .select('*')
        .eq('is_active', true)
        .single();

      if (error) throw error;
      setPaymentSettings(data);
    } catch (error) {
      console.error('Error fetching payment settings:', error);
      toast.error(t('payment.paymentNotSetup'));
    } finally {
      setLoading(false);
    }
  };

  const checkPendingPayment = async () => {
    if (!user) return;
    
    try {
      const { data } = await supabase
        .from('pending_payments')
        .select('status')
        .eq('user_id', user.id)
        .eq('course_id', courseId)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      setPendingPayment(data);
    } catch (error) {
      console.error('Error checking pending payment:', error);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        toast.error(t('payment.selectImageOnly'));
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        toast.error(t('payment.imageTooLarge'));
        return;
      }
      setReceiptFile(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const copyToClipboard = async (text: string) => {
    await navigator.clipboard.writeText(text);
    setCopied(true);
    toast.success(t('payment.copied'));
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSubmit = async () => {
    if (!user || !receiptFile) return;

    setSubmitting(true);
    try {
      // Upload receipt
      const fileExt = receiptFile.name.split('.').pop();
      const fileName = `${user.id}/${Date.now()}.${fileExt}`;
      
      const { error: uploadError } = await supabase.storage
        .from('receipts')
        .upload(fileName, receiptFile);

      if (uploadError) throw uploadError;

      // Get public URL
      const { data: urlData } = supabase.storage
        .from('receipts')
        .getPublicUrl(fileName);

      // Create pending payment
      const { error: paymentError } = await supabase
        .from('pending_payments')
        .insert({
          user_id: user.id,
          course_id: courseId,
          amount: coursePrice,
          receipt_url: urlData.publicUrl,
          status: 'pending',
        });

      if (paymentError) throw paymentError;

      toast.success(t('payment.paymentSuccess'));
      onOpenChange(false);
      onSuccess();
    } catch (error) {
      console.error('Error submitting payment:', error);
      toast.error(t('payment.paymentError'));
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-md bg-card border-border">
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-accent" />
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  if (pendingPayment?.status === 'pending') {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-md bg-card border-border">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold text-center">{t('payment.paymentPending')}</DialogTitle>
          </DialogHeader>
          <div className="py-8 text-center">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-accent/20 flex items-center justify-center">
              <Loader2 className="h-8 w-8 text-accent animate-spin" />
            </div>
            <p className="text-muted-foreground">
              {t('payment.pendingNote')}
            </p>
          </div>
          <Button onClick={() => onOpenChange(false)} className="w-full">
            {t('payment.okay')}
          </Button>
        </DialogContent>
      </Dialog>
    );
  }

  if (!paymentSettings) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-md bg-card border-border">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold text-center text-destructive">
              {t('payment.paymentUnavailable')}
            </DialogTitle>
          </DialogHeader>
          <div className="py-8 text-center">
            <p className="text-muted-foreground">
              {t('payment.paymentNotSetup')}
            </p>
          </div>
          <Button onClick={() => onOpenChange(false)} className="w-full">
            {t('payment.close')}
          </Button>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg bg-card border-border max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold flex items-center gap-2">
            <CreditCard className="h-5 w-5 text-accent" />
            {t('payment.clickPayment')}
          </DialogTitle>
          <DialogDescription>
            {t('payment.completePayment')} {courseTitle}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* معلومات الكورس والسعر */}
          <Card className="bg-accent/10 border-accent/30">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <span className="font-medium">{t('payment.requiredAmount')}</span>
                <span className="text-2xl font-black text-accent">{coursePrice} {t('payment.sar')}</span>
              </div>
            </CardContent>
          </Card>

          {/* معلومات حساب الكلك */}
          <div className="space-y-4">
            <h3 className="font-bold text-lg">{t('payment.accountInfo')}</h3>
            <Card className="bg-muted/50">
              <CardContent className="p-4 space-y-3">
                <div>
                  <Label className="text-xs text-muted-foreground">{t('payment.accountName')}</Label>
                  <p className="font-bold text-lg">{paymentSettings.account_name}</p>
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground">{t('payment.accountNumber')}</Label>
                  <div className="flex items-center gap-2">
                    <p className="font-bold text-lg flex-1 font-mono">{paymentSettings.account_number}</p>
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => copyToClipboard(paymentSettings.account_number)}
                      className="h-8 w-8"
                    >
                      {copied ? <CheckCircle className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}
                    </Button>
                  </div>
                </div>
                {paymentSettings.instructions && (
                  <div>
                    <Label className="text-xs text-muted-foreground">{t('payment.additionalInstructions')}</Label>
                    <p className="text-sm text-muted-foreground">{paymentSettings.instructions}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* رفع الوصل */}
          <div className="space-y-4">
            <h3 className="font-bold text-lg">{t('payment.uploadReceipt')}</h3>
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileSelect}
              accept="image/*"
              className="hidden"
            />
            
            {previewUrl ? (
              <div className="relative">
                <img
                  src={previewUrl}
                  alt="Receipt preview"
                  className="w-full h-48 object-cover rounded-lg border border-border"
                />
                <Button
                  variant="destructive"
                  size="sm"
                  className="absolute top-2 right-2"
                  onClick={() => {
                    setReceiptFile(null);
                    setPreviewUrl(null);
                  }}
                >
                  {t('payment.delete')}
                </Button>
              </div>
            ) : (
              <button
                onClick={() => fileInputRef.current?.click()}
                className="w-full h-32 border-2 border-dashed border-border rounded-lg flex flex-col items-center justify-center gap-2 hover:border-accent hover:bg-accent/5 transition-colors"
              >
                <Upload className="h-8 w-8 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">{t('payment.clickToUpload')}</span>
              </button>
            )}
          </div>

          {/* زر الإرسال */}
          <Button
            onClick={handleSubmit}
            disabled={!receiptFile || submitting}
            className="w-full gap-2"
            variant="gold"
          >
            {submitting ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                {t('payment.submitting')}
              </>
            ) : (
              <>
                <CheckCircle className="h-4 w-4" />
                {t('payment.submitPayment')}
              </>
            )}
          </Button>

          <p className="text-xs text-center text-muted-foreground">
            {t('payment.reviewNote')}
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ClickPaymentModal;
