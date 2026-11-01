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
    sources: "La Política Online (LPO), Cenital, Letra P, La Nación, Clarín, Página/12, Perfil",
    promptContext: "Política Nacional Argentina, medidas de gobierno, congreso y partidos."
  },
  {
    id: "internacional",
    label: "Política Internacional",
    sources: "Politico, The Economist, Foreign Affairs, Foreign Policy, BBC News, Le Monde, El País",
    promptContext: "Geopolítica global, conflictos internacionales y diplomacia."
  },
  {
    id: "jurisprudencia",
    label: "Jurisprudencia y Fallos Judiciales",
    sources: "Diario Judicial, Palabras del Derecho, SAIJ, La Ley (Thomson Reuters), Microjuris, El Dial, SCOTUSblog, Lawfare, EJIL:Talk!",
    promptContext: "Fallos destacados de la CSJN, fueros federales, tribunales supranacionales o debates constitucionales."
  },
  {
    id: "tecnologia",
    label: "Tecnología e Innovación",
    sources: "Medios especializados en tecnología, IA, regulaciones digitales y soberanía tecnológica",
    promptContext: "Innovaciones masivas, regulaciones globales de IA y derecho digital."
  }
];

async function fetchArticleForCategory(categoryObj, todayStr) {
  const model = genAI.getGenerativeModel({ 
    model: "gemini-3.8-flash",
    tools: [{ googleSearch: {} }]
  });

  const prompt = `Actúa como Editor en Jefe del diario "1717". Investiga la noticia real más relevante ocurrida hoy (${todayStr}) sobre: ${categoryObj.promptContext}.
Prioriza información cruzada de estas fuentes: ${categoryObj.sources}.

REQUISITOS OBLIGATORIOS:
1. 'imageUrl': Extrae la URL directa de la imagen/fotografía periodística REAL publicada por el medio original para ilustrar la nota.
2. 'fullStory': Redacta un informe EXTREMADAMENTE DETALLADO y extenso (mínimo 800 palabras). Explica antecedentes, hechos, posturas y consecuencias citando las fuentes en el texto.
3. 'sources': Incluye un array con objetos {"name": "Nombre Medio", "url": "https://url-real-de-la-noticia"}.

Devuelve ÚNICAMENTE un objeto JSON válido con este formato:
{
  "id": "${categoryObj.id}_01",
  "category": "${categoryObj.id}",
  "categoryLabel": "${categoryObj.label}",
  "title": "Título preciso del hecho real",
  "subtitle": "Bajada explicativa amplia",
  "summary": "Resumen de aspectos clave",
  "imageUrl": "URL_REAL_DE_LA_FOTO_DE_LA_NOTICIA",
  "imageCaption": "Pie de foto citando medio o fotógrafo",
  "background": "Antecedentes históricos/normativos",
  "fullStory": "Texto largo y explicativo citando las fuentes...",
  "perspectives": "Análisis de partes y posturas en conflicto",
  "veracityScore": 99,
  "sourcesCount": 2,
  "sources": [{"name": "Nombre Medio", "url": "https://url-real"}],
  "analysis": "Análisis de fondo",
  "legalImpact": "Encuadre normativo o legal",
  "futureProjections": "Próximos pasos",
  "date": "${todayStr}",
  "readTime": "10 min"
}`;

  let attempts = 0;
  while (attempts < 3) {
    try {
      attempts++;
      console.log(`Generando noticia para categoría: ${categoryObj.id} (Intento ${attempts})...`);
      const result = await model.generateContent(prompt);
      const responseText = result.response.text();
      const jsonMatch = responseText.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      }
    } catch (err) {
      console.warn(`Error en categoría ${categoryObj.id}:`, err.message || err);
      if (attempts < 3) await sleep(15000);
    }
  }
  return null;
}

async function generateDailyEdition() {
  const todayStr = new Date().toISOString().split('T')[0];
  console.log(`Iniciando generación secuencial por categorías para 1717 (${todayStr})...`);

  if (!apiKey) {
    console.error("Error: No se encontró la variable GEMINI_API_KEY.");
    process.exit(1);
  }

  const compiledArticles = [];

  for (const cat of CATEGORIES) {
    const article = await fetchArticleForCategory(cat, todayStr);
    if (article) {
      compiledArticles.push(article);
    }
    // Pausa de 12 segundos entre llamadas para respetar estrictamente los límites por minuto
    console.log(`Pausa táctica de 12 segundos para respetar límites de cuota...`);
    await sleep(12000);
  }

  if (compiledArticles.length === 0) {
    console.error("No se pudo generar ninguna noticia.");
    process.exit(1);
  }

  await setDoc(doc(db, "editions", todayStr), {
    date: todayStr,
    created_at: new Date().toISOString(),
    articles: compiledArticles
  });

  console.log(`¡Edición del día (${todayStr}) guardada exitosamente en Firebase con ${compiledArticles.length} categorías completas!`);
}

generateDailyEdition();
