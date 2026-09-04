import React, { useState, useEffect } from 'react';
import type { ExperimentResponse, ProviderStatusInfo } from '../types';

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

const PRESETS = [
  {
    name: 'Banarasi Saree',
    category: 'Saree',
    person: '/data/samples/models/model_maya.jpg',
    garment: '/data/samples/garments/garm_royal_saree.jpg',
    garmentName: 'Royal Banarasi Silk Saree'
  },
  {
    name: 'Chikankari Kurti',
    category: 'Kurti',
    person: '/data/samples/models/model_maya.jpg',
    garment: '/data/samples/garments/garm_linen_kurta.jpg',
    garmentName: 'Ivory Chikankari Embroidered Kurti'
  },
  {
    name: 'Minimal Black Tee',
    category: 'T-shirt',
    person: '/data/samples/models/model_kai.jpg',
    garment: '/data/samples/garments/garm_minimal_tee.jpg',
    garmentName: 'Heavyweight Boxy Graphic T-shirt'
  },
  {
    name: 'Charcoal Overcoat',
    category: 'Coat',
    person: '/data/samples/models/model_leo.jpg',
    garment: '/data/samples/garments/garm_leather_jacket.jpg',
    garmentName: 'Double-Breasted Wool Overcoat'
  }
];

interface TestPageProps {
  onExperimentSaved: () => void;
}

export const TestPage: React.FC<TestPageProps> = ({ onExperimentSaved }) => {
  // Input selections start EMPTY
  const [personImageUrl, setPersonImageUrl] = useState<string | null>(null);
  const [garmentImageUrl, setGarmentImageUrl] = useState<string | null>(null);
  const [garmentName, setGarmentName] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [selectedModel, setSelectedModel] = useState<string>('');

  // Providers list
  const [providers, setProviders] = useState<ProviderStatusInfo[]>([]);

  // Advanced Diffusion Parameters
  const [showAdvanced, setShowAdvanced] = useState<boolean>(false);
  const [steps, setSteps] = useState<number>(30);
  const [guidanceScale, setGuidanceScale] = useState<number>(2.5);
  const [maskDilation, setMaskDilation] = useState<number>(18);
  const [autoCrop, setAutoCrop] = useState<boolean>(true);

  // Execution state
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [currentExp, setCurrentExp] = useState<ExperimentResponse | null>(null);
  const [executionError, setExecutionError] = useState<string | null>(null);

  // Human evaluation scores (0 to 4 scale, start UNSELECTED/null)
  const [fit, setFit] = useState<number | null>(null);
  const [drape, setDrape] = useState<number | null>(null);
  const [texture, setTexture] = useState<number | null>(null);
  const [pose, setPose] = useState<number | null>(null);
  const [body, setBody] = useState<number | null>(null);
  const [face, setFace] = useState<number | null>(null);
  const [artifacts, setArtifacts] = useState<number | null>(null);
  const [notes, setNotes] = useState<string>('');
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [saveMessage, setSaveMessage] = useState<string | null>(null);

  useEffect(() => {
    fetch('http://localhost:8000/api/v1/eval/providers', { cache: 'no-store' })
      .then((res) => res.json())
      .then((data) => {
        setProviders(data);
        if (data.length > 0 && !selectedModel) {
          const readyProvider = data.find((p: ProviderStatusInfo) => p.status === 'READY');
          if (readyProvider) {
            setSelectedModel(readyProvider.model_name);
          }
        }
      })
      .catch((err) => console.error(err));
  }, []);

  const handleApplyPreset = (p: typeof PRESETS[0]) => {
    setPersonImageUrl(p.person);
    setGarmentImageUrl(p.garment);
    setSelectedCategory(p.category);
    setGarmentName(p.garmentName);
  };

  const handlePersonUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const formData = new FormData();
      formData.append('file', e.target.files[0]);
      try {
        const res = await fetch('http://localhost:8000/api/v1/tryon/upload-person', {
          method: 'POST',
          body: formData
        });
        const json = await res.json();
        setPersonImageUrl(json.url);
      } catch (err) {
        console.error(err);
      }
    }
  };

  const handleGarmentUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const formData = new FormData();
      formData.append('file', e.target.files[0]);
      formData.append('name', e.target.files[0].name.replace(/\.[^/.]+$/, ''));
      formData.append('category', selectedCategory ? selectedCategory.toLowerCase() : 'other');
      try {
        const res = await fetch('http://localhost:8000/api/v1/garments/upload', {
          method: 'POST',
          body: formData
        });
        const json = await res.json();
        setGarmentImageUrl(json.image_url);
        setGarmentName(json.name);
      } catch (err) {
        console.error(err);
      }
    }
  };

  const handleRunTryOn = async () => {
    if (!personImageUrl) {
      alert('Please upload or select a person image first.');
      return;
    }
    if (!garmentImageUrl) {
      alert('Please upload or select a garment image first.');
      return;
    }
    if (!selectedCategory) {
      alert('Please select one of the 10 clothing categories.');
      return;
    }
    if (!selectedModel) {
      alert('Please select a VTON model candidate.');
      return;
    }

    setIsRunning(true);
    setExecutionError(null);
    setCurrentExp(null);
    setSaveMessage(null);

    // Reset scores for new experiment run
    setFit(null);
    setDrape(null);
    setTexture(null);
    setPose(null);
    setBody(null);
    setFace(null);
    setArtifacts(null);
    setNotes('');

    try {
      const payload = {
        model_name: selectedModel,
        category: selectedCategory,
        person_image_url: personImageUrl,
        garment_image_url: garmentImageUrl,
        garment_name: garmentName || `${selectedCategory} Item`,
        is_optimized: selectedModel.includes('Optimized'),
        configuration: {
          steps,
          guidance_scale: guidanceScale,
          mask_dilation_pct: maskDilation,
          auto_crop: autoCrop
        }
      };

      const res = await fetch('http://localhost:8000/api/v1/eval/run', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (!res.ok) {
        const errJson = await res.json();
        throw new Error(errJson.detail || 'Model execution failed');
      }

      const expData: ExperimentResponse = await res.json();
      setCurrentExp(expData);
    } catch (err: any) {
      setExecutionError(err.message || 'An error occurred during inference.');
    } finally {
      setIsRunning(false);
    }
  };

  const handleSaveEvaluation = async () => {
    if (!currentExp) return;

    if (
      fit === null ||
      drape === null ||
      texture === null ||
      pose === null ||
      body === null ||
      face === null ||
      artifacts === null
    ) {
      alert('Please evaluate and score all 7 dimensions (0-4) before saving.');
      return;
    }

    setIsSaving(true);
    try {
      const scorePayload = {
        fit_score: fit,
        drape_score: drape,
        texture_score: texture,
        pose_preservation_score: pose,
        body_preservation_score: body,
        face_preservation_score: face,
        artifact_score: artifacts,
        evaluator_notes: notes
      };

      const res = await fetch(
        `http://localhost:8000/api/v1/eval/experiments/${currentExp.id}/score`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(scorePayload)
        }
      );

      if (!res.ok) {
        const errJson = await res.json();
        throw new Error(errJson.detail || 'Failed to save score');
      }

      const updated: ExperimentResponse = await res.json();
      setCurrentExp(updated);
      setSaveMessage('Experiment evaluation successfully saved to SQLite database.');
      onExperimentSaved();
      setTimeout(() => setSaveMessage(null), 4000);
    } catch (err) {
      console.error(err);
    } finally {
      setIsSaving(false);
    }
  };

  const rubricDimensions = [
    { label: 'Fit', value: fit, setter: setFit },
    { label: 'Drape', value: drape, setter: setDrape },
    { label: 'Texture fidelity', value: texture, setter: setTexture },
    { label: 'Pose preservation', value: pose, setter: setPose },
    { label: 'Body preservation', value: body, setter: setBody },
    { label: 'Face preservation', value: face, setter: setFace },
    { label: 'Artifacts', value: artifacts, setter: setArtifacts }
  ];

  return (
    <div className="max-w-4xl mx-auto py-8 px-4 space-y-8 font-sans">
      {/* Header */}
      <div className="border-b border-gray-200 pb-4">
        <h1 className="text-xl font-bold text-gray-900 font-mono tracking-tight">
          VYBE
        </h1>
        <h2 className="text-base font-semibold text-gray-800">
          Vizzle × Virtual Try-On Benchmarking Engine
        </h2>
        <p className="text-xs text-gray-500 mt-1">
          Benchmarking SOTA Virtual Try-On models across 10 clothing categories for speed, cost and photorealistic fidelity.
        </p>
      </div>

      {/* Quick Presets Bar */}
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-3">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <span className="text-xs font-mono font-bold text-gray-600 uppercase">
            ⚡ Quick Manifest Presets:
          </span>
          <div className="flex items-center gap-2 flex-wrap">
            {PRESETS.map((p) => (
              <button
                key={p.name}
                onClick={() => handleApplyPreset(p)}
                className="px-2.5 py-1 text-xs font-mono font-semibold rounded bg-white hover:bg-blue-50 hover:text-blue-700 text-gray-700 border border-gray-300 transition-colors shadow-2xs"
              >
                {p.name} ({p.category})
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Two-Column Input Form */}
      <div className="bg-white border border-gray-200 rounded-lg p-6 space-y-6 shadow-xs">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Left: Person Image */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="block text-xs font-bold text-gray-700 uppercase font-mono">
                Person Image
              </label>
              <label className="cursor-pointer inline-block px-2.5 py-1 bg-gray-100 hover:bg-gray-200 text-gray-800 text-xs font-semibold rounded border border-gray-300">
                [ Upload Photo ]
                <input type="file" accept="image/*" className="hidden" onChange={handlePersonUpload} />
              </label>
            </div>

            <div className="w-full aspect-[3/4] max-h-72 bg-gray-50 border border-dashed border-gray-300 rounded overflow-hidden flex items-center justify-center p-2">
              {personImageUrl ? (
                <img
                  src={personImageUrl.startsWith('/data') ? `http://localhost:8000${personImageUrl}` : personImageUrl}
                  alt="Person"
                  className="w-full h-full object-contain"
                />
              ) : (
                <span className="text-xs text-gray-400">No person image selected</span>
              )}
            </div>
          </div>

          {/* Right: Garment Image */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="block text-xs font-bold text-gray-700 uppercase font-mono">
                Garment Image
              </label>
              <label className="cursor-pointer inline-block px-2.5 py-1 bg-gray-100 hover:bg-gray-200 text-gray-800 text-xs font-semibold rounded border border-gray-300">
                [ Upload Garment ]
                <input type="file" accept="image/*" className="hidden" onChange={handleGarmentUpload} />
              </label>
            </div>

            <div className="w-full aspect-[3/4] max-h-72 bg-gray-50 border border-dashed border-gray-300 rounded overflow-hidden flex items-center justify-center p-2">
              {garmentImageUrl ? (
                <img
                  src={garmentImageUrl.startsWith('/data') ? `http://localhost:8000${garmentImageUrl}` : garmentImageUrl}
                  alt="Garment"
                  className="w-full h-full object-contain"
                />
              ) : (
                <span className="text-xs text-gray-400">No garment image selected</span>
              )}
            </div>
          </div>
        </div>

        {/* Category & Model Selectors */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-gray-200">
          <div>
            <label className="block text-xs font-bold text-gray-700 uppercase font-mono mb-1">
              Garment Category (10 Mandated)
            </label>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full text-xs rounded border border-gray-300 p-2 font-mono"
            >
              <option value="">-- Select Category --</option>
              {REQUIRED_CATEGORIES.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-700 uppercase font-mono mb-1">
              VTON Model Candidate
            </label>
            <select
              value={selectedModel}
              onChange={(e) => setSelectedModel(e.target.value)}
              className="w-full text-xs rounded border border-gray-300 p-2 font-mono"
            >
              <option value="">-- Select Model Candidate --</option>
              {providers.map((p) => (
                <option key={p.model_name} value={p.model_name}>
                  {p.model_name} {p.status !== 'READY' ? `(${p.status})` : ''}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Advanced Settings Accordion */}
        <div className="border border-gray-200 rounded p-3 bg-gray-50/50">
          <button
            type="button"
            onClick={() => setShowAdvanced(!showAdvanced)}
            className="flex items-center justify-between w-full text-xs font-mono font-bold text-gray-700"
          >
            <span>⚙ Diffusion & Alignment Parameters</span>
            <span>{showAdvanced ? '▲ Collapse' : '▼ Expand'}</span>
          </button>

          {showAdvanced && (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-3 pt-3 border-t border-gray-200 text-xs">
              <div>
                <label className="block text-gray-600 font-mono text-[11px] mb-1">Inference Steps</label>
                <input
                  type="number"
                  value={steps}
                  onChange={(e) => setSteps(Number(e.target.value))}
                  className="w-full border rounded p-1 text-xs font-mono"
                  min={10}
                  max={60}
                />
              </div>
              <div>
                <label className="block text-gray-600 font-mono text-[11px] mb-1">Guidance Scale</label>
                <input
                  type="number"
                  step="0.1"
                  value={guidanceScale}
                  onChange={(e) => setGuidanceScale(Number(e.target.value))}
                  className="w-full border rounded p-1 text-xs font-mono"
                  min={1.0}
                  max={7.5}
                />
              </div>
              <div>
                <label className="block text-gray-600 font-mono text-[11px] mb-1">Mask Dilation (%)</label>
                <input
                  type="number"
                  value={maskDilation}
                  onChange={(e) => setMaskDilation(Number(e.target.value))}
                  className="w-full border rounded p-1 text-xs font-mono"
                  min={5}
                  max={35}
                />
              </div>
              <div className="flex items-center pt-4">
                <label className="flex items-center gap-2 cursor-pointer text-xs font-mono">
                  <input
                    type="checkbox"
                    checked={autoCrop}
                    onChange={(e) => setAutoCrop(e.target.checked)}
                    className="rounded"
                  />
                  Auto-Crop Canvas
                </label>
              </div>
            </div>
          )}
        </div>

        {/* Run Button */}
        <div>
          <button
            onClick={handleRunTryOn}
            disabled={isRunning}
            className="w-full py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-bold text-xs uppercase tracking-wider rounded font-mono transition-colors shadow-xs cursor-pointer"
          >
            {isRunning ? 'RUNNING INFERENCE & MEASURING TIMER...' : 'RUN VIRTUAL TRY-ON'}
          </button>
        </div>

        {executionError && (
          <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs font-mono rounded">
            <strong>Execution Rejected:</strong> {executionError}
          </div>
        )}
      </div>

      {/* Generated Result & Human Evaluation Section */}
      {currentExp && (
        <div className="bg-white border border-gray-200 rounded-lg p-6 space-y-6 shadow-xs">
          <div className="border-b border-gray-200 pb-3 flex items-center justify-between">
            <h2 className="text-sm font-bold text-gray-900 uppercase font-mono">
              Inference Output & Evaluation
            </h2>
            <span className="text-xs font-mono bg-green-100 text-green-800 px-2 py-0.5 rounded font-bold">
              {currentExp.generation_status.toUpperCase()}
            </span>
          </div>

          {/* Side-by-Side Verification */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-1">
              <span className="text-[11px] font-mono text-gray-500 uppercase font-bold">Input Person</span>
              <div className="aspect-[3/4] bg-gray-50 border border-gray-200 rounded overflow-hidden flex items-center justify-center">
                <img
                  src={personImageUrl?.startsWith('/data') ? `http://localhost:8000${personImageUrl}` : personImageUrl!}
                  alt="Person"
                  className="w-full h-full object-contain"
                />
              </div>
            </div>

            <div className="space-y-1">
              <span className="text-[11px] font-mono text-gray-500 uppercase font-bold">Input Garment</span>
              <div className="aspect-[3/4] bg-gray-50 border border-gray-200 rounded overflow-hidden flex items-center justify-center">
                <img
                  src={garmentImageUrl?.startsWith('/data') ? `http://localhost:8000${garmentImageUrl}` : garmentImageUrl!}
                  alt="Garment"
                  className="w-full h-full object-contain"
                />
              </div>
            </div>

            <div className="space-y-1">
              <span className="text-[11px] font-mono text-blue-700 uppercase font-bold">Generated Result</span>
              <div className="aspect-[3/4] bg-gray-50 border-2 border-blue-600 rounded overflow-hidden flex items-center justify-center">
                {currentExp.result_image_url ? (
                  <img
                    src={`http://localhost:8000${currentExp.result_image_url}`}
                    alt="Try-On Output"
                    className="w-full h-full object-contain"
                  />
                ) : (
                  <span className="text-xs text-gray-400">No output generated</span>
                )}
              </div>
            </div>
          </div>

          {/* Measured Metadata */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-gray-50 border border-gray-200 rounded p-3 text-xs font-mono">
            <div>
              <span className="text-gray-500 block text-[10px] uppercase">Model</span>
              <span className="font-bold text-gray-900">{currentExp.model_name}</span>
            </div>
            <div>
              <span className="text-gray-500 block text-[10px] uppercase">Measured Latency</span>
              <span className="font-bold text-blue-600">{currentExp.generation_time_sec}s</span>
            </div>
            <div>
              <span className="text-gray-500 block text-[10px] uppercase">Unit Cost</span>
              <span className="font-bold text-gray-900">
                ₹{currentExp.cost_inr.toFixed(2)} ({currentExp.cost_type})
              </span>
            </div>
            <div>
              <span className="text-gray-500 block text-[10px] uppercase">Category</span>
              <span className="font-bold text-gray-900">{currentExp.category}</span>
            </div>
          </div>

          {/* Human Evaluation Rubric (0 to 4 Scale) */}
          <div className="space-y-4 pt-4 border-t border-gray-200">
            <div>
              <h3 className="text-xs font-bold text-gray-900 uppercase font-mono">
                Human Evaluation Rubric (0 to 4 Scale)
              </h3>
              <p className="text-[11px] text-gray-500 mt-0.5">
                0 = Failed, 1 = Poor, 2 = Acceptable, 3 = Good, 4 = Excellent
              </p>
            </div>

            <div className="space-y-3">
              {rubricDimensions.map((dim) => (
                <div
                  key={dim.label}
                  className="flex flex-col sm:flex-row sm:items-center justify-between py-1.5 border-b border-gray-100 text-xs"
                >
                  <span className="font-mono text-gray-700 w-44">{dim.label}</span>
                  <div className="flex items-center space-x-4 mt-1 sm:mt-0">
                    {[0, 1, 2, 3, 4].map((score) => (
                      <label
                        key={score}
                        className="flex items-center space-x-1 cursor-pointer font-mono"
                      >
                        <input
                          type="radio"
                          name={`rubric-${dim.label}`}
                          value={score}
                          checked={dim.value === score}
                          onChange={() => dim.setter(score)}
                          className="text-blue-600"
                        />
                        <span>{score}</span>
                      </label>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            {/* Notes */}
            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase font-mono mb-1">
                Evaluator Notes & Observations
              </label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Document observed fabric drape, neckline boundary alignment, or texture artifacts..."
                rows={2}
                className="w-full text-xs rounded border border-gray-300 p-2 font-mono"
              />
            </div>

            {/* Save Experiment */}
            <div className="flex items-center justify-between pt-2">
              <button
                onClick={handleSaveEvaluation}
                disabled={isSaving}
                className="px-6 py-2.5 bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white font-bold text-xs uppercase tracking-wider rounded font-mono transition-colors cursor-pointer"
              >
                {isSaving ? 'SAVING...' : 'SAVE EXPERIMENT'}
              </button>

              {currentExp.overall_score !== null && (
                <div className="text-xs font-mono font-bold text-gray-800">
                  Overall Score: <span className="text-blue-600">{currentExp.overall_score} / 4.0</span>
                </div>
              )}
            </div>

            {saveMessage && (
              <div className="p-2.5 bg-green-50 border border-green-200 text-green-800 text-xs font-mono rounded">
                ✓ {saveMessage}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
