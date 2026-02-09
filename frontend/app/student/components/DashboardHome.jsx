"use client";

export default function DashboardHome() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Student / Faculty Dashboard</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-gray-900 border border-gray-700 rounded p-4">
          <p className="text-gray-400 text-sm">Total Proposals</p>
          <p className="text-2xl font-bold mt-2">—</p>
        </div>

        <div className="bg-gray-900 border border-gray-700 rounded p-4">
          <p className="text-gray-400 text-sm">Pending Approval</p>
          <p className="text-2xl font-bold mt-2">—</p>
        </div>

        <div className="bg-gray-900 border border-gray-700 rounded p-4">
          <p className="text-gray-400 text-sm">Approved</p>
          <p className="text-2xl font-bold mt-2">—</p>
        </div>
      </div>

      <div className="bg-gray-900 border border-gray-700 rounded p-6">
        <p className="text-gray-400">
          Use the sidebar to create new booking proposals, manage drafts,
          and track approvals.
        </p>
      </div>
    </div>
  );
}
