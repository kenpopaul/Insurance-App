export interface Client {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  address: string;
  dateOfBirth: string;
  createdAt: string;
  totalPolicies: number;
  totalClaims: number;
  riskLevel: "Low" | "Medium" | "High" | "Critical";
}

export interface Policy {
  id: number;
  policyNumber: string;
  type: string;
  premium: number;
  startDate: string;
  endDate: string;
  isActive: boolean;
  createdAt: string;
  clientId: number;
  clientName: string;
  claimCount: number;
}

export interface Claim {
  id: number;
  description: string;
  amount: number;
  status: string;
  claimDate: string;
  policyId: number;
  policyNumber: string;
}

export interface AuthResponse {
  token: string;
  email: string;
  firstName: string;
  lastName: string;
}

export interface CreateClientDto {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  address: string;
  dateOfBirth: string;
}

export interface CreatePolicyDto {
  policyNumber: string;
  type: string;
  premium: number;
  startDate: string;
  endDate: string;
  clientId: number;
}

export interface CreateClaimDto {
  description: string;
  amount: number;
  policyId: number;
}
