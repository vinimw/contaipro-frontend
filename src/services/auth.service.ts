import { api, unwrapRequest } from "@/lib/api";
import type {
  AuthSession,
  LoginInput,
  PasswordSetupInput,
  RegisterInput,
} from "@/types/auth";
import type { User } from "@/types/user";

export const authService = {
  register(input: RegisterInput) {
    return unwrapRequest(api.post("/auth/register", input));
  },
  confirmEmail(token: string) {
    return unwrapRequest(api.post("/auth/confirm-email", { token }));
  },
  setPassword(input: PasswordSetupInput) {
    return unwrapRequest(api.post("/auth/set-password", input));
  },
  login(input: LoginInput) {
    return unwrapRequest<AuthSession>(api.post("/auth/login", input));
  },
  me() {
    return unwrapRequest<User>(api.get("/auth/me"));
  },
};
