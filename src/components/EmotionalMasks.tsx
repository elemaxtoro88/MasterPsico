/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { ShieldAlert, BookOpen, KeyRound, Sparkles, Smile, MessageSquareCode, ArrowLeft, Trash2, Brain, Loader2, AlertCircle, CheckCircle2 } from 'lucide-react';
import { SavedResult } from '../types';

interface EmotionalMasksProps {
  results?: SavedResult[];
  onSaveReflection?: (mechanism: string, text: string, aiInsight?: string, aiAdvice?: string) => void;
  onDeleteResult?: (id: string) => void;
  onBackToDashboard?: () => void;
}

interface MaskItem {
  id: string;
  title: string;
  façade: string;
  reality: string;
  defense: string;
  description: string;
  suggestion: string;
  colors: {
    bg: string;
    border: string;
    text: string;
    accent: string;
    vibrantBg: string;
    glow: string;
  };
}

interface MaskAIResult {
  insight: string;
  advice: string;
  recognitionLabel: string;
}

const MASKS: MaskItem[] = [
  {
    id: "perfeccionista",
    title: "La Armadura del Perfeccionismo",
    façade: "Eficiencia absoluta, orden meticuloso y temor neurótico a la crítica externa.",
    reality: "Un sentimiento de insuficiencia basal. Cree que si no es perfecto, no es digno de amor ni respeto.",
    defense: "Formación Reactiva & Intelectualización",
    description: "Utiliza el control del entorno como sustituto del control emocional interno. Su meta es ser 'inatacable'.",
    suggestion: "Permítete un 'margen de error' consciente hoy. Tu valor no es una métrica de rendimiento.",
    colors: {
      bg: "bg-indigo-50/50",
      border: "border-indigo-200",
      text: "text-indigo-800",
      accent: "bg-indigo-600 text-white",
      vibrantBg: "bg-gradient-to-br from-indigo-500 to-indigo-700 text-white",
      glow: "shadow-indigo-200"
    }
  },
  {
    id: "complaciente",
    title: "La Máscara de la Complacencia",
    façade: "Extrema amabilidad, dificultad para poner límites y necesidad de agradar a todos.",
    reality: "Pavor al abandono y al conflicto. Siente que su valor está en ser útil para los demás.",
    defense: "Represión de la Agresividad / Proyección",
    description: "Anula sus deseos para evitar el rechazo. El 'Salvador' cuida en otros lo que no se atreve a cuidar en sí mismo.",
    suggestion: "Practica decir 'no' a una petición pequeña. El mundo no se detiene y tú sigues siendo valioso/a.",
    colors: {
      bg: "bg-emerald-50/50",
      border: "border-emerald-200",
      text: "text-emerald-800",
      accent: "bg-emerald-600 text-white",
      vibrantBg: "bg-gradient-to-br from-emerald-500 to-emerald-700 text-white",
      glow: "shadow-emerald-200"
    }
  },
  {
    id: "fuerte_aislado",
    title: "El Muro de la Invulnerabilidad",
    façade: "Frialdad aparente, autosuficiencia extrema y desconexión de las emociones.",
    reality: "Una hipersensibilidad herida. Se protege detrás de un muro para que nadie lo vuelva a lastimar.",
    defense: "Disociación Afectiva / Aislamiento",
    description: "Separa el pensamiento del sentimiento. Puede narrar traumas de forma técnica sin contacto con el dolor.",
    suggestion: "Identifica una sensación física ahora mismo (calor, tensión). Ponle nombre sin juzgarla.",
    colors: {
      bg: "bg-slate-50/50",
      border: "border-slate-200",
      text: "text-slate-800",
      accent: "bg-slate-700 text-white",
      vibrantBg: "bg-gradient-to-br from-slate-600 to-slate-800 text-white",
      glow: "shadow-slate-200"
    }
  },
  {
    id: "hiperactivo",
    title: "El Refugio de la Hiperactividad",
    façade: "Optimismo maníaco, agenda siempre llena y huida constante mediante el hacer.",
    reality: "Terror al vacío existencial y a la tristeza. Si se detiene, teme que la melancolía lo consuma.",
    defense: "Evitación Activa / Manía Defensiva",
    description: "Usa el ruido y la actividad como interferencia para no escuchar su angustia. El descanso se percibe como amenaza.",
    suggestion: "Dedica 5 minutos al silencio absoluto. Observa qué pensamientos emergen sin intentar cambiarlos.",
    colors: {
      bg: "bg-rose-50/50",
      border: "border-rose-200",
      text: "text-rose-800",
      accent: "bg-rose-600 text-white",
      vibrantBg: "bg-gradient-to-br from-rose-500 to-rose-700 text-white",
      glow: "shadow-rose-200"
    }
  }
];

export default function EmotionalMasks({
  results = [],
  onSaveReflection,
  onDeleteResult,
  onBackToDashboard
}: EmotionalMasksProps) {
  const [activeFlipped, setActiveFlipped] = useState<string | null>(null);
  const [reflectionText, setReflectionText] = useState("");
  const [selectedMaskId, setSelectedMaskId] = useState<string>("");
  const [aiResult, setAiResult] = useState<MaskAIResult | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [aiError, setAiError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  const maskReflections = results.filter(r => r.testType === 'mask_reflection');
  const selectedMask = MASKS.find(m => m.id === selectedMaskId);

  const handleAnalyze = async () => {
    if (!selectedMask || !reflectionText || reflectionText.trim().length < 10) return;
    setIsAnalyzing(true);
    setAiError(null);
    setAiResult(null);
    try {
      const response = await fetch('/api/analyze-mask', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          maskTitle: selectedMask.title,
          maskReality: selectedMask.reality,
          maskDefense: selectedMask.defense,
          reflectionText,
        }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Error al analizar');
      setAiResult(data);
    } catch (err: any) {
      setAiError(err.message || 'Error al conectar con la IA.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleSaveReflection = (e: React.FormEvent) => {
    e.preventDefault();
    if (!reflectionText || !selectedMask) return;
    if (onSaveReflection) {
      onSaveReflection(
        selectedMask.title,
        reflectionText,
        aiResult?.insight,
        aiResult?.advice
      );
    }
    setReflectionText("");
    setAiResult(null);
    setSelectedMaskId("");
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <div className="max-w-6xl mx-auto py-6" id="emotional-masks-layout">

      {/* Header back navigation */}
      <div className="flex items-center justify-between mb-8 pb-4 border-b border-gray-100">
        <button
          onClick={onBackToDashboard}
          className="flex items-center gap-2 text-xs font-bold text-slate-500 hover:text-indigo-600 transition-colors cursor-pointer"
        >
          <ArrowLeft size={14} /> Volver al Tablero
        </button>
        <span className="text-xs bg-indigo-50 text-indigo-600 px-3 py-1 rounded-full font-bold font-mono tracking-wider">
          MÁSCARAS &amp; DEFENSAS INTERNAS
        </span>
      </div>

      {/* Header */}
      <div className="text-center space-y-3 mb-10">
        <span className="text-xs font-mono bg-indigo-50 text-indigo-600 px-3 py-1 rounded-full font-bold uppercase tracking-wider">
          MÓDULO DE COMPRENSIÓN EMOCIONAL
        </span>
        <h2 className="text-4xl font-extrabold text-slate-800 tracking-tight">Máscaras Psicológicas &amp; Mecanismos</h2>
        <p className="text-gray-500 max-w-2xl mx-auto font-medium">
          Haz clic en cada tarjeta para revelar la realidad interna que oculta la fachada social.
        </p>
      </div>

      {/* Grid of flippable mask cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
        {MASKS.map((mask) => {
          const isFlipped = activeFlipped === mask.id;
          return (
            <div
              key={mask.id}
              onClick={() => setActiveFlipped(isFlipped ? null : mask.id)}
              style={{ height: '460px' }}
              className="rounded-2xl cursor-pointer perspective-1000 select-none relative"
            >
              <div className={`relative w-full h-full duration-500 transform-style-3d transition-transform ${isFlipped ? 'rotate-y-180' : ''}`}>

                {/* Front Side */}
                <div className={`absolute inset-0 w-full h-full rounded-2xl border-2 ${mask.colors.border} ${mask.colors.bg} p-5 flex flex-col justify-between backface-hidden shadow-sm hover:shadow-lg hover:${mask.colors.glow} transition-shadow`}>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className={`text-[10px] font-bold font-mono px-2 py-1 rounded-md uppercase ${mask.colors.accent}`}>
                        FACHADA SOCIAL
                      </span>
                      <Smile size={16} className="text-slate-400" />
                    </div>
                    <h3 className="text-lg font-bold text-slate-800 leading-snug">{mask.title}</h3>
                    <p className="text-sm text-slate-600 leading-relaxed">{mask.façade}</p>
                  </div>
                  <div className="mt-4 text-xs font-bold text-indigo-600 flex items-center gap-1.5 justify-center py-2.5 bg-white/60 rounded-xl border border-dashed border-indigo-200 hover:bg-white/80 transition-colors">
                    <KeyRound size={12} /> HAZ CLIC PARA REVELAR REALIDAD
                  </div>
                </div>

                {/* Back Side */}
                <div className={`absolute inset-0 w-full h-full rounded-2xl ${mask.colors.vibrantBg} p-5 flex flex-col justify-between rotate-y-180 backface-hidden shadow-xl overflow-hidden`}>
                  <div className="space-y-3 flex-1">
                    <div className="flex justify-between items-center">
                      <span className="text-[10px] font-bold font-mono px-2.5 py-0.5 rounded-full bg-white/20 text-white uppercase">
                        REALIDAD INTERNA
                      </span>
                      <ShieldAlert size={16} className="text-white/80" />
                    </div>
                    <div>
                      <h3 className="text-base font-bold tracking-tight text-white">El núcleo herido</h3>
                      <p className="text-xs text-white/90 leading-relaxed mt-1">{mask.reality}</p>
                    </div>
                    <div className="bg-black/15 p-2.5 rounded-xl border border-white/10">
                      <span className="text-[9px] font-mono font-bold block text-white/60 tracking-wider uppercase">Mecanismo de Defensa</span>
                      <span className="text-xs font-bold text-white">{mask.defense}</span>
                      <p className="text-[11px] text-white/80 mt-1 leading-snug">{mask.description}</p>
                    </div>
                    <div className="bg-white/10 p-2.5 rounded-xl border border-dashed border-white/20">
                      <span className="text-[9px] font-mono font-bold block text-white/60 tracking-wider uppercase mb-1">Sugerencia Clínica</span>
                      <p className="text-xs text-white italic leading-snug">"{mask.suggestion}"</p>
                    </div>
                  </div>
                  <div className="text-[10px] font-mono tracking-wider opacity-70 text-center mt-3 text-white">
                    Haz clic para regresar al frente
                  </div>
                </div>

              </div>
            </div>
          );
        })}
      </div>

      {/* Dynamic Reflection Journal */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">

        {/* AI Analysis Form */}
        <div className="lg:col-span-7 bg-white p-6 rounded-2xl border border-gray-100 shadow-sm space-y-5">
          <div className="flex items-center gap-2">
            <BookOpen className="text-indigo-600 shrink-0" size={20} />
            <h3 className="text-xl font-bold text-slate-800">Autoanálisis con IA</h3>
          </div>
          <p className="text-xs text-slate-500 leading-relaxed">
            Selecciona la máscara que más te identifica, escribe tu reflexión y la IA generará un análisis personalizado.
          </p>

          <form onSubmit={handleSaveReflection} className="space-y-4">

            {/* Mask selector */}
            <div>
              <label className="text-xs font-bold font-mono text-slate-400 block mb-2 uppercase">Selecciona tu máscara</label>
              <div className="grid grid-cols-2 gap-2">
                {MASKS.map(m => (
                  <button
                    key={m.id}
                    type="button"
                    onClick={() => { setSelectedMaskId(m.id); setAiResult(null); setAiError(null); }}
                    className={`py-2 px-3 rounded-xl border text-xs font-bold transition-all text-left leading-tight ${selectedMaskId === m.id
                        ? 'bg-indigo-600 border-indigo-600 text-white shadow-sm'
                        : 'bg-white border-gray-200 text-gray-600 hover:border-gray-300'
                      }`}
                  >
                    {m.title}
                  </button>
                ))}
              </div>
            </div>

            {/* Text area */}
            <div>
              <label className="text-xs font-bold font-mono text-slate-400 block mb-2 uppercase">Diálogo Reflexivo Interno</label>
              <textarea
                value={reflectionText}
                onChange={e => { setReflectionText(e.target.value); setAiResult(null); }}
                placeholder="¿A cuál de estas máscaras recurres cuando sientes estrés? ¿Qué estás intentando proteger?"
                className="w-full h-28 p-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm placeholder-stone-400 resize-none"
                required
              />
            </div>

            {/* Analyze button */}
            <div className="flex gap-3">
              <button
                type="button"
                onClick={handleAnalyze}
                disabled={!selectedMask || reflectionText.trim().length < 10 || isAnalyzing}
                className="flex-1 flex items-center justify-center gap-2 py-2.5 px-4 bg-slate-800 hover:bg-slate-900 text-white rounded-xl text-sm font-bold transition-all disabled:opacity-40 disabled:cursor-not-allowed"
              >
                {isAnalyzing ? (
                  <><Loader2 size={15} className="animate-spin" /> Analizando...</>
                ) : (
                  <><Brain size={15} /> Analizar con IA</>
                )}
              </button>
            </div>

            {/* AI Result Panel */}
            {aiError && (
              <div className="bg-rose-50 border border-rose-200 rounded-xl p-4 flex gap-2 items-start">
                <AlertCircle size={16} className="text-rose-500 shrink-0 mt-0.5" />
                <p className="text-xs text-rose-700 font-medium">{aiError}</p>
              </div>
            )}

            {aiResult && (
              <div className="bg-indigo-50 border border-indigo-100 rounded-xl p-4 space-y-3 animate-fade-in">
                <div className="flex items-center gap-2">
                  <Sparkles size={14} className="text-indigo-600" />
                  <span className="text-xs font-bold font-mono text-indigo-600 uppercase tracking-wider">Análisis IA</span>
                  <span className="ml-auto text-[10px] font-bold bg-indigo-100 text-indigo-700 px-2 py-0.5 rounded-full uppercase">{aiResult.recognitionLabel}</span>
                </div>
                <div className="space-y-2">
                  <div>
                    <span className="text-[10px] font-mono font-bold text-slate-400 uppercase block mb-0.5">Observación clínica</span>
                    <p className="text-xs text-slate-700 leading-relaxed font-medium">{aiResult.insight}</p>
                  </div>
                  <div className="bg-white/70 p-3 rounded-lg border border-indigo-100">
                    <span className="text-[10px] font-mono font-bold text-indigo-500 uppercase block mb-0.5">Consejo personalizado</span>
                    <p className="text-xs text-slate-800 leading-relaxed font-semibold italic">"{aiResult.advice}"</p>
                  </div>
                </div>
              </div>
            )}

            {/* Save button */}
            <div className="flex gap-3 pt-2 border-t border-gray-50">
              <button
                type="submit"
                disabled={!reflectionText || !selectedMask}
                className="flex items-center justify-center gap-2 py-2.5 px-5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl text-sm transition-all disabled:opacity-40 disabled:cursor-not-allowed shadow-sm"
              >
                {saved ? <><CheckCircle2 size={15} /> Guardado</> : <><Sparkles size={15} /> Guardar en Bitácora</>}
              </button>
            </div>
          </form>
        </div>

        {/* History of Saved Reflections Column */}
        <div className="lg:col-span-5 space-y-4">
          <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100">
            <h4 className="text-xs font-bold text-slate-400 font-mono tracking-wider mb-4 uppercase">Historial de Bitácora</h4>
            {maskReflections.length === 0 ? (
              <div className="text-center py-8 text-gray-400 text-sm font-medium">
                <MessageSquareCode className="mx-auto text-slate-300 mb-2" size={36} />
                No has guardado reflexiones aún. Completa el autoanálisis.
              </div>
            ) : (
              <div className="space-y-4 max-h-96 overflow-y-auto pr-1">
                {maskReflections.map((ref) => (
                  <div key={ref.id} className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm space-y-2 animate-fade-in text-left">
                    <div className="flex justify-between items-start text-[10px] font-mono gap-2">
                      <span className="text-indigo-600 font-bold uppercase block max-w-[70%] leading-tight">{ref.label}</span>
                      <div className="flex items-center gap-1.5 shrink-0">
                        <span className="text-gray-400 text-[9px]">{ref.date}</span>
                        {onDeleteResult && (
                          <button
                            type="button"
                            onClick={() => {
                              if (window.confirm("¿Deseas eliminar este registro?")) {
                                onDeleteResult(ref.id);
                              }
                            }}
                            className="text-gray-400 hover:text-rose-500 cursor-pointer p-0.5"
                          >
                            <Trash2 size={12} />
                          </button>
                        )}
                      </div>
                    </div>
                    <p className="text-xs text-gray-700 italic leading-relaxed border-t border-slate-50 pt-1.5">
                      "{ref.details?.text}"
                    </p>
                    {ref.details?.aiInsight && (
                      <div className="bg-indigo-50/50 p-2 rounded-lg border border-indigo-100 space-y-1">
                        <p className="text-[10px] text-indigo-700 font-medium leading-relaxed">{ref.details.aiInsight}</p>
                        {ref.details?.aiAdvice && (
                          <p className="text-[10px] text-slate-600 italic">Consejo: {ref.details.aiAdvice}</p>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
