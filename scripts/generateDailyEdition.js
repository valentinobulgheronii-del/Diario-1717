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

async function generateDailyEdition() {
  console.log("Iniciando generación de edición diaria exhaustiva para 1717...");

  if (!apiKey) {
    console.error("Error: No se encontró la variable GEMINI_API_KEY.");
    process.exit(1);
  }

  const model = genAI.getGenerativeModel({ 
    model: "gemini-3.8-flash",
    tools: [{ googleSearch: {} }] 
  });

  const prompt = `Actúa como Editor en Jefe del diario privado "1717". Tu objetivo es investigar noticias reales del día de hoy y redactar un informe exhaustivo de fondo para 4 ejes:
  1. 'nacional': Política Nacional Argentina (medidas de gobierno, congreso, partidos).
  2. 'internacional': Política Internacional y geopolítica con impacto en Argentina o el mundo.
  3. 'jurisprudencia': Fallos judiciales destacados (CSJN, fuero contencioso/civil/penal, Corte IDH, etc.).
  4. 'tecnologia': Innovaciones masivas, regulaciones de IA y soberanía digital.

  REQUISITOS OBLIGATORIOS:
  - fullStory DEBE ser un texto largo, analítico y súper desarrollado (mínimo 600 a 1000 palabras por noticia) detallando antecedentes, hechos cronológicos, posturas y debate.
  - Para cada noticia DEBES incluir las URLs directas y reales a los artículos periodísticos o fallos judiciales consultados en la propiedad "sources" (array de objetos con "name" y "url" real).
  - imageUrl: Incluye una imagen válida temática de alta resolución (preferentemente de Unsplash o directamente vinculada a la temática).

  Devuelve ÚNICAMENTE un objeto JSON con este formato exacto:
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
        "sources": [
          {"name": "Nombre de la fuente (ej: Infobae / CIJ)", "url": "https://url-real-de-la-noticia"}
        ],
        "analysis": "string",
        "legalImpact": "string",
        "futureProjections": "string",
        "date": "Fecha actual",
        "readTime": "12 min"
      }
    ]
  }`;

  try {
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

    console.log(`¡Edición del día (${todayStr}) guardada exitosamente en Firebase con notas extensas y fuentes reales!`);
  } catch (error) {
    console.error("Error al generar la edición:", error);
    process.exit(1);
  }
}

generateDailyEdition();
