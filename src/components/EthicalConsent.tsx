/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { ShieldCheck, Heart, Users, FileLock2, KeyRound } from 'lucide-react';

interface EthicalConsentProps {
  onAccept: () => void;
}

export default function EthicalConsent({ onAccept }: EthicalConsentProps) {
  return (
    <div className="max-w-3xl mx-auto py-10 px-4 animate-fade-in" id="ethical-consent-layout">
      <div className="bg-white border border-gray-100 shadow-xl rounded-3xl p-8 lg:p-12 space-y-8 relative overflow-hidden">
        {/* Visual Header */}
        <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-teal-500 via-indigo-500 to-purple-500" />
        
        <div className="text-center space-y-3">
          <div className="inline-flex p-4 bg-indigo-50 text-indigo-600 rounded-full mb-2">
            <ShieldCheck size={44} className="animate-pulse" />
          </div>
          <h1 className="text-4xl font-extrabold text-slate-800 tracking-tight">Master Psico</h1>
          <p className="text-sm font-semibold text-indigo-600 uppercase tracking-widest font-mono">
            Portal Clínico de Autoconocimiento
          </p>
        </div>

        {/* Framing Context */}
        <div className="space-y-4 text-sm text-slate-600 leading-relaxed">
          <p className="font-medium text-slate-700 text-center max-w-xl mx-auto">
            Te damos la bienvenida a <strong className="text-indigo-600">Master Psico</strong>, un espacio científico diseñado para promover la introspección y el desarrollo psicológico a través de pruebas estandarizadas y análisis semántico.
          </p>

          <div className="border-t border-b border-slate-100 py-6 my-6 grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="flex gap-3">
              <div className="text-indigo-600 shrink-0 mt-1">
                <FileLock2 size={22} />
              </div>
              <div>
                <h3 className="font-bold text-slate-800 text-sm">Privacidad Certificada</h3>
                <p className="text-xs text-stone-400 mt-1 leading-normal">
                  Tus respuestas psicométricas y entradas de diario se almacenan a nivel de sesión o localmente. No se guardan registros en bases de datos públicas remotas.
                </p>
              </div>
            </div>

            <div className="flex gap-3">
              <div className="text-indigo-600 shrink-0 mt-1">
                <Users size={22} />
              </div>
              <div>
                <h3 className="font-bold text-slate-800 text-sm">Pruebas Homologadas</h3>
                <p className="text-xs text-stone-400 mt-1 leading-normal">
                  Los cuestionarios aplicados derivan de escalas robustas avaladas por la comunidad académica internacional (Escala Rosenberg, CAFEU).
                </p>
              </div>
            </div>
          </div>

          <div className="bg-stone-50 border border-stone-100 p-5 rounded-2xl text-xs space-y-3">
            <h4 className="font-bold text-slate-800 flex items-center gap-1.5 uppercase tracking-wider text-[10px] font-mono">
              <Heart className="text-rose-500 fill-rose-500" size={12} />
              Aviso Clínico de Responsabilidad Ética
            </h4>
            <p className="font-medium text-stone-500">
              Esta plataforma constituye una herramienta educativa de autoconocimiento y autoanálisis. <strong>No sustituye bajo ninguna circunstancia una consulta médica, diagnóstico psiquiátrico o terapia psicoterapéutica profesional.</strong>
            </p>
            <p className="font-medium text-stone-500">
              Si estás experimentando síntomas severos de angustia, ansiedad invalidante, depresión persistente o pensamientos de autolesión, te instamos a contactar de inmediato con los servicios de salud de tu localidad o un psicólogo colegiado.
            </p>
          </div>
        </div>

        {/* Consent Buttons Form */}
        <div className="flex flex-col sm:flex-row gap-4 items-center justify-between pt-6 border-t border-slate-50">
          <div className="text-xs text-gray-400 font-mono flex items-center gap-1.5">
            <KeyRound size={14} className="text-emerald-500" />
            <span>Encriptación activa SSL / TLS</span>
          </div>
          <button
            onClick={onAccept}
            className="w-full sm:w-auto py-3.5 px-8 bg-gradient-to-r from-indigo-600 to-indigo-800 hover:opacity-95 text-white font-black rounded-2xl text-sm shadow-xl shadow-indigo-100 transition-all flex items-center justify-center cursor-pointer"
          >
            Entiendo los términos y deseo comenzar
          </button>
        </div>
      </div>
    </div>
  );
}
