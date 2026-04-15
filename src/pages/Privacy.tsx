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
                {isRtl ? 'من نحن — هوية المتحكم بالبيانات' : 'Who We Are — Data Controller'}
              </h2>
              <p>
                {isRtl
                  ? 'هذه السياسة صادرة عن XBUILD (المشغّل التجاري لمنصة النجاة التعليمية). نحن المتحكم بالبيانات المسؤول عن معالجة بياناتك الشخصية وفقاً لهذه السياسة.'
                  : 'This Privacy Notice is issued by XBUILD (the commercial operator of the Al-Najat educational platform). We are the data controller responsible for the processing of your personal data in accordance with this policy.'}
              </p>
            </section>

            <section className="bg-card rounded-2xl p-8 border border-primary/10">
              <h2 className="text-2xl font-bold text-foreground mb-4">
                {isRtl ? 'البيانات الشخصية التي نجمعها' : 'Personal Data We Collect'}
              </h2>
              <ul className="list-disc list-inside space-y-2">
                <li>{isRtl ? 'الاسم الكامل والبريد الإلكتروني عند التسجيل' : 'Full name and email address upon registration'}</li>
                <li>{isRtl ? 'بيانات تسجيل الدخول (كلمة المرور المشفّرة)' : 'Login credentials (encrypted password)'}</li>
                <li>{isRtl ? 'تقدمك في الدروس ونتائج الامتحانات' : 'Your lesson progress and exam results'}</li>
                <li>{isRtl ? 'رسائل الدعم الفني' : 'Support messages'}</li>
                <li>{isRtl ? 'بيانات الاستخدام وعنوان IP ومعرّفات الجهاز' : 'Usage data, IP address, and device identifiers'}</li>
              </ul>
            </section>

            <section className="bg-card rounded-2xl p-8 border border-primary/10">
              <h2 className="text-2xl font-bold text-foreground mb-4">
                {isRtl ? 'أغراض المعالجة والأساس القانوني' : 'Purposes & Legal Basis'}
              </h2>
              <ul className="list-disc list-inside space-y-2">
                <li>{isRtl ? 'تقديم الخدمات التعليمية وإدارة حسابك — الأساس: تنفيذ العقد' : 'Providing educational services and managing your account — Basis: contract performance'}</li>
                <li>{isRtl ? 'معالجة المدفوعات وإصدار الشهادات — الأساس: تنفيذ العقد' : 'Processing payments and issuing certificates — Basis: contract performance'}</li>
                <li>{isRtl ? 'تحسين المنصة وتحليل الاستخدام — الأساس: المصلحة المشروعة' : 'Improving the platform and usage analytics — Basis: legitimate interest'}</li>
                <li>{isRtl ? 'منع الاحتيال وحماية الأمان — الأساس: المصلحة المشروعة والالتزام القانوني' : 'Fraud prevention and security — Basis: legitimate interest and legal obligation'}</li>
                <li>{isRtl ? 'التواصل بشأن الدروس والتحديثات — الأساس: الموافقة' : 'Communicating about lessons and updates — Basis: consent'}</li>
              </ul>
            </section>

            <section className="bg-card rounded-2xl p-8 border border-primary/10">
              <h2 className="text-2xl font-bold text-foreground mb-4">
                {isRtl ? 'مشاركة البيانات مع أطراف ثالثة' : 'Data Sharing & Recipients'}
              </h2>
              <ul className="list-disc list-inside space-y-2">
                <li>{isRtl
                  ? 'Paddle.com — بصفتها التاجر المسجّل (Merchant of Record)، تتلقى بيانات الدفع والمستخدم لمعالجة المعاملات والضرائب والفواتير وإدارة الاشتراكات'
                  : 'Paddle.com — as the Merchant of Record, receives user and payment data to process transactions, tax compliance, invoicing, and subscription management'}</li>
                <li>{isRtl ? 'مزودو خدمات الاستضافة والبنية التحتية' : 'Hosting and infrastructure service providers'}</li>
                <li>{isRtl ? 'أدوات التحليل والدعم الفني' : 'Analytics and support tooling providers'}</li>
                <li>{isRtl ? 'المستشارون المهنيون (قانونيون ومحاسبيون) عند الحاجة' : 'Professional advisers (legal, accounting) when necessary'}</li>
                <li>{isRtl ? 'الجهات الرسمية عندما يقتضي القانون ذلك' : 'Authorities where required by law'}</li>
              </ul>
            </section>

            <section className="bg-card rounded-2xl p-8 border border-primary/10">
              <h2 className="text-2xl font-bold text-foreground mb-4">
                {isRtl ? 'فترات الاحتفاظ بالبيانات' : 'Data Retention'}
              </h2>
              <p>
                {isRtl
                  ? 'نحتفظ ببياناتك الشخصية طالما كان حسابك نشطاً أو حسب الحاجة لتقديم خدماتنا. عند حذف حسابك، نحذف بياناتك أو نجعلها مجهولة الهوية خلال 90 يوماً، ما لم يكن الاحتفاظ بها مطلوباً بموجب القانون (مثل السجلات المالية التي تُحفظ لمدة تصل إلى 7 سنوات).'
                  : 'We retain your personal data for as long as your account is active or as needed to provide our services. Upon account deletion, we delete or anonymise your data within 90 days, unless retention is required by law (e.g. financial records may be kept for up to 7 years).'}
              </p>
            </section>

            <section className="bg-card rounded-2xl p-8 border border-primary/10">
              <h2 className="text-2xl font-bold text-foreground mb-4">
                {isRtl ? 'حماية البيانات' : 'Data Protection'}
              </h2>
              <p>
                {isRtl
                  ? 'نلتزم بتطبيق تدابير تقنية وتنظيمية مناسبة لحماية بياناتك الشخصية، بما في ذلك التشفير وضوابط الوصول والمراقبة الأمنية المستمرة.'
                  : 'We are committed to implementing appropriate technical and organisational measures to protect your personal data, including encryption, access controls, and ongoing security monitoring.'}
              </p>
            </section>

            <section className="bg-card rounded-2xl p-8 border border-primary/10">
              <h2 className="text-2xl font-bold text-foreground mb-4">
                {isRtl ? 'ملفات تعريف الارتباط (Cookies)' : 'Cookies'}
              </h2>
              <p>
                {isRtl
                  ? 'نستخدم ملفات تعريف الارتباط الأساسية لتشغيل المنصة وملفات التحليل لتحسين تجربتك. يمكنك إدارة تفضيلاتك من خلال إعدادات المتصفح.'
                  : 'We use essential cookies to operate the platform and analytics cookies to improve your experience. You can manage your preferences through your browser settings.'}
              </p>
            </section>

            <section className="bg-card rounded-2xl p-8 border border-primary/10">
              <h2 className="text-2xl font-bold text-foreground mb-4">
                {isRtl ? 'حقوقك' : 'Your Rights'}
              </h2>
              <ul className="list-disc list-inside space-y-2">
                <li>{isRtl ? 'الوصول إلى بياناتك الشخصية وتعديلها' : 'Access and rectify your personal data'}</li>
                <li>{isRtl ? 'طلب حذف حسابك وبياناتك' : 'Request erasure of your account and data'}</li>
                <li>{isRtl ? 'تقييد أو الاعتراض على المعالجة' : 'Restrict or object to processing'}</li>
                <li>{isRtl ? 'الحصول على نسخة من بياناتك (قابلية النقل)' : 'Data portability — obtain a copy of your data'}</li>
                <li>{isRtl ? 'سحب موافقتك في أي وقت' : 'Withdraw consent at any time'}</li>
                <li>{isRtl ? 'إلغاء الاشتراك من الرسائل التسويقية' : 'Unsubscribe from marketing communications'}</li>
              </ul>
            </section>

            <section className="bg-card rounded-2xl p-8 border border-primary/10">
              <h2 className="text-2xl font-bold text-foreground mb-4">
                {isRtl ? 'تواصل معنا' : 'Contact Us'}
              </h2>
              <p>
                {isRtl
                  ? 'إذا كان لديك أي أسئلة حول سياسة الخصوصية أو ترغب في ممارسة حقوقك، يمكنك التواصل معنا عبر واتساب أو من خلال نظام الدعم في المنصة.'
                  : 'If you have any questions about this Privacy Notice or wish to exercise your rights, you can contact us via WhatsApp or through the platform support system.'}
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
