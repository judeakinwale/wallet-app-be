export interface APIResponse<T> {
  count?: number;
  success: boolean;
  data?: T | null;
  message?: string;
  errors?: any[];
  pagination?: {
    total: number;
    page: number;
    limit: number;
    next?: string; // next endpoint
    prev?: string; // prev endpoint
  };
}

export interface ReqUser {
  id: number;
  email: string;
  roles: string[];
}

export interface ReqWithUser extends Request {
  user: ReqUser;
}
