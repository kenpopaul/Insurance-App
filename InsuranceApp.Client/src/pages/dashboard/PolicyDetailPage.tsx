import { useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { ArrowLeft, Plus, Trash2, Edit2, Check, X } from "lucide-react";
import { policiesApi } from "../../api/policies";
import { claimsApi } from "../../api/claims";
import type { CreateClaimDto } from "../../types/index";
import Layout from "../../components/Layout";

const claimStatuses = ["Pending", "Approved", "Rejected", "Under Review"];

const emptyClaimForm: Omit<CreateClaimDto, "policyId"> = {
  description: "",
  amount: 0,
};

export default function PolicyDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const policyId = Number(id);

  const [showClaimForm, setShowClaimForm] = useState(false);
  const [claimForm, setClaimForm] = useState(emptyClaimForm);
  const [editingClaimId, setEditingClaimId] = useState<number | null>(null);
  const [editClaimForm, setEditClaimForm] = useState({
    description: "",
    amount: 0,
    status: "",
  });

  const { data: policy, isLoading } = useQuery({
    queryKey: ["policy", policyId],
    queryFn: () => policiesApi.getById(policyId),
    enabled: !!policyId,
  });

  const { data: claims = [] } = useQuery({
    queryKey: ["claims", "policy", policyId],
    queryFn: () => claimsApi.getByPolicyId(policyId),
    enabled: !!policyId,
  });

  const createClaimMutation = useMutation({
    mutationFn: (dto: CreateClaimDto) => claimsApi.create(dto),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["claims", "policy", policyId],
      });
      queryClient.invalidateQueries({ queryKey: ["policy", policyId] });
      queryClient.invalidateQueries({ queryKey: ["policies"] });
      queryClient.invalidateQueries({ queryKey: ["clients"] });
      setShowClaimForm(false);
      setClaimForm(emptyClaimForm);
    },
  });

  const updateClaimMutation = useMutation({
    mutationFn: ({
      claimId,
      dto,
    }: {
      claimId: number;
      dto: typeof editClaimForm;
    }) => claimsApi.update(claimId, dto),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["claims", "policy", policyId],
      });
      setEditingClaimId(null);
    },
  });

  const deleteClaimMutation = useMutation({
    mutationFn: claimsApi.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["claims", "policy", policyId],
      });
      queryClient.invalidateQueries({ queryKey: ["policy", policyId] });
      queryClient.invalidateQueries({ queryKey: ["policies"] });
      queryClient.invalidateQueries({ queryKey: ["clients"] });
    },
  });

  const startEditingClaim = (claim: {
    id: number;
    description: string;
    amount: number;
    status: string;
  }) => {
    setEditingClaimId(claim.id);
    setEditClaimForm({
      description: claim.description,
      amount: claim.amount,
      status: claim.status,
    });
  };

  const statusColors: Record<string, string> = {
    Pending: "bg-yellow-100 text-yellow-700",
    Approved: "bg-green-100 text-green-700",
    Rejected: "bg-red-100 text-red-700",
    "Under Review": "bg-blue-100 text-blue-700",
  };

  if (isLoading)
    return (
      <Layout>
        <div className="p-8 text-center text-gray-400">Loading...</div>
      </Layout>
    );
  if (!policy)
    return (
      <Layout>
        <div className="p-8 text-center text-gray-400">
          Policy not found.{" "}
          <Link to="/policies" className="text-blue-600 hover:underline">
            Back to policies
          </Link>
        </div>
      </Layout>
    );

  const totalClaimAmount = claims.reduce((sum, c) => sum + c.amount, 0);

  return (
    <Layout>
      <div className="p-8">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-900 mb-6 transition"
        >
          <ArrowLeft size={16} /> Back
        </button>

        {/* Policy header */}
        <div className="bg-white border border-gray-200 rounded-xl p-6 mb-6">
          <div className="flex items-start justify-between">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <h1 className="text-2xl font-bold text-gray-900">
                  {policy.policyNumber}
                </h1>
                <span
                  className={`px-2 py-1 rounded-full text-xs font-medium ${policy.isActive ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"}`}
                >
                  {policy.isActive ? "Active" : "Inactive"}
                </span>
              </div>
              <div className="grid grid-cols-2 gap-x-8 gap-y-1 text-sm text-gray-600">
                <span>
                  Type:{" "}
                  <span className="font-medium text-gray-900">
                    {policy.type}
                  </span>
                </span>
                <span>
                  Client:{" "}
                  <Link
                    to={`/clients/${policy.clientId}`}
                    className="text-blue-600 hover:underline font-medium"
                  >
                    {policy.clientName}
                  </Link>
                </span>
                <span>
                  Premium:{" "}
                  <span className="font-medium text-gray-900">
                    £
                    {policy.premium.toLocaleString("en-GB", {
                      minimumFractionDigits: 2,
                    })}
                    /yr
                  </span>
                </span>
                <span>
                  Period:{" "}
                  <span className="font-medium text-gray-900">
                    {new Date(policy.startDate).toLocaleDateString("en-GB")} —{" "}
                    {new Date(policy.endDate).toLocaleDateString("en-GB")}
                  </span>
                </span>
              </div>
            </div>
            <div className="text-right">
              <p className="text-2xl font-bold text-gray-900">
                {claims.length}
              </p>
              <p className="text-sm text-gray-500">total claims</p>
              <p className="text-sm font-medium text-gray-700 mt-1">
                £
                {totalClaimAmount.toLocaleString("en-GB", {
                  minimumFractionDigits: 2,
                })}{" "}
                total value
              </p>
            </div>
          </div>
        </div>

        {/* Claims section */}
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900">Claims</h2>
          <button
            onClick={() => setShowClaimForm(true)}
            className="flex items-center gap-2 bg-blue-600 text-white px-3 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition"
          >
            <Plus size={14} /> Add claim
          </button>
        </div>

        {/* Add claim form */}
        {showClaimForm && (
          <div className="bg-white border border-gray-200 rounded-xl p-6 mb-4">
            <h3 className="font-semibold text-gray-900 mb-4">New claim</h3>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                createClaimMutation.mutate({ ...claimForm, policyId });
              }}
              className="grid grid-cols-2 gap-4"
            >
              <div className="col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description
                </label>
                <input
                  value={claimForm.description}
                  onChange={(e) =>
                    setClaimForm((prev) => ({
                      ...prev,
                      description: e.target.value,
                    }))
                  }
                  required
                  placeholder="Brief description of the claim"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Amount (£)
                </label>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={claimForm.amount || ""}
                  onChange={(e) =>
                    setClaimForm((prev) => ({
                      ...prev,
                      amount: parseFloat(e.target.value),
                    }))
                  }
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div className="flex items-end gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setShowClaimForm(false);
                    setClaimForm(emptyClaimForm);
                  }}
                  className="px-4 py-2 text-sm text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={createClaimMutation.isPending}
                  className="px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:opacity-50"
                >
                  {createClaimMutation.isPending ? "Saving..." : "Save claim"}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Claims list */}
        {claims.length === 0 ? (
          <div className="text-center py-10 text-gray-400 bg-white border border-gray-200 rounded-xl">
            No claims on this policy yet
          </div>
        ) : (
          <div className="space-y-3">
            {claims.map((claim) => (
              <div
                key={claim.id}
                className="bg-white border border-gray-200 rounded-xl p-5"
              >
                {editingClaimId === claim.id ? (
                  <div className="grid grid-cols-2 gap-4">
                    <div className="col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Description
                      </label>
                      <input
                        value={editClaimForm.description}
                        onChange={(e) =>
                          setEditClaimForm((prev) => ({
                            ...prev,
                            description: e.target.value,
                          }))
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Amount (£)
                      </label>
                      <input
                        type="number"
                        value={editClaimForm.amount}
                        onChange={(e) =>
                          setEditClaimForm((prev) => ({
                            ...prev,
                            amount: parseFloat(e.target.value),
                          }))
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Status
                      </label>
                      <select
                        value={editClaimForm.status}
                        onChange={(e) =>
                          setEditClaimForm((prev) => ({
                            ...prev,
                            status: e.target.value,
                          }))
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        {claimStatuses.map((s) => (
                          <option key={s} value={s}>
                            {s}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="col-span-2 flex gap-2">
                      <button
                        onClick={() =>
                          updateClaimMutation.mutate({
                            claimId: claim.id,
                            dto: editClaimForm,
                          })
                        }
                        disabled={updateClaimMutation.isPending}
                        className="flex items-center gap-1 px-3 py-2 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700 transition disabled:opacity-50"
                      >
                        <Check size={14} /> Save
                      </button>
                      <button
                        onClick={() => setEditingClaimId(null)}
                        className="flex items-center gap-1 px-3 py-2 border border-gray-300 text-gray-600 rounded-lg text-sm hover:bg-gray-50 transition"
                      >
                        <X size={14} /> Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-gray-900 mb-1">
                        {claim.description}
                      </p>
                      <div className="flex items-center gap-4 text-sm text-gray-500">
                        <span className="font-medium text-gray-700">
                          £
                          {claim.amount.toLocaleString("en-GB", {
                            minimumFractionDigits: 2,
                          })}
                        </span>
                        <span>
                          {new Date(claim.claimDate).toLocaleDateString(
                            "en-GB",
                          )}
                        </span>
                        <span
                          className={`px-2 py-0.5 rounded-full text-xs font-medium ${statusColors[claim.status] ?? "bg-gray-100 text-gray-600"}`}
                        >
                          {claim.status}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => startEditingClaim(claim)}
                        className="p-1 text-gray-400 hover:text-blue-600 transition"
                      >
                        <Edit2 size={16} />
                      </button>
                      <button
                        onClick={() => {
                          if (confirm("Delete this claim?"))
                            deleteClaimMutation.mutate(claim.id);
                        }}
                        className="p-1 text-gray-400 hover:text-red-600 transition"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
}
