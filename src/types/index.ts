export interface User {
  userId: string;
  email: string;
  fullName: string;
  role: string;
  tenantId: string;
  tenantName?: string;
}

export interface Project {
  projectId: string;
  projectName: string;
  projectCode: string;
  status: string;
  startDate: string;
  endDate: string;
  budget: number;
  location?: string;
}

export interface LoginResponse {
  success: boolean;
  data: {
    accessToken: string;
    tokenType: string;
    expiresIn: string;
    user: User;
  };
  message: string;
}
