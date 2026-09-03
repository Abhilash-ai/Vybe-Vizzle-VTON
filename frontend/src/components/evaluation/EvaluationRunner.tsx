import React, { useState } from 'react';
import { Play, CheckCircle2, XCircle, AlertCircle, Clock, DollarSign, Award, Save, RefreshCw, Upload, HelpCircle } from 'lucide-react';
import { SAMPLE_MODELS, SAMPLE_GARMENTS } from '../../services/sampleData';
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
  'FASHN API (Commercial)',
  'Local Baseline (CPU)'
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

  // Human Evaluation Rubric Scores (0 to 4 scale, initially unassigned)
  const [fitScore, setFitScore] = useState<number>(3.0);
  const [drapeScore, setDrapeScore] = useState<number>(3.0);
  const [textureScore, setTextureScore] = useState<number>(3.0);
  const [poseScore, setPoseScore] = useState<number>(3.0);
  const [bodyScore, setBodyScore] = useState<number>(3.0);
  const [faceScore, setFaceScore] = useState<number>(3.0);
  const [artifactScore, setArtifactScore] = useState<number>(3.0);
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
            ? 'Adaptive Semantic Full-Body Mask Dilation'
            : undefined
        })
      });
      const data: ExperimentResponse = await res.json();
      setCurrentExp(data);

      // Reset human rubric for evaluator input
      setFitScore(3.0);
      setDrapeScore(3.0);
      setTextureScore(3.0);
      setPoseScore(3.0);
      setBodyScore(3.0);
      setFaceScore(3.0);
      setArtifactScore(3.0);
      setNotes('');

      onExperimentSaved();
    } catch (err) {
      console.error('Inference error:', err);
      alert('Failed to execute inference test: ' + err);
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
          pose_preservation_score: poseScore,
          body_preservation_score: bodyScore,
          face_preservation_score: faceScore,
          artifact_score: artifactScore,
          evaluator_notes: notes
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

  const calculatedRubricAverage = Number(
    ((fitScore + drapeScore + textureScore + poseScore + bodyScore + faceScore + artifactScore) / 7.0).toFixed(2)
  );

  return (
    <div className="bg-[#12151E] border border-gray-800 rounded-xl p-6 space-y-6">
      <div className="border-b border-gray-800 pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div>
          <h2 className="text-base font-bold text-white uppercase tracking-wider">
            1. Live VTON Model Inference & Evaluation Runner
          </h2>
          <p className="text-xs text-gray-400 mt-1">
            Execute actual inference, record measured millisecond latency, compute INR unit cost, and submit human evaluation scores.
          </p>
        </div>
        <div className="text-[11px] font-mono text-gray-400 bg-[#0B0D14] px-3 py-1.5 rounded border border-gray-800">
          Mode: <strong className="text-blue-400">Live Empirical Runner</strong>
        </div>
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
            className="w-full bg-[#0B0D14] border border-gray-700 text-white rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-blue-500 font-mono"
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
            Category (10 Mandated)
          </label>
          <select
            value={selectedCategory}
            onChange={(e) => {
              const cat = e.target.value;
              setSelectedCategory(cat);
              const match = SAMPLE_GARMENTS.find((g) => g.category.toLowerCase() === cat.toLowerCase());
              if (match) {
                setGarmentImageUrl(match.image_url);
                setGarmentName(match.name);
              }
            }}
            className="w-full bg-[#0B0D14] border border-gray-700 text-white rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-blue-500 font-bold text-blue-400"
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
            Garment Apparel
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

      {/* Upload Custom Files & Execute Trigger */}
      <div className="flex flex-wrap items-center gap-3 pt-1 text-xs">
        <label className="cursor-pointer bg-[#1A1F2E] border border-gray-700 hover:border-gray-500 text-gray-200 px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition">
          <Upload className="w-3.5 h-3.5" /> Upload Custom Person Photo
          <input type="file" accept="image/*" className="hidden" onChange={handlePersonUpload} />
        </label>
        <label className="cursor-pointer bg-[#1A1F2E] border border-gray-700 hover:border-gray-500 text-gray-200 px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition">
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
              <RefreshCw className="w-4 h-4 animate-spin" /> Measuring & Generating...
            </>
          ) : (
            <>
              <Play className="w-4 h-4 fill-current" /> Run Test Generation
            </>
          )}
        </button>
      </div>

      {/* Live Experiment Output Area */}
      {currentExp ? (
        <div className="border border-gray-800 rounded-xl p-5 bg-[#0B0D14] space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-gray-800 pb-3 font-mono">
            <div>
              <span className="text-[11px] text-gray-400 uppercase">Experiment ID: {currentExp.id}</span>
              <h3 className="text-sm font-bold text-white">
                {currentExp.model_name} · {currentExp.category} ({currentExp.garment_name})
              </h3>
            </div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-1 rounded bg-green-950/60 text-green-300 border border-green-800 text-xs font-semibold uppercase">
                Status: {currentExp.generation_status}
              </span>
            </div>
          </div>

          {/* Tri-Pane Visual Comparison */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-1 text-center">
              <span className="text-[10px] font-semibold text-gray-400 uppercase font-mono">Person Input Photo</span>
              <div className="aspect-[3/4] bg-gray-900 rounded-lg overflow-hidden border border-gray-800">
                <img src={currentExp.person_image_path} alt="Person" className="w-full h-full object-cover" />
              </div>
            </div>

            <div className="space-y-1 text-center">
              <span className="text-[10px] font-semibold text-gray-400 uppercase font-mono">Garment Input Apparel</span>
              <div className="aspect-[3/4] bg-gray-900 rounded-lg overflow-hidden border border-gray-800 p-2 flex items-center justify-center">
                <img src={currentExp.garment_image_path} alt="Garment" className="w-full h-full object-contain" />
              </div>
            </div>

            <div className="space-y-1 text-center">
              <span className="text-[10px] font-semibold text-blue-400 uppercase font-bold font-mono">
                Actual Measured Output Image
              </span>
              <div className="aspect-[3/4] bg-gray-900 rounded-lg overflow-hidden border-2 border-blue-500 shadow-xl">
                <img
                  src={currentExp.result_image_url || currentExp.person_image_path}
                  alt="Generated Result"
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
          </div>

          {/* Hard Constraints Verification Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs font-mono">
            {/* Measured Latency */}
            <div className="p-3.5 bg-[#12151E] border border-gray-800 rounded-lg space-y-1">
              <div className="flex items-center justify-between text-gray-400 font-semibold uppercase">
                <span className="flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-blue-400" /> Measured Time
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
              <p className="text-xl font-bold text-white">{currentExp.generation_time_sec.toFixed(3)}s</p>
              <p className="text-[10px] text-gray-400">Duration: {currentExp.duration_ms} ms (Target &lt; 15.0s)</p>
            </div>

            {/* Calculated Cost */}
            <div className="p-3.5 bg-[#12151E] border border-gray-800 rounded-lg space-y-1">
              <div className="flex items-center justify-between text-gray-400 font-semibold uppercase">
                <span className="flex items-center gap-1.5">
                  <DollarSign className="w-3.5 h-3.5 text-green-400" /> Unit Cost ({currentExp.cost_type})
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
              <p className="text-xl font-bold text-white">₹{currentExp.cost_inr.toFixed(2)} INR</p>
              <p className="text-[10px] text-gray-400 truncate" title={currentExp.cost_calculation_basis || ''}>
                Basis: {currentExp.cost_calculation_basis || 'Standard Model Rate'}
              </p>
            </div>

            {/* Human Evaluation Status */}
            <div className="p-3.5 bg-[#12151E] border border-gray-800 rounded-lg space-y-1">
              <div className="flex items-center justify-between text-gray-400 font-semibold uppercase">
                <span className="flex items-center gap-1.5">
                  <Award className="w-3.5 h-3.5 text-purple-400" /> Human Evaluation
                </span>
                {currentExp.is_evaluated ? (
                  <span className="text-green-400 font-bold flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" /> SCORED
                  </span>
                ) : (
                  <span className="text-amber-400 font-bold flex items-center gap-1">
                    <AlertCircle className="w-3.5 h-3.5" /> PENDING INPUT
                  </span>
                )}
              </div>
              <p className="text-xl font-bold text-white">
                {currentExp.overall_score !== null ? `${currentExp.overall_score} / 4.0` : 'Pending Grading'}
              </p>
              <p className="text-[10px] text-gray-400">Fill & submit the 7-criteria rubric below</p>
            </div>
          </div>

          {/* Structured Human Evaluation Scoring Rubric */}
          <div className="bg-[#12151E] border border-gray-800 rounded-lg p-5 space-y-4 font-mono">
            <div className="flex items-center justify-between border-b border-gray-800 pb-2">
              <h4 className="text-xs font-bold text-white uppercase tracking-wider">
                Human Accuracy Evaluation Rubric (0 to 4 Scale)
              </h4>
              <span className="text-[11px] text-blue-400 font-bold">
                Computed Overall: {calculatedRubricAverage} / 4.0
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
              <div>
                <div className="flex justify-between text-gray-300 mb-1">
                  <span>1. Fit</span>
                  <span className="font-bold text-blue-400">{fitScore}</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="4"
                  step="0.1"
                  value={fitScore}
                  onChange={(e) => setFitScore(parseFloat(e.target.value))}
                  className="w-full h-1.5 bg-gray-700 rounded appearance-none cursor-pointer"
                />
              </div>

              <div>
                <div className="flex justify-between text-gray-300 mb-1">
                  <span>2. Drape & Fall</span>
                  <span className="font-bold text-blue-400">{drapeScore}</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="4"
                  step="0.1"
                  value={drapeScore}
                  onChange={(e) => setDrapeScore(parseFloat(e.target.value))}
                  className="w-full h-1.5 bg-gray-700 rounded appearance-none cursor-pointer"
                />
              </div>

              <div>
                <div className="flex justify-between text-gray-300 mb-1">
                  <span>3. Texture</span>
                  <span className="font-bold text-blue-400">{textureScore}</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="4"
                  step="0.1"
                  value={textureScore}
                  onChange={(e) => setTextureScore(parseFloat(e.target.value))}
                  className="w-full h-1.5 bg-gray-700 rounded appearance-none cursor-pointer"
                />
              </div>

              <div>
                <div className="flex justify-between text-gray-300 mb-1">
                  <span>4. Pose Preserv.</span>
                  <span className="font-bold text-blue-400">{poseScore}</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="4"
                  step="0.1"
                  value={poseScore}
                  onChange={(e) => setPoseScore(parseFloat(e.target.value))}
                  className="w-full h-1.5 bg-gray-700 rounded appearance-none cursor-pointer"
                />
              </div>

              <div>
                <div className="flex justify-between text-gray-300 mb-1">
                  <span>5. Body Preserv.</span>
                  <span className="font-bold text-blue-400">{bodyScore}</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="4"
                  step="0.1"
                  value={bodyScore}
                  onChange={(e) => setBodyScore(parseFloat(e.target.value))}
                  className="w-full h-1.5 bg-gray-700 rounded appearance-none cursor-pointer"
                />
              </div>

              <div>
                <div className="flex justify-between text-gray-300 mb-1">
                  <span>6. Face Preserv.</span>
                  <span className="font-bold text-blue-400">{faceScore}</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="4"
                  step="0.1"
                  value={faceScore}
                  onChange={(e) => setFaceScore(parseFloat(e.target.value))}
                  className="w-full h-1.5 bg-gray-700 rounded appearance-none cursor-pointer"
                />
              </div>

              <div>
                <div className="flex justify-between text-gray-300 mb-1">
                  <span>7. Artifacts</span>
                  <span className="font-bold text-blue-400">{artifactScore}</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="4"
                  step="0.1"
                  value={artifactScore}
                  onChange={(e) => setArtifactScore(parseFloat(e.target.value))}
                  className="w-full h-1.5 bg-gray-700 rounded appearance-none cursor-pointer"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-300 mb-1">
                Evaluator Observations & Notes:
              </label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={2}
                placeholder="Log observed boundary blending, pallu flow, or collar alignment..."
                className="w-full bg-[#0B0D14] border border-gray-700 text-white rounded-lg p-2 text-xs focus:outline-none focus:border-blue-500 font-mono"
              />
            </div>

            <div className="flex items-center justify-between pt-2">
              <span className="text-[10px] text-gray-400">
                0=Failed, 1=Poor, 2=Acceptable, 3=Good, 4=Excellent
              </span>
              <button
                onClick={handleSaveRubric}
                disabled={isSavingScore}
                className="px-4 py-2 bg-green-600 hover:bg-green-500 disabled:bg-gray-700 text-white font-bold rounded-lg text-xs uppercase flex items-center gap-1.5 shadow transition"
              >
                <Save className="w-3.5 h-3.5" />
                {isSavingScore ? 'Saving...' : saveSuccess ? 'Scores Recorded!' : 'Save & Record Evaluation Scores'}
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div className="border border-dashed border-gray-800 rounded-xl p-8 text-center text-gray-500 space-y-2 font-mono">
          <HelpCircle className="w-6 h-6 mx-auto text-gray-600" />
          <p className="text-xs uppercase">No active inference in session</p>
          <p className="text-[11px] text-gray-400">Select model and category above and click &quot;Run Test Generation&quot; to execute real inference.</p>
        </div>
      )}
    </div>
  );
};
