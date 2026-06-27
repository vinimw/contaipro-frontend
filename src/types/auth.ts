import type { User } from "@/types/user";

export type RegisterInput = {
  name: string;
  email: string;
  phone: string;
};

export type LoginInput = {
  email: string;
  password: string;
};

export type PasswordSetupInput = {
  token: string;
  password: string;
  password_confirmation: string;
};

export type AuthSession = {
  access_token: string;
  token_type?: string;
  user?: User;
};
