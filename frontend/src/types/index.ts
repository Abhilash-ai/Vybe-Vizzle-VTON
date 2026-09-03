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
  created_at: string;
  model_name: string;
  provider: string;
  category: string;
  person_image_url: string;
  garment_image_url: string;
  garment_name?: string;
  result_image_url?: string;
  status: string;
  error_message?: string;
  generation_time_sec: number;
  cost_inr: number;
  meets_time_req: boolean;
  meets_cost_req: boolean;
  fit_score?: number;
  drape_score?: number;
  texture_score?: number;
  artifact_score?: number;
  face_score?: number;
  body_score?: number;
  overall_score?: number;
  meets_accuracy_req?: boolean;
  is_optimized: boolean;
  optimization_technique?: string;
  notes?: string;
}

export interface MatrixCell {
  model_name: string;
  category: string;
  experiment_id?: string;
  generation_time_sec?: number;
  cost_inr?: number;
  accuracy_score?: number;
  meets_all_reqs?: boolean;
  result_image_url?: string;
  tested: boolean;
}

export interface BenchmarkMatrixResponse {
  categories: string[];
  models: string[];
  matrix: Record<string, Record<string, MatrixCell>>;
  summary_rankings: Array<{
    model: string;
    avg_accuracy_score: number;
    avg_generation_time_sec: number;
    cost_per_gen_inr: number;
    categories_passed: string;
    license: string;
    meets_time_constraint: boolean;
    meets_cost_constraint: boolean;
    recommendation_status: string;
  }>;
}
