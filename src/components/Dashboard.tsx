/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Heart, Zap, Sparkles, BookOpen, Skull, Smile, ChevronRight, Activity, Award, Compass, MessageSquarePlus, Bookmark, FileText, Download } from 'lucide-react';
import { SavedResult } from '../types';

interface DashboardProps {
  results: SavedResult[];
  onNavigate: (section: 'rosenberg' | 'cafeu' | 'masks' | 'journal' | 'reflections') => void;
  userName: string;
  setUserName: (name: string) => void;
  onOpenReport: () => void;
}

export default function Dashboard({ results, onNavigate, userName, setUserName, onOpenReport }: DashboardProps) {
  const rosenbergRes = results.find(r => r.testType === 'rosenberg');
  const cafeuRes = results.find(r => r.testType === 'cafeu');
  const journalEntries = results.filter(r => r.testType === 'journal');
  const reflectionsEntries = results.filter(r => r.testType === 'reflection');

  // Overall Index Calculation
  let overallFactor = 50; // starts at mid neutral
  let completedCount = 0;
  if (rosenbergRes) {
    // scale 10-40 into a 0-100 percentage
    const rPercent = ((rosenbergRes.score! - 10) / 30) * 100;
    overallFactor += rPercent * 0.3;
    completedCount++;
  }
  if (cafeuRes) {
    // optimal score is mid scale (around 24-35). Low anxiety or extremely high anxiety decreases factor.
    const raw = cafeuRes.score!;
    let adapt = 50;
    if (raw >= 24 && raw <= 37) adapt = 90; // optimum performance zone
    else if (raw > 37) adapt = Math.max(10, 100 - (raw - 37) * 5); // too high
    else adapt = 60; // too low
    overallFactor += adapt * 0.3;
    completedCount++;
  }
  if (journalEntries.length > 0) {
    // Average valence
    const totalValence = journalEntries.reduce((acc, curr) => acc + (curr.details?.valence || 0), 0);
    const avgValence = totalValence / journalEntries.length; // -100 to 100
    const valPercent = 50 + (avgValence / 2); // 0 to 100
    overallFactor += valPercent * 0.2;
    completedCount++;
  }
  if (reflectionsEntries.length > 0) {
    // Reflective practice significantly boosts self-knowledge Index (up to 20 pts)
    const refBoost = Math.min(20, reflectionsEntries.length * 6.5);
    overallFactor += refBoost;
    completedCount++;
  }

  // Cap at 100 or min at 15
  const finalIndicator = Math.min(100, Math.max(15, Math.round(overallFactor)));

  return (
    <div className="max-w-6xl mx-auto py-6 space-y-8 animate-fade-in" id="dashboard-layout">
      {/* Welcome & Persona Input Header */}
      <div className="bg-gradient-to-r from-slate-900 to-indigo-950 text-slate-100 p-8 rounded-3xl shadow-xl flex flex-col md:flex-row justify-between items-center gap-6 relative overflow-hidden">
        {/* Abstract design elements to make it striking and avoid plain overlays */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_107%,rgba(99,102,241,0.15),transparent_40%)]" />
        <div className="absolute -right-10 -bottom-10 w-44 h-44 bg-purple-500/10 rounded-full blur-2xl" />

        <div className="space-y-3 z-10 text-center md:text-left">
          <span className="text-xs bg-indigo-500/20 text-indigo-300 font-bold px-3 py-1 rounded-full uppercase tracking-widest font-mono">
            TU BIÓSFERA PSICOLÓGICA
          </span>
          <div className="flex flex-col sm:flex-row items-center gap-3">
            <h1 className="text-3xl font-black tracking-tight leading-tight">
              Hola, {userName ? userName : "Explorador Mental"}
            </h1>
            <input
              type="text"
              value={userName}
              onChange={(e) => setUserName(e.target.value)}
              placeholder="Escribe tu nombre..."
              className="text-xs px-3 py-1.5 bg-white/10 rounded-xl border border-white/20 text-white focus:outline-none focus:ring-1 focus:ring-indigo-400 placeholder-indigo-300/60 font-bold w-40 text-center sm:text-left"
            />
          </div>
          <p className="text-sm text-slate-300 max-w-md leading-relaxed font-medium">
            Bienvenido a tu panel analítico. Aquí medimos científicamente tu equilibrio cognitivo, autoestima global y adaptabilidad emocional.
          </p>
        </div>

        {/* Global Self-Knowledge Circle Meter */}
        <div className="flex flex-col items-center bg-white/5 py-4 px-6 rounded-2xl border border-white/10 z-10">
          <span className="text-[10px] font-mono font-bold tracking-widest text-indigo-300 mb-2">INDICE DE INTROSPECCIÓN</span>
          <div className="relative w-28 h-28">
            <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
              <path className="stroke-white/10" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" strokeWidth="3.5"></path>
              <path className="stroke-emerald-400 transition-all duration-1000" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" strokeDasharray={`${finalIndicator}, 100`} strokeLinecap="round" strokeWidth="3.5"></path>
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-2xl font-black text-white">{finalIndicator}%</span>
              <span className="text-[8px] font-bold text-slate-300">ESTABLE</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Core Modules Grid */}
      <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
        <Activity className="text-indigo-600" size={18} />
        Módulos Clínicos Disponibles
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        
        {/* Module 1: Self Esteem (Rosenberg) */}
        <div className="bg-white border border-gray-100 shadow-sm rounded-2xl p-6 flex flex-col justify-between hover:shadow-md transition-shadow relative overflow-hidden group">
          <div className="space-y-4">
            <div className="flex justify-between items-start">
              <div className="p-3 bg-rose-50 text-rose-500 rounded-xl group-hover:bg-rose-100 transition-colors">
                <Heart size={20} className="fill-rose-100 text-rose-500" />
              </div>
              <span className="text-[10px] bg-slate-50 text-slate-500 px-2.5 py-0.5 rounded-full font-bold">10 PREGUNTAS</span>
            </div>
            <div>
              <h3 className="font-bold text-slate-800 text-base leading-tight">Escala de Autoestima (Rosenberg)</h3>
              <p className="text-xs text-gray-500 mt-2 leading-relaxed font-semibold">
                Evalúa tu grado de aprecio, autoconcepto, y valía personal bajo parámetros clínicos validados.
              </p>
            </div>
          </div>

          {/* Result state or action */}
          <div className="mt-8 pt-4 border-t border-slate-50">
            {rosenbergRes ? (
              <div className="flex justify-between items-center">
                <div>
                  <span className="text-[10px] font-mono text-gray-400 block uppercase">Puntaje registrado</span>
                  <span className="text-sm font-bold text-slate-800">{rosenbergRes.score} pts ({rosenbergRes.label})</span>
                </div>
                <button onClick={() => onNavigate('rosenberg')} className="p-1 px-2.5 bg-slate-105 border border-slate-200 hover:border-slate-300 text-xs text-gray-600 rounded-lg font-bold">
                  Repetir
                </button>
              </div>
            ) : (
              <button
                onClick={() => onNavigate('rosenberg')}
                className="w-full py-2 bg-rose-500 hover:bg-rose-600 text-white rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5"
              >
                Comenzar Test <ChevronRight size={14} />
              </button>
            )}
          </div>
        </div>

        {/* Module 2: Anxiety (CAFEU) */}
        <div className="bg-white border border-gray-100 shadow-sm rounded-2xl p-6 flex flex-col justify-between hover:shadow-md transition-shadow relative overflow-hidden group">
          <div className="space-y-4">
            <div className="flex justify-between items-start">
              <div className="p-3 bg-violet-50 text-violet-500 rounded-xl group-hover:bg-violet-100 transition-colors">
                <Zap size={20} className="fill-violet-100 text-violet-500" />
              </div>
              <span className="text-[10px] bg-slate-50 text-slate-500 px-2.5 py-0.5 rounded-full font-bold">10 PREGUNTAS</span>
            </div>
            <div>
              <h3 className="font-bold text-slate-800 text-base leading-tight">Ansiedad y Rendimiento (CAFEU)</h3>
              <p className="text-xs text-gray-400 mt-2 leading-relaxed font-semibold">
                Mide tu reactividad autonómica física y mental relacionando el estrés con la Ley de Yerkes-Dodson.
              </p>
            </div>
          </div>

          <div className="mt-8 pt-4 border-t border-slate-50">
            {cafeuRes ? (
              <div className="flex justify-between items-center">
                <div>
                  <span className="text-[10px] font-mono text-gray-400 block uppercase">Nivel de estrés</span>
                  <span className="text-sm font-bold text-slate-800">{cafeuRes.score} pts ({cafeuRes.label?.split("(")[0]})</span>
                </div>
                <button onClick={() => onNavigate('cafeu')} className="p-1 px-3 bg-slate-105 border border-slate-200 hover:border-slate-300 text-xs text-gray-600 rounded-lg font-bold">
                  Repetir
                </button>
              </div>
            ) : (
              <button
                onClick={() => onNavigate('cafeu')}
                className="w-full py-2 bg-violet-600 hover:bg-violet-700 text-white rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5"
              >
                Comenzar Test <ChevronRight size={14} />
              </button>
            )}
          </div>
        </div>

        {/* Module 3: Emotional Masks */}
        <div className="bg-white border border-gray-100 shadow-sm rounded-2xl p-6 flex flex-col justify-between hover:shadow-md transition-shadow relative overflow-hidden group">
          <div className="space-y-4">
            <div className="flex justify-between items-start">
              <div className="p-3 bg-amber-50 text-amber-500 rounded-xl group-hover:bg-amber-100 transition-colors">
                <BookOpen size={20} className="text-amber-500" />
              </div>
              <span className="text-[10px] bg-amber-50 text-amber-600 px-2.5 py-0.5 rounded-full font-bold uppercase">PERSONAS</span>
            </div>
            <div>
              <h3 className="font-bold text-slate-800 text-base leading-tight">Máscaras y Mecanismos de Defensa</h3>
              <p className="text-xs text-gray-400 mt-2 leading-relaxed font-semibold">
                Explora el perfeccionismo, salvacionismo y frialdad defensiva para revelar tus temores inconscientes.
              </p>
            </div>
          </div>

          <div className="mt-8 pt-4 border-t border-slate-50">
            <button
              onClick={() => onNavigate('masks')}
              className="w-full py-2 bg-slate-800 hover:bg-slate-900 text-white rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5"
            >
              Ver Máscaras <ChevronRight size={14} />
            </button>
          </div>
        </div>

        {/* Module 4: Emotional Diary / Empathy Mirror */}
        <div className="bg-white border border-gray-100 shadow-sm rounded-2xl p-6 flex flex-col justify-between hover:shadow-md transition-shadow relative overflow-hidden group">
          <div className="space-y-4">
            <div className="flex justify-between items-start">
              <div className="p-3 bg-emerald-50 text-emerald-500 rounded-xl group-hover:bg-emerald-100 transition-colors">
                <Sparkles size={20} className="text-emerald-500 animate-pulse" />
              </div>
              <span className="text-[10px] bg-slate-50 text-slate-500 px-2.5 py-0.5 rounded-full font-bold">ANALIZADOR IA</span>
            </div>
            <div>
              <h3 className="font-bold text-slate-800 text-base leading-tight">Diario de Espejo Empático IA</h3>
              <p className="text-xs text-gray-400 mt-2 leading-relaxed font-semibold">
                Escribe tu día. La IA de Master Psico catalogará distorsiones en tiempo real y sugerirá ejercicios cognitivos.
              </p>
            </div>
          </div>

          <div className="mt-8 pt-4 border-t border-slate-50">
            {journalEntries.length > 0 ? (
              <div className="flex justify-between items-center">
                <div>
                  <span className="text-[10px] font-mono text-gray-400 block uppercase">Diarios escritos</span>
                  <span className="text-sm font-bold text-slate-800">{journalEntries.length} entradas</span>
                </div>
                <button
                  onClick={() => onNavigate('journal')}
                  className="flex items-center gap-1 py-1 px-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 text-xs rounded-lg font-bold transition-colors"
                >
                  <MessageSquarePlus size={12} /> Escribir
                </button>
              </div>
            ) : (
              <button
                onClick={() => onNavigate('journal')}
                className="w-full py-2 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5"
              >
                Escribir Diario IA <ChevronRight size={14} />
              </button>
            )}
          </div>
        </div>

        {/* Module 5: Guided Reflections */}
        <div className="bg-white border border-gray-100 shadow-sm rounded-2xl p-6 flex flex-col justify-between hover:shadow-md transition-shadow relative overflow-hidden group">
          <div className="space-y-4">
            <div className="flex justify-between items-start">
              <div className="p-3 bg-indigo-50 text-indigo-500 rounded-xl group-hover:bg-indigo-100 transition-colors">
                <Bookmark size={20} className="text-indigo-500 fill-indigo-100" />
              </div>
              <span className="text-[10px] bg-indigo-50 text-indigo-600 px-2.5 py-0.5 rounded-full font-bold uppercase">PROCESO</span>
            </div>
            <div>
              <h3 className="font-bold text-slate-800 text-base leading-tight">Diario de Reflexiones Guiadas</h3>
              <p className="text-xs text-slate-400 mt-2 leading-relaxed font-semibold">
                Resuelve preguntas reflexivas enfocadas en gratitud, superación de estrés, metas pragmáticas, autoestima y límites.
              </p>
            </div>
          </div>

          <div className="mt-8 pt-4 border-t border-slate-50">
            {reflectionsEntries.length > 0 ? (
              <div className="flex justify-between items-center">
                <div>
                  <span className="text-[10px] font-mono text-gray-400 block uppercase">Certezas registradas</span>
                  <span className="text-sm font-bold text-slate-800">{reflectionsEntries.length} reflexiones</span>
                </div>
                <button
                  onClick={() => onNavigate('reflections')}
                  className="flex items-center gap-1 py-1 px-3 bg-indigo-55 border border-indigo-200 hover:border-indigo-300 text-indigo-700 hover:bg-indigo-50 text-xs rounded-lg font-bold transition-colors"
                >
                  Continuar
                </button>
              </div>
            ) : (
              <button
                onClick={() => onNavigate('reflections')}
                className="w-full py-2 bg-indigo-605 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5"
              >
                Iniciar Reflexión <ChevronRight size={14} />
              </button>
            )}
          </div>
        </div>

      </div>

      {/* Statistics and Academic Frame */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Dynamic insights block */}
        <div className="lg:col-span-2 bg-slate-50 p-6 rounded-3xl border border-slate-100 flex flex-col justify-between">
          <div>
            <h3 className="text-lg font-bold text-slate-800 mb-3 flex items-center gap-2">
              <Award className="text-indigo-600" size={18} />
              Diagnóstico y Tendencia de Autoconocimiento
            </h3>
            <p className="text-xs text-gray-500 mb-6 font-medium">
              A continuación se muestra un desglose de los datos registrados de forma local en tu navegador para análisis comparativo.
            </p>

            {results.length > 0 && (
              <div className="mb-6 p-4.5 bg-gradient-to-r from-indigo-50 to-indigo-150/60 border border-indigo-100 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-4 animate-fade-in shadow-sm">
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-indigo-600 text-white rounded-xl">
                    <FileText size={20} />
                  </div>
                  <div className="text-left">
                    <h4 className="font-extrabold text-slate-800 text-sm leading-tight">Expediente Clínico de la Sesión</h4>
                    <p className="text-xs text-slate-500 font-medium mt-1">Descarga o imprime todos tus diagnósticos, bitácoras y recomendaciones en PDF.</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={onOpenReport}
                  className="py-2.5 px-4 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl text-xs transition-colors flex items-center gap-1.5 shadow-sm cursor-pointer shrink-0"
                >
                  <Download size={14} /> Descargar Reporte Completo
                </button>
              </div>
            )}

            {results.length === 0 ? (
              <div className="py-10 text-center text-gray-400 text-sm font-medium">
                <Compass className="mx-auto text-slate-300 hover:rotate-12 transition-transform mb-3" size={40} />
                No has guardado diagnósticos psicométricos en esta sesión aún. <br />
                Realiza el test de Autoestima o Ansiedad para ver el desglose científico.
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {results.map((res) => (
                  <div key={res.id} className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm flex flex-col justify-between">
                    <div>
                      <div className="flex justify-between items-center">
                        <span className="text-[10px] font-mono text-gray-400 font-bold uppercase">{res.testType}</span>
                        <span className="text-[10px] text-gray-400 font-medium">{res.date}</span>
                      </div>
                      <h4 className="text-sm font-bold text-slate-800 mt-2 block">
                        Puntaje: <strong className="text-indigo-600 font-black">{res.score || res.details?.valence}</strong>
                      </h4>
                      <p className="text-xs text-slate-600 mt-1 font-medium leading-relaxed">
                        {res.label || res.details?.valenceLabel}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="mt-8 border-t border-slate-100 pt-4 flex justify-between items-center text-xs text-slate-400">
            <span>Muestreo confidencial activo</span>
            <span>Local Web Storage</span>
          </div>
        </div>

        {/* Psychoeducative Side banner */}
        <div className="bg-gradient-to-tr from-indigo-900 to-indigo-950 text-white rounded-3xl p-6 flex flex-col justify-between relative overflow-hidden">
          <div className="absolute right-0 top-0 opacity-10 p-4 shrink-0 pointer-events-none">
            <Skull size={110} />
          </div>
          
          <div className="space-y-4">
            <span className="text-[10px] font-mono text-indigo-300 font-bold tracking-wider uppercase">SABIDURÍA DE CORTO PLAZO</span>
            <h4 className="text-xl font-bold leading-snug">El "Espejo" Mental</h4>
            <p className="text-xs text-indigo-100/90 leading-relaxed font-mono">
              "Aquel que mira hacia afuera, sueña; aquel que mira hacia adentro, despierta." <br />
              <span className="text-slate-400 block mt-1">— Carl Gustav Jung</span>
            </p>
            <p className="text-xs text-indigo-200 leading-relaxed">
              La mente suele estructurar sesgos inconscientes para filtrar la realidad y ahorrarse tensiones. Reconocerlos mediante terapia cognitiva-conductual es el primer paso hacia la autorregulación.
            </p>
          </div>

          <div className="mt-6 pt-4 border-t border-white/10 flex justify-between items-center text-[10px] font-mono text-indigo-300">
            <span>Psicología Analítica</span>
            <span>CBT / TCC</span>
          </div>
        </div>

      </div>
    </div>
  );
}
