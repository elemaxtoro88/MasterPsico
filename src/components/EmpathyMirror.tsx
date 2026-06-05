/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Sparkles, MessageSquare, AlertCircle, ShieldAlert, Cpu, Heart, CheckCircle2, ChevronRight, HelpCircle, FileText } from 'lucide-react';
import { JournalAnalysis } from '../types';

interface EmpathyMirrorProps {
  onSaveAnalysis: (analysis: JournalAnalysis, rawText: string) => void;
  onBackToDashboard: () => void;
}

const PSY_TIPS = [
  "Las distorsiones cognitivas son atajos de nuestro cerebro que sesgan la realidad hacia lo negativo.",
  "La valencia emocional no califica tus emociones como 'buenas o malas'; todas tienen propósitos evolutivos.",
  "Nombrar las emociones (etiquetado afectivo) reduce significativamente la activación de la amígdala cerebral.",
  "La autocompasión clínica consiste en tratarte a ti mismo con el mismo cariño que tratarías a un buen amigo enfadado.",
  "El catastrofismo es el hábito de anticipar sistemáticamente el peor escenario posible."
];

// Fallback generator for beautiful local analysis in case API key is not configured
const generateLocalFallbackAnalysis = (text: string): JournalAnalysis => {
  const normalized = text.toLowerCase();
  let valence = 0;
  let valenceLabel = "Reflexivo";
  const identifiedDistortions: string[] = [];
  const copingStrategies: string[] = [];

  if (normalized.includes("triste") || normalized.includes("llorar") || normalized.includes("solo") || normalized.includes("depre")) {
    valence = -60;
    valenceLabel = "Melancólico / Abatido";
    identifiedDistortions.push("Filtro Mental", "Razonamiento Emocional");
    copingStrategies.push("Ejercicio de Activación Conductual: Planifica 15 minutos de una actividad sencilla pero gratificante.", "Validación Emocional: Dedica unos momentos a permitirte sentir la tristeza sin juzgarla.");
  } else if (normalized.includes("estres") || normalized.includes("ansiedad") || normalized.includes("nervioso") || normalized.includes("presion") || normalized.includes("examen") || normalized.includes("parcial")) {
    valence = -45;
    valenceLabel = "Agobiado / Tensionado";
    identifiedDistortions.push("Catastrofismo", "Lectura de Mente");
    copingStrategies.push("Respiración Diafragmática 4-7-8: Inhala por 4 segundos, retén 7, exhala por 8.", "Descatastrofización: Pregúntate intelectualmente ¿qué es lo peor que podría pasar y cómo lo afrontaría?");
  } else if (normalized.includes("feliz") || normalized.includes("bien") || normalized.includes("alegre") || normalized.includes("logro") || normalized.includes("contento")) {
    valence = 70;
    valenceLabel = "Estable / Satisfecho";
    identifiedDistortions.push();
    copingStrategies.push("Anclaje de Logros: Anota los factores internos específicos que te llevaron a este sentir positivo.", "Cultivo del optimismo: Comparte tu alegría con alguien cercano para consolidar la vinculación social.");
  } else {
    valence = 15;
    valenceLabel = "Neutral / Introspectivo";
    identifiedDistortions.push("Pensamiento todo o nada");
    copingStrategies.push("Atención Plena (Mindfulness): Observa los ruidos de tu entorno por 2 minutos.", "Reflexión por escrito: Describe de forma objetiva (sin adjetivos) tus actividades del día.");
  }

  return {
    valence,
    valenceLabel,
    identifiedDistortions,
    keyConstructs: [
      {
        name: "Estabilidad Cognitiva",
        score: Math.max(30, Math.min(95, 100 - Math.abs(valence))),
        description: "Mide cuán estable y asertivo es tu diálogo respecto a los sucesos descritos en tu bitácora."
      },
      {
        name: "Autocompasión Activa",
        score: normalized.includes("culpa") || normalized.includes("odio") ? 25 : 65,
        description: "Evalúa qué tanto perdonas tus propias limitaciones de cara a contingencias externas."
      }
    ],
    empatheticFeedback: "Tus palabras denotan una mente reflexiva con fuerte disposición al autoanálisis. Es completamente normal experimentar fluctuaciones en el estado de ánimo al intentar descifrar vivencias personales complejas. Recuerda que este espacio es confidencial y busca brindarte una perspectiva científica exenta de cualquier condena moral.",
    copingStrategies: copingStrategies.slice(0, 2)
  };
};

export default function EmpathyMirror({ onSaveAnalysis, onBackToDashboard }: EmpathyMirrorProps) {
  const [diaryText, setDiaryText] = useState("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [tipIndex, setTipIndex] = useState(0);
  const [analysisResult, setAnalysisResult] = useState<JournalAnalysis | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isDemoMode, setIsDemoMode] = useState(false);

  // Rotate tips during loading
  React.useEffect(() => {
    let interval: any;
    if (isAnalyzing) {
      interval = setInterval(() => {
        setTipIndex(prev => (prev + 1) % PSY_TIPS.length);
      }, 3500);
    }
    return () => clearInterval(interval);
  }, [isAnalyzing]);

  const handleAnalyze = async () => {
    if (diaryText.trim().length < 15) {
      setErrorMessage("Por favor, escribe un diario un poco más extenso (mínimo 15 caracteres) para poder realizar un análisis semántico de valor.");
      return;
    }

    setErrorMessage(null);
    setIsAnalyzing(true);
    setAnalysisResult(null);

    try {
      const response = await fetch("/api/analyze-journal", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: diaryText }),
      });

      if (!response.ok) {
        // Look for custom API key error or configuration warning
        const errorData = await response.json();
        throw new Error(errorData.error || "Falla en el servidor backend.");
      }

      const result: JournalAnalysis = await response.json();
      setAnalysisResult(result);
    } catch (err: any) {
      const message: string = err?.message || "Error desconocido al contactar el servidor.";
      const isKeyMissing = message.includes("GEMINI_API_KEY") || message.includes("no está configurada");

      if (isKeyMissing) {
        // Only go into demo mode if the API key is genuinely not set
        console.warn("API key not configured. Activating local fallback demo...");
        setIsDemoMode(true);
        setTimeout(() => {
          const localResult = generateLocalFallbackAnalysis(diaryText);
          setAnalysisResult(localResult);
          setIsAnalyzing(false);
        }, 2500);
        return;
      }

      // For quota errors, network issues, etc. — show the real message
      console.error("Server API error:", err);
      setErrorMessage(message);
      setIsAnalyzing(false);
      return;
    }

    setIsAnalyzing(false);
  };

  const handleSaveResult = () => {
    if (analysisResult) {
      onSaveAnalysis(analysisResult, diaryText);
      // Show confirmation
      alert("Análisis de diario guardado exitosamente en tu bitácora de autoconocimiento.");
      onBackToDashboard();
    }
  };

  return (
    <div className="max-w-5xl mx-auto py-6" id="empathy-mirror-layout">
      {/* Back Header */}
      <div className="flex items-center justify-between mb-8 pb-4 border-b border-gray-100">
        <button
          onClick={onBackToDashboard}
          className="flex items-center gap-2 text-sm text-gray-500 hover:text-indigo-600 transition-colors"
        >
          <CompassArrowLeft size={16} /> Volver al Tablero
        </button>
        <span className="text-xs bg-emerald-50 text-emerald-600 px-3 py-1 rounded-full font-bold font-mono tracking-wider">
          CONEXIÓN EMOCIONAL ACTIVA
        </span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Input Form Column */}
        <div className="lg:col-span-6 space-y-6">
          <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm space-y-4">
            <div className="flex items-center gap-2.5">
              <div className="p-2 bg-indigo-50 text-indigo-600 rounded-xl">
                <FileText size={20} />
              </div>
              <div>
                <h3 className="text-xl font-bold text-slate-800">Caja de Escritura Emocional</h3>
                <p className="text-xs text-gray-400">Terapia narrativa de autoanálisis</p>
              </div>
            </div>

            {/* Suggestions Questions for writing */}
            <div className="bg-slate-50 p-4 rounded-xl border border-dashed border-slate-200">
              <span className="text-[10px] font-mono font-bold text-slate-400 block mb-1 uppercase tracking-wider">GUÍA SUGERIDA DE ANÁLISIS:</span>
              <ul className="text-xs text-slate-600 space-y-1 list-disc list-inside font-medium">
                <li>¿Qué acontecimiento detonó tus emociones hoy?</li>
                <li>¿Qué te repetías a ti mismo intelectualmente?</li>
                <li>¿Cómo sintió tu cuerpo el suceso (tensión, calor, respiración)?</li>
              </ul>
            </div>

            {errorMessage && (
              <div className="p-3.5 bg-rose-50 text-rose-600 text-xs rounded-xl border border-rose-100 flex items-start gap-2">
                <AlertCircle size={16} className="shrink-0 mt-0.5" />
                <span>{errorMessage}</span>
              </div>
            )}

            <textarea
              disabled={isAnalyzing}
              value={diaryText}
              onChange={(e) => setDiaryText(e.target.value)}
              placeholder="Escribe libremente... Intenta detallar no solo lo que pasó, sino cómo reaccionó tu mente y cuerpo. (Mínimo de 15 caracteres)..."
              className="w-full h-64 p-4 border border-gray-100 rounded-2xl focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm placeholder-stone-400 leading-relaxed font-medium"
            />

            <div className="flex justify-between items-center">
              <span className="text-xs font-mono text-gray-400 font-medium">
                Caracteres escritos: <strong className="text-gray-600">{diaryText.length}</strong>
              </span>
              <button
                disabled={isAnalyzing || diaryText.trim().length < 15}
                onClick={handleAnalyze}
                className="py-2 px-5 bg-gradient-to-r from-indigo-600 to-indigo-800 hover:opacity-95 text-white font-bold rounded-xl text-sm transition-all flex items-center gap-2 shadow-md shadow-indigo-50 disabled:opacity-45 disabled:cursor-not-allowed"
              >
                <Sparkles size={16} /> Analizar Espejo Empático
              </button>
            </div>
          </div>
        </div>

        {/* Dynamic Display Column (Loading or Result) */}
        <div className="lg:col-span-6">
          {/* Loading state indicator */}
          {isAnalyzing && (
            <div className="bg-indigo-900 text-slate-100 p-8 rounded-2xl shadow-xl min-h-[400px] flex flex-col justify-between items-center text-center animate-pulse">
              <div className="py-6 flex flex-col items-center gap-4">
                <Cpu size={52} className="text-emerald-400 animate-spin" />
                <h4 className="text-xl font-bold">Procesando Modelo Semántico</h4>
                <p className="text-xs text-indigo-300 max-w-sm">
                  Evaluando valencias, aislando sesgos cognitivos e identificando construcciones de autocompasión...
                </p>
              </div>

              {/* Psychology tip carousel */}
              <div className="border-t border-white/10 w-full pt-6">
                <span className="text-[10px] font-mono font-bold tracking-widest text-emerald-400 uppercase">SABIDURÍA DE CORTO PLAZO</span>
                <p className="text-sm italic text-indigo-100 mt-2 px-4 leading-relaxed">
                  "{PSY_TIPS[tipIndex]}"
                </p>
              </div>
            </div>
          )}

          {/* Fallback configuration banner if user is in demo mode */}
          {isDemoMode && !isAnalyzing && analysisResult && (
            <div className="bg-amber-50 p-4 border-2 border-amber-200 rounded-2xl mb-4 text-xs text-amber-800 flex items-start gap-3">
              <ShieldAlert className="shrink-0 text-amber-600 mt-0.5 animate-pulse" size={18} />
              <div>
                <strong className="font-bold">Modo Demo Local Activo.</strong> La clave de API Gemini no está configurada aún en el backend. Hemos activado un motor inteligente local en el cliente para que puedas experimentar la interfaz completa. Para usar IA en tiempo real, añade <code className="bg-amber-100 px-1 py-0.5 rounded font-mono">GEMINI_API_KEY</code> en la barra de Ajustes de la plataforma.
              </div>
            </div>
          )}

          {/* Results Display */}
          {!isAnalyzing && analysisResult ? (
            <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm space-y-6 animate-fade-in">
              <div className="flex items-center justify-between border-b border-slate-50 pb-4">
                <div>
                  <h4 className="font-bold text-slate-800 text-lg">Retrato Psico-Semántico</h4>
                  <p className="text-xs text-gray-400">Basado en psicología cognitiva conductual</p>
                </div>
                <div className="p-2.5 bg-emerald-50 text-emerald-600 rounded-xl">
                  <Heart size={20} className="fill-emerald-500" />
                </div>
              </div>

              {/* Valence slider widget */}
              <div className="space-y-2 bg-slate-50 p-4 rounded-xl">
                <div className="flex justify-between items-center text-xs font-bold text-slate-600">
                  <span>VALENCIA EMOCIONAL</span>
                  <span className="font-mono text-indigo-600">{analysisResult.valenceLabel} ({analysisResult.valence > 0 ? '+' : ''}{analysisResult.valence})</span>
                </div>
                <div className="relative w-full bg-slate-200 h-2.5 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-700 ${analysisResult.valence >= 25 ? 'bg-emerald-500' :
                      analysisResult.valence <= -25 ? 'bg-rose-500' : 'bg-amber-500'
                      }`}
                    style={{ width: '50%', marginLeft: analysisResult.valence >= 0 ? '50%' : `${50 + (analysisResult.valence / 2)}%`, transform: `scaleX(${Math.abs(analysisResult.valence) / 100})`, transformOrigin: analysisResult.valence >= 0 ? 'left' : 'right' }}
                  />
                  {/* Center line marker */}
                  <div className="absolute top-0 bottom-0 left-1/2 w-0.5 bg-slate-400" />
                </div>
                <div className="flex justify-between text-[10px] font-mono text-gray-400">
                  <span>Tensión / Congoja (-100)</span>
                  <span>Eutonía / Calma (0)</span>
                  <span>Euforia / Gratitud (+100)</span>
                </div>
              </div>

              {/* Identified cognitive distortions */}
              {analysisResult?.identifiedDistortions && analysisResult.identifiedDistortions.length > 0 && (
                <div className="space-y-2">
                  <span className="text-xs font-bold font-mono text-slate-400 uppercase tracking-wide">SESGOS COGNITIVOS IDENTIFICADOS:</span>
                  <div className="flex flex-wrap gap-2">
                    {analysisResult.identifiedDistortions.map((dist, idx) => (
                      <span key={idx} className="bg-rose-50 border border-rose-100 text-rose-700 px-3 py-1 rounded-xl text-xs font-bold flex items-center gap-1.5 animate-bounce-slow">
                        <AlertCircle size={12} /> {dist}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Key Analyzed Constructs */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {analysisResult?.keyConstructs?.map((construct, idx) => (
                  <div key={idx} className="p-4 rounded-xl border border-slate-100 bg-white shadow-sm space-y-1">
                    <div className="flex justify-between items-center text-xs font-bold">
                      <span className="text-slate-700">{construct.name}</span>
                      <span className="text-indigo-600 font-mono">{construct.score}/100</span>
                    </div>
                    <div className="w-full bg-slate-100 h-1 rounded-full overflow-hidden">
                      <div className="bg-indigo-600 h-full" style={{ width: `${construct.score}%` }} />
                    </div>
                    <p className="text-[10px] text-gray-400 leading-normal pt-1">{construct.description}</p>
                  </div>
                ))}
              </div>

              {/* Empathetic psychology analysis */}
              <div className="bg-indigo-50/50 p-5 rounded-2xl border border-indigo-100 italic text-slate-700 text-xs leading-relaxed">
                <span className="text-[10px] font-mono font-bold text-indigo-700 tracking-wider block not-italic mb-1 uppercase">RESPUESTA TERAPÉUTICA:</span>
                "{analysisResult.empatheticFeedback}"
              </div>

              {/* Strategies to address */}
              <div className="space-y-2">
                <span className="text-xs font-bold font-mono text-slate-400 uppercase tracking-wide">ESTRATEGIAS DE ADAPTACIÓN RECOMENDADAS:</span>
                <div className="space-y-2">
                  {analysisResult.copingStrategies.map((strat, idx) => (
                    <div key={idx} className="flex gap-2.5 items-start text-xs text-gray-700 font-medium">
                      <CheckCircle2 size={16} className="text-emerald-500 shrink-0 mt-0.5" />
                      <span>{strat}</span>
                    </div>
                  ))}
                </div>
              </div>

              <button
                onClick={handleSaveResult}
                className="w-full mt-4 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold text-sm transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer"
              >
                Registrar entrada en mi historial diario <ChevronRight size={16} />
              </button>
            </div>
          ) : (
            // Idle illustration
            !isAnalyzing && (
              <div className="bg-white p-8 rounded-2xl border border-dashed border-gray-200 min-h-[400px] flex flex-col justify-center items-center text-center space-y-3">
                <div className="p-4 bg-slate-50 text-indigo-600 rounded-full">
                  <MessageSquare size={32} />
                </div>
                <h4 className="text-lg font-bold text-slate-800">Esperando Narración</h4>
                <p className="text-xs text-gray-400 max-w-xs leading-relaxed">
                  Completa tu entrada de diario emocional en la izquierda y pulsa "Analizar" para activar el espejo empático cognitivo.
                </p>
              </div>
            )
          )}
        </div>
      </div>
    </div>
  );
}

// Custom simple helper to bypass lack of compass import
function CompassArrowLeft(props: any) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-arrow-left" {...props}>
      <path d="M19 12H5M12 19l-7-7 7-7" />
    </svg>
  );
}
