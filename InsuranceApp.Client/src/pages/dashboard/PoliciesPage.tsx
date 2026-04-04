import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { Search, Eye, Trash2, AlertCircle } from "lucide-react";
import { policiesApi } from "../../api/policies";
import Layout from "../../components/Layout";

export default function PoliciesPage() {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");

  const { data: policies = [], isLoading } = useQuery({
    queryKey: ["policies"],
    queryFn: policiesApi.getAll,
  });

  const deleteMutation = useMutation({
    mutationFn: policiesApi.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["policies"] });
      queryClient.invalidateQueries({ queryKey: ["clients"] });
    },
  });

  const filtered = policies.filter((p) =>
    `${p.policyNumber} ${p.type} ${p.clientName}`
      .toLowerCase()
      .includes(search.toLowerCase()),
  );

  const handleDelete = (id: number, policyNumber: string) => {
    if (
      confirm(
        `Delete policy ${policyNumber}? This will also delete its claims.`,
      )
    ) {
      deleteMutation.mutate(id);
    }
  };

  return (
    <Layout>
      <div className="p-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Policies</h1>
            <p className="text-gray-500 text-sm mt-1">
              {policies.length} total policies
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
            placeholder="Search by policy number, type or client..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {isLoading ? (
          <div className="text-center py-12 text-gray-400">
            Loading policies...
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-12 text-gray-400">
            {search
              ? "No policies match your search"
              : "No policies yet — add one from a client page"}
          </div>
        ) : (
          <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200 bg-gray-50">
                  <th className="text-left px-4 py-3 font-medium text-gray-600">
                    Policy number
                  </th>
                  <th className="text-left px-4 py-3 font-medium text-gray-600">
                    Client
                  </th>
                  <th className="text-left px-4 py-3 font-medium text-gray-600">
                    Type
                  </th>
                  <th className="text-left px-4 py-3 font-medium text-gray-600">
                    Premium
                  </th>
                  <th className="text-left px-4 py-3 font-medium text-gray-600">
                    Status
                  </th>
                  <th className="text-left px-4 py-3 font-medium text-gray-600">
                    Claims
                  </th>
                  <th className="px-4 py-3"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filtered.map((policy) => (
                  <tr key={policy.id} className="hover:bg-gray-50 transition">
                    <td className="px-4 py-3 font-medium text-gray-900">
                      {policy.policyNumber}
                    </td>
                    <td className="px-4 py-3">
                      <Link
                        to={`/clients/${policy.clientId}`}
                        className="text-blue-600 hover:underline"
                      >
                        {policy.clientName}
                      </Link>
                    </td>
                    <td className="px-4 py-3 text-gray-600">{policy.type}</td>
                    <td className="px-4 py-3 text-gray-600">
                      £
                      {policy.premium.toLocaleString("en-GB", {
                        minimumFractionDigits: 2,
                      })}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-medium ${policy.isActive ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"}`}
                      >
                        {policy.isActive ? "Active" : "Inactive"}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-gray-600">
                      {policy.claimCount}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2 justify-end">
                        <Link
                          to={`/policies/${policy.id}`}
                          className="p-1 text-gray-400 hover:text-blue-600 transition"
                        >
                          <Eye size={16} />
                        </Link>
                        <button
                          onClick={() =>
                            handleDelete(policy.id, policy.policyNumber)
                          }
                          className="p-1 text-gray-400 hover:text-red-600 transition"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg flex items-start gap-3">
          <AlertCircle size={16} className="text-blue-600 mt-0.5 shrink-0" />
          <p className="text-sm text-blue-700">
            Policies are added from the client detail page. Click a client's
            name above to manage their policies.
          </p>
        </div>
      </div>
    </Layout>
  );
}
