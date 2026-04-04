import api from "./axios";
import type { Claim, CreateClaimDto } from "../types/index";

export const claimsApi = {
  getAll: () => api.get<Claim[]>("/api/claims").then((r) => r.data),
  getById: (id: number) =>
    api.get<Claim>(`/api/claims/${id}`).then((r) => r.data),
  getByPolicyId: (policyId: number) =>
    api.get<Claim[]>(`/api/claims/policy/${policyId}`).then((r) => r.data),
  create: (dto: CreateClaimDto) =>
    api.post<Claim>("/api/claims", dto).then((r) => r.data),
  update: (id: number, dto: Partial<CreateClaimDto & { status: string }>) =>
    api.put<Claim>(`/api/claims/${id}`, dto).then((r) => r.data),
  delete: (id: number) => api.delete(`/api/claims/${id}`),
};
