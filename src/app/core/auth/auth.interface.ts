export interface LoginRequest {
  user_email: string;
  user_password: string;
}

export interface LoginResponse {
  message: string;
  token?: string;
  user?: AuthUser;
  data?: {
    token?: string;
    user?: AuthUser;
  };
}

export interface AuthUser {
  user_id: number;
  user_first_name: string;
  user_last_name: string;
  user_email: string;
  user_role: 'administrador' | 'operador';
  active?: boolean;
}

export interface UserMeResponse {
  message: string;
  data?: AuthUser;
}
