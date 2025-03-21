export namespace ApiResponse {
  export interface FieldError {
    field: string;
    message: string;
  }

  export interface Response<T = null> {
    success: boolean;
    message: string;
    data?: T;
    errors?: FieldError[];
    display?: boolean;
  }
}

export interface PasswordFormProps {
  formData?: {
    id?: number;
    user_id?: number;
    service: string;
    username: string;
    password: string;
    score?: number;
    strength?: string;
  };
  onActionComplete: (value: boolean) => void;
}

export type ToastType = "success" | "info" | "warning" | "error";

export interface ToastProps {
  badge: ToastType;
  title: string;
  message: string;
  errors?: string[];
  duration?: number;
}

export type PasswordSearchParams = {
  searchParams: { [key: string]: string | string[] | undefined };
};

export type PasswordModel = {
  id: number;
  user_id?: string;
  service: string;
  username: string;
  password: string;
  score: number;
  strength: string;
  last_update: Date;
  sharedTeams: string[];
};
