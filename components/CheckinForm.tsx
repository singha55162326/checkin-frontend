"use client";
import React, { useState, useMemo, useEffect } from "react";
import { Checkin } from "../utils/api";

const DEVICE_OPTIONS = [
  {
    id: "HONORBRP-NX1",
    name: "HONOR BRP-NX1",
    lat: 17.9406925,
    lng: 102.6285838,
  },
  {
    id: "InfinixX6851B",
    name: "Infinix X6851B",
    lat: 17.9406925,
    lng: 102.6285838,
  },
  {
    id: "OPPOCPH1931",
    name: "OPPO CPH1931",
    lat: 17.9406925,
    lng: 102.6285838,
  },
];

// Lao Language Translations
const LAO_TRANSLATIONS = {
  // Form Titles
  checkinForm: "ແບບຟອມການກົດເຂົ້າງານ",
  submitCheckin: "✅ ສົ່ງຂໍ້ມູນການກົດເຂົ້າງານ",
  
  // Employee Section
  employeeCode: "ລະຫັດພະນັກງານ *",
  employeePlaceholder: "ຕົວຢ່າງ: EMP123",
  
  // Device Section
  deviceId: "ລະຫັດອຸປະກອນ",
  selectDevice: "ເລືອກອຸປະກອນ",
  
  // Location Section
  location: "ສະຖານທີ່ (ຕັ້ງຄ່າອັດຕະໂນມັດຈາກອຸປະກອນ)",
  latitude: "ເສັ້ນຂະໜານ",
  longitude: "ເສັ້ນແວງ",
  locationHint: "ພິກັດຈະຖືກຕັ້ງຄ່າອັດຕະໂນມັດຕາມອຸປະກອນທີ່ເລືອກ. ທ່ານສາມາດແກ້ໄຂໄດ້ດ້ວຍຕົນເອງ.",
  
  // Status & Comments
  status: "ສະຖານະ",
  comments: "ຄຳເຫັນ",
  commentsPlaceholder: "ຕົວຢ່າງ: ເຂົ້າຫ້ອງການ",
  statusOptions: {
    normal: "ປົກກະຕິ",
    late: "ມາຊ້າ",
    early: "ອອກເຊົ້າ"
  },
  
  // Punch Time Section
  punchTime: "ເວລາກົດເຂົ້າງານ",
  punchTimeTitle: "ເວລາກົດເຂົ້າງານ",
  setToNow: "ຕັ້ງເປັນປັດຈຸບັນ",
  useDateTimePicker: "📅 ໃຊ້ຕົວເລືອກວັນທີ/ເວລາ",
  postgresFormat: "ຮູບແບບ PostgreSQL",
  formatHint: "ຮູບແບບ: YYYY-MM-DD HH:MM:SS.SSS (ຕົວຢ່າງ: 2025-10-22 17:35:30.694)",
  date: "ວັນທີ",
  time: "ເວລາ (24 ຊົ່ວໂມງ)",
  setToNowBtn: "ຕັ້ງເປັນປັດຈຸບັນ",
  done: "ສຳເລັດ",
  
  // Current Selection
  currentSelection: "ການເລືອກປັດຈຸບັນ",
  willBeSubmitted: "ຈະຖືກສົ່ງເປັນ:",
  
  // Loading States
  submitting: "ກຳລັງສົ່ງຂໍ້ມູນ...",
};

interface Props {
  form: Omit<Checkin, "checkin_id">;
  setForm: React.Dispatch<React.SetStateAction<Omit<Checkin, "checkin_id">>>;
  handleSubmit: (e: React.FormEvent) => void;
  loading: boolean;
}

// Convert Date to PostgreSQL timestamp format in LOCAL time
const toPostgresTimestamp = (date: Date): string => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  const hours = String(date.getHours()).padStart(2, "0");
  const minutes = String(date.getMinutes()).padStart(2, "0");
  const seconds = String(date.getSeconds()).padStart(2, "0");
  const milliseconds = String(date.getMilliseconds()).padStart(3, "0");

  return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}.${milliseconds}`;
};

// Parse PostgreSQL timestamp - treat as LOCAL time
const fromPostgresTimestamp = (timestamp: string): Date => {
  if (!timestamp) return new Date();

  try {
    const [datePart, timePart] = timestamp.split(" ");
    if (!datePart || !timePart) return new Date();

    const [year, month, day] = datePart.split("-").map(Number);
    const [time, milliseconds] = timePart.split(".");
    const [hours, minutes, seconds] = time.split(":").map(Number);

    const date = new Date(year, month - 1, day, hours, minutes, seconds);

    if (milliseconds) {
      date.setMilliseconds(parseInt(milliseconds.substring(0, 3)));
    }

    return date;
  } catch (error) {
    console.error("Error parsing PostgreSQL timestamp:", error);
    return new Date();
  }
};

// Format date for display (24-hour format) in LOCAL time
const formatDisplayDate = (date: Date): string => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  const hours = String(date.getHours()).padStart(2, "0");
  const minutes = String(date.getMinutes()).padStart(2, "0");
  const seconds = String(date.getSeconds()).padStart(2, "0");

  return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
};

// Custom DateTimePicker Component
const DateTimePicker: React.FC<{
  value: Date;
  onChange: (date: Date) => void;
  onTextChange: (timestamp: string) => void;
}> = ({ value, onChange, onTextChange }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [textInput, setTextInput] = useState("");
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    setTextInput(toPostgresTimestamp(value));
  }, [value]);

  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedDate = new Date(e.target.value + "T00:00:00");
    const newDate = new Date(value);
    newDate.setFullYear(
      selectedDate.getFullYear(),
      selectedDate.getMonth(),
      selectedDate.getDate()
    );
    onChange(newDate);
    const newTimestamp = toPostgresTimestamp(newDate);
    setTextInput(newTimestamp);
    onTextChange(newTimestamp);
  };

  const handleTimeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const [hours, minutes] = e.target.value.split(":").map(Number);
    const newDate = new Date(value);
    newDate.setHours(hours, minutes, 0, 0);
    onChange(newDate);
    const newTimestamp = toPostgresTimestamp(newDate);
    setTextInput(newTimestamp);
    onTextChange(newTimestamp);
  };

  const handleTextInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setTextInput(value);

    try {
      const date = fromPostgresTimestamp(value);
      if (!isNaN(date.getTime())) {
        onChange(date);
        onTextChange(value);
      }
    } catch (error) {
      onTextChange(value);
    }
  };

  const formatDateForInput = (date: Date): string => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  const formatTimeForInput = (date: Date): string => {
    return `${String(date.getHours()).padStart(2, "0")}:${String(
      date.getMinutes()
    ).padStart(2, "0")}`;
  };

  if (!isMounted) {
    return (
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
            {LAO_TRANSLATIONS.postgresFormat}
          </label>
          <div className="w-full px-3.5 py-2.5 rounded-xl border-2 border-zinc-200 dark:border-zinc-600 bg-zinc-100 dark:bg-zinc-700/30 animate-pulse">
            <div className="h-4 bg-zinc-300 dark:bg-zinc-600 rounded-lg"></div>
          </div>
        </div>
        <div className="relative">
          <button
            type="button"
            className="w-full px-3.5 py-2.5 rounded-xl border-2 border-zinc-200 dark:border-zinc-600 bg-zinc-100 dark:bg-zinc-700/30 animate-pulse text-left flex justify-between items-center"
            disabled
          >
            <div className="h-4 bg-zinc-300 dark:bg-zinc-600 rounded-lg w-3/4"></div>
            <svg className="w-4 h-4 text-zinc-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Text Input for direct timestamp entry */}
      <div>
        <label className="block text-sm font-semibold text-zinc-800 dark:text-zinc-200 mb-2">
          {LAO_TRANSLATIONS.postgresFormat}
        </label>
        <input
          type="text"
          value={textInput}
          onChange={handleTextInputChange}
          placeholder="YYYY-MM-DD HH:MM:SS.SSS"
          className="w-full px-4 py-3 rounded-xl border-2 border-zinc-200 dark:border-zinc-600 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 font-mono text-sm shadow-sm"
        />
        <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-2">
          {LAO_TRANSLATIONS.formatHint}
        </p>
      </div>

      {/* Visual Date/Time Picker */}
      <div className="relative">
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className="w-full px-4 py-3 rounded-xl border-2 border-zinc-200 dark:border-zinc-600 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 text-left flex justify-between items-center shadow-sm hover:shadow-md"
        >
          <span className="font-medium">{LAO_TRANSLATIONS.useDateTimePicker}: {formatDisplayDate(value)}</span>
          <svg className="w-5 h-5 text-zinc-500 transform transition-transform duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={isOpen ? "M5 15l7-7 7 7" : "M19 9l-7 7-7-7"} />
          </svg>
        </button>

        {isOpen && (
          <div className="absolute top-full left-0 mt-3 w-full bg-white dark:bg-zinc-800 border-2 border-zinc-200 dark:border-zinc-600 rounded-2xl shadow-2xl z-50 p-6 space-y-4 backdrop-blur-sm">
            {/* Date Picker */}
            <div>
              <label className="block text-sm font-semibold text-zinc-800 dark:text-zinc-200 mb-2">
                {LAO_TRANSLATIONS.date}
              </label>
              <input
                type="date"
                value={formatDateForInput(value)}
                onChange={handleDateChange}
                className="w-full px-4 py-3 rounded-xl border-2 border-zinc-200 dark:border-zinc-600 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
              />
            </div>

            {/* Time Picker */}
            <div>
              <label className="block text-sm font-semibold text-zinc-800 dark:text-zinc-200 mb-2">
                {LAO_TRANSLATIONS.time}
              </label>
              <input
                type="time"
                value={formatTimeForInput(value)}
                onChange={handleTimeChange}
                className="w-full px-4 py-3 rounded-xl border-2 border-zinc-200 dark:border-zinc-600 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
              />
            </div>

            {/* Quick Actions */}
            <div className="flex gap-3 pt-4 border-t border-zinc-200 dark:border-zinc-700">
              <button
                type="button"
                onClick={() => {
                  const now = new Date();
                  onChange(now);
                  const newTimestamp = toPostgresTimestamp(now);
                  setTextInput(newTimestamp);
                  onTextChange(newTimestamp);
                }}
                className="flex-1 px-4 py-2.5 text-sm bg-blue-500 hover:bg-blue-600 dark:bg-blue-600 dark:hover:bg-blue-700 text-white rounded-xl transition-all duration-200 shadow-sm hover:shadow-md font-medium"
              >
                {LAO_TRANSLATIONS.setToNowBtn}
              </button>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="flex-1 px-4 py-2.5 text-sm bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-700 dark:hover:bg-zinc-600 text-zinc-700 dark:text-zinc-300 rounded-xl transition-all duration-200 shadow-sm hover:shadow-md font-medium"
              >
                {LAO_TRANSLATIONS.done}
              </button>
            </div>
          </div>
        )}

        {isOpen && (
          <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />
        )}
      </div>
    </div>
  );
};

const CheckinForm: React.FC<Props> = ({
  form,
  setForm,
  handleSubmit,
  loading,
}) => {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    if (name === "latitude" || name === "longitude") {
      setForm({
        ...form,
        [name]: value === "" ? undefined : parseFloat(value),
      });
    } else if (name === "device_id") {
      const device = DEVICE_OPTIONS.find((d) => d.id === value);
      if (device) {
        setForm({
          ...form,
          device_id: value,
          latitude: device.lat,
          longitude: device.lng,
        });
      } else {
        setForm({ ...form, device_id: value });
      }
    } else {
      setForm({ ...form, [name]: value });
    }
  };

  const setNow = () => {
    const postgresTimestamp = toPostgresTimestamp(new Date());
    setForm({ ...form, punch_time: postgresTimestamp });
  };

  useEffect(() => {
    if (!form.punch_time && isMounted) {
      setNow();
    }
  }, [isMounted]);

  const handleSubmitDirect = (e: React.FormEvent) => {
    e.preventDefault();
    handleSubmit(e);
  };

  const selectedDate = useMemo(() => {
    if (!form.punch_time) return new Date();
    try {
      if (typeof form.punch_time === "string") {
        return fromPostgresTimestamp(form.punch_time);
      }
      return new Date();
    } catch (error) {
      console.error("Error parsing date:", error);
      return new Date();
    }
  }, [form.punch_time]);

  const handleDateTimeChange = (date: Date) => {
    const postgresTimestamp = toPostgresTimestamp(date);
    setForm({ ...form, punch_time: postgresTimestamp });
  };

  const handleTextInputChange = (timestamp: string) => {
    setForm({ ...form, punch_time: timestamp });
  };

  if (!isMounted) {
    return (
      <div className="bg-white dark:bg-zinc-900/90 backdrop-blur-sm rounded-3xl shadow-2xl p-6 sm:p-8 space-y-6 border border-zinc-100 dark:border-zinc-800">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <div className="h-4 bg-zinc-300 dark:bg-zinc-700 rounded-full w-1/3 animate-pulse"></div>
            <div className="h-12 bg-zinc-200 dark:bg-zinc-800 rounded-2xl animate-pulse"></div>
          </div>
          <div className="space-y-2">
            <div className="h-4 bg-zinc-300 dark:bg-zinc-700 rounded-full w-1/3 animate-pulse"></div>
            <div className="h-12 bg-zinc-200 dark:bg-zinc-800 rounded-2xl animate-pulse"></div>
          </div>
        </div>
        <div className="h-12 bg-zinc-200 dark:bg-zinc-800 rounded-2xl animate-pulse"></div>
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmitDirect}
      className="bg-white dark:bg-zinc-900/90 backdrop-blur-sm rounded-3xl shadow-2xl p-6 sm:p-8 space-y-6 border border-zinc-100 dark:border-zinc-800 transition-all duration-300"
    >
      {/* Form Header */}
      <div className="text-center mb-2">
        <h2 className="text-2xl font-bold text-zinc-800 dark:text-zinc-100 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
          {LAO_TRANSLATIONS.checkinForm}
        </h2>
      </div>

      {/* Employee & Device */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-semibold text-zinc-800 dark:text-zinc-200 mb-2">
            {LAO_TRANSLATIONS.employeeCode}
          </label>
          <input
            type="text"
            name="emp_code"
            value={form.emp_code}
            onChange={handleChange}
            placeholder={LAO_TRANSLATIONS.employeePlaceholder}
            className="w-full px-4 py-3 rounded-2xl border-2 border-zinc-200 dark:border-zinc-600 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 shadow-sm hover:shadow-md"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-semibold text-zinc-800 dark:text-zinc-200 mb-2">
            {LAO_TRANSLATIONS.deviceId}
          </label>
          <select
            name="device_id"
            value={form.device_id || ""}
            onChange={handleChange}
            className="w-full px-4 py-3 rounded-2xl border-2 border-zinc-200 dark:border-zinc-600 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 shadow-sm hover:shadow-md appearance-none"
          >
            <option value="">{LAO_TRANSLATIONS.selectDevice}</option>
            {DEVICE_OPTIONS.map((device) => (
              <option key={device.id} value={device.id}>
                {device.name} ({device.id})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Location */}
      <div>
        <label className="block text-sm font-semibold text-zinc-800 dark:text-zinc-200 mb-2">
          {LAO_TRANSLATIONS.location}
        </label>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <input
            type="number"
            name="latitude"
            value={form.latitude ?? ""}
            onChange={handleChange}
            placeholder={LAO_TRANSLATIONS.latitude}
            step="0.000001"
            className="w-full px-4 py-3 rounded-2xl border-2 border-zinc-200 dark:border-zinc-600 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 shadow-sm hover:shadow-md font-mono"
          />
          <input
            type="number"
            name="longitude"
            value={form.longitude ?? ""}
            onChange={handleChange}
            placeholder={LAO_TRANSLATIONS.longitude}
            step="0.000001"
            className="w-full px-4 py-3 rounded-2xl border-2 border-zinc-200 dark:border-zinc-600 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 shadow-sm hover:shadow-md font-mono"
          />
        </div>
        <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-3">
          {LAO_TRANSLATIONS.locationHint}
        </p>
      </div>

      {/* Status & Comments */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-semibold text-zinc-800 dark:text-zinc-200 mb-2">
            {LAO_TRANSLATIONS.status}
          </label>
          <select
            name="status"
            value={form.status}
            onChange={handleChange}
            className="w-full px-4 py-3 rounded-2xl border-2 border-zinc-200 dark:border-zinc-600 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 shadow-sm hover:shadow-md appearance-none"
          >
            <option value="normal">{LAO_TRANSLATIONS.statusOptions.normal}</option>
            <option value="late">{LAO_TRANSLATIONS.statusOptions.late}</option>
            <option value="early">{LAO_TRANSLATIONS.statusOptions.early}</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-semibold text-zinc-800 dark:text-zinc-200 mb-2">
            {LAO_TRANSLATIONS.comments}
          </label>
          <input
            type="text"
            name="comments"
            value={form.comments || ""}
            onChange={handleChange}
            placeholder={LAO_TRANSLATIONS.commentsPlaceholder}
            className="w-full px-4 py-3 rounded-2xl border-2 border-zinc-200 dark:border-zinc-600 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 shadow-sm hover:shadow-md"
          />
        </div>
      </div>

      {/* Punch Time - Text Input + Date/Time Picker */}
      <div className="border-2 border-zinc-200 dark:border-zinc-600 rounded-3xl p-6 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-zinc-800/50 dark:to-zinc-700/50">
        <div className="flex justify-between items-start mb-4">
          <label className="block text-lg font-bold text-zinc-800 dark:text-zinc-200">
            {LAO_TRANSLATIONS.punchTimeTitle}
          </label>
          <button
            type="button"
            onClick={setNow}
            className="px-4 py-2 bg-blue-500 hover:bg-blue-600 dark:bg-blue-600 dark:hover:bg-blue-700 text-white rounded-xl transition-all duration-200 shadow-sm hover:shadow-md text-sm font-medium"
          >
            {LAO_TRANSLATIONS.setToNow}
          </button>
        </div>

        <DateTimePicker
          value={selectedDate}
          onChange={handleDateTimeChange}
          onTextChange={handleTextInputChange}
        />

        <div className="mt-4 p-4 bg-blue-100 dark:bg-blue-900/30 rounded-2xl border border-blue-200 dark:border-blue-800">
          <p className="text-sm font-semibold text-blue-700 dark:text-blue-300 text-center">
            <strong>{LAO_TRANSLATIONS.currentSelection}:</strong> {formatDisplayDate(selectedDate)}
          </p>
          <p className="text-xs text-blue-600 dark:text-blue-400 text-center mt-2">
            {LAO_TRANSLATIONS.willBeSubmitted}{" "}
            <code className="bg-blue-200 dark:bg-blue-800 px-2 py-1 rounded-lg font-mono">
              {form.punch_time}
            </code>
          </p>
        </div>
      </div>

      {/* Submit Button */}
      <button
        type="submit"
        disabled={loading}
        className="w-full py-4 px-6 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-bold rounded-2xl shadow-lg transition-all duration-300 transform hover:scale-[1.02] hover:shadow-xl disabled:opacity-70 disabled:cursor-not-allowed disabled:transform-none disabled:hover:shadow-lg"
      >
        {loading ? (
          <span className="flex items-center justify-center">
            <svg
              className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                opacity="0.25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              />
              <path
                opacity="0.75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              ></path>
            </svg>
            {LAO_TRANSLATIONS.submitting}
          </span>
        ) : (
          LAO_TRANSLATIONS.submitCheckin
        )}
      </button>
    </form>
  );
};

export default CheckinForm;