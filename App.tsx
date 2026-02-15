import React, { useState, useEffect } from 'react';
import { supabase } from './services/supabase';
import { generateDailyLesson } from './services/gemini';
import { Announcement, Flashcard, ScheduleItem, HomeworkItem, ViewState } from './types';

// Icons
const Icons = {
  Home: () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>,
  Book: () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/></svg>,
  Calendar: () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="18" height="18" x="3" y="4" rx="2" ry="2"/><line x1="16" x2="16" y1="2" y2="6"/><line x1="8" x2="8" y1="2" y2="6"/><line x1="3" x2="21" y1="10" y2="10"/></svg>,
  Check: () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 11l3 3L22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/></svg>,
  Trash: () => <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/></svg>,
  Plus: () => <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14"/><path d="M12 5v14"/></svg>,
  Loader: () => <svg className="animate-spin" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12a9 9 0 1 1-6.219-8.56"/></svg>,
  User: () => <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>,
  X: () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>,
  Edit: () => <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z"/></svg>,
  Save: () => <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/><polyline points="17 21 17 13 7 13 7 21"/><polyline points="7 3 7 8 15 8"/></svg>,
  Sparkles: () => <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z"/></svg>
};

const Header = ({ 
  user, 
  onLoginClick, 
  onLogout 
}: { 
  user: any, 
  onLoginClick: () => void, 
  onLogout: () => void 
}) => (
  <header className="fixed top-0 w-full z-50 bg-gradient-to-r from-imperial to-red-900 text-antique shadow-md">
    <div className="flex justify-between items-center px-4 py-3">
      <div className="flex items-center gap-2">
        <div className="bg-gold text-imperial w-8 h-8 rounded-full flex items-center justify-center font-serif font-bold border-2 border-antique">
          G5
        </div>
        <span className="font-calligraphy text-2xl tracking-wide">中文课</span>
      </div>
      
      {user ? (
        <div className="flex items-center gap-2">
          <span className="text-xs text-gold font-medium px-2 py-1 bg-black/20 rounded-full border border-gold/30">
            {user.email?.split('@')[0]}
          </span>
          <button onClick={onLogout} className="text-antique/80 hover:text-white">
            <Icons.X />
          </button>
        </div>
      ) : (
        <button 
          onClick={onLoginClick}
          className="text-xs font-semibold bg-gold/10 hover:bg-gold/20 text-gold border border-gold px-3 py-1.5 rounded-full transition-colors"
        >
          Connexion
        </button>
      )}
    </div>
  </header>
);

const Nav = ({ view, setView }: { view: ViewState, setView: (v: ViewState) => void }) => {
  const NavItem = ({ v, icon: Icon, label }: { v: ViewState, icon: any, label: string }) => (
    <button 
      onClick={() => setView(v)}
      className={`flex flex-col items-center justify-center w-full py-3 transition-all duration-300 ${view === v ? 'text-imperial scale-105' : 'text-gray-400'}`}
    >
      <Icon />
      <span className="text-[10px] mt-1 font-medium">{label}</span>
      {view === v && <div className="w-1 h-1 bg-imperial rounded-full mt-1"></div>}
    </button>
  );

  return (
    <nav className="fixed bottom-0 w-full bg-white border-t border-gray-100 pb-safe flex justify-around shadow-[0_-5px_10px_rgba(0,0,0,0.02)] z-40">
      <NavItem v={ViewState.HOME} icon={Icons.Home} label="Annonces" />
      <NavItem v={ViewState.FLASHCARDS} icon={Icons.Book} label="Mots" />
      <NavItem v={ViewState.SCHEDULE} icon={Icons.Calendar} label="Planning" />
      <NavItem v={ViewState.HOMEWORK} icon={Icons.Check} label="Devoirs" />
    </nav>
  );
};

const LoginModal = ({ isOpen, onClose, onLogin }: { isOpen: boolean, onClose: () => void, onLogin: (p: string, pass: string) => void }) => {
  const [pseudo, setPseudo] = useState('');
  const [password, setPassword] = useState('');

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl w-full max-w-xs shadow-2xl overflow-hidden animate-fade-in">
        <div className="bg-imperial p-4 text-center">
          <h2 className="text-white font-serif text-xl">Connexion Élève</h2>
        </div>
        <div className="p-6 space-y-4">
          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Pseudo</label>
            <input 
              type="text" 
              value={pseudo}
              onChange={(e) => setPseudo(e.target.value)}
              placeholder="ex: juliano"
              className="w-full bg-gray-50 border border-gray-200 rounded-lg p-3 text-sm focus:outline-none focus:border-imperial focus:ring-1 focus:ring-imperial"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Mot de passe</label>
            <input 
              type="password" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full bg-gray-50 border border-gray-200 rounded-lg p-3 text-sm focus:outline-none focus:border-imperial focus:ring-1 focus:ring-imperial"
            />
          </div>
          <button 
            onClick={() => onLogin(pseudo, password)}
            className="w-full bg-imperial text-white py-3 rounded-lg font-bold shadow-lg shadow-red-900/20 active:scale-95 transition-transform"
          >
            Se connecter
          </button>
          <button onClick={onClose} className="w-full text-center text-gray-400 text-sm py-2">Annuler</button>
        </div>
      </div>
    </div>
  );
};

// ---------------- VIEWS ----------------

const AnnouncementsView = ({ user }: { user: any }) => {
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(true);
  const [newTitle, setNewTitle] = useState('');
  const [newContent, setNewContent] = useState('');
  const [isAdding, setIsAdding] = useState(false);

  // Editing state
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [editContent, setEditContent] = useState('');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    const { data } = await supabase.from('announcements').select('*').order('date', { ascending: false });
    if (data) setAnnouncements(data);
    setLoading(false);
  };

  const handleAdd = async () => {
    if (!newTitle || !newContent) return;
    await supabase.from('announcements').insert({ title: newTitle, content: newContent, urgent: false });
    setIsAdding(false);
    setNewTitle('');
    setNewContent('');
    fetchData();
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Supprimer cette annonce ?')) return;
    await supabase.from('announcements').delete().eq('id', id);
    fetchData();
  };

  const startEdit = (ann: Announcement) => {
    setEditingId(ann.id);
    setEditTitle(ann.title);
    setEditContent(ann.content);
  };

  const handleUpdate = async () => {
    if (!editingId) return;
    await supabase.from('announcements').update({ title: editTitle, content: editContent }).eq('id', editingId);
    setEditingId(null);
    fetchData();
  };

  if (loading) return <div className="flex justify-center p-10 text-imperial"><Icons.Loader /></div>;

  return (
    <div className="space-y-6 pb-20">
      <h2 className="text-2xl font-serif font-bold text-imperial mb-4">Annonces</h2>

      {user && (
        <div className="mb-4">
          {!isAdding ? (
             <button onClick={() => setIsAdding(true)} className="w-full py-3 border-2 border-dashed border-gray-300 rounded-xl text-gray-400 font-medium hover:border-imperial hover:text-imperial transition-colors flex items-center justify-center gap-2">
                <Icons.Plus /> Nouvelle Annonce
             </button>
          ) : (
            <div className="bg-white p-4 rounded-xl shadow-md border border-gray-100 animate-fade-in">
               <input className="w-full mb-2 p-2 border-b border-gray-200 focus:outline-none focus:border-imperial font-serif font-bold" placeholder="Titre..." value={newTitle} onChange={e => setNewTitle(e.target.value)} />
               <textarea className="w-full mb-4 p-2 text-sm text-gray-600 focus:outline-none resize-none" rows={3} placeholder="Contenu..." value={newContent} onChange={e => setNewContent(e.target.value)} />
               <div className="flex justify-end gap-2">
                 <button onClick={() => setIsAdding(false)} className="px-4 py-2 text-xs text-gray-500">Annuler</button>
                 <button onClick={handleAdd} className="px-4 py-2 bg-imperial text-white text-xs rounded-lg">Publier</button>
               </div>
            </div>
          )}
        </div>
      )}

      <div className="space-y-4">
        {announcements.length === 0 && (
          <div className="text-center py-12 text-gray-400 italic text-sm border-2 border-dashed border-gray-200 rounded-xl">
            Aucune annonce pour le moment.
          </div>
        )}

        {announcements.map((ann) => (
          <div key={ann.id} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden relative">
            <div className="h-1 w-full bg-gold"></div>
            {editingId === ann.id ? (
              <div className="p-5">
                <input 
                  className="w-full mb-2 p-1 border-b border-imperial font-serif font-bold text-lg focus:outline-none text-ink" 
                  value={editTitle} 
                  onChange={e => setEditTitle(e.target.value)} 
                />
                <textarea 
                  className="w-full mb-2 p-1 text-sm text-gray-600 focus:outline-none border-b border-gray-200 resize-none bg-transparent" 
                  rows={4} 
                  value={editContent} 
                  onChange={e => setEditContent(e.target.value)} 
                />
                <div className="flex justify-end gap-3 mt-2">
                  <button onClick={() => setEditingId(null)} className="text-gray-400 hover:text-gray-600"><Icons.X /></button>
                  <button onClick={handleUpdate} className="text-green-600 hover:text-green-700"><Icons.Save /></button>
                </div>
              </div>
            ) : (
              <div className="p-5">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="text-lg font-serif font-bold text-ink">{ann.title}</h3>
                  {ann.urgent && <span className="text-[10px] bg-red-100 text-red-600 px-2 py-0.5 rounded-full font-bold tracking-wider">URGENT</span>}
                </div>
                <p className="text-gray-600 text-sm leading-relaxed mb-3 whitespace-pre-wrap">{ann.content}</p>
                <div className="flex justify-between items-center mt-2 pt-3 border-t border-gray-50">
                  <span className="text-[10px] text-gray-400 font-medium">{new Date(ann.date).toLocaleDateString()}</span>
                  {user && (
                    <div className="flex items-center gap-3">
                      <button onClick={() => startEdit(ann)} className="text-gray-300 hover:text-imperial transition-colors">
                        <Icons.Edit />
                      </button>
                      <button onClick={() => handleDelete(ann.id)} className="text-gray-300 hover:text-red-500 transition-colors">
                        <Icons.Trash />
                      </button>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

const FlashcardsView = ({ user }: { user: any }) => {
  const [cards, setCards] = useState<Flashcard[]>([]);
  const [flippedId, setFlippedId] = useState<string | null>(null);
  const [generating, setGenerating] = useState(false);
  const [hasDailyLesson, setHasDailyLesson] = useState(false);

  useEffect(() => {
    fetchCards();
  }, []);

  const fetchCards = async () => {
    const { data } = await supabase.from('flashcards').select('*').order('created_at', { ascending: false });
    if (data) {
        setCards(data);
        // Check if cards were created today
        const today = new Date().toISOString().split('T')[0];
        const todaysCards = data.filter(c => c.created_at.startsWith(today));
        setHasDailyLesson(todaysCards.length >= 3);
    }
  };

  const handleGenerateDaily = async () => {
    setGenerating(true);
    // On passe la liste des mots existants pour éviter les doublons
    const existingChars = cards.map(c => c.character);
    const newCardsData = await generateDailyLesson(existingChars);
    
    if (newCardsData && Array.isArray(newCardsData) && newCardsData.length > 0) {
      // Insert all at once
      const { error } = await supabase.from('flashcards').insert(newCardsData);
      
      if (error) {
        alert("Erreur lors de l'enregistrement: " + error.message);
      } else {
        await fetchCards();
      }
    } else {
      alert("Erreur de l'IA. Réessayez.");
    }
    setGenerating(false);
  };

  return (
    <div className="pb-20">
      <div className="mb-6 flex justify-between items-end">
        <div>
           <h2 className="text-2xl font-serif font-bold text-imperial">Cartes Mémoire</h2>
           <p className="text-xs text-gray-500 mt-1">Leçon du jour générée par l'IA</p>
        </div>
      </div>

      {user && (
        <div className="mb-6">
            {!hasDailyLesson ? (
                <button 
                    onClick={handleGenerateDaily}
                    disabled={generating}
                    className="w-full bg-gradient-to-r from-imperial to-red-900 text-white p-4 rounded-xl shadow-lg shadow-red-900/30 flex items-center justify-center gap-3 active:scale-95 transition-all"
                >
                    {generating ? (
                        <>
                            <div className="animate-spin w-5 h-5 border-2 border-white/30 border-t-white rounded-full"></div>
                            <span className="font-bold">Génération de la leçon...</span>
                        </>
                    ) : (
                        <>
                            <Icons.Sparkles />
                            <span className="font-bold">Générer les 3 mots du jour</span>
                        </>
                    )}
                </button>
            ) : (
                <div className="w-full bg-green-50 border border-green-200 text-green-800 p-3 rounded-xl flex items-center justify-center gap-2 text-sm font-medium">
                    <Icons.Check /> La leçon du jour est prête
                </div>
            )}
        </div>
      )}

      {cards.length === 0 && (
          <div className="text-center py-12 text-gray-400 italic text-sm border-2 border-dashed border-gray-200 rounded-xl">
            Aucune carte. {user && "Cliquez sur générer."}
          </div>
      )}

      <div className="grid grid-cols-2 gap-4">
        {cards.map((card) => (
          <div 
            key={card.id} 
            className="aspect-[3/4] cursor-pointer flip-card group"
            onClick={() => setFlippedId(flippedId === card.id ? null : card.id)}
          >
            <div className={`flip-card-inner duration-500 ${flippedId === card.id ? 'flipped' : ''}`}>
              {/* Front */}
              <div className="flip-card-front bg-white rounded-2xl shadow-sm border border-gray-200 flex flex-col items-center justify-center p-4 relative overflow-hidden">
                 <div className="absolute top-2 right-2 text-[10px] text-gray-300 font-mono">
                    {new Date(card.created_at || Date.now()).toLocaleDateString(undefined, {day: '2-digit', month: '2-digit'})}
                 </div>
                 <div className="text-6xl font-serif font-bold text-ink mb-2">{card.character}</div>
                 <div className="w-8 h-1 bg-imperial/10 rounded-full"></div>
              </div>
              
              {/* Back */}
              <div className="flip-card-back bg-imperial rounded-2xl shadow-lg p-4 flex flex-col items-center justify-center text-white relative">
                <div className="text-xl font-bold text-gold mb-1">{card.pinyin}</div>
                <div className="text-sm font-medium opacity-90 mb-4 text-center leading-tight">{card.translation}</div>
                {card.example_sentence && (
                  <div className="text-xs italic opacity-70 border-t border-white/20 pt-2 w-full text-center">
                    {card.example_sentence}
                  </div>
                )}
                {user && (
                    <button 
                        onClick={(e) => { e.stopPropagation(); supabase.from('flashcards').delete().eq('id', card.id).then(fetchCards); }}
                        className="absolute bottom-2 right-2 text-white/50 hover:text-white"
                    >
                        <Icons.Trash />
                    </button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

const ScheduleView = ({ user }: { user: any }) => {
  const days = ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi'];
  const [activeDay, setActiveDay] = useState('Lundi');
  const [schedule, setSchedule] = useState<ScheduleItem[]>([]);
  
  // Adding state
  const [newTime, setNewTime] = useState('');
  const [newSubject, setNewSubject] = useState('');
  const [newRoom, setNewRoom] = useState('');

  // Editing state
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editTime, setEditTime] = useState('');
  const [editSubject, setEditSubject] = useState('');
  const [editRoom, setEditRoom] = useState('');

  useEffect(() => {
    fetchSchedule();
  }, [activeDay]);

  const fetchSchedule = async () => {
    const { data } = await supabase.from('schedule').select('*').eq('day', activeDay).order('start_time', { ascending: true });
    if (data) setSchedule(data);
  };

  const handleAdd = async () => {
    await supabase.from('schedule').insert({ day: activeDay, start_time: newTime, subject: newSubject, room: newRoom });
    setNewTime(''); setNewSubject(''); setNewRoom('');
    fetchSchedule();
  };

  const handleDelete = async (id: string) => {
    await supabase.from('schedule').delete().eq('id', id);
    fetchSchedule();
  };

  const startEdit = (item: ScheduleItem) => {
    setEditingId(item.id);
    setEditTime(item.start_time);
    setEditSubject(item.subject);
    setEditRoom(item.room || '');
  };

  const handleUpdate = async () => {
    if (!editingId) return;
    await supabase.from('schedule').update({ start_time: editTime, subject: editSubject, room: editRoom }).eq('id', editingId);
    setEditingId(null);
    fetchSchedule();
  };

  return (
    <div className="pb-20 h-full flex flex-col">
       <h2 className="text-2xl font-serif font-bold text-imperial mb-6">Emploi du Temps</h2>
       
       {/* Tabs */}
       <div className="flex overflow-x-auto gap-2 pb-4 no-scrollbar mb-4">
         {days.map(day => (
           <button
             key={day}
             onClick={() => setActiveDay(day)}
             className={`px-5 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
               activeDay === day 
                 ? 'bg-imperial text-white shadow-lg shadow-red-900/20' 
                 : 'bg-white text-gray-500 border border-gray-100'
             }`}
           >
             {day}
           </button>
         ))}
       </div>

       <div className="flex-1 space-y-3">
         {schedule.length === 0 && (
            <div className="text-center py-12 text-gray-400 italic text-sm border-2 border-dashed border-gray-200 rounded-xl">
                Aucun cours ce jour-là.
            </div>
         )}
         
         {schedule.map(item => (
           <div key={item.id} className="bg-white p-4 rounded-xl border-l-4 border-gold shadow-sm flex justify-between items-center group relative">
             {editingId === item.id ? (
                <div className="w-full grid grid-cols-6 gap-2 items-center">
                   <input className="col-span-1 bg-gray-50 p-1 rounded text-xs border border-imperial" value={editTime} onChange={e => setEditTime(e.target.value)} />
                   <input className="col-span-3 bg-gray-50 p-1 rounded text-sm font-bold border border-imperial" value={editSubject} onChange={e => setEditSubject(e.target.value)} />
                   <input className="col-span-1 bg-gray-50 p-1 rounded text-xs border border-imperial" value={editRoom} onChange={e => setEditRoom(e.target.value)} />
                   <div className="col-span-1 flex justify-end">
                      <button onClick={handleUpdate} className="text-green-600"><Icons.Save /></button>
                   </div>
                </div>
             ) : (
                <>
                  <div>
                    <div className="text-xs font-bold text-gray-400 mb-1">{item.start_time}</div>
                    <div className="font-bold text-ink">{item.subject}</div>
                    <div className="text-xs text-imperial font-medium mt-1 flex items-center gap-1">
                      <span className="w-1.5 h-1.5 bg-imperial rounded-full"></span>
                      {item.room || 'Salle non définie'}
                    </div>
                  </div>
                  {user && (
                    <div className="flex items-center gap-2">
                      <button onClick={() => startEdit(item)} className="text-gray-300 hover:text-imperial">
                        <Icons.Edit />
                      </button>
                      <button onClick={() => handleDelete(item.id)} className="text-gray-300 hover:text-red-500">
                        <Icons.Trash />
                      </button>
                    </div>
                  )}
                </>
             )}
           </div>
         ))}

         {user && (
           <div className="mt-6 bg-white p-4 rounded-xl border border-gray-200">
             <div className="text-sm font-bold text-gray-500 mb-3">Ajouter un cours</div>
             <div className="grid grid-cols-3 gap-2 mb-2">
                <input placeholder="09:00" className="bg-gray-50 p-2 rounded text-sm" value={newTime} onChange={e => setNewTime(e.target.value)} />
                <input placeholder="Matière" className="bg-gray-50 p-2 rounded text-sm col-span-2" value={newSubject} onChange={e => setNewSubject(e.target.value)} />
             </div>
             <input placeholder="Salle (ex: B202)" className="bg-gray-50 p-2 rounded text-sm w-full mb-3" value={newRoom} onChange={e => setNewRoom(e.target.value)} />
             <button onClick={handleAdd} className="w-full bg-imperial text-white text-sm py-2 rounded font-bold">Ajouter</button>
           </div>
         )}
       </div>
    </div>
  );
};

const HomeworkView = ({ user }: { user: any }) => {
  const [tasks, setTasks] = useState<HomeworkItem[]>([]);
  const [newTask, setNewTask] = useState('');

  // Editing state
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editContent, setEditContent] = useState('');

  useEffect(() => {
    fetchTasks();
  }, []);

  const fetchTasks = async () => {
    const { data } = await supabase.from('homework').select('*').order('created_at', { ascending: false });
    if (data) setTasks(data);
  };

  const handleAdd = async () => {
    if(!newTask) return;
    await supabase.from('homework').insert({ content: newTask, is_done: false });
    setNewTask('');
    fetchTasks();
  };

  const handleToggle = async (id: string, currentStatus: boolean) => {
    if (editingId === id) return; // Disable toggle while editing
    setTasks(tasks.map(t => t.id === id ? { ...t, is_done: !currentStatus } : t));
    await supabase.from('homework').update({ is_done: !currentStatus }).eq('id', id);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Supprimer ?')) return;
    await supabase.from('homework').delete().eq('id', id);
    fetchTasks();
  };

  const startEdit = (task: HomeworkItem) => {
    setEditingId(task.id);
    setEditContent(task.content);
  };

  const handleUpdate = async () => {
    if (!editingId) return;
    await supabase.from('homework').update({ content: editContent }).eq('id', editingId);
    setEditingId(null);
    fetchTasks();
  };

  return (
    <div className="pb-20">
      <h2 className="text-2xl font-serif font-bold text-imperial mb-6">Liste des Devoirs</h2>
      
      {user && (
        <div className="flex gap-2 mb-6">
          <input 
            className="flex-1 bg-white border-none shadow-sm rounded-lg p-3 text-sm focus:ring-1 focus:ring-imperial outline-none"
            placeholder="Nouveau devoir..."
            value={newTask}
            onChange={e => setNewTask(e.target.value)}
          />
          <button onClick={handleAdd} className="bg-imperial text-white px-4 rounded-lg shadow-md font-bold">
            <Icons.Plus />
          </button>
        </div>
      )}

      {tasks.length === 0 && (
          <div className="text-center py-12 text-gray-400 italic text-sm border-2 border-dashed border-gray-200 rounded-xl">
            Aucun devoir.
          </div>
      )}

      <div className="space-y-3">
        {tasks.map(task => (
          <div key={task.id} className={`flex items-center gap-3 p-4 rounded-xl shadow-sm border transition-all ${task.is_done ? 'bg-gray-50 border-gray-100 opacity-60' : 'bg-white border-gray-100'}`}>
            {editingId === task.id ? (
              <div className="flex-1 flex gap-2 items-center">
                <input 
                  className="flex-1 bg-gray-50 border-b border-imperial p-1 text-sm focus:outline-none" 
                  value={editContent} 
                  onChange={e => setEditContent(e.target.value)} 
                />
                <button onClick={handleUpdate} className="text-green-600"><Icons.Save /></button>
                <button onClick={() => setEditingId(null)} className="text-gray-400"><Icons.X /></button>
              </div>
            ) : (
              <>
                <button 
                  onClick={() => handleToggle(task.id, task.is_done)}
                  className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors ${task.is_done ? 'bg-green-500 border-green-500 text-white' : 'border-gray-300 text-transparent'}`}
                >
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4"><polyline points="20 6 9 17 4 12"/></svg>
                </button>
                <span className={`flex-1 text-sm font-medium ${task.is_done ? 'line-through text-gray-400' : 'text-ink'}`}>
                  {task.content}
                </span>
                {user && (
                  <div className="flex items-center gap-1">
                     <button onClick={() => startEdit(task)} className="text-gray-300 hover:text-imperial p-2">
                        <Icons.Edit />
                     </button>
                     <button onClick={() => handleDelete(task.id)} className="text-gray-300 hover:text-red-500 p-2">
                        <Icons.Trash />
                     </button>
                  </div>
                )}
              </>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

// ---------------- APP COMPONENT ----------------

const App = () => {
  const [view, setView] = useState<ViewState>(ViewState.HOME);
  const [user, setUser] = useState<any>(null);
  const [showLogin, setShowLogin] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleLogin = async (pseudo: string, pass: string) => {
    if (!pseudo || !pass) return;
    const email = `${pseudo}@g5.class`;
    
    const { error } = await supabase.auth.signInWithPassword({
      email: email,
      password: pass
    });

    if (error) {
      alert("Erreur de connexion : " + error.message);
    } else {
      setShowLogin(false);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
  };

  const renderView = () => {
    switch(view) {
      case ViewState.HOME: return <AnnouncementsView user={user} />;
      case ViewState.FLASHCARDS: return <FlashcardsView user={user} />;
      case ViewState.SCHEDULE: return <ScheduleView user={user} />;
      case ViewState.HOMEWORK: return <HomeworkView user={user} />;
      default: return <AnnouncementsView user={user} />;
    }
  };

  return (
    <div className="min-h-screen bg-antique font-sans">
      <Header 
        user={user} 
        onLoginClick={() => setShowLogin(true)} 
        onLogout={handleLogout} 
      />
      
      <main className="pt-20 px-4 max-w-lg mx-auto min-h-screen">
        {renderView()}
      </main>

      <Nav view={view} setView={setView} />
      
      <LoginModal 
        isOpen={showLogin} 
        onClose={() => setShowLogin(false)} 
        onLogin={handleLogin} 
      />
    </div>
  );
};

export default App;