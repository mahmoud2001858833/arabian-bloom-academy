import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Menu, X, User, LogOut, LayoutDashboard, ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import logo from '@/assets/navbar-logo.png';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { user, isAdmin, signOut } = useAuth();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  const navLinks = [
    { href: '/', label: 'الرئيسية' },
    { href: '/courses', label: 'الكورسات' },
    { href: '/about', label: 'من نحن' },
  ];

  return (
    <nav className="fixed top-0 right-0 left-0 z-50 bg-white/70 backdrop-blur-2xl border-b border-primary/15 shadow-lg shadow-primary/5">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-24">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-3 group">
            <img src={logo} alt="منصة العربية" className="h-20 w-auto transition-all duration-500 group-hover:scale-110 group-hover:drop-shadow-lg" />
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-10">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                to={link.href}
                className="relative text-foreground/80 hover:text-primary transition-colors font-semibold text-lg group"
              >
                {link.label}
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-gradient-primary group-hover:w-full transition-all duration-300" />
              </Link>
            ))}
          </div>

          {/* Auth Buttons / User Menu */}
          <div className="hidden md:flex items-center gap-4">
            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative flex items-center gap-3 h-12 px-4 rounded-xl hover:bg-primary/5">
                    <Avatar className="h-9 w-9 border-2 border-primary/20">
                      <AvatarImage src={user.user_metadata?.avatar_url} />
                      <AvatarFallback className="bg-gradient-primary text-white font-bold">
                        {user.email?.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <span className="font-semibold">{user.user_metadata?.full_name || 'مستخدم'}</span>
                    <ChevronDown className="h-4 w-4 text-muted-foreground" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56 bg-white border shadow-xl rounded-xl p-2" align="end">
                  <div className="px-3 py-2 mb-2">
                    <p className="font-semibold">{user.user_metadata?.full_name || 'مستخدم'}</p>
                    <p className="text-xs text-muted-foreground">{user.email}</p>
                  </div>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link to={isAdmin ? '/admin' : '/dashboard'} className="cursor-pointer rounded-lg">
                      <LayoutDashboard className="ml-2 h-4 w-4" />
                      {isAdmin ? 'لوحة التحكم' : 'لوحة الطالب'}
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link to="/profile" className="cursor-pointer rounded-lg">
                      <User className="ml-2 h-4 w-4" />
                      الملف الشخصي
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleSignOut} className="cursor-pointer text-destructive rounded-lg">
                    <LogOut className="ml-2 h-4 w-4" />
                    تسجيل الخروج
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <>
                <Button variant="ghost" className="font-semibold text-lg hover:text-accent" asChild>
                  <Link to="/auth">تسجيل الدخول</Link>
                </Button>
                <Button className="rounded-xl px-6 font-bold" asChild>
                  <Link to="/auth?tab=signup">إنشاء حساب</Link>
                </Button>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden p-2 rounded-xl hover:bg-primary/5 transition-colors"
            onClick={() => setIsOpen(!isOpen)}
            aria-label="Toggle menu"
          >
            {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>

        {/* Mobile Navigation */}
        {isOpen && (
          <div className="md:hidden py-6 border-t border-primary/10 animate-fade-in">
            <div className="flex flex-col gap-4">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  to={link.href}
                  className="text-foreground/80 hover:text-primary transition-colors font-semibold py-3 px-4 rounded-xl hover:bg-primary/5"
                  onClick={() => setIsOpen(false)}
                >
                  {link.label}
                </Link>
              ))}
              {user ? (
                <>
                  <Link
                    to={isAdmin ? '/admin' : '/dashboard'}
                    className="text-foreground/80 hover:text-primary transition-colors font-semibold py-3 px-4 rounded-xl hover:bg-primary/5"
                    onClick={() => setIsOpen(false)}
                  >
                    {isAdmin ? 'لوحة التحكم' : 'لوحة الطالب'}
                  </Link>
                  <button
                    onClick={() => {
                      handleSignOut();
                      setIsOpen(false);
                    }}
                    className="text-destructive hover:text-destructive/80 transition-colors font-semibold py-3 px-4 rounded-xl hover:bg-destructive/5 text-right"
                  >
                    تسجيل الخروج
                  </button>
                </>
              ) : (
                <div className="flex flex-col gap-3 pt-4 border-t border-accent/20">
                  <Button variant="outline" className="rounded-xl" asChild>
                    <Link to="/auth" onClick={() => setIsOpen(false)}>
                      تسجيل الدخول
                    </Link>
                  </Button>
                  <Button className="rounded-xl" asChild>
                    <Link to="/auth?tab=signup" onClick={() => setIsOpen(false)}>
                      إنشاء حساب
                    </Link>
                  </Button>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
