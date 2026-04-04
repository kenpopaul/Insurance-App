import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { Search, Trash2, Edit2, Check, X } from "lucide-react";
import { claimsApi } from "../../api/claims";
import Layout from "../../components/Layout";

const claimStatuses = ["Pending", "Approved", "Rejected", "Under Review"];

const statusColors: Record<string, string> = {
  Pending: "bg-yellow-100 text-yellow-700",
  Approved: "bg-green-100 text-green-700",
  Rejected: "bg-red-100 text-red-700",
  "Under Review": "bg-blue-100 text-blue-700",
};

export default function ClaimsPage() {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editForm, setEditForm] = useState({
    description: "",
    amount: 0,
    status: "",
  });

  const { data: claims = [], isLoading } = useQuery({
    queryKey: ["claims"],
    queryFn: claimsApi.getAll,
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, dto }: { id: number; dto: typeof editForm }) =>
      claimsApi.update(id, dto),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["claims"] });
      queryClient.invalidateQueries({ queryKey: ["clients"] });
      setEditingId(null);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: claimsApi.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["claims"] });
      queryClient.invalidateQueries({ queryKey: ["clients"] });
      queryClient.invalidateQueries({ queryKey: ["policies"] });
    },
  });

  const filtered = claims.filter((c) =>
    `${c.description} ${c.policyNumber} ${c.status}`
      .toLowerCase()
      .includes(search.toLowerCase()),
  );

  const startEditing = (claim: (typeof claims)[0]) => {
    setEditingId(claim.id);
    setEditForm({
      description: claim.description,
      amount: claim.amount,
      status: claim.status,
    });
  };

  return (
    <Layout>
      <div className="p-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Claims</h1>
            <p className="text-gray-500 text-sm mt-1">
              {claims.length} total claims
            </p>
          </div>
        </div>

        <div className="relative mb-6">
          <Search
            size={16}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
          />
          <input
            type="text"
            placeholder="Search by description, policy or status..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {isLoading ? (
          <div className="text-center py-12 text-gray-400">
            Loading claims...
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-12 text-gray-400">
            {search
              ? "No claims match your search"
              : "No claims yet — add one from a policy page"}
          </div>
        ) : (
          <div className="space-y-3">
            {filtered.map((claim) => (
              <div
                key={claim.id}
                className="bg-white border border-gray-200 rounded-xl p-5"
              >
                {editingId === claim.id ? (
                  <div className="grid grid-cols-2 gap-4">
                    <div className="col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Description
                      </label>
                      <input
                        value={editForm.description}
                        onChange={(e) =>
                          setEditForm((prev) => ({
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
                        value={editForm.amount}
                        onChange={(e) =>
                          setEditForm((prev) => ({
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
                        value={editForm.status}
                        onChange={(e) =>
                          setEditForm((prev) => ({
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
                          updateMutation.mutate({ id: claim.id, dto: editForm })
                        }
                        disabled={updateMutation.isPending}
                        className="flex items-center gap-1 px-3 py-2 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700 transition disabled:opacity-50"
                      >
                        <Check size={14} /> Save
                      </button>
                      <button
                        onClick={() => setEditingId(null)}
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
                        <Link
                          to={`/policies/${claim.policyId}`}
                          className="text-blue-600 hover:underline"
                        >
                          {claim.policyNumber}
                        </Link>
                        <span
                          className={`px-2 py-0.5 rounded-full text-xs font-medium ${statusColors[claim.status] ?? "bg-gray-100 text-gray-600"}`}
                        >
                          {claim.status}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => startEditing(claim)}
                        className="p-1 text-gray-400 hover:text-blue-600 transition"
                      >
                        <Edit2 size={16} />
                      </button>
                      <button
                        onClick={() => {
                          if (confirm("Delete this claim?"))
                            deleteMutation.mutate(claim.id);
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
