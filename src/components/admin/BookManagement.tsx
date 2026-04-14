import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Plus, Trash2, Edit, BookOpen, Loader2, Save, Upload } from 'lucide-react';

interface Book {
  id: string;
  title: string;
  description: string | null;
  price: number;
  currency: string;
  pdf_url: string | null;
  cover_image_url: string | null;
  is_published: boolean;
  created_at: string;
}

const BookManagement = () => {
  const { toast } = useToast();
  const [books, setBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(true);
  const [showDialog, setShowDialog] = useState(false);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [form, setForm] = useState({ id: '', title: '', description: '', price: 0, currency: 'USD', pdf_url: '', cover_image_url: '', is_published: false });

  useEffect(() => { fetchBooks(); }, []);

  const fetchBooks = async () => {
    setLoading(true);
    const { data } = await supabase.from('books').select('*').order('created_at', { ascending: false });
    setBooks((data as Book[]) || []);
    setLoading(false);
  };

  const handleCoverUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const fileName = `${Date.now()}-${file.name}`;
    const { error } = await supabase.storage.from('book-covers').upload(fileName, file);
    if (error) { toast({ title: 'خطأ', description: 'فشل رفع الغلاف', variant: 'destructive' }); return; }
    const { data: { publicUrl } } = supabase.storage.from('book-covers').getPublicUrl(fileName);
    setForm({ ...form, cover_image_url: publicUrl });
  };

  const handlePdfUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || file.type !== 'application/pdf') { toast({ title: 'خطأ', description: 'اختر ملف PDF', variant: 'destructive' }); return; }
    setUploading(true);
    const fileName = `${Date.now()}-${file.name}`;
    const { error } = await supabase.storage.from('book-files').upload(fileName, file);
    if (error) { toast({ title: 'خطأ', description: 'فشل رفع الكتاب', variant: 'destructive' }); setUploading(false); return; }
    setForm({ ...form, pdf_url: fileName });
    toast({ title: 'تم رفع الكتاب' });
    setUploading(false);
  };

  const handleSave = async () => {
    if (!form.title) { toast({ title: 'خطأ', description: 'أدخل عنوان الكتاب', variant: 'destructive' }); return; }
    setSaving(true);
    const payload = { title: form.title, description: form.description || null, price: form.price, currency: form.currency, pdf_url: form.pdf_url || null, cover_image_url: form.cover_image_url || null, is_published: form.is_published };
    if (form.id) {
      await supabase.from('books').update(payload).eq('id', form.id);
    } else {
      await supabase.from('books').insert(payload);
    }
    toast({ title: 'تم بنجاح' });
    setShowDialog(false);
    fetchBooks();
    setSaving(false);
  };

  const handleDelete = async (id: string) => {
    await supabase.from('books').delete().eq('id', id);
    toast({ title: 'تم الحذف' });
    fetchBooks();
  };

  const openNew = () => { setForm({ id: '', title: '', description: '', price: 0, currency: 'USD', pdf_url: '', cover_image_url: '', is_published: false }); setShowDialog(true); };
  const openEdit = (b: Book) => { setForm({ id: b.id, title: b.title, description: b.description || '', price: b.price, currency: b.currency, pdf_url: b.pdf_url || '', cover_image_url: b.cover_image_url || '', is_published: b.is_published }); setShowDialog(true); };

  return (
    <div className="space-y-6">
      <Card className="bg-white border-primary/10">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2 text-lg">
              <BookOpen className="h-5 w-5 text-primary" />
              الكتب الرقمية ({books.length})
            </CardTitle>
            <Button onClick={openNew} className="gap-2 rounded-xl" variant="gold">
              <Plus className="h-4 w-4" />
              كتاب جديد
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8"><Loader2 className="h-6 w-6 animate-spin mx-auto" /></div>
          ) : books.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">لا توجد كتب</p>
          ) : (
            <div className="space-y-3">
              {books.map(book => (
                <div key={book.id} className="flex items-center justify-between p-4 rounded-xl bg-muted/30 border">
                  <div className="flex items-center gap-4">
                    {book.cover_image_url && <img src={book.cover_image_url} alt="" className="w-12 h-16 rounded-lg object-cover" />}
                    <div>
                      <h4 className="font-bold">{book.title}</h4>
                      <p className="text-sm text-muted-foreground">{book.price} {book.currency === 'JOD' ? 'د.أ' : '$'}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant={book.is_published ? 'default' : 'secondary'}>{book.is_published ? 'منشور' : 'مسودة'}</Badge>
                    <Button size="icon" variant="ghost" onClick={() => openEdit(book)}><Edit className="h-4 w-4" /></Button>
                    <Button size="icon" variant="ghost" className="text-destructive" onClick={() => handleDelete(book.id)}><Trash2 className="h-4 w-4" /></Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader><DialogTitle>{form.id ? 'تعديل الكتاب' : 'كتاب جديد'}</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div><Label className="font-bold">عنوان الكتاب *</Label><Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} className="rounded-xl h-12 mt-1" /></div>
            <div><Label className="font-bold">وصف الكتاب</Label><Textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={3} className="rounded-xl mt-1" /></div>
            <div className="grid grid-cols-2 gap-3">
              <div><Label className="font-bold">السعر</Label><Input type="number" value={form.price} onChange={(e) => setForm({ ...form, price: Number(e.target.value) })} className="rounded-xl h-12 mt-1" /></div>
              <div>
                <Label className="font-bold">العملة</Label>
                <Select value={form.currency} onValueChange={(v) => setForm({ ...form, currency: v })}>
                  <SelectTrigger className="rounded-xl h-12 mt-1"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="USD">دولار (USD)</SelectItem>
                    <SelectItem value="JOD">دينار (JOD)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div>
              <Label className="font-bold">صورة الغلاف</Label>
              {form.cover_image_url && <img src={form.cover_image_url} alt="" className="w-full h-32 object-cover rounded-xl mt-2 mb-2" />}
              <Input type="file" accept="image/*" onChange={handleCoverUpload} className="mt-1" />
            </div>
            <div>
              <Label className="font-bold">ملف PDF</Label>
              {form.pdf_url && <p className="text-sm text-emerald-600 mt-1">✓ تم رفع الملف</p>}
              <div className="flex items-center gap-2 mt-1">
                <Input type="file" accept=".pdf" onChange={handlePdfUpload} disabled={uploading} />
                {uploading && <Loader2 className="h-4 w-4 animate-spin" />}
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Switch checked={form.is_published} onCheckedChange={(v) => setForm({ ...form, is_published: v })} />
              <Label>نشر الكتاب</Label>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDialog(false)} className="rounded-xl">إلغاء</Button>
            <Button onClick={handleSave} disabled={saving} className="rounded-xl gap-2">
              {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
              حفظ
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default BookManagement;
