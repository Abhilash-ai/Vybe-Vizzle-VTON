export type GarmentCategory =
  | 't-shirt'
  | 'shirt'
  | 'hoodie'
  | 'jacket'
  | 'dress'
  | 'saree'
  | 'kurti'
  | 'lehenga'
  | 'pants'
  | 'skirt'
  | 'jumpsuit'
  | 'coat'
  | 'jeans'
  | 'trousers'
  | 'other';

export type PageType =
  | 'evaluation'
  | 'landing'
  | 'studio'
  | 'result'
  | 'looks'
  | 'outfit-builder'
  | 'wardrobe'
  | 'explore'
  | 'benchmarks'
  | 'profile'
  | 'how-it-works';

export interface Garment {
  id: string;
  user_id?: string;
  name: string;
  category: GarmentCategory | string;
  sub_category?: string;
  color?: string;
  brand?: string;
  image_url: string;
  thumbnail_url?: string;
  description?: string;
  is_sample: boolean;
  created_at?: string;
}

export interface PersonModel {
  id: string;
  name: string;
  gender: 'female' | 'male' | 'unisex';
  image_url: string;
  description: string;
}

export interface TryOnOptions {
  preserve_face: boolean;
  preserve_background: boolean;
  garment_fit: 'tight' | 'regular' | 'loose';
  generation_quality: 'standard' | 'high' | 'ultra';
  seed?: number;
}

export interface TryOnJob {
  id: string;
  user_id?: string;
  provider: string;
  model_name?: string;
  person_image_url: string;
  garment_image_url: string;
  garment_category: string;
  status: 'queued' | 'processing' | 'completed' | 'failed';
  progress: number;
  current_step: string;
  result_image_url?: string;
  error_message?: string;
  latency_ms?: number;
  created_at: string;
  completed_at?: string;
}

export interface GeneratedLook {
  id: string;
  user_id?: string;
  tryon_job_id?: string;
  title?: string;
  person_image_url: string;
  garment_image_url: string;
  result_image_url: string;
  garment_name?: string;
  garment_category?: string;
  provider?: string;
  generation_time_ms?: number;
  notes?: string;
  is_favorite: boolean;
  created_at: string;
}

export interface Outfit {
  id: string;
  user_id?: string;
  title: string;
  description?: string;
  garment_ids: string[];
  garments?: Garment[];
  preview_image_url?: string;
  created_at: string;
}

export interface User {
  id: string;
  email: string;
  full_name?: string;
  avatar_url?: string;
  is_guest: boolean;
  created_at: string;
}

export interface BenchmarkModel {
  provider: string;
  model_name: string;
  architecture: string;
  license_type: string;
  is_commercial_safe: boolean;
  status: 'active' | 'available_with_key' | 'not_installed' | 'offline_demo';
  typical_latency_sec: string;
  resolution: string;
  vram_required_gb?: number;
  estimated_cost_per_image: string;
  garment_categories_supported: string[];
  face_preservation_score?: number;
  garment_alignment_score?: number;
  environment_status_note: string;
}

export interface SystemHardwareInfo {
  os: string;
  python_version: string;
  cpu_count: number;
  torch_available: boolean;
  cuda_available: boolean;
  cuda_device_name?: string;
  gpu_memory_gb?: number;
  vton_provider_active: string;
  demo_mode: boolean;
}

export interface BenchmarkHubResponse {
  system: SystemHardwareInfo;
  models: BenchmarkModel[];
  recent_benchmark_logs: Array<{
    id: string;
    provider: string;
    model_name: string;
    latency_ms: number;
    success: boolean;
    resolution: string;
    timestamp?: string;
  }>;
}

export interface CategoryInfo {
  id: GarmentCategory | string;
  name: string;
  type: string;
  description: string;
}

export interface ExperimentResponse {
  id: string;
  timestamp: string;
  model_name: string;
  provider_type: string;
  provider_status: string;
  category: string;
  person_image_path: string;
  garment_image_path: string;
  garment_name?: string;
  result_image_url?: string;
  generation_status: string;
  error_message?: string;
  duration_ms: number;
  generation_time_sec: number;
  cost_inr: number;
  cost_type: string;
  cost_calculation_basis?: string;
  meets_time_req: boolean;
  meets_cost_req: boolean;
  fit_score?: number | null;
  drape_score?: number | null;
  texture_score?: number | null;
  pose_preservation_score?: number | null;
  body_preservation_score?: number | null;
  face_preservation_score?: number | null;
  artifact_score?: number | null;
  overall_score?: number | null;
  is_evaluated: boolean;
  evaluator_notes?: string | null;
  is_optimized: boolean;
  optimization_technique?: string | null;
}

export interface MatrixCellResponse {
  model_name: string;
  category: string;
  experiment_id?: string;
  generation_time_sec?: number;
  cost_inr?: number;
  cost_type?: string;
  accuracy_score?: number | null;
  meets_all_reqs?: boolean;
  result_image_url?: string;
  is_evaluated: boolean;
  tested: boolean;
}

export interface SummaryRankingItem {
  model: string;
  tests_completed: number;
  avg_accuracy_score?: number | null;
  avg_generation_time_sec?: number | null;
  avg_cost_inr?: number | null;
  cost_type: string;
  categories_passed: string;
  passed_count: number;
  license: string;
  meets_time_constraint: boolean;
  meets_cost_constraint: boolean;
  production_verdict: string;
}

export interface BenchmarkMatrixResponse {
  categories: string[];
  models: string[];
  total_experiments_recorded: number;
  matrix: Record<string, Record<string, MatrixCellResponse>>;
  summary_rankings: SummaryRankingItem[];
  has_data: boolean;
}

export interface ManifestValidationItem {
  test_id: string;
  category: string;
  person_image: string;
  garment_image: string;
  garment_name: string;
  description: string;
  person_exists: boolean;
  garment_exists: boolean;
  is_valid: boolean;
}

export interface DatasetValidationResponse {
  total_test_cases: number;
  valid_test_cases: number;
  missing_test_cases: number;
  dataset_status: string;
  items: ManifestValidationItem[];
}

export interface ProviderStatusInfo {
  model_name: string;
  provider_type: string;
  status: string;
  license: string;
  is_commercial_safe: boolean;
  architecture: string;
  pricing_model: string;
  environment_note: string;
  experiments_recorded: number;
}
