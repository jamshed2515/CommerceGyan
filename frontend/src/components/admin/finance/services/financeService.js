import API from "@/config/api";

const getHeaders = (token) => ({
  Authorization: `Bearer ${token}`,
  "Content-Type": "application/json",
});

export const financeService = {
  async fetchFees(token) {
    const res = await fetch(`${API}/api/fees`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!res.ok) throw new Error("Failed to fetch fee records");
    return res.json();
  },

  async createFee(token, data) {
    const res = await fetch(`${API}/api/fees`, {
      method: "POST",
      headers: getHeaders(token),
      body: JSON.stringify(data),
    });
    const d = await res.json();
    if (!res.ok) throw new Error(d.message || "Failed to create fee record");
    return d;
  },

  async updateFee(token, id, data) {
    const res = await fetch(`${API}/api/fees/${id}`, {
      method: "PUT",
      headers: getHeaders(token),
      body: JSON.stringify(data),
    });
    const d = await res.json();
    if (!res.ok) throw new Error(d.message || "Failed to update fee record");
    return d;
  },

  async recordPayment(token, feeId, data) {
    const res = await fetch(`${API}/api/fees/${feeId}/payments`, {
      method: "POST",
      headers: getHeaders(token),
      body: JSON.stringify(data),
    });
    const d = await res.json();
    if (!res.ok) throw new Error(d.message || "Failed to record payment");
    return d;
  },

  async addMonthlyBill(token, feeId, data) {
    const res = await fetch(`${API}/api/fees/${feeId}/monthly-bills`, {
      method: "POST",
      headers: getHeaders(token),
      body: JSON.stringify(data),
    });
    const d = await res.json();
    if (!res.ok) throw new Error(d.message || "Failed to add billing month");
    return d;
  },

  async deleteFee(token, id) {
    const res = await fetch(`${API}/api/fees/${id}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    });
    const d = await res.json();
    if (!res.ok) throw new Error(d.message || "Failed to delete fee record");
    return d;
  },

  async fetchStudentEnrollments(token, studentId) {
    const res = await fetch(`${API}/api/admin/students/${studentId}/enrollments`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!res.ok) throw new Error("Failed to fetch student enrollments");
    return res.json();
  },
};
