import { api, unwrapRequest } from "@/lib/api";
import type { User } from "@/types/user";

export const userService = {
  getMe() {
    return unwrapRequest<User>(api.get("/users/me"));
  },
  updateProfile(input: Pick<User, "name">) {
    return unwrapRequest<User>(api.patch("/users/me", input));
  },
  updatePassword(input: {
    current_password: string;
    new_password: string;
    new_password_confirmation: string;
  }) {
    return unwrapRequest(api.patch("/users/me/password", input));
  },
};
