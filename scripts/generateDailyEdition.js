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
  const todayStr = new Date().toISOString().split('T')[0];
  console.log(`Iniciando generación con búsqueda en tiempo real para 1717 (${todayStr})...`);

  if (!apiKey) {
    console.error("Error: No se encontró la variable GEMINI_API_KEY.");
    process.exit(1);
  }

  // Activar la herramienta de búsqueda para obtener fotos y datos reales
  const model = genAI.getGenerativeModel({ 
    model: "gemini-3.8-flash",
    tools: [{ googleSearch: {} }]
  });

  const prompt = `Actúa como Editor en Jefe del diario "1717". Tu objetivo es investigar las noticias reales más importantes acontecidas hoy (${todayStr}) cruzando información de medios especializados (La Ley, SAIJ, Diario Judicial, Palabras del Derecho, LPO, Cenital, Letra P, La Nación, Clarín, Politico, Lawfare, etc.).

Genera obligatoriamente 4 informes de investigación profunda (uno por cada categoría: 'nacional', 'internacional', 'jurisprudencia', 'tecnologia').

REQUISITOS ESTRICTOS DE EXTENSIÓN E IMÁGENES REALES:
1. 'imageUrl': DEBES buscar y extraer la URL directa de la imagen/fotografía periodística REAL publicada por el medio original para ilustrar la nota. No uses imágenes estáticas ni genéricas.
2. 'fullStory': Redacta un informe EXTREMADAMENTE DETALLADO y extenso (mínimo 800 a 1200 palabras por noticia). Debe explicar:
   - Antecedentes históricos y normativos.
   - Cronología de los hechos recientes.
   - Posturas cruzadas de los actores principales.
   - Consecuencias legales, políticas o tecnológicas de largo plazo.
3. 'sources': Incluye los links directos y reales a las notas periodísticas o fallos judiciales de donde extrajiste la información.

Devuelve ÚNICAMENTE un objeto JSON válido con la siguiente estructura:
{
  "articles": [
    {
      "id": "nac_01",
      "category": "nacional",
      "categoryLabel": "Política Nacional",
      "title": "Título preciso y real del hecho",
      "subtitle": "Bajada explicativa amplia",
      "summary": "Resumen de los aspectos clave",
      "imageUrl": "URL_REAL_DE_LA_FOTO_DE_LA_NOTICIA",
      "imageCaption": "Pie de foto citando al fotógrafo o medio original",
      "background": "Explicación detallada del contexto previo...",
      "fullStory": "Texto sumamente extenso y explicativo desarrollado a fondo...",
      "perspectives": "Análisis de las distintas partes y posturas en conflicto...",
      "veracityScore": 99,
      "sourcesCount": 3,
      "sources": [
        {"name": "Nombre del Medio", "url": "https://url-real-de-la-noticia"}
      ],
      "analysis": "Análisis técnico-político de fondo",
      "legalImpact": "Impacto regulatorio, legal o constitucional",
      "futureProjections": "Proyecciones a futuro del escenario",
      "date": "${todayStr}",
      "readTime": "12 min"
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
      console.log(`Buscando imágenes y redactando notas de fondo (Intento ${attempts} de ${maxAttempts})...`);
      
      const result = await model.generateContent(prompt);
      const responseText = result.response.text();
      const jsonMatch = responseText.match(/\{[\s\S]*\}/);
      
      if (!jsonMatch) throw new Error("No se obtuvo un objeto JSON válido.");
      
      const editionData = JSON.parse(jsonMatch[0]);

      await setDoc(doc(db, "editions", todayStr), {
        date: todayStr,
        created_at: new Date().toISOString(),
        articles: editionData.articles
      });

      console.log(`¡Edición del día (${todayStr}) guardada exitosamente en Firebase con imágenes reales y notas explicativas!`);
      success = true;
    } catch (error) {
      console.warn(`Error en intento ${attempts}:`, error.message || error);
      if (attempts < maxAttempts) {
        console.log("Esperando 40 segundos para liberar la cuota de búsqueda de la API...");
        await sleep(40000);
      } else {
        console.error("No se pudo completar la generación tras múltiples intentos.");
        process.exit(1);
      }
    }
  }
}

generateDailyEdition();
