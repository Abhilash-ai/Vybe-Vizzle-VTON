import React, { useState, useEffect } from 'react';
import { SAMPLE_MODELS, SAMPLE_GARMENTS } from '../services/sampleData';
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

interface TestPageProps {
  onExperimentSaved: () => void;
}

export const TestPage: React.FC<TestPageProps> = ({ onExperimentSaved }) => {
  // Input selections
  const [selectedPersonUrl, setSelectedPersonUrl] = useState<string>(SAMPLE_MODELS[0].image_url);
  const [selectedGarmentUrl, setSelectedGarmentUrl] = useState<string>(SAMPLE_GARMENTS[4].image_url);
  const [garmentName, setGarmentName] = useState<string>(SAMPLE_GARMENTS[4].name);
  const [selectedCategory, setSelectedCategory] = useState<string>('Saree');
  const [selectedModel, setSelectedModel] = useState<string>('CatVTON');

  // Provider configuration check
  const [providers, setProviders] = useState<ProviderStatusInfo[]>([]);

  // Inference state
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [currentExp, setCurrentExp] = useState<ExperimentResponse | null>(null);
  const [executionError, setExecutionError] = useState<string | null>(null);

  // Human evaluation rubric (0 to 4 scale, unassigned initially)
  const [fit, setFit] = useState<number>(3);
  const [drape, setDrape] = useState<number>(3);
  const [texture, setTexture] = useState<number>(3);
  const [pose, setPose] = useState<number>(3);
  const [body, setBody] = useState<number>(3);
  const [face, setFace] = useState<number>(3);
  const [artifacts, setArtifacts] = useState<number>(3);
  const [notes, setNotes] = useState<string>('');
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [saveMessage, setSaveMessage] = useState<string | null>(null);

  useEffect(() => {
    fetch('http://localhost:8000/api/v1/eval/providers')
      .then((res) => res.json())
      .then((data) => setProviders(data))
      .catch((err) => console.error(err));
  }, []);

  const handlePersonFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const formData = new FormData();
      formData.append('file', e.target.files[0]);
      try {
        const res = await fetch('http://localhost:8000/api/v1/tryon/upload-person', {
          method: 'POST',
          body: formData
        });
        const json = await res.json();
        setSelectedPersonUrl(json.url);
      } catch (err) {
        console.error(err);
      }
    }
  };

  const handleGarmentFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const formData = new FormData();
      formData.append('file', e.target.files[0]);
      formData.append('name', 'Uploaded Garment');
      formData.append('category', selectedCategory.toLowerCase());
      try {
        const res = await fetch('http://localhost:8000/api/v1/garments/upload', {
          method: 'POST',
          body: formData
        });
        const json = await res.json();
        setSelectedGarmentUrl(json.image_url);
        setGarmentName(json.name);
      } catch (err) {
        console.error(err);
      }
    }
  };

  const handleRunTryOn = async () => {
    setIsRunning(true);
    setExecutionError(null);
    setSaveMessage(null);

    try {
      const res = await fetch('http://localhost:8000/api/v1/eval/run', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model_name: selectedModel,
          category: selectedCategory,
          person_image_url: selectedPersonUrl,
          garment_image_url: selectedGarmentUrl,
          garment_name: garmentName,
          is_optimized: selectedModel.includes('Optimized'),
          optimization_technique: selectedModel.includes('Optimized')
            ? 'Adaptive Full-Body Mask Dilation & Collar Preservation'
            : undefined
        })
      });

      if (!res.ok) {
        const errJson = await res.json();
        throw new Error(errJson.detail || 'Inference failed');
      }

      const expData: ExperimentResponse = await res.json();
      setCurrentExp(expData);
      onExperimentSaved();
    } catch (err: any) {
      setExecutionError(err.message || 'Execution error');
      console.error(err);
    } finally {
      setIsRunning(false);
    }
  };

  const handleSaveEvaluation = async () => {
    if (!currentExp) return;
    setIsSaving(true);
    try {
      const res = await fetch(`http://localhost:8000/api/v1/eval/experiments/${currentExp.id}/score`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fit_score: fit,
          drape_score: drape,
          texture_score: texture,
          pose_preservation_score: pose,
          body_preservation_score: body,
          face_preservation_score: face,
          artifact_score: artifacts,
          evaluator_notes: notes
        })
      });
      const updated: ExperimentResponse = await res.json();
      setCurrentExp(updated);
      setSaveMessage('Experiment evaluation successfully saved to database.');
      onExperimentSaved();
      setTimeout(() => setSaveMessage(null), 4000);
    } catch (err) {
      console.error(err);
    } finally {
      setIsSaving(false);
    }
  };

  const rubricDimensions = [
    { label: 'Fit', value: fit, setter: setFit, desc: 'Anatomical fitting to model body' },
    { label: 'Drape', value: drape, setter: setDrape, desc: 'Natural garment flow, folds & gravity fall' },
    { label: 'Texture fidelity', value: texture, setter: setTexture, desc: 'Preservation of fabric material, weave & patterns' },
    { label: 'Pose preservation', value: pose, setter: setPose, desc: 'Model posture & limb orientation consistency' },
    { label: 'Body preservation', value: body, setter: setBody, desc: 'Natural body proportions & silhouette contour' },
    { label: 'Face preservation', value: face, setter: setFace, desc: 'Model facial identity, head & skin tone alignment' },
    { label: 'Artifacts', value: artifacts, setter: setArtifacts, desc: 'Quality (4 = Zero artifacts, 0 = Severe distortion)' }
  ];

  return (
    <div className="max-w-4xl mx-auto py-8 px-4 space-y-8">
      {/* Header */}
      <div className="border-b border-gray-200 pb-4">
        <h1 className="text-xl font-bold text-gray-900 font-mono tracking-tight">
          VIZZLE
        </h1>
        <h2 className="text-lg font-semibold text-gray-800">
          Virtual Try-On Model Evaluation
        </h2>
        <p className="text-xs text-gray-500 mt-1">
          Evaluate VTON models across clothing categories for accuracy, speed and cost.
        </p>
      </div>

      {/* Primary Test Input Form */}
      <div className="bg-white border border-gray-200 rounded-lg p-6 space-y-6 shadow-sm">
        {/* Two-Column Upload / Select Area */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Left: Person Image */}
          <div className="space-y-3">
            <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider font-mono">
              Person Image
            </label>

            <div className="flex gap-2">
              <label className="cursor-pointer px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-800 text-xs font-semibold rounded border border-gray-300">
                Upload Person Image
                <input type="file" accept="image/*" className="hidden" onChange={handlePersonFileUpload} />
              </label>

              <select
                value={selectedPersonUrl}
                onChange={(e) => setSelectedPersonUrl(e.target.value)}
                className="flex-1 text-xs rounded border border-gray-300 px-2 py-1"
              >
                {SAMPLE_MODELS.map((m) => (
                  <option key={m.id} value={m.image_url}>
                    {m.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Preview */}
            <div className="w-full aspect-[3/4] max-h-72 bg-gray-50 border border-gray-200 rounded overflow-hidden flex items-center justify-center">
              {selectedPersonUrl ? (
                <img src={selectedPersonUrl} alt="Person Input" className="w-full h-full object-contain" />
              ) : (
                <span className="text-xs text-gray-400">No person image selected</span>
              )}
            </div>
          </div>

          {/* Right: Garment Image */}
          <div className="space-y-3">
            <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider font-mono">
              Garment Image
            </label>

            <div className="flex gap-2">
              <label className="cursor-pointer px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-800 text-xs font-semibold rounded border border-gray-300">
                Upload Garment Image
                <input type="file" accept="image/*" className="hidden" onChange={handleGarmentFileUpload} />
              </label>

              <select
                value={selectedGarmentUrl}
                onChange={(e) => {
                  const url = e.target.value;
                  setSelectedGarmentUrl(url);
                  const g = SAMPLE_GARMENTS.find((item) => item.image_url === url);
                  if (g) setGarmentName(g.name);
                }}
                className="flex-1 text-xs rounded border border-gray-300 px-2 py-1"
              >
                {SAMPLE_GARMENTS.map((g) => (
                  <option key={g.id} value={g.image_url}>
                    {g.name} ({g.category})
                  </option>
                ))}
              </select>
            </div>

            {/* Preview */}
            <div className="w-full aspect-[3/4] max-h-72 bg-gray-50 border border-gray-200 rounded overflow-hidden flex items-center justify-center p-2">
              {selectedGarmentUrl ? (
                <img src={selectedGarmentUrl} alt="Garment Input" className="w-full h-full object-contain" />
              ) : (
                <span className="text-xs text-gray-400">No garment image selected</span>
              )}
            </div>
          </div>
        </div>

        {/* Category and Model Selectors */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-gray-200">
          <div>
            <label className="block text-xs font-bold text-gray-700 uppercase font-mono mb-1">
              Garment Category (10 Mandated)
            </label>
            <select
              value={selectedCategory}
              onChange={(e) => {
                const cat = e.target.value;
                setSelectedCategory(cat);
                const match = SAMPLE_GARMENTS.find((g) => g.category.toLowerCase() === cat.toLowerCase());
                if (match) {
                  setSelectedGarmentUrl(match.image_url);
                  setGarmentName(match.name);
                }
              }}
              className="w-full text-xs font-semibold rounded border border-gray-300 p-2"
            >
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
              className="w-full text-xs font-mono rounded border border-gray-300 p-2"
            >
              <option value="CatVTON">CatVTON (Apache 2.0 · Self-Hosted GPU)</option>
              <option value="IDM-VTON (Baseline)">IDM-VTON Baseline (CC-BY-NC-SA 4.0)</option>
              <option value="IDM-VTON (Optimized)">IDM-VTON Optimized (Adaptive Mask Dilation)</option>
              <option value="OOTDiffusion">OOTDiffusion (OpenRAIL-M · Cloud Serverless)</option>
              <option value="FASHN API (Commercial)">FASHN API (Commercial Cloud API)</option>
              <option value="Local Baseline (CPU)">Local Baseline (CPU Offline Test Harness)</option>
            </select>
          </div>
        </div>

        {/* Run Button */}
        <div className="pt-2">
          <button
            onClick={handleRunTryOn}
            disabled={isRunning}
            className="w-full py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-bold text-sm uppercase tracking-wider rounded transition-colors font-mono"
          >
            {isRunning ? 'RUNNING INFERENCE & MEASURING TIMING...' : 'RUN VIRTUAL TRY-ON'}
          </button>
        </div>

        {executionError && (
          <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs font-mono rounded">
            Error: {executionError}
          </div>
        )}
      </div>

      {/* Result Area */}
      {currentExp && (
        <div className="bg-white border border-gray-200 rounded-lg p-6 space-y-6 shadow-sm">
          <div className="border-b border-gray-200 pb-3">
            <h3 className="text-sm font-bold text-gray-900 uppercase font-mono tracking-wider">
              Result
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
            {/* Generated Image */}
            <div className="w-full aspect-[3/4] max-h-96 bg-gray-100 border border-gray-300 rounded overflow-hidden flex items-center justify-center">
              <img
                src={currentExp.result_image_url || currentExp.person_image_path}
                alt="Generated VTON Result"
                className="w-full h-full object-contain"
              />
            </div>

            {/* Execution Metadata */}
            <div className="space-y-4 text-xs font-mono">
              <div className="bg-gray-50 border border-gray-200 rounded p-4 space-y-2">
                <div className="flex justify-between border-b border-gray-200 pb-1">
                  <span className="text-gray-500 font-semibold">Model:</span>
                  <span className="font-bold text-gray-900">{currentExp.model_name}</span>
                </div>

                <div className="flex justify-between border-b border-gray-200 pb-1">
                  <span className="text-gray-500 font-semibold">Category:</span>
                  <span className="font-bold text-gray-900">{currentExp.category}</span>
                </div>

                <div className="flex justify-between border-b border-gray-200 pb-1">
                  <span className="text-gray-500 font-semibold">Generation time:</span>
                  <span className="font-bold text-blue-700">
                    {currentExp.generation_time_sec.toFixed(3)} seconds
                  </span>
                </div>

                <div className="flex justify-between border-b border-gray-200 pb-1">
                  <span className="text-gray-500 font-semibold">Cost:</span>
                  <span className="font-bold text-gray-900">
                    ₹{currentExp.cost_inr.toFixed(2)} INR ({currentExp.cost_type})
                  </span>
                </div>

                <div className="flex justify-between">
                  <span className="text-gray-500 font-semibold">Status:</span>
                  <span className={`font-bold uppercase ${
                    currentExp.generation_status === 'completed' ? 'text-green-700' : 'text-red-700'
                  }`}>
                    {currentExp.generation_status === 'completed' ? 'Success' : 'Failed'}
                  </span>
                </div>
              </div>

              <div className="text-[11px] text-gray-500">
                Experiment ID: <span className="font-mono text-gray-700">{currentExp.id}</span>
              </div>
            </div>
          </div>

          {/* Human Accuracy Evaluation Form */}
          <div className="border-t border-gray-200 pt-6 space-y-4">
            <div>
              <h4 className="text-xs font-bold text-gray-900 uppercase font-mono tracking-wider">
                Evaluation (Human Evaluator Rubric)
              </h4>
              <p className="text-[11px] text-gray-500 mt-0.5 font-mono">
                Scale: 0 = Failed, 1 = Poor, 2 = Acceptable, 3 = Good, 4 = Excellent
              </p>
            </div>

            <div className="space-y-3 font-mono text-xs">
              {rubricDimensions.map((dim) => (
                <div key={dim.label} className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-2 rounded bg-gray-50 border border-gray-200">
                  <div>
                    <span className="font-bold text-gray-800">{dim.label}</span>
                    <span className="text-[10px] text-gray-400 block sm:inline sm:ml-2">({dim.desc})</span>
                  </div>

                  <div className="flex items-center space-x-3">
                    {[0, 1, 2, 3, 4].map((num) => (
                      <label key={num} className="inline-flex items-center space-x-1 cursor-pointer">
                        <input
                          type="radio"
                          name={`score-${dim.label}`}
                          value={num}
                          checked={dim.value === num}
                          onChange={() => dim.setter(num)}
                          className="text-blue-600 focus:ring-blue-500"
                        />
                        <span className="text-xs font-bold">{num}</span>
                      </label>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 font-mono uppercase mb-1">
                Notes
              </label>
              <textarea
                rows={2}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Observed fit quality, drape distortions, pallu truncation, or boundary artifacts..."
                className="w-full text-xs font-mono rounded border border-gray-300 p-2"
              />
            </div>

            <div className="flex items-center justify-between pt-2">
              <button
                onClick={handleSaveEvaluation}
                disabled={isSaving}
                className="px-5 py-2.5 bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white text-xs font-bold font-mono uppercase rounded transition-colors"
              >
                {isSaving ? 'SAVING...' : 'SAVE EXPERIMENT'}
              </button>

              {saveMessage && (
                <span className="text-xs font-mono text-green-700 font-semibold">
                  {saveMessage}
                </span>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
