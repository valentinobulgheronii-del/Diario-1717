import React, { useState, useEffect } from 'react';
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

const INITIAL_ARTICLES = [
  {
    id: 'n1',
    category: 'nacional',
    categoryLabel: 'Política Nacional',
    title: 'Debate en el Congreso por la Ley de Financiamiento Político y Reformas Electorales',
    subtitle: 'El oficialismo busca dictamen mayoritario en comisiones mientras la oposición exige modificaciones estructurales a los topes de aportes corporativos.',
    summary: 'La Cámara de Diputados inició un plenario de comisiones para tratar el proyecto de reforma al régimen de financiamiento de los partidos políticos y la legislación electoral.',
    imageUrl: 'https://images.unsplash.com/photo-1541872703-74c5e44368f9?auto=format&fit=crop&w=1200&q=80',
    imageCaption: 'Sesión plenaria de las comisiones de Asuntos Constitucionales y Justicia en la Cámara de Diputados.',
    veracityScore: 98,
    sourcesCount: 5,
    sources: [
      { name: 'Infobae', url: '#' },
      { name: 'La Nación', url: '#' },
      { name: 'Página/12', url: '#' },
      { name: 'Clarín', url: '#' }
    ],
    background: 'En las últimas dos décadas, el régimen de financiamiento electoral argentino (Ley 26.215) ha enfrentado críticas por la proliferación de rendiciones de cuentas opacas y aportes en efectivo difíciles de auditar.',
    fullStory: 'Durante la jornada legislativa, el plenario de comisiones debatió el dictamen promovido por el oficialismo...\n\nPor su parte, los bloques opositores presentaron dictámenes de minoría...',
    perspectives: 'Mientras la bancada oficialista sostiene que la bancarización total transparenta operaciones, la oposición argumenta que se amplía el margen de influencia del capital corporativo.',
    analysis: 'El desenlace del debate en Diputados marcará la pauta del equilibrio de fuerzas políticas para el resto del año parlamentario.',
    legalImpact: 'Reforma sustantiva del Código Electoral Nacional (Ley 19.945) y la Ley de Financiamiento Político (Ley 26.215).',
    futureProjections: 'Se proyecta una votación ajustada en el recinto en las próximas dos semanas.',
    date: '31 de Octubre, 2026',
    readTime: '8 min'
  },
  {
    id: 'j1',
    category: 'jurisprudencia',
    categoryLabel: 'Jurisprudencia y Fallos',
    title: 'Corte Suprema fija nuevo precedente sobre responsabilidad de plataformas en protección de datos',
    subtitle: 'El máximo tribunal dictó fallo de fondo reafirmando la doctrina de la intencionalidad y negligencia grave para la remoción de contenidos en buscadores.',
    summary: 'En una sentencia unánime de alto valor institucional, la Corte Suprema de Justicia de la Nación delimitó el alcance del estándar de responsabilidad civil aplicable a los motores de búsqueda.',
    imageUrl: 'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?auto=format&fit=crop&w=1200&q=80',
    imageCaption: 'Fachada del Palacio de Justicia de la Nación, sede de la CSJN en Buenos Aires.',
    veracityScore: 99,
    sourcesCount: 6,
    sources: [
      { name: 'CIJ', url: '#' },
      { name: 'La Ley', url: '#' },
      { name: 'Diario Judicial', url: '#' }
    ],
    background: 'El litigio comenzó tras la demanda de una figura pública que solicitaba la desvinculación automática de su nombre de determinados sitios web.',
    fullStory: 'La Corte confirmó el criterio de que los intermediarios de internet no son responsables subjetiva ni objetivamente por los contenidos generados por usuarios finales...',
    perspectives: 'Organizaciones defensoras de la libertad de expresión celebraron el fallo, mientras que juristas especializados manifestaron reserva sobre el alto umbral exigido.',
    analysis: 'Este fallo unifica la doctrina nacional con los precedentes fijados por la Corte IDH.',
    legalImpact: 'Sienta jurisprudencia vinculante para los fueros Civil y Comercial Federal sobre notificación judicial previa.',
    futureProjections: 'Inspirará proyectos de ley pendientes en el Congreso para codificar el régimen digital.',
    date: '31 de Octubre, 2026',
    readTime: '10 min'
  },
  {
    id: 'i1',
    category: 'internacional',
    categoryLabel: 'Política Internacional',
    title: 'El Acuerdo U.E. - Mercosur entra en su fase definitiva de ratificación e impacto comercial',
    subtitle: 'Cancilleres latinoamericanos y delegados del bloque europeo sellan compromisos ambientales.',
    summary: 'Tras extensas rondas de negociación técnica en Bruselas, las delegaciones diplomáticas acordaron la adenda complementaria sobre trazabilidad de la cadena de suministro.',
    imageUrl: 'https://images.unsplash.com/photo-1529107386315-e1a2ed48a620?auto=format&fit=crop&w=1200&q=80',
    imageCaption: 'Edificio Berlaymont, sede de la Comisión Europea en Bruselas.',
    veracityScore: 96,
    sourcesCount: 7,
    sources: [
      { name: 'Reuters', url: '#' },
      { name: 'El País', url: '#' },
      { name: 'Financial Times', url: '#' }
    ],
    background: 'Las negociaciones entre la Unión Europea y el Mercosur comenzaron formalmente en 1999.',
    fullStory: 'El texto acordado incluye un mecanismo equitativo de compensación y asistencia técnica para los productores agroindustriales sudamericanos...',
    perspectives: 'Francia mantiene reservas sobre el impacto en sus mercados agrarios, mientras que España, Brasil y Argentina lideran la presión política.',
    analysis: 'El acuerdo refuerza el posicionamiento del Mercosur como proveedor estratégico global de alimentos y energía limpia.',
    legalImpact: 'Tratado de Derecho Internacional Público que requiere ratificación del Parlamento Europeo y parlamentos del Mercosur.',
    futureProjections: 'Se prevé la firma formal del instrumento en la próxima cumbre de Jefes de Estado.',
    date: '31 de Octubre, 2026',
    readTime: '9 min'
  },
  {
    id: 't1',
    category: 'tecnologia',
    categoryLabel: 'Tecnología e Innovación',
    title: 'EE.UU. y la Unión Europea establecen marco conjunto para la auditoría y transparencia de Algoritmos GenAI',
    subtitle: 'El nuevo estándar internacional exige revelación de fuentes de datos y marcas de agua indelebles.',
    summary: 'Los organismos de regulación digital de ambos continentes firmaron una resolución conjunta para homologar los requerimientos de seguridad y derechos de autor en IA.',
    imageUrl: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=1200&q=80',
    imageCaption: 'Redes neuronales e infraestructura de procesamiento de datos.',
    veracityScore: 95,
    sourcesCount: 5,
    sources: [
      { name: 'MIT Tech Review', url: '#' },
      { name: 'Wired', url: '#' }
    ],
    background: 'El vertiginoso desarrollo de modelos de lenguaje impulsó disputas judiciales masivas planteadas por creadores de contenido.',
    fullStory: 'El acuerdo ratificado impone que toda empresa desarrolladora de modelos fundacionales deberá presentar un expediente técnico detallado ante las autoridades regulatorias...',
    perspectives: 'Desarrolladores advierten que esquemas muy restrictivos podrían ralentizar la innovación, mientras creadores celebran el equilibrio normativo.',
    analysis: 'La norma crea el primer estándar global de facto en gobernanza algorítmica.',
    legalImpact: 'Armonización internacional del derecho de Propiedad Intelectual y Gobernanza Global de Datos.',
    futureProjections: 'Las primeras auditorías conjuntas a empresas tecnológicas comenzarán el próximo trimestre.',
    date: '31 de Octubre, 2026',
    readTime: '7 min'
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
      const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-pro:generateContent?key=${effectiveKey}`;

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
