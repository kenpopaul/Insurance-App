import api from "./axios";
import type { Policy, CreatePolicyDto } from "../types/index";

export const policiesApi = {
  getAll: () => api.get<Policy[]>("/api/policies").then((r) => r.data),
  getById: (id: number) =>
    api.get<Policy>(`/api/policies/${id}`).then((r) => r.data),
  getByClientId: (clientId: number) =>
    api.get<Policy[]>(`/api/policies/client/${clientId}`).then((r) => r.data),
  create: (dto: CreatePolicyDto) =>
    api.post<Policy>("/api/policies", dto).then((r) => r.data),
  update: (id: number, dto: Partial<CreatePolicyDto & { isActive: boolean }>) =>
    api.put<Policy>(`/api/policies/${id}`, dto).then((r) => r.data),
  delete: (id: number) => api.delete(`/api/policies/${id}`),
};
