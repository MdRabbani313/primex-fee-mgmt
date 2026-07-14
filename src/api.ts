import { Student, CourseFeeStructure, FeeRecord, Payment, User, DashboardStats, Branch } from './types';

// Default Seed Data (same as server.ts)
const defaultCourses: CourseFeeStructure[] = [
  { id: "c1", courseName: "Full Stack Web Development", totalFee: 45000, monthlyFee: 5000, dueDateDay: 10 },
  { id: "c2", courseName: "Data Science & AI", totalFee: 60000, monthlyFee: 6000, dueDateDay: 10 },
  { id: "c3", courseName: "Digital Marketing", totalFee: 30000, monthlyFee: 3500, dueDateDay: 10 },
  { id: "c4", courseName: "UI/UX Design", totalFee: 35000, monthlyFee: 4000, dueDateDay: 10 }
];

const defaultStudents: Student[] = [
  { id: "s1", name: "Amit Sharma", email: "amit.sharma@example.com", phone: "+919876543210", branch: "Urga", course: "Full Stack Web Development", batch: "Batch A - Morning", admissionDate: "2026-05-10", status: "Active" },
  { id: "s2", name: "Priya Patel", email: "priya.patel@example.com", phone: "+918765432109", branch: "Urga", course: "Data Science & AI", batch: "Batch B - Evening", admissionDate: "2026-06-01", status: "Active" },
  { id: "s3", name: "Rahul Verma", email: "rahul.verma@example.com", phone: "+917654321098", branch: "Urga", course: "UI/UX Design", batch: "Batch A - Morning", admissionDate: "2026-06-15", status: "Active" },
  { id: "s4", name: "Sneha Reddy", email: "sneha.reddy@example.com", phone: "+916543210987", branch: "Niharika", course: "Full Stack Web Development", batch: "Batch B - Evening", admissionDate: "2026-05-12", status: "Active" },
  { id: "s5", name: "Vikram Singh", email: "vikram.singh@example.com", phone: "+919988776655", branch: "Niharika", course: "Digital Marketing", batch: "Weekend Batch", admissionDate: "2026-06-10", status: "Active" },
  { id: "s6", name: "Ananya Das", email: "ananya.das@example.com", phone: "+918877665544", branch: "Niharika", course: "UI/UX Design", batch: "Batch A - Morning", admissionDate: "2026-07-01", status: "Active" },
  { id: "s7", name: "Deepak Kumar", email: "deepak.k@example.com", phone: "+917766554433", branch: "Urga", course: "Digital Marketing", batch: "Weekend Batch", admissionDate: "2026-07-02", status: "Active" }
];

const defaultFeeRecords: FeeRecord[] = [
  { id: "fr1", studentId: "s1", studentName: "Amit Sharma", branch: "Urga", course: "Full Stack Web Development", batch: "Batch A - Morning", title: "Admission Fee (Full Course)", amount: 45000, paidAmount: 45000, dueDate: "2026-05-15", status: "Paid", createdAt: "2026-05-10T10:00:00Z" },
  { id: "fr2", studentId: "s2", studentName: "Priya Patel", branch: "Urga", course: "Data Science & AI", batch: "Batch B - Evening", title: "Monthly Fee - June 2026", amount: 6000, paidAmount: 6000, dueDate: "2026-06-10", status: "Paid", createdAt: "2026-06-01T11:00:00Z" },
  { id: "fr3", studentId: "s2", studentName: "Priya Patel", branch: "Urga", course: "Data Science & AI", batch: "Batch B - Evening", title: "Monthly Fee - July 2026", amount: 6000, paidAmount: 2000, dueDate: "2026-07-10", status: "Partial", createdAt: "2026-07-01T09:00:00Z" },
  { id: "fr4", studentId: "s3", studentName: "Rahul Verma", branch: "Urga", course: "UI/UX Design", batch: "Batch A - Morning", title: "Monthly Fee - June 2026", amount: 4000, paidAmount: 0, dueDate: "2026-06-10", status: "Unpaid", createdAt: "2026-06-15T14:00:00Z" },
  { id: "fr5", studentId: "s3", studentName: "Rahul Verma", branch: "Urga", course: "UI/UX Design", batch: "Batch A - Morning", title: "Monthly Fee - July 2026", amount: 4000, paidAmount: 0, dueDate: "2026-07-10", status: "Unpaid", createdAt: "2026-07-01T09:00:00Z" },
  { id: "fr6", studentId: "s4", studentName: "Sneha Reddy", branch: "Niharika", course: "Full Stack Web Development", batch: "Batch B - Evening", title: "Admission Fee (Full Course)", amount: 45000, paidAmount: 30000, dueDate: "2026-05-20", status: "Partial", createdAt: "2026-05-12T10:30:00Z" },
  { id: "fr7", studentId: "s5", studentName: "Vikram Singh", branch: "Niharika", course: "Digital Marketing", batch: "Weekend Batch", title: "Monthly Fee - June 2026", amount: 3500, paidAmount: 3500, dueDate: "2026-06-10", status: "Paid", createdAt: "2026-06-10T12:00:00Z" },
  { id: "fr8", studentId: "s5", studentName: "Vikram Singh", branch: "Niharika", course: "Digital Marketing", batch: "Weekend Batch", title: "Monthly Fee - July 2026", amount: 3500, paidAmount: 0, dueDate: "2026-07-10", status: "Unpaid", createdAt: "2026-07-01T09:00:00Z" },
  { id: "fr9", studentId: "s6", studentName: "Ananya Das", branch: "Niharika", course: "UI/UX Design", batch: "Batch A - Morning", title: "Monthly Fee - July 2026", amount: 4000, paidAmount: 4000, dueDate: "2026-07-10", status: "Paid", createdAt: "2026-07-01T09:00:00Z" }
];

const defaultPayments: Payment[] = [
  { id: "p1", feeRecordId: "fr1", studentId: "s1", studentName: "Amit Sharma", branch: "Urga", receiptNo: "REC-2026-0001", amount: 45000, paymentDate: "2026-05-14", paymentMode: "Bank Transfer", notes: "Full course fee paid online" },
  { id: "p2", feeRecordId: "fr2", studentId: "s2", studentName: "Priya Patel", branch: "Urga", receiptNo: "REC-2026-0002", amount: 6000, paymentDate: "2026-06-08", paymentMode: "UPI", notes: "June fee" },
  { id: "p3", feeRecordId: "fr3", studentId: "s2", studentName: "Priya Patel", branch: "Urga", receiptNo: "REC-2026-0003", amount: 2000, paymentDate: "2026-07-09", paymentMode: "Cash", notes: "Partial payment for July" },
  { id: "p4", feeRecordId: "fr6", studentId: "s4", studentName: "Sneha Reddy", branch: "Niharika", receiptNo: "REC-2026-0004", amount: 30000, paymentDate: "2026-05-19", paymentMode: "Bank Transfer", notes: "Initial installment" },
  { id: "p5", feeRecordId: "fr7", studentId: "s5", studentName: "Vikram Singh", branch: "Niharika", receiptNo: "REC-2026-0005", amount: 3500, paymentDate: "2026-06-09", paymentMode: "UPI", notes: "June Month Fee" },
  { id: "p6", feeRecordId: "fr9", studentId: "s6", studentName: "Ananya Das", branch: "Niharika", receiptNo: "REC-2026-0006", amount: 4000, paymentDate: "2026-07-05", paymentMode: "UPI", notes: "July Month Fee" }
];

const USERS = [
  { id: "u1", username: "admin", password: "admin123", name: "Super Admin", role: "ADMIN" as const, branch: null },
  { id: "u2", username: "urga", password: "urga123", name: "Urga Manager", role: "BRANCH_URGA" as const, branch: "Urga" as const },
  { id: "u3", username: "niharika", password: "niharika123", name: "Niharika Manager", role: "BRANCH_NIHARIKA" as const, branch: "Niharika" as const }
];

// LocalStorage helpers
function getLocal<T>(key: string, defaultValue: T): T {
  const data = localStorage.getItem(key);
  if (!data) {
    localStorage.setItem(key, JSON.stringify(defaultValue));
    return defaultValue;
  }
  try {
    return JSON.parse(data);
  } catch {
    localStorage.setItem(key, JSON.stringify(defaultValue));
    return defaultValue;
  }
}

function setLocal<T>(key: string, val: T) {
  localStorage.setItem(key, JSON.stringify(val));
}

// Check if a response is non-JSON (like Vercel's 404 HTML)
async function tryParseJson(res: Response): Promise<any> {
  const contentType = res.headers.get("content-type") || "";
  if (!contentType.includes("application/json")) {
    throw new Error("NOT_JSON");
  }
  const text = await res.text();
  try {
    return JSON.parse(text);
  } catch {
    throw new Error("NOT_JSON");
  }
}

// ----------------------------------------------------
// LOCAL STORAGE SIMULATION DATABASE CONTROLLER
// ----------------------------------------------------
const localDb = {
  getStudents: () => getLocal<Student[]>("primex_local_students", defaultStudents),
  setStudents: (val: Student[]) => setLocal("primex_local_students", val),
  
  getCourses: () => getLocal<CourseFeeStructure[]>("primex_local_courses", defaultCourses),
  setCourses: (val: CourseFeeStructure[]) => setLocal("primex_local_courses", val),

  getFeeRecords: () => getLocal<FeeRecord[]>("primex_local_fee_records", defaultFeeRecords),
  setFeeRecords: (val: FeeRecord[]) => setLocal("primex_local_fee_records", val),

  getPayments: () => getLocal<Payment[]>("primex_local_payments", defaultPayments),
  setPayments: (val: Payment[]) => setLocal("primex_local_payments", val),

  getReceiptSeq: () => getLocal<number>("primex_local_receipt_seq", 7),
  setReceiptSeq: (val: number) => setLocal("primex_local_receipt_seq", val),

  getUser: (): User | null => getLocal<User | null>("primex_local_user", null),
  setUser: (val: User | null) => setLocal("primex_local_user", val)
};

// ----------------------------------------------------
// HYBRID EXPORTS WITH AUTOMATIC FALLBACK
// ----------------------------------------------------

export async function apiLogin(username: string, password: string): Promise<{ token: string; user: User }> {
  try {
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password })
    });
    const data = await tryParseJson(res);
    if (!res.ok) {
      throw new Error(data.message || "Invalid credentials");
    }
    return data;
  } catch (err: any) {
    if (err.message === "NOT_JSON" || err.message.includes("fetch") || err instanceof TypeError) {
      // Simulate client-side login
      const match = USERS.find(u => u.username === username.toLowerCase() && u.password === password);
      if (!match) {
        throw new Error("Invalid username or password (Offline/Local)");
      }
      const token = "mock-jwt-" + Math.random().toString(36).substring(2);
      localDb.setUser(match);
      return { token, user: match };
    }
    throw err;
  }
}

export async function apiGetMe(token: string): Promise<{ user: User }> {
  try {
    const res = await fetch('/api/auth/me', {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    const data = await tryParseJson(res);
    if (!res.ok) throw new Error(data.message || "Session error");
    return data;
  } catch (err: any) {
    if (err.message === "NOT_JSON" || err.message.includes("fetch") || err instanceof TypeError) {
      const cached = localDb.getUser();
      if (!cached) throw new Error("No cached session");
      return { user: cached };
    }
    throw err;
  }
}

export async function apiGetStudents(token: string, user: User): Promise<Student[]> {
  try {
    const res = await fetch('/api/students', {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    const data = await tryParseJson(res);
    if (!res.ok) throw new Error(data.message || "Failed to load students");
    return data;
  } catch (err: any) {
    if (err.message === "NOT_JSON" || err.message.includes("fetch") || err instanceof TypeError) {
      let list = localDb.getStudents();
      if (user.role === "BRANCH_URGA") {
        list = list.filter(s => s.branch === "Urga");
      } else if (user.role === "BRANCH_NIHARIKA") {
        list = list.filter(s => s.branch === "Niharika");
      }
      return list;
    }
    throw err;
  }
}

export async function apiAddStudent(token: string, payload: Omit<Student, 'id'>, user: User): Promise<Student> {
  try {
    const res = await fetch('/api/students', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(payload)
    });
    const data = await tryParseJson(res);
    if (!res.ok) throw new Error(data.message || "Failed to add student");
    return data;
  } catch (err: any) {
    if (err.message === "NOT_JSON" || err.message.includes("fetch") || err instanceof TypeError) {
      const newS: Student = {
        ...payload,
        id: "s_" + Date.now().toString(36)
      };
      const list = localDb.getStudents();
      list.push(newS);
      localDb.setStudents(list);
      return newS;
    }
    throw err;
  }
}

export async function apiEditStudent(token: string, id: string, payload: Partial<Student>, user: User): Promise<Student> {
  try {
    const res = await fetch(`/api/students/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(payload)
    });
    const data = await tryParseJson(res);
    if (!res.ok) throw new Error(data.message || "Failed to update student");
    return data;
  } catch (err: any) {
    if (err.message === "NOT_JSON" || err.message.includes("fetch") || err instanceof TypeError) {
      const list = localDb.getStudents();
      const idx = list.findIndex(s => s.id === id);
      if (idx === -1) throw new Error("Student not found locally");
      
      const updated = { ...list[idx], ...payload, id };
      list[idx] = updated;
      localDb.setStudents(list);

      // Sync with fee records
      let records = localDb.getFeeRecords();
      records = records.map(fr => {
        if (fr.studentId === id) {
          return {
            ...fr,
            studentName: updated.name,
            branch: updated.branch,
            course: updated.course,
            batch: updated.batch
          };
        }
        return fr;
      });
      localDb.setFeeRecords(records);

      return updated;
    }
    throw err;
  }
}

export async function apiDeleteStudent(token: string, id: string, user: User): Promise<void> {
  try {
    const res = await fetch(`/api/students/${id}`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${token}` }
    });
    const data = await tryParseJson(res);
    if (!res.ok) throw new Error(data.message || "Failed to delete student");
  } catch (err: any) {
    if (err.message === "NOT_JSON" || err.message.includes("fetch") || err instanceof TypeError) {
      let list = localDb.getStudents();
      list = list.filter(s => s.id !== id);
      localDb.setStudents(list);
      return;
    }
    throw err;
  }
}

export async function apiGetCourses(token: string): Promise<CourseFeeStructure[]> {
  try {
    const res = await fetch('/api/courses', {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    const data = await tryParseJson(res);
    if (!res.ok) throw new Error(data.message || "Failed to load courses");
    return data;
  } catch (err: any) {
    if (err.message === "NOT_JSON" || err.message.includes("fetch") || err instanceof TypeError) {
      return localDb.getCourses();
    }
    throw err;
  }
}

export async function apiAddCourse(token: string, payload: Omit<CourseFeeStructure, 'id'>): Promise<CourseFeeStructure> {
  try {
    const res = await fetch('/api/courses', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(payload)
    });
    const data = await tryParseJson(res);
    if (!res.ok) throw new Error(data.message || "Failed to add course");
    return data;
  } catch (err: any) {
    if (err.message === "NOT_JSON" || err.message.includes("fetch") || err instanceof TypeError) {
      const newC: CourseFeeStructure = {
        ...payload,
        id: "c_" + Date.now().toString(36)
      };
      const list = localDb.getCourses();
      list.push(newC);
      localDb.setCourses(list);
      return newC;
    }
    throw err;
  }
}

export async function apiEditCourse(token: string, id: string, payload: Partial<CourseFeeStructure>): Promise<CourseFeeStructure> {
  try {
    const res = await fetch(`/api/courses/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(payload)
    });
    const data = await tryParseJson(res);
    if (!res.ok) throw new Error(data.message || "Failed to update course");
    return data;
  } catch (err: any) {
    if (err.message === "NOT_JSON" || err.message.includes("fetch") || err instanceof TypeError) {
      const list = localDb.getCourses();
      const idx = list.findIndex(c => c.id === id);
      if (idx === -1) throw new Error("Course not found locally");

      const updated = { ...list[idx], ...payload, id };
      list[idx] = updated;
      localDb.setCourses(list);
      return updated;
    }
    throw err;
  }
}

export async function apiDeleteCourse(token: string, id: string): Promise<void> {
  try {
    const res = await fetch(`/api/courses/${id}`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${token}` }
    });
    const data = await tryParseJson(res);
    if (!res.ok) throw new Error(data.message || "Failed to delete course");
  } catch (err: any) {
    if (err.message === "NOT_JSON" || err.message.includes("fetch") || err instanceof TypeError) {
      let list = localDb.getCourses();
      list = list.filter(c => c.id !== id);
      localDb.setCourses(list);
      return;
    }
    throw err;
  }
}

export async function apiGetFeeRecords(token: string, user: User): Promise<FeeRecord[]> {
  try {
    const res = await fetch('/api/fee-records', {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    const data = await tryParseJson(res);
    if (!res.ok) throw new Error(data.message || "Failed to load fee records");
    return data;
  } catch (err: any) {
    if (err.message === "NOT_JSON" || err.message.includes("fetch") || err instanceof TypeError) {
      let list = localDb.getFeeRecords();
      if (user.role === "BRANCH_URGA") {
        list = list.filter(f => f.branch === "Urga");
      } else if (user.role === "BRANCH_NIHARIKA") {
        list = list.filter(f => f.branch === "Niharika");
      }
      return list;
    }
    throw err;
  }
}

export async function apiGenerateFee(token: string, payload: Omit<FeeRecord, 'id' | 'paidAmount' | 'status' | 'createdAt'>, user: User): Promise<FeeRecord> {
  try {
    const res = await fetch('/api/fee-records', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(payload)
    });
    const data = await tryParseJson(res);
    if (!res.ok) throw new Error(data.message || "Failed to generate fee record");
    return data;
  } catch (err: any) {
    if (err.message === "NOT_JSON" || err.message.includes("fetch") || err instanceof TypeError) {
      const newFR: FeeRecord = {
        ...payload,
        id: "fr_" + Date.now().toString(36),
        paidAmount: 0,
        status: "Unpaid",
        createdAt: new Date().toISOString()
      };
      const list = localDb.getFeeRecords();
      list.push(newFR);
      localDb.setFeeRecords(list);
      return newFR;
    }
    throw err;
  }
}

export async function apiGenerateBulkFees(token: string, payload: {
  branch: Branch;
  course: string;
  batch: string;
  title: string;
  amount: number;
  dueDate: string;
}, user: User): Promise<string> {
  try {
    const res = await fetch('/api/fee-records/bulk', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(payload)
    });
    const data = await tryParseJson(res);
    if (!res.ok) throw new Error(data.message || "Failed to trigger bulk billing");
    return data.message;
  } catch (err: any) {
    if (err.message === "NOT_JSON" || err.message.includes("fetch") || err instanceof TypeError) {
      const students = localDb.getStudents();
      const targetStudents = students.filter(s =>
        s.status === "Active" &&
        s.branch === payload.branch &&
        (!payload.course || s.course === payload.course) &&
        (!payload.batch || s.batch === payload.batch)
      );

      if (targetStudents.length === 0) {
        throw new Error("No active students found matching the criteria (Local)");
      }

      const list = localDb.getFeeRecords();
      const now = new Date().toISOString();

      targetStudents.forEach(s => {
        const newRecord: FeeRecord = {
          id: "fr_" + Math.random().toString(36).substring(2, 11) + "_" + Date.now(),
          studentId: s.id,
          studentName: s.name,
          branch: s.branch,
          course: s.course,
          batch: s.batch,
          title: payload.title,
          amount: Number(payload.amount),
          paidAmount: 0,
          dueDate: payload.dueDate,
          status: "Unpaid",
          createdAt: now
        };
        list.push(newRecord);
      });

      localDb.setFeeRecords(list);
      return `Successfully generated fee records for ${targetStudents.length} students locally.`;
    }
    throw err;
  }
}

export async function apiGetPayments(token: string, user: User): Promise<Payment[]> {
  try {
    const res = await fetch('/api/payments', {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    const data = await tryParseJson(res);
    if (!res.ok) throw new Error(data.message || "Failed to load payments");
    return data;
  } catch (err: any) {
    if (err.message === "NOT_JSON" || err.message.includes("fetch") || err instanceof TypeError) {
      let list = localDb.getPayments();
      if (user.role === "BRANCH_URGA") {
        list = list.filter(p => p.branch === "Urga");
      } else if (user.role === "BRANCH_NIHARIKA") {
        list = list.filter(p => p.branch === "Niharika");
      }
      return list;
    }
    throw err;
  }
}

export async function apiRecordPayment(token: string, payload: {
  feeRecordId: string;
  amount: number;
  paymentMode: 'Cash' | 'UPI' | 'Bank Transfer';
  notes?: string;
}, user: User): Promise<{ payment: Payment; feeRecord: FeeRecord }> {
  try {
    const res = await fetch('/api/payments', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(payload)
    });
    const data = await tryParseJson(res);
    if (!res.ok) throw new Error(data.message || "Failed to record payment");
    return data;
  } catch (err: any) {
    if (err.message === "NOT_JSON" || err.message.includes("fetch") || err instanceof TypeError) {
      const records = localDb.getFeeRecords();
      const rIdx = records.findIndex(r => r.id === payload.feeRecordId);
      if (rIdx === -1) throw new Error("Fee record not found locally");

      const feeRecord = records[rIdx];
      const paying = Number(payload.amount);
      const remaining = feeRecord.amount - feeRecord.paidAmount;

      if (paying <= 0) throw new Error("Payment amount must be greater than 0");
      if (paying > remaining) throw new Error(`Payment exceeds outstanding due of ${remaining}`);

      // Generate Receipt No
      const year = new Date().getFullYear();
      const seq = localDb.getReceiptSeq();
      const seqStr = String(seq).padStart(4, "0");
      const receiptNo = `REC-${year}-${seqStr}`;
      localDb.setReceiptSeq(seq + 1);

      // Create Payment
      const newP: Payment = {
        id: "p_" + Date.now().toString(36),
        feeRecordId: payload.feeRecordId,
        studentId: feeRecord.studentId,
        studentName: feeRecord.studentName,
        branch: feeRecord.branch,
        receiptNo,
        amount: paying,
        paymentDate: new Date().toISOString().split("T")[0],
        paymentMode: payload.paymentMode,
        notes: payload.notes || ""
      };

      const payments = localDb.getPayments();
      payments.push(newP);
      localDb.setPayments(payments);

      // Update Fee Record
      const newPaid = feeRecord.paidAmount + paying;
      const newStatus = newPaid >= feeRecord.amount ? "Paid" : "Partial";
      
      const updatedFR: FeeRecord = {
        ...feeRecord,
        paidAmount: newPaid,
        status: newStatus
      };
      records[rIdx] = updatedFR;
      localDb.setFeeRecords(records);

      return { payment: newP, feeRecord: updatedFR };
    }
    throw err;
  }
}

export async function apiGetReceipt(token: string, receiptNo: string, user?: User): Promise<{ payment: Payment; student: Student; feeRecord: FeeRecord }> {
  try {
    const res = await fetch(`/api/payments/receipt/${receiptNo}`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    const data = await tryParseJson(res);
    if (!res.ok) throw new Error(data.message || "Failed to load receipt");
    return data;
  } catch (err: any) {
    if (err.message === "NOT_JSON" || err.message.includes("fetch") || err instanceof TypeError) {
      const payments = localDb.getPayments();
      const payment = payments.find(p => p.receiptNo === receiptNo);
      if (!payment) throw new Error("Receipt not found locally");

      const students = localDb.getStudents();
      const student = students.find(s => s.id === payment.studentId);
      if (!student) throw new Error("Student associated with receipt not found");

      const records = localDb.getFeeRecords();
      const feeRecord = records.find(r => r.id === payment.feeRecordId);
      if (!feeRecord) throw new Error("Fee record associated with receipt not found");

      return { payment, student, feeRecord };
    }
    throw err;
  }
}

export async function apiGetReportsSummary(token: string, user: User): Promise<DashboardStats> {
  try {
    const res = await fetch('/api/reports/summary', {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    const data = await tryParseJson(res);
    if (!res.ok) throw new Error(data.message || "Failed to load reports summary");
    return data;
  } catch (err: any) {
    if (err.message === "NOT_JSON" || err.message.includes("fetch") || err instanceof TypeError) {
      let students = localDb.getStudents();
      let feeRecords = localDb.getFeeRecords();
      let payments = localDb.getPayments();

      if (user.role === "BRANCH_URGA") {
        students = students.filter(s => s.branch === "Urga");
        feeRecords = feeRecords.filter(f => f.branch === "Urga");
        payments = payments.filter(p => p.branch === "Urga");
      } else if (user.role === "BRANCH_NIHARIKA") {
        students = students.filter(s => s.branch === "Niharika");
        feeRecords = feeRecords.filter(f => f.branch === "Niharika");
        payments = payments.filter(p => p.branch === "Niharika");
      }

      const totalCollected = payments.reduce((sum, p) => sum + p.amount, 0);
      const totalPending = feeRecords.reduce((sum, fr) => sum + (fr.amount - fr.paidAmount), 0);
      const activeStudents = students.filter(s => s.status === "Active").length;

      const todayStr = new Date().toISOString().split("T")[0];
      const pendingRemindersCount = feeRecords.filter(fr => fr.status !== "Paid" && fr.dueDate < todayStr).length;

      const getBranchStats = (b: Branch) => {
        const bStudents = localDb.getStudents().filter(s => s.branch === b);
        const bRecords = localDb.getFeeRecords().filter(r => r.branch === b);
        const bPayments = localDb.getPayments().filter(p => p.branch === b);

        return {
          collected: bPayments.reduce((sum, p) => sum + p.amount, 0),
          pending: bRecords.reduce((sum, fr) => sum + (fr.amount - fr.paidAmount), 0),
          count: bStudents.filter(s => s.status === "Active").length
        };
      };

      return {
        totalCollected,
        totalPending,
        activeStudents,
        pendingRemindersCount,
        branchStats: {
          Urga: getBranchStats("Urga"),
          Niharika: getBranchStats("Niharika")
        }
      };
    }
    throw err;
  }
}
