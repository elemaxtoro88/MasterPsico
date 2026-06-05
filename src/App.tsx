/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Brain, Heart, Zap, Sparkles, BookOpen, UserCheck, ShieldClose, Compass, LogOut, Download } from 'lucide-react';
import { SavedResult, RosenbergAnswer, CAFEUAnswer, JournalAnalysis } from './types';
import EthicalConsent from './components/EthicalConsent';
import Dashboard from './components/Dashboard';
import RosenbergTest from './components/RosenbergTest';
import AnxietyTest from './components/AnxietyTest';
import EmotionalMasks from './components/EmotionalMasks';
import EmpathyMirror from './components/EmpathyMirror';
import GuidedReflections from './components/GuidedReflections';
import ReportViewer from './components/ReportViewer';

export default function App() {
  const [hasConsented, setHasConsented] = useState<boolean>(false);

  const [userName, setUserName] = useState<string>('');

  const [activeSection, setActiveSection] = useState<'dashboard' | 'rosenberg' | 'cafeu' | 'masks' | 'journal' | 'reflections'>('dashboard');
  const [isReportOpen, setIsReportOpen] = useState(false);

  const [savedResults, setSavedResults] = useState<SavedResult[]>([]);

  const handleAcceptTerms = () => {
    setHasConsented(true);
  };

  const handleSaveRosenberg = (score: number, label: string, answers: RosenbergAnswer[]) => {
    const newResult: SavedResult = {
      id: `rosenberg-${Date.now()}`,
      date: new Date().toLocaleDateString('es-ES', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' }),
      testType: 'rosenberg',
      score,
      label,
      details: answers,
    };
    // Keep only the latest Rosenberg test to update dashboard statistics
    setSavedResults(prev => [newResult, ...prev.filter(r => r.testType !== 'rosenberg')]);
    setActiveSection('dashboard');
  };

  const handleSaveCAFEU = (score: number, label: string, answers: CAFEUAnswer[]) => {
    const newResult: SavedResult = {
      id: `cafeu-${Date.now()}`,
      date: new Date().toLocaleDateString('es-ES', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' }),
      testType: 'cafeu',
      score,
      label,
      details: answers,
    };
    // Keep only the latest CAFEU test to update dashboard statistics
    setSavedResults(prev => [newResult, ...prev.filter(r => r.testType !== 'cafeu')]);
    setActiveSection('dashboard');
  };

  const handleSaveJournal = (analysis: JournalAnalysis, rawText: string) => {
    const newResult: SavedResult = {
      id: `journal-${Date.now()}`,
      date: new Date().toLocaleDateString('es-ES', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' }),
      testType: 'journal',
      label: analysis.valenceLabel,
      details: {
        rawText,
        analysis,
        valence: analysis.valence,
        valenceLabel: analysis.valenceLabel,
        textLength: rawText.length,
      },
    };
    setSavedResults(prev => [newResult, ...prev]);
  };

  const handleSaveMaskReflection = (mechanism: string, text: string, aiInsight?: string, aiAdvice?: string) => {
    const newResult: SavedResult = {
      id: `mask_reflection-${Date.now()}`,
      date: new Date().toLocaleDateString('es-ES', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' }),
      testType: 'mask_reflection',
      label: mechanism,
      details: {
        text,
        aiInsight,
        aiAdvice,
      },
    };
    setSavedResults(prev => [newResult, ...prev]);
  };

  const handleSaveReflection = (templateName: string, templateId: string, answers: { question: string; answer: string }[], aiAdvice?: string) => {
    const newResult: SavedResult = {
      id: `reflection-${Date.now()}`,
      date: new Date().toLocaleDateString('es-ES', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' }),
      testType: 'reflection',
      label: templateName,
      details: {
        templateId,
        answers,
        aiAdvice,
      },
    };
    setSavedResults(prev => [newResult, ...prev]);
  };

  const handleDeleteResult = (id: string) => {
    setSavedResults(prev => prev.filter(r => r.id !== id));
  };

  const handleResetSession = () => {
    if (window.confirm("¿Estás seguro/a de que deseas borrar tus diagnósticos psicométricos locales de esta sesión?")) {
      setSavedResults([]);
      setUserName('');
      sessionStorage.removeItem('mp_results');
      localStorage.removeItem('mp_username');
    }
  };

  const handleRevokeConsent = () => {
    if (window.confirm("¿Seguro/a que deseas revocar tu consentimiento ético y regresar a la pantalla de bienvenida? Se mantendrán tus registros locales.")) {
      setHasConsented(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-between" id="master-psico-app">

      {/* Top Professional Header Navigation */}
      <header className="bg-white border-b border-gray-100 sticky top-0 z-50 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-18 flex items-center justify-between">
          <div className="flex items-center gap-3 cursor-pointer shrink-0" onClick={() => hasConsented && setActiveSection('dashboard')}>
            <div className="p-2 bg-gradient-to-tr from-indigo-600 to-indigo-800 text-white rounded-xl shrink-0">
              <Brain size={20} className="animate-pulse" />
            </div>
            <div className="hidden sm:block">
              <span className="text-lg font-black tracking-tight text-slate-800 whitespace-nowrap">Master Psico</span>
              <span className="text-[10px] font-bold text-indigo-600 uppercase block font-mono -mt-1 tracking-wider whitespace-nowrap">Autoanálisis Inteligente</span>
            </div>
            <div className="sm:hidden">
              <span className="text-base font-black tracking-tight text-slate-800 whitespace-nowrap">Master Psico</span>
            </div>
          </div>

          {hasConsented && (
            <div className="flex items-center gap-2 sm:gap-4">
              <button
                onClick={() => setActiveSection('dashboard')}
                className={`py-1.5 px-3 rounded-lg text-xs font-bold transition-all ${activeSection === 'dashboard'
                  ? 'bg-indigo-50 text-indigo-600'
                  : 'text-gray-500 hover:bg-slate-50'
                  }`}
              >
                Mi Tablero
              </button>
              <button
                onClick={() => setActiveSection('masks')}
                className={`py-1.5 px-3 rounded-lg text-xs font-bold transition-all ${activeSection === 'masks'
                  ? 'bg-slate-800 text-white'
                  : 'text-gray-500 hover:bg-slate-50'
                  }`}
              >
                Máscaras
              </button>
              <button
                onClick={() => setActiveSection('reflections')}
                className={`py-1.5 px-3 rounded-lg text-xs font-bold transition-all ${activeSection === 'reflections'
                  ? 'bg-indigo-600 text-white'
                  : 'text-gray-500 hover:bg-slate-50'
                  }`}
              >
                Reflexiones
              </button>
              {savedResults.length > 0 && (
                <button
                  onClick={() => setIsReportOpen(true)}
                  className="py-1.5 px-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-bold transition-all flex items-center gap-1 hover:shadow-sm cursor-pointer"
                  title="Ver y descargar reporte PDF completo"
                >
                  <Download size={13} />
                  <span className="hidden md:inline">PDF</span>
                </button>
              )}
              <button
                onClick={handleResetSession}
                className="hover:bg-rose-50 text-rose-500 p-2 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5"
                title="Limpiar diagnósticos"
              >
                Limpiar datos
              </button>
              <button
                onClick={handleRevokeConsent}
                className="hover:bg-slate-50 p-2 rounded-lg text-stone-400 font-bold transition-all"
                title="Salir del portal"
              >
                <LogOut size={16} />
              </button>
            </div>
          )}
        </div>
      </header>

      {/* Main Container Workspace */}
      <main className="flex-grow py-8 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8">
        {!hasConsented ? (
          <EthicalConsent onAccept={handleAcceptTerms} />
        ) : (
          <div>
            {/* Contextual routing based on state */}
            {activeSection === 'dashboard' && (
              <Dashboard
                results={savedResults}
                onNavigate={setActiveSection}
                userName={userName}
                setUserName={setUserName}
                onOpenReport={() => setIsReportOpen(true)}
              />
            )}
            {activeSection === 'rosenberg' && (
              <RosenbergTest
                onSave={handleSaveRosenberg}
                onBackToDashboard={() => setActiveSection('dashboard')}
              />
            )}
            {activeSection === 'cafeu' && (
              <AnxietyTest
                onSave={handleSaveCAFEU}
                onBackToDashboard={() => setActiveSection('dashboard')}
              />
            )}
            {activeSection === 'masks' && (
              <EmotionalMasks
                results={savedResults}
                onSaveReflection={handleSaveMaskReflection}
                onDeleteResult={handleDeleteResult}
                onBackToDashboard={() => setActiveSection('dashboard')}
              />
            )}
            {activeSection === 'journal' && (
              <EmpathyMirror
                onSaveAnalysis={handleSaveJournal}
                onBackToDashboard={() => setActiveSection('dashboard')}
              />
            )}
            {activeSection === 'reflections' && (
              <GuidedReflections
                results={savedResults}
                onSaveReflection={handleSaveReflection}
                onBackToDashboard={() => setActiveSection('dashboard')}
                onDeleteResult={handleDeleteResult}
              />
            )}
          </div>
        )}
      </main>

      {isReportOpen && (
        <ReportViewer
          results={savedResults}
          userName={userName}
          onClose={() => setIsReportOpen(false)}
        />
      )}

      {/* Clinical footer frame */}
      <footer className="bg-slate-905 border-t border-slate-100 py-6 text-center text-xs text-stone-450 mt-10">
        <div className="max-w-7xl mx-auto px-4 space-y-2">
          <p className="font-semibold text-slate-400">
            Master Psico © 2026 • Evaluación Psicométrica y Semántica de Autoanálisis
          </p>
          <p className="text-[10px] text-gray-400 max-w-lg mx-auto leading-normal">
            Esta plataforma se genera de acuerdo con estrictos estándares éticos de privacidad y consentimiento clínico. Ninguno de los análisis se asocia con tu identidad legal.
          </p>
        </div>
      </footer>

    </div>
  );
}
