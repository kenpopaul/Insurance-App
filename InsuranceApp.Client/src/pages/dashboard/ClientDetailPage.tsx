import { useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  ArrowLeft,
  Plus,
  Trash2,
  AlertTriangle,
  Edit2,
  Check,
  X,
} from "lucide-react";
import { clientsApi } from "../../api/clients";
import { policiesApi } from "../../api/policies";
import type { CreatePolicyDto } from "../../types/index";
import Layout from "../../components/Layout";

const riskColors = {
  Low: "bg-green-100 text-green-700",
  Medium: "bg-yellow-100 text-yellow-700",
  High: "bg-orange-100 text-orange-700",
  Critical: "bg-red-100 text-red-700",
};

const emptyPolicyForm: Omit<CreatePolicyDto, "clientId"> = {
  policyNumber: "",
  type: "",
  premium: 0,
  startDate: "",
  endDate: "",
};

const policyTypes = ["Home", "Car", "Life", "Travel", "Health", "Business"];

export default function ClientDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const clientId = Number(id);

  const [showPolicyForm, setShowPolicyForm] = useState(false);
  const [policyForm, setPolicyForm] = useState(emptyPolicyForm);
  const [policyError, setPolicyError] = useState("");
  const [editingClient, setEditingClient] = useState(false);
  const [editForm, setEditForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    address: "",
    dateOfBirth: "",
  });

  const { data: client, isLoading } = useQuery({
    queryKey: ["client", clientId],
    queryFn: () => clientsApi.getById(clientId),
    enabled: !!clientId,
  });

  const { data: policies = [] } = useQuery({
    queryKey: ["policies", "client", clientId],
    queryFn: () => policiesApi.getByClientId(clientId),
    enabled: !!clientId,
  });

  const updateClientMutation = useMutation({
    mutationFn: (dto: typeof editForm) => clientsApi.update(clientId, dto),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["client", clientId] });
      queryClient.invalidateQueries({ queryKey: ["clients"] });
      setEditingClient(false);
    },
  });

  const createPolicyMutation = useMutation({
    mutationFn: (dto: CreatePolicyDto) => policiesApi.create(dto),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["policies", "client", clientId],
      });
      queryClient.invalidateQueries({ queryKey: ["client", clientId] });
      queryClient.invalidateQueries({ queryKey: ["clients"] });
      setShowPolicyForm(false);
      setPolicyForm(emptyPolicyForm);
      setPolicyError("");
    },
    onError: () => setPolicyError("Policy number already exists."),
  });

  const deletePolicyMutation = useMutation({
    mutationFn: policiesApi.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["policies", "client", clientId],
      });
      queryClient.invalidateQueries({ queryKey: ["client", clientId] });
      queryClient.invalidateQueries({ queryKey: ["clients"] });
    },
  });

  const startEditing = () => {
    if (!client) return;
    setEditForm({
      firstName: client.firstName,
      lastName: client.lastName,
      email: client.email,
      phone: client.phone,
      address: client.address,
      dateOfBirth: client.dateOfBirth.split("T")[0],
    });
    setEditingClient(true);
  };

  const handlePolicySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createPolicyMutation.mutate({ ...policyForm, clientId });
  };

  if (isLoading)
    return (
      <Layout>
        <div className="p-8 text-center text-gray-400">Loading...</div>
      </Layout>
    );

  if (!client)
    return (
      <Layout>
        <div className="p-8 text-center text-gray-400">
          Client not found.{" "}
          <Link to="/" className="text-blue-600 hover:underline">
            Back to clients
          </Link>
        </div>
      </Layout>
    );

  return (
    <Layout>
      <div className="p-8">
        {/* Back button */}
        <button
          onClick={() => navigate("/")}
          className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-900 mb-6 transition"
        >
          <ArrowLeft size={16} />
          Back to clients
        </button>

        {/* Client header */}
        <div className="bg-white border border-gray-200 rounded-xl p-6 mb-6">
          {editingClient ? (
            <div>
              <div className="grid grid-cols-2 gap-4 mb-4">
                {[
                  { name: "firstName", label: "First name" },
                  { name: "lastName", label: "Last name" },
                  { name: "email", label: "Email" },
                  { name: "phone", label: "Phone" },
                  { name: "address", label: "Address" },
                  { name: "dateOfBirth", label: "Date of birth", type: "date" },
                ].map((field) => (
                  <div key={field.name}>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      {field.label}
                    </label>
                    <input
                      type={field.type || "text"}
                      value={editForm[field.name as keyof typeof editForm]}
                      onChange={(e) =>
                        setEditForm((prev) => ({
                          ...prev,
                          [field.name]: e.target.value,
                        }))
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                ))}
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => updateClientMutation.mutate(editForm)}
                  disabled={updateClientMutation.isPending}
                  className="flex items-center gap-1 px-3 py-2 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700 transition disabled:opacity-50"
                >
                  <Check size={14} /> Save
                </button>
                <button
                  onClick={() => setEditingClient(false)}
                  className="flex items-center gap-1 px-3 py-2 border border-gray-300 text-gray-600 rounded-lg text-sm hover:bg-gray-50 transition"
                >
                  <X size={14} /> Cancel
                </button>
              </div>
            </div>
          ) : (
            <div className="flex items-start justify-between">
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <h1 className="text-2xl font-bold text-gray-900">
                    {client.firstName} {client.lastName}
                  </h1>
                  <span
                    className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${riskColors[client.riskLevel]}`}
                  >
                    {(client.riskLevel === "Critical" ||
                      client.riskLevel === "High") && (
                      <AlertTriangle size={11} />
                    )}
                    {client.riskLevel} risk
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-x-8 gap-y-1 text-sm text-gray-600">
                  <span>{client.email}</span>
                  <span>{client.phone}</span>
                  <span>{client.address}</span>
                  <span>
                    DOB:{" "}
                    {new Date(client.dateOfBirth).toLocaleDateString("en-GB")}
                  </span>
                </div>
                <div className="flex gap-4 mt-3 text-sm">
                  <span className="text-gray-500">
                    {client.totalPolicies}{" "}
                    {client.totalPolicies === 1 ? "policy" : "policies"}
                  </span>
                  <span className="text-gray-500">
                    {client.totalClaims}{" "}
                    {client.totalClaims === 1 ? "claim" : "claims"}
                  </span>
                </div>
              </div>
              <button
                onClick={startEditing}
                className="flex items-center gap-2 text-sm text-gray-500 hover:text-blue-600 border border-gray-200 px-3 py-2 rounded-lg transition"
              >
                <Edit2 size={14} /> Edit
              </button>
            </div>
          )}
        </div>

        {/* Policies section */}
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900">Policies</h2>
          <button
            onClick={() => setShowPolicyForm(true)}
            className="flex items-center gap-2 bg-blue-600 text-white px-3 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition"
          >
            <Plus size={14} /> Add policy
          </button>
        </div>

        {/* Add policy form */}
        {showPolicyForm && (
          <div className="bg-white border border-gray-200 rounded-xl p-6 mb-4">
            <h3 className="font-semibold text-gray-900 mb-4">New policy</h3>
            {policyError && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">
                {policyError}
              </div>
            )}
            <form
              onSubmit={handlePolicySubmit}
              className="grid grid-cols-2 gap-4"
            >
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Policy number
                </label>
                <input
                  value={policyForm.policyNumber}
                  onChange={(e) =>
                    setPolicyForm((prev) => ({
                      ...prev,
                      policyNumber: e.target.value,
                    }))
                  }
                  required
                  placeholder="e.g. POL-001"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Type
                </label>
                <select
                  value={policyForm.type}
                  onChange={(e) =>
                    setPolicyForm((prev) => ({ ...prev, type: e.target.value }))
                  }
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Select type</option>
                  {policyTypes.map((t) => (
                    <option key={t} value={t}>
                      {t}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Annual premium (£)
                </label>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={policyForm.premium || ""}
                  onChange={(e) =>
                    setPolicyForm((prev) => ({
                      ...prev,
                      premium: parseFloat(e.target.value),
                    }))
                  }
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Start date
                </label>
                <input
                  type="date"
                  value={policyForm.startDate}
                  onChange={(e) =>
                    setPolicyForm((prev) => ({
                      ...prev,
                      startDate: e.target.value,
                    }))
                  }
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  End date
                </label>
                <input
                  type="date"
                  value={policyForm.endDate}
                  onChange={(e) =>
                    setPolicyForm((prev) => ({
                      ...prev,
                      endDate: e.target.value,
                    }))
                  }
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div className="col-span-2 flex gap-3 justify-end">
                <button
                  type="button"
                  onClick={() => {
                    setShowPolicyForm(false);
                    setPolicyForm(emptyPolicyForm);
                    setPolicyError("");
                  }}
                  className="px-4 py-2 text-sm text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={createPolicyMutation.isPending}
                  className="px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:opacity-50"
                >
                  {createPolicyMutation.isPending ? "Saving..." : "Save policy"}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Policies list */}
        {policies.length === 0 ? (
          <div className="text-center py-10 text-gray-400 bg-white border border-gray-200 rounded-xl">
            No policies yet — add the first one
          </div>
        ) : (
          <div className="space-y-3">
            {policies.map((policy) => (
              <div
                key={policy.id}
                className="bg-white border border-gray-200 rounded-xl p-5 flex items-center justify-between hover:border-gray-300 transition"
              >
                <div className="flex items-center gap-6">
                  <div>
                    <p className="font-semibold text-gray-900">
                      {policy.policyNumber}
                    </p>
                    <p className="text-sm text-gray-500">{policy.type}</p>
                  </div>
                  <div className="text-sm text-gray-600">
                    <p className="font-medium">
                      £
                      {policy.premium.toLocaleString("en-GB", {
                        minimumFractionDigits: 2,
                      })}
                      /yr
                    </p>
                    <p className="text-gray-400">
                      {new Date(policy.startDate).toLocaleDateString("en-GB")} —{" "}
                      {new Date(policy.endDate).toLocaleDateString("en-GB")}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-medium ${policy.isActive ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"}`}
                    >
                      {policy.isActive ? "Active" : "Inactive"}
                    </span>
                    <span className="text-sm text-gray-500">
                      {policy.claimCount}{" "}
                      {policy.claimCount === 1 ? "claim" : "claims"}
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Link
                    to={`/policies/${policy.id}`}
                    className="text-sm text-blue-600 hover:underline px-2 py-1"
                  >
                    View claims
                  </Link>
                  <button
                    onClick={() => {
                      if (
                        confirm(
                          `Delete policy ${policy.policyNumber}? This will also delete its claims.`,
                        )
                      ) {
                        deletePolicyMutation.mutate(policy.id);
                      }
                    }}
                    className="p-1 text-gray-400 hover:text-red-600 transition"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
}
