const { GoogleGenerativeAI } = require('@google/generative-ai');
const { initializeApp } = require('firebase/app');
const { getFirestore, doc, setDoc } = require('firebase/firestore');

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
  console.log("Iniciando generación de edición diaria para 1717...");

  if (!apiKey) {
    console.error("Error: No se encontró la variable GEMINI_API_KEY.");
    process.exit(1);
  }

  const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

  const prompt = `Actúa como Editor en Jefe del diario "1717". Genera la edición diaria completa en JSON estructurado. 
  Debes buscar y sintetizar las noticias más importantes de hoy cruzando múltiples fuentes confiables en los siguientes ejes:
  1. Política Nacional Argentina (Oficialismo y Oposición).
  2. Política Internacional (Relaciones exteriores de Argentina y Geopolítica mundial).
  3. Jurisprudencia y Fallos Judiciales (CSJN, cortes nacionales destacadas, Corte IDH, CIJ, etc.).
  4. Tecnología e Innovación.

  Cada noticia debe incluir: id, category, categoryLabel, title, subtitle, summary, imageUrl, imageCaption, background, fullStory, perspectives, veracityScore, sourcesCount, sources, analysis, legalImpact, futureProjections, readTime.
  
  Responde ÚNICAMENTE con un objeto JSON con la propiedad "articles" (array de artículos).`;

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

    console.log(`¡Edición del día (${todayStr}) guardada exitosamente en Firebase!`);
  } catch (error) {
    console.error("Error detallado al generar la edición:", error);
    process.exit(1);
  }
}

generateDailyEdition();
