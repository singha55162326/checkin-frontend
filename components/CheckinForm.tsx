"use client";
import React, { useState, useMemo, useEffect } from "react";
import { Checkin } from "../utils/api";

// 1. SETUP REFERENCE COORDINATES
const REF_LAT = 17.94129164219055;
const REF_LNG = 102.62828918111205;

// 2. HELPER FUNCTION: Generate random coordinate with ~20-30m variance
const getRandomCoordinate = (base: number) => {
  // 0.0003 degrees is roughly 30 meters
  const variance = 0.0003;
  // Math.random() - 0.5 generates a number between -0.5 and 0.5
  const randomOffset = (Math.random() - 0.5) * 2 * variance;
  return base + randomOffset;
};

// You can keep these here for ID/Name reference,
// but we will override the lat/lng logic in the component
const DEVICE_OPTIONS = [
  {
    id: "HONORBRP-NX1",
    name: "HONOR BRP-NX1",
  },
  {
    id: "InfinixInfinix X6851B",
    name: "InfinixInfinix X6851B",
  },
  {
    id: "OPPOCPH1931",
    name: "OPPO CPH1931",
  },
  {
    id: "BB6AC43C-DA37-43C1-926C-51D6A5474B86",
    name: "iPhone (16 Pro) ",
  },
  // {
  //   id: "Redmi2201116TG",
  //   name: "Redmi 2201116TG",
  // },
  // {
  //   id: "65B2643C-3D92-49D3-983A-248D8DF22C90",
  //   name: "iPhone SE (2nd generation)",
  // },
  // {
  //   id: "vivoV2309A",
  //   name: "vivo V2309A",
  // },
];

// ... [Keep LAO_TRANSLATIONS and Helper Functions like toPostgresTimestamp as they were] ...
const LAO_TRANSLATIONS = {
  // Form Titles
  checkinForm: "ແບບຟອມການກົດເຂົ້າງານ",
  submitCheckin: "✅ ສົ່ງຂໍ້ມູນການກົດເຂົ້າງານ",

  // Employee Section
  employeeCode: "ລະຫັດພະນັກງານ *",
  employeePlaceholder: "ຕົວຢ່າງ: EMP123",

  // Device Section
  deviceId: "ລະຫັດອຸປະກອນໂທລະສັບຂອງທ່ານ",
  selectDevice: "ເລືອກອຸປະກອນໂທລະສັບ",

  // Location Section
  location: "ສະຖານທີ່ (ຕັ້ງຄ່າອັດຕະໂນມັດຈາກອຸປະກອນ)",
  latitude: "ເສັ້ນຂະໜານ",
  longitude: "ເສັ້ນແວງ",
  locationHint:
    "ພິກັດຈະຖືກຕັ້ງຄ່າອັດຕະໂນມັດ (ແບບສຸ່ມໃກ້ຄຽງຈຸດອ້າງອີງ). ທ່ານສາມາດແກ້ໄຂໄດ້ດ້ວຍຕົນເອງ.", // Updated hint

  // Status & Comments
  status: "ສະຖານະ",
  comments: "ຄຳເຫັນ",
  commentsPlaceholder: "ຕົວຢ່າງ: ເຂົ້າຫ້ອງການ",
  statusOptions: {
    normal: "ປົກກະຕິ",
    late: "ມາຊ້າ",
    early: "ອອກເຊົ້າ",
  },

  // Punch Time Section
  punchTime: "ເວລາກົດເຂົ້າງານ",
  punchTimeTitle: "ເວລາກົດເຂົ້າງານ",
  setToNow: "ຕັ້ງເປັນປັດຈຸບັນ",
  useDateTimePicker: "📅 ໃຊ້ຕົວເລືອກວັນທີ/ເວລາ",
  postgresFormat: "ຮູບແບບ PostgreSQL",
  formatHint:
    "ຮູບແບບ: YYYY-MM-DD HH:MM:SS.SSSSSS (ຕົວຢ່າງ: 2025-10-22 17:35:30.694356)",
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

// ... [Keep DateTimePicker Component exactly as it was] ...

interface Props {
  form: Omit<Checkin, "checkin_id">;
  setForm: React.Dispatch<React.SetStateAction<Omit<Checkin, "checkin_id">>>;
  handleSubmit: (e: React.FormEvent) => void;
  loading: boolean;
}

// ... [Keep timestamp helper functions here] ...
const toPostgresTimestamp = (date: Date): string => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  const hours = String(date.getHours()).padStart(2, "0");
  const minutes = String(date.getMinutes()).padStart(2, "0");
  const seconds = String(date.getSeconds()).padStart(2, "0");
  const ms = date.getMilliseconds();
  const randomFraction = Math.floor(Math.random() * 1000)
    .toString()
    .padStart(3, "0");
  const fakeMicroseconds = `${String(ms).padStart(3, "0")}${randomFraction}`;
  return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}.${fakeMicroseconds}`;
};

const fromPostgresTimestamp = (timestamp: string): Date => {
  if (!timestamp) return new Date();
  try {
    const [datePart, timePart] = timestamp.split(" ");
    if (!datePart || !timePart) return new Date();
    const [year, month, day] = datePart.split("-").map(Number);
    const [time, microsecondsStr = "0"] = timePart.split(".");
    const [hours, minutes, seconds] = time.split(":").map(Number);
    const fullMicroseconds = microsecondsStr.padEnd(6).substring(0, 6);
    const microseconds = parseInt(fullMicroseconds, 10);
    const milliseconds = Math.floor(microseconds / 1000);
    return new Date(
      year,
      month - 1,
      day,
      hours,
      minutes,
      seconds,
      milliseconds
    );
  } catch (error) {
    return new Date();
  }
};

const formatDisplayDate = (date: Date): string => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  const hours = String(date.getHours()).padStart(2, "0");
  const minutes = String(date.getMinutes()).padStart(2, "0");
  const seconds = String(date.getSeconds()).padStart(2, "0");
  return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
};

// [Place DateTimePicker component here - omitted for brevity as it is unchanged]
const DateTimePicker: React.FC<{
  value: Date;
  onChange: (date: Date) => void;
  onTextChange: (timestamp: string) => void;
}> = ({ value, onChange, onTextChange }) => {
  // ... [Same DateTimePicker code as provided previously] ...
  // (Assuming you have the DateTimePicker code from the previous snippet, paste it here)
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

  const formatDateForInput = (date: Date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  const formatTimeForInput = (date: Date) =>
    `${String(date.getHours()).padStart(2, "0")}:${String(
      date.getMinutes()
    ).padStart(2, "0")}`;

  if (!isMounted)
    return <div className="h-10 bg-gray-100 rounded animate-pulse"></div>;

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-semibold text-zinc-800 dark:text-zinc-200 mb-2">
          {LAO_TRANSLATIONS.postgresFormat}
        </label>
        <input
          type="text"
          value={textInput}
          onChange={handleTextInputChange}
          placeholder="YYYY-MM-DD HH:MM:SS.SSSSSS"
          className="w-full px-4 py-3 rounded-xl border-2 border-zinc-200 dark:border-zinc-600 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>
      <div className="relative">
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className="w-full px-4 py-3 rounded-xl border-2 border-zinc-200 dark:border-zinc-600 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-blue-500 text-left flex justify-between items-center shadow-sm"
        >
          <span className="font-medium">
            {LAO_TRANSLATIONS.useDateTimePicker}: {formatDisplayDate(value)}
          </span>
          <span>▼</span>
        </button>
        {isOpen && (
          <div className="absolute top-full left-0 mt-3 w-full bg-white dark:bg-zinc-800 border-2 border-zinc-200 dark:border-zinc-600 rounded-2xl shadow-2xl z-50 p-6 space-y-4 backdrop-blur-sm">
            <div>
              <label className="block text-sm font-semibold mb-2">
                {LAO_TRANSLATIONS.date}
              </label>
              <input
                type="date"
                value={formatDateForInput(value)}
                onChange={handleDateChange}
                className="w-full p-2 border rounded dark:bg-zinc-700 dark:text-white"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold mb-2">
                {LAO_TRANSLATIONS.time}
              </label>
              <input
                type="time"
                value={formatTimeForInput(value)}
                onChange={handleTimeChange}
                className="w-full p-2 border rounded dark:bg-zinc-700 dark:text-white"
              />
            </div>
            <div className="flex gap-3 pt-4 border-t">
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg"
              >
                {LAO_TRANSLATIONS.done}
              </button>
            </div>
          </div>
        )}
        {isOpen && (
          <div
            className="fixed inset-0 z-40"
            onClick={() => setIsOpen(false)}
          />
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

  // 3. UPDATED HANDLE CHANGE LOGIC
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
      // Find device for name reference if needed,
      // BUT IGNORE its hardcoded lat/lng in favor of randomization
      const device = DEVICE_OPTIONS.find((d) => d.id === value);

      if (value === "") {
        // If user clears selection
        setForm({ ...form, device_id: value });
      } else {
        // GENERATE RANDOM COORDINATES HERE
        setForm({
          ...form,
          device_id: value,
          latitude: getRandomCoordinate(REF_LAT), // Randomizes around 17.941...
          longitude: getRandomCoordinate(REF_LNG), // Randomizes around 102.628...
        });
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
    return <div className="p-8">Loading...</div>;
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
            className="w-full px-4 py-3 rounded-2xl border-2 border-zinc-200 dark:border-zinc-600 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
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
            className="w-full px-4 py-3 rounded-2xl border-2 border-zinc-200 dark:border-zinc-600 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">{LAO_TRANSLATIONS.selectDevice}</option>
            {DEVICE_OPTIONS.map((device) => (
              <option key={device.id} value={device.id}>
                {device.name}
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
            step="0.00000000000001"
            className="w-full px-4 py-3 rounded-2xl border-2 border-zinc-200 dark:border-zinc-600 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono"
          />
          <input
            type="number"
            name="longitude"
            value={form.longitude ?? ""}
            onChange={handleChange}
            placeholder={LAO_TRANSLATIONS.longitude}
            step="0.00000000000001"
            className="w-full px-4 py-3 rounded-2xl border-2 border-zinc-200 dark:border-zinc-600 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono"
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
            className="w-full px-4 py-3 rounded-2xl border-2 border-zinc-200 dark:border-zinc-600 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="normal">
              {LAO_TRANSLATIONS.statusOptions.normal}
            </option>
            <option value="late">{LAO_TRANSLATIONS.statusOptions.late}</option>
            <option value="early">
              {LAO_TRANSLATIONS.statusOptions.early}
            </option>
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
            className="w-full px-4 py-3 rounded-2xl border-2 border-zinc-200 dark:border-zinc-600 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      {/* Punch Time */}
      <div className="border-2 border-zinc-200 dark:border-zinc-600 rounded-3xl p-6 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-zinc-800/50 dark:to-zinc-700/50">
        <div className="flex justify-between items-start mb-4">
          <label className="block text-lg font-bold text-zinc-800 dark:text-zinc-200">
            {LAO_TRANSLATIONS.punchTimeTitle}
          </label>
          <button
            type="button"
            onClick={setNow}
            className="px-4 py-2 bg-blue-500 hover:bg-blue-600 dark:bg-blue-600 text-white rounded-xl shadow-sm text-sm font-medium"
          >
            {LAO_TRANSLATIONS.setToNow}
          </button>
        </div>

        <DateTimePicker
          value={selectedDate}
          onChange={handleDateTimeChange}
          onTextChange={handleTextInputChange}
        />
      </div>

      {/* Submit Button */}
      <button
        type="submit"
        disabled={loading}
        className="w-full py-4 px-6 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-bold rounded-2xl shadow-lg transition-all duration-300 hover:scale-[1.02] disabled:opacity-70 disabled:cursor-not-allowed"
      >
        {loading ? LAO_TRANSLATIONS.submitting : LAO_TRANSLATIONS.submitCheckin}
      </button>
    </form>
  );
};

export default CheckinForm;
