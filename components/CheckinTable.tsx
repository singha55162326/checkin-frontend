import React, { useState } from "react";
import { Checkin } from "../utils/api";

interface Props {
  checkins: Checkin[];
  onEdit: (checkin: Checkin) => void;
  onDelete: (id: number) => void;
}

// Lao Language Translations
const LAO_TRANSLATIONS = {
  noRecords: "ບໍ່ພົບຂໍ້ມູນການກົດເຂົ້າງານ",
  noRecordsDesc: "ກະລຸນາປ່ຽນແບບການກັ່ນຕອງ ຫຼື ເພີ່ມຂໍ້ມູນໃໝ່",
  id: "ລະຫັດ",
  employeeCode: "ລະຫັດພະນັກງານ",
  punchTime: "ເວລາກົດເຂົ້າງານ",
  device: "ອຸປະກອນ",
  location: "ສະຖານທີ່",
  status: "ສະຖານະ",
  comments: "ຄຳເຫັນ",
  actions: "ການກະທຳ",
  edit: "ແກ້ໄຂ",
  delete: "ລຶບ",
  deleting: "ກຳລັງລຶບ...",
  confirmDelete: "ທ່ານແນ່ໃຈທີ່ຈະລຶບຂໍ້ມູນນີ້ບໍ?",
  statusNormal: "ປົກກະຕິ",
  statusLate: "ມາຊ້າ",
  statusEarly: "ອອກເຊົ້າ",
  today: "ມື້ນີ້",
  yesterday: "ມື້ວານ",
  at: "ເວລາ",
  noDevice: "—",
  noComments: "—",
  noLocation: "—",
};

const CheckinTable: React.FC<Props> = ({ checkins, onEdit, onDelete }) => {
  const [deletingId, setDeletingId] = useState<number | null>(null);

  // Enhanced date formatting with relative times
  const formatPunchTime = (timestamp: string) => {
    try {
      const [datePart, timePart] = timestamp.split(" ");
      if (!datePart || !timePart) {
        const date = new Date(timestamp);
        return formatDateWithRelative(date);
      }

      const [year, month, day] = datePart.split("-").map(Number);
      const [time, microseconds] = timePart.split(".");
      const [hours, minutes, seconds] = time.split(":").map(Number);

      const dateObj = new Date(year, month - 1, day, hours, minutes, seconds);
      return formatDateWithRelative(dateObj, microseconds);
    } catch (error) {
      const date = new Date(timestamp);
      return formatDateWithRelative(date);
    }
  };

  const formatDateWithRelative = (date: Date, microseconds?: string) => {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    const dateOnly = new Date(
      date.getFullYear(),
      date.getMonth(),
      date.getDate()
    );

    let datePrefix = "";
    if (dateOnly.getTime() === today.getTime()) {
      datePrefix = LAO_TRANSLATIONS.today;
    } else if (dateOnly.getTime() === yesterday.getTime()) {
      datePrefix = LAO_TRANSLATIONS.yesterday;
    } else {
      const day = date.getDate();
      const month = date.toLocaleString("lo-LA", { month: "short" });
      const year = date.getFullYear();
      datePrefix = `${day} ${month} ${year}`;
    }

    const time = `${String(date.getHours()).padStart(2, "0")}:${String(
      date.getMinutes()
    ).padStart(2, "0")}`;
    const seconds = String(date.getSeconds()).padStart(2, "0");

    // Format microseconds/milliseconds
    let micros = "000";
    if (microseconds) {
      micros = microseconds.padEnd(6, "0").substring(0, 3);
    } else {
      micros = String(date.getMilliseconds()).padStart(3, "0");
    }

    return (
      <div className="flex flex-col space-y-1">
        <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
          {datePrefix}
        </span>
        <span className="text-xs text-gray-500 dark:text-gray-400 font-mono">
          {time}:{seconds}.{micros}
        </span>
      </div>
    );
  };

  // Enhanced status badges with icons
  const getStatusConfig = (status: string) => {
    switch (status) {
      case "late":
        return {
          class:
            "bg-red-50 text-red-700 border-red-200 dark:bg-red-900/20 dark:text-red-300 dark:border-red-800",
          icon: "⏰",
          text: LAO_TRANSLATIONS.statusLate,
        };
      case "early":
        return {
          class:
            "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-900/20 dark:text-amber-300 dark:border-amber-800",
          icon: "🏃",
          text: LAO_TRANSLATIONS.statusEarly,
        };
      default:
        return {
          class:
            "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-900/20 dark:text-emerald-300 dark:border-emerald-800",
          icon: "✅",
          text: LAO_TRANSLATIONS.statusNormal,
        };
    }
  };

  const handleDelete = async (id: number) => {
    if (window.confirm(LAO_TRANSLATIONS.confirmDelete)) {
      setDeletingId(id);
      try {
        await onDelete(id);
      } finally {
        setDeletingId(null);
      }
    }
  };

  if (checkins.length === 0) {
    return (
      <div className="text-center py-16 px-4">
        <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 mb-6">
          <span className="text-3xl">📊</span>
        </div>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
          {LAO_TRANSLATIONS.noRecords}
        </h3>
        <p className="text-gray-500 dark:text-gray-400 max-w-sm mx-auto">
          {LAO_TRANSLATIONS.noRecordsDesc}
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
      {/* Table Header */}
      <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
              ລາຍການກົດເຂົ້າງານ
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              ພົບທັງໝົດ {checkins.length} ລາຍການ
            </p>
          </div>
          <div className="flex items-center space-x-2 text-sm text-gray-500 dark:text-gray-400">
            <span>📋</span>
            <span>ຕາຕະລາງ</span>
          </div>
        </div>
      </div>

      {/* Responsive Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50 dark:bg-gray-800/50">
            <tr>
              <th className="py-4 px-6 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                {LAO_TRANSLATIONS.id}
              </th>
              <th className="py-4 px-6 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                {LAO_TRANSLATIONS.employeeCode}
              </th>
              <th className="py-4 px-6 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                {LAO_TRANSLATIONS.punchTime}
              </th>
              <th className="py-4 px-6 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                {LAO_TRANSLATIONS.device}
              </th>
              <th className="py-4 px-6 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                {LAO_TRANSLATIONS.location}
              </th>
              <th className="py-4 px-6 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                {LAO_TRANSLATIONS.status}
              </th>
              <th className="py-4 px-6 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                {LAO_TRANSLATIONS.comments}
              </th>
              <th className="py-4 px-6 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                {LAO_TRANSLATIONS.actions}
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
            {checkins.map((c) => {
              const statusConfig = getStatusConfig(c.status);
              return (
                <tr
                  key={c.checkin_id}
                  className="hover:bg-gray-50 dark:hover:bg-gray-800/30 transition-colors duration-150"
                >
                  {/* ID */}
                  <td className="py-4 px-6">
                    <div className="flex items-center space-x-2">
                      <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                      <span className="text-sm font-mono font-medium text-gray-900 dark:text-gray-100">
                        #{c.checkin_id}
                      </span>
                    </div>
                  </td>

                  {/* Employee Code */}
                  <td className="py-4 px-6">
                    <div className="flex items-center space-x-2">
                      <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center text-white text-sm font-medium">
                        {c.emp_code.charAt(0)}
                      </div>
                      <span className="font-semibold text-gray-900 dark:text-gray-100">
                        {c.emp_code}
                      </span>
                    </div>
                  </td>

                  {/* Punch Time */}
                  <td className="py-4 px-6">{formatPunchTime(c.punch_time)}</td>

                  {/* Device */}
                  <td className="py-4 px-6">
                    {c.device_id ? (
                      <div className="flex items-center space-x-2">
                        <span className="text-lg">📱</span>
                        <span className="text-sm text-gray-700 dark:text-gray-300">
                          {c.device_id}
                        </span>
                      </div>
                    ) : (
                      <span className="text-sm text-gray-400 dark:text-gray-500">
                        {LAO_TRANSLATIONS.noDevice}
                      </span>
                    )}
                  </td>

                  {/* Location */}
                  <td className="py-4 px-6">
                    {c.latitude != null && c.longitude != null ? (
                      <div className="flex items-center space-x-2">
                        <span className="text-lg">📍</span>
                        <div className="text-xs font-mono text-gray-600 dark:text-gray-400">
                          <div>{c.latitude.toFixed(6)}</div>
                          <div>{c.longitude.toFixed(6)}</div>
                        </div>
                      </div>
                    ) : (
                      <span className="text-sm text-gray-400 dark:text-gray-500">
                        {LAO_TRANSLATIONS.noLocation}
                      </span>
                    )}
                  </td>

                  {/* Status */}
                  <td className="py-4 px-6">
                    <span
                      className={`inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-full text-xs font-medium border ${statusConfig.class}`}
                    >
                      <span>{statusConfig.icon}</span>
                      <span>{statusConfig.text}</span>
                    </span>
                  </td>

                  {/* Comments */}
                  <td className="py-4 px-6 max-w-xs">
                    {c.comments ? (
                      <div className="flex items-start space-x-2">
                        <span className="text-lg mt-0.5">💬</span>
                        <span className="text-sm text-gray-600 dark:text-gray-400 break-words">
                          {c.comments}
                        </span>
                      </div>
                    ) : (
                      <span className="text-sm text-gray-400 dark:text-gray-500">
                        {LAO_TRANSLATIONS.noComments}
                      </span>
                    )}
                  </td>

                  {/* Actions */}
                  <td className="py-4 px-6">
                    <div className="flex items-center space-x-3">
                      <button
                        onClick={() => onEdit(c)}
                        className="inline-flex items-center space-x-1.5 px-3 py-1.5 text-sm font-medium text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 bg-blue-50 hover:bg-blue-100 dark:bg-blue-900/20 dark:hover:bg-blue-900/30 rounded-lg transition-colors duration-150"
                      >
                        <span>✏️</span>
                        <span>{LAO_TRANSLATIONS.edit}</span>
                      </button>
                      <button
                        onClick={() => handleDelete(c.checkin_id)}
                        disabled={deletingId === c.checkin_id}
                        className="inline-flex items-center space-x-1.5 px-3 py-1.5 text-sm font-medium text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 bg-red-50 hover:bg-red-100 dark:bg-red-900/20 dark:hover:bg-red-900/30 rounded-lg transition-colors duration-150 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <span>🗑️</span>
                        <span>
                          {deletingId === c.checkin_id
                            ? LAO_TRANSLATIONS.deleting
                            : LAO_TRANSLATIONS.delete}
                        </span>
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Table Footer */}
      <div className="px-6 py-4 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50">
        <div className="flex items-center justify-between text-sm text-gray-500 dark:text-gray-400">
          <span>ສະແດງ {checkins.length} ລາຍການ</span>
          <span>ອັດຕະໂນມັດອັດດັບຕາມເວລາກົດເຂົ້າງານ</span>
        </div>
      </div>
    </div>
  );
};

export default CheckinTable;
