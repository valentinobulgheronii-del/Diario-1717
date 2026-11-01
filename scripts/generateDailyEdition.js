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

async function generateDailyEdition() {
  console.log("Iniciando generación de edición diaria para 1717...");

  if (!apiKey) {
    console.error("Error: No se encontró la variable GEMINI_API_KEY.");
    process.exit(1);
  }

  const model = genAI.getGenerativeModel({ model: "gemini-3.8-flash" });

  const prompt = `Actúa como Editor en Jefe del diario "1717". Genera la edición diaria completa en JSON estructurado.
  Investiga noticias reales de hoy para las siguientes 4 categorías:
  1. 'nacional': Política Nacional Argentina.
  2. 'internacional': Política Internacional y geopolítica.
  3. 'jurisprudencia': Fallos judiciales destacados (CSJN, fuero civil/comercial/penal, Corte IDH, etc.).
  4. 'tecnologia': Innovaciones y regulaciones de IA.

  REQUISITOS OBLIGATORIOS:
  - 'fullStory': Desarrollo extenso y completo de la noticia (mínimo 500 palabras por artículo).
  - 'sources': Lista de objetos {"name": "Nombre medio/fuente", "url": "https://url-real-de-la-noticia"}.
  - 'imageUrl': Imagen representativa temática de alta resolución.

  Devuelve ÚNICAMENTE un objeto JSON válido con la siguiente estructura:
  {
    "articles": [
      {
        "id": "string",
        "category": "nacional|internacional|jurisprudencia|tecnologia",
        "categoryLabel": "string",
        "title": "string",
        "subtitle": "string",
        "summary": "string",
        "imageUrl": "string",
        "imageCaption": "string",
        "background": "string",
        "fullStory": "string",
        "perspectives": "string",
        "veracityScore": 98,
        "sourcesCount": 4,
        "sources": [{"name": "string", "url": "string"}],
        "analysis": "string",
        "legalImpact": "string",
        "futureProjections": "string",
        "date": "Fecha de hoy",
        "readTime": "8 min"
      }
    ]
  }`;

  let attempts = 0;
  const maxAttempts = 3;
  let success = false;

  while (attempts < maxAttempts && !success) {
    try {
      attempts++;
      console.log(`Intento ${attempts} de ${maxAttempts}...`);
      
      const result = await model.generateContent(prompt);
      const responseText = result.response.text();
      const jsonMatch = responseText.match(/\{[\s\S]*\}/);
      
      if (!jsonMatch) throw new Error("No se obtuvo un JSON válido en la respuesta.");
      
      const editionData = JSON.parse(jsonMatch[0]);
      const todayStr = new Date().toISOString().split('T')[0];

      await setDoc(doc(db, "editions", todayStr), {
        date: todayStr,
        created_at: new Date().toISOString(),
        articles: editionData.articles
      });

      console.log(`¡Edición del día (${todayStr}) guardada exitosamente en Firebase!`);
      success = true;
    } catch (error) {
      console.warn(`Error en el intento ${attempts}:`, error.message || error);
      if (attempts < maxAttempts) {
        console.log("Reintentando en 10 segundos debido a alta demanda de la API...");
        await sleep(10000);
      } else {
        console.error("Se alcanzaron el número máximo de intentos. Abortando.");
        process.exit(1);
      }
    }
  }
}

generateDailyEdition();
