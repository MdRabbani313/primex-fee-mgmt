export type Branch = 'Urga' | 'Niharika';

export type UserRole = 'ADMIN' | 'BRANCH_URGA' | 'BRANCH_NIHARIKA';

export interface User {
  id: string;
  username: string;
  name: string;
  role: UserRole;
  branch: Branch | null;
}

export interface Student {
  id: string;
  name: string;
  email: string;
  phone: string;
  branch: Branch;
  course: string;
  batch: string;
  admissionDate: string;
  status: 'Active' | 'Inactive';
}

export interface CourseFeeStructure {
  id: string;
  courseName: string;
  totalFee: number;
  monthlyFee: number;
  dueDateDay: number; // e.g. 5 for 5th of every month
}

export interface FeeRecord {
  id: string;
  studentId: string;
  studentName: string;
  branch: Branch;
  course: string;
  batch: string;
  title: string; // e.g. "Monthly Fee - July 2026", "Admission Fee"
  amount: number;
  paidAmount: number;
  dueDate: string;
  status: 'Paid' | 'Partial' | 'Unpaid';
  createdAt: string;
}

export interface Payment {
  id: string;
  feeRecordId: string;
  studentId: string;
  studentName: string;
  branch: Branch;
  receiptNo: string;
  amount: number;
  paymentDate: string;
  paymentMode: 'Cash' | 'UPI' | 'Bank Transfer';
  notes?: string;
}

export interface DashboardStats {
  totalCollected: number;
  totalPending: number;
  activeStudents: number;
  pendingRemindersCount: number;
  branchStats: {
    Urga: { collected: number; pending: number; count: number };
    Niharika: { collected: number; pending: number; count: number };
  };
}
