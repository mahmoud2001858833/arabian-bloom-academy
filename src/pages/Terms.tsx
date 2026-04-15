import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import { useLanguage } from '@/i18n/LanguageContext';
import { Link } from 'react-router-dom';

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
                {isRtl ? 'هوية البائع' : 'Seller Identity'}
              </h2>
              <p>
                {isRtl
                  ? 'هذه الشروط صادرة عن XBUILD (المشغّل التجاري لمنصة النجاة التعليمية). باستخدامك للمنصة فإنك تتعاقد مع XBUILD.'
                  : 'These terms are issued by XBUILD (the commercial operator of the Al-Najat educational platform). By using the platform you are contracting with XBUILD.'}
              </p>
            </section>

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
                {isRtl ? 'المحتوى التعليمي والملكية الفكرية' : 'Educational Content & Intellectual Property'}
              </h2>
              <p className="mb-3">
                {isRtl
                  ? 'تحتفظ XBUILD بملكية جميع حقوق الملكية الفكرية للمنصة ومحتواها بما في ذلك البرمجيات والمواد التعليمية والعلامات التجارية.'
                  : 'XBUILD retains ownership of all intellectual property rights in the platform and its content, including software, educational materials, and branding.'}
              </p>
              <ul className="list-disc list-inside space-y-2">
                <li>{isRtl ? 'لا يجوز نسخ أو توزيع أو مشاركة المحتوى دون إذن مسبق' : 'Content may not be copied, distributed, or shared without prior permission'}</li>
                <li>{isRtl ? 'الوصول إلى الدروس المدفوعة يتطلب إتمام عملية الدفع' : 'Access to paid lessons requires completing the payment process'}</li>
                <li>{isRtl ? 'نحتفظ بحق تعديل أو تحديث المحتوى في أي وقت' : 'We reserve the right to modify or update content at any time'}</li>
              </ul>
            </section>

            <section className="bg-card rounded-2xl p-8 border border-primary/10">
              <h2 className="text-2xl font-bold text-foreground mb-4">
                {isRtl ? 'سوء الاستخدام' : 'Misuse'}
              </h2>
              <ul className="list-disc list-inside space-y-2">
                <li>{isRtl ? 'يجب استخدام المنصة لأغراض تعليمية مشروعة فقط' : 'The platform must be used for lawful educational purposes only'}</li>
                <li>{isRtl ? 'يُمنع نشر محتوى مسيء أو غير لائق أو احتيالي' : 'Publishing offensive, inappropriate, or fraudulent content is prohibited'}</li>
                <li>{isRtl ? 'يُمنع محاولة اختراق أو تعطيل أو استخراج بيانات المنصة' : 'Attempting to hack, disrupt, or scrape the platform is prohibited'}</li>
                <li>{isRtl ? 'يُمنع انتهاك حقوق الملكية الفكرية' : 'Intellectual property infringement is prohibited'}</li>
                <li>{isRtl ? 'يجب احترام جميع المستخدمين والمعلمين' : 'All users and teachers must be treated with respect'}</li>
              </ul>
            </section>

            <section className="bg-card rounded-2xl p-8 border border-primary/10">
              <h2 className="text-2xl font-bold text-foreground mb-4">
                {isRtl ? 'الدفع والاشتراكات' : 'Payment & Subscriptions'}
              </h2>
              <p className="mb-3">
                {isRtl
                  ? 'تتم معالجة طلباتنا بواسطة الموزع الإلكتروني Paddle.com. شركة Paddle.com هي التاجر المسجّل (Merchant of Record) لجميع طلباتنا. تتولى Paddle جميع استفسارات خدمة العملاء المتعلقة بالدفع وتتعامل مع المرتجعات.'
                  : 'Our order process is conducted by our online reseller Paddle.com. Paddle.com is the Merchant of Record for all our orders. Paddle provides all customer service inquiries and handles returns.'}
              </p>
              <p className="mb-3">
                {isRtl
                  ? 'للاطلاع على تفاصيل الدفع والفوترة والضرائب والإلغاء والاسترداد، يرجى مراجعة '
                  : 'For details on payment, billing, tax, cancellation, and refunds, please refer to '}
                <a href="https://www.paddle.com/legal/checkout-buyer-terms" target="_blank" rel="noopener noreferrer" className="text-primary underline">
                  {isRtl ? 'شروط المشتري من Paddle' : "Paddle's Buyer Terms"}
                </a>.
              </p>
              <ul className="list-disc list-inside space-y-2">
                <li>{isRtl ? 'أسعار الدروس بالدولار الأمريكي وقابلة للتغيير' : 'Lesson prices are in US Dollars and subject to change'}</li>
                <li>{isRtl ? 'يتم تفعيل الاشتراك بعد التحقق من الدفع' : 'Access is activated after payment verification'}</li>
              </ul>
            </section>

            <section className="bg-card rounded-2xl p-8 border border-primary/10">
              <h2 className="text-2xl font-bold text-foreground mb-4">
                {isRtl ? 'سياسة الاسترداد' : 'Refund Policy'}
              </h2>
              <p>
                {isRtl
                  ? 'نقدم ضمان استرداد الأموال خلال 14 يوماً. إذا لم تكن راضياً عن شرائك، يمكنك طلب استرداد كامل المبلغ خلال 14 يوماً من تاريخ الطلب. تتم معالجة عمليات الاسترداد بواسطة مزود الدفع الخاص بنا Paddle. لطلب استرداد، قم بزيارة '
                  : 'We offer a 14-day money-back guarantee. If you are not satisfied with your purchase, you can request a full refund within 14 days of your order date. Refunds are processed by our payment provider, Paddle. To request a refund, visit '}
                <a href="https://paddle.net" target="_blank" rel="noopener noreferrer" className="text-primary underline">paddle.net</a>
                {isRtl ? ' أو تواصل مع فريق الدعم.' : ' or contact our support team.'}
              </p>
              <p className="mt-2">
                <Link to="/refund" className="text-primary underline">
                  {isRtl ? 'اقرأ سياسة الاسترداد الكاملة' : 'Read the full Refund Policy'}
                </Link>
              </p>
            </section>

            <section className="bg-card rounded-2xl p-8 border border-primary/10">
              <h2 className="text-2xl font-bold text-foreground mb-4">
                {isRtl ? 'مستوى الخدمة' : 'Service Level'}
              </h2>
              <p>
                {isRtl
                  ? 'نسعى لتوفير خدمة مستمرة وموثوقة، لكننا لا نضمن أن المنصة ستعمل بدون انقطاع أو أخطاء في جميع الأوقات. قد تحدث فترات صيانة أو تحديثات تؤثر مؤقتاً على الوصول.'
                  : 'We strive to provide a continuous and reliable service, but we do not guarantee that the platform will be uninterrupted or error-free at all times. Maintenance periods or updates may temporarily affect access.'}
              </p>
            </section>

            <section className="bg-card rounded-2xl p-8 border border-primary/10">
              <h2 className="text-2xl font-bold text-foreground mb-4">
                {isRtl ? 'التعليق والإنهاء' : 'Suspension & Termination'}
              </h2>
              <p>
                {isRtl
                  ? 'يحق لنا تعليق أو إنهاء وصولك إلى المنصة في حالات: الإخلال الجوهري بالشروط، عدم الدفع، مخاطر أمنية أو احتيال، أو الانتهاكات المتكررة أو الجسيمة للسياسات.'
                  : 'We may suspend or terminate your access to the platform for: material breach of these terms, non-payment, security or fraud risk, or repeated/serious policy violations.'}
              </p>
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
