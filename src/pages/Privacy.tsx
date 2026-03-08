import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import { useLanguage } from '@/i18n/LanguageContext';

const Privacy = () => {
  const { t, language } = useLanguage();
  const isRtl = language === 'ar' || language === 'ur';

  return (
    <div className="min-h-screen bg-background" dir={isRtl ? 'rtl' : 'ltr'}>
      <Navbar />
      <main className="pt-32 pb-20">
        <div className="container mx-auto px-4 max-w-4xl">
          <h1 className="text-4xl md:text-5xl font-black text-foreground mb-8">
            {t('footer.privacyPolicy')}
          </h1>
          
          <div className="prose prose-lg max-w-none space-y-8 text-muted-foreground">
            <section className="bg-card rounded-2xl p-8 border border-primary/10">
              <h2 className="text-2xl font-bold text-foreground mb-4">
                {isRtl ? 'مقدمة' : 'Introduction'}
              </h2>
              <p>
                {isRtl 
                  ? 'نحن في منصة النجاة نلتزم بحماية خصوصيتك وبياناتك الشخصية. توضح سياسة الخصوصية هذه كيفية جمعنا واستخدامنا وحمايتنا لمعلوماتك عند استخدام منصتنا التعليمية.'
                  : 'At Al-Najat Platform, we are committed to protecting your privacy and personal data. This Privacy Policy explains how we collect, use, and protect your information when you use our educational platform.'}
              </p>
            </section>

            <section className="bg-card rounded-2xl p-8 border border-primary/10">
              <h2 className="text-2xl font-bold text-foreground mb-4">
                {isRtl ? 'المعلومات التي نجمعها' : 'Information We Collect'}
              </h2>
              <ul className="list-disc list-inside space-y-2">
                <li>{isRtl ? 'الاسم الكامل والبريد الإلكتروني عند التسجيل' : 'Full name and email address upon registration'}</li>
                <li>{isRtl ? 'معلومات الدفع عند شراء الدروس' : 'Payment information when purchasing lessons'}</li>
                <li>{isRtl ? 'تقدمك في الدروس ونتائج الامتحانات' : 'Your lesson progress and exam results'}</li>
                <li>{isRtl ? 'بيانات الاستخدام وسجلات الأنشطة' : 'Usage data and activity logs'}</li>
              </ul>
            </section>

            <section className="bg-card rounded-2xl p-8 border border-primary/10">
              <h2 className="text-2xl font-bold text-foreground mb-4">
                {isRtl ? 'كيف نستخدم معلوماتك' : 'How We Use Your Information'}
              </h2>
              <ul className="list-disc list-inside space-y-2">
                <li>{isRtl ? 'تقديم الخدمات التعليمية وتحسينها' : 'Providing and improving educational services'}</li>
                <li>{isRtl ? 'إدارة حسابك وتتبع تقدمك' : 'Managing your account and tracking your progress'}</li>
                <li>{isRtl ? 'التواصل معك بشأن الدروس والتحديثات' : 'Communicating with you about lessons and updates'}</li>
                <li>{isRtl ? 'معالجة المدفوعات وإصدار الشهادات' : 'Processing payments and issuing certificates'}</li>
                <li>{isRtl ? 'تحسين تجربة المستخدم على المنصة' : 'Improving user experience on the platform'}</li>
              </ul>
            </section>

            <section className="bg-card rounded-2xl p-8 border border-primary/10">
              <h2 className="text-2xl font-bold text-foreground mb-4">
                {isRtl ? 'حماية البيانات' : 'Data Protection'}
              </h2>
              <p>
                {isRtl
                  ? 'نحن نستخدم تقنيات أمان متقدمة لحماية بياناتك الشخصية من الوصول غير المصرح به أو الاستخدام أو الإفصاح. جميع البيانات مشفرة ومحمية وفقاً لأفضل الممارسات الأمنية.'
                  : 'We use advanced security technologies to protect your personal data from unauthorized access, use, or disclosure. All data is encrypted and protected according to security best practices.'}
              </p>
            </section>

            <section className="bg-card rounded-2xl p-8 border border-primary/10">
              <h2 className="text-2xl font-bold text-foreground mb-4">
                {isRtl ? 'حقوقك' : 'Your Rights'}
              </h2>
              <ul className="list-disc list-inside space-y-2">
                <li>{isRtl ? 'الوصول إلى بياناتك الشخصية وتعديلها' : 'Access and modify your personal data'}</li>
                <li>{isRtl ? 'طلب حذف حسابك وبياناتك' : 'Request deletion of your account and data'}</li>
                <li>{isRtl ? 'إلغاء الاشتراك من الرسائل التسويقية' : 'Unsubscribe from marketing communications'}</li>
                <li>{isRtl ? 'الحصول على نسخة من بياناتك' : 'Obtain a copy of your data'}</li>
              </ul>
            </section>

            <section className="bg-card rounded-2xl p-8 border border-primary/10">
              <h2 className="text-2xl font-bold text-foreground mb-4">
                {isRtl ? 'تواصل معنا' : 'Contact Us'}
              </h2>
              <p>
                {isRtl
                  ? 'إذا كان لديك أي أسئلة حول سياسة الخصوصية، يمكنك التواصل معنا عبر واتساب أو من خلال نظام الدعم في المنصة.'
                  : 'If you have any questions about the Privacy Policy, you can contact us via WhatsApp or through the platform support system.'}
              </p>
            </section>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Privacy;