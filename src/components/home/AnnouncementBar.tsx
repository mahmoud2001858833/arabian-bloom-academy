import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useLanguage } from '@/i18n/LanguageContext';

const AnnouncementBar = () => {
  const { language } = useLanguage();
  const [texts, setTexts] = useState<Record<string, string>>({});
  const [active, setActive] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      const { data: activeData } = await supabase.from('site_settings').select('value').eq('key', 'announcement_bar_active').single();
      if (activeData?.value === 'true') setActive(true);

      // Fetch all language versions
      const keys = ['announcement_bar_text', 'announcement_bar_text_en', 'announcement_bar_text_fr', 'announcement_bar_text_ms', 'announcement_bar_text_ur', 'announcement_bar_text_id'];
      const { data } = await supabase.from('site_settings').select('key, value').in('key', keys);
      if (data) {
        const map: Record<string, string> = {};
        data.forEach(d => {
          if (d.key === 'announcement_bar_text') map['ar'] = d.value || '';
          else {
            const lang = d.key.replace('announcement_bar_text_', '');
            map[lang] = d.value || '';
          }
        });
        setTexts(map);
      }
    };
    fetchData();
  }, []);

  const displayText = texts[language] || texts['ar'] || '';

  if (!active || !displayText) return null;

  return (
    <div className="bg-gradient-to-r from-red-600 via-red-500 to-red-600 text-white py-3 overflow-hidden relative z-50 shadow-lg shadow-red-500/20">
      {/* Subtle pattern overlay */}
      <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'repeating-linear-gradient(45deg, transparent, transparent 10px, rgba(255,255,255,0.1) 10px, rgba(255,255,255,0.1) 20px)' }} />
      
      <div className="animate-marquee whitespace-nowrap flex items-center relative">
        {[...Array(6)].map((_, i) => (
          <span key={i} className="inline-flex items-center gap-3 mx-12 text-base font-bold tracking-wide">
            <span className="text-yellow-300 text-lg">✦</span>
            <span className="drop-shadow-sm">{displayText}</span>
            <span className="text-yellow-300 text-lg">✦</span>
          </span>
        ))}
      </div>
      
      {/* Edge fading */}
      <div className="absolute inset-y-0 left-0 w-16 bg-gradient-to-r from-red-600 to-transparent z-10" />
      <div className="absolute inset-y-0 right-0 w-16 bg-gradient-to-l from-red-600 to-transparent z-10" />
      
      <style>{`
        @keyframes marquee {
          0% { transform: translateX(0%); }
          100% { transform: translateX(-50%); }
        }
        .animate-marquee {
          animation: marquee 25s linear infinite;
        }
      `}</style>
    </div>
  );
};

export default AnnouncementBar;
