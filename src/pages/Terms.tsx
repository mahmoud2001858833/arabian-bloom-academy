import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import { useLanguage } from '@/i18n/LanguageContext';

const Terms = () => {
  const { t, language } = useLanguage();
  const isRtl = language === 'ar' || language === 'ur';

  return (
    <div className="min-h-screen bg-background" dir={isRtl ? 'rtl' : 'ltr'}>
      <Navbar />
      <main className="pt-32 pb-20">
        <div className="container mx-auto px-4 max-w-4xl">
          <h1 className="text-4xl md:text-5xl font-black text-foreground mb-8">
            {t('footer.termsOfUse')}
          </h1>
          
          <div className="prose prose-lg max-w-none space-y-8 text-muted-foreground">
            <section className="bg-card rounded-2xl p-8 border border-primary/10">
              <h2 className="text-2xl font-bold text-foreground mb-4">
                {isRtl ? 'القبول بالشروط' : 'Acceptance of Terms'}
              </h2>
              <p>
                {isRtl
                  ? 'باستخدامك لمنصة النجاة التعليمية، فإنك توافق على الالتزام بهذه الشروط والأحكام. إذا كنت لا توافق على أي من هذه الشروط، يرجى عدم استخدام المنصة.'
                  : 'By using the Al-Najat educational platform, you agree to be bound by these terms and conditions. If you do not agree to any of these terms, please do not use the platform.'}
              </p>
            </section>

            <section className="bg-card rounded-2xl p-8 border border-primary/10">
              <h2 className="text-2xl font-bold text-foreground mb-4">
                {isRtl ? 'الحساب والتسجيل' : 'Account and Registration'}
              </h2>
              <ul className="list-disc list-inside space-y-2">
                <li>{isRtl ? 'يجب أن تكون المعلومات المقدمة عند التسجيل دقيقة وصحيحة' : 'Information provided during registration must be accurate and truthful'}</li>
                <li>{isRtl ? 'أنت مسؤول عن الحفاظ على سرية بيانات حسابك' : 'You are responsible for maintaining the confidentiality of your account credentials'}</li>
                <li>{isRtl ? 'يجب أن يكون عمرك 13 سنة على الأقل لاستخدام المنصة' : 'You must be at least 13 years old to use the platform'}</li>
                <li>{isRtl ? 'يحق لنا تعليق أو إلغاء حسابك في حال مخالفة الشروط' : 'We reserve the right to suspend or terminate your account for violation of terms'}</li>
              </ul>
            </section>

            <section className="bg-card rounded-2xl p-8 border border-primary/10">
              <h2 className="text-2xl font-bold text-foreground mb-4">
                {isRtl ? 'المحتوى التعليمي' : 'Educational Content'}
              </h2>
              <ul className="list-disc list-inside space-y-2">
                <li>{isRtl ? 'جميع المواد التعليمية محمية بحقوق الملكية الفكرية' : 'All educational materials are protected by intellectual property rights'}</li>
                <li>{isRtl ? 'لا يجوز نسخ أو توزيع أو مشاركة المحتوى دون إذن مسبق' : 'Content may not be copied, distributed, or shared without prior permission'}</li>
                <li>{isRtl ? 'الوصول إلى الدروس المدفوعة يتطلب إتمام عملية الدفع' : 'Access to paid lessons requires completing the payment process'}</li>
                <li>{isRtl ? 'نحتفظ بحق تعديل أو تحديث المحتوى في أي وقت' : 'We reserve the right to modify or update content at any time'}</li>
              </ul>
            </section>

            <section className="bg-card rounded-2xl p-8 border border-primary/10">
              <h2 className="text-2xl font-bold text-foreground mb-4">
                {isRtl ? 'الدفع والاسترداد' : 'Payment and Refunds'}
              </h2>
              <ul className="list-disc list-inside space-y-2">
                <li>{isRtl ? 'أسعار الدروس بالدولار الأمريكي وقابلة للتغيير' : 'Lesson prices are in US Dollars and subject to change'}</li>
                <li>{isRtl ? 'يتم تفعيل الاشتراك بعد التحقق من الدفع' : 'Subscription is activated after payment verification'}</li>
                <li>{isRtl ? 'يمكن طلب استرداد المبلغ خلال 7 أيام من الشراء' : 'Refunds can be requested within 7 days of purchase'}</li>
                <li>{isRtl ? 'لا يمكن استرداد المبلغ بعد مشاهدة أكثر من 30% من الدرس' : 'No refunds after watching more than 30% of the lesson'}</li>
              </ul>
            </section>

            <section className="bg-card rounded-2xl p-8 border border-primary/10">
              <h2 className="text-2xl font-bold text-foreground mb-4">
                {isRtl ? 'سلوك المستخدم' : 'User Conduct'}
              </h2>
              <ul className="list-disc list-inside space-y-2">
                <li>{isRtl ? 'يجب استخدام المنصة لأغراض تعليمية فقط' : 'The platform must be used for educational purposes only'}</li>
                <li>{isRtl ? 'يُمنع نشر محتوى مسيء أو غير لائق' : 'Publishing offensive or inappropriate content is prohibited'}</li>
                <li>{isRtl ? 'يُمنع محاولة اختراق أو تعطيل المنصة' : 'Attempting to hack or disrupt the platform is prohibited'}</li>
                <li>{isRtl ? 'يجب احترام جميع المستخدمين والمعلمين' : 'All users and teachers must be treated with respect'}</li>
              </ul>
            </section>

            <section className="bg-card rounded-2xl p-8 border border-primary/10">
              <h2 className="text-2xl font-bold text-foreground mb-4">
                {isRtl ? 'الشهادات' : 'Certificates'}
              </h2>
              <p>
                {isRtl
                  ? 'يتم إصدار شهادات إتمام الدروس بعد اجتياز جميع المتطلبات بنجاح. الشهادات صادرة من منصة النجاة ولا تمثل بالضرورة اعتماداً أكاديمياً رسمياً.'
                  : 'Lesson completion certificates are issued after successfully meeting all requirements. Certificates are issued by Al-Najat Platform and do not necessarily represent official academic accreditation.'}
              </p>
            </section>

            <section className="bg-card rounded-2xl p-8 border border-primary/10">
              <h2 className="text-2xl font-bold text-foreground mb-4">
                {isRtl ? 'تعديل الشروط' : 'Modification of Terms'}
              </h2>
              <p>
                {isRtl
                  ? 'نحتفظ بحق تعديل هذه الشروط في أي وقت. سيتم إخطارك بأي تغييرات جوهرية عبر البريد الإلكتروني أو من خلال إشعار على المنصة.'
                  : 'We reserve the right to modify these terms at any time. You will be notified of any material changes via email or through a notification on the platform.'}
              </p>
            </section>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Terms;