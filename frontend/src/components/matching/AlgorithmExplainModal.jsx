import React from 'react';
import { Modal } from '../common/Modal';
import { Cpu, CheckCircle2, ShieldCheck, Scale, Sliders } from 'lucide-react';

export const AlgorithmExplainModal = ({ isOpen, onClose }) => {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title="How StudySync Matching Works" maxWidth="max-w-2xl">
      <div className="space-y-4 text-sm text-slate-600 leading-relaxed">
        <div className="flex items-start gap-3 p-4 bg-brand-50 border border-brand-100 rounded-2xl">
          <Cpu className="w-6 h-6 text-brand-600 flex-shrink-0 mt-0.5" />
          <div>
            <h4 className="font-semibold text-brand-900 mb-1">Deterministic, Explainable AI</h4>
            <p className="text-xs text-brand-800">
              StudySync does not generate random percentages. Compatibility scores are computed dynamically from real database profiles through a normalized multi-factor weighted scoring formula.
            </p>
          </div>
        </div>

        <div>
          <h4 className="font-semibold text-slate-800 mb-2 flex items-center gap-2">
            <Scale className="w-4 h-4 text-brand-600" />
            Configurable Scoring Weights
          </h4>
          <div className="space-y-2">
            <div className="flex items-center justify-between p-2.5 bg-slate-50 border border-slate-200/80 rounded-xl text-xs">
              <div>
                <strong className="text-slate-800">1. Skill Overlap & Complementary Skillset (40%)</strong>
                <p className="text-slate-500">Evaluates coverage of project requirements and pairs complementary capabilities (e.g. Frontend React + Backend Flask).</p>
              </div>
              <span className="font-bold text-brand-600 text-sm">40%</span>
            </div>

            <div className="flex items-center justify-between p-2.5 bg-slate-50 border border-slate-200/80 rounded-xl text-xs">
              <div>
                <strong className="text-slate-800">2. Academic Interests & Domain Alignment (20%)</strong>
                <p className="text-slate-500">Applies Jaccard similarity across selected academic interest tags and preferred project domains.</p>
              </div>
              <span className="font-bold text-brand-600 text-sm">20%</span>
            </div>

            <div className="flex items-center justify-between p-2.5 bg-slate-50 border border-slate-200/80 rounded-xl text-xs">
              <div>
                <strong className="text-slate-800">3. Availability & Time Commitment (20%)</strong>
                <p className="text-slate-500">Compares weekly hour commitments and scheduling bandwidth to ensure reliable team rhythm.</p>
              </div>
              <span className="font-bold text-brand-600 text-sm">20%</span>
            </div>

            <div className="flex items-center justify-between p-2.5 bg-slate-50 border border-slate-200/80 rounded-xl text-xs">
              <div>
                <strong className="text-slate-800">4. Learning Goals Synergy (10%)</strong>
                <p className="text-slate-500">Performs keyword token extraction to identify shared learning objectives and project ambition.</p>
              </div>
              <span className="font-bold text-brand-600 text-sm">10%</span>
            </div>

            <div className="flex items-center justify-between p-2.5 bg-slate-50 border border-slate-200/80 rounded-xl text-xs">
              <div>
                <strong className="text-slate-800">5. Skill Proficiency Suitability (10%)</strong>
                <p className="text-slate-500">Weights Beginner (1.0), Intermediate (2.0), and Advanced (3.0) proficiencies to ensure balanced technical strength.</p>
              </div>
              <span className="font-bold text-brand-600 text-sm">10%</span>
            </div>
          </div>
        </div>

        <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-500 space-y-1">
          <p className="font-medium text-slate-700">Formula:</p>
          <code className="text-brand-700 font-mono text-[11px] block bg-white p-2 rounded border border-slate-200">
            Total Score = (0.40 × SkillScore) + (0.20 × InterestScore) + (0.20 × AvailabilityScore) + (0.10 × GoalScore) + (0.10 × ProficiencyScore)
          </code>
          <p className="text-[11px] text-slate-400">Total normalized score is clamped between 5% and 99%, sorted in descending order.</p>
        </div>

        <div className="flex justify-end pt-2">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-brand-600 text-white text-xs font-medium rounded-xl hover:bg-brand-700 transition-colors"
          >
            Got it, thanks!
          </button>
        </div>
      </div>
    </Modal>
  );
};
