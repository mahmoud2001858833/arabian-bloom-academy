import { Link } from 'react-router-dom';
import { Facebook, Twitter, Instagram, Youtube, Mail, Phone, MapPin, ArrowUp } from 'lucide-react';
import logo from '@/assets/logo.png';
import { Button } from '@/components/ui/button';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer className="relative bg-gradient-hero text-white overflow-hidden">
      {/* Decorative Elements */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl" />
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-gold/10 rounded-full blur-3xl" />

      {/* Scroll to Top Button */}
      <div className="absolute -top-6 left-1/2 -translate-x-1/2">
        <Button
          onClick={scrollToTop}
          className="rounded-full w-12 h-12 bg-gold text-purple-900 hover:bg-gold/90 shadow-gold"
        >
          <ArrowUp className="h-5 w-5" />
        </Button>
      </div>

      <div className="container mx-auto px-4 py-16 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
          {/* Logo & Description */}
          <div className="space-y-6">
            <img src={logo} alt="منصة العربية" className="h-14 w-auto" />
            <p className="text-white/70 leading-relaxed">
              منصة تعليمية متكاملة لتعلم اللغة العربية بطريقة سهلة وممتعة. نقدم لك أفضل الكورسات التعليمية مع متابعة لتقدمك.
            </p>
            {/* Social Links */}
            <div className="flex gap-3">
              {[Facebook, Twitter, Instagram, Youtube].map((Icon, i) => (
                <a
                  key={i}
                  href="#"
                  className="w-10 h-10 rounded-xl bg-white/10 hover:bg-gold hover:text-purple-900 flex items-center justify-center transition-all"
                >
                  <Icon className="h-5 w-5" />
                </a>
              ))}
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-lg font-bold mb-6 text-gold">روابط سريعة</h3>
            <ul className="space-y-3">
              {[
                { href: '/', label: 'الرئيسية' },
                { href: '/courses', label: 'الكورسات' },
                { href: '/about', label: 'من نحن' },
                { href: '/contact', label: 'اتصل بنا' },
              ].map((link) => (
                <li key={link.href}>
                  <Link
                    to={link.href}
                    className="text-white/70 hover:text-gold transition-colors inline-block"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Categories */}
          <div>
            <h3 className="text-lg font-bold mb-6 text-gold">مستويات التعلم</h3>
            <ul className="space-y-3">
              {[
                { href: '/courses?level=beginner', label: 'المستوى المبتدئ' },
                { href: '/courses?level=intermediate', label: 'المستوى المتوسط' },
                { href: '/courses?level=advanced', label: 'المستوى المتقدم' },
              ].map((link) => (
                <li key={link.href}>
                  <Link
                    to={link.href}
                    className="text-white/70 hover:text-gold transition-colors inline-block"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="text-lg font-bold mb-6 text-gold">تواصل معنا</h3>
            <ul className="space-y-4">
              <li className="flex items-center gap-3 text-white/70">
                <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center">
                  <Mail className="h-5 w-5 text-gold" />
                </div>
                <span>info@arabicplatform.com</span>
              </li>
              <li className="flex items-center gap-3 text-white/70">
                <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center">
                  <Phone className="h-5 w-5 text-gold" />
                </div>
                <span dir="ltr">+966 50 123 4567</span>
              </li>
              <li className="flex items-center gap-3 text-white/70">
                <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center">
                  <MapPin className="h-5 w-5 text-gold" />
                </div>
                <span>المملكة العربية السعودية</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-white/10 mt-12 pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-white/60 text-sm">
            © {currentYear} منصة العربية. جميع الحقوق محفوظة.
          </p>
          <div className="flex gap-6 text-sm text-white/60">
            <Link to="/terms" className="hover:text-gold transition-colors">شروط الاستخدام</Link>
            <Link to="/privacy" className="hover:text-gold transition-colors">سياسة الخصوصية</Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
