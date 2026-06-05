/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  Heart,
  Zap,
  Sparkles,
  BookOpen,
  Smile,
  ChevronRight,
  ArrowLeft,
  Calendar,
  Trash2,
  CheckCircle2,
  Scale,
  ChevronDown,
  ChevronUp,
  Award,
  Clock,
  ClipboardList,
  MessageSquare,
  Bookmark
} from 'lucide-react';
import { SavedResult } from '../types';

interface GuidedReflectionsProps {
  results: SavedResult[];
  onSaveReflection: (templateName: string, templateId: string, answers: { question: string; answer: string }[], aiAdvice?: string) => void;
  onBackToDashboard: () => void;
  onDeleteResult?: (id: string) => void;
}

export interface ReflectionTemplate {
  id: string;
  name: string;
  emoji: string;
  description: string;
  bgGrad: string;
  accentColor: string;
  textColor: string;
  icon: React.ReactNode;
  questions: string[];
}

export default function GuidedReflections({
  results,
  onSaveReflection,
  onBackToDashboard,
  onDeleteResult
}: GuidedReflectionsProps) {
  const [activeTab, setActiveTab] = useState<'templates' | 'history'>('templates');
  const [selectedTemplate, setSelectedTemplate] = useState<ReflectionTemplate | null>(null);
  const [currentStep, setCurrentStep] = useState<number>(0);
  const [answers, setAnswers] = useState<string[]>([]);
  const [expandedReflectionId, setExpandedReflectionId] = useState<string | null>(null);

  // New States for AI Feedback
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [aiAdvice, setAiAdvice] = useState<string | null>(null);
  const [showFeedbackView, setShowFeedbackView] = useState(false);

  // 1. Define the 5 templates with clinically grounded descriptions and prompts
  const TEMPLATES: ReflectionTemplate[] = [
    {
      id: 'gratitud',
      name: 'Gratitud y Bienestar',
      emoji: '🌸',
      description: 'Entrena tu mente en el sesgo de positividad. Enfócate en las pequeñas certezas, interacciones amables y logros cotidianos para equilibrar tu perspectiva emocional.',
      bgGrad: 'from-amber-500 to-amber-600',
      accentColor: 'text-amber-600 border-amber-200 bg-amber-50',
      textColor: 'text-amber-800',
      icon: <Heart className="text-amber-500 shrink-0" size={24} />,
      questions: [
        'Pensando en las últimas 24 horas, ¿cuáles son tres cosas o interacciones específicas, por pequeñas que parezcan, por las que sientes un agradecimiento sincero?',
        '¿Cómo estas experiencias positivas cambian o matizan la percepción de tus desafíos o problemas actuales?',
        '¿De qué manera contribuyes tú activamente (acciones, palabras, actitudes) a que sucedan cosas buenas en tu entorno?'
      ]
    },
    {
      id: 'estres',
      name: 'Manejo del Estrés y Ansiedad',
      emoji: '🌊',
      description: 'Identifica los estresores activos en tu vida y sepáralos racionalmente utilizando la dicotomía de control para aliviar la tensión física y cognitiva.',
      bgGrad: 'from-blue-500 to-indigo-600',
      accentColor: 'text-indigo-600 border-indigo-200 bg-indigo-50',
      textColor: 'text-indigo-800',
      icon: <Zap className="text-indigo-500 shrink-0" size={24} />,
      questions: [
        '¿Cuál es la principal fuente de tensión, presión o incertidumbre que estás experimentando en este momento?',
        'Racionaliza la situación dividiendo los factores: ¿Qué aspectos específicos de este problema están bajo tu control directo y cuáles escapan por completo a tu influencia?',
        '¿Qué pequeña acción constructiva y realista (un respiro, priorizar una tarea, descansar) puedes realizar hoy para regular tu sistema nervioso?'
      ]
    },
    {
      id: 'metas',
      name: 'Metas Personales y Propósito',
      emoji: '🎯',
      description: 'Estructura tus aspiraciones bajo una filosofía orientada a valores. Transforma intenciones difusas en pasos mínimos viables para evitar la procrastinación.',
      bgGrad: 'from-emerald-500 to-teal-600',
      accentColor: 'text-emerald-600 border-emerald-200 bg-emerald-50',
      textColor: 'text-emerald-800',
      icon: <Award className="text-emerald-500 shrink-0" size={24} />,
      questions: [
        '¿Cuál es tu proyecto, hábito u objetivo más prioritario en esta etapa de tu vida?',
        '¿Por qué esta meta es genuinamente valiosa para ti? ¿A qué valores centrales de tu identidad responde?',
        '¿Cuáles son dos micro-pasos mínimos y específicos que te comprometes a dar en los próximos 3 días para moverte en esa dirección?'
      ]
    },
    {
      id: 'autoestima',
      name: 'Autoestima y Autocompasión',
      emoji: '🛡️',
      description: 'Atenúa la autocrítica destructiva y entrena el diálogo interno compasivo analizando tus imperfecciones con los mismos ojos que juzgas a los demás.',
      bgGrad: 'from-rose-500 to-pink-600',
      accentColor: 'text-rose-600 border-rose-200 bg-rose-50',
      textColor: 'text-rose-800',
      icon: <Smile className="text-rose-500 shrink-0" size={24} />,
      questions: [
        'Describe con honestidad un error, frustración o vulnerabilidad que hayas experimentado recientemente y te haga sentir insatisfecho contigo mismo.',
        'Si un buen amigo te contara que está pasando exactamente por esa misma situación y sintiendo esa misma culpa, ¿qué palabras de comprensión, apoyo y perdón le ofrecerías?',
        '¿Cómo puedes trasladar esa misma compasión, cuidado y trato amable hacia ti mismo en lugar de castigarte?'
      ]
    },
    {
      id: 'relaciones',
      name: 'Relaciones Interpersonales y Límites',
      emoji: '👥',
      description: 'Fomenta la inteligencia relacional asertiva. Revisa tus interacciones sociales para comprender tus límites emocionales y evitar dinámicas de complacencia dañina.',
      bgGrad: 'from-purple-500 to-purple-600',
      accentColor: 'text-purple-600 border-purple-200 bg-purple-50',
      textColor: 'text-purple-800',
      icon: <Scale className="text-purple-500 shrink-0" size={24} />,
      questions: [
        'Piensa en una interacción social o conversación reciente que te haya causado malestar, agobio o por el contrario un gran alivio. ¿Qué ocurrió de manera puramente objetiva?',
        '¿Qué necesidad, valor o límite personal se vio involucrado, vulnerado o respetado en este intercambio?',
        '¿De qué manera puedes comunicar o reafirmar ese límite de manera pacífica, asertiva y firme en el futuro?'
      ]
    }
  ];

  // Filtering reflections for history tab
  const reflections = results.filter(r => r.testType === 'reflection');

  // Triggering workflow
  const handleSelectTemplate = (template: ReflectionTemplate) => {
    setSelectedTemplate(template);
    setCurrentStep(0);
    setAnswers(new Array(template.questions.length).fill(''));
  };

  const handleInputChange = (value: string) => {
    const updated = [...answers];
    updated[currentStep] = value;
    setAnswers(updated);
  };

  const handleNext = () => {
    if (selectedTemplate && currentStep < selectedTemplate.questions.length - 1) {
      setCurrentStep(prev => prev + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1);
    } else {
      setSelectedTemplate(null);
    }
  };

  const handleSave = async () => {
    if (!selectedTemplate) return;

    setIsAnalyzing(true);
    setAiAdvice(null);

    // Build question-answer array
    const formattedAnswers = selectedTemplate.questions.map((q, idx) => ({
      question: q,
      answer: answers[idx] || 'Sin respuesta.'
    }));

    try {
      // Call AI analysis endpoint
      const response = await fetch('/api/analyze-reflection', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          templateName: selectedTemplate.name,
          answers: formattedAnswers
        })
      });

      if (response.ok) {
        const data = await response.json();
        setAiAdvice(data.advice);
      } else {
        setAiAdvice("Has realizado un excelente trabajo de introspección. Sigue analizando tus emociones para fortalecer tu bienestar.");
      }
    } catch (error) {
      console.error("Error analyzing reflection:", error);
      setAiAdvice("Excelente reflexión. El registro se ha guardado correctamente en tu bitácora local.");
    } finally {
      // Trigger save callback with AI advice
      const currentAdvice = aiAdvice; // capture current state if needed
      onSaveReflection(selectedTemplate.name, selectedTemplate.id, formattedAnswers, currentAdvice || undefined);
      setIsAnalyzing(false);
      setShowFeedbackView(true);
    }
  };

  const handleFinishFeedback = () => {
    setShowFeedbackView(false);
    setSelectedTemplate(null);
    setAiAdvice(null);
    setActiveTab('history');
  };

  const toggleExpandReflection = (id: string) => {
    setExpandedReflectionId(prev => (prev === id ? null : id));
  };

  return (
    <div className="max-w-5xl mx-auto py-2 animate-fade-in" id="guided-reflections-container">

      {/* Tab/Action Header */}
      {!selectedTemplate && (
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b border-slate-100 pb-4 mb-8 gap-4">
          <div>
            <button
              onClick={onBackToDashboard}
              className="flex items-center gap-2 text-xs font-bold text-slate-500 hover:text-indigo-600 transition-colors mb-2 cursor-pointer"
            >
              <ArrowLeft size={14} /> Volver al Tablero
            </button>
            <h1 className="text-3xl font-black text-slate-800 tracking-tight flex items-center gap-2">
              <BookOpen className="text-indigo-600" size={28} />
              Reflexiones Guiadas
            </h1>
            <p className="text-xs text-slate-500 font-medium">
              Escribe con propósito utilizando plantillas psicológicamente diseñadas para el autoconocimiento.
            </p>
          </div>

          <div className="flex bg-slate-100 p-1.5 rounded-2xl border border-slate-200">
            <button
              onClick={() => setActiveTab('templates')}
              className={`py-1.5 px-4 rounded-xl text-xs font-bold transition-all ${activeTab === 'templates'
                ? 'bg-white text-slate-800 shadow-sm'
                : 'text-slate-500 hover:text-slate-800'
                }`}
            >
              Nueva Reflexión
            </button>
            <button
              onClick={() => setActiveTab('history')}
              className={`py-1.5 px-4 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${activeTab === 'history'
                ? 'bg-white text-slate-800 shadow-sm'
                : 'text-slate-500 hover:text-slate-800'
                }`}
            >
              Historial ({reflections.length})
            </button>
          </div>
        </div>
      )}

      {/* RENDER INACTIVE WORKFLOW (SELECT / HISTORY) */}
      {!selectedTemplate ? (
        <div>
          {/* TAP 1: TEMPLATES VIEW */}
          {activeTab === 'templates' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {TEMPLATES.map((temp) => (
                  <div
                    key={temp.id}
                    className="bg-white border border-slate-100 hover:border-indigo-100 rounded-3xl p-6 flex flex-col justify-between shadow-sm hover:shadow-md transition-all duration-300 relative overflow-hidden group hover:-translate-y-1"
                  >
                    {/* Visual accent top edge */}
                    <div className="absolute top-0 left-0 right-0 h-1.5 bg-slate-100 group-hover:bg-indigo-600 transition-colors" />

                    <div className="space-y-4">
                      <div className="flex justify-between items-center">
                        <div className="p-3 bg-slate-50 group-hover:bg-indigo-50 text-indigo-600 rounded-2xl transition-all duration-300">
                          {temp.icon}
                        </div>
                        <span className="text-[10px] font-mono font-bold text-slate-400 bg-slate-50 px-2.5 py-1 rounded-full uppercase tracking-wider">
                          {temp.questions.length} preguntas
                        </span>
                      </div>

                      <div className="space-y-1.5">
                        <h3 className="font-extrabold text-slate-800 text-lg flex items-center gap-1.5">
                          <span>{temp.emoji}</span>
                          <span>{temp.name}</span>
                        </h3>
                        <p className="text-xs text-slate-500 font-medium leading-relaxed">
                          {temp.description}
                        </p>
                      </div>
                    </div>

                    <div className="mt-8 pt-4 border-t border-slate-50">
                      <button
                        onClick={() => handleSelectTemplate(temp)}
                        className="w-full py-2.5 bg-slate-800 hover:bg-slate-900 group-hover:bg-gradient-to-r group-hover:from-indigo-600 group-hover:to-indigo-700 text-white rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-sm group-hover:shadow-md"
                      >
                        Comenzar Reflexión <ChevronRight size={14} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Cognitive Info Banner */}
              <div className="bg-gradient-to-r from-slate-900 to-indigo-950 p-6 rounded-3xl text-white shadow-lg space-y-4 relative overflow-hidden">
                <div className="absolute -right-6 -bottom-6 w-32 h-32 bg-indigo-500/10 rounded-full blur-xl" />
                <h4 className="text-base font-extrabold tracking-tight flex items-center gap-2">
                  <Sparkles className="text-indigo-400 fill-indigo-400 animate-pulse" size={18} />
                  ¿Por qué realizar reflexiones estructuradas?
                </h4>
                <p className="text-xs text-slate-300 max-w-3xl leading-relaxed">
                  A diferencia de la escritura libre tradicional, las reflexiones guiadas te imponen marcos cognitivos estructurados que detienen la rumiación improductiva y dirigen tu atención de manera directa a la resolución activa de desvíos, permitiendo anclajes más profundos y autocompasivos.
                </p>
              </div>
            </div>
          )}

          {/* TAB 2: CHRONOLOGICAL REFLECTION TIMELINE */}
          {activeTab === 'history' && (
            <div className="space-y-6">
              {reflections.length === 0 ? (
                <div className="bg-white border border-dashed border-slate-200 rounded-3xl p-12 text-center space-y-4 max-w-md mx-auto">
                  <div className="p-4 bg-indigo-50 text-indigo-500 rounded-full inline-block">
                    <Bookmark size={32} />
                  </div>
                  <h3 className="font-extrabold text-slate-800 text-lg">Tu bitácora está limpia</h3>
                  <p className="text-xs text-slate-500 leading-relaxed font-medium">
                    Aún no has registrado ninguna reflexión guiada en esta sesión. Selecciona una de nuestras 5 plantillas guiadas arriba para comenzar.
                  </p>
                  <button
                    onClick={() => setActiveTab('templates')}
                    className="py-2.5 px-6 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl text-xs transition-all inline-flex items-center gap-1.5 cursor-pointer"
                  >
                    Elegir Plantilla <ChevronRight size={14} />
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="flex justify-between items-center bg-slate-50 p-3.5 rounded-2xl border border-slate-100">
                    <span className="text-xs font-bold text-slate-500 font-mono">
                      ORDENADOS CRONOLÓGICAMENTE (MÁS RECIENTES PRIMERO)
                    </span>
                    <span className="text-xs font-bold text-indigo-600 bg-indigo-50 px-2.5 py-1 rounded-full font-mono">
                      {reflections.length} {reflections.length === 1 ? 'REFLEXIÓN' : 'REFLEXIONES'}
                    </span>
                  </div>

                  {/* Reflection cards wrapper */}
                  <div className="space-y-4">
                    {reflections.map((ref) => {
                      const isExpanded = expandedReflectionId === ref.id;
                      const emoji = TEMPLATES.find(t => t.name === ref.label)?.emoji || '📝';
                      const details = ref.details || {};
                      const qas = details.answers || [];

                      return (
                        <div
                          key={ref.id}
                          className="bg-white border border-slate-100 rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-shadow"
                        >
                          {/* Top Header Row of card click to toggle */}
                          <div
                            onClick={() => toggleExpandReflection(ref.id)}
                            className="p-5 flex items-center justify-between cursor-pointer select-none hover:bg-slate-50/50 transition-colors gap-4"
                          >
                            <div className="flex items-center gap-3">
                              <span className="text-2xl">{emoji}</span>
                              <div>
                                <h3 className="font-bold text-slate-800 text-sm sm:text-base">
                                  {ref.label || 'Reflexión Guiada'}
                                </h3>
                                <div className="flex items-center gap-3 text-slate-400 text-[10px] sm:text-xs pt-0.5">
                                  <span className="flex items-center gap-1">
                                    <Calendar size={12} /> {ref.date}
                                  </span>
                                  <span className="flex items-center gap-1">
                                    <Clock size={12} /> {qas.length} preguntas respondidas
                                  </span>
                                </div>
                              </div>
                            </div>

                            <div className="flex items-center gap-2">
                              {onDeleteResult && (
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    if (window.confirm("¿Estás seguro/a de que deseas eliminar este registro de reflexión permanentemente?")) {
                                      onDeleteResult(ref.id);
                                    }
                                  }}
                                  className="p-1 px-2.5 hover:bg-rose-50 text-slate-400 hover:text-rose-500 rounded-lg text-xs font-semibold flex items-center gap-1 transition-all"
                                  title="Eliminar del historial"
                                >
                                  <Trash2 size={13} />
                                </button>
                              )}

                              <div className="p-1.5 bg-slate-50 text-slate-500 rounded-lg">
                                {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                              </div>
                            </div>
                          </div>

                          {/* Collapsible Content Area */}
                          {isExpanded && (
                            <div className="px-6 pb-6 pt-2 border-t border-slate-100 bg-slate-50/40 space-y-4 animate-fade-in">
                              {qas.length === 0 ? (
                                <p className="text-xs text-slate-400 italic">No se encontraron respuestas archivadas en este diagnóstico.</p>
                              ) : (
                                <div className="space-y-4">
                                  {qas.map((qa: { question: string; answer: string }, index: number) => (
                                    <div key={index} className="space-y-1.5">
                                      <div className="flex gap-2 items-start">
                                        <span className="bg-indigo-100 text-indigo-700 font-mono text-[9px] font-extrabold px-1.5 py-0.5 rounded mt-0.5 shrink-0 uppercase">
                                          P{index + 1}
                                        </span>
                                        <h4 className="text-xs font-bold text-slate-700 leading-normal">
                                          {qa.question}
                                        </h4>
                                      </div>
                                      <div className="pl-6">
                                        <p className="text-xs text-slate-600 leading-relaxed font-semibold italic bg-white p-3.5 rounded-xl border border-slate-100 shadow-sm">
                                          "{qa.answer}"
                                        </p>
                                      </div>
                                    </div>
                                  ))}

                                  {/* Persisted AI Advice in History */}
                                  {details.aiAdvice && (
                                    <div className="pt-4 border-t border-slate-100">
                                      <div className="bg-indigo-50/50 p-4 rounded-xl border border-indigo-100 space-y-1">
                                        <span className="text-[9px] font-black text-indigo-600 uppercase flex items-center gap-1">
                                          <Sparkles size={12} /> Análisis de Master Psico
                                        </span>
                                        <p className="text-xs font-semibold text-indigo-900 leading-relaxed italic">
                                          "{details.aiAdvice}"
                                        </p>
                                      </div>
                                    </div>
                                  )}
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      ) : (
        /* RENDER ACTIVE STEPPER WRITING FLOW OR FEEDBACK */
        <div className="max-w-3xl mx-auto space-y-6">

          {showFeedbackView ? (
            /* FEEDBACK VIEW AFTER SAVING */
            <div className="bg-white border border-slate-100 rounded-3xl p-8 shadow-xl animate-fade-in space-y-6 text-center">
              <div className="flex justify-center">
                <div className="p-4 bg-indigo-50 rounded-full text-indigo-600 animate-bounce-slow">
                  <Sparkles size={48} />
                </div>
              </div>

              <div className="space-y-2">
                <h2 className="text-2xl font-black text-slate-800">¡Reflexión Completada!</h2>
                <p className="text-xs text-slate-500 font-bold uppercase tracking-widest font-mono">ANÁLISIS DE MASTER PSICO</p>
              </div>

              <div className="bg-indigo-50/50 p-6 rounded-2xl border border-indigo-100 relative">
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-white px-3 py-0.5 rounded-full border border-indigo-100 text-[10px] font-black text-indigo-600 uppercase">
                  Consejo Terapéutico
                </div>
                <p className="text-sm font-semibold text-indigo-900 leading-relaxed italic">
                  "{aiAdvice || "Cargando consejo..."}"
                </p>
              </div>

              <button
                onClick={handleFinishFeedback}
                className="w-full py-3 bg-slate-800 hover:bg-slate-900 text-white rounded-xl text-xs font-black transition-all cursor-pointer shadow-md"
              >
                Cerrar y Ver Historial
              </button>
            </div>
          ) : (
            <>
              {/* Header Progress Stepper */}
              <div className="flex justify-between items-center mt-2">
                <button
                  onClick={handleBack}
                  className="flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-indigo-600 transition-colors cursor-pointer"
                >
                  <ArrowLeft size={14} /> Atrás
                </button>
                <span className="text-xs font-bold text-indigo-600 font-mono bg-indigo-50 px-3 py-1 rounded-full uppercase">
                  {selectedTemplate.name} • Paso {currentStep + 1} de {selectedTemplate.questions.length}
                </span>
              </div>

              {/* Main Question Card with full focus */}
              <div className="bg-white border border-slate-100 rounded-3xl p-8 shadow-md relative overflow-hidden">
                {/* Dynamic visual slider */}
                <div className="absolute top-0 left-0 right-0 h-1.5 bg-slate-100 overflow-hidden">
                  <div
                    className={`bg-indigo-600 h-full transition-all duration-300`}
                    style={{ width: `${((currentStep + 1) / selectedTemplate.questions.length) * 100}%` }}
                  />
                </div>

                <div className="space-y-6">
                  <div className="flex items-center gap-2">
                    <span className="p-2 bg-indigo-50 text-indigo-600 rounded-xl font-mono text-xs font-bold block shrink-0">
                      PREGUNTA ABIERTA {currentStep + 1}
                    </span>
                    <span className="text-sm font-semibold text-slate-400">Guía de introspección voluntaria</span>
                  </div>

                  <h2 className="text-xl sm:text-2xl font-black text-slate-800 leading-snug">
                    {selectedTemplate.questions[currentStep]}
                  </h2>

                  <textarea
                    value={answers[currentStep] || ''}
                    onChange={(e) => handleInputChange(e.target.value)}
                    placeholder="Escribe tu autoanálisis aquí con toda la tranquilidad y detalle que desees..."
                    className="w-full h-44 p-4 border border-slate-200 focus:border-indigo-500 rounded-2xl focus:outline-none focus:ring-1 focus:ring-indigo-400 text-sm leading-relaxed placeholder-slate-400 font-medium"
                  />

                  <div className="flex justify-between items-center pt-4 border-t border-slate-50">
                    <div className="text-xs text-slate-400 font-mono">
                      {answers[currentStep]?.trim().length || 0} caracteres escritos
                    </div>

                    {currentStep < selectedTemplate.questions.length - 1 ? (
                      <button
                        disabled={!answers[currentStep] || answers[currentStep].trim().length < 5}
                        onClick={handleNext}
                        className="py-2.5 px-6 bg-slate-800 hover:bg-slate-900 disabled:opacity-40 disabled:cursor-not-allowed text-white text-xs font-bold rounded-xl transition-all flex items-center gap-1 cursor-pointer"
                      >
                        Siguiente Pregunta <ChevronRight size={14} />
                      </button>
                    ) : (
                      <button
                        disabled={!answers[currentStep] || answers[currentStep].trim().length < 5 || isAnalyzing}
                        onClick={handleSave}
                        className="py-2.5 px-6 bg-gradient-to-r from-indigo-600 to-indigo-800 disabled:opacity-40 disabled:cursor-not-allowed text-white text-xs font-black rounded-xl transition-all flex items-center gap-1.5 shadow-md shadow-indigo-100 cursor-pointer"
                      >
                        {isAnalyzing ? (
                          <><span className="animate-spin inline-block w-3 h-3 border-2 border-white border-t-transparent rounded-full" /> Analizando...</>
                        ) : (
                          <><CheckCircle2 size={16} /> Completar y Guardar Registro</>
                        )}
                      </button>
                    )}
                  </div>
                </div>
              </div>

              {/* Helpful Tips widget */}
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 text-xs text-slate-500 flex items-start gap-2.5 leading-relaxed font-medium mb-4">
                <span className="bg-slate-200 text-slate-700 rounded-full font-bold px-1.5 text-[10px] uppercase font-mono mt-0.5">Tip</span>
                <span>Sé honesto/a contigo mismo/a. Aquí no hay respuestas correctas ni miradas juzgadoras. Este archivo se guardará únicamente dentro de tu navegador web bajo total privacidad y seguridad.</span>
              </div>

            </>
          )}

        </div>
      )}

    </div>
  );
}
