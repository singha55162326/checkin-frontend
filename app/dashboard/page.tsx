"use client";

import { useEffect, useState } from "react";
import { fetchCheckins, addCheckin, Checkin } from "../../utils/api";
import CheckinForm from "../../components/CheckinForm";
import CheckinTable from "../../components/CheckinTable";
import Pagination from "../../components/Pagination";
import Link from "next/link";

// Debounce hook for search (not emp_code)
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

export default function Dashboard() {
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
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // 🔍 Filter states
  const [empCodeFilter, setEmpCodeFilter] = useState(""); // real-time
  const [searchFilter, setSearchFilter] = useState(""); // debounced

  const debouncedSearch = useDebounce(searchFilter, 400);

  // Fetch check-ins
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
      setError("Failed to load check-ins. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Initial load
  useEffect(() => {
    loadCheckins(page, empCodeFilter, debouncedSearch);
  }, []);

  // Real-time emp_code: trigger immediately on change
  useEffect(() => {
    const newPage = 1;
    setPage(newPage);
    loadCheckins(newPage, empCodeFilter, debouncedSearch);
  }, [empCodeFilter]);

  // Debounced search: only trigger after 400ms pause
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
      setError("Employee code and device ID are required.");
      return;
    }

    try {
      await addCheckin(form);
      setSuccess("✅ Check-in added successfully!");
      setForm({
        emp_code: "",
        device_id: "",
        latitude: undefined,
        longitude: undefined,
        status: "normal",
        comments: "",
        punch_time: "",
      });
      loadCheckins(page, empCodeFilter, debouncedSearch);
    } catch (err) {
      console.error(err);
      setError("❌ Failed to add check-in. Please try again.");
    }
  };

  const clearFilters = () => {
    setEmpCodeFilter("");
    setSearchFilter("");
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
          <div className="flex justify-between items-center">
            <div></div> {/* Spacer for alignment */}
            <div>
              <h1 className="text-3xl sm:text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-500 dark:from-indigo-400 dark:via-purple-400 dark:to-pink-400">
                Employee Check-in System
              </h1>
              <p className="mt-3 text-zinc-600 dark:text-zinc-400 max-w-2xl mx-auto leading-relaxed">
                Seamlessly manage employee attendance with real-time check-ins and
                location tracking.
              </p>
            </div>
            <div>
              <Link href="/" className="ml-4 px-4 py-2 text-sm font-medium text-zinc-700 dark:text-zinc-300 hover:text-zinc-900 dark:hover:text-white bg-zinc-100 dark:bg-zinc-700 hover:bg-zinc-200 dark:hover:bg-zinc-600 rounded-lg transition-colors">
                Home
              </Link>
            </div>
          </div>
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
            <span>➕</span> Add New Check-in
          </h2>
          <CheckinForm
            form={form}
            setForm={setForm}
            handleSubmit={handleSubmit}
            loading={loading}
          />
        </div>

        <div className="bg-white dark:bg-zinc-800/80 backdrop-blur-sm rounded-2xl shadow-lg overflow-hidden border border-zinc-200 dark:border-zinc-700 mb-10">
          <div className="p-4 sm:p-6 border-b border-zinc-200 dark:border-zinc-700 flex justify-between items-center flex-wrap gap-2">
            <h2 className="text-xl font-semibold text-zinc-800 dark:text-white">
              Recent Check-ins
            </h2>
            {loading && (
              <div className="text-zinc-500 dark:text-zinc-400 flex items-center gap-2">
                <div className="w-4 h-4 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
                Loading...
              </div>
            )}
          </div>

          {/* 🔍 Filter Inputs */}
          <div className="p-4 border-b border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800/50 flex flex-col sm:flex-row gap-3">
            <div className="flex-1">
              <label
                htmlFor="empCodeFilter"
                className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1"
              >
                Filter by Employee Code (real-time)
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
                placeholder="e.g. EMP123"
                className="w-full px-3 py-2 border border-zinc-300 dark:border-zinc-600 rounded-lg bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                maxLength={50}
              />
            </div>
            <div className="flex-1">
              <label
                htmlFor="searchFilter"
                className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1"
              >
                Search (debounced)
              </label>
              <input
                type="text"
                id="searchFilter"
                value={searchFilter}
                onChange={(e) => setSearchFilter(e.target.value.slice(0, 100))}
                placeholder="Search status, comments..."
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
                Clear Filters
              </button>
            </div>
          )}

          <CheckinTable checkins={checkins} />
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
          © {new Date().getFullYear()} Employee Check-in System • Secure •
          Real-time
        </footer>
      </div>
    </div>
  );
}