import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Plus, Trash2, Edit, Gift, Megaphone, Loader2, Save, Languages } from 'lucide-react';

interface Offer {
  id: string;
  title: string;
  description: string | null;
  image_url: string | null;
  video_url: string | null;
  is_active: boolean;
  created_at: string;
}

const LANG_SUFFIXES = ['en', 'fr', 'ms', 'ur', 'id'];

const OffersManagement = () => {
  const { toast } = useToast();
  const [offers, setOffers] = useState<Offer[]>([]);
  const [loading, setLoading] = useState(true);
  const [showDialog, setShowDialog] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ id: '', title: '', description: '', image_url: '', video_url: '', is_active: true });

  // Announcement bar
  const [announcementText, setAnnouncementText] = useState('');
  const [announcementActive, setAnnouncementActive] = useState(false);
  const [savingAnnouncement, setSavingAnnouncement] = useState(false);
  const [translatingAnnouncement, setTranslatingAnnouncement] = useState(false);
  const [translatingOffer, setTranslatingOffer] = useState<string | null>(null);

  useEffect(() => {
    fetchOffers();
    fetchAnnouncement();
  }, []);

  const fetchOffers = async () => {
    setLoading(true);
    const { data } = await supabase.from('offers').select('*').order('created_at', { ascending: false });
    setOffers((data as Offer[]) || []);
    setLoading(false);
  };

  const fetchAnnouncement = async () => {
    const { data: textData } = await supabase.from('site_settings').select('value').eq('key', 'announcement_bar_text').single();
    const { data: activeData } = await supabase.from('site_settings').select('value').eq('key', 'announcement_bar_active').single();
    if (textData?.value) setAnnouncementText(textData.value);
    if (activeData?.value) setAnnouncementActive(activeData.value === 'true');
  };

  const saveAnnouncement = async () => {
    setSavingAnnouncement(true);
    for (const [key, value] of [['announcement_bar_text', announcementText], ['announcement_bar_active', String(announcementActive)]]) {
      const { data: existing } = await supabase.from('site_settings').select('id').eq('key', key).single();
      if (existing) {
        await supabase.from('site_settings').update({ value }).eq('key', key);
      } else {
        await supabase.from('site_settings').insert({ key, value });
      }
    }
    toast({ title: 'تم الحفظ', description: 'تم حفظ إعدادات شريط الإعلانات' });
    setSavingAnnouncement(false);
  };

  const translateAnnouncement = async () => {
    if (!announcementText.trim()) {
      toast({ title: 'خطأ', description: 'أدخل نص الإعلان أولاً', variant: 'destructive' });
      return;
    }
    setTranslatingAnnouncement(true);
    try {
      const { data, error } = await supabase.functions.invoke('translate-content', {
        body: { title: announcementText, description: '' },
      });
      if (error) throw error;

      // Save translations to site_settings
      for (const lang of LANG_SUFFIXES) {
        const key = `announcement_bar_text_${lang}`;
        const value = data?.translations?.[lang]?.title || '';
        if (value) {
          const { data: existing } = await supabase.from('site_settings').select('id').eq('key', key).single();
          if (existing) {
            await supabase.from('site_settings').update({ value }).eq('key', key);
          } else {
            await supabase.from('site_settings').insert({ key, value });
          }
        }
      }
      toast({ title: 'تمت الترجمة', description: 'تم ترجمة شريط الإعلانات لجميع اللغات' });
    } catch (e) {
      console.error(e);
      toast({ title: 'خطأ', description: 'فشلت الترجمة', variant: 'destructive' });
    }
    setTranslatingAnnouncement(false);
  };

  const translateOffer = async (offer: Offer) => {
    setTranslatingOffer(offer.id);
    try {
      const { data, error } = await supabase.functions.invoke('translate-content', {
        body: { title: offer.title, description: offer.description || '' },
      });
      if (error) throw error;

      // Save translations to site_settings using offer-specific keys
      for (const lang of LANG_SUFFIXES) {
        const titleKey = `offer_${offer.id}_title_${lang}`;
        const descKey = `offer_${offer.id}_desc_${lang}`;
        const titleVal = data?.translations?.[lang]?.title || '';
        const descVal = data?.translations?.[lang]?.description || '';
        
        for (const [key, value] of [[titleKey, titleVal], [descKey, descVal]]) {
          if (value) {
            const { data: existing } = await supabase.from('site_settings').select('id').eq('key', key).single();
            if (existing) {
              await supabase.from('site_settings').update({ value }).eq('key', key);
            } else {
              await supabase.from('site_settings').insert({ key, value });
            }
          }
        }
      }
      toast({ title: 'تمت الترجمة', description: `تم ترجمة العرض "${offer.title}" لجميع اللغات` });
    } catch (e) {
      console.error(e);
      toast({ title: 'خطأ', description: 'فشلت الترجمة', variant: 'destructive' });
    }
    setTranslatingOffer(null);
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const fileName = `${Date.now()}-${file.name}`;
    const { error } = await supabase.storage.from('offer-images').upload(fileName, file);
    if (error) { toast({ title: 'خطأ', description: 'فشل رفع الصورة', variant: 'destructive' }); return; }
    const { data: { publicUrl } } = supabase.storage.from('offer-images').getPublicUrl(fileName);
    setForm({ ...form, image_url: publicUrl });
  };

  const handleSave = async () => {
    if (!form.title) { toast({ title: 'خطأ', description: 'أدخل عنوان العرض', variant: 'destructive' }); return; }
    setSaving(true);
    const payload = { title: form.title, description: form.description || null, image_url: form.image_url || null, video_url: form.video_url || null, is_active: form.is_active };
    if (form.id) {
      await supabase.from('offers').update(payload).eq('id', form.id);
    } else {
      await supabase.from('offers').insert(payload);
    }
    toast({ title: 'تم بنجاح' });
    setShowDialog(false);
    fetchOffers();
    setSaving(false);
  };

  const handleDelete = async (id: string) => {
    await supabase.from('offers').delete().eq('id', id);
    toast({ title: 'تم الحذف' });
    fetchOffers();
  };

  const openNew = () => { setForm({ id: '', title: '', description: '', image_url: '', video_url: '', is_active: true }); setShowDialog(true); };
  const openEdit = (o: Offer) => { setForm({ id: o.id, title: o.title, description: o.description || '', image_url: o.image_url || '', video_url: o.video_url || '', is_active: o.is_active }); setShowDialog(true); };

  return (
    <div className="space-y-6">
      {/* Announcement Bar Settings */}
      <Card className="bg-white border-primary/10">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Megaphone className="h-5 w-5 text-red-500" />
            شريط الإعلانات
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-3">
            <Switch checked={announcementActive} onCheckedChange={setAnnouncementActive} />
            <Label>{announcementActive ? 'مفعّل' : 'معطّل'}</Label>
          </div>
          <Input
            value={announcementText}
            onChange={(e) => setAnnouncementText(e.target.value)}
            placeholder="نص الإعلان الذي سيظهر في الشريط..."
            className="rounded-xl h-12"
          />
          <div className="flex gap-2">
            <Button onClick={saveAnnouncement} disabled={savingAnnouncement} className="gap-2 rounded-xl">
              {savingAnnouncement ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
              حفظ الإعلان
            </Button>
            <Button onClick={translateAnnouncement} disabled={translatingAnnouncement || !announcementText.trim()} variant="outline" className="gap-2 rounded-xl">
              {translatingAnnouncement ? <Loader2 className="h-4 w-4 animate-spin" /> : <Languages className="h-4 w-4" />}
              ترجمة لجميع اللغات
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Offers List */}
      <Card className="bg-white border-primary/10">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Gift className="h-5 w-5 text-accent" />
              العروض ({offers.length})
            </CardTitle>
            <Button onClick={openNew} className="gap-2 rounded-xl" variant="gold">
              <Plus className="h-4 w-4" />
              عرض جديد
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8"><Loader2 className="h-6 w-6 animate-spin mx-auto" /></div>
          ) : offers.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">لا توجد عروض</p>
          ) : (
            <div className="space-y-3">
              {offers.map(offer => (
                <div key={offer.id} className="flex items-center justify-between p-4 rounded-xl bg-muted/30 border">
                  <div className="flex items-center gap-4">
                    {offer.image_url && <img src={offer.image_url} alt="" className="w-16 h-16 rounded-lg object-cover" />}
                    <div>
                      <h4 className="font-bold">{offer.title}</h4>
                      <p className="text-sm text-muted-foreground line-clamp-1">{offer.description}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant={offer.is_active ? 'default' : 'secondary'}>{offer.is_active ? 'نشط' : 'معطل'}</Badge>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => translateOffer(offer)}
                      disabled={translatingOffer === offer.id}
                      className="gap-1"
                    >
                      {translatingOffer === offer.id ? <Loader2 className="h-3 w-3 animate-spin" /> : <Languages className="h-3 w-3" />}
                      ترجمة
                    </Button>
                    <Button size="icon" variant="ghost" onClick={() => openEdit(offer)}><Edit className="h-4 w-4" /></Button>
                    <Button size="icon" variant="ghost" className="text-destructive" onClick={() => handleDelete(offer.id)}><Trash2 className="h-4 w-4" /></Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Dialog */}
      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{form.id ? 'تعديل العرض' : 'عرض جديد'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div><Label className="font-bold">عنوان العرض *</Label><Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} className="rounded-xl h-12 mt-1" /></div>
            <div><Label className="font-bold">وصف العرض</Label><Textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={3} className="rounded-xl mt-1" /></div>
            <div>
              <Label className="font-bold">صورة العرض</Label>
              {form.image_url && <img src={form.image_url} alt="" className="w-full h-32 object-cover rounded-xl mt-2 mb-2" />}
              <Input type="file" accept="image/*" onChange={handleImageUpload} className="mt-1" />
            </div>
            <div><Label className="font-bold">رابط فيديو (اختياري)</Label><Input value={form.video_url} onChange={(e) => setForm({ ...form, video_url: e.target.value })} placeholder="https://..." dir="ltr" className="rounded-xl h-12 mt-1" /></div>
            <div className="flex items-center gap-3">
              <Switch checked={form.is_active} onCheckedChange={(v) => setForm({ ...form, is_active: v })} />
              <Label>نشط</Label>
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

export default OffersManagement;
