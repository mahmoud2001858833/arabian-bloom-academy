import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';

const AnnouncementBar = () => {
  const [text, setText] = useState('');
  const [active, setActive] = useState(false);

  useEffect(() => {
    const fetch = async () => {
      const { data: textData } = await supabase.from('site_settings').select('value').eq('key', 'announcement_bar_text').single();
      const { data: activeData } = await supabase.from('site_settings').select('value').eq('key', 'announcement_bar_active').single();
      if (textData?.value) setText(textData.value);
      if (activeData?.value === 'true') setActive(true);
    };
    fetch();
  }, []);

  if (!active || !text) return null;

  return (
    <div className="bg-red-600 text-white py-2 overflow-hidden relative z-40">
      <div className="animate-marquee whitespace-nowrap flex items-center gap-16">
        {[...Array(4)].map((_, i) => (
          <span key={i} className="inline-block font-bold text-sm mx-8">
            🔥 {text} 🔥
          </span>
        ))}
      </div>
      <style>{`
        @keyframes marquee {
          0% { transform: translateX(100%); }
          100% { transform: translateX(-100%); }
        }
        .animate-marquee {
          animation: marquee 20s linear infinite;
        }
      `}</style>
    </div>
  );
};

export default AnnouncementBar;
