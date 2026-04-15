import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import { useLanguage } from '@/i18n/LanguageContext';

const Refund = () => {
  const { t, language } = useLanguage();
  const isRtl = language === 'ar' || language === 'ur';

  return (
    <div className="min-h-screen bg-background" dir={isRtl ? 'rtl' : 'ltr'}>
      <Navbar />
      <main className="pt-32 pb-20">
        <div className="container mx-auto px-4 max-w-4xl">
          <h1 className="text-4xl md:text-5xl font-black text-foreground mb-8">
            {isRtl ? 'سياسة الاسترداد' : 'Refund Policy'}
          </h1>
          
          <div className="prose prose-lg max-w-none space-y-8 text-muted-foreground">
            <section className="bg-card rounded-2xl p-8 border border-primary/10">
              <h2 className="text-2xl font-bold text-foreground mb-4">
                {isRtl ? 'ضمان استرداد الأموال' : 'Money-Back Guarantee'}
              </h2>
              <p>
                {isRtl
                  ? 'نقدم ضمان استرداد الأموال خلال 14 يوماً. إذا لم تكن راضياً عن شرائك لأي سبب، يمكنك طلب استرداد كامل المبلغ خلال 14 يوماً من تاريخ الطلب.'
                  : 'We offer a 14-day money-back guarantee. If you are not satisfied with your purchase for any reason, you can request a full refund within 14 days of your order date.'}
              </p>
            </section>

            <section className="bg-card rounded-2xl p-8 border border-primary/10">
              <h2 className="text-2xl font-bold text-foreground mb-4">
                {isRtl ? 'كيفية طلب الاسترداد' : 'How to Request a Refund'}
              </h2>
              <p>
                {isRtl
                  ? 'تتم معالجة عمليات الاسترداد بواسطة مزود الدفع الخاص بنا Paddle. لطلب استرداد:'
                  : 'Refunds are processed by our payment provider, Paddle. To request a refund:'}
              </p>
              <ul className="list-disc list-inside space-y-2 mt-3">
                <li>
                  {isRtl ? 'قم بزيارة ' : 'Visit '}
                  <a href="https://paddle.net" target="_blank" rel="noopener noreferrer" className="text-primary underline">paddle.net</a>
                  {isRtl ? ' وأدخل بريدك الإلكتروني للوصول إلى سجل طلباتك' : ' and enter your email to access your order history'}
                </li>
                <li>{isRtl ? 'أو تواصل مع فريق الدعم عبر المنصة أو واتساب' : 'Or contact our support team via the platform or WhatsApp'}</li>
              </ul>
            </section>

            <section className="bg-card rounded-2xl p-8 border border-primary/10">
              <h2 className="text-2xl font-bold text-foreground mb-4">
                {isRtl ? 'معالجة الاسترداد' : 'Refund Processing'}
              </h2>
              <p>
                {isRtl
                  ? 'بمجرد الموافقة على طلب الاسترداد، تتولى Paddle معالجة المبلغ المسترد إلى وسيلة الدفع الأصلية. قد يستغرق ظهور المبلغ في حسابك من 5 إلى 10 أيام عمل حسب البنك أو مزود الدفع.'
                  : 'Once a refund request is approved, Paddle processes the refund to the original payment method. It may take 5–10 business days for the amount to appear in your account, depending on your bank or payment provider.'}
              </p>
            </section>

            <section className="bg-card rounded-2xl p-8 border border-primary/10">
              <h2 className="text-2xl font-bold text-foreground mb-4">
                {isRtl ? 'تواصل معنا' : 'Contact Us'}
              </h2>
              <p>
                {isRtl
                  ? 'إذا كان لديك أي أسئلة حول سياسة الاسترداد، يمكنك التواصل معنا عبر واتساب أو من خلال نظام الدعم في المنصة.'
                  : 'If you have any questions about this Refund Policy, you can contact us via WhatsApp or through the platform support system.'}
              </p>
            </section>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Refund;
