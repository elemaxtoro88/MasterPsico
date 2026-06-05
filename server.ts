/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

// Lazy-loaded Gemini Client
let geminiClient: GoogleGenAI | null = null;

function getGemini(): GoogleGenAI {
  if (!geminiClient) {
    const key = process.env.GEMINI_API_KEY;
    if (!key) {
      throw new Error("La variable GEMINI_API_KEY no está configurada. Por favor, añádela en la sección Configuración/Secretos.");
    }
    geminiClient = new GoogleGenAI({
      apiKey: key,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });
  }
  return geminiClient;
}

// Check api availability
app.get("/api/health", (req, res) => {
  res.json({
    status: "ok",
    hasGeminiKey: !!process.env.GEMINI_API_KEY,
    hasGroqKey: !!process.env.GROQ_API_KEY,
  });
});

/**
 * Helper to call Groq (Llama 3) as a fallback
 */
async function callGroq(prompt: string, systemInstruction: string, responseSchema: any) {
  console.log("Calling Groq (Llama 3) Fallback...");
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) throw new Error("GROQ_API_KEY no está configurada.");

  const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${apiKey}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      model: "llama-3.3-70b-versatile",
      messages: [
        { role: "system", content: systemInstruction },
        { role: "user", content: prompt }
      ],
      response_format: { type: "json_object" },
      temperature: 0.7
    })
  });

  if (!response.ok) {
    const errorBody = await response.text();
    console.error("Groq API Error Detail:", errorBody);
    throw new Error(`Groq API Error: ${response.statusText}`);
  }

  const data: any = await response.json();
  const content = data.choices[0].message.content;

  // Clean markdown JSON if present
  return content.replace(/```json/g, "").replace(/```/g, "").trim();
}

// Journal Analysis Route
app.post("/api/analyze-journal", async (req, res) => {
  const { text } = req.body;

  if (!text || typeof text !== "string" || text.trim().length < 10) {
    res.status(400).json({
      error: "Por favor, escribe un diario un poco más extenso (mínimo 10 caracteres) para un autoanálisis válido.",
    });
    return;
  }

  try {
    const ai = getGemini();
    const systemInstruction = `Eres Master Psico, una inteligencia artificial experta en análisis clínico-psicológico, cognitivo-conductual (TCC) y autoconocimiento.
Analizarás de forma estrictamente ética, empática y constructiva la entrada de diario de un usuario que busca autoanalizarse.
Debes responder en español en un formato estructurado estrictamente conforme al esquema JSON solicitado.
Tus observaciones deben orientar hacia la introspección saludable. Si encuentras distorsiones cognitivas comunes como el catastrofismo, sobregeneralización o pensamiento dicotómico, nómbralas y descríbelas amablemente. Tu tono debe ser cálido, científico y alentador.
REGLA CRÍTICA: Genera un feedback empático y estrategias de afrontamiento ÚNICAS para cada entrada. Evita frases genéricas o repetitivas. Inspírate en los detalles específicos del texto del usuario.`;

    let responseText: string = "";

    // Attempt Gemini first
    try {
      const model = ai.getGenerativeModel({ model: "gemini-1.5-flash", systemInstruction });
      const result = await model.generateContent({
        contents: [{ role: "user", parts: [{ text: `Analiza psicológicamente la siguiente entrada del usuario para su autoanálisis diario:\n\n"${text}"` }] }],
        generationConfig: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              valence: { type: Type.INTEGER },
              valenceLabel: { type: Type.STRING },
              identifiedDistortions: { type: Type.ARRAY, items: { type: Type.STRING } },
              keyConstructs: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    name: { type: Type.STRING },
                    score: { type: Type.INTEGER },
                    description: { type: Type.STRING }
                  },
                  required: ["name", "score", "description"]
                }
              },
              empatheticFeedback: { type: Type.STRING },
              copingStrategies: { type: Type.ARRAY, items: { type: Type.STRING } }
            },
            required: ["valence", "valenceLabel", "identifiedDistortions", "keyConstructs", "empatheticFeedback", "copingStrategies"]
          }
        }
      });
      responseText = result.response.text();
    } catch (geminiError: any) {
      console.warn("Gemini falló en diario, intentando Groq...", geminiError.message);
      responseText = await callGroq(
        `Analiza esta entrada de diario: "${text}". 
        REGLA CRÍTICA: Responde con este esquema JSON:
        {
          "valence": número de -100 a 100,
          "valenceLabel": "etiqueta corta",
          "identifiedDistortions": ["máximo 3"],
          "keyConstructs": [{"name": "ej. Empatía", "score": 85, "description": "explicación"}],
          "empatheticFeedback": "4-5 oraciones de apoyo empático profundo en segunda persona (Tú)",
          "copingStrategies": ["2-3 consejos"]
        }`,
        systemInstruction,
        null
      );
    }

    // Robust parsing
    let parsedData: any;
    try {
      parsedData = JSON.parse(responseText);
    } catch (e) {
      console.error("Critical JSON Parse Error from AI:", responseText);
      throw new Error("No se pudo procesar la respuesta de la inteligencia artificial.");
    }

    // Safety guards for properties
    parsedData.valence = parsedData.valence ?? 0;
    parsedData.valenceLabel = parsedData.valenceLabel || "Neutral";
    parsedData.identifiedDistortions = parsedData.identifiedDistortions || [];
    parsedData.keyConstructs = parsedData.keyConstructs || [];
    parsedData.copingStrategies = parsedData.copingStrategies || [];
    parsedData.empatheticFeedback = parsedData.empatheticFeedback || "No se pudo generar feedback en este momento.";

    res.json(parsedData);
  } catch (error: any) {
    console.error("Journal Analysis Route Failed:", error);
    res.status(500).json({
      error: error.message || "Error al conectar con la Inteligencia Artificial.",
    });
  }
});

// Mask Reflection Analysis Route
app.post("/api/analyze-mask", async (req, res) => {
  console.log("POST /api/analyze-mask hit");
  const { maskTitle, maskReality, maskDefense, reflectionText } = req.body;

  if (!maskTitle || !reflectionText || reflectionText.trim().length < 10) {
    res.status(400).json({ error: "Selecciona una máscara y escribe al menos 10 caracteres de reflexión." });
    return;
  }

  try {
    const ai = getGemini();
    const systemInstruction = `Eres Master Psico, una IA experta en psicología cognitivo-conductual y análisis de mecanismos de defensa. 
Responde siempre en español. Sé empático, cálido y científicamente preciso. 
Analiza la reflexión del usuario en el contexto de la máscara seleccionada (tipo de mecanismo de defensa descrito).
Tu respuesta debe ser personalizada, profunda y accionable.`;

    let responseText: string;
    try {
      const model = ai.getGenerativeModel({ model: "gemini-1.5-flash", systemInstruction });
      const result = await model.generateContent({
        contents: [{ role: "user", parts: [{ text: `El usuario reflexiona sobre la máscara psicológica "${maskTitle}".\nRealidad interna: "${maskReality}"\nMecanismo de defensa: "${maskDefense}"\nReflexión: "${reflectionText}"` }] }],
        generationConfig: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              insight: { type: Type.STRING },
              advice: { type: Type.STRING },
              recognitionLabel: { type: Type.STRING }
            },
            required: ["insight", "advice", "recognitionLabel"]
          }
        }
      });
      responseText = result.response.text();
    } catch (geminiError: any) {
      console.warn("Gemini falló en máscara, intentando Groq...", geminiError.message);
      responseText = await callGroq(
        `Analiza la reflexión sobre la máscara "${maskTitle}". Realidad: "${maskReality}". Reflexión: "${reflectionText}".
        REGLA CRÍTICA: Responde con este esquema JSON:
        {
          "insight": "observación clínica",
          "advice": "consejo corto",
          "recognitionLabel": "frase corta del patrón"
        }`,
        systemInstruction,
        null
      );
    }

    // Robust parsing
    let parsedData: any;
    try {
      parsedData = JSON.parse(responseText);
    } catch (e) {
      console.error("Critical JSON Parse Error from Mask AI:", responseText);
      throw new Error("No se pudo procesar el análisis de la máscara.");
    }

    // Safety guards
    parsedData.insight = parsedData.insight || "No hay observaciones disponibles.";
    parsedData.advice = parsedData.advice || "Sigue reflexionando sobre tu proceso.";
    parsedData.recognitionLabel = parsedData.recognitionLabel || "Reflexión en curso";

    res.json(parsedData);
  } catch (error: any) {
    console.error("Mask Analysis Route Failed:", error);
    res.status(500).json({ error: error.message || "No se pudo analizar la máscara." });
  }
});

// Global Report Advice Route
app.post("/api/report-advice", async (req, res) => {
  const { summary } = req.body;

  if (!summary) {
    res.status(400).json({ error: "No hay datos suficientes para generar el consejo." });
    return;
  }

  try {
    const ai = getGemini();
    const systemInstruction = `Eres Master Psico. Responde siempre en español. 
Basándote en el perfil psicológico del usuario (resultados de tests, diarios, reflexiones y máscaras), genera:
1. Una sugerencia corta (1-2 oraciones) orientada al crecimiento personal basada en los datos.
2. Un consejo concreto y empático (1-2 oraciones) para la semana que comienza.
Sé directo, cálido y constructivo. 
REGLA CRÍTICA: No des el mismo consejo dos veces. Busca ángulos originales basados en los matices del perfil del usuario. Evita los clichés.`;

    let responseText: string;
    try {
      const model = ai.getGenerativeModel({
        model: "gemini-1.5-flash",
        systemInstruction
      });
      const response = await model.generateContent({
        contents: [{ role: "user", parts: [{ text: `Genera un consejo terapéutico basado en este resumen:\n\n${summary}` }] }],
        generationConfig: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              suggestion: { type: Type.STRING },
              advice: { type: Type.STRING }
            },
            required: ["suggestion", "advice"]
          }
        }
      });
      responseText = response.response.text().replace(/```json/g, "").replace(/```/g, "").trim();
    } catch (geminiError: any) {
      console.warn("Gemini falló en reporte, intentando Groq...", geminiError.message);
      responseText = await callGroq(
        `Resumen de sesión: "${summary}".
        REGLA CRÍTICA: Responde con este esquema JSON:
        {
          "suggestion": "sugerencia de crecimiento",
          "advice": "consejo para la semana"
        }`,
        systemInstruction,
        null
      );
    }

    // Robust parsing
    let parsedData: any;
    try {
      parsedData = JSON.parse(responseText);
    } catch (e) {
      console.error("Critical JSON Parse Error from Report AI:", responseText);
      throw new Error("No se pudo generar el consejo del reporte.");
    }

    // Safety guards
    parsedData.suggestion = parsedData.suggestion || "Continúa con tu proceso de autodescubrimiento.";
    parsedData.advice = parsedData.advice || "Mantén la curiosidad sobre tus estados internos esta semana.";

    res.json(parsedData);
  } catch (error: any) {
    console.error("Report Advice Route Failed:", error);
    res.status(500).json({ error: error.message || "Error al generar el consejo del reporte." });
  }
});

// Guided Reflection Analysis Route
app.post("/api/analyze-reflection", async (req, res) => {
  const { templateName, answers } = req.body;

  if (!answers || !Array.isArray(answers) || answers.length === 0) {
    res.status(400).json({ error: "No se proporcionaron respuestas para analizar." });
    return;
  }

  try {
    const ai = getGemini();
    const systemInstruction = `Eres Master Psico, una IA experta en psicología clínica y humanista. 
Analizarás una reflexión guiada del usuario llamada "${templateName}". 
El usuario ha respondido varias preguntas de introspección. 
Tu objetivo es dar un consejo corto (2-3 oraciones), cálido y profundamente empático que valide su esfuerzo y le dé una perspectiva de crecimiento basada en sus respuestas.
REGLA CRÍTICA: Cada respuesta debe ser única y creativa. Evita frases genéricas. Usa detalles específicos de las respuestas del usuario si es posible.
Responde estrictamente en español y en formato JSON.`;

    const reflectionContent = answers.map((a: any) => `P: ${a.question}\nR: ${a.answer}`).join("\n\n");

    let responseText: string = "";
    try {
      const model = ai.getGenerativeModel({
        model: "gemini-1.5-flash",
        systemInstruction
      });
      const response = await model.generateContent({
        contents: [{ role: "user", parts: [{ text: `El usuario completó la reflexión "${templateName}". Respuestas:\n\n${reflectionContent}` }] }],
        generationConfig: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              advice: { type: Type.STRING }
            },
            required: ["advice"]
          }
        }
      });
      responseText = response.response.text().replace(/```json/g, "").replace(/```/g, "").trim();
    } catch (geminiError: any) {
      console.warn("Gemini falló en reflexión, intentando Groq...", geminiError.message);
      responseText = await callGroq(
        `Reflexión: ${templateName}. Contenido: ${reflectionContent}. Brinda un consejo corto.`,
        systemInstruction + " REGLA CRÍTICA: Responde con este esquema JSON: { \"advice\": \"texto del consejo\" }",
        null
      );
    }

    let parsedData: any;
    try {
      parsedData = JSON.parse(responseText);
    } catch (e) {
      console.error("Critical JSON Parse Error from Reflection AI:", responseText);
      throw new Error("No se pudo procesar el consejo de la reflexión.");
    }

    parsedData.advice = parsedData.advice || "Excelente trabajo de introspección hoy. Sigue cultivando tu autoconocimiento.";

    res.json(parsedData);
  } catch (error: any) {
    console.error("Reflection Analysis Route Failed:", error);
    res.status(500).json({ error: error.message || "Error al analizar la reflexión." });
  }
});

// Configure Vite or Serve static assets
async function setupServer() {
  if (process.env.NODE_ENV !== "production") {
    console.log("Setting up Vite development middleware...");
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    console.log("Serving production build client assets...");
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*all", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Master Psico Server running on http://localhost:${PORT}`);
  });
}

// Global Error Handler
app.use((err: any, req: any, res: any, next: any) => {
  console.error("GLOBAL ERROR:", err);
  if (!res.headersSent) {
    res.status(500).json({ error: "Error interno del servidor. Por favor, intenta de nuevo." });
  }
});

setupServer();
