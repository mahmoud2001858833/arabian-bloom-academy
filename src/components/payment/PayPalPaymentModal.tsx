import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/i18n/LanguageContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Globe, Loader2, CheckCircle, AlertCircle } from 'lucide-react';

interface PayPalPaymentModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  courseId: string;
  courseTitle: string;
  coursePrice: number;
  onSuccess: () => void;
}

const PayPalPaymentModal = ({
  open,
  onOpenChange,
  courseId,
  courseTitle,
  coursePrice,
  onSuccess,
}: PayPalPaymentModalProps) => {
  const { t } = useLanguage();
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<'idle' | 'created' | 'success' | 'error'>('idle');

  const handlePayPalPayment = async () => {
    setLoading(true);
    setStatus('idle');

    try {
      // Step 1: Create PayPal order
      const { data: createData, error: createError } = await supabase.functions.invoke('paypal-payment', {
        body: {
          action: 'create',
          courseId,
          amount: coursePrice,
          courseTitle,
        },
      });

      if (createError) throw new Error(createError.message);
      if (!createData?.orderID) throw new Error('Failed to create order');

      const orderID = createData.orderID;
      setStatus('created');

      // Step 2: Open PayPal approval URL
      const approvalUrl = `https://www.paypal.com/checkoutnow?token=${orderID}`;
      const paypalWindow = window.open(approvalUrl, '_blank', 'width=500,height=700');

      // Step 3: Poll for completion or wait for user to close window
      toast.info(t('payment.paypalWindowOpened'));

      // Wait for user to complete payment in PayPal window
      const checkInterval = setInterval(async () => {
        if (paypalWindow?.closed) {
          clearInterval(checkInterval);
          
          // Try to capture the order
          try {
            const { data: captureData, error: captureError } = await supabase.functions.invoke('paypal-payment', {
              body: {
                action: 'capture',
                orderID,
                courseId,
              },
            });

            if (captureError) throw new Error(captureError.message);

            if (captureData?.success) {
              setStatus('success');
              toast.success(t('payment.paypalSuccess'));
              setTimeout(() => {
                onOpenChange(false);
                onSuccess();
              }, 1500);
            } else {
              setStatus('error');
              toast.error(t('payment.paypalCancelled'));
            }
          } catch (error) {
            console.error('Capture error:', error);
            setStatus('error');
            toast.error(t('payment.paypalError'));
          }
          
          setLoading(false);
        }
      }, 1000);

    } catch (error) {
      console.error('PayPal error:', error);
      setStatus('error');
      toast.error(t('payment.paypalError'));
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(v) => { if (!loading) onOpenChange(v); }}>
      <DialogContent className="max-w-md bg-card border-border">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold flex items-center gap-2">
            <Globe className="h-5 w-5 text-accent" />
            {t('payment.paypalPayment')}
          </DialogTitle>
          <DialogDescription>
            {t('payment.completePayment')} {courseTitle}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          <div className="text-center p-4 rounded-lg bg-accent/10 border border-accent/30">
            <span className="text-sm text-muted-foreground">{t('payment.requiredAmount')}</span>
            <p className="text-3xl font-black text-accent mt-1">${coursePrice} USD</p>
          </div>

          {status === 'success' ? (
            <div className="text-center py-6">
              <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-3" />
              <p className="font-bold text-lg">{t('payment.paypalSuccess')}</p>
            </div>
          ) : status === 'error' ? (
            <div className="text-center py-6">
              <AlertCircle className="h-16 w-16 text-destructive mx-auto mb-3" />
              <p className="font-bold text-lg mb-4">{t('payment.paypalError')}</p>
              <Button onClick={handlePayPalPayment} variant="gold" className="gap-2">
                <Globe className="h-4 w-4" />
                {t('payment.tryAgain')}
              </Button>
            </div>
          ) : (
            <Button
              onClick={handlePayPalPayment}
              disabled={loading}
              className="w-full h-14 gap-3 text-base"
              variant="gold"
            >
              {loading ? (
                <>
                  <Loader2 className="h-5 w-5 animate-spin" />
                  {t('payment.processing')}
                </>
              ) : (
                <>
                  <Globe className="h-5 w-5" />
                  {t('payment.payWithPayPal')}
                </>
              )}
            </Button>
          )}

          {loading && status === 'created' && (
            <p className="text-sm text-center text-muted-foreground">
              {t('payment.completeInPayPal')}
            </p>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default PayPalPaymentModal;
