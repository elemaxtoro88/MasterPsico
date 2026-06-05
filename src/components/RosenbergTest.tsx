/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Heart, ArrowLeft, ArrowRight, ShieldCheck, CornerDownRight, RefreshCw } from 'lucide-react';
import { RosenbergAnswer } from '../types';

interface RosenbergTestProps {
  onSave: (score: number, category: string, answers: RosenbergAnswer[]) => void;
  initialAnswers?: RosenbergAnswer[];
  onBackToDashboard: () => void;
}

const QUESTIONS = [
  { id: 1, text: "Siento que soy una persona digna de aprecio, al menos en igual medida que los demás.", reverse: false },
  { id: 2, text: "Estoy convencido/a de que tengo buenas cualidades.", reverse: false },
  { id: 3, text: "Soy capaz de hacer las cosas tan bien como la mayoría de la gente.", reverse: false },
  { id: 4, text: "Tengo una actitud positiva hacia mí mismo/a.", reverse: false },
  { id: 5, text: "En general, estoy satisfecho/a conmigo mismo/a.", reverse: false },
  { id: 6, text: "Siento que no tengo mucho de lo que estar orgulloso/a.", reverse: true },
  { id: 7, text: "En general, me inclino a pensar que soy un/a fracasado/a.", reverse: true },
  { id: 8, text: "Me gustaría poder sentir más respeto por mí mismo/a.", reverse: true },
  { id: 9, text: "Hay veces en que realmente me siento inútil.", reverse: true },
  { id: 10, text: "A veces pienso que no soy bueno/a para nada.", reverse: true },
];

const OPTIONS = [
  { value: 1, text: "Muy en desacuerdo" },
  { value: 2, text: "En desacuerdo" },
  { value: 3, text: "De acuerdo" },
  { value: 4, text: "Muy de acuerdo" },
];

export default function RosenbergTest({ onSave, initialAnswers = [], onBackToDashboard }: RosenbergTestProps) {
  const [answers, setAnswers] = useState<RosenbergAnswer[]>(initialAnswers);
  const [currentIndex, setCurrentIndex] = useState(0);

  const currentQuestion = QUESTIONS[currentIndex];
  const currentAnswer = answers.find(a => a.questionId === currentQuestion.id);

  const progressPercent = Math.round((answers.length / QUESTIONS.length) * 100);

  // Score Calculation
  const calculateScore = () => {
    let total = 0;
    QUESTIONS.forEach(q => {
      const answer = answers.find(a => a.questionId === q.id);
      if (answer) {
        if (q.reverse) {
          // Reverse scoring: Muy en desacuerdo (1) => 4, Muy de acuerdo (4) => 1
          total += (5 - answer.score);
        } else {
          // Standard scoring: 1 to 4
          total += answer.score;
        }
      }
    });
    return total;
  };

  const getCategory = (score: number) => {
    if (score >= 30) return { label: "Autoestima Elevada", color: "text-emerald-500 bg-emerald-500/10 border-emerald-500/20", desc: "Posees una actitud muy saludable y positiva hacia ti mismo/a. Reconoces tus virtudes y asumes tus imperfecciones con autocompasión." };
    if (score >= 26) return { label: "Autoestima Media", color: "text-blue-500 bg-blue-500/10 border-blue-500/20", desc: "Tienes una valoración de ti mismo/a generalmente equilibrada. Sin embargo, puede haber periodos específicos donde experimentes fluctuaciones e inseguridad." };
    return { label: "Autoestima Baja", color: "text-rose-500 bg-rose-500/10 border-rose-500/20", desc: "La confianza en tus capacidades y tu valor inherente es vulnerable en este momento. Es recomendable trabajar en reestructuración de diálogo interno autocrítico." };
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

    // Auto-advance with mild delay for feedback feel
    if (currentIndex < QUESTIONS.length - 1) {
      setTimeout(() => {
        setCurrentIndex(prev => prev + 1);
      }, 300);
    }
  };

  const activeScore = calculateScore();
  const categoryResult = getCategory(activeScore);
  const isCompleted = answers.length === QUESTIONS.length;

  return (
    <div className="max-w-4xl mx-auto py-6" id="rosenberg-test-layout">
      {/* Test Banner Header */}
      <div className="flex items-center justify-between mb-8 pb-4 border-b border-gray-100">
        <button
          onClick={onBackToDashboard}
          className="flex items-center gap-2 text-sm text-gray-500 hover:text-indigo-600 transition-colors"
        >
          <ArrowLeft size={16} /> Volver al Tablero
        </button>
        <div className="flex items-center gap-3">
          <span className="text-xs font-mono bg-indigo-50 text-indigo-600 px-3 py-1 rounded-full font-bold">
            PSICOMETRÍA ESTÁNDAR
          </span>
          <span className="text-xs text-gray-400">Escala de Rosenberg (RSES)</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Main Test Column */}
        <div className="lg:col-span-8 space-y-6">
          {/* Progress Tracker Card */}
          <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
            <div className="flex justify-between items-center mb-3">
              <span className="text-xs font-semibold text-gray-400 tracking-wider">PROGRESO DEL AUTOANÁLISIS</span>
              <span className="text-sm font-bold text-indigo-600">{answers.length} de {QUESTIONS.length} respondidas ({progressPercent}%)</span>
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
              {/* Question card */}
              <div className="absolute top-0 left-0 right-0 h-1.5 bg-indigo-500" />
              <div className="space-y-6">
                <div className="flex items-center gap-3 text-sm font-bold text-indigo-500 font-mono">
                  <span>PREGUNTA {currentIndex + 1} DE {QUESTIONS.length}</span>
                  {currentQuestion.reverse && (
                    <span className="text-[10px] bg-amber-50 text-amber-600 px-2 py-0.5 rounded-full">
                      Ítem de validación cruzada
                    </span>
                  )}
                </div>
                <h3 className="text-2xl font-semibold text-gray-800 leading-snug">
                  {currentQuestion.text}
                </h3>

                {/* Likert Options Tiles */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4">
                  {OPTIONS.map((opt) => {
                    const isSelected = currentAnswer?.score === opt.value;
                    return (
                      <button
                        key={opt.value}
                        onClick={() => handleSelectOption(opt.value)}
                        className={`p-5 rounded-2xl border-2 text-left transition-all duration-200 cursor-pointer flex flex-col justify-between ${isSelected
                          ? 'border-indigo-600 bg-indigo-50/50 shadow-md shadow-indigo-100'
                          : 'border-slate-100 bg-white hover:border-slate-300'
                          }`}
                      >
                        <span className={`text-xs font-bold font-mono px-2 py-0.5 rounded-md ${isSelected ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-500'
                          }`}>
                          Nivel de Acuerdo: {opt.value}
                        </span>
                        <span className="text-base font-medium text-gray-700 mt-3">{opt.text}</span>
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
              <div className="absolute top-0 left-0 right-0 h-1.5 bg-emerald-500" />
              <div className="text-center space-y-3 py-4">
                <div className="inline-flex p-4 bg-emerald-50 text-emerald-500 rounded-full">
                  <Heart size={40} className="fill-emerald-500" />
                </div>
                <h3 className="text-3xl font-bold text-gray-800">¡Evaluación Completada!</h3>
                <p className="text-gray-500 max-w-md mx-auto">
                  Has respondido todos los 10 ítems de la escala psicométrica de autoestima global.
                </p>
              </div>

              {/* Dynamic Score Indicator Widget */}
              <div className="bg-slate-50 grid grid-cols-1 md:grid-cols-2 gap-6 p-6 rounded-2xl border border-gray-100 items-center">
                <div className="flex flex-col items-center py-4">
                  <span className="text-xs font-bold text-slate-400 font-mono tracking-wider mb-2">PUNTAJE ROSENBERG</span>
                  <div className="relative w-36 h-36">
                    <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                      <path className="stroke-slate-200" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" strokeWidth="4"></path>
                      <path className="stroke-emerald-500 transition-all duration-1000" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" strokeDasharray={`${((activeScore - 10) / 30) * 100}, 100`} strokeLinecap="round" strokeWidth="4"></path>
                    </svg>
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                      <span className="text-4xl font-black text-slate-800">{activeScore}</span>
                      <span className="text-xs font-bold text-slate-400">/ 40 ptos</span>
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  <span className={`inline-block px-3 py-1 rounded-full text-xs font-bold border ${categoryResult.color}`}>
                    {categoryResult.label}
                  </span>
                  <p className="text-gray-700 leading-relaxed font-medium">
                    {categoryResult.desc}
                  </p>
                  <div className="flex items-center gap-1.5 text-xs text-slate-400">
                    <CornerDownRight size={14} />
                    <span>Margen estandarizado (10-40)</span>
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
                  className="flex-1 py-3 px-6 bg-gradient-to-r from-indigo-600 to-violet-600 hover:opacity-95 text-white rounded-xl font-bold shadow-lg shadow-indigo-100 transition-all flex items-center justify-center gap-2"
                >
                  <ShieldCheck size={18} /> Guardar Diagnóstico
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Right Info Column */}
        <aside className="lg:col-span-4 space-y-6">
          <div className="bg-white border border-gray-100 shadow-sm rounded-2xl p-6 relative overflow-hidden">
            <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none">
              <ShieldCheck size={100} className="text-indigo-600" />
            </div>
            <h4 className="text-lg font-bold text-gray-800 mb-3 flex items-center gap-2">
              <ShieldCheck className="text-indigo-600 shrink-0" size={18} />
              Validez Científica
            </h4>
            <p className="text-sm text-gray-500 leading-relaxed space-y-4">
              La <strong>Escala de Autoestima de Rosenberg</strong> (1965) es el instrumento psicométrico más utilizado a nivel global en estudios de autoconcepto y bienestar psicológico, respaldado por la APA.
            </p>
            <div className="mt-4 bg-slate-50 p-4 rounded-xl space-y-2 border border-slate-100">
              <div className="flex justify-between text-xs text-gray-600">
                <span>Consistencia interna</span>
                <span className="font-bold">α = 0.88</span>
              </div>
              <div className="flex justify-between text-xs text-gray-600">
                <span>Fiabilidad test-retest</span>
                <span className="font-bold">r = 0.85</span>
              </div>
            </div>
          </div>

          <div className="bg-slate-900 text-slate-100 p-6 rounded-2xl border border-slate-800 shadow-xl space-y-4">
            <p className="text-xs font-mono text-purple-400 font-bold tracking-widest uppercase">
              RECOMENDACIONES DE USO
            </p>
            <h5 className="font-bold text-lg">Introspección Consciente</h5>
            <p className="text-sm text-slate-400 leading-relaxed">
              No hay respuestas correctas o incorrectas. Intenta responder de la manera más sincera posible describiendo lo que sientes en tu día a día, no lo que crees que "deberías" sentir.
            </p>
          </div>
        </aside>
      </div>
    </div>
  );
}
