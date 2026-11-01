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
  console.log(`Iniciando generación del resumen informativo para 1717 (${todayStr})...`);

  if (!apiKey) {
    console.error("Error: No se encontró la variable GEMINI_API_KEY.");
    process.exit(1);
  }

  const model = genAI.getGenerativeModel({ 
    model: "gemini-3.8-flash",
    tools: [{ googleSearch: {} }]
  });

  const prompt = `Actúa como Editor en Jefe del diario "1717". Tu tarea es compilar las principales noticias acontecidas hoy (${todayStr}), cruzando datos de fuentes periodísticas y jurídicas especializadas.

Debes buscar activamente información en las siguientes fuentes de referencia según el eje:
- JURISPRUDENCIA Y DERECHO: Diario Judicial, Palabras del Derecho, SAIJ, La Ley (Thomson Reuters), Microjuris, El Dial, La Nación (Sección Judiciales), SCOTUSblog, Verfassungsblog, Lawfare, EJIL:Talk!.
- POLÍTICA NACIONAL: La Política Online (LPO), Cenital, Letra P, Clarín, La Nación, Página/12, Perfil, El Destape.
- POLÍTICA INTERNACIONAL Y GEOPOLÍTICA: Politico, The Economist, Foreign Affairs, Foreign Policy, BBC News, Le Monde, El País, World Justice Project.
- TECNOLOGÍA Y REGULACIÓN: Cobertura especializada sobre IA, derecho digital y gobernanza tecnológica.

REQUISITOS MANDATORIOS:
1. Genera exactamente 4 artículos extensos (uno por eje obligatorio: 'nacional', 'internacional', 'jurisprudencia', 'tecnologia').
2. 'fullStory': Desarrollo periodístico de fondo (mínimo 600 a 1000 palabras por nota), con citas explícitas a los medios o fallos consultados en el texto (ej. "según reveló Diario Judicial..." o "conforme al análisis de Cenital...").
3. 'sources': Array con los enlaces exactos y reales hacia la notaPeriodística o fallo oficial consultado: [{"name": "Diario Judicial", "url": "https://www.diariojudicial.com/..."}, {"name": "La Nación", "url": "https://..."}].
4. 'imageUrl': Extrae la URL de la imagen fotográfica real vinculada a la noticia o reporte del medio original.

Devuelve ÚNICAMENTE un objeto JSON válido con esta estructura exactas:
{
  "articles": [
    {
      "id": "nac_01",
      "category": "nacional",
      "categoryLabel": "Política Nacional",
      "title": "Título real de la noticia principal",
      "subtitle": "Bajada descriptiva de la noticia",
      "summary": "Resumen ejecutivo con los puntos clave",
      "imageUrl": "https://url-de-la-imagen-real-de-la-noticia",
      "imageCaption": "Pie de foto indicando fuente o contexto",
      "background": "Antecedentes y contexto institucional",
      "fullStory": "Desarrollo profundo citando textualmente las fuentes consultadas...",
      "perspectives": "Análisis de las partes involucradas",
      "veracityScore": 98,
      "sourcesCount": 3,
      "sources": [
        {"name": "La Política Online", "url": "https://www.lapoliticaonline.com/..."}
      ],
      "analysis": "Análisis político o constitucional",
      "legalImpact": "Encuadre normativo y técnico",
      "futureProjections": "Próximos pasos institucionales",
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
      
      if (!jsonMatch) throw new Error("No se obtuvo un objeto JSON válido en la respuesta.");
      
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

      console.log(`¡Edición del día (${todayStr}) sincronizada con éxito en Firebase!`);
      success = true;
    } catch (error) {
      console.warn(`Error durante la generación (intento ${attempts}):`, error.message || error);
      if (attempts < maxAttempts) {
        console.log("Reintentando en 10 segundos...");
        await sleep(10000);
      } else {
        console.error("No se pudo completar la generación diaria tras múltiples intentos.");
        process.exit(1);
      }
    }
  }
}

generateDailyEdition();
