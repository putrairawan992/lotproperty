const API_URL_FROM_ENV = (import.meta.env.VITE_API_BASE_URL || "").trim();

function resolveBaseUrl(): string {
  // Explicit env var always takes priority (e.g. VITE_API_BASE_URL=https://api.lotproperty.id)
  if (API_URL_FROM_ENV) return API_URL_FROM_ENV;

  // Fallback: same-origin /api (works with Vercel rewrites or nginx reverse proxy)
  return `${typeof window !== "undefined" ? window.location.origin : ""}/api`;
}

const BASE_URL = resolveBaseUrl();

// Helper to get stored auth token
export function getAuthToken(): string | null {
  return localStorage.getItem("lotproperty-auth-token");
}

// Helper to save auth token
export function setAuthToken(token: string) {
  localStorage.setItem("lotproperty-auth-token", token);
  localStorage.setItem("lotproperty-auth-token-timestamp", Date.now().toString());
}

// Helper to clear auth token
export function clearAuthToken() {
  localStorage.removeItem("lotproperty-auth-token");
  localStorage.removeItem("lotproperty-auth-token-timestamp");
}

// Base fetch request wrapper
async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const headers = new Headers(options.headers || {});
  
  // Set default content type
  if (!headers.has("Content-Type") && !(options.body instanceof FormData)) {
    headers.set("Content-Type", "application/json");
  }

  // Set auth header
  const token = getAuthToken();
  if (token) {
    headers.set("Authorization", `Bearer ${token}`);
  }

  const response = await fetch(`${BASE_URL}${path}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    const errBody = await response.json().catch(() => ({}));
    throw new Error(errBody.error || `Request failed with status ${response.status}`);
  }

  // Handle empty responses
  if (response.status === 204) {
    return {} as T;
  }

  return response.json();
}

// API Endpoints
export const api = {
  // Authentication
  auth: {
    login: async (email: string, password: string) => {
      const data = await request<{ token: string; user: { id: number; name: string; email: string; role: string } }>("/auth/login", {
        method: "POST",
        body: JSON.stringify({ email, password }),
      });
      setAuthToken(data.token);
      return data;
    },
    register: (payload: any) => {
      return request("/auth/register", {
        method: "POST",
        body: JSON.stringify(payload),
      });
    },
    uploadProfilePhoto: async (file: File) => {
      const formData = new FormData();
      formData.append("file", file);
      return request<{ message: string; photo_url: string }>("/auth/upload-profile-photo", {
        method: "POST",
        body: formData,
      });
    },
    forgotPassword: (email: string) => {
      return request("/auth/forgot-password", {
        method: "POST",
        body: JSON.stringify({ email }),
      });
    },
    getRegistrationStatus: (email: string) => {
      return request<{ status: "Pending" | "Active" | "Suspended" | "Unknown" }>("/auth/registration-status", {
        method: "POST",
        body: JSON.stringify({ email }),
      });
    },
    getMe: () => {
      return request<any>("/auth/me");
    },
    logout: () => {
      clearAuthToken();
    }
  },

  // Dashboard & Profile
  dashboard: {
    getSummary: () => request<any>("/dashboard/summary"),
    getWeeklyLeaderboard: () => request<any[]>("/leaderboard/weekly"),
    getHof: () => request<any[]>("/hof"),
  },

  profile: {
    getProfile: (slugOrID: string) => request<any>(`/profile/${slugOrID}`),
    updateFeaturedBadges: (badgeCodes: string[]) => {
      return request("/profile/featured-badges", {
        method: "PUT",
        body: JSON.stringify({ badges: badgeCodes }),
      });
    },
    updatePhoto: async (file: File) => {
      const formData = new FormData();
      formData.append("file", file);
      return request<{ message: string; photo_url: string }>("/profile/photo", {
        method: "PUT",
        body: formData,
      });
    },
  },

  // Quests
  quests: {
    getStatus: () => request<any>("/quests/status"),
    markAttendance: () => request<any>("/quests/attendance", { method: "POST" }),
    submitContent: (url: string) => {
      return request<any>("/quests/content", {
        method: "POST",
        body: JSON.stringify({ url }),
      });
    },
    submitPromotion: (url: string) => {
      return request<any>("/quests/promotion", {
        method: "POST",
        body: JSON.stringify({ url }),
      });
    }
  },

  // Attendance
  attendance: {
    getStatus: () => request<any>("/attendance/status"),
    checkIn: () => request<any>("/attendance/checkin", { method: "POST" }),
    submitQr: (code: string) => {
      return request<any>("/attendance/qr", {
        method: "POST",
        body: JSON.stringify({ code }),
      });
    },
    submitScan: (code: string) => {
      return request<any>("/attendance/scan", {
        method: "POST",
        body: JSON.stringify({ code }),
      });
    },
    joinMeeting: (meetingUrl: string) => {
      return request<any>("/attendance/meeting", {
        method: "POST",
        body: JSON.stringify({ meeting_url: meetingUrl }),
      });
    },
  },

  // Listings CRM
  listings: {
    getList: (filters: { status?: string; property_type?: string; search?: string } = {}) => {
      const params = new URLSearchParams();
      if (filters.status) params.append("status", filters.status);
      if (filters.property_type) params.append("property_type", filters.property_type);
      if (filters.search) params.append("search", filters.search);
      
      const query = params.toString() ? `?${params.toString()}` : "";
      return request<any>(`/listings${query}`);
    },
    create: (payload: any) => {
      return request<any>("/listings", {
        method: "POST",
        body: JSON.stringify(payload),
      });
    },
    update: (id: number | string, status: string) => {
      return request<any>(`/listings/${id}`, {
        method: "PUT",
        body: JSON.stringify({ status }),
      });
    }
  },

  // Prospects CRM
  prospects: {
    getList: (filters: { next_action?: string; search?: string } = {}) => {
      const params = new URLSearchParams();
      if (filters.next_action) params.append("next_action", filters.next_action);
      if (filters.search) params.append("search", filters.search);
      
      const query = params.toString() ? `?${params.toString()}` : "";
      return request<any[]>(`/prospects${query}`);
    },
    create: (payload: any) => {
      return request<any>("/prospects", {
        method: "POST",
        body: JSON.stringify(payload),
      });
    },
    update: (id: number | string, payload: any) => {
      return request<any>(`/prospects/${id}`, {
        method: "PUT",
        body: JSON.stringify(payload),
      });
    }
  },

  // Academy
  academy: {
    getModules: () => request<any[]>("/academy"),
    completeModule: (id: number | string) => {
      return request<any>(`/academy/${id}/complete`, { method: "POST" });
    }
  },

  // Notifications
  notifications: {
    getList: () => request<any[]>("/notifications"),
    markRead: (id: number | string) => {
      return request<any>(`/notifications/${id}/read`, { method: "PUT" });
    },
    markAllRead: () => {
      return request<any>("/notifications/read-all", { method: "PUT" });
    },
  },

  // Events
  events: {
    getList: () => request<any[]>("/events"),
    getDetail: (id: number | string) => request<any>(`/events/${id}/detail`),
    submit: (id: number | string, url: string) => {
      return request<any>(`/events/${id}/submit`, {
        method: "POST",
        body: JSON.stringify({ submission_url: url }),
      });
    }
  },

  // Board (FJB)
  board: {
    getPosts: () => request<any[]>("/board/posts"),
    createPost: (payload: { category: "WTB" | "WTR" | "INFO"; content: string }) => {
      return request<any>("/board/posts", {
        method: "POST",
        body: JSON.stringify(payload),
      });
    },
    deletePost: (id: number | string) => request<any>(`/board/posts/${id}`, { method: "DELETE" }),
  },

  // Help Center
  help: {
    getSubmissions: () => request<{ feedback: any[]; pindah_dp: any[] }>("/help/submissions"),
    submitFeedback: (payload: { type: string; subject: string; message: string }) => {
      return request<any>("/help/feedback", {
        method: "POST",
        body: JSON.stringify(payload),
      });
    },
    submitPindahDP: (payload: { client_name: string; unit_awal: string; unit_baru: string; amount: string; reason: string }) => {
      return request<any>("/help/pindah-dp", {
        method: "POST",
        body: JSON.stringify(payload),
      });
    },
  },

  // Public guest endpoints (no auth token needed)
  public: {
    getWeeklyLeaderboard: () => request<any[]>("/public/leaderboard/weekly"),
    getHof: () => request<any[]>("/public/hof"),
    getEvents: () => request<any[]>("/public/events"),
    getBoardPosts: () => request<any[]>("/public/board/posts"),
    getAcademyModules: () => request<any[]>("/public/academy"),
    getAgentsMinimal: () => request<Array<{ id: number; name: string }>>("/public/agents/minimal"),
  },

  // Admin Panel
  admin: {
    getHelpSubmissions: () => request<any[]>("/admin/help/submissions"),
    updateHelpSubmissionStatus: (id: number | string, status: string) => {
      return request<any>(`/admin/help/submissions/${id}/status`, { method: "PUT", body: JSON.stringify({ status }) });
    },
    getAgents: () => request<any[]>("/admin/agents"),
    getAgentsTree: () => request<any>("/admin/agents/tree"),
    getHof: (period?: string) => {
      const params = new URLSearchParams();
      if (period) params.append("period", period);
      const query = params.toString() ? `?${params.toString()}` : "";
      return request<any[]>(`/admin/hof${query}`);
    },
    updateAgentStatus: (id: number | string, action: "approve" | "suspend" | "reactivate") => {
      return request<any>(`/admin/agents/${id}/status?action=${action}`, { method: "POST" });
    },
    updateAgent: (id: number | string, payload: { name?: string; email?: string; password?: string; role?: string; mentor_id?: number | null }) => {
      return request<any>(`/admin/agents/${id}`, { method: "PUT", body: JSON.stringify(payload) });
    },
    deleteAgent: (id: number | string) => {
      return request<any>(`/admin/agents/${id}`, { method: "DELETE" });
    },
    addRecruit: (payload: any) => {
      return request<any>("/admin/recruits", {
        method: "POST",
        body: JSON.stringify(payload),
      });
    },
    addHof: (payload: any) => {
      return request<any>("/admin/hof", {
        method: "POST",
        body: JSON.stringify(payload),
      });
    },
    createEvent: (payload: any) => {
      return request<any>("/admin/events", {
        method: "POST",
        body: JSON.stringify(payload),
      });
    },
    updateEvent: (id: number | string, payload: any) => {
      return request<any>(`/admin/events/${id}`, {
        method: "PUT",
        body: JSON.stringify(payload),
      });
    },
    deleteEvent: (id: number | string) => {
      return request<any>(`/admin/events/${id}`, {
        method: "DELETE",
      });
    },
    uploadEventBanner: (file: File) => {
      const formData = new FormData();
      formData.append("file", file);
      return request<any>("/admin/events/upload-banner", {
        method: "POST",
        body: formData,
        headers: {}, // Let browser set Content-Type for FormData
      });
    },
    createAcademyModule: (payload: any) => {
      return request<any>("/admin/academy", {
        method: "POST",
        body: JSON.stringify(payload),
      });
    },
    updateAcademyModule: (id: number | string, payload: any) => {
      return request<any>(`/admin/academy/${id}`, {
        method: "PUT",
        body: JSON.stringify(payload),
      });
    },
    deleteAcademyModule: (id: number | string) => {
      return request<any>(`/admin/academy/${id}`, { method: "DELETE" });
    },
    getEventSubmissions: () => request<any[]>("/admin/event-submissions"),
    reviewEventSubmission: (id: number | string, status: "Approved" | "Rejected", rejectReason: string = "") => {
      return request<any>(`/admin/event-submissions/${id}/review`, {
        method: "PUT",
        body: JSON.stringify({ status, reject_reason: rejectReason }),
      });
    },
    getCommissions: () => request<any[]>("/admin/commissions"),
    reviewCommission: (id: number | string, status: "Approved" | "Rejected", rejectReason: string = "") => {
      return request<any>(`/admin/commissions/${id}/review`, {
        method: "PUT",
        body: JSON.stringify({ status, reject_reason: rejectReason }),
      });
    },
    xpAdjust: (agentId: number | string, amount: number, reason: string) => {
      return request<any>("/admin/xp-adjust", {
        method: "POST",
        body: JSON.stringify({ agent_id: Number(agentId), amount, reason }),
      });
    },
    getLogs: () => request<any[]>("/admin/logs"),
  }
};
