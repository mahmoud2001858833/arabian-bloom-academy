import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useChat } from '@ai-sdk/react';
import { DefaultChatTransport, type UIMessage } from 'ai';
import { ArrowRight, Plus, Trash2, Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import Navbar from '@/components/layout/Navbar';
import {
  Conversation, ConversationContent, ConversationEmptyState, ConversationScrollButton,
} from '@/components/ai-elements/conversation';
import { Message, MessageContent, MessageResponse } from '@/components/ai-elements/message';
import {
  PromptInput, PromptInputFooter, PromptInputSubmit, PromptInputTextarea, type PromptInputMessage,
} from '@/components/ai-elements/prompt-input';
import { Shimmer } from '@/components/ai-elements/shimmer';
import advisorLogo from '@/assets/ads-advisor-logo.png';

interface Thread { id: string; title: string; updated_at: string }

const SUGGESTIONS = [
  'ضع لي خطة إعلانات فيسبوك لشهر كامل بميزانية 300 دولار',
  'ما أفضل جمهور مستهدف لكورس صعوبات القراءة؟',
  'اكتب لي 3 نصوص إعلانية لكتاب من كتب المنصة',
  'كيف أضبط Pixel و Conversions API لقياس المبيعات؟',
];

const FN_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/ads-advisor`;

function ChatWindow({ threadId, initialMessages, onActivity }: { threadId: string; initialMessages: UIMessage[]; onActivity: () => void }) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const transport = useMemo(() => new DefaultChatTransport({
    api: FN_URL,
    body: { threadId },
    headers: async () => {
      const { data } = await supabase.auth.getSession();
      return {
        apikey: import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
        Authorization: `Bearer ${data.session?.access_token ?? ''}`,
      };
    },
  }), [threadId]);

  const { messages, sendMessage, status, stop } = useChat({
    id: threadId,
    messages: initialMessages,
    transport,
    onError: (err) => {
      let msg = err.message;
      try { msg = JSON.parse(err.message).error ?? msg; } catch { /* plain text */ }
      toast({ title: 'تعذّر الحصول على رد', description: msg, variant: 'destructive' });
    },
    onFinish: () => { onActivity(); textareaRef.current?.focus(); },
  });

  const busy = status === 'submitted' || status === 'streaming';
  useEffect(() => { textareaRef.current?.focus(); }, []);

  const send = (text: string) => {
    if (!text.trim() || busy) return;
    sendMessage({ text: text.trim() });
    onActivity();
  };

  return (
    <div className="flex flex-col h-full">
      <Conversation className="flex-1">
        <ConversationContent className="max-w-3xl mx-auto w-full">
          {messages.length === 0 ? (
            <ConversationEmptyState>
              <img src={advisorLogo} alt="مستشار الإعلانات" width={96} height={96} className="w-24 h-24 mb-2" />
              <h2 className="text-xl font-bold text-foreground">مستشارك الإعلاني جاهز</h2>
              <p className="text-muted-foreground text-sm mb-4">يعرف كورساتك وكتبك وعروضك ومبيعاتك، وخبير بإعلانات فيسبوك وإنستغرام وجوجل وتيك توك.</p>
              <div className="grid sm:grid-cols-2 gap-2 w-full max-w-xl">
                {SUGGESTIONS.map((s) => (
                  <button key={s} type="button" onClick={() => send(s)}
                    className="text-start text-sm p-3 rounded-xl border border-primary/20 bg-card hover:border-accent hover:bg-accent/10 transition-colors">
                    ۞ {s}
                  </button>
                ))}
              </div>
            </ConversationEmptyState>
          ) : messages.map((m) => (
            <Message key={m.id} from={m.role}>
              <MessageContent className={m.role === 'user' ? 'bg-primary text-primary-foreground' : ''}>
                {m.parts.map((p, i) => p.type === 'text'
                  ? (m.role === 'assistant'
                    ? <MessageResponse key={i}>{p.text}</MessageResponse>
                    : <p key={i} className="whitespace-pre-wrap">{p.text}</p>)
                  : null)}
              </MessageContent>
            </Message>
          ))}
          {status === 'submitted' && (
            <div className="flex items-center gap-2 px-1">
              <img src={advisorLogo} alt="" width={24} height={24} className="w-6 h-6" />
              <Shimmer>يفكّر المستشار ويحلّل بيانات المنصة...</Shimmer>
            </div>
          )}
        </ConversationContent>
        <ConversationScrollButton />
      </Conversation>
      <div className="p-3 border-t border-border bg-background">
        <PromptInput className="max-w-3xl mx-auto" onSubmit={(msg: PromptInputMessage) => send(msg.text)}>
          <PromptInputTextarea ref={textareaRef} placeholder="اسأل عن خطة، جمهور، ميزانية، نص إعلاني..." />
          <PromptInputFooter className="justify-end">
            <PromptInputSubmit status={status} onStop={stop} />
          </PromptInputFooter>
        </PromptInput>
      </div>
    </div>
  );
}

export default function AdsAdvisor() {
  const { threadId } = useParams();
  const navigate = useNavigate();
  const { user, isAdmin, loading } = useAuth();
  const [threads, setThreads] = useState<Thread[]>([]);
  const [initialMessages, setInitialMessages] = useState<UIMessage[] | null>(null);
  const creating = useRef(false);

  const loadThreads = useCallback(async () => {
    const { data, error } = await supabase.from('ad_advisor_threads').select('id, title, updated_at').order('updated_at', { ascending: false });
    if (error) { toast({ title: 'خطأ في تحميل المحادثات', description: error.message, variant: 'destructive' }); return []; }
    setThreads(data ?? []);
    return data ?? [];
  }, []);

  const createThread = useCallback(async () => {
    if (!user || creating.current) return;
    creating.current = true;
    const { data, error } = await supabase.from('ad_advisor_threads').insert({ user_id: user.id }).select('id').single();
    creating.current = false;
    if (error) { toast({ title: 'تعذّر إنشاء محادثة', description: error.message, variant: 'destructive' }); return; }
    navigate(`/admin/ads-advisor/${data.id}`);
  }, [user, navigate]);

  useEffect(() => {
    if (loading) return;
    if (!user || !isAdmin) { navigate('/'); return; }
    loadThreads().then((list) => {
      if (!threadId) {
        if (list.length) navigate(`/admin/ads-advisor/${list[0].id}`, { replace: true });
        else createThread();
      }
    });
  }, [loading, user, isAdmin, threadId, loadThreads, navigate, createThread]);

  useEffect(() => {
    if (!threadId || !isAdmin) return;
    setInitialMessages(null);
    supabase.from('ad_advisor_messages').select('message_id, role, parts').eq('thread_id', threadId).order('created_at')
      .then(({ data, error }) => {
        if (error) toast({ title: 'خطأ في تحميل الرسائل', description: error.message, variant: 'destructive' });
        setInitialMessages((data ?? []).map((r) => ({ id: r.message_id, role: r.role as UIMessage['role'], parts: r.parts as UIMessage['parts'] })));
      });
  }, [threadId, isAdmin]);

  const deleteThread = async (id: string) => {
    const { error } = await supabase.from('ad_advisor_threads').delete().eq('id', id);
    if (error) { toast({ title: 'تعذّر الحذف', description: error.message, variant: 'destructive' }); return; }
    const rest = threads.filter((t) => t.id !== id);
    setThreads(rest);
    if (id === threadId) {
      if (rest.length) navigate(`/admin/ads-advisor/${rest[0].id}`); else createThread();
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col" dir="rtl">
      <Navbar />
      <div className="flex-1 flex pt-20 h-screen">
        <aside className="w-64 shrink-0 border-e border-border bg-card hidden md:flex flex-col">
          <div className="p-3 flex items-center gap-2 border-b border-border">
            <img src={advisorLogo} alt="مستشار الإعلانات" width={36} height={36} className="w-9 h-9" />
            <div className="font-bold text-foreground text-sm">مستشار الإعلانات الذكي</div>
          </div>
          <div className="p-3 space-y-2">
            <Button onClick={createThread} className="w-full gap-2"><Plus className="h-4 w-4" />محادثة جديدة</Button>
            <Button variant="ghost" onClick={() => navigate('/admin')} className="w-full gap-2 text-muted-foreground"><ArrowRight className="h-4 w-4" />لوحة التحكم</Button>
          </div>
          <nav className="flex-1 overflow-y-auto px-2 pb-3 space-y-1">
            {threads.map((t) => (
              <div key={t.id} className={`group flex items-center rounded-lg ${t.id === threadId ? 'bg-primary/10 text-primary' : 'hover:bg-muted text-foreground'}`}>
                <button type="button" onClick={() => navigate(`/admin/ads-advisor/${t.id}`)} className="flex-1 text-start text-sm px-3 py-2 truncate">{t.title}</button>
                <button type="button" aria-label="حذف" onClick={() => deleteThread(t.id)} className="p-2 opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-destructive">
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            ))}
          </nav>
        </aside>
        <main className="flex-1 min-w-0">
          {threadId && initialMessages ? (
            <ChatWindow key={threadId} threadId={threadId} initialMessages={initialMessages} onActivity={loadThreads} />
          ) : (
            <div className="h-full flex items-center justify-center"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>
          )}
        </main>
      </div>
    </div>
  );
}
