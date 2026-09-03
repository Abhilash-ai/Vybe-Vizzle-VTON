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
      .then((data) => setProviders(data))
      .catch((err) => console.error(err));
  }, []);

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
      alert('Please upload a person image first.');
      return;
    }
    if (!garmentImageUrl) {
      alert('Please upload a garment image first.');
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
    setSaveMessage(null);

    try {
      const res = await fetch('http://localhost:8000/api/v1/eval/run', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model_name: selectedModel,
          category: selectedCategory,
          person_image_url: personImageUrl,
          garment_image_url: garmentImageUrl,
          garment_name: garmentName || `${selectedCategory} Apparel`,
          is_optimized: selectedModel.includes('Optimized')
        })
      });

      if (!res.ok) {
        const errJson = await res.json();
        throw new Error(errJson.detail || 'Inference execution failed');
      }

      const expData: ExperimentResponse = await res.json();
      setCurrentExp(expData);

      // Reset rubric scores to unselected state
      setFit(null);
      setDrape(null);
      setTexture(null);
      setPose(null);
      setBody(null);
      setFace(null);
      setArtifacts(null);
      setNotes('');

      onExperimentSaved();
    } catch (err: any) {
      setExecutionError(err.message || 'Model execution error');
      console.error(err);
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
      alert('Please select a score (0 to 4) for all 7 evaluation rubric dimensions.');
      return;
    }

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
    { label: 'Fit', value: fit, setter: setFit },
    { label: 'Drape', value: drape, setter: setDrape },
    { label: 'Texture fidelity', value: texture, setter: setTexture },
    { label: 'Pose preservation', value: pose, setter: setPose },
    { label: 'Body preservation', value: body, setter: setBody },
    { label: 'Face preservation', value: face, setter: setFace },
    { label: 'Artifacts', value: artifacts, setter: setArtifacts }
  ];

  return (
    <div className="max-w-3xl mx-auto py-8 px-4 space-y-8 font-sans">
      {/* Header */}
      <div className="border-b border-gray-200 pb-4">
        <h1 className="text-xl font-bold text-gray-900 font-mono tracking-tight">
          VYBE
        </h1>
        <h2 className="text-base font-semibold text-gray-800">
          Vizzle × Virtual Try-On Benchmarking Engine
        </h2>
        <p className="text-xs text-gray-500 mt-1">
          Evaluate VTON models across clothing categories for accuracy, speed and cost.
        </p>
      </div>

      {/* Two-Column Input Form */}
      <div className="bg-white border border-gray-200 rounded-lg p-6 space-y-6 shadow-sm">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Left: Person Image */}
          <div className="space-y-3">
            <label className="block text-xs font-bold text-gray-700 uppercase font-mono">
              Person Image
            </label>

            <div>
              <label className="cursor-pointer inline-block px-3 py-2 bg-gray-100 hover:bg-gray-200 text-gray-800 text-xs font-semibold rounded border border-gray-300">
                [ Upload Person Image ]
                <input type="file" accept="image/*" className="hidden" onChange={handlePersonUpload} />
              </label>
            </div>

            <div className="w-full aspect-[3/4] max-h-64 bg-gray-50 border border-dashed border-gray-300 rounded overflow-hidden flex items-center justify-center p-2">
              {personImageUrl ? (
                <img src={personImageUrl} alt="Uploaded Person" className="w-full h-full object-contain" />
              ) : (
                <span className="text-xs text-gray-400">No person image uploaded</span>
              )}
            </div>
          </div>

          {/* Right: Garment Image */}
          <div className="space-y-3">
            <label className="block text-xs font-bold text-gray-700 uppercase font-mono">
              Garment Image
            </label>

            <div>
              <label className="cursor-pointer inline-block px-3 py-2 bg-gray-100 hover:bg-gray-200 text-gray-800 text-xs font-semibold rounded border border-gray-300">
                [ Upload Garment Image ]
                <input type="file" accept="image/*" className="hidden" onChange={handleGarmentUpload} />
              </label>
            </div>

            <div className="w-full aspect-[3/4] max-h-64 bg-gray-50 border border-dashed border-gray-300 rounded overflow-hidden flex items-center justify-center p-2">
              {garmentImageUrl ? (
                <img src={garmentImageUrl} alt="Uploaded Garment" className="w-full h-full object-contain" />
              ) : (
                <span className="text-xs text-gray-400">No garment image uploaded</span>
              )}
            </div>
          </div>
        </div>

        {/* Category & Model Selectors */}
        <div className="space-y-4 pt-4 border-t border-gray-200">
          <div>
            <label className="block text-xs font-bold text-gray-700 uppercase font-mono mb-1">
              Garment Category
            </label>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full text-xs rounded border border-gray-300 p-2 font-mono"
            >
              <option value="">-- Select Category (10 Mandated) --</option>
              {REQUIRED_CATEGORIES.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-700 uppercase font-mono mb-1">
              VTON Model
            </label>
            <select
              value={selectedModel}
              onChange={(e) => setSelectedModel(e.target.value)}
              className="w-full text-xs rounded border border-gray-300 p-2 font-mono"
            >
              <option value="">-- Select VTON Model Candidate --</option>
              {providers.map((p) => (
                <option key={p.model_name} value={p.model_name}>
                  {p.model_name} {p.status !== 'READY' ? `(${p.status})` : ''}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Run Button */}
        <div>
          <button
            onClick={handleRunTryOn}
            disabled={isRunning}
            className="w-full py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-bold text-xs uppercase tracking-wider rounded font-mono transition-colors"
          >
            {isRunning ? 'RUNNING INFERENCE & MEASURING TIMER...' : 'RUN VIRTUAL TRY-ON'}
          </button>
        </div>

        {executionError && (
          <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs font-mono rounded">
            <strong>Inference Unavailable:</strong> {executionError}
          </div>
        )}
      </div>

      {/* Result Area (Appears ONLY after real execution) */}
      {currentExp && (
        <div className="bg-white border border-gray-200 rounded-lg p-6 space-y-6 shadow-sm">
          <div className="border-b border-gray-200 pb-2">
            <h3 className="text-sm font-bold text-gray-900 uppercase font-mono">
              Result
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
            <div className="w-full aspect-[3/4] max-h-80 bg-gray-100 border border-gray-300 rounded overflow-hidden flex items-center justify-center">
              <img
                src={currentExp.result_image_url || ''}
                alt="Generated VTON Result"
                className="w-full h-full object-contain"
              />
            </div>

            <div className="space-y-3 text-xs font-mono bg-gray-50 p-4 border border-gray-200 rounded">
              <div>
                <span className="text-gray-500">Model: </span>
                <span className="font-bold text-gray-900">{currentExp.model_name}</span>
              </div>

              <div>
                <span className="text-gray-500">Category: </span>
                <span className="font-bold text-gray-900">{currentExp.category}</span>
              </div>

              <div>
                <span className="text-gray-500">Generation time: </span>
                <span className="font-bold text-blue-700">{currentExp.generation_time_sec.toFixed(3)} seconds</span>
              </div>

              <div>
                <span className="text-gray-500">Cost: </span>
                <span className="font-bold text-gray-900">₹{currentExp.cost_inr.toFixed(2)} INR ({currentExp.cost_type})</span>
              </div>

              <div>
                <span className="text-gray-500">Status: </span>
                <span className="font-bold uppercase text-green-700">{currentExp.generation_status}</span>
              </div>
            </div>
          </div>

          {/* Evaluation Scoring Form */}
          <div className="border-t border-gray-200 pt-6 space-y-4">
            <h4 className="text-xs font-bold text-gray-900 uppercase font-mono">
              Evaluation (Human Score Required)
            </h4>

            <div className="space-y-2 font-mono text-xs">
              {rubricDimensions.map((dim) => (
                <div key={dim.label} className="flex items-center justify-between p-2 rounded bg-gray-50 border border-gray-200">
                  <span className="font-semibold text-gray-800">{dim.label}</span>
                  <div className="flex space-x-3">
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
                        <span className="text-xs">{num}</span>
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
                placeholder="Observed fit quality, drape distortions, or boundary artifacts..."
                className="w-full text-xs font-mono rounded border border-gray-300 p-2"
              />
            </div>

            <div className="flex items-center justify-between pt-2">
              <button
                onClick={handleSaveEvaluation}
                disabled={isSaving}
                className="px-5 py-2.5 bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white text-xs font-bold font-mono uppercase rounded"
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
