/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  Download,
  Printer,
  FileText,
  CheckCircle2,
  ShieldAlert,
  Heart,
  Zap,
  Sparkles,
  BookOpen,
  Bookmark,
  Info,
  Calendar,
  X,
  User,
  Coffee,
  HelpCircle,
  TrendingUp
} from 'lucide-react';
import { SavedResult } from '../types';

interface ReportViewerProps {
  results: SavedResult[];
  userName: string;
  onClose: () => void;
}

export default function ReportViewer({ results, userName, onClose }: ReportViewerProps) {
  const [aiAdvice, setAiAdvice] = useState<{ suggestion: string; advice: string } | null>(null);
  const [loadingAdvice, setLoadingAdvice] = useState(false);

  const rosenbergRes = results.find(r => r.testType === 'rosenberg');
  const cafeuRes = results.find(r => r.testType === 'cafeu');
  const journalEntries = results.filter(r => r.testType === 'journal');
  const reflectionsEntries = results.filter(r => r.testType === 'reflection');
  const maskReflections = results.filter(r => r.testType === 'mask_reflection');

  const formattedName = userName ? userName : "Explorador Mental";
  const currentDate = new Date().toLocaleDateString('es-ES', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  // Calculate high-level indexes
  const totalCompleted = [rosenbergRes, cafeuRes].filter(Boolean).length +
    (journalEntries.length > 0 ? 1 : 0) +
    (reflectionsEntries.length > 0 ? 1 : 0) +
    (maskReflections.length > 0 ? 1 : 0);

  // Overall Self-Knowledge Index Calculation
  let overallFactor = 50;
  if (rosenbergRes) {
    const rPercent = ((rosenbergRes.score! - 10) / 30) * 100;
    overallFactor += rPercent * 0.3;
  }
  if (cafeuRes) {
    const raw = cafeuRes.score!;
    let adapt = 50;
    if (raw >= 24 && raw <= 37) adapt = 90;
    else if (raw > 37) adapt = Math.max(10, 100 - (raw - 37) * 5);
    else adapt = 60;
    overallFactor += adapt * 0.3;
  }
  if (journalEntries.length > 0) {
    const totalValence = journalEntries.reduce((acc, curr) => acc + (curr.details?.valence || 0), 0);
    const avgValence = totalValence / journalEntries.length;
    const valPercent = 50 + (avgValence / 2);
    overallFactor += valPercent * 0.2;
  }
  if (reflectionsEntries.length > 0) {
    const refBoost = Math.min(20, reflectionsEntries.length * 6.5);
    overallFactor += refBoost;
  }
  const finalIndicator = Math.min(100, Math.max(15, Math.round(overallFactor)));

  // Generate analytical summary paragraphs dynamically
  const getDynamicSummary = () => {
    let summaryText = "Tu perfil psicológico denota una mente con una excelente disposición para el autodescubrimiento. ";

    if (results.length === 0) {
      return "No has registrado suficientes actividades en esta sesión aún para formular un diagnóstico analítico automatizado. Te sugerimos realizar las escalas psicométricas para poblar tu diagnóstico clínico.";
    }

    if (rosenbergRes) {
      if (rosenbergRes.score! < 25) {
        summaryText += "Se percibe cierta vulnerabilidad en tu nivel de autoestima global, donde la autocrítica puede estar socavando la confianza en tus capacidades personales. ";
      } else if (rosenbergRes.score! <= 34) {
        summaryText += "Tu autoestima se sitúa en un rango medio y sano, mostrando resiliencia y un autoconcepto equilibrado pero con margen para mitigar dudas ocasionales. ";
      } else {
        summaryText += "Posees una autoestima firmemente consolidada que amortigua eficazmente las valoraciones negativas externas y provee seguridad interna alta. ";
      }
    }

    if (cafeuRes) {
      if (cafeuRes.score! > 37) {
        summaryText += "Por otro lado, observamos niveles de estrés y ansiedad física elevados que sobrepasan la zona de rendimiento óptimo (Ley de Yerkes-Dodson), lo que puede traducirse en rumiación recurrente y fatiga somática. ";
      } else if (cafeuRes.score! >= 24) {
        summaryText += "Tu nivel de ansiedad es óptimo para la acción (eustrés), lo que te permite permanecer alerta, enfocado/a y productivo/a sin desgastar tu sistema cognitivo. ";
      } else {
        summaryText += "Presentas una activación tónica baja, lo que indica un reposo absoluto o un posible estado de desinterés y apatía respecto a metas inmediatas. ";
      }
    }

    if (journalEntries.length > 0 || reflectionsEntries.length > 0) {
      summaryText += "Tu participación interactiva en la terapia narrativa (diario y reflexiones) demuestra que utilizas la introspección estructurada para deconstruir atajos emocionales destructivos, lo que acelera de manera formidable tu plasticidad conductual progresiva.";
    }

    return summaryText;
  };

  // Create formatted Markdown string to download
  const generateMarkdownReport = () => {
    let md = `# REPORTE SINTÉTICO CLÍNICO - MASTER PSICO\n`;
    md += `==================================================\n\n`;
    md += `**Usuario:** ${formattedName}\n`;
    md += `**Fecha de Emisión:** ${currentDate}\n`;
    md += `**Índice de Introspección:** ${finalIndicator}%\n`;
    md += `**Módulos Completados:** ${totalCompleted} de 5\n\n`;
    md += `--------------------------------------------------\n`;
    md += `## 1. RESUMEN ANALÍTICO DE LA SESIÓN\n`;
    md += `${getDynamicSummary()}\n\n`;

    md += `--------------------------------------------------\n`;
    md += `## 2. DESGLOSE DE RESULTADOS PSICOMÉTRICOS\n\n`;

    if (rosenbergRes) {
      md += `### A. Escala de Autoestima de Rosenberg\n`;
      md += `- **Puntaje:** ${rosenbergRes.score} / 40\n`;
      md += `- **Clasificación:** ${rosenbergRes.label}\n`;
      md += `- **Fecha:** ${rosenbergRes.date}\n`;
      md += `- **Sugerencia CBT:** `;
      if (rosenbergRes.score! < 25) {
        md += `Reescribe activamente las afirmaciones de autocrítica destructiva. Realiza un diario de éxitos objetivos diarios.\n`;
      } else {
        md += `Consolida tus fortalezas internas manteniendo conversaciones amables con tus vulnerabilidades periféricas.\n`;
      }
      md += `\n`;
    } else {
      md += `### A. Escala de Autoestima de Rosenberg\n`;
      md += `*Módulo no realizado en esta sesión.*\n\n`;
    }

    if (cafeuRes) {
      md += `### B. Cuestionario de Ansiedad y Rendimiento (CAFEU)\n`;
      md += `- **Puntaje:** ${cafeuRes.score} / 50\n`;
      md += `- **Clasificación:** ${cafeuRes.label}\n`;
      md += `- **Fecha:** ${cafeuRes.date}\n`;
      md += `- **Sugerencia CBT:** `;
      if (cafeuRes.score! > 37) {
        md += `Implementa descansos programados de respiración diafragmática (patrón 4-7-8) y reduce el estímulo calórico cognitivo.\n`;
      } else {
        md += `Mantén hábitos saludables de sueño y ejercicio para sostener tu excelente autorregulación fisiológica.\n`;
      }
      md += `\n`;
    } else {
      md += `### B. Cuestionario de Ansiedad y Rendimiento (CAFEU)\n`;
      md += `*Módulo no realizado en esta sesión.*\n\n`;
    }

    md += `--------------------------------------------------\n`;
    md += `## 3. TERAPIA NARRATIVA Y DIARIO DE ESPEJO EMPÁTICO IA\n\n`;
    if (journalEntries.length === 0) {
      md += `*No se han guardado registros de diarios analizados por IA en esta sesión.*\n\n`;
    } else {
      journalEntries.forEach((entry, idx) => {
        md += `### Entrada #${idx + 1} (${entry.date})\n`;
        md += `- **Estado Emocional Inicial:** ${entry.label}\n`;
        md += `- **Nivel de Valencia:** ${entry.details?.valence} / 100\n`;
        if (entry.details?.rawText) {
          md += `- **Texto Escrito:** "${entry.details.rawText}"\n`;
        }
        if (entry.details?.analysis?.identifiedDistortions?.length > 0) {
          md += `- **Distorsiones Cognitivas Detectadas:** ${entry.details.analysis.identifiedDistortions.join(', ')}\n`;
        }
        if (entry.details?.analysis?.empatheticFeedback) {
          md += `- **Espejo Clínico Empático:** ${entry.details.analysis.empatheticFeedback}\n`;
        }
        if (entry.details?.analysis?.copingStrategies?.length > 0) {
          md += `- **Estrategias de Afrontamiento:**\n`;
          entry.details.analysis.copingStrategies.forEach((strategy: string) => {
            md += `  * ${strategy}\n`;
          });
        }
        md += `\n`;
      });
    }

    md += `--------------------------------------------------\n`;
    md += `## 4. AUTOANÁLISIS DE MÁSCARAS EMOCIONALES Y DEFENSAS\n\n`;
    if (maskReflections.length === 0) {
      md += `*No se han registrado reflexiones sobre máscaras emocionales o mecanismos de defensa hoy.*\n\n`;
    } else {
      maskReflections.forEach((ref, idx) => {
        md += `### Análisis #${idx + 1} (${ref.date})\n`;
        md += `- **Mecanismo de Defensa Evaluado:** ${ref.label}\n`;
        md += `- **Diálogo Reflexivo Interno:** "${ref.details?.text}"\n\n`;
      });
    }

    md += `--------------------------------------------------\n`;
    md += `## 5. BITÁCORA DE REFLEXIONES GUIADAS\n\n`;
    if (reflectionsEntries.length === 0) {
      md += `*No se han completado plantillas de reflexión guiada en esta sesión.*\n\n`;
    } else {
      reflectionsEntries.forEach((ref, idx) => {
        md += `### Plantilla: ${ref.label} (${ref.date})\n`;
        const qas = ref.details?.answers || [];
        qas.forEach((qa: { question: string; answer: string }, qIdx: number) => {
          md += `  **Pregunta ${qIdx + 1}:** ${qa.question}\n`;
          md += `  **Respuesta:** "${qa.answer}"\n\n`;
        });
      });
    }

    md += `--------------------------------------------------\n`;
    md += `## 6. PLAN TERAPÉUTICO COGNITIVO RECOMENDADO\n`;
    md += `1. **Atención a Filtros Mentales:** Si la IA detectó distorsiones, practica el registro objetivo de eventos diarios sin adjetivos emocionales.\n`;
    md += `2. **Respiración Fisiológica:** Practica la coherencia cardíaca dedicando 5 minutos cada mañana a respirar lentamente a un ritmo de 6 respiraciones por minuto.\n`;
    md += `3. **Estrategia Asertiva:** Revisa tus límites asertivos semanalmente para modular la máscara complaciente si aplica.\n`;
    md += `4. **Ejercicios de Diálogo Amable:** Al final del día, escribe un agradecimiento libre hacia ti mismo reconociendo tu esfuerzo.\n\n`;
    md += `*Declaración Ética: Este reporte fue estructurado automáticamente bajo consentimiento para autodescubrimiento. No sustituye la consulta personalizada con un profesional de la salud mental certificado.*\n`;

    return md;
  };

  const downloadBlob = (content: string, filename: string, contentType: string) => {
    const blob = new Blob([content], { type: contentType });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleDownloadMarkdown = () => {
    const md = generateMarkdownReport();
    downloadBlob(md, `Reporte_Psicologico_${formattedName.replace(/\s+/g, '_')}.md`, 'text/markdown;charset=utf-8;');
  };

  const handleDownloadPDF = async () => {
    // Fetch AI advice first if not already loaded
    if (!aiAdvice && results.length > 0) {
      setLoadingAdvice(true);
      try {
        // Create a rich context summary instead of just the textual one
        const rawContext = {
          userName: formattedName,
          stats: {
            rosenberg: rosenbergRes ? { score: rosenbergRes.score, label: rosenbergRes.label } : 'Not done',
            cafeu: cafeuRes ? { score: cafeuRes.score, label: cafeuRes.label } : 'Not done',
            journals: journalEntries.map(j => ({ label: j.label, date: j.date })),
            masks: maskReflections.map(m => m.label),
            reflections: reflectionsEntries.map(r => r.label)
          },
          textSummary: getDynamicSummary()
        };

        const summary = JSON.stringify(rawContext);

        const resp = await fetch('/api/report-advice', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ summary }),
        });
        if (resp.ok) {
          const data = await resp.json();
          setAiAdvice(data);
        }
      } catch {/* ignore */ } finally {
        setLoadingAdvice(false);
      }
    }
    // Small delay to allow React to re-render the AI advice before printing
    setTimeout(() => window.print(), 300);
  };

  return (
    <div
      className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fade-in print:relative print:bg-white print:p-0 print:inset-auto print:backdrop-blur-none"
      id="report-viewer-modal"
    >
      <div className="bg-white rounded-3xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col shadow-2xl border border-slate-100 print:max-h-none print:shadow-none print:border-none print:rounded-none print:block print-one-page">

        {/* Modal Top Header (Hidden on print) */}
        <div className="bg-slate-900 text-white p-5 pr-6 flex justify-between items-center shrink-0 print:hidden">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-indigo-500/10 rounded-xl">
              <FileText className="text-indigo-400" size={22} />
            </div>
            <div>
              <h2 className="text-lg font-black tracking-tight">Expediente de Autoconocimiento</h2>
              <p className="text-[10px] text-slate-400 font-medium">Exportación segura de bitácoras clínicas locales</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 hover:bg-white/10 rounded-lg text-slate-400 hover:text-white transition-colors cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        {/* Modal Secondary Action Bar (Hidden on print) */}
        <div className="bg-slate-50 border-b border-slate-100 p-4 px-6 sm:flex sm:justify-between sm:items-center space-y-3 sm:space-y-0 print:hidden">
          <div className="flex items-center gap-2.5 text-xs text-slate-500 font-medium">
            <Info size={14} className="text-indigo-500 shrink-0" />
            <span>Este informe contiene tu historial completo de autoanálisis en esta sesión.</span>
          </div>

          <div className="flex gap-2">
            <button
              onClick={handleDownloadPDF}
              disabled={loadingAdvice}
              className="py-2 px-5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl text-xs transition-all flex items-center gap-1.5 shadow-sm cursor-pointer disabled:opacity-60"
            >
              {loadingAdvice ? (
                <><span className="animate-spin inline-block w-3 h-3 border-2 border-white border-t-transparent rounded-full" /> Preparando...</>
              ) : (
                <><Download size={14} /> Descargar PDF Completo</>
              )}
            </button>
          </div>
        </div>

        {/* Modal Print and Scrollable Content Area */}
        <div className="overflow-y-auto p-8 sm:p-12 space-y-8 print:overflow-visible print:p-0 print:space-y-4 print:block">
          {/* Diagnostic Header */}
          <div className="border-b border-slate-100 pb-6 flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4 print:pb-4 printable-block">
            <div className="space-y-2">
              <span className="text-xs uppercase bg-indigo-50 text-indigo-700 font-mono font-black px-3 py-1 rounded-full print:border print:border-indigo-100">
                MASTER PSICO • EXPEDIENTE DE SESIÓN
              </span>
              <h1 className="text-3xl font-black text-slate-800 tracking-tight">Reporte de Autodescubrimiento</h1>
              <div className="flex flex-col gap-1 text-slate-500 text-xs font-semibold pt-1">
                <span className="flex items-center gap-1.5 text-slate-600 font-bold">
                  <User size={13} className="text-slate-400" /> Paciente: {formattedName}
                </span>
                <span className="flex items-center gap-1.5">
                  <Calendar size={13} className="text-slate-400" /> Emitido: {currentDate}
                </span>
              </div>
            </div>

            {/* Quick Metrics Badge */}
            <div className="bg-slate-50 border border-slate-100 p-4.5 rounded-2xl flex items-center gap-6 print:border-slate-200 print:p-3 print:gap-4">
              <div className="text-center">
                <span className="text-[10px] font-mono text-slate-400 block font-bold uppercase">ÍNDICE DE INTROSPECCIÓN</span>
                <span className="text-3xl font-black text-indigo-600 print:text-2xl">{finalIndicator}%</span>
              </div>
              <div className="h-10 w-px bg-slate-200 print:h-8" />
              <div className="text-center">
                <span className="text-[10px] font-mono text-slate-400 block font-bold uppercase">MÓDULOS ACTIVOS</span>
                <span className="text-3xl font-black text-slate-800 print:text-2xl">{totalCompleted} / 5</span>
              </div>
            </div>
          </div>

          {/* Section 1: Executive Psychological Abstract */}
          <div className="space-y-3 bg-slate-50/50 p-6 rounded-2xl border border-slate-100 print:bg-white print:border-slate-200 print:p-3 printable-block">
            <h3 className="text-sm font-bold font-mono tracking-wider text-slate-400 uppercase flex items-center gap-2 print:text-xs">
              <TrendingUp size={14} className="text-indigo-600" />
              1. Resumen Analítico Interpretativo
            </h3>
            <p className="text-xs text-slate-600 leading-relaxed font-semibold italic text-justify print:text-[10px]">
              "{getDynamicSummary()}"
            </p>
          </div>

          {/* Section 2: Clinical Questionnaires */}
          <div className="space-y-6 print:space-y-3 printable-block">
            <h3 className="text-sm font-bold font-mono tracking-wider text-slate-400 uppercase border-b border-slate-100 pb-2 print:text-xs print:pb-1">
              2. Diagnósticos Psicométricos de Escala
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

              {/* Rosenberg */}
              <div className="p-5 bg-white border border-slate-100 rounded-2xl shadow-sm space-y-3 print:border-slate-200">
                <div className="flex justify-between items-start">
                  <span className="p-2 bg-rose-50 text-rose-500 rounded-lg">
                    <Heart size={18} className="fill-rose-100 text-rose-500" />
                  </span>
                  <span className="text-[10px] font-mono font-bold text-slate-400">ESCALA RECONOCIDA</span>
                </div>
                <div>
                  <h4 className="text-sm font-extrabold text-slate-800">Autoestima Absoluta (Rosenberg)</h4>
                  {rosenbergRes ? (
                    <div className="mt-2 space-y-2">
                      <div className="flex items-baseline gap-1.5">
                        <span className="text-xl font-black text-indigo-600">{rosenbergRes.score} pts</span>
                        <span className="text-xs text-slate-500">/ 40</span>
                      </div>
                      <p className="text-xs font-semibold text-slate-700 bg-slate-50 p-2 rounded-lg border border-slate-100 leading-normal">
                        Rango: <strong className="text-indigo-600 font-extrabold">{rosenbergRes.label}</strong>. {rosenbergRes.score! < 25 ? 'Indica necesidad de cultivar asertividad y diálogo interno compasivo.' : 'Indica un autoconcepto saludable y protector.'}
                      </p>
                    </div>
                  ) : (
                    <p className="text-xs text-slate-400 italic mt-2">Módulo psicométrico no completado en esta sesión.</p>
                  )}
                </div>
              </div>

              {/* CAFEU */}
              <div className="p-5 bg-white border border-slate-100 rounded-2xl shadow-sm space-y-3 print:border-slate-200">
                <div className="flex justify-between items-start">
                  <span className="p-2 bg-violet-50 text-violet-500 rounded-lg">
                    <Zap size={18} className="fill-violet-100 text-violet-500" />
                  </span>
                  <span className="text-[10px] font-mono font-bold text-slate-400">LEGISLACIÓN CLÍNICA</span>
                </div>
                <div>
                  <h4 className="text-sm font-extrabold text-slate-800">Cuestionario CAFEU (Ansiedad / Yerkes-Dodson)</h4>
                  {cafeuRes ? (
                    <div className="mt-2 space-y-2">
                      <div className="flex items-baseline gap-1.5">
                        <span className="text-xl font-black text-indigo-600">{cafeuRes.score} pts</span>
                        <span className="text-xs text-slate-500">/ 50</span>
                      </div>
                      <p className="text-xs font-semibold text-slate-700 bg-slate-50 p-2 rounded-lg border border-slate-100 leading-normal">
                        Rango: <strong className="text-indigo-600 font-extrabold">{cafeuRes.label?.split("(")[0]}</strong>. {cafeuRes.score! > 37 ? 'Indica niveles intensos de agobio y activación nerviosa.' : 'Indica adaptabilidad y eustrés controlado.'}
                      </p>
                    </div>
                  ) : (
                    <p className="text-xs text-slate-400 italic mt-2">Módulo psicométrico no completado en esta sesión.</p>
                  )}
                </div>
              </div>

            </div>
          </div>

          {/* Section 3: Journals Empathetic Analysis */}
          <div className="space-y-4 print:space-y-2 printable-block">
            <h3 className="text-sm font-bold font-mono tracking-wider text-slate-400 uppercase border-b border-slate-100 pb-2 print:text-xs print:pb-1">
              3. Terapia Narrativa (Espejo Empático IA)
            </h3>

            {journalEntries.length === 0 ? (
              <p className="text-xs text-slate-400 italic pl-1">No hay entradas de diario guardadas hoy.</p>
            ) : (
              <div className="space-y-4">
                {journalEntries.map((j, jIdx) => (
                  <div key={j.id} className="p-5 bg-white border border-slate-100 rounded-2xl shadow-sm space-y-3.5 print:border-slate-200 print:p-3 print:space-y-2 printable-block">
                    <div className="flex justify-between items-center text-[10px] font-mono">
                      <span className="text-indigo-600 font-black">ENTRADA #{jIdx + 1} ({j.date})</span>
                      <span className="bg-emerald-50 text-emerald-700 px-2.5 py-0.5 rounded-full font-bold uppercase print:text-[8px]">{j.label}</span>
                    </div>

                    {j.details?.rawText && (
                      <div className="bg-slate-50/50 p-3 rounded-xl border border-dashed border-slate-200">
                        <span className="text-[9px] font-mono font-bold text-slate-400 block uppercase mb-1">Transcripción del texto original:</span>
                        <p className="text-xs text-slate-600 leading-relaxed font-semibold italic">"{j.details.rawText}"</p>
                      </div>
                    )}

                    {j.details?.analysis && (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-semibold mt-2">
                        {j.details.analysis.identifiedDistortions?.length > 0 && (
                          <div className="space-y-1">
                            <span className="text-[10px] font-mono text-rose-500 font-bold block uppercase">Distorsiones Detectadas:</span>
                            <div className="flex flex-wrap gap-1">
                              {j.details.analysis.identifiedDistortions.map((d: string) => (
                                <span key={d} className="bg-rose-50 border border-rose-100 text-rose-700 px-2 py-0.5 rounded-md text-[10px] font-extrabold uppercase">
                                  {d}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}

                        {j.details.analysis.copingStrategies?.length > 0 && (
                          <div className="space-y-1">
                            <span className="text-[10px] font-mono text-emerald-600 font-bold block uppercase">Estrategias Clínicas Formuladas:</span>
                            <ul className="list-disc list-inside space-y-0.5 text-slate-600 text-[11px]">
                              {j.details.analysis.copingStrategies.map((s: string, sIdx: number) => (
                                <li key={sIdx} className="leading-tight">{s}</li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Section 4: Emotional Masks & Defenses */}
          <div className="space-y-4">
            <h3 className="text-sm font-bold font-mono tracking-wider text-slate-400 uppercase border-b border-slate-100 pb-2">
              4. Comprensión Emocional (Mecanismos de Defensa)
            </h3>

            {maskReflections.length === 0 ? (
              <p className="text-xs text-slate-400 italic pl-1">No se han registrado reflexiones sobre máscaras hoy.</p>
            ) : (
              <div className="space-y-4">
                {maskReflections.map((ref, idx) => (
                  <div key={ref.id} className="p-5 bg-white border border-slate-100 rounded-2xl shadow-sm space-y-2.5 print:border-slate-200">
                    <div className="flex justify-between items-center text-[10px] font-mono">
                      <span className="text-indigo-600 font-black">AUTOANÁLISIS #{idx + 1} ({ref.date})</span>
                      <span className="bg-amber-50 text-amber-700 px-2.5 py-0.5 rounded-full font-bold uppercase">{ref.label}</span>
                    </div>
                    <p className="text-xs text-slate-600 italic font-semibold bg-slate-50/50 p-4 rounded-xl border border-slate-100">
                      "{ref.details?.text}"
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Section 5: Guided Reflections */}
          <div className="space-y-4">
            <h3 className="text-sm font-bold font-mono tracking-wider text-slate-400 uppercase border-b border-slate-100 pb-2">
              5. Bitácora de Reflexiones Guiadas
            </h3>

            {reflectionsEntries.length === 0 ? (
              <p className="text-xs text-slate-400 italic pl-1">No se han completado plantillas de reflexión guiadas hoy.</p>
            ) : (
              <div className="space-y-4">
                {reflectionsEntries.map((ref, idx) => (
                  <div key={ref.id} className="p-5 bg-white border border-slate-100 rounded-2xl shadow-sm space-y-4 print:border-slate-200">
                    <div className="flex justify-between items-center text-[10px] font-mono border-b border-slate-50 pb-2.5">
                      <span className="text-indigo-600 font-black uppercase">PLANTILLA GUIADA</span>
                      <span className="bg-indigo-50 text-indigo-700 px-2.5 py-0.5 rounded-full font-bold uppercase">{ref.label}</span>
                    </div>

                    <div className="space-y-3.5 pt-1">
                      {(ref.details?.answers || []).map((qa: { question: string; answer: string }, qIdx: number) => (
                        <div key={qIdx} className="space-y-1">
                          <h5 className="text-[11px] font-bold text-slate-700 flex gap-1.5 items-start">
                            <span className="bg-slate-100 text-slate-600 font-mono text-[9px] px-1 py-0.1 rounded uppercase">P{qIdx + 1}</span>
                            <span>{qa.question}</span>
                          </h5>
                          <p className="text-xs text-slate-600 italic font-semibold pl-6 leading-relaxed bg-slate-50/30 p-2.5 rounded-xl border border-slate-50">
                            "{qa.answer}"
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Section 6: Actionable CBT Protocol Exercises */}
          <div className="space-y-4 border-t border-slate-100 pt-8">
            <h3 className="text-sm font-bold font-mono tracking-wider text-slate-400 uppercase">
              6. Plan de Afrontamiento y Ejercicios Recomendados
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-4.5 bg-indigo-50/40 rounded-xl border border-indigo-100/30 space-y-1.5 font-semibold text-xs print:bg-white print:border-slate-200">
                <div className="flex items-center gap-1.5 font-bold text-indigo-900">
                  <Coffee size={14} />
                  Anotación Objetiva de Hechos
                </div>
                <p className="text-[11px] text-slate-600 leading-normal font-medium">
                  Cuando detectes pensamiento apocalíptico o perfeccionista, divide una página en dos: hechos comprobables a la izquierda, y suposiciones miedosas a la derecha para contrastar sesgos racionales.
                </p>
              </div>

              <div className="p-4.5 bg-emerald-50/40 rounded-xl border border-emerald-100/30 space-y-1.5 font-semibold text-xs print:bg-white print:border-slate-200">
                <div className="flex items-center gap-1.5 font-bold text-emerald-900">
                  <CheckCircle2 size={14} className="text-emerald-600" />
                  Ejercicios de Diálogo Amable
                </div>
                <p className="text-[11px] text-slate-600 leading-normal font-medium">
                  Si la escala de valoración es baja, mantén un bloque semanal de autocompasión: escribe qué respuestas le darías a un colega querido sometido a las mismas presiones que tú hoy.
                </p>
              </div>
            </div>
          </div>

          {/* AI Personalized Advice Section */}
          {aiAdvice && (
            <div className="space-y-4 border-t-2 border-indigo-100 pt-8 print:pt-4 print:space-y-2 printable-block">
              <h3 className="text-sm font-bold font-mono tracking-wider text-indigo-500 uppercase flex items-center gap-2 print:text-xs">
                <Sparkles size={14} className="text-indigo-500" />
                7. Consejo Terapéutico Personalizado (IA)
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 print:gap-2">
                <div className="p-5 bg-indigo-50 border border-indigo-100 rounded-2xl space-y-2 print:border-indigo-200 print:p-3">
                  <span className="text-[10px] font-mono font-bold text-indigo-500 uppercase block print:text-[8px]">Sugerencia basada en tu perfil</span>
                  <p className="text-xs text-indigo-900 font-semibold leading-relaxed print:text-[9px]">{aiAdvice.suggestion}</p>
                </div>
                <div className="p-5 bg-emerald-50 border border-emerald-100 rounded-2xl space-y-2 print:border-emerald-200 print:p-3">
                  <span className="text-[10px] font-mono font-bold text-emerald-600 uppercase block print:text-[8px]">Consejo para esta semana</span>
                  <p className="text-xs text-emerald-900 font-semibold leading-relaxed italic print:text-[9px]">"{aiAdvice.advice}"</p>
                </div>
              </div>
            </div>
          )}

          {/* Professional Footer Frame */}
          <div className="border-t border-slate-100 pt-8 flex flex-col sm:flex-row justify-between items-center text-[10px] text-slate-400 gap-4">
            <div className="flex flex-col gap-0.5 text-center sm:text-left">
              <span className="font-extrabold text-slate-500 uppercase">Master Psico System</span>
              <span>Análisis de Autoconocimiento Estructurado</span>
            </div>
            <p className="text-center sm:text-right max-w-sm font-medium leading-normal">
              Advertencia: Este expediente es estrictamente educativo y de apoyo introspectivo. No constituye diagnóstico psiquiátrico oficial.
            </p>
          </div>

        </div>

      </div>
    </div>
  );
}
