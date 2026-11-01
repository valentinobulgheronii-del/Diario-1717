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

const DEFAULT_IMAGES = {
  nacional: "https://images.unsplash.com/photo-1541872703-74c5e44368f9?auto=format&fit=crop&w=1200&q=80",
  internacional: "https://images.unsplash.com/photo-1529107386315-e1a2ed48a620?auto=format&fit=crop&w=1200&q=80",
  jurisprudencia: "https://images.unsplash.com/photo-1589829545856-d10d557cf95f?auto=format&fit=crop&w=1200&q=80",
  tecnologia: "https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=1200&q=80"
};

async function generateDailyEdition() {
  const todayStr = new Date().toISOString().split('T')[0];
  console.log(`Iniciando generación para 1717 (${todayStr})...`);

  if (!apiKey) {
    console.error("Error: No se encontró la variable GEMINI_API_KEY.");
    process.exit(1);
  }

  const model = genAI.getGenerativeModel({ model: "gemini-3.8-flash" });

  const prompt = `Actúa como Editor en Jefe del diario "1717". Genera la edición del día (${todayStr}) cruzando información de fuentes periodísticas y jurídicas especializadas (La Ley, SAIJ, Diario Judicial, Palabras del Derecho, LPO, Cenital, Letra P, La Nación, Clarín, Politico, Lawfare, etc.).

Debes generar exactamente 4 artículos extensos (uno por cada eje obligatorio: 'nacional', 'internacional', 'jurisprudencia', 'tecnologia').

REQUISITOS:
1. 'fullStory': Desarrollo profundo (mínimo 600 palabras) citando las fuentes especializadas en el texto.
2. 'sources': Array de fuentes reales con su URL: [{"name": "Diario Judicial", "url": "https://www.diariojudicial.com/..."}].
3. 'imageUrl': URL de imagen temática representativa de alta calidad.

Devuelve ÚNICAMENTE un objeto JSON válido con esta estructura:
{
  "articles": [
    {
      "id": "nac_01",
      "category": "nacional",
      "categoryLabel": "Política Nacional",
      "title": "Título real de la noticia principal",
      "subtitle": "Bajada descriptiva",
      "summary": "Resumen ejecutivo",
      "imageUrl": "https://images.unsplash.com/...",
      "imageCaption": "Pie de foto descriptivo",
      "background": "Contexto e historia",
      "fullStory": "Desarrollo completo citando las fuentes...",
      "perspectives": "Posturas en debate",
      "veracityScore": 98,
      "sourcesCount": 3,
      "sources": [{"name": "La Política Online", "url": "https://www.lapoliticaonline.com/..."}],
      "analysis": "Análisis político o jurídico",
      "legalImpact": "Encuadre normativo",
      "futureProjections": "Proyecciones a futuro",
      "date": "${todayStr}",
      "readTime": "8 min"
    },
    {
      "id": "int_01",
      "category": "internacional",
      "categoryLabel": "Política Internacional",
      ...
    },
    {
      "id": "jur_01",
      "category": "jurisprudencia",
      "categoryLabel": "Jurisprudencia y Fallos Judiciales",
      ...
    },
    {
      "id": "tec_01",
      "category": "tecnologia",
      "categoryLabel": "Tecnología e Innovación",
      ...
    }
  ]
}`;

  let attempts = 0;
  const maxAttempts = 3;
  let success = false;

  while (attempts < maxAttempts && !success) {
    try {
      attempts++;
      console.log(`Buscando noticias y compilando edición (Intento ${attempts} de ${maxAttempts})...`);
      
      const result = await model.generateContent(prompt);
      const responseText = result.response.text();
      const jsonMatch = responseText.match(/\{[\s\S]*\}/);
      
      if (!jsonMatch) throw new Error("No se obtuvo un objeto JSON válido.");
      
      const editionData = JSON.parse(jsonMatch[0]);

      const cleanedArticles = editionData.articles.map((art) => ({
        ...art,
        imageUrl: art.imageUrl && art.imageUrl.startsWith('http') 
          ? art.imageUrl 
          : DEFAULT_IMAGES[art.category] || DEFAULT_IMAGES.nacional
      }));

      await setDoc(doc(db, "editions", todayStr), {
        date: todayStr,
        created_at: new Date().toISOString(),
        articles: cleanedArticles
      });

      console.log(`¡Edición del día (${todayStr}) guardada exitosamente en Firebase!`);
      success = true;
    } catch (error) {
      console.warn(`Error en intento ${attempts}:`, error.message || error);
      if (attempts < maxAttempts) {
        console.log("Esperando 35 segundos para liberar la cuota de la API...");
        await sleep(35000);
      } else {
        console.error("No se pudo completar la generación diaria tras múltiples intentos.");
        process.exit(1);
      }
    }
  }
}

generateDailyEdition();
