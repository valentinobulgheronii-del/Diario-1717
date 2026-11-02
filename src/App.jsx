const handleGenerateEdition = async () => {
    if (!apiKey) {
      setShowKeyModal(true);
      return;
    }

    setIsGenerating(true);
    setStatusMessage('Buscando noticias reales con Google Search...');

    try {
      const systemPrompt = `Eres el Editor General del diario '1717'. Genera un informe periodístico extenso en JSON. NO inventes URLs. Usa exclusivamente los enlaces reales que encuentres.`;
      const userQuery = `Investiga las noticias más importantes de hoy en Argentina y el mundo para: 'nacional', 'internacional', 'jurisprudencia' y 'tecnologia'. Extrae links de fuentes reales y redacta un desarrollo completo (más de 600 palabras por nota). Extrae la URL de la imagen fotográfica real de la noticia.`;

      const effectiveKey = apiKey.trim();
      // Corrección fundamental: usar el modelo real gemini-1.5-flash para la web
      const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${effectiveKey}`;

      const payload = {
        contents: [{ parts: [{ text: userQuery }] }],
        systemInstruction: { parts: [{ text: systemPrompt }] },
        tools: [{ googleSearch: {} }], // Activamos búsqueda en vivo también en la web
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
