import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { LanguageProvider } from "@/i18n/LanguageContext";
import AIGuide from "@/components/guide/AIGuide";
import SupportChat from "@/components/support/SupportChat";
import ScrollToTop from "@/components/layout/ScrollToTop";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import About from "./pages/About";
import Courses from "./pages/Courses";
import CourseDetails from "./pages/CourseDetails";
import Dashboard from "./pages/Dashboard";
import Admin from "./pages/Admin";
import Blog from "./pages/Blog";
import BlogDetails from "./pages/BlogDetails";
import NotFound from "./pages/NotFound";
import Exams from "./pages/Exams";
import ExamTake from "./pages/ExamTake";
import Privacy from "./pages/Privacy";
import Terms from "./pages/Terms";
import Refund from "./pages/Refund";
import IntroVideo from "./pages/IntroVideo";
import Reviews from "./pages/Reviews";
import Offers from "./pages/Offers";
import Books from "./pages/Books";
import PaymentSuccess from "./pages/PaymentSuccess";
import BookPaymentSuccess from "./pages/BookPaymentSuccess";
import PaymentOverlay from "./components/PaymentOverlay";

// Create query client instance
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000,
      retry: 1,
    },
  },
});

// Application component with correct provider hierarchy
// Order: QueryClientProvider -> LanguageProvider -> AuthProvider -> TooltipProvider
// v4
function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <LanguageProvider>
        <AuthProvider>
          <TooltipProvider>
            <Toaster />
            <Sonner />
            <BrowserRouter>
              <ScrollToTop />
              <Routes>
                <Route path="/" element={<Index />} />
                <Route path="/auth" element={<Auth />} />
                <Route path="/about" element={<About />} />
                <Route path="/courses" element={<Courses />} />
                <Route path="/courses/:courseId" element={<CourseDetails />} />
                <Route path="/blog" element={<Blog />} />
                <Route path="/blog/:postId" element={<BlogDetails />} />
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/admin" element={<Admin />} />
                <Route path="/exams" element={<Exams />} />
                <Route path="/exams/:examId" element={<ExamTake />} />
                <Route path="/privacy" element={<Privacy />} />
                <Route path="/terms" element={<Terms />} />
                <Route path="/refund" element={<Refund />} />
                <Route path="/intro-video" element={<IntroVideo />} />
                <Route path="/reviews" element={<Reviews />} />
                <Route path="/offers" element={<Offers />} />
                <Route path="/books" element={<Books />} />
                <Route path="/payment-success" element={<PaymentSuccess />} />
                <Route path="/book-success" element={<BookPaymentSuccess />} />
                <Route path="*" element={<NotFound />} />
              </Routes>
              <AIGuide />
              <SupportChat />
            </BrowserRouter>
            <PaymentOverlay />
          </TooltipProvider>
        </AuthProvider>
      </LanguageProvider>
    </QueryClientProvider>
  );
}

export default App;
