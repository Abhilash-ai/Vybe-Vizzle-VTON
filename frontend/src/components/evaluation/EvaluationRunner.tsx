import React, { useState } from 'react';
import { Play, CheckCircle2, XCircle, AlertCircle, Clock, DollarSign, Award, Save, RefreshCw, Upload } from 'lucide-react';
import { SAMPLE_MODELS, SAMPLE_GARMENTS, CATEGORIES } from '../../services/sampleData';
import type { ExperimentResponse } from '../../types';
import { api } from '../../services/api';

const REQUIRED_CATEGORIES = [
  'Saree',
  'Kurti',
  'Lehenga',
  'Top',
  'T-shirt',
  'Jumpsuit',
  'Coat',
  'Shirt',
  'Jeans',
  'Trousers'
];

const CANDIDATE_MODELS = [
  'CatVTON',
  'IDM-VTON (Baseline)',
  'IDM-VTON (Optimized)',
  'OOTDiffusion',
  'FASHN API (Commercial)'
];

interface EvaluationRunnerProps {
  onExperimentSaved: () => void;
}

export const EvaluationRunner: React.FC<EvaluationRunnerProps> = ({ onExperimentSaved }) => {
  // Inputs
  const [selectedModel, setSelectedModel] = useState<string>('CatVTON');
  const [selectedCategory, setSelectedCategory] = useState<string>('Saree');
  const [personImageUrl, setPersonImageUrl] = useState<string>(SAMPLE_MODELS[0].image_url);
  const [garmentImageUrl, setGarmentImageUrl] = useState<string>(SAMPLE_GARMENTS[4].image_url);
  const [garmentName, setGarmentName] = useState<string>(SAMPLE_GARMENTS[4].name);

  // Execution state
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [currentExp, setCurrentExp] = useState<ExperimentResponse | null>(null);

  // Human Evaluation Rubric Scores (0 to 4 scale)
  const [fitScore, setFitScore] = useState<number>(3.5);
  const [drapeScore, setDrapeScore] = useState<number>(3.5);
  const [textureScore, setTextureScore] = useState<number>(3.8);
  const [artifactScore, setArtifactScore] = useState<number>(3.5);
  const [faceScore, setFaceScore] = useState<number>(3.8);
  const [bodyScore, setBodyScore] = useState<number>(3.6);
  const [notes, setNotes] = useState<string>('');
  const [isSavingScore, setIsSavingScore] = useState<boolean>(false);
  const [saveSuccess, setSaveSuccess] = useState<boolean>(false);

  // Handle custom upload
  const handlePersonUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      try {
        const res = await api.uploadPersonImage(e.target.files[0]);
        setPersonImageUrl(res.url);
      } catch (err) {
        console.error(err);
      }
    }
  };

  const handleGarmentUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      try {
        const res = await api.uploadGarment(e.target.files[0], 'Custom Garment', selectedCategory.toLowerCase());
        setGarmentImageUrl(res.image_url);
        setGarmentName(res.name);
      } catch (err) {
        console.error(err);
      }
    }
  };

  const handleRunEvaluation = async () => {
    setIsRunning(true);
    setSaveSuccess(false);
    try {
      const res = await fetch('http://localhost:8000/api/v1/eval/run', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model_name: selectedModel,
          category: selectedCategory,
          person_image_url: personImageUrl,
          garment_image_url: garmentImageUrl,
          garment_name: garmentName,
          is_optimized: selectedModel.includes('Optimized'),
          optimization_technique: selectedModel.includes('Optimized')
            ? 'Adaptive Human Parsing & Mask Dilation'
            : undefined
        })
      });
      const data: ExperimentResponse = await res.json();
      setCurrentExp(data);

      // Pre-fill rubric with empirical baseline
      if (data.fit_score !== undefined && data.fit_score !== null) setFitScore(data.fit_score);
      if (data.drape_score !== undefined && data.drape_score !== null) setDrapeScore(data.drape_score);
      if (data.texture_score !== undefined && data.texture_score !== null) setTextureScore(data.texture_score);
      if (data.artifact_score !== undefined && data.artifact_score !== null) setArtifactScore(data.artifact_score);
      if (data.face_score !== undefined && data.face_score !== null) setFaceScore(data.face_score);
      if (data.body_score !== undefined && data.body_score !== null) setBodyScore(data.body_score);
      if (data.notes) setNotes(data.notes);

      onExperimentSaved();
    } catch (err) {
      console.error(err);
    } finally {
      setIsRunning(false);
    }
  };

  const handleSaveRubric = async () => {
    if (!currentExp) return;
    setIsSavingScore(true);
    try {
      const res = await fetch(`http://localhost:8000/api/v1/eval/experiments/${currentExp.id}/score`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fit_score: fitScore,
          drape_score: drapeScore,
          texture_score: textureScore,
          artifact_score: artifactScore,
          face_score: faceScore,
          body_score: bodyScore,
          notes: notes
        })
      });
      const updated: ExperimentResponse = await res.json();
      setCurrentExp(updated);
      setSaveSuccess(true);
      onExperimentSaved();
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err) {
      console.error(err);
    } finally {
      setIsSavingScore(false);
    }
  };

  const overallScoreCalculated = Number(
    ((fitScore + drapeScore + textureScore + artifactScore + faceScore + bodyScore) / 6.0).toFixed(2)
  );

  return (
    <div className="bg-[#12151E] border border-gray-800 rounded-xl p-6 space-y-6">
      <div className="border-b border-gray-800 pb-4">
        <h2 className="text-lg font-bold text-white uppercase tracking-wider">
          1. Live Model Evaluation & Inference Runner
        </h2>
        <p className="text-xs text-gray-400 mt-1">
          Execute controlled try-on inference, record precise latency, calculate INR unit cost, and grade accuracy metrics.
        </p>
      </div>

      {/* Inputs Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {/* Model Selection */}
        <div>
          <label className="block text-xs font-semibold text-gray-300 mb-1.5 uppercase">
            VTON Model Candidate
          </label>
          <select
            value={selectedModel}
            onChange={(e) => setSelectedModel(e.target.value)}
            className="w-full bg-[#0B0D14] border border-gray-700 text-white rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-blue-500"
          >
            {CANDIDATE_MODELS.map((m) => (
              <option key={m} value={m}>
                {m}
              </option>
            ))}
          </select>
        </div>

        {/* Clothing Category (10 Required) */}
        <div>
          <label className="block text-xs font-semibold text-gray-300 mb-1.5 uppercase">
            Clothing Category (Required)
          </label>
          <select
            value={selectedCategory}
            onChange={(e) => {
              const cat = e.target.value;
              setSelectedCategory(cat);
              // Auto select matching sample garment
              const match = SAMPLE_GARMENTS.find((g) => g.category.toLowerCase() === cat.toLowerCase());
              if (match) {
                setGarmentImageUrl(match.image_url);
                setGarmentName(match.name);
              }
            }}
            className="w-full bg-[#0B0D14] border border-gray-700 text-white rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-blue-500 font-semibold text-blue-400"
          >
            {REQUIRED_CATEGORIES.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>

        {/* Person Photo Preset */}
        <div>
          <label className="block text-xs font-semibold text-gray-300 mb-1.5 uppercase">
            Person Portrait
          </label>
          <select
            value={personImageUrl}
            onChange={(e) => setPersonImageUrl(e.target.value)}
            className="w-full bg-[#0B0D14] border border-gray-700 text-white rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-blue-500"
          >
            {SAMPLE_MODELS.map((m) => (
              <option key={m.id} value={m.image_url}>
                {m.name}
              </option>
            ))}
          </select>
        </div>

        {/* Garment Selection */}
        <div>
          <label className="block text-xs font-semibold text-gray-300 mb-1.5 uppercase">
            Garment Selection
          </label>
          <select
            value={garmentImageUrl}
            onChange={(e) => {
              const url = e.target.value;
              setGarmentImageUrl(url);
              const g = SAMPLE_GARMENTS.find((item) => item.image_url === url);
              if (g) setGarmentName(g.name);
            }}
            className="w-full bg-[#0B0D14] border border-gray-700 text-white rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-blue-500"
          >
            {SAMPLE_GARMENTS.map((g) => (
              <option key={g.id} value={g.image_url}>
                {g.name} ({g.category})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Upload Buttons for custom test files */}
      <div className="flex flex-wrap items-center gap-3 pt-1 text-xs">
        <label className="cursor-pointer bg-[#1A1F2E] border border-gray-700 hover:border-gray-500 text-gray-200 px-3 py-1.5 rounded-lg flex items-center gap-1.5">
          <Upload className="w-3.5 h-3.5" /> Upload Custom Person Photo
          <input type="file" accept="image/*" className="hidden" onChange={handlePersonUpload} />
        </label>
        <label className="cursor-pointer bg-[#1A1F2E] border border-gray-700 hover:border-gray-500 text-gray-200 px-3 py-1.5 rounded-lg flex items-center gap-1.5">
          <Upload className="w-3.5 h-3.5" /> Upload Custom Garment Photo
          <input type="file" accept="image/*" className="hidden" onChange={handleGarmentUpload} />
        </label>
        <button
          onClick={handleRunEvaluation}
          disabled={isRunning}
          className="ml-auto px-6 py-2.5 bg-blue-600 hover:bg-blue-500 disabled:bg-gray-700 text-white font-bold rounded-lg uppercase tracking-wider flex items-center gap-2 shadow-lg transition-all"
        >
          {isRunning ? (
            <>
              <RefreshCw className="w-4 h-4 animate-spin" /> Running Evaluation...
            </>
          ) : (
            <>
              <Play className="w-4 h-4 fill-current" /> Run Test Generation
            </>
          )}
        </button>
      </div>

      {/* Evaluation Results Display */}
      {currentExp && (
        <div className="border border-gray-800 rounded-xl p-5 bg-[#0B0D14] space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-gray-800 pb-3">
            <div>
              <span className="text-[11px] font-mono text-gray-400 uppercase">Experiment ID: {currentExp.id}</span>
              <h3 className="text-base font-bold text-white">
                {currentExp.model_name} on {currentExp.category} ({currentExp.garment_name})
              </h3>
            </div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-1 rounded bg-green-900/40 text-green-400 border border-green-700 text-xs font-semibold uppercase">
                Status: {currentExp.status}
              </span>
            </div>
          </div>

          {/* Images Comparison Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-1 text-center">
              <span className="text-[11px] font-semibold text-gray-400 uppercase">Person Input</span>
              <div className="aspect-[3/4] bg-gray-900 rounded-lg overflow-hidden border border-gray-800">
                <img src={currentExp.person_image_url} alt="Person" className="w-full h-full object-cover" />
              </div>
            </div>

            <div className="space-y-1 text-center">
              <span className="text-[11px] font-semibold text-gray-400 uppercase">Garment Input</span>
              <div className="aspect-[3/4] bg-gray-900 rounded-lg overflow-hidden border border-gray-800 p-2 flex items-center justify-center">
                <img src={currentExp.garment_image_url} alt="Garment" className="w-full h-full object-contain" />
              </div>
            </div>

            <div className="space-y-1 text-center">
              <span className="text-[11px] font-semibold text-blue-400 uppercase font-bold">
                Generated Model Output
              </span>
              <div className="aspect-[3/4] bg-gray-900 rounded-lg overflow-hidden border-2 border-blue-500 shadow-lg">
                <img
                  src={currentExp.result_image_url || currentExp.person_image_url}
                  alt="Generated Result"
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
          </div>

          {/* Hard Requirements Metric Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
            {/* Speed */}
            <div className="p-3.5 bg-[#12151E] border border-gray-800 rounded-lg space-y-1">
              <div className="flex items-center justify-between text-gray-400 font-semibold uppercase">
                <span className="flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5" /> Generation Speed
                </span>
                {currentExp.meets_time_req ? (
                  <span className="text-green-400 font-bold flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" /> PASS (&lt;15s)
                  </span>
                ) : (
                  <span className="text-red-400 font-bold flex items-center gap-1">
                    <XCircle className="w-3.5 h-3.5" /> FAIL (&gt;15s)
                  </span>
                )}
              </div>
              <p className="text-xl font-bold font-mono text-white">
                {currentExp.generation_time_sec.toFixed(2)} sec
              </p>
              <p className="text-[10px] text-gray-400">Target Hard Limit: &lt; 15.0 seconds</p>
            </div>

            {/* Cost */}
            <div className="p-3.5 bg-[#12151E] border border-gray-800 rounded-lg space-y-1">
              <div className="flex items-center justify-between text-gray-400 font-semibold uppercase">
                <span className="flex items-center gap-1.5">
                  <DollarSign className="w-3.5 h-3.5" /> Unit Cost
                </span>
                {currentExp.meets_cost_req ? (
                  <span className="text-green-400 font-bold flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" /> PASS (&lt;₹4)
                  </span>
                ) : (
                  <span className="text-red-400 font-bold flex items-center gap-1">
                    <XCircle className="w-3.5 h-3.5" /> FAIL (&gt;₹4)
                  </span>
                )}
              </div>
              <p className="text-xl font-bold font-mono text-white">₹{currentExp.cost_inr.toFixed(2)}</p>
              <p className="text-[10px] text-gray-400">Target Hard Limit: &lt; ₹4.00 per generation</p>
            </div>

            {/* Overall Accuracy */}
            <div className="p-3.5 bg-[#12151E] border border-gray-800 rounded-lg space-y-1">
              <div className="flex items-center justify-between text-gray-400 font-semibold uppercase">
                <span className="flex items-center gap-1.5">
                  <Award className="w-3.5 h-3.5" /> Overall Accuracy Score
                </span>
                {overallScoreCalculated >= 3.0 ? (
                  <span className="text-green-400 font-bold flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" /> ACCEPTABLE
                  </span>
                ) : (
                  <span className="text-amber-400 font-bold flex items-center gap-1">
                    <AlertCircle className="w-3.5 h-3.5" /> SUB-PAR
                  </span>
                )}
              </div>
              <p className="text-xl font-bold font-mono text-white">{overallScoreCalculated} / 4.0</p>
              <p className="text-[10px] text-gray-400">Scale: 0=Failed, 1=Poor, 2=Acceptable, 3=Good, 4=Excellent</p>
            </div>
          </div>

          {/* Structured Human Evaluation Scoring Rubric (0-4) */}
          <div className="bg-[#12151E] border border-gray-800 rounded-lg p-4 space-y-4">
            <h4 className="text-xs font-bold text-white uppercase tracking-wider">
              Human Evaluation Rubric & Observations (0 to 4 Scale)
            </h4>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 text-xs">
              <div>
                <div className="flex justify-between text-gray-300 mb-1">
                  <span>1. Garment Fit</span>
                  <span className="font-bold text-blue-400 font-mono">{fitScore}</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="4"
                  step="0.1"
                  value={fitScore}
                  onChange={(e) => setFitScore(parseFloat(e.target.value))}
                  className="w-full h-1.5 bg-gray-700 rounded-lg appearance-none cursor-pointer"
                />
              </div>

              <div>
                <div className="flex justify-between text-gray-300 mb-1">
                  <span>2. Drape & Flow</span>
                  <span className="font-bold text-blue-400 font-mono">{drapeScore}</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="4"
                  step="0.1"
                  value={drapeScore}
                  onChange={(e) => setDrapeScore(parseFloat(e.target.value))}
                  className="w-full h-1.5 bg-gray-700 rounded-lg appearance-none cursor-pointer"
                />
              </div>

              <div>
                <div className="flex justify-between text-gray-300 mb-1">
                  <span>3. Texture Fidelity</span>
                  <span className="font-bold text-blue-400 font-mono">{textureScore}</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="4"
                  step="0.1"
                  value={textureScore}
                  onChange={(e) => setTextureScore(parseFloat(e.target.value))}
                  className="w-full h-1.5 bg-gray-700 rounded-lg appearance-none cursor-pointer"
                />
              </div>

              <div>
                <div className="flex justify-between text-gray-300 mb-1">
                  <span>4. Minimal Artifacts</span>
                  <span className="font-bold text-blue-400 font-mono">{artifactScore}</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="4"
                  step="0.1"
                  value={artifactScore}
                  onChange={(e) => setArtifactScore(parseFloat(e.target.value))}
                  className="w-full h-1.5 bg-gray-700 rounded-lg appearance-none cursor-pointer"
                />
              </div>

              <div>
                <div className="flex justify-between text-gray-300 mb-1">
                  <span>5. Face Preservation</span>
                  <span className="font-bold text-blue-400 font-mono">{faceScore}</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="4"
                  step="0.1"
                  value={faceScore}
                  onChange={(e) => setFaceScore(parseFloat(e.target.value))}
                  className="w-full h-1.5 bg-gray-700 rounded-lg appearance-none cursor-pointer"
                />
              </div>

              <div>
                <div className="flex justify-between text-gray-300 mb-1">
                  <span>6. Body & Pose Preservation</span>
                  <span className="font-bold text-blue-400 font-mono">{bodyScore}</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="4"
                  step="0.1"
                  value={bodyScore}
                  onChange={(e) => setBodyScore(parseFloat(e.target.value))}
                  className="w-full h-1.5 bg-gray-700 rounded-lg appearance-none cursor-pointer"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-300 mb-1">
                Engineering Observations & Optimization Notes:
              </label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={2}
                placeholder="Document specific boundary distortion, pallu drape alignment, or segmentation artifact notes..."
                className="w-full bg-[#0B0D14] border border-gray-700 text-white rounded-lg p-2 text-xs focus:outline-none focus:border-blue-500 font-mono"
              />
            </div>

            <div className="flex items-center justify-between pt-2">
              <span className="text-[11px] text-gray-400 font-mono">
                Formula: Overall = (Fit + Drape + Texture + Artifacts + Face + Body) / 6
              </span>
              <button
                onClick={handleSaveRubric}
                disabled={isSavingScore}
                className="px-4 py-2 bg-green-600 hover:bg-green-500 disabled:bg-gray-700 text-white font-bold rounded-lg text-xs uppercase flex items-center gap-1.5 shadow transition-all"
              >
                <Save className="w-3.5 h-3.5" />
                {isSavingScore ? 'Saving...' : saveSuccess ? 'Scores Logged!' : 'Save & Log Experiment Scores'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
