class LootopiaAPI {
  private baseURL: string;
  private token: string | null;
  constructor(baseURL = "http://localhost:3001") {
    this.baseURL = baseURL;
    this.token = localStorage.getItem("lootopia_token");
  }
  setToken(token: string) {
    this.token = token;
    localStorage.setItem("lootopia_token", token);
  }
  clearToken() {
    this.token = null;
    localStorage.removeItem("lootopia_token");
  }
  private async request(endpoint: string, options: RequestInit = {}) {
    const url = `${this.baseURL}${endpoint}`;
    const config: RequestInit = {
      headers: {
        "Content-Type": "application/json",
        ...(this.token && { Authorization: `Bearer ${this.token}` }),
        ...options.headers,
      },
      ...options,
    };
    try {
      const response = await fetch(url, config);
      let data;
      const contentType = response.headers.get("content-type");
      if (contentType && contentType.includes("application/json")) {
        data = await response.json();
      } else {
        data = { message: await response.text() };
      }
      if (!response.ok) {
        throw new Error(
          data.error ||
            data.message ||
            `HTTP ${response.status}: ${response.statusText}`
        );
      }
      return data;
    } catch (error) {
      if (error instanceof TypeError && error.message.includes("fetch")) {
        throw new Error(
          "Network error: Unable to connect to server. Please check your internet connection."
        );
      }
      throw error;
    }
  }
  async register(userData: {
    email: string;
    password: string;
    pseudo: string;
    lastName?: string;
    surName?: string;
  }) {
    const response = await this.request("/api/auth/register", {
      method: "POST",
      body: JSON.stringify(userData),
    });
    this.setToken(response.token);
    return response;
  }
  async login(credentials: { email: string; password: string }) {
    const response = await this.request("/api/auth/login", {
      method: "POST",
      body: JSON.stringify(credentials),
    });
    this.setToken(response.token);
    return response;
  }
  async getUserProfile() {
    return this.request("/api/users/profile");
  }
  async updateUserProfile(profileData: {
    lastName?: string;
    surName?: string;
    pseudo?: string;
  }) {
    return this.request("/api/users/profile", {
      method: "PUT",
      body: JSON.stringify(profileData),
    });
  }
  async getUserTreasureHunts() {
    return this.request("/api/users/treasure-hunts");
  }
  async getUserArtefacts() {
    return this.request("/api/users/artefacts");
  }
  async getUserCrownBalance() {
    return this.request("/api/users/crown-balance");
  }
  async getTreasureHunts(page = 1, limit = 10) {
    return this.request(`/api/treasure-hunts?page=${page}&limit=${limit}`);
  }
  async getTreasureHunt(id: string) {
    return this.request(`/api/treasure-hunts/${id}`);
  }
  async createTreasureHunt(huntData: {
    name: string;
    description?: string;
    entry_cost?: number;
    crown_reward?: number;
    steps: Array<{
      title: string;
      description: string;
      validation_type: string;
      validation_value: string;
      order: number;
    }>;
  }) {
    return this.request("/api/treasure-hunts", {
      method: "POST",
      body: JSON.stringify(huntData),
    });
  }
  async joinTreasureHunt(huntId: string) {
    return this.request(`/api/treasure-hunts/${huntId}/join`, {
      method: "POST",
    });
  }
  async getStepsForHunt(huntId: string) {
    return this.request(`/api/steps/treasure-hunt/${huntId}`);
  }
  async createStep(stepData: {
    treasure_hunt_id: string;
    title: string;
    description: string;
    validation_type: string;
    validation_value: string;
    order: number;
  }) {
    return this.request("/api/steps", {
      method: "POST",
      body: JSON.stringify(stepData),
    });
  }
  async updateStep(
    stepId: string,
    stepData: {
      title?: string;
      description?: string;
      order?: number;
    }
  ) {
    return this.request(`/api/steps/${stepId}`, {
      method: "PUT",
      body: JSON.stringify(stepData),
    });
  }
  async deleteStep(stepId: string) {
    return this.request(`/api/steps/${stepId}`, {
      method: "DELETE",
    });
  }
  async completeStep(stepId: string, huntId: string, validationData: unknown) {
    return this.request("/api/steps/complete", {
      method: "POST",
      body: JSON.stringify({
        step_id: stepId,
        treasure_hunt_id: huntId,
        validation_data: validationData,
      }),
    });
  }
  async getUserCompletedSteps(huntId: string) {
    return this.request(`/api/steps/completed/${huntId}`);
  }
  async completeHunt(huntId: string) {
    return this.request(`/api/treasure-hunts/${huntId}/complete`, {
      method: "POST",
    });
  }
  async getUserCompletedHunts() {
    return this.request("/api/treasure-hunts/user/completed");
  }
  async getHuntProgress(huntId: string) {
    return this.request(`/api/treasure-hunts/${huntId}/progress`);
  }
  async getMarketplaceItems(
    page = 1,
    limit = 20,
    filters?: {
      rarity?: string;
      minPrice?: number;
      maxPrice?: number;
    }
  ) {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
    });
    if (filters) {
      if (filters.rarity) params.append("rarity", filters.rarity);
      if (filters.minPrice !== undefined)
        params.append("minPrice", filters.minPrice.toString());
      if (filters.maxPrice !== undefined)
        params.append("maxPrice", filters.maxPrice.toString());
    }
    return this.request(`/api/marketplace?${params.toString()}`);
  }
  async getMyMarketplaceListings() {
    return this.request("/api/marketplace/my-listings");
  }
  async listArtefactForSale(userArtefactId: string, price: number) {
    return this.request("/api/marketplace/list", {
      method: "POST",
      body: JSON.stringify({
        user_artefact_id: userArtefactId,
        price,
      }),
    });
  }
  async purchaseMarketplaceItem(itemId: string) {
    return this.request(`/api/marketplace/purchase/${itemId}`, {
      method: "POST",
    });
  }
  async cancelMarketplaceListing(itemId: string) {
    return this.request(`/api/marketplace/cancel/${itemId}`, {
      method: "DELETE",
    });
  }
  async getCrownTransactions(page = 1, limit = 20) {
    return this.request(
      `/api/marketplace/transactions?page=${page}&limit=${limit}`
    );
  }
  async getUserDigAttempts() {
    return this.request("/api/dig-attempts/user");
  }
  async getDigAttemptsForHunt(huntId: string) {
    return this.request(`/api/dig-attempts/treasure-hunt/${huntId}`);
  }
  async makeDigAttempt(huntId: string, latitude: number, longitude: number) {
    return this.request("/api/dig-attempts", {
      method: "POST",
      body: JSON.stringify({
        treasure_hunt_id: huntId,
        latitude,
        longitude,
      }),
    });
  }
  async getReviewsForHunt(huntId: string) {
    return this.request(`/api/reviews/treasure-hunt/${huntId}`);
  }
  async createReview(reviewData: {
    treasure_hunt_id: string;
    rating: number;
    comment?: string;
  }) {
    return this.request("/api/reviews", {
      method: "POST",
      body: JSON.stringify(reviewData),
    });
  }
  async updateReview(
    reviewId: string,
    reviewData: {
      rating?: number;
      comment?: string;
    }
  ) {
    return this.request(`/api/reviews/${reviewId}`, {
      method: "PUT",
      body: JSON.stringify(reviewData),
    });
  }
  async deleteReview(reviewId: string) {
    return this.request(`/api/reviews/${reviewId}`, {
      method: "DELETE",
    });
  }
  async getRewards() {
    return this.request("/api/rewards");
  }
  async getReward(id: string) {
    return this.request(`/api/rewards/${id}`);
  }
  async getArtefacts() {
    return this.request("/api/artefacts");
  }
  async getArtefact(id: string) {
    return this.request(`/api/artefacts/${id}`);
  }
  async createArtefact(artefactData: {
    name: string;
    description: string;
    rarity: string;
    image_url?: string;
    effect?: string;
    base_value?: number;
    is_tradeable?: boolean;
  }) {
    return this.request("/api/artefacts", {
      method: "POST",
      body: JSON.stringify(artefactData),
    });
  }
}
export const api = new LootopiaAPI();
export default api;
