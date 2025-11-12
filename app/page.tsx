"use client";

import { useEffect, useState } from "react";
import {
  fetchCheckins,
  addCheckin,
  updateCheckin,
  deleteCheckin,
  Checkin,
} from "../utils/api";
import CheckinForm from "../components/CheckinForm";
import CheckinTable from "../components/CheckinTable";
import Pagination from "../components/Pagination";

// ສ້າງ hook ສຳລັບການ delay ການຄົ້ນຫາ (ບໍ່ແມ່ນ emp_code)
const useDebounce = (value: string, delay: number) => {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => clearTimeout(handler);
  }, [value, delay]);

  return debouncedValue;
};

export default function Home() {
  const [checkins, setCheckins] = useState<Checkin[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState<Omit<Checkin, "checkin_id">>({
    emp_code: "",
    device_id: "",
    latitude: undefined,
    longitude: undefined,
    status: "normal",
    comments: "",
    punch_time: "",
  });
  const [editingId, setEditingId] = useState<number | null>(null);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // 🔍 ສະຖານະການຕອງ
  const [empCodeFilter, setEmpCodeFilter] = useState(""); // ຕອງທັນທີ
  const [searchFilter, setSearchFilter] = useState(""); // ຕອງດ້ວຍການ delay

  const debouncedSearch = useDebounce(searchFilter, 400);

  // ດຶງຂໍ້ມູນການເຂົ້າລະບົບ
  const loadCheckins = async (pageNumber = 1, empCode = "", search = "") => {
    setLoading(true);
    setError("");
    try {
      const data = await fetchCheckins(pageNumber, empCode, search);
      setCheckins(data.data);
      setPage(data.page);
      setTotalPages(data.totalPages);
    } catch (err) {
      console.error(err);
      setError("ດຶງຂໍ້ມູນການເຂົ້າລະບົບບໍ່ສຳເລັດ. ກະລຸນາລອງອີກຄັ້ງ.");
    } finally {
      setLoading(false);
    }
  };

  // ໂຫຼດຄັ້ງທຳອິດ
  useEffect(() => {
    loadCheckins(page, empCodeFilter, debouncedSearch);
  }, []);

  // emp_code: ຕອງທັນທີເມື່ອມີການປ່ຽນແປງ
  useEffect(() => {
    const newPage = 1;
    setPage(newPage);
    loadCheckins(newPage, empCodeFilter, debouncedSearch);
  }, [empCodeFilter]);

  // ການຄົ້ນຫາດ້ວຍການ delay: ຈະເລີ່ມຕົ້ນຫຼັງຈາກຢຸດພິມ 400ms
  useEffect(() => {
    const newPage = 1;
    setPage(newPage);
    loadCheckins(newPage, empCodeFilter, debouncedSearch);
  }, [debouncedSearch]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!form.emp_code.trim() || !(form.device_id || "").trim()) {
      setError("ຕ້ອງການລະຫັດພະນັກງານ ແລະ ໄອດີອຸປະກອນ.");
      return;
    }

    try {
      if (editingId) {
        // ອັບເດດຂໍ້ມູນທີ່ມີຢູ່
        await updateCheckin(editingId, form);
        setSuccess("✅ ອັບເດດຂໍ້ມູນການເຂົ້າລະບົບສຳເລັດ!");
      } else {
        // ສ້າງຂໍ້ມູນໃໝ່
        await addCheckin(form);
        setSuccess("✅ ເພີ່ມຂໍ້ມູນການເຂົ້າລະບົບສຳເລັດ!");
      }

      // ລຶບຟອມ ແລະ ຮີເຟີດຂໍ້ມູນ
      setForm({
        emp_code: "",
        device_id: "",
        latitude: undefined,
        longitude: undefined,
        status: "normal",
        comments: "",
        punch_time: "",
      });
      setEditingId(null);
      loadCheckins(page, empCodeFilter, debouncedSearch);
    } catch (err) {
      console.error(err);
      setError(
        `❌ ບໍ່ສາມາດ${
          editingId ? "ອັບເດດ" : "ເພີ່ມ"
        }ຂໍ້ມູນການເຂົ້າລະບົບໄດ້. ກະລຸນາລອງອີກຄັ້ງ.`
      );
    }
  };

  const handleEdit = (checkin: Checkin) => {
    setForm({
      emp_code: checkin.emp_code,
      device_id: checkin.device_id || "",
      latitude: checkin.latitude,
      longitude: checkin.longitude,
      status: checkin.status,
      comments: checkin.comments || "",
      punch_time: checkin.punch_time,
    });
    setEditingId(checkin.checkin_id);
    document
      .getElementById("checkin-form")
      ?.scrollIntoView({ behavior: "smooth" });
  };

  const handleDelete = async (id: number) => {
    try {
      await deleteCheckin(id);
      setSuccess("✅ ລຶບຂໍ້ມູນການເຂົ້າລະບົບສຳເລັດ!");
      loadCheckins(page, empCodeFilter, debouncedSearch);
    } catch (err) {
      console.error(err);
      setError("❌ ບໍ່ສາມາດລຶບຂໍ້ມູນການເຂົ້າລະບົບໄດ້. ກະລຸນາລອງອີກຄັ້ງ.");
    }
  };

  const clearFilters = () => {
    setEmpCodeFilter("");
    setSearchFilter("");
  };

  const cancelEdit = () => {
    setEditingId(null);
    setForm({
      emp_code: "",
      device_id: "",
      latitude: undefined,
      longitude: undefined,
      status: "normal",
      comments: "",
      punch_time: "",
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-zinc-50 to-zinc-100 dark:from-zinc-900 dark:to-black text-zinc-900 dark:text-zinc-100 font-sans p-4 sm:p-6">
      <style jsx global>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(-8px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fadeIn {
          animation: fadeIn 0.3s ease-out forwards;
        }
      `}</style>

      <div className="max-w-6xl mx-auto">
        <header className="text-center py-8">
          <h1 className="text-3xl sm:text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-500 dark:from-indigo-400 dark:via-purple-400 dark:to-pink-400">
            ລະບົບຕິດຕາມການເຂົ້າລະບົບຂອງພະນັກງານ
          </h1>
          <p className="mt-3 text-zinc-600 dark:text-zinc-400 max-w-2xl mx-auto leading-relaxed">
            ຈັດການການລົງຊື່ເຂົ້າ-ອອກຂອງພະນັກງານຢ່າງມີປະສິດທິພາບ
            ພ້ອມຕິດຕາມຕຳແໜ່ງທີ່ແບບເວລາຈິງ.
          </p>
        </header>

        {error && (
          <div className="mb-6 p-4 rounded-xl bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800/50 text-red-700 dark:text-red-300 animate-fadeIn">
            {error}
          </div>
        )}
        {success && (
          <div className="mb-6 p-4 rounded-xl bg-green-50 dark:bg-green-900/30 border border-green-200 dark:border-green-800/50 text-green-700 dark:text-green-300 animate-fadeIn">
            {success}
          </div>
        )}

        <div className="bg-white dark:bg-zinc-800/80 backdrop-blur-sm rounded-2xl shadow-lg p-6 mb-8 transition-all duration-300 hover:shadow-xl border border-zinc-200 dark:border-zinc-700">
          <h2 className="text-xl font-semibold mb-5 text-zinc-800 dark:text-white flex items-center gap-2">
            <span>{editingId ? "✏️" : "➕"}</span>{" "}
            {editingId
              ? "ແກ້ໄຂຂໍ້ມູນການເຂົ້າລະບົບ"
              : "ເພີ່ມຂໍ້ມູນການເຂົ້າລະບົບໃໝ່"}
          </h2>
          <div id="checkin-form">
            <CheckinForm
              form={form}
              setForm={setForm}
              handleSubmit={handleSubmit}
              loading={loading}
            />
          </div>
          {editingId && (
            <div className="mt-4 flex justify-end">
              <button
                onClick={cancelEdit}
                className="px-4 py-2 text-sm font-medium text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-700 rounded-lg transition"
              >
                ຍົກເລີກການແກ້ໄຂ
              </button>
            </div>
          )}
        </div>

        <div className="bg-white dark:bg-zinc-800/80 backdrop-blur-sm rounded-2xl shadow-lg overflow-hidden border border-zinc-200 dark:border-zinc-700 mb-10">
          <div className="p-4 sm:p-6 border-b border-zinc-200 dark:border-zinc-700 flex justify-between items-center flex-wrap gap-2">
            <h2 className="text-xl font-semibold text-zinc-800 dark:text-white">
              ການເຂົ້າລະບົບລ່າສຸດ
            </h2>
            {loading && (
              <div className="text-zinc-500 dark:text-zinc-400 flex items-center gap-2">
                <div className="w-4 h-4 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
                ກຳລັງໂຫຼດ...
              </div>
            )}
          </div>

          {/* 🔍 ຟອມຕອງຂໍ້ມູນ */}
          <div className="p-4 border-b border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800/50 flex flex-col sm:flex-row gap-3">
            <div className="flex-1">
              <label
                htmlFor="empCodeFilter"
                className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1"
              >
                ລະຫັດພະນັກງານ
              </label>
              <input
                type="text"
                id="empCodeFilter"
                value={empCodeFilter}
                onChange={(e) =>
                  setEmpCodeFilter(
                    e.target.value.slice(0, 50).toUpperCase().trim()
                  )
                }
                placeholder="ຕົວຢ່າງ: EMP123"
                className="w-full px-3 py-2 border border-zinc-300 dark:border-zinc-600 rounded-lg bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                maxLength={50}
              />
            </div>
            <div className="flex-1">
              <label
                htmlFor="searchFilter"
                className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1"
              >
                ຄົ້ນຫາ (ມີການ delay)
              </label>
              <input
                type="text"
                id="searchFilter"
                value={searchFilter}
                onChange={(e) => setSearchFilter(e.target.value.slice(0, 100))}
                placeholder="ຄົ້ນຫາສະຖານະ, ຄຳເຫັນ..."
                className="w-full px-3 py-2 border border-zinc-300 dark:border-zinc-600 rounded-lg bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                maxLength={100}
              />
            </div>
          </div>

          {(empCodeFilter || searchFilter) && (
            <div className="px-4 py-2 text-right">
              <button
                onClick={clearFilters}
                className="text-sm text-indigo-600 dark:text-indigo-400 hover:underline font-medium"
              >
                ລຶບຕົວກອງທັງໝົດ
              </button>
            </div>
          )}

          <CheckinTable
            checkins={checkins}
            onEdit={handleEdit}
            onDelete={handleDelete}
          />
        </div>

        <div className="flex justify-center pb-12">
          <Pagination
            page={page}
            totalPages={totalPages}
            onPrev={() =>
              page > 1 && loadCheckins(page - 1, empCodeFilter, debouncedSearch)
            }
            onNext={() =>
              page < totalPages &&
              loadCheckins(page + 1, empCodeFilter, debouncedSearch)
            }
          />
        </div>

        <footer className="text-center text-zinc-500 dark:text-zinc-400 text-sm pb-8">
          © {new Date().getFullYear()} ລະບົບຕິດຕາມການເຂົ້າລະບົບຂອງພະນັກງານ •
          ປອດໄພ • ເວລາຈິງ
        </footer>
      </div>
    </div>
  );
}
