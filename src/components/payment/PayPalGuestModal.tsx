import { useEffect, useRef, useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { useLanguage } from '@/i18n/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { CreditCard, Loader2 } from 'lucide-react';

interface PayPalGuestModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  courseId: string;
  courseTitle: string;
  coursePrice: number;
  onSuccess: () => void;
}

declare global {
  interface Window {
    paypal?: any;
  }
}

const PayPalGuestModal = ({
  open,
  onOpenChange,
  courseId,
  courseTitle,
  coursePrice,
  onSuccess,
}: PayPalGuestModalProps) => {
  const { t } = useLanguage();
  const { user } = useAuth();
  const containerRef = useRef<HTMLDivElement>(null);
  const [loading, setLoading] = useState(true);
  const [rendered, setRendered] = useState(false);

  useEffect(() => {
    if (!open || rendered) return;

    const renderButton = () => {
      if (!containerRef.current || !window.paypal?.HostedButtons) {
        // Retry if SDK not loaded yet
        setTimeout(renderButton, 500);
        return;
      }

      setLoading(false);
      
      window.paypal.HostedButtons({
        hostedButtonId: 'DJXS6GFYAECLW',
        onApprove: async (data: any) => {
          try {
            if (user) {
              // Record purchase in database
              const { error: purchaseError } = await supabase.from('purchases').insert({
                user_id: user.id,
                course_id: courseId,
                amount: coursePrice,
                stripe_payment_id: data.orderID || 'paypal-guest',
                status: 'completed',
              });

              if (!purchaseError) {
                await supabase.from('enrollments').insert({
                  user_id: user.id,
                  course_id: courseId,
                });
              }
            }

            toast.success(t('payment.paypalSuccess'));
            onOpenChange(false);
            onSuccess();
          } catch (error) {
            console.error('PayPal guest payment error:', error);
            toast.error(t('payment.paypalError'));
          }
        },
      }).render(containerRef.current);
      
      setRendered(true);
    };

    // Small delay to ensure DOM is ready
    const timer = setTimeout(renderButton, 300);
    return () => clearTimeout(timer);
  }, [open, rendered]);

  // Reset rendered state when modal closes
  useEffect(() => {
    if (!open) {
      setRendered(false);
      setLoading(true);
      if (containerRef.current) {
        containerRef.current.innerHTML = '';
      }
    }
  }, [open]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md bg-card border-border">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold flex items-center gap-2">
            <CreditCard className="h-5 w-5 text-accent" />
            {t('payment.payWithCard')}
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

          {loading && (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-accent" />
            </div>
          )}

          <div ref={containerRef} id="paypal-guest-container" />
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default PayPalGuestModal;
