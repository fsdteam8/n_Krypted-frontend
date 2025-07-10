const BASE_URL = `${process.env.NEXT_PUBLIC_API_URL}`;
// const token =
//   "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJfaWQiOiI2ODBjNjU0ZDQxNTZiMWE2ZDIwMWVmZTkiLCJpYXQiOjE3NDU3Mjk3OTMsImV4cCI6MTc0NjMzNDU5M30._OnQBwQEQg5M49_TqsA0yNqp4WnSUTrg7r9w4EHTfYQ";

export interface ApiResponse<T> {
  status: boolean | string;
  message: string;
  data?: T;
  results?: number;
  total?: number;
  page?: number;
  totalPages?: number;
  currentPage?: number;
}

class ApiService {
  private token: string | null = null;

  setToken(token: string) {
    this.token = token;
  }
  private async request<T>(
    endpoint: string,
    method = "GET",
    /* eslint-disable @typescript-eslint/no-explicit-any */
    data?: any
  ): Promise<ApiResponse<T>> {
    const url = `${BASE_URL}${endpoint}`;

    // console.log(this.token, "token");

    const headers: HeadersInit = {
      Authorization: `Bearer ${this.token}`,
    };

    if (!(data instanceof FormData) && method !== "GET") {
      headers["Content-Type"] = "application/json";
    }

    const config: RequestInit = {
      method,
      headers,
    };

    if (data) {
      if (data instanceof FormData) {
        config.body = data;
      } else if (method !== "GET") {
        config.body = JSON.stringify(data);
      }
    }

    try {
      const response = await fetch(url, config);
      const result = await response.json();
      return result;
    } catch (error) {
      console.error("API request failed:", error);
      throw error;
    }
  }

  // User Profile
  async getUserProfile(id: string) {
    return this.request(`/profile/get/${id}`);
  }

  async updateUserProfile(id: string, data: FormData) {
    return this.request(`/profile/update/${id}`, "PUT", data);
  }

  async changePassword(
    id: string,
    data: {
      currentPassword: string;
      newPassword: string;
      confirmPassword: string;
    }
  ) {
    return this.request(`/profile/password/${id}`, "PUT", data);
  }

  // About Us
  async createAboutUs(data: FormData) {
    return this.request("/aboutus/create", "POST", data);
  }

  async updateAboutUs(id: string, data: FormData) {
    return this.request(`/aboutus/update/${id}`, "PUT", data);
  }

  async getAboutUs() {
    return this.request("/aboutus/get");
  }

  // Privacy Policy
  async createPolicy(data: { text: string }) {
    return this.request("/policy/create", "POST", data);
  }

  async updatePolicy(id: string, data: { text: string }) {
    return this.request(`/policy/update/${id}`, "PUT", data);
  }

  async getPolicy() {
    return this.request("/policy/get");
  }

  // Terms & Conditions
  async createTerms(data: { text: string }) {
    return this.request("/terms/create", "POST", data);
  }

  async updateTerms(id: string, data: { text: string }) {
    return this.request(`/terms/update/${id}`, "PUT", data);
  }

  async getTerms() {
    return this.request("/terms/get");
  }

  // Auctions
  async getAllAuctions() {
    return this.request("/auctions/get-all-auctions");
  }

  async getActiveAuctions() {
    return this.request("/admin/auctions/active");
  }

  async getPendingAuctions() {
    return this.request("/admin/auctions/pending");
  }

  async getScheduledAuctions() {
    return this.request("/admin/auctions/scheduled");
  }

  async getEndedAuctions() {
    return this.request("/admin/auctions/ended");
  }

  async acceptAuction(id: string) {
    return this.request(`/admin/auctions/${id}/accept`, "POST");
  }

  async rejectAuction(id: string) {
    return this.request(`/admin/auctions/${id}/reject`, "POST");
  }

  async deleteAuction(id: string) {
    return this.request(`/admin/auctions/${id}`, "DELETE");
  }

  // Bidders
  async getAllBidders() {
    return this.request("/bids/all");
  }

  async getTopBidders() {
    return this.request("/bids/top-bidders");
  }

  async deleteBidder(id: string) {
    return this.request(`/bids/delete/${id}`, "DELETE");
  }

  // Categories
  async getAllCategories() {
    return this.request("/admin/categories/all");
  }

  async createCategory(data: FormData) {
    return this.request("/admin/categories/", "POST", data);
  }

  async updateCategory(id: string, data: FormData) {
    return this.request(`/admin/categories/update/${id}`, "PUT", data);
  }

  async deleteCategory(id: string) {
    return this.request(`/admin/categories/delate/${id}`, "DELETE");
  }

  // Blogs
  async getAllBlogs() {
    return this.request("/api/blog?page=1&limit=10");
  }

  // async getBlogDetails(id: string) {
  //   return this.request(`/api/blog/${id}`);
  // }

  async createBlog(data: FormData) {
    return this.request("/api/blog", "POST", data);
  }

  async updateBlog(id: string, data: FormData) {
    return this.request(`/api/blog/${id}`, "PUT", data);
  }

  async deleteBlog(id: string) {
    return this.request(`/api/blog/${id}`, "DELETE");
  }

  // async getBlogComments(id: string) {
  //   return this.request(`/admin/blogs/get-comment/${id}`);
  // }

  // async deleteBlogComment(blogId: string, commentId: string) {
  //   return this.request(`/admin/blogs/delete/${blogId}/${commentId}`, "DELETE");
  // }

  // Sellers
  async getAllSellers() {
    return this.request("/admin/get-sellers");
  }

  async deleteSeller(id: string) {
    return this.request(`/admin/delete-seller/${id}`, "DELETE");
  }
}

export const apiService = new ApiService();
