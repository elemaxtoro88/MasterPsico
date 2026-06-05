/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { ArrowLeft, ArrowRight, ShieldCheck, RefreshCw, Zap, TrendingUp, AlertTriangle } from 'lucide-react';
import { CAFEUAnswer } from '../types';

interface AnxietyTestProps {
  onSave: (score: number, category: string, answers: CAFEUAnswer[]) => void;
  initialAnswers?: CAFEUAnswer[];
  onBackToDashboard: () => void;
}

const QUESTIONS = [
  { id: 1, text: "Siento que mi corazón late aceleradamente antes de ingresar a un ambiente de evaluación o examen.", type: "fisiologico" },
  { id: 2, text: "Me preocupa tanto el resultado final que pierdo la concentración en el contenido de las preguntas.", type: "cognitivo" },
  { id: 3, text: "Me tiemblan o sudan las manos con intensidad al recibir las hojas o instrucciones de la evaluación.", type: "fisiologico" },
  { id: 4, text: "Siento tensión física o contracturas en el cuello, hombros o mandíbula cuando estudio bajo presión.", type: "fisiologico" },
  { id: 5, text: "Tengo pensamientos repetitivos de autocrítica o desvalorización respecto a mis propias capacidades cognitivas.", type: "cognitivo" },
  { id: 6, text: "Siento molestias estomacales, náuseas o acidez estomacal persistente al aproximarse un examen crítico.", type: "fisiologico" },
  { id: 7, text: "Mi mente se queda completamente 'en blanco' o experimento bloqueos severos ante preguntas complejas.", type: "cognitivo" },
  { id: 8, text: "Tiendo a postergar sistemáticamente el estudio o evado presentarme a pruebas importantes por ansiedad.", type: "evitacion" },
  { id: 9, text: "Siento dificultades severas para conciliar el sueño por rumiación mental la noche previa a una prueba.", type: "cognitivo" },
  { id: 10, text: "Me siento irritable, impaciente y con baja tolerancia a pequeños obstáculos informativos del día.", type: "cognitivo" },
];

const OPTIONS = [
  { value: 1, text: "Nunca" },
  { value: 2, text: "Casi nunca" },
  { value: 3, text: "A veces" },
  { value: 4, text: "Frecuentemente" },
  { value: 5, text: "Siempre" },
];

export default function AnxietyTest({ onSave, initialAnswers = [], onBackToDashboard }: AnxietyTestProps) {
  const [answers, setAnswers] = useState<CAFEUAnswer[]>(initialAnswers);
  const [currentIndex, setCurrentIndex] = useState(0);

  const currentQuestion = QUESTIONS[currentIndex];
  const currentAnswer = answers.find(a => a.questionId === currentQuestion.id);

  const progressPercent = Math.round((answers.length / QUESTIONS.length) * 100);

  // Score Calculation (10 to 50)
  const calculateScore = () => {
    let total = 0;
    QUESTIONS.forEach(q => {
      const answer = answers.find(a => a.questionId === q.id);
      if (answer) {
        total += answer.score;
      }
    });
    // Scale it or return total. Let's return raw total (10 to 50)
    return total || 10;
  };

  const getCategory = (score: number) => {
    if (score >= 38) return {
      label: "Ansiedad Muy Alta (Bloqueo)",
      color: "text-rose-500 bg-rose-50 border-rose-200",
      alertColor: "bg-rose-500",
      desc: "Estás experimentando una sobreactivación fisiológica y cognitiva intensa. Tu nivel de estrés excede tu umbral, lo que induce fatiga, bloqueo mental ('mente en blanco') y desgaste emocional.",
      zone: "Sobreactivación",
      xMark: 85, // SVG x placement for Yerkes-Dodson marker
      yMark: 80, // SVG y placement for Yerkes-Dodson marker
    };
    if (score >= 24) return {
      label: "Activación Óptima (Enfoque)",
      color: "text-emerald-500 bg-emerald-50 border-emerald-200",
      alertColor: "bg-emerald-500",
      desc: "Posees un nivel saludable de tensión adaptativa. Esta activación actúa como eustrés (estrés positivo) que agudiza la concentración y el rendimiento sin desbordartarte emocionalmente.",
      zone: "Rendimiento Óptimo",
      xMark: 50,
      yMark: 20,
    };
    return {
      label: "Bajo Estrés (Desconexión / Calma)",
      color: "text-amber-500 bg-amber-50 border-amber-200",
      alertColor: "bg-amber-500",
      desc: "Tu nivel de tensión es sumamente bajo. Aunque disfrutas de tranquilidad, en situaciones de exigencia clínica o académica podrías experimentar falta de foco o procrastinación por falta de estímulo adaptativo.",
      zone: "Baja Activación",
      xMark: 15,
      yMark: 80,
    };
  };

  const handleSelectOption = (score: number) => {
    setAnswers(prev => {
      const index = prev.findIndex(a => a.questionId === currentQuestion.id);
      if (index >= 0) {
        const updated = [...prev];
        updated[index] = { ...updated[index], score };
        return updated;
      }
      return [...prev, { questionId: currentQuestion.id, score }];
    });

    if (currentIndex < QUESTIONS.length - 1) {
      setTimeout(() => {
        setCurrentIndex(prev => prev + 1);
      }, 300);
    }
  };

  const activeScore = calculateScore();
  const categoryResult = getCategory(activeScore);
  const isCompleted = answers.length === QUESTIONS.length;

  // Real-time scores for Yerkes-Dodson graph even during testing
  const currentEstScore = answers.length > 0
    ? Math.round((answers.reduce((acc, curr) => acc + curr.score, 0) / answers.length) * QUESTIONS.length)
    : 10;
  const currentCategory = getCategory(currentEstScore);

  return (
    <div className="max-w-5xl mx-auto py-6 animate-fade-in" id="anxiety-test-layout">
      {/* Test Banner Header */}
      <div className="flex items-center justify-between mb-8 pb-4 border-b border-gray-100">
        <button
          onClick={onBackToDashboard}
          className="flex items-center gap-2 text-sm text-gray-500 hover:text-indigo-600 transition-colors"
        >
          <ArrowLeft size={16} /> Volver al Tablero
        </button>
        <div className="flex items-center gap-3">
          <span className="text-xs font-mono bg-violet-50 text-violet-600 px-3 py-1 rounded-full font-bold">
            CUESTIONARIO CAFEU
          </span>
          <span className="text-xs text-gray-400">Ansiedad y Rendimiento Académico</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Main Test Column */}
        <div className="lg:col-span-8 space-y-6">
          {/* Progress Tracker Card */}
          <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
            <div className="flex justify-between items-center mb-3">
              <span className="text-xs font-semibold text-gray-400 tracking-wider">ÍNDICE DE RESPUESTA</span>
              <span className="text-sm font-bold text-violet-600">{answers.length} de {QUESTIONS.length} evaluadas</span>
            </div>
            <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
              <div
                className="bg-gradient-to-r from-violet-500 to-indigo-600 h-full rounded-full transition-all duration-300"
                style={{ width: `${progressPercent}%` }}
              ></div>
            </div>
          </div>

          {!isCompleted ? (
            <div className="bg-white p-8 rounded-2xl border border-gray-100 shadow-sm relative overflow-hidden">
              <div className="absolute top-0 left-0 right-0 h-1.5 bg-violet-500" />
              <div className="space-y-6">
                <div className="flex items-center gap-3 text-sm font-bold text-violet-500 font-mono">
                  <span>PREGUNTA {currentIndex + 1} DE {QUESTIONS.length}</span>
                  <span className="text-[10px] bg-slate-100 text-slate-500 px-2 py-0.5 rounded-full uppercase">
                    Eje: {currentQuestion.type}
                  </span>
                </div>
                <h3 className="text-2xl font-semibold text-gray-800 leading-snug">
                  {currentQuestion.text}
                </h3>

                {/* Likert Scale row (1 to 5) */}
                <div className="grid grid-cols-1 sm:grid-cols-5 gap-3 pt-4">
                  {OPTIONS.map((opt) => {
                    const isSelected = currentAnswer?.score === opt.value;
                    return (
                      <button
                        key={opt.value}
                        onClick={() => handleSelectOption(opt.value)}
                        className={`p-4 rounded-xl border-2 text-center transition-all duration-200 cursor-pointer flex flex-col justify-between h-28 ${isSelected
                          ? 'border-violet-600 bg-violet-50/50 shadow-md shadow-violet-100'
                          : 'border-slate-100 bg-white hover:border-slate-300'
                          }`}
                      >
                        <span className={`text-xs font-bold font-mono py-0.5 rounded-md ${isSelected ? 'text-violet-600 font-bold' : 'text-slate-400'
                          }`}>
                          Grado {opt.value}
                        </span>
                        <span className="text-sm font-bold text-gray-700 leading-tight mt-2">{opt.text}</span>
                      </button>
                    );
                  })}
                </div>

                {/* Bottom Navigation */}
                <div className="flex justify-between items-center pt-8 border-t border-gray-50">
                  <button
                    disabled={currentIndex === 0}
                    onClick={() => setCurrentIndex(prev => prev - 1)}
                    className="flex items-center gap-2 px-4 py-2 border border-gray-200 text-gray-600 rounded-xl hover:bg-gray-50 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    <ArrowLeft size={16} /> Pregunta anterior
                  </button>
                  <button
                    disabled={currentIndex === QUESTIONS.length - 1 || !currentAnswer}
                    onClick={() => {
                      if (currentIndex < QUESTIONS.length - 1) {
                        setCurrentIndex(prev => prev + 1);
                      }
                    }}
                    className="flex items-center gap-2 px-4 py-2 border border-gray-200 text-gray-600 rounded-xl hover:bg-gray-50 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    Siguiente <ArrowRight size={16} />
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-white p-8 rounded-2xl border border-gray-100 shadow-sm space-y-6 relative overflow-hidden">
              <div className="absolute top-0 left-0 right-0 h-1.5 bg-violet-500" />
              <div className="text-center space-y-3 py-4">
                <div className="inline-flex p-4 bg-violet-50 text-violet-500 rounded-full">
                  <Zap size={40} className="fill-violet-100 text-violet-500 animate-pulse" />
                </div>
                <h3 className="text-3xl font-bold text-gray-800">Cuestionario CAFEU Finalizado</h3>
                <p className="text-gray-500 max-w-md mx-auto font-medium">
                  Análisis psicométrico de tu reactividad autónoma frente a situaciones de exigencia cognitiva.
                </p>
              </div>

              {/* Dynamic Score Indicator Widget */}
              <div className="bg-slate-50 grid grid-cols-1 md:grid-cols-2 gap-6 p-6 rounded-2xl border border-gray-100 items-center">
                <div className="space-y-4">
                  <span className="text-xs font-bold text-slate-400 font-mono tracking-wider">RESULTADO CLÍNICO</span>
                  <div>
                    <span className={`inline-block px-3 py-1 rounded-full text-xs font-bold border ${categoryResult.color}`}>
                      {categoryResult.label}
                    </span>
                    <h4 className="text-lg font-bold text-gray-800 mt-2">Detección de Tensiones</h4>
                  </div>
                  <p className="text-gray-600 leading-relaxed text-sm">
                    {categoryResult.desc}
                  </p>
                </div>

                <div className="flex flex-col items-center py-4 bg-white p-6 rounded-xl border border-gray-100">
                  <span className="text-xs font-bold text-slate-400 font-mono tracking-wider mb-2">REACTIVIDAD</span>
                  <div className="text-5xl font-black text-violet-600 mb-1">{activeScore}</div>
                  <span className="text-xs font-bold text-slate-400">de 50 ptos posibles</span>
                  <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden mt-4">
                    <div className="bg-violet-600 h-full" style={{ width: `${((activeScore - 10) / 40) * 100}%` }} />
                  </div>
                  <div className="flex justify-between w-full mt-2 text-[10px] font-mono text-gray-400">
                    <span>Mín: 10</span>
                    <span>Máx: 50</span>
                  </div>
                </div>
              </div>

              {/* Action buttons */}
              <div className="flex flex-col sm:flex-row gap-4 pt-4 border-t border-gray-100">
                <button
                  onClick={() => {
                    setAnswers([]);
                    setCurrentIndex(0);
                  }}
                  className="flex-1 flex items-center justify-center gap-2 py-3 px-6 border border-gray-200 hover:border-gray-300 text-gray-600 rounded-xl font-bold transition-all"
                >
                  <RefreshCw size={16} /> Reiniciar Evaluación
                </button>
                <button
                  onClick={() => onSave(activeScore, categoryResult.label, answers)}
                  className="flex-1 py-3 px-6 bg-gradient-to-r from-violet-600 to-indigo-600 hover:opacity-95 text-white rounded-xl font-bold shadow-lg shadow-violet-100 transition-all flex items-center justify-center gap-2"
                >
                  <ShieldCheck size={18} /> Registrar Diagnóstico
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Yerkes-Dodson Interactive Graph Column */}
        <aside className="lg:col-span-4 space-y-6">
          <div className="bg-white border border-gray-100 shadow-sm rounded-2xl p-6 relative overflow-hidden flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-2 mb-3">
                <TrendingUp className="text-emerald-500" size={20} />
                <h4 className="text-lg font-bold text-gray-800 leading-tight">Ley de Yerkes-Dodson</h4>
              </div>
              <p className="text-xs text-gray-500 leading-relaxed mb-6">
                El rendimiento intelectual óptimo depende de un equilibrio preciso de activación fisiológica.
              </p>

              {/* Dynamic Parabolic Curve SVG */}
              <div className="relative border border-slate-50 p-4 rounded-xl bg-slate-50/50 mb-6">
                <svg viewBox="0 0 100 100" className="w-full h-auto overflow-visible">
                  {/* Axis */}
                  <line x1="10" y1="90" x2="95" y2="90" stroke="#CBD5E1" strokeWidth="1" strokeDasharray="2,2" />
                  <line x1="10" y1="90" x2="10" y2="10" stroke="#CBD5E1" strokeWidth="1" strokeDasharray="2,2" />

                  {/* Yerkes Dodson curve (inverted parabola, peak near x=50, y=20) */}
                  {/* Cubic bezier for smooth inverted-U shape */}
                  <path
                    d="M 15 85 Q 50 15 85 85"
                    fill="none"
                    stroke="#E2E8F0"
                    strokeWidth="4"
                  />

                  {/* Active segment overlay */}
                  <path
                    d="M 15 85 Q 50 15 85 85"
                    fill="none"
                    stroke={
                      currentCategory.zone === "Sobreactivación" ? "#F43F5E" :
                        currentCategory.zone === "Rendimiento Óptimo" ? "#10B981" : "#F59E0B"
                    }
                    strokeWidth="4"
                    strokeDasharray={
                      currentCategory.zone === "Baja Activación" ? "0, 100" :
                        currentCategory.zone === "Rendimiento Óptimo" ? "40, 100" : "100, 100"
                    }
                    className="transition-all duration-700"
                  />

                  {/* Marker Circle representing current user state */}
                  <circle
                    cx={currentCategory.xMark}
                    cy={currentCategory.yMark}
                    r="6"
                    fill={
                      currentCategory.zone === "Sobreactivación" ? "#F43F5E" :
                        currentCategory.zone === "Rendimiento Óptimo" ? "#10B981" : "#F59E0B"
                    }
                    className="transition-all duration-700 shadow animate-pulse"
                  />

                  <text x="12" y="97" className="text-[6px] font-bold fill-slate-400">PASIVO</text>
                  <text x="40" y="8" className="text-[6px] font-black fill-emerald-500 uppercase tracking-wider">ÓPTIMO</text>
                  <text x="75" y="97" className="text-[6px] font-bold fill-slate-400">BLOQUEADO</text>
                </svg>

                <div className="text-center mt-2">
                  <span className="text-xs font-mono font-bold text-slate-400 tracking-wider">ESTADO DETECTADO: </span>
                  <span className={`text-xs font-mono font-bold ${currentCategory.zone === 'Rendimiento Óptimo' ? 'text-emerald-500' :
                    currentCategory.zone === 'Sobreactivación' ? 'text-rose-500' : 'text-amber-500'
                    }`}>
                    {currentCategory.zone}
                  </span>
                </div>
              </div>
            </div>

            <div className="bg-indigo-50 border border-indigo-100 p-4 rounded-xl space-y-2">
              <h5 className="text-xs font-bold text-indigo-700 flex items-center gap-1">
                <AlertTriangle size={14} /> Somatización
              </h5>
              <p className="text-[11px] text-indigo-900 leading-relaxed">
                Niveles elevados constantes inducen secreción excesiva de cortisol afectando memoria episódica a corto plazo. Es vital complementar con el módulo de Diarios Emocionales.
              </p>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
