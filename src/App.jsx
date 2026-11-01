import React, { useState, useEffect } from 'react';
import { initializeApp } from 'firebase/app';
import { getFirestore, collection, query, orderBy, limit, getDocs } from 'firebase/firestore';
import { 
  Newspaper, 
  Sparkles, 
  Bookmark, 
  BookmarkCheck, 
  Moon, 
  Sun, 
  Key, 
  RefreshCw, 
  ExternalLink, 
  Scale, 
  Globe, 
  Cpu, 
  Building2, 
  ChevronRight, 
  Calendar, 
  Search, 
  BookOpen, 
  X, 
  History, 
  TrendingUp, 
  ShieldCheck, 
  FileText, 
  Layers, 
  ArrowRight
} from 'lucide-react';

// Conexión a Firebase
const firebaseConfig = {
  apiKey: "AIzaSyBFkiCIVm7dkP50HNgHgBul3zWGQDRs_4I",
  authDomain: "diario-1717.firebaseapp.com",
  projectId: "diario-1717",
  storageBucket: "diario-1717.firebasestorage.app",
  messagingSenderId: "60786063655",
  appId: "1:60786063655:web:abf6c865d8039c69fe5102"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

const INITIAL_ARTICLES = [
  {
    id: 'n1',
    category: 'nacional',
    categoryLabel: 'Política Nacional',
    title: 'Cargando última edición de 1717...',
    subtitle: 'Conectando con la base de datos de Firebase...',
    summary: 'Si es la primera vez que ingresas, la aplicación está sincronizando las noticias del día generadas a las 7:00 AM.',
    imageUrl: 'https://images.unsplash.com/photo-1541872703-74c5e44368f9?auto=format&fit=crop&w=1200&q=80',
    imageCaption: 'Cargando información.',
    veracityScore: 98,
    sourcesCount: 5,
    sources: [{ name: '1717 Engine', url: '#' }],
    background: 'Cargando antecedentes...',
    fullStory: 'Sincronizando información en tiempo real...',
    perspectives: 'Cargando análisis...',
    analysis: 'Cargando...',
    legalImpact: 'Cargando...',
    futureProjections: 'Cargando...',
    date: '31 de Octubre, 2026',
    readTime: '5 min'
  }
];

export default function App() {
  const [darkMode, setDarkMode] = useState(false);
  const [apiKey, setApiKey] = useState(() => localStorage.getItem('1717_gemini_key') || '');
  const [showKeyModal, setShowKeyModal] = useState(false);
  const [activeSection, setActiveSection] = useState('todas');
  const [savedArticles, setSavedArticles] = useState([]);
  const [articles, setArticles] = useState(INITIAL_ARTICLES);
  const [isGenerating, setIsGenerating] = useState(false);
  const [statusMessage, setStatusMessage] = useState('');
  const [selectedArticle, setSelectedArticle] = useState(null);
  const [savedOnlyView, setSavedOnlyView] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Cargar edición más reciente desde Firestore al abrir la web
  useEffect(() => {
    const fetchLatestEdition = async () => {
      try {
        const editionsRef = collection(db, 'editions');
        const q = query(editionsRef, orderBy('date', 'desc'), limit(1));
        const querySnapshot = await getDocs(q);

        if (!querySnapshot.empty) {
          const latestDoc = querySnapshot.docs[0].data();
          if (latestDoc.articles && latestDoc.articles.length > 0) {
            setArticles(latestDoc.articles);
          }
        }
      } catch (error) {
        console.warn("No se pudo conectar con Firestore aún, mostrando noticias iniciales:", error);
      }
    };

    fetchLatestEdition();
  }, []);

  const handleSaveKey = (key) => {
    setApiKey(key);
    localStorage.setItem('1717_gemini_key', key);
    setShowKeyModal(false);
  };

  const toggleSaveArticle = (articleId) => {
    if (savedArticles.includes(articleId)) {
      setSavedArticles(savedArticles.filter(id => id !== articleId));
    } else {
      setSavedArticles([...savedArticles, articleId]);
    }
  };

  const handleGenerateEdition = async () => {
    setIsGenerating(true);
    setStatusMessage('Buscando y cruzando información en tiempo real...');

    try {
      const systemPrompt = `Eres el Editor General del diario '1717'. Redacta la edición diaria completa en JSON estructurado.`;
      const userQuery = `Genera 4 reportajes profundos en JSON para las categorías: 'nacional', 'internacional', 'jurisprudencia', 'tecnologia'.`;

      const effectiveKey = apiKey.trim();
      const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.8-flash:generateContent?key=${effectiveKey}`;

      const payload = {
        contents: [{ parts: [{ text: userQuery }] }],
        systemInstruction: { parts: [{ text: systemPrompt }] },
        generationConfig: { responseMimeType: "application/json" }
      };

      const res = await fetch(apiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (!res.ok) throw new Error(`Error HTTP: ${res.status}`);

      const data = await res.json();
      const rawText = data.candidates?.[0]?.content?.parts?.[0]?.text;
      
      if (rawText) {
        const parsed = JSON.parse(rawText);
        if (parsed.articles) {
          setArticles(parsed.articles);
          setStatusMessage('¡Edición del día generada con éxito!');
        }
      }
    } catch (err) {
      console.error(err);
      setStatusMessage('Error al generar la edición. Revisa tu API Key.');
    } finally {
      setIsGenerating(false);
      setTimeout(() => setStatusMessage(''), 5000);
    }
  };

  const filteredArticles = articles.filter(art => {
    const matchesSection = activeSection === 'todas' || art.category === activeSection;
    const matchesSaved = !savedOnlyView || savedArticles.includes(art.id);
    const matchesQuery = searchQuery === '' || 
      art.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      art.summary.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesSection && matchesSaved && matchesQuery;
  });

  return (
    <div className={`min-h-screen ${darkMode ? 'bg-zinc-950 text-zinc-100' : 'bg-[#FAF8F5] text-zinc-900'}`}>
      <header className={`border-b ${darkMode ? 'border-zinc-800 bg-zinc-900/80' : 'border-zinc-200 bg-amber-50/50'} sticky top-0 z-30 backdrop-blur-md`}>
        <div className="max-w-7xl mx-auto px-4 py-2 text-xs flex justify-between items-center border-b border-zinc-200 dark:border-zinc-800">
          <span className="font-mono flex items-center gap-1">
            <Calendar className="w-3.5 h-3.5" />
            {new Date().toLocaleDateString('es-AR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
          </span>
          <div className="flex items-center space-x-3">
            <button onClick={() => setDarkMode(!darkMode)} className="p-1 rounded">
              {darkMode ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-zinc-700" />}
            </button>
            <button onClick={() => setShowKeyModal(true)} className="px-3 py-1 rounded-full text-xs bg-amber-600 text-white font-medium">
              <Key className="w-3 h-3 inline mr-1" />
              {apiKey ? 'API Key Conectada' : 'Configurar API Key'}
            </button>
          </div>
        </div>

        <div className="py-6 text-center border-b border-zinc-200 dark:border-zinc-800">
          <h1 className="text-6xl font-serif font-bold tracking-tight">1717</h1>
          <p className="text-xs uppercase tracking-widest text-amber-800 dark:text-amber-400 font-semibold mt-1">
            Diario de Análisis Político, Jurisprudencia y Tecnología
          </p>
        </div>

        <div className="max-w-7xl mx-auto px-4 py-3 flex justify-between items-center overflow-x-auto">
          <nav className="flex space-x-1">
            {[
              { id: 'todas', label: 'Portada', icon: Newspaper },
              { id: 'nacional', label: 'Política Nacional', icon: Building2 },
              { id: 'internacional', label: 'Internacional', icon: Globe },
              { id: 'jurisprudencia', label: 'Jurisprudencia', icon: Scale },
              { id: 'tecnologia', label: 'Tecnología', icon: Cpu }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => { setActiveSection(tab.id); setSavedOnlyView(false); }}
                className={`px-3 py-1.5 rounded-md text-xs font-medium flex items-center gap-1.5 ${
                  activeSection === tab.id && !savedOnlyView ? 'bg-amber-900 text-white' : 'text-zinc-600 dark:text-zinc-400'
                }`}
              >
                <tab.icon className="w-3.5 h-3.5" />
                {tab.label}
              </button>
            ))}
          </nav>
          <button
            onClick={handleGenerateEdition}
            disabled={isGenerating}
            className="px-3 py-1.5 rounded bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900 text-xs font-semibold flex items-center gap-1"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isGenerating ? 'animate-spin' : ''}`} />
            <span>Generar Edición Hoy</span>
          </button>
        </div>
      </header>

      {statusMessage && (
        <div className="bg-amber-600 text-white text-xs py-1.5 text-center font-medium">
          {statusMessage}
        </div>
      )}

      <main className="max-w-7xl mx-auto px-4 py-8">
        <div className="mb-6 flex justify-between items-center">
          <div className="relative w-72">
            <Search className="w-4 h-4 absolute left-3 top-2.5 text-zinc-400" />
            <input 
              type="text" 
              placeholder="Buscar noticia..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 text-xs rounded border border-zinc-300 dark:border-zinc-800 bg-transparent"
            />
          </div>
          <span className="text-xs text-zinc-400 font-mono">{filteredArticles.length} noticias</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
          {filteredArticles.length > 0 && (
            <div className="md:col-span-8 border-r border-zinc-200 dark:border-zinc-800 pr-8">
              <span className="text-xs font-bold uppercase text-amber-700 dark:text-amber-400">
                {filteredArticles[0].categoryLabel}
              </span>
              <h2 
                onClick={() => setSelectedArticle(filteredArticles[0])}
                className="text-3xl font-serif font-bold mt-1 cursor-pointer hover:text-amber-700"
              >
                {filteredArticles[0].title}
              </h2>
              <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-300 italic">"{filteredArticles[0].subtitle}"</p>
              {filteredArticles[0].imageUrl && (
                <img 
                  src={filteredArticles[0].imageUrl} 
                  alt="" 
                  className="w-full h-80 object-cover rounded mt-4 cursor-pointer"
                  onClick={() => setSelectedArticle(filteredArticles[0])}
                />
              )}
              <p className="mt-4 text-sm leading-relaxed text-zinc-700 dark:text-zinc-300">
                {filteredArticles[0].summary}
              </p>
              <button 
                onClick={() => setSelectedArticle(filteredArticles[0])}
                className="mt-4 text-xs font-bold text-amber-800 dark:text-amber-400 flex items-center gap-1"
              >
                Leer informe completo <ChevronRight className="w-3 h-3" />
              </button>
            </div>
          )}

          <div className="md:col-span-4 space-y-6">
            {filteredArticles.slice(1).map(article => (
              <div key={article.id} className="pb-4 border-b border-zinc-200 dark:border-zinc-800">
                <span className="text-[10px] font-bold uppercase text-amber-700 dark:text-amber-400">
                  {article.categoryLabel}
                </span>
                <h3 
                  onClick={() => setSelectedArticle(article)}
                  className="text-base font-serif font-bold mt-1 cursor-pointer hover:text-amber-700"
                >
                  {article.title}
                </h3>
                <p className="mt-1 text-xs text-zinc-600 dark:text-zinc-400 line-clamp-2">{article.summary}</p>
                <button 
                  onClick={() => setSelectedArticle(article)}
                  className="mt-2 text-xs text-amber-800 dark:text-amber-400 font-semibold"
                >
                  Leer noticia completa →
                </button>
              </div>
            ))}
          </div>
        </div>
      </main>

      {selectedArticle && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-zinc-900 max-w-3xl w-full max-h-[85vh] overflow-y-auto rounded-lg p-6 relative text-zinc-900 dark:text-zinc-100">
            <button onClick={() => setSelectedArticle(null)} className="absolute top-4 right-4 text-zinc-400">
              <X className="w-5 h-5" />
            </button>
            <span className="text-xs font-bold uppercase text-amber-700">{selectedArticle.categoryLabel}</span>
            <h2 className="text-2xl font-serif font-bold mt-1">{selectedArticle.title}</h2>
            {selectedArticle.imageUrl && (
              <img src={selectedArticle.imageUrl} alt="" className="w-full h-64 object-cover rounded my-4" />
            )}
            <div className="space-y-4 text-sm leading-relaxed">
              <p>{selectedArticle.fullStory || selectedArticle.summary}</p>
              {selectedArticle.legalImpact && (
                <div className="p-3 bg-amber-50 dark:bg-zinc-800 rounded border-l-2 border-amber-600 text-xs">
                  <strong>Impacto Legal:</strong> {selectedArticle.legalImpact}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {showKeyModal && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-zinc-900 max-w-md w-full p-6 rounded-lg relative">
            <button onClick={() => setShowKeyModal(false)} className="absolute top-4 right-4 text-zinc-400">
              <X className="w-5 h-5" />
            </button>
            <h3 className="text-base font-serif font-bold mb-2">Ingresar Gemini API Key</h3>
            <input 
              type="password" 
              placeholder="AIzaSy..." 
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              className="w-full p-2 text-xs border rounded bg-transparent mb-4"
            />
            <button 
              onClick={() => handleSaveKey(apiKey)}
              className="w-full py-1.5 bg-amber-600 text-white rounded text-xs font-semibold"
            >
              Guardar Clave
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
