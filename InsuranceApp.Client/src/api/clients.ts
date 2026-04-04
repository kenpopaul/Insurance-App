import api from "./axios";
import type { Client, CreateClientDto } from "../types/index";

export const clientsApi = {
  getAll: () => api.get<Client[]>("/api/clients").then((r) => r.data),
  getById: (id: number) =>
    api.get<Client>(`/api/clients/${id}`).then((r) => r.data),
  create: (dto: CreateClientDto) =>
    api.post<Client>("/api/clients", dto).then((r) => r.data),
  update: (id: number, dto: Partial<CreateClientDto>) =>
    api.put<Client>(`/api/clients/${id}`, dto).then((r) => r.data),
  delete: (id: number) => api.delete(`/api/clients/${id}`),
};
