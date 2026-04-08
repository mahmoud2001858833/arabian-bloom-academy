import { Link } from 'react-router-dom';
import { ArrowUp, Mail } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/i18n/LanguageContext';
import logo from '@/assets/new-logo.png';

const Footer = () => {
  const { t } = useLanguage();
  const currentYear = new Date().getFullYear();

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const quickLinks = [
    { href: '/', label: t('nav.home') },
    { href: '/courses', label: t('nav.courses') },
    { href: '/about', label: t('nav.about') },
  ];

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
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
          {/* Logo & Description */}
          <div className="space-y-6">
            <img src={logo} alt={t('footer.platformName')} className="h-24 w-auto" />
            <p className="text-white/70 leading-relaxed">
              {t('footer.description')}
            </p>
            {/* Islamic Decorative Element */}
            <div className="flex gap-4 text-3xl text-gold/60">
              <span>۞</span>
              <span>﴾</span>
              <span>﴿</span>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-lg font-bold mb-6 text-gold">{t('footer.quickLinks')}</h3>
            <ul className="space-y-3">
              {quickLinks.map((link) => (
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
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-white/10 mt-12 pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-white/60 text-sm">
            © {currentYear} {t('footer.platformName')}. {t('footer.allRightsReserved')}
          </p>
          <div className="flex gap-6 text-sm text-white/60">
            <Link to="/terms" className="hover:text-gold transition-colors">{t('footer.termsOfUse')}</Link>
            <Link to="/privacy" className="hover:text-gold transition-colors">{t('footer.privacyPolicy')}</Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
