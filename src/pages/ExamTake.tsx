import { useState, useEffect, useCallback, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowRight, Clock, CheckCircle, XCircle, AlertTriangle, Volume2, Pause } from 'lucide-react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import PageTransition from '@/components/layout/PageTransition';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/i18n/LanguageContext';
import { useToast } from '@/hooks/use-toast';

interface ExamQuestion {
  id: string;
  question: string;
  options: string[];
  correct_answer: number;
  order_index: number;
  audio_url?: string | null;
}

interface Exam {
  id: string;
  title: string;
  description: string | null;
  duration_minutes: number;
  passing_score: number;
}

const ExamTake = () => {
  const { examId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { t } = useLanguage();
  const { toast } = useToast();

  const [exam, setExam] = useState<Exam | null>(null);
  const [questions, setQuestions] = useState<ExamQuestion[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [timeLeft, setTimeLeft] = useState(0);
  const [examStarted, setExamStarted] = useState(false);
  const [examFinished, setExamFinished] = useState(false);
  const [score, setScore] = useState(0);
  const [passed, setPassed] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      toast({ title: t('exams.loginRequired'), variant: 'destructive' });
      navigate('/auth');
      return;
    }
    fetchExam();
  }, [examId, user]);

  const fetchExam = async () => {
    if (!examId) return;
    try {
      const { data: examData, error: examError } = await supabase
        .from('exams')
        .select('*')
        .eq('id', examId)
        .eq('is_published', true)
        .single();

      if (examError || !examData) {
        toast({ title: t('exams.examNotFound'), variant: 'destructive' });
        navigate('/exams');
        return;
      }

      const { data: questionsData } = await supabase
        .from('exam_questions')
        .select('*')
        .eq('exam_id', examId)
        .order('order_index');

      setExam(examData);
      setQuestions((questionsData as ExamQuestion[]) || []);
      setTimeLeft(examData.duration_minutes * 60);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const submitExam = useCallback(async () => {
    if (examFinished || !exam || !user) return;
    setExamFinished(true);

    let correct = 0;
    questions.forEach((q) => {
      if (answers[q.id] === q.correct_answer) correct++;
    });

    const scorePercent = questions.length > 0 ? Math.round((correct / questions.length) * 100) : 0;
    const hasPassed = scorePercent >= exam.passing_score;

    setScore(scorePercent);
    setPassed(hasPassed);

    await supabase.from('exam_attempts').insert({
      user_id: user.id,
      exam_id: exam.id,
      score: scorePercent,
      passed: hasPassed,
      answers: answers as any,
    });
  }, [examFinished, exam, user, questions, answers]);

  // Timer
  useEffect(() => {
    if (!examStarted || examFinished || timeLeft <= 0) return;

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          submitExam();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [examStarted, examFinished, timeLeft, submitExam]);

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const handleSelectAnswer = (questionId: string, optionIndex: number) => {
    if (examFinished) return;
    setAnswers((prev) => ({ ...prev, [questionId]: optionIndex }));
  };

  const currentQuestion = questions[currentQuestionIndex];
  const progress = questions.length > 0 ? ((currentQuestionIndex + 1) / questions.length) * 100 : 0;

  if (loading) {
    return (
      <PageTransition>
        <div className="min-h-screen flex flex-col bg-gradient-to-br from-purple-50/50 via-white to-purple-100/30">
          <Navbar />
          <main className="flex-1 pt-24 flex items-center justify-center">
            <div className="animate-pulse text-primary text-xl font-bold">{t('common.loading')}</div>
          </main>
          <Footer />
        </div>
      </PageTransition>
    );
  }

  if (!exam) return null;

  // Pre-exam screen
  if (!examStarted && !examFinished) {
    return (
      <PageTransition>
        <div className="min-h-screen flex flex-col bg-gradient-to-br from-purple-50/50 via-white to-purple-100/30">
          <Navbar />
          <main className="flex-1 pt-24 pb-16">
            <div className="container mx-auto px-4 max-w-2xl">
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
                <Card className="border-primary/20 shadow-xl rounded-3xl overflow-hidden">
                  <CardHeader className="bg-gradient-to-br from-primary to-primary/80 text-primary-foreground p-8 text-center">
                    <CardTitle className="text-3xl font-black">{exam.title}</CardTitle>
                    {exam.description && <p className="text-primary-foreground/80 mt-2">{exam.description}</p>}
                  </CardHeader>
                  <CardContent className="p-8 space-y-6">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="bg-primary/5 rounded-2xl p-4 text-center">
                        <Clock className="h-6 w-6 text-primary mx-auto mb-2" />
                        <p className="text-sm text-muted-foreground">{t('exams.duration')}</p>
                        <p className="text-xl font-bold text-foreground">{exam.duration_minutes} {t('exams.minutes')}</p>
                      </div>
                      <div className="bg-primary/5 rounded-2xl p-4 text-center">
                        <CheckCircle className="h-6 w-6 text-primary mx-auto mb-2" />
                        <p className="text-sm text-muted-foreground">{t('exams.questionsCount')}</p>
                        <p className="text-xl font-bold text-foreground">{questions.length}</p>
                      </div>
                    </div>

                    <div className="bg-accent/10 rounded-2xl p-4 flex items-start gap-3">
                      <AlertTriangle className="h-5 w-5 text-accent mt-0.5 shrink-0" />
                      <p className="text-sm text-foreground/80">{t('exams.examWarning')}</p>
                    </div>

                    <Button
                      size="lg"
                      className="w-full bg-primary hover:bg-primary/90 text-primary-foreground text-lg py-7 rounded-2xl font-bold"
                      onClick={() => setExamStarted(true)}
                      disabled={questions.length === 0}
                    >
                      {t('exams.beginExam')}
                    </Button>

                    <Button variant="ghost" className="w-full" onClick={() => navigate('/exams')}>
                      <ArrowRight className="h-4 w-4 ml-2" />
                      {t('exams.backToExams')}
                    </Button>
                  </CardContent>
                </Card>
              </motion.div>
            </div>
          </main>
          <Footer />
        </div>
      </PageTransition>
    );
  }

  // Results screen
  if (examFinished) {
    return (
      <PageTransition>
        <div className="min-h-screen flex flex-col bg-gradient-to-br from-purple-50/50 via-white to-purple-100/30">
          <Navbar />
          <main className="flex-1 pt-24 pb-16">
            <div className="container mx-auto px-4 max-w-2xl">
              <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}>
                <Card className="border-primary/20 shadow-xl rounded-3xl overflow-hidden text-center">
                  <CardContent className="p-8 space-y-6">
                    <div className={`w-24 h-24 mx-auto rounded-full flex items-center justify-center ${passed ? 'bg-emerald-100' : 'bg-red-100'}`}>
                      {passed ? (
                        <CheckCircle className="h-12 w-12 text-emerald-600" />
                      ) : (
                        <XCircle className="h-12 w-12 text-red-600" />
                      )}
                    </div>

                    <h2 className="text-3xl font-black text-foreground">
                      {passed ? t('exams.congratulations') : t('exams.tryAgain')}
                    </h2>

                    <div className="text-6xl font-black text-primary">{score}%</div>

                    <Badge variant={passed ? 'default' : 'destructive'} className="text-lg px-6 py-2">
                      {passed ? t('exams.passed') : t('exams.failed')}
                    </Badge>

                    <p className="text-muted-foreground">
                      {t('exams.passingScore')}: {exam.passing_score}%
                    </p>

                    <div className="flex gap-4 justify-center pt-4">
                      <Button onClick={() => navigate('/exams')} variant="outline" className="rounded-xl">
                        {t('exams.backToExams')}
                      </Button>
                      <Button
                        onClick={() => {
                          setExamFinished(false);
                          setExamStarted(false);
                          setAnswers({});
                          setCurrentQuestionIndex(0);
                          setTimeLeft(exam.duration_minutes * 60);
                        }}
                        className="bg-primary hover:bg-primary/90 text-primary-foreground rounded-xl"
                      >
                        {t('exams.retakeExam')}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            </div>
          </main>
          <Footer />
        </div>
      </PageTransition>
    );
  }

  // Exam in progress
  return (
    <PageTransition>
      <div className="min-h-screen flex flex-col bg-gradient-to-br from-purple-50/50 via-white to-purple-100/30">
        <Navbar />
        <main className="flex-1 pt-24 pb-16">
          <div className="container mx-auto px-4 max-w-3xl">
            {/* Timer & Progress Bar */}
            <div className="mb-6 space-y-3">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-foreground">{exam.title}</h2>
                <Badge variant={timeLeft < 60 ? 'destructive' : 'secondary'} className="gap-1 text-lg px-4 py-1">
                  <Clock className="h-4 w-4" />
                  {formatTime(timeLeft)}
                </Badge>
              </div>
              <Progress value={progress} className="h-2" />
              <p className="text-sm text-muted-foreground text-center">
                {t('exams.question')} {currentQuestionIndex + 1} {t('exams.of')} {questions.length}
              </p>
            </div>

            {/* Question Card */}
            {currentQuestion && (
              <motion.div key={currentQuestion.id} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.3 }}>
              <Card className="border-primary/20 shadow-xl rounded-3xl">
                  <CardContent className="p-8 space-y-6">
                    <h3 className="text-xl font-bold text-foreground leading-relaxed">
                      {currentQuestion.question}
                    </h3>

                    {/* Audio playback */}
                    {currentQuestion.audio_url && (
                      <AudioPlayer src={currentQuestion.audio_url} />
                    )}

                    <div className="space-y-3">
                      {(currentQuestion.options as string[]).map((option, index) => (
                        <button
                          key={index}
                          onClick={() => handleSelectAnswer(currentQuestion.id, index)}
                          className={`w-full text-right p-4 rounded-2xl border-2 transition-all duration-200 ${
                            answers[currentQuestion.id] === index
                              ? 'border-primary bg-primary/10 text-primary font-bold'
                              : 'border-primary/10 hover:border-primary/30 hover:bg-primary/5 text-foreground'
                          }`}
                        >
                          <span className="inline-flex items-center gap-3">
                            <span className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                              answers[currentQuestion.id] === index
                                ? 'bg-primary text-primary-foreground'
                                : 'bg-primary/10 text-primary'
                            }`}>
                              {String.fromCharCode(65 + index)}
                            </span>
                            {option}
                          </span>
                        </button>
                      ))}
                    </div>

                    {/* Navigation */}
                    <div className="flex items-center justify-between pt-4">
                      <Button
                        variant="outline"
                        onClick={() => setCurrentQuestionIndex((prev) => Math.max(0, prev - 1))}
                        disabled={currentQuestionIndex === 0}
                        className="rounded-xl"
                      >
                        {t('common.previous')}
                      </Button>

                      {currentQuestionIndex < questions.length - 1 ? (
                        <Button
                          onClick={() => setCurrentQuestionIndex((prev) => prev + 1)}
                          className="bg-primary hover:bg-primary/90 text-primary-foreground rounded-xl"
                        >
                          {t('common.next')}
                        </Button>
                      ) : (
                        <Button
                          onClick={submitExam}
                          className="bg-accent hover:bg-accent/90 text-accent-foreground rounded-xl font-bold"
                        >
                          {t('exams.submitExam')}
                        </Button>
                      )}
                    </div>

                    {/* Question navigation dots */}
                    <div className="flex flex-wrap justify-center gap-2 pt-2">
                      {questions.map((q, i) => (
                        <button
                          key={q.id}
                          onClick={() => setCurrentQuestionIndex(i)}
                          className={`w-8 h-8 rounded-full text-xs font-bold transition-all ${
                            i === currentQuestionIndex
                              ? 'bg-primary text-primary-foreground scale-110'
                              : answers[q.id] !== undefined
                              ? 'bg-primary/20 text-primary'
                              : 'bg-muted text-muted-foreground'
                          }`}
                        >
                          {i + 1}
                        </button>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )}
          </div>
        </main>
        <Footer />
      </div>
    </PageTransition>
  );
};

export default ExamTake;
