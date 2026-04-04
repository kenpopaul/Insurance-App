import api from "./axios";
import type { AuthResponse } from "../types/index";

export const authApi = {
  register: (dto: {
    firstName: string;
    lastName: string;
    email: string;
    password: string;
  }) => api.post<AuthResponse>("/api/auth/register", dto).then((r) => r.data),
  login: (dto: { email: string; password: string }) =>
    api.post<AuthResponse>("/api/auth/login", dto).then((r) => r.data),
};
