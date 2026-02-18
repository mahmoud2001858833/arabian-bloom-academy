import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/i18n/LanguageContext';
import { CreditCard, Globe } from 'lucide-react';

interface PaymentMethodSelectorProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  courseTitle: string;
  coursePrice: number;
  onSelectPayPal: () => void;
  onSelectClick: () => void;
}

const PaymentMethodSelector = ({
  open,
  onOpenChange,
  courseTitle,
  coursePrice,
  onSelectPayPal,
  onSelectClick,
}: PaymentMethodSelectorProps) => {
  const { t } = useLanguage();

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md bg-card border-border">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-center">
            {t('payment.selectPaymentMethod')}
          </DialogTitle>
          <DialogDescription className="text-center">
            {t('payment.completePayment')} {courseTitle}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3 py-4">
          <div className="text-center mb-4">
            <span className="text-2xl font-black text-accent">{coursePrice} {t('payment.sar')}</span>
          </div>

          <Button
            onClick={() => {
              onOpenChange(false);
              onSelectPayPal();
            }}
            className="w-full h-14 gap-3 text-base"
            variant="gold"
          >
            <Globe className="h-5 w-5" />
            {t('payment.payWithPayPal')}
          </Button>

          <Button
            onClick={() => {
              onOpenChange(false);
              onSelectClick();
            }}
            variant="outline"
            className="w-full h-14 gap-3 text-base"
          >
            <CreditCard className="h-5 w-5" />
            {t('payment.payWithClick')}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default PaymentMethodSelector;
