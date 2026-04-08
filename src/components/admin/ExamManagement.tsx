import { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, Eye, EyeOff, Save, X, HelpCircle, Users } from 'lucide-react';
import AudioRecorder from '@/components/admin/AudioRecorder';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface Exam {
  id: string;
  title: string;
  description: string | null;
  duration_minutes: number;
  passing_score: number;
  is_published: boolean;
  created_at: string;
}

interface ExamQuestion {
  id: string;
  exam_id: string;
  question: string;
  options: string[];
  correct_answer: number;
  order_index: number;
  audio_url?: string | null;
}

interface ExamAttempt {
  id: string;
  user_id: string;
  exam_id: string;
  score: number;
  passed: boolean;
  completed_at: string;
}

const ExamManagement = () => {
  const { toast } = useToast();
  const [exams, setExams] = useState<Exam[]>([]);
  const [selectedExam, setSelectedExam] = useState<Exam | null>(null);
  const [questions, setQuestions] = useState<ExamQuestion[]>([]);
  const [attempts, setAttempts] = useState<ExamAttempt[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Dialog states
  const [showExamDialog, setShowExamDialog] = useState(false);
  const [showQuestionsDialog, setShowQuestionsDialog] = useState(false);
  const [showAttemptsDialog, setShowAttemptsDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [deleteExamId, setDeleteExamId] = useState<string | null>(null);

  // Form
  const [examForm, setExamForm] = useState({
    id: '',
    title: '',
    description: '',
    duration_minutes: 30,
    passing_score: 70,
    is_published: false,
  });

  const [editQuestions, setEditQuestions] = useState<ExamQuestion[]>([]);

  useEffect(() => {
    fetchExams();
  }, []);

  const fetchExams = async () => {
    setIsLoading(true);
    const { data, error } = await supabase
      .from('exams')
      .select('*')
      .order('created_at', { ascending: false });

    if (!error) setExams(data || []);
    setIsLoading(false);
  };

  const handleSaveExam = async () => {
    setIsLoading(true);
    const payload = {
      title: examForm.title,
      description: examForm.description || null,
      duration_minutes: examForm.duration_minutes,
      passing_score: examForm.passing_score,
      is_published: examForm.is_published,
    };

    if (examForm.id) {
      const { error } = await supabase.from('exams').update(payload).eq('id', examForm.id);
      if (error) {
        toast({ title: 'خطأ', description: 'فشل في تحديث الامتحان', variant: 'destructive' });
      } else {
        toast({ title: 'تم بنجاح', description: 'تم تحديث الامتحان' });
      }
    } else {
      const { error } = await supabase.from('exams').insert(payload);
      if (error) {
        toast({ title: 'خطأ', description: 'فشل في إنشاء الامتحان', variant: 'destructive' });
      } else {
        toast({ title: 'تم بنجاح', description: 'تم إنشاء الامتحان' });
      }
    }

    fetchExams();
    setShowExamDialog(false);
    setIsLoading(false);
  };

  const handleDeleteExam = async () => {
    if (!deleteExamId) return;
    const { error } = await supabase.from('exams').delete().eq('id', deleteExamId);
    if (error) {
      toast({ title: 'خطأ', description: 'فشل في حذف الامتحان', variant: 'destructive' });
    } else {
      toast({ title: 'تم بنجاح', description: 'تم حذف الامتحان' });
      fetchExams();
      if (selectedExam?.id === deleteExamId) setSelectedExam(null);
    }
    setShowDeleteDialog(false);
    setDeleteExamId(null);
  };

  const togglePublish = async (exam: Exam) => {
    const { error } = await supabase.from('exams').update({ is_published: !exam.is_published }).eq('id', exam.id);
    if (!error) {
      fetchExams();
      toast({ title: 'تم بنجاح', description: exam.is_published ? 'تم إلغاء النشر' : 'تم النشر' });
    }
  };

  const openNewExam = () => {
    setExamForm({ id: '', title: '', description: '', duration_minutes: 30, passing_score: 70, is_published: false });
    setShowExamDialog(true);
  };

  const openEditExam = (exam: Exam) => {
    setExamForm({
      id: exam.id,
      title: exam.title,
      description: exam.description || '',
      duration_minutes: exam.duration_minutes,
      passing_score: exam.passing_score,
      is_published: exam.is_published,
    });
    setShowExamDialog(true);
  };

  const openQuestions = async (exam: Exam) => {
    setSelectedExam(exam);
    const { data } = await supabase
      .from('exam_questions')
      .select('*')
      .eq('exam_id', exam.id)
      .order('order_index');

    setEditQuestions((data || []).map(q => ({
      ...q,
      options: Array.isArray(q.options) ? q.options : [],
      audio_url: (q as any).audio_url || null,
    })) as ExamQuestion[]);
    setShowQuestionsDialog(true);
  };

  const addNewQuestion = () => {
    setEditQuestions([
      ...editQuestions,
      {
        id: `new-${Date.now()}`,
        exam_id: selectedExam?.id || '',
        question: '',
        options: ['', '', '', ''],
        correct_answer: 0,
        order_index: editQuestions.length,
        audio_url: null,
      },
    ]);
  };

  const updateQuestion = (index: number, field: string, value: any) => {
    const updated = [...editQuestions];
    (updated[index] as any)[field] = value;
    setEditQuestions(updated);
  };

  const updateOption = (qIndex: number, oIndex: number, value: string) => {
    const updated = [...editQuestions];
    const options = [...updated[qIndex].options];
    const current = options[oIndex];
    if (typeof current === 'object' && current !== null) {
      options[oIndex] = { ...(current as any), text: value };
    } else {
      options[oIndex] = value;
    }
    updated[qIndex].options = options;
    setEditQuestions(updated);
  };

  const updateOptionAudio = (qIndex: number, oIndex: number, audioUrl: string | null) => {
    const updated = [...editQuestions];
    const options = [...updated[qIndex].options];
    const current = options[oIndex];
    const text = typeof current === 'string' ? current : (current as any)?.text || '';
    if (audioUrl) {
      options[oIndex] = { text, audio_url: audioUrl } as any;
    } else {
      options[oIndex] = text;
    }
    updated[qIndex].options = options;
    setEditQuestions(updated);
  };

  const removeQuestion = (index: number) => {
    setEditQuestions(editQuestions.filter((_, i) => i !== index));
  };

  const saveQuestions = async () => {
    if (!selectedExam) return;
    setIsLoading(true);

    // Delete old questions
    await supabase.from('exam_questions').delete().eq('exam_id', selectedExam.id);

    // Insert new ones
    const questionsToInsert = editQuestions.map((q, i) => ({
      exam_id: selectedExam.id,
      question: q.question,
      options: q.options,
      correct_answer: q.correct_answer,
      order_index: i,
      audio_url: q.audio_url || null,
    }));

    if (questionsToInsert.length > 0) {
      const { error } = await supabase.from('exam_questions').insert(questionsToInsert);
      if (error) {
        toast({ title: 'خطأ', description: 'فشل في حفظ الأسئلة', variant: 'destructive' });
      } else {
        toast({ title: 'تم بنجاح', description: 'تم حفظ الأسئلة' });
      }
    }

    setShowQuestionsDialog(false);
    setIsLoading(false);
  };

  const openAttempts = async (exam: Exam) => {
    setSelectedExam(exam);
    const { data } = await supabase
      .from('exam_attempts')
      .select('*')
      .eq('exam_id', exam.id)
      .order('completed_at', { ascending: false });

    setAttempts((data as ExamAttempt[]) || []);
    setShowAttemptsDialog(true);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-black text-foreground">إدارة الامتحانات</h2>
        <Button onClick={openNewExam} className="gap-2 bg-primary hover:bg-primary/90 text-primary-foreground rounded-xl">
          <Plus className="h-4 w-4" />
          امتحان جديد
        </Button>
      </div>

      {/* Exams Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {exams.map((exam) => (
          <motion.div key={exam.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
            <Card className="border-primary/10 hover:shadow-lg transition-all">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <CardTitle className="text-lg font-bold">{exam.title}</CardTitle>
                  <Badge variant={exam.is_published ? 'default' : 'secondary'}>
                    {exam.is_published ? 'منشور' : 'مسودة'}
                  </Badge>
                </div>
                {exam.description && (
                  <p className="text-sm text-muted-foreground line-clamp-2">{exam.description}</p>
                )}
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex gap-4 text-sm text-muted-foreground">
                  <span>⏱️ {exam.duration_minutes} دقيقة</span>
                  <span>🎯 {exam.passing_score}%</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  <Button size="sm" variant="outline" onClick={() => openEditExam(exam)} className="gap-1 rounded-lg">
                    <Edit className="h-3 w-3" /> تعديل
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => openQuestions(exam)} className="gap-1 rounded-lg">
                    <HelpCircle className="h-3 w-3" /> الأسئلة
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => openAttempts(exam)} className="gap-1 rounded-lg">
                    <Users className="h-3 w-3" /> النتائج
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => togglePublish(exam)} className="gap-1 rounded-lg">
                    {exam.is_published ? <EyeOff className="h-3 w-3" /> : <Eye className="h-3 w-3" />}
                    {exam.is_published ? 'إلغاء النشر' : 'نشر'}
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    className="gap-1 rounded-lg text-destructive hover:text-destructive"
                    onClick={() => { setDeleteExamId(exam.id); setShowDeleteDialog(true); }}
                  >
                    <Trash2 className="h-3 w-3" /> حذف
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {exams.length === 0 && !isLoading && (
        <div className="text-center py-12 text-muted-foreground">
          <HelpCircle className="h-12 w-12 mx-auto mb-4 text-primary/30" />
          <p className="text-lg font-bold">لا توجد امتحانات بعد</p>
          <p>أنشئ أول امتحان لبدء اختبار الطلاب</p>
        </div>
      )}

      {/* Exam Dialog */}
      <Dialog open={showExamDialog} onOpenChange={setShowExamDialog}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{examForm.id ? 'تعديل الامتحان' : 'امتحان جديد'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>عنوان الامتحان</Label>
              <Input value={examForm.title} onChange={(e) => setExamForm({ ...examForm, title: e.target.value })} placeholder="أدخل عنوان الامتحان" />
            </div>
            <div>
              <Label>الوصف</Label>
              <Textarea value={examForm.description} onChange={(e) => setExamForm({ ...examForm, description: e.target.value })} placeholder="وصف الامتحان (اختياري)" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>المدة (دقيقة)</Label>
                <Input type="number" value={examForm.duration_minutes} onChange={(e) => setExamForm({ ...examForm, duration_minutes: parseInt(e.target.value) || 30 })} />
              </div>
              <div>
                <Label>نسبة النجاح (%)</Label>
                <Input type="number" value={examForm.passing_score} onChange={(e) => setExamForm({ ...examForm, passing_score: parseInt(e.target.value) || 70 })} />
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Switch checked={examForm.is_published} onCheckedChange={(checked) => setExamForm({ ...examForm, is_published: checked })} />
              <Label>نشر الامتحان</Label>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowExamDialog(false)}>إلغاء</Button>
            <Button onClick={handleSaveExam} disabled={!examForm.title || isLoading} className="bg-primary hover:bg-primary/90 text-primary-foreground">
              <Save className="h-4 w-4 ml-2" />
              حفظ
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Questions Dialog */}
      <Dialog open={showQuestionsDialog} onOpenChange={setShowQuestionsDialog}>
        <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>أسئلة الامتحان: {selectedExam?.title}</DialogTitle>
            <DialogDescription>أضف أو عدّل الأسئلة متعددة الخيارات</DialogDescription>
          </DialogHeader>
          <div className="space-y-6">
            {editQuestions.map((q, qIndex) => (
              <Card key={q.id} className="border-primary/10">
                <CardContent className="p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <Label className="font-bold">السؤال {qIndex + 1}</Label>
                    <Button size="sm" variant="ghost" onClick={() => removeQuestion(qIndex)} className="text-destructive">
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                  <Input
                    value={q.question}
                    onChange={(e) => updateQuestion(qIndex, 'question', e.target.value)}
                    placeholder="اكتب السؤال هنا"
                  />
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-muted-foreground">أو أضف تسجيل صوتي:</span>
                    <AudioRecorder
                      audioUrl={q.audio_url || null}
                      onAudioChange={(url) => updateQuestion(qIndex, 'audio_url', url)}
                    />
                  </div>
                  <div className="grid grid-cols-1 gap-3">
                    {q.options.map((opt, oIndex) => (
                      <div key={oIndex} className="flex items-center gap-2 p-2 rounded-xl border border-primary/10 bg-muted/30">
                        <input
                          type="radio"
                          name={`correct-${q.id}`}
                          checked={q.correct_answer === oIndex}
                          onChange={() => updateQuestion(qIndex, 'correct_answer', oIndex)}
                          className="accent-primary"
                        />
                        <div className="flex-1 space-y-2">
                          <Input
                            value={typeof opt === 'string' ? opt : (opt as any)?.text || ''}
                            onChange={(e) => updateOption(qIndex, oIndex, e.target.value)}
                            placeholder={`الخيار ${oIndex + 1} (نص)`}
                          />
                          <div className="flex items-center gap-2">
                            <span className="text-xs text-muted-foreground">أو تسجيل صوتي:</span>
                            <AudioRecorder
                              audioUrl={typeof opt === 'object' && opt !== null ? (opt as any).audio_url || null : null}
                              onAudioChange={(url) => updateOptionAudio(qIndex, oIndex, url)}
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}

            <Button variant="outline" onClick={addNewQuestion} className="w-full gap-2 rounded-xl border-dashed">
              <Plus className="h-4 w-4" />
              إضافة سؤال جديد
            </Button>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowQuestionsDialog(false)}>إلغاء</Button>
            <Button onClick={saveQuestions} disabled={isLoading} className="bg-primary hover:bg-primary/90 text-primary-foreground">
              <Save className="h-4 w-4 ml-2" />
              حفظ الأسئلة
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Attempts Dialog */}
      <Dialog open={showAttemptsDialog} onOpenChange={setShowAttemptsDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>نتائج الطلاب: {selectedExam?.title}</DialogTitle>
          </DialogHeader>
          {attempts.length === 0 ? (
            <p className="text-center py-8 text-muted-foreground">لا توجد محاولات بعد</p>
          ) : (
            <div className="space-y-2 max-h-[60vh] overflow-y-auto">
              {attempts.map((attempt) => (
                <div key={attempt.id} className="flex items-center justify-between p-3 rounded-xl bg-muted/50">
                  <div className="flex items-center gap-3">
                    <Badge variant={attempt.passed ? 'default' : 'destructive'}>
                      {attempt.passed ? 'ناجح' : 'راسب'}
                    </Badge>
                    <span className="font-bold">{attempt.score}%</span>
                  </div>
                  <span className="text-sm text-muted-foreground">
                    {new Date(attempt.completed_at).toLocaleDateString('ar-SA')}
                  </span>
                </div>
              ))}
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>تأكيد الحذف</DialogTitle>
            <DialogDescription>هل أنت متأكد من حذف هذا الامتحان؟ سيتم حذف جميع الأسئلة والنتائج المرتبطة به.</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDeleteDialog(false)}>إلغاء</Button>
            <Button variant="destructive" onClick={handleDeleteExam}>حذف</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ExamManagement;
