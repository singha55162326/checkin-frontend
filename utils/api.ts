import axios from "axios";

export const API_URL = process.env.NEXT_PUBLIC_API_URL;

export interface Checkin {
  checkin_id: number;
  emp_code: string;
  punch_time: string;
  device_id?: string;
  latitude?: number;
  longitude?: number;
  status: string;
  comments?: string;
}

export interface PaginatedCheckins {
  data: Checkin[];
  page: number;
  totalPages: number;
}

// Updated fetchCheckins to support filtering
export const fetchCheckins = async (
  page = 1,
  empCode = "",
  search = "",
  limit = 50
): Promise<PaginatedCheckins> => {
  const params = new URLSearchParams({
    page: page.toString(),
    limit: limit.toString(),
  });

  if (empCode) {
    params.append("emp_code", empCode);
  }

  if (search) {
    params.append("search", search);
  }

  const res = await axios.get(`${API_URL}/checkin?${params.toString()}`);
  return res.data;
};

export const addCheckin = async (data: Omit<Checkin, "checkin_id">) => {
  const res = await axios.post(`${API_URL}/checkin`, data);
  return res.data;
};

// Add PUT and DELETE operations
export const updateCheckin = async (id: number, data: Partial<Checkin>) => {
  const res = await axios.put(`${API_URL}/checkin/${id}`, data);
  return res.data;
};

export const deleteCheckin = async (id: number) => {
  await axios.delete(`${API_URL}/checkin/${id}`);
};