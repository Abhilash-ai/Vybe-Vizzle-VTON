import {
  Garment,
  TryOnJob,
  TryOnOptions,
  GeneratedLook,
  Outfit,
  User,
  BenchmarkHubResponse,
  CategoryInfo
} from '../types';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1';

class ApiClient {
  private token: string | null = localStorage.getItem('vizzle_auth_token');

  public setToken(token: string | null) {
    this.token = token;
    if (token) {
      localStorage.setItem('vizzle_auth_token', token);
    } else {
      localStorage.removeItem('vizzle_auth_token');
    }
  }

  public getToken(): string | null {
    return this.token;
  }

  private getHeaders(isFormData: boolean = false): HeadersInit {
    const headers: HeadersInit = {};
    if (!isFormData) {
      headers['Content-Type'] = 'application/json';
    }
    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }
    return headers;
  }

  // Health & Providers
  async getHealth() {
    const res = await fetch(`${API_BASE_URL}/health`);
    return res.json();
  }

  async getProviders() {
    const res = await fetch(`${API_BASE_URL}/providers`);
    return res.json();
  }

  // Auth
  async guestLogin(): Promise<{ access_token: string; user: User; is_guest: boolean }> {
    const res = await fetch(`${API_BASE_URL}/auth/guest`, {
      method: 'POST',
      headers: this.getHeaders()
    });
    const data = await res.json();
    if (data.access_token) {
      this.setToken(data.access_token);
    }
    return data;
  }

  async login(email: string, password: string): Promise<{ access_token: string; user: User }> {
    const res = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify({ email, password })
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.detail || 'Login failed');
    }
    const data = await res.json();
    if (data.access_token) {
      this.setToken(data.access_token);
    }
    return data;
  }

  async register(email: string, password: string, full_name?: string): Promise<{ access_token: string; user: User }> {
    const res = await fetch(`${API_BASE_URL}/auth/register`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify({ email, password, full_name })
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.detail || 'Registration failed');
    }
    const data = await res.json();
    if (data.access_token) {
      this.setToken(data.access_token);
    }
    return data;
  }

  async getMe(): Promise<User> {
    const res = await fetch(`${API_BASE_URL}/auth/me`, {
      headers: this.getHeaders()
    });
    if (!res.ok) throw new Error('Not authenticated');
    return res.json();
  }

  // File Uploads
  async uploadPersonImage(file: File): Promise<{ url: string; filename: string }> {
    const formData = new FormData();
    formData.append('file', file);
    const res = await fetch(`${API_BASE_URL}/tryon/upload-person`, {
      method: 'POST',
      headers: this.getHeaders(true),
      body: formData
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.detail || 'Image upload failed');
    }
    return res.json();
  }

  async uploadGarment(file: File, name?: string, category?: string, color?: string): Promise<Garment> {
    const formData = new FormData();
    formData.append('file', file);
    if (name) formData.append('name', name);
    if (category) formData.append('category', category);
    if (color) formData.append('color', color);

    const res = await fetch(`${API_BASE_URL}/garments/upload`, {
      method: 'POST',
      headers: this.getHeaders(true),
      body: formData
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.detail || 'Garment upload failed');
    }
    return res.json();
  }

  // Try-On Engine
  async submitTryOnJob(params: {
    person_image_url: string;
    garment_image_url: string;
    garment_category: string;
    garment_name?: string;
    provider?: string;
    options?: TryOnOptions;
  }): Promise<TryOnJob> {
    const res = await fetch(`${API_BASE_URL}/tryon`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify(params)
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.detail || 'Failed to submit try-on job');
    }
    return res.json();
  }

  async getTryOnJob(jobId: string): Promise<TryOnJob> {
    const res = await fetch(`${API_BASE_URL}/tryon/${jobId}`, {
      headers: this.getHeaders()
    });
    if (!res.ok) throw new Error('Job not found');
    return res.json();
  }

  async listRecentJobs(): Promise<TryOnJob[]> {
    const res = await fetch(`${API_BASE_URL}/tryon`, {
      headers: this.getHeaders()
    });
    return res.json();
  }

  // Garments & Wardrobe
  async getCategories(): Promise<CategoryInfo[]> {
    const res = await fetch(`${API_BASE_URL}/garments/categories`);
    return res.json();
  }

  async listGarments(category?: string): Promise<Garment[]> {
    const url = category && category !== 'all'
      ? `${API_BASE_URL}/garments?category=${encodeURIComponent(category)}`
      : `${API_BASE_URL}/garments`;
    const res = await fetch(url, { headers: this.getHeaders() });
    return res.json();
  }

  async createGarment(garment: Partial<Garment>): Promise<Garment> {
    const res = await fetch(`${API_BASE_URL}/garments`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify(garment)
    });
    return res.json();
  }

  async deleteGarment(id: string): Promise<void> {
    await fetch(`${API_BASE_URL}/garments/${id}`, {
      method: 'DELETE',
      headers: this.getHeaders()
    });
  }

  // Saved Looks
  async listLooks(favoriteOnly: boolean = false): Promise<GeneratedLook[]> {
    const url = favoriteOnly ? `${API_BASE_URL}/looks?favorite_only=true` : `${API_BASE_URL}/looks`;
    const res = await fetch(url, { headers: this.getHeaders() });
    return res.json();
  }

  async saveLook(look: Partial<GeneratedLook>): Promise<GeneratedLook> {
    const res = await fetch(`${API_BASE_URL}/looks`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify(look)
    });
    return res.json();
  }

  async toggleFavoriteLook(id: string): Promise<GeneratedLook> {
    const res = await fetch(`${API_BASE_URL}/looks/${id}/favorite`, {
      method: 'PATCH',
      headers: this.getHeaders()
    });
    return res.json();
  }

  async deleteLook(id: string): Promise<void> {
    await fetch(`${API_BASE_URL}/looks/${id}`, {
      method: 'DELETE',
      headers: this.getHeaders()
    });
  }

  // Outfits
  async listOutfits(): Promise<Outfit[]> {
    const res = await fetch(`${API_BASE_URL}/outfits`, { headers: this.getHeaders() });
    return res.json();
  }

  async createOutfit(outfit: Partial<Outfit>): Promise<Outfit> {
    const res = await fetch(`${API_BASE_URL}/outfits`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify(outfit)
    });
    return res.json();
  }

  async deleteOutfit(id: string): Promise<void> {
    await fetch(`${API_BASE_URL}/outfits/${id}`, {
      method: 'DELETE',
      headers: this.getHeaders()
    });
  }

  // Benchmarks
  async getBenchmarkHub(): Promise<BenchmarkHubResponse> {
    const res = await fetch(`${API_BASE_URL}/benchmarks`, { headers: this.getHeaders() });
    return res.json();
  }

  // Privacy & User
  async wipeUserData(): Promise<{ status: string; message: string; deleted_images_count: number }> {
    const res = await fetch(`${API_BASE_URL}/user/privacy/wipe-all`, {
      method: 'POST',
      headers: this.getHeaders()
    });
    return res.json();
  }

  async updateProfile(data: { full_name?: string; avatar_url?: string }): Promise<User> {
    const res = await fetch(`${API_BASE_URL}/user/profile`, {
      method: 'PUT',
      headers: this.getHeaders(),
      body: JSON.stringify(data)
    });
    return res.json();
  }
}

export const api = new ApiClient();
