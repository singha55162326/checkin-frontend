import React from "react";
import { Checkin } from "../utils/api";

interface Props {
  checkins: Checkin[];
}

const CheckinTable: React.FC<Props> = ({ checkins }) => {
  // Format punch_time to "Nov 4, 2025 • 08:01:00.112"
  const formatPunchTime = (isoString: string) => {
    const date = new Date(isoString);
    const day = date.getDate();
    const month = date.toLocaleString("default", { month: "short" });
    const year = date.getFullYear();
    const hours = String(date.getHours()).padStart(2, "0");
    const minutes = String(date.getMinutes()).padStart(2, "0");
    const seconds = String(date.getSeconds()).padStart(2, "0");
    const millis = String(date.getMilliseconds()).padStart(3, "0");
    return `${month} ${day}, ${year} • ${hours}:${minutes}:${seconds}.${millis}`;
  };

  // Status badge colors
  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case "late":
        return "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300";
      case "early":
        return "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300";
      default:
        return "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300";
    }
  };

  if (checkins.length === 0) {
    return (
      <div className="text-center py-12 text-zinc-500 dark:text-zinc-400">
        <div className="inline-block p-4 rounded-full bg-zinc-100 dark:bg-zinc-800 mb-4">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-10 w-10 opacity-60"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
        </div>
        <p className="text-lg font-medium">No check-ins found</p>
        <p className="mt-1">Try adjusting your filters or add a new record.</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto rounded-xl border border-zinc-200 dark:border-zinc-700">
      <table className="w-full min-w-full">
        <thead className="bg-zinc-50 dark:bg-zinc-800/50 text-zinc-500 dark:text-zinc-400 text-xs font-semibold uppercase tracking-wider">
          <tr>
            <th className="py-3 px-4 text-left">ID</th>
            <th className="py-3 px-4 text-left">Emp Code</th>
            <th className="py-3 px-4 text-left">Punch Time</th>
            <th className="py-3 px-4 text-left">Device</th>
            <th className="py-3 px-4 text-left">Location</th>
            <th className="py-3 px-4 text-left">Status</th>
            <th className="py-3 px-4 text-left">Comments</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800">
          {checkins.map((c) => (
            <tr
              key={c.checkin_id}
              className="hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-colors"
            >
              <td className="py-4 px-4">
                <span className="text-sm font-mono text-zinc-600 dark:text-zinc-400">
                  #{c.checkin_id}
                </span>
              </td>
              <td className="py-4 px-4">
                <span className="font-medium text-zinc-900 dark:text-zinc-100">
                  {c.emp_code}
                </span>
              </td>
              <td className="py-4 px-4">
                <span className="text-sm text-zinc-600 dark:text-zinc-400 font-mono">
                  {formatPunchTime(c.punch_time)}
                </span>
              </td>
              <td className="py-4 px-4">
                <span className="text-sm text-zinc-600 dark:text-zinc-400">
                  {c.device_id || "—"}
                </span>
              </td>
              <td className="py-4 px-4">
                {c.latitude != null && c.longitude != null ? (
                  <span className="text-sm text-zinc-600 dark:text-zinc-400 font-mono">
                    {c.latitude.toFixed(6)}, {c.longitude.toFixed(6)}
                  </span>
                ) : (
                  <span className="text-sm text-zinc-400">—</span>
                )}
              </td>
              <td className="py-4 px-4">
                <span
                  className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusBadgeClass(
                    c.status
                  )}`}
                >
                  {c.status.charAt(0).toUpperCase() + c.status.slice(1)}
                </span>
              </td>
              <td className="py-4 px-4 max-w-xs">
                <span className="text-sm text-zinc-600 dark:text-zinc-400 break-words">
                  {c.comments || "—"}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default CheckinTable;
