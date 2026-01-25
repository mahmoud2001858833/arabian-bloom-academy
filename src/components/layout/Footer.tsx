import { Link } from 'react-router-dom';
import { Facebook, Twitter, Instagram, Youtube, Mail, Phone } from 'lucide-react';
import logo from '@/assets/logo.png';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-sidebar text-sidebar-foreground">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Logo & Description */}
          <div className="space-y-4">
            <img src={logo} alt="منصة العربية" className="h-12 w-auto" />
            <p className="text-sidebar-foreground/70 text-sm leading-relaxed">
              منصة تعليمية متكاملة لتعلم اللغة العربية بطريقة سهلة وممتعة. نقدم لك أفضل الكورسات التعليمية مع متابعة لتقدمك.
            </p>
            {/* Social Links */}
            <div className="flex gap-4 pt-2">
              <a href="#" className="text-sidebar-foreground/60 hover:text-sidebar-primary transition-colors">
                <Facebook className="h-5 w-5" />
              </a>
              <a href="#" className="text-sidebar-foreground/60 hover:text-sidebar-primary transition-colors">
                <Twitter className="h-5 w-5" />
              </a>
              <a href="#" className="text-sidebar-foreground/60 hover:text-sidebar-primary transition-colors">
                <Instagram className="h-5 w-5" />
              </a>
              <a href="#" className="text-sidebar-foreground/60 hover:text-sidebar-primary transition-colors">
                <Youtube className="h-5 w-5" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-lg font-bold mb-4 text-sidebar-primary">روابط سريعة</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/" className="text-sidebar-foreground/70 hover:text-sidebar-primary transition-colors">
                  الرئيسية
                </Link>
              </li>
              <li>
                <Link to="/courses" className="text-sidebar-foreground/70 hover:text-sidebar-primary transition-colors">
                  الكورسات
                </Link>
              </li>
              <li>
                <Link to="/about" className="text-sidebar-foreground/70 hover:text-sidebar-primary transition-colors">
                  من نحن
                </Link>
              </li>
              <li>
                <Link to="/contact" className="text-sidebar-foreground/70 hover:text-sidebar-primary transition-colors">
                  اتصل بنا
                </Link>
              </li>
            </ul>
          </div>

          {/* Categories */}
          <div>
            <h3 className="text-lg font-bold mb-4 text-sidebar-primary">الأقسام</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/courses?level=beginner" className="text-sidebar-foreground/70 hover:text-sidebar-primary transition-colors">
                  المستوى المبتدئ
                </Link>
              </li>
              <li>
                <Link to="/courses?level=intermediate" className="text-sidebar-foreground/70 hover:text-sidebar-primary transition-colors">
                  المستوى المتوسط
                </Link>
              </li>
              <li>
                <Link to="/courses?level=advanced" className="text-sidebar-foreground/70 hover:text-sidebar-primary transition-colors">
                  المستوى المتقدم
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="text-lg font-bold mb-4 text-sidebar-primary">تواصل معنا</h3>
            <ul className="space-y-3">
              <li className="flex items-center gap-2 text-sidebar-foreground/70">
                <Mail className="h-4 w-4 text-sidebar-primary" />
                <span>info@arabicplatform.com</span>
              </li>
              <li className="flex items-center gap-2 text-sidebar-foreground/70">
                <Phone className="h-4 w-4 text-sidebar-primary" />
                <span dir="ltr">+966 50 123 4567</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-sidebar-border mt-8 pt-8 text-center text-sidebar-foreground/60 text-sm">
          <p>© {currentYear} منصة العربية. جميع الحقوق محفوظة.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
