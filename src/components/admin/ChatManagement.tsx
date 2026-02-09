import { useState, useEffect, useRef } from 'react';
import { MessageCircle, Send, User, ArrowRight, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

interface Conversation {
  id: string;
  user_id: string;
  status: string;
  created_at: string;
  updated_at: string;
  user_name?: string;
  last_message?: string;
  unread_count?: number;
}

interface Message {
  id: string;
  conversation_id: string;
  sender_id: string;
  content: string;
  is_read: boolean;
  created_at: string;
}

const ChatManagement = () => {
  const { user } = useAuth();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedConv, setSelectedConv] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchConversations();

    // Realtime for new messages
    const channel = supabase
      .channel('admin-support')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'support_messages' },
        (payload) => {
          const newMsg = payload.new as Message;
          // Update messages if viewing this conversation
          if (newMsg.conversation_id === selectedConv?.id) {
            setMessages(prev => {
              if (prev.some(m => m.id === newMsg.id)) return prev;
              return [...prev, newMsg];
            });
          }
          // Refresh conversations list
          fetchConversations();
        }
      )
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [selectedConv?.id]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const fetchConversations = async () => {
    const { data: convs } = await supabase
      .from('support_conversations')
      .select('*')
      .order('updated_at', { ascending: false });

    if (convs) {
      // Enrich with user names and last messages
      const enriched = await Promise.all(
        convs.map(async (conv) => {
          // Get user name
          const { data: profile } = await supabase
            .from('profiles')
            .select('full_name')
            .eq('user_id', conv.user_id)
            .maybeSingle();

          // Get last message
          const { data: lastMsg } = await supabase
            .from('support_messages')
            .select('content')
            .eq('conversation_id', conv.id)
            .order('created_at', { ascending: false })
            .limit(1)
            .maybeSingle();

          // Get unread count
          const { count } = await supabase
            .from('support_messages')
            .select('*', { count: 'exact', head: true })
            .eq('conversation_id', conv.id)
            .eq('is_read', false)
            .neq('sender_id', user?.id || '');

          return {
            ...conv,
            user_name: profile?.full_name || 'طالب',
            last_message: lastMsg?.content || '',
            unread_count: count || 0,
          };
        })
      );
      setConversations(enriched);
    }
    setIsLoading(false);
  };

  const selectConversation = async (conv: Conversation) => {
    setSelectedConv(conv);

    // Load messages
    const { data: msgs } = await supabase
      .from('support_messages')
      .select('*')
      .eq('conversation_id', conv.id)
      .order('created_at');

    setMessages(msgs || []);

    // Mark messages as read
    await supabase
      .from('support_messages')
      .update({ is_read: true })
      .eq('conversation_id', conv.id)
      .neq('sender_id', user?.id || '');

    fetchConversations();
  };

  const handleSend = async () => {
    if (!input.trim() || !selectedConv || !user) return;

    const content = input.trim();
    setInput('');

    await supabase
      .from('support_messages')
      .insert({
        conversation_id: selectedConv.id,
        sender_id: user.id,
        content,
      });

    // Update conversation timestamp
    await supabase
      .from('support_conversations')
      .update({ updated_at: new Date().toISOString() })
      .eq('id', selectedConv.id);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-accent" />
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Conversations List */}
      <div className="glass-purple rounded-2xl overflow-hidden">
        <div className="p-4 border-b border-white/10">
          <h3 className="text-lg font-bold text-white flex items-center gap-2">
            <MessageCircle className="h-5 w-5 text-accent" />
            المحادثات
          </h3>
        </div>
        <ScrollArea className="h-[500px]">
          {conversations.length === 0 ? (
            <div className="p-6 text-center text-white/50">
              لا توجد محادثات بعد
            </div>
          ) : (
            <div className="divide-y divide-white/10">
              {conversations.map((conv) => (
                <button
                  key={conv.id}
                  onClick={() => selectConversation(conv)}
                  className={`w-full p-4 text-right hover:bg-white/5 transition-colors ${
                    selectedConv?.id === conv.id ? 'bg-white/10' : ''
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-accent/20 flex items-center justify-center">
                        <User className="h-5 w-5 text-accent" />
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-white text-sm">{conv.user_name}</p>
                        <p className="text-xs text-white/50 truncate max-w-[150px]">
                          {conv.last_message || 'محادثة جديدة'}
                        </p>
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-1">
                      {(conv.unread_count ?? 0) > 0 && (
                        <Badge className="bg-accent text-white text-xs px-2">
                          {conv.unread_count}
                        </Badge>
                      )}
                      <span className="text-[10px] text-white/40">
                        {new Date(conv.updated_at).toLocaleDateString('ar-SA')}
                      </span>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          )}
        </ScrollArea>
      </div>

      {/* Chat Area */}
      <div className="lg:col-span-2 glass-purple rounded-2xl overflow-hidden flex flex-col">
        {!selectedConv ? (
          <div className="flex-1 flex items-center justify-center text-white/50">
            <div className="text-center">
              <MessageCircle className="h-12 w-12 mx-auto mb-4 opacity-30" />
              <p>اختر محادثة للبدء</p>
            </div>
          </div>
        ) : (
          <>
            {/* Chat Header */}
            <div className="p-4 border-b border-white/10 flex items-center gap-3">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setSelectedConv(null)}
                className="lg:hidden text-white"
              >
                <ArrowRight className="h-5 w-5" />
              </Button>
              <div className="w-10 h-10 rounded-full bg-accent/20 flex items-center justify-center">
                <User className="h-5 w-5 text-accent" />
              </div>
              <div>
                <p className="font-bold text-white">{selectedConv.user_name}</p>
                <p className="text-xs text-white/50">
                  {selectedConv.status === 'open' ? 'محادثة مفتوحة' : 'محادثة مغلقة'}
                </p>
              </div>
            </div>

            {/* Messages */}
            <ScrollArea className="flex-1 p-4 h-[380px]" ref={scrollRef}>
              <div className="space-y-3">
                {messages.map((msg) => {
                  const isAdmin = msg.sender_id === user?.id;
                  return (
                    <div
                      key={msg.id}
                      className={`flex gap-2 ${isAdmin ? 'flex-row-reverse' : ''}`}
                    >
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${
                        isAdmin ? 'bg-accent/20 text-accent' : 'bg-emerald-500/20 text-emerald-500'
                      }`}>
                        <User className="h-4 w-4" />
                      </div>
                      <div className={`max-w-[70%] p-3 rounded-2xl ${
                        isAdmin
                          ? 'bg-accent text-white rounded-tr-sm'
                          : 'bg-white/10 text-white rounded-tl-sm'
                      }`}>
                        <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                        <p className={`text-[10px] mt-1 ${isAdmin ? 'text-white/60' : 'text-white/40'}`}>
                          {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </ScrollArea>

            {/* Input */}
            <div className="p-4 border-t border-white/10">
              <div className="flex gap-2">
                <Input
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleKeyPress}
                  placeholder="اكتب ردك..."
                  className="flex-1 rounded-xl bg-white/10 border-white/20 text-white placeholder:text-white/40"
                />
                <Button
                  onClick={handleSend}
                  disabled={!input.trim()}
                  className="rounded-xl px-4 bg-accent hover:bg-accent/90"
                >
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default ChatManagement;
