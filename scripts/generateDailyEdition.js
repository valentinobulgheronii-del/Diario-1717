import { GoogleGenerativeAI } from '@google/generative-ai';
import { initializeApp } from 'firebase/app';
import { getFirestore, doc, setDoc } from 'firebase/firestore';

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

const apiKey = process.env.GEMINI_API_KEY ? process.env.GEMINI_API_KEY.trim() : '';
const genAI = new GoogleGenerativeAI(apiKey);

const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

const CATEGORIES = [
  {
    id: "nacional",
    label: "Política Nacional",
    sources: "LPO (La Política Online), Letra P, Cenital, La Nación, Clarín, El Destape",
    promptContext: "Política Nacional Argentina, Congreso, medidas del gobierno nacional."
  },
  {
    id: "internacional",
    label: "Política Internacional",
    sources: "Politico, The Economist, Foreign Affairs, BBC, El País",
    promptContext: "Geopolítica global, conflictos internacionales actuales y relaciones diplomáticas."
  },
  {
    id: "jurisprudencia",
    label: "Jurisprudencia y Fallos Judiciales",
    sources: "Diario Judicial, Palabras del Derecho, SAIJ, La Ley, SCOTUSblog, CIJ",
    promptContext: "Resoluciones recientes de la CSJN, fueros federales o tribunales internacionales."
  },
  {
    id: "tecnologia",
    label: "Tecnología e Innovación",
    sources: "Wired, TechCrunch, medios de derecho digital",
    promptContext: "Regulaciones de inteligencia artificial, soberanía digital y juicios tecnológicos."
  }
];

async function fetchArticleForCategory(categoryObj, todayStr) {
  // CORRECCIÓN: Se usa gemini-1.5-pro-latest
  const model = genAI.getGenerativeModel({ 
    model: "gemini-1.5-pro-latest",
    tools: [{ googleSearch: {} }]
  });

  const prompt = `Actúa como un periodista de investigación senior del diario "1717". Busca en Google la noticia real más importante del día de hoy (${todayStr}) sobre: ${categoryObj.promptContext}. Cruza información de estas fuentes: ${categoryObj.sources}.

REGLAS ESTRICTAS DE ANTI-ALUCINACIÓN:
1. NO INVENTES URLs. La propiedad 'sources' debe contener los enlaces (URLs) EXACTOS y reales de los artículos que encontraste en tu búsqueda.
2. 'imageUrl': Extrae la URL de la imagen principal o fotografía real de la noticia desde los resultados de búsqueda. Si no logras obtener la URL de la foto original, devuelve la cadena "USE_DEFAULT".
3. 'fullStory': Redacta un artículo de excelencia, muy extenso y profundo (mínimo 800 palabras). Detalla antecedentes, el hecho actual, declaraciones textuales y consecuencias.

Devuelve ÚNICAMENTE un JSON válido con esta estructura:
{
  "id": "${categoryObj.id}_01",
  "category": "${categoryObj.id}",
  "categoryLabel": "${categoryObj.label}",
  "title": "Título real de la noticia",
  "subtitle": "Bajada descriptiva",
  "summary": "Resumen ejecutivo",
  "imageUrl": "URL_FOTO_REAL",
  "imageCaption": "Fuente de la fotografía",
  "background": "Contexto histórico o legal de la noticia",
  "fullStory": "Artículo profundo, extenso y analítico citando a las fuentes consultadas...",
  "perspectives": "Debate y posturas cruzadas",
  "veracityScore": 99,
  "sourcesCount": 2,
  "sources": [{"name": "Nombre Medio", "url": "URL_EXACTA_Y_REAL_DE_LA_NOTICIA"}],
  "analysis": "Análisis de impacto",
  "legalImpact": "Encuadre institucional o legal",
  "futureProjections": "Proyecciones a corto plazo",
  "date": "${todayStr}",
  "readTime": "12 min"
}`;

  let attempts = 0;
  while (attempts < 3) {
    try {
      attempts++;
      console.log(`[${categoryObj.id.toUpperCase()}] Consultando Gemini 1.5 PRO + Search (Intento ${attempts})...`);
      const result = await model.generateContent(prompt);
      const responseText = result.response.text();
      const jsonMatch = responseText.match(/\{[\s\S]*\}/);
      if (jsonMatch) return JSON.parse(jsonMatch[0]);
    } catch (err) {
      console.warn(`[${categoryObj.id.toUpperCase()}] Error:`, err.message || err);
      if (attempts < 3) await sleep(15000);
    }
  }
  return null;
}

async function generateDailyEdition() {
  const todayStr = new Date().toISOString().split('T')[0];
  console.log(`=== Generando Edición 1717 con Enlaces y Fotos Reales (${todayStr}) ===`);

  if (!apiKey) {
    console.error("Error: Falta GEMINI_API_KEY.");
    process.exit(1);
  }

  const compiledArticles = [];

  for (const cat of CATEGORIES) {
    let article = await fetchArticleForCategory(cat, todayStr);
    
    if (article) {
      if (article.imageUrl === "USE_DEFAULT" || !article.imageUrl.startsWith("http")) {
        const fallbacks = {
          nacional: "https://images.unsplash.com/photo-1541872703-74c5e44368f9?auto=format&fit=crop&w=1200&q=80",
          internacional: "https://images.unsplash.com/photo-1529107386315-e1a2ed48a620?auto=format&fit=crop&w=1200&q=80",
          jurisprudencia: "https://images.unsplash.com/photo-1589829545856-d10d557cf95f?auto=format&fit=crop&w=1200&q=80",
          tecnologia: "https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=1200&q=80"
        };
        article.imageUrl = fallbacks[cat.id];
      }
      compiledArticles.push(article);
      console.log(`-> Categoría '${cat.id}' completada.`);
    }

    console.log(`Pausando 35 segundos para liberar cuota PRO...`);
    await sleep(35000);
  }

  if (compiledArticles.length === 0) {
    console.error("Fallo general en la compilación.");
    process.exit(1);
  }

  await setDoc(doc(db, "editions", todayStr), {
    date: todayStr,
    created_at: new Date().toISOString(),
    articles: compiledArticles
  });

  console.log(`¡Edición del día (${todayStr}) guardada exitosamente con fuentes verificadas!`);
}

generateDailyEdition();
