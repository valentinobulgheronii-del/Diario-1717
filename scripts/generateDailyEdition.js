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
    sources: "La Política Online (LPO), Cenital, Letra P, La Nación, Clarín, Página/12, Perfil, El Destape",
    promptContext: "Política Nacional Argentina, medidas de gobierno, rosca parlamentaria, congreso y decisiones del Poder Ejecutivo."
  },
  {
    id: "internacional",
    label: "Política Internacional",
    sources: "Politico, The Economist, Foreign Affairs, Foreign Policy, BBC News, Le Monde, El País",
    promptContext: "Geopolítica global, conflictos internacionales, diplomacia y análisis del Estado de Derecho internacional."
  },
  {
    id: "jurisprudencia",
    label: "Jurisprudencia y Fallos Judiciales",
    sources: "Diario Judicial, Palabras del Derecho, SAIJ, La Ley (Thomson Reuters), Microjuris, El Dial, SCOTUSblog, Lawfare, EJIL:Talk!",
    promptContext: "Fallos jurisprudenciales destacados (CSJN, fueros federales, fuero contencioso administrativo, Corte IDH) y debates constitucionales."
  },
  {
    id: "tecnologia",
    label: "Tecnología e Innovación",
    sources: "Wired, TechCrunch, Arstechnica, regulaciones globales de IA, medios especializados en derecho digital",
    promptContext: "Regulaciones de IA, soberanía digital, leyes de protección de datos e innovaciones tecnológicas clave."
  }
];

async function fetchArticleForCategory(categoryObj, todayStr) {
  const model = genAI.getGenerativeModel({ 
    model: "gemini-3.8-flash",
    tools: [{ googleSearch: {} }]
  });

  const prompt = `Actúa como Editor en Jefe del diario "1717". Tu objetivo es investigar la noticia real más importante acontecida hoy (${todayStr}) sobre: ${categoryObj.promptContext}.

Consulta e integra información cruzada de estas fuentes especializadas: ${categoryObj.sources}.

REQUISITOS OBLIGATORIOS:
1. 'imageUrl': Extrae la URL directa de la imagen/fotografía periodística REAL publicada por el medio original para ilustrar la cobertura del hecho.
2. 'fullStory': Redacta un informe analítico y EXTREMADAMENTE DETALLADO (mínimo 700 a 1000 palabras). Explicá en párrafos separados: antecedentes normativos/políticos, cronología del hecho, posturas de los actores implicados y consecuencias a futuro. Cita explícitamente las fuentes dentro del texto (ej: "según reveló Diario Judicial..." o "conforme al análisis de LPO...").
3. 'sources': Array con objetos de enlaces reales: [{"name": "Nombre del Medio", "url": "https://url-real-de-la-noticia"}].

Devuelve ÚNICAMENTE un objeto JSON válido con esta estructura exacta:
{
  "id": "${categoryObj.id}_01",
  "category": "${categoryObj.id}",
  "categoryLabel": "${categoryObj.label}",
  "title": "Título preciso del hecho real",
  "subtitle": "Bajada explicativa de fondo",
  "summary": "Resumen ejecutivo de los puntos clave",
  "imageUrl": "URL_REAL_DE_LA_FOTO_DE_LA_NOTICIA",
  "imageCaption": "Pie de foto citando al medio o fotógrafo original",
  "background": "Antecedentes e historia previa del conflicto o norma",
  "fullStory": "Desarrollo extenso citando textualmente las fuentes...",
  "perspectives": "Posturas cruzadas y debates centrales",
  "veracityScore": 98,
  "sourcesCount": 2,
  "sources": [{"name": "Nombre Medio", "url": "https://url-real"}],
  "analysis": "Análisis político o normativo de fondo",
  "legalImpact": "Encuadre normativo y técnico",
  "futureProjections": "Qué se espera a continuación",
  "date": "${todayStr}",
  "readTime": "10 min"
}`;

  let attempts = 0;
  const maxAttempts = 3;

  while (attempts < maxAttempts) {
    try {
      attempts++;
      console.log(`[${categoryObj.id.toUpperCase()}] Consultando Gemini + Search (Intento ${attempts})...`);
      
      const result = await model.generateContent(prompt);
      const responseText = result.response.text();
      const jsonMatch = responseText.match(/\{[\s\S]*\}/);
      
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      }
    } catch (err) {
      console.warn(`[${categoryObj.id.toUpperCase()}] Error en intento ${attempts}:`, err.message || err);
      if (attempts < maxAttempts) {
        console.log(`Pausa de 30 segundos para liberar la cuota de la API...`);
        await sleep(30000);
      }
    }
  }
  return null;
}

async function generateDailyEdition() {
  const todayStr = new Date().toISOString().split('T')[0];
  console.log(`=== Iniciando compilación diaria para 1717 (${todayStr}) ===`);

  if (!apiKey) {
    console.error("Error: No se encontró la variable GEMINI_API_KEY.");
    process.exit(1);
  }

  const compiledArticles = [];

  for (const cat of CATEGORIES) {
    const article = await fetchArticleForCategory(cat, todayStr);
    if (article) {
      compiledArticles.push(article);
      console.log(`-> Categoría '${cat.id}' completada exitosamente.`);
    } else {
      console.warn(`-> No se pudo obtener la noticia para '${cat.id}'.`);
    }

    // Pausa de 20 segundos entre cada categoría para evitar golpear el límite RPM/TPM de Google Search Grounding
    console.log(`Pausa táctica de 20 segundos entre llamadas API...`);
    await sleep(20000);
  }

  if (compiledArticles.length === 0) {
    console.error("No se pudo compilar ninguna categoría.");
    process.exit(1);
  }

  await setDoc(doc(db, "editions", todayStr), {
    date: todayStr,
    created_at: new Date().toISOString(),
    articles: compiledArticles
  });

  console.log(`¡Edición del día (${todayStr}) sincronizada exitosamente en Firebase con ${compiledArticles.length} categorías!`);
}

generateDailyEdition();
