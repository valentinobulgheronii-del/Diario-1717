const handleGenerateEdition = async () => {
    if (!apiKey) {
      setShowKeyModal(true);
      return;
    }

    setIsGenerating(true);
    setStatusMessage('Buscando noticias reales e imágenes con Google Search (Flash)...');

    try {
      const systemPrompt = `Eres el Editor General del diario '1717'. Genera un informe periodístico extenso en JSON. NO inventes URLs. Usa exclusivamente enlaces y URLs de imágenes reales que encuentres.`;
      const userQuery = `Investiga las noticias reales más importantes de hoy en Argentina y el mundo para: 'nacional', 'internacional', 'jurisprudencia' y 'tecnologia'. Extrae links de fuentes reales y la URL de la foto original de la noticia.
      
      Devuelve ÚNICAMENTE un JSON con esta estructura exacta:
      {
        "articles": [
          {
            "id": "nac_01",
            "category": "nacional",
            "categoryLabel": "Política Nacional",
            "title": "Título real",
            "subtitle": "Bajada descriptiva",
            "summary": "Resumen ejecutivo",
            "imageUrl": "URL_FOTO_REAL",
            "imageCaption": "Fuente de la imagen",
            "background": "Contexto",
            "fullStory": "Desarrollo completo y extenso citando las fuentes...",
            "perspectives": "Posturas cruzadas",
            "veracityScore": 99,
            "sourcesCount": 2,
            "sources": [{"name": "Nombre Medio", "url": "URL_REAL"}],
            "analysis": "Análisis político",
            "legalImpact": "Encuadre normativo",
            "futureProjections": "Proyecciones",
            "date": "Fecha de hoy",
            "readTime": "12 min"
          }
        ]
      }`;

      const effectiveKey = apiKey.trim();
      // Endpoint corregido con el modelo FLASH para evitar el error 404 en cuentas gratuitas
      const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${effectiveKey}`;

      const payload = {
        contents: [{ parts: [{ text: userQuery }] }],
        systemInstruction: { parts: [{ text: systemPrompt }] },
        tools: [{ googleSearch: {} }],
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
          setStatusMessage('¡La nueva edición se generó correctamente!');
        }
      }
    } catch (err) {
      console.error(err);
      setStatusMessage('Error al conectar. Verifica tu conexión o clave.');
    } finally {
      setIsGenerating(false);
      setTimeout(() => setStatusMessage(''), 5000);
    }
  };
