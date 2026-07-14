import express from "express";
import path from "path";
import fs from "fs";
import jwt from "jsonwebtoken";
import { createServer as createViteServer } from "vite";
import { Branch, User, Student, CourseFeeStructure, FeeRecord, Payment } from "./src/types";

const app = express();
const PORT = 3000;
const JWT_SECRET = "primex-secure-jwt-secret-key-2026-prod";
const DB_FILE = path.join(process.cwd(), "db.json");

app.use(express.json());

// Sample Initial Seed Data
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

// In-Memory Database State backed up to disk
interface DatabaseSchema {
  students: Student[];
  courses: CourseFeeStructure[];
  feeRecords: FeeRecord[];
  payments: Payment[];
  nextReceiptSeq: number;
}

let db: DatabaseSchema = {
  students: defaultStudents,
  courses: defaultCourses,
  feeRecords: defaultFeeRecords,
  payments: defaultPayments,
  nextReceiptSeq: 7
};

// Load database
function loadDB() {
  try {
    if (fs.existsSync(DB_FILE)) {
      const data = fs.readFileSync(DB_FILE, "utf-8");
      db = JSON.parse(data);
      console.log("Database loaded successfully from file system.");
    } else {
      saveDB();
    }
  } catch (err) {
    console.error("Error loading database, resetting to defaults:", err);
    saveDB();
  }
}

// Save database
function saveDB() {
  try {
    fs.writeFileSync(DB_FILE, JSON.stringify(db, null, 2), "utf-8");
  } catch (err) {
    console.error("Error saving database to file system:", err);
  }
}

loadDB();

// Mock User Accounts
const USERS = [
  { id: "u1", username: "admin", password: "admin123", name: "Super Admin", role: "ADMIN", branch: null },
  { id: "u2", username: "urga", password: "urga123", name: "Urga Manager", role: "BRANCH_URGA", branch: "Urga" },
  { id: "u3", username: "niharika", password: "niharika123", name: "Niharika Manager", role: "BRANCH_NIHARIKA", branch: "Niharika" }
];

// JWT verification middleware
function authenticateToken(req: any, res: any, next: any) {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  if (!token) {
    return res.status(401).json({ message: "Access Token Required" });
  }

  jwt.verify(token, JWT_SECRET, (err: any, user: any) => {
    if (err) {
      return res.status(403).json({ message: "Invalid or Expired Token" });
    }
    req.user = user;
    next();
  });
}

// Helper to check branch access permission
function checkBranchAccess(user: any, targetBranch: Branch | null) {
  if (user.role === "ADMIN") return true;
  if (user.role === "BRANCH_URGA" && targetBranch === "Urga") return true;
  if (user.role === "BRANCH_NIHARIKA" && targetBranch === "Niharika") return true;
  return false;
}

// Auth API endpoints
app.post("/api/auth/login", (req, res) => {
  const { username, password } = req.body;
  const user = USERS.find(u => u.username === username.toLowerCase() && u.password === password);

  if (!user) {
    return res.status(400).json({ message: "Invalid username or password" });
  }

  // Create JWT token
  const payload = {
    id: user.id,
    username: user.username,
    name: user.name,
    role: user.role,
    branch: user.branch
  };

  const token = jwt.sign(payload, JWT_SECRET, { expiresIn: "8h" });

  res.json({
    token,
    user: payload
  });
});

app.get("/api/auth/me", authenticateToken, (req: any, res) => {
  res.json({ user: req.user });
});

// Students API endpoints
app.get("/api/students", authenticateToken, (req: any, res) => {
  const user = req.user;
  let result = [...db.students];

  // Restrict by branch if user is not ADMIN
  if (user.role === "BRANCH_URGA") {
    result = result.filter(s => s.branch === "Urga");
  } else if (user.role === "BRANCH_NIHARIKA") {
    result = result.filter(s => s.branch === "Niharika");
  }

  res.json(result);
});

app.post("/api/students", authenticateToken, (req: any, res) => {
  const user = req.user;
  const studentData: Omit<Student, "id"> = req.body;

  // Verify branch level write permission
  if (!checkBranchAccess(user, studentData.branch)) {
    return res.status(403).json({ message: "Permission Denied for this branch" });
  }

  const newStudent: Student = {
    ...studentData,
    id: "s_" + Date.now().toString(36)
  };

  db.students.push(newStudent);
  saveDB();
  res.status(201).json(newStudent);
});

app.put("/api/students/:id", authenticateToken, (req: any, res) => {
  const user = req.user;
  const studentId = req.params.id;
  const studentIndex = db.students.findIndex(s => s.id === studentId);

  if (studentIndex === -1) {
    return res.status(404).json({ message: "Student not found" });
  }

  const existingStudent = db.students[studentIndex];

  // Verify access for existing student branch
  if (!checkBranchAccess(user, existingStudent.branch)) {
    return res.status(403).json({ message: "Permission Denied to modify student in this branch" });
  }

  // Verify access for new branch if branch is being changed
  if (req.body.branch && !checkBranchAccess(user, req.body.branch)) {
    return res.status(403).json({ message: "Permission Denied to move student to target branch" });
  }

  const updatedStudent = {
    ...existingStudent,
    ...req.body,
    id: studentId // preserve ID
  };

  db.students[studentIndex] = updatedStudent;

  // Sync names across outstanding fee records
  db.feeRecords = db.feeRecords.map(fr => {
    if (fr.studentId === studentId) {
      return {
        ...fr,
        studentName: updatedStudent.name,
        branch: updatedStudent.branch,
        course: updatedStudent.course,
        batch: updatedStudent.batch
      };
    }
    return fr;
  });

  saveDB();
  res.json(updatedStudent);
});

app.delete("/api/students/:id", authenticateToken, (req: any, res) => {
  const user = req.user;
  const studentId = req.params.id;
  const student = db.students.find(s => s.id === studentId);

  if (!student) {
    return res.status(404).json({ message: "Student not found" });
  }

  if (!checkBranchAccess(user, student.branch)) {
    return res.status(403).json({ message: "Permission Denied" });
  }

  db.students = db.students.filter(s => s.id !== studentId);
  // Also clean up unpaid fee records to prevent orphan pending items (optional, let's keep paid ones for reports)
  // Or just keep all fee records but mark student as Inactive instead of deleting
  saveDB();
  res.json({ message: "Student removed successfully" });
});

// Course Fee Structure API
app.get("/api/courses", authenticateToken, (req, res) => {
  res.json(db.courses);
});

app.post("/api/courses", authenticateToken, (req: any, res) => {
  if (req.user.role !== "ADMIN") {
    return res.status(403).json({ message: "Only ADMIN can add courses" });
  }

  const newCourse: CourseFeeStructure = {
    ...req.body,
    id: "c_" + Date.now().toString(36)
  };

  db.courses.push(newCourse);
  saveDB();
  res.status(201).json(newCourse);
});

app.put("/api/courses/:id", authenticateToken, (req: any, res) => {
  if (req.user.role !== "ADMIN") {
    return res.status(403).json({ message: "Only ADMIN can modify courses" });
  }

  const id = req.params.id;
  const index = db.courses.findIndex(c => c.id === id);

  if (index === -1) {
    return res.status(404).json({ message: "Course not found" });
  }

  db.courses[index] = { ...db.courses[index], ...req.body, id };
  saveDB();
  res.json(db.courses[index]);
});

app.delete("/api/courses/:id", authenticateToken, (req: any, res) => {
  if (req.user.role !== "ADMIN") {
    return res.status(403).json({ message: "Only ADMIN can delete courses" });
  }

  const id = req.params.id;
  const index = db.courses.findIndex(c => c.id === id);

  if (index === -1) {
    return res.status(404).json({ message: "Course not found" });
  }

  db.courses.splice(index, 1);
  saveDB();
  res.json({ message: "Course deleted successfully" });
});

// Fee Records API
app.get("/api/fee-records", authenticateToken, (req: any, res) => {
  const user = req.user;
  let result = [...db.feeRecords];

  if (user.role === "BRANCH_URGA") {
    result = result.filter(r => r.branch === "Urga");
  } else if (user.role === "BRANCH_NIHARIKA") {
    result = result.filter(r => r.branch === "Niharika");
  }

  res.json(result);
});

// Generate individual fee record
app.post("/api/fee-records", authenticateToken, (req: any, res) => {
  const user = req.user;
  const record: Omit<FeeRecord, "id" | "paidAmount" | "status" | "createdAt"> = req.body;

  const student = db.students.find(s => s.id === record.studentId);
  if (!student) {
    return res.status(400).json({ message: "Student not found" });
  }

  if (!checkBranchAccess(user, student.branch)) {
    return res.status(403).json({ message: "Permission Denied for this branch" });
  }

  const newRecord: FeeRecord = {
    ...record,
    id: "fr_" + Date.now().toString(36),
    paidAmount: 0,
    status: "Unpaid",
    createdAt: new Date().toISOString()
  };

  db.feeRecords.push(newRecord);
  saveDB();
  res.status(201).json(newRecord);
});

// Generate fee records in bulk
app.post("/api/fee-records/bulk", authenticateToken, (req: any, res) => {
  const user = req.user;
  const { branch, course, batch, title, amount, dueDate } = req.body;

  if (!checkBranchAccess(user, branch)) {
    return res.status(403).json({ message: "Permission Denied to generate fees for this branch" });
  }

  // Find all active students matching branch, course, and batch
  const targetStudents = db.students.filter(s => 
    s.status === "Active" &&
    s.branch === branch &&
    (!course || s.course === course) &&
    (!batch || s.batch === batch)
  );

  if (targetStudents.length === 0) {
    return res.status(400).json({ message: "No active students found matching the criteria" });
  }

  const newlyCreated: FeeRecord[] = [];
  const now = new Date().toISOString();

  targetStudents.forEach(s => {
    // Avoid double billing the same exact title for the same student on the same day if possible, or just generate
    const newRecord: FeeRecord = {
      id: "fr_" + Math.random().toString(36).substring(2, 11) + "_" + Date.now(),
      studentId: s.id,
      studentName: s.name,
      branch: s.branch,
      course: s.course,
      batch: s.batch,
      title,
      amount: Number(amount),
      paidAmount: 0,
      dueDate,
      status: "Unpaid",
      createdAt: now
    };
    db.feeRecords.push(newRecord);
    newlyCreated.push(newRecord);
  });

  saveDB();
  res.status(201).json({
    message: `Successfully generated fee records for ${newlyCreated.length} students.`,
    records: newlyCreated
  });
});

// Delete fee record (Admin only)
app.delete("/api/fee-records/:id", authenticateToken, (req: any, res) => {
  if (req.user.role !== "ADMIN") {
    return res.status(403).json({ message: "Only Admin can delete fee records" });
  }

  const id = req.params.id;
  const index = db.feeRecords.findIndex(r => r.id === id);

  if (index === -1) {
    return res.status(404).json({ message: "Fee record not found" });
  }

  // Clean up any payments linked to this fee record
  db.payments = db.payments.filter(p => p.feeRecordId !== id);
  db.feeRecords.splice(index, 1);

  saveDB();
  res.json({ message: "Fee record and associated payments deleted" });
});

// Payments API
app.get("/api/payments", authenticateToken, (req: any, res) => {
  const user = req.user;
  let result = [...db.payments];

  if (user.role === "BRANCH_URGA") {
    result = result.filter(p => p.branch === "Urga");
  } else if (user.role === "BRANCH_NIHARIKA") {
    result = result.filter(p => p.branch === "Niharika");
  }

  res.json(result);
});

app.post("/api/payments", authenticateToken, (req: any, res) => {
  const user = req.user;
  const { feeRecordId, amount, paymentMode, notes } = req.body;

  const feeRecordIndex = db.feeRecords.findIndex(r => r.id === feeRecordId);
  if (feeRecordIndex === -1) {
    return res.status(404).json({ message: "Fee record not found" });
  }

  const feeRecord = db.feeRecords[feeRecordIndex];

  // Check branch access
  if (!checkBranchAccess(user, feeRecord.branch)) {
    return res.status(403).json({ message: "Permission Denied for this branch" });
  }

  const payingAmount = Number(amount);
  const remainingDue = feeRecord.amount - feeRecord.paidAmount;

  if (payingAmount <= 0) {
    return res.status(400).json({ message: "Payment amount must be greater than 0" });
  }

  if (payingAmount > remainingDue) {
    return res.status(400).json({ message: `Payment amount exceeds outstanding due of ${remainingDue}` });
  }

  // Generate Receipt number e.g. REC-2026-0007
  const year = new Date().getFullYear();
  const sequenceStr = String(db.nextReceiptSeq).padStart(4, "0");
  const receiptNo = `REC-${year}-${sequenceStr}`;
  db.nextReceiptSeq += 1;

  // Add Payment
  const newPayment: Payment = {
    id: "p_" + Date.now().toString(36),
    feeRecordId,
    studentId: feeRecord.studentId,
    studentName: feeRecord.studentName,
    branch: feeRecord.branch,
    receiptNo,
    amount: payingAmount,
    paymentDate: new Date().toISOString().split("T")[0],
    paymentMode,
    notes: notes || ""
  };

  db.payments.push(newPayment);

  // Update FeeRecord
  const newPaidAmount = feeRecord.paidAmount + payingAmount;
  let newStatus: "Paid" | "Partial" | "Unpaid" = "Unpaid";
  if (newPaidAmount >= feeRecord.amount) {
    newStatus = "Paid";
  } else if (newPaidAmount > 0) {
    newStatus = "Partial";
  }

  db.feeRecords[feeRecordIndex] = {
    ...feeRecord,
    paidAmount: newPaidAmount,
    status: newStatus
  };

  saveDB();
  res.status(201).json({ payment: newPayment, feeRecord: db.feeRecords[feeRecordIndex] });
});

// Fetch full payment / receipt data
app.get("/api/payments/receipt/:receiptNo", authenticateToken, (req: any, res) => {
  const user = req.user;
  const receiptNo = req.params.receiptNo;
  const payment = db.payments.find(p => p.receiptNo === receiptNo);

  if (!payment) {
    return res.status(404).json({ message: "Receipt not found" });
  }

  if (!checkBranchAccess(user, payment.branch)) {
    return res.status(403).json({ message: "Permission Denied to access this receipt" });
  }

  const student = db.students.find(s => s.id === payment.studentId);
  const feeRecord = db.feeRecords.find(r => r.id === payment.feeRecordId);

  res.json({
    payment,
    student,
    feeRecord
  });
});

// Reports APIs
app.get("/api/reports/summary", authenticateToken, (req: any, res) => {
  const user = req.user;

  let students = [...db.students];
  let feeRecords = [...db.feeRecords];
  let payments = [...db.payments];

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

  // Reminders count (Unpaid or Partial records past their due date)
  const todayStr = new Date().toISOString().split("T")[0];
  const pendingRemindersCount = feeRecords.filter(fr => fr.status !== "Paid" && fr.dueDate < todayStr).length;

  // Branch breakdowns
  const getBranchStats = (b: Branch) => {
    const bStudents = db.students.filter(s => s.branch === b);
    const bRecords = db.feeRecords.filter(r => r.branch === b);
    const bPayments = db.payments.filter(p => p.branch === b);

    return {
      collected: bPayments.reduce((sum, p) => sum + p.amount, 0),
      pending: bRecords.reduce((sum, fr) => sum + (fr.amount - fr.paidAmount), 0),
      count: bStudents.filter(s => s.status === "Active").length
    };
  };

  res.json({
    totalCollected,
    totalPending,
    activeStudents,
    pendingRemindersCount,
    branchStats: {
      Urga: getBranchStats("Urga"),
      Niharika: getBranchStats("Niharika")
    }
  });
});

// Collection reports (daily, monthly, custom ranges)
app.get("/api/reports/collection", authenticateToken, (req: any, res) => {
  const user = req.user;
  const { startDate, endDate, branch, course } = req.query;

  let filteredPayments = [...db.payments];

  // 1. Branch filters (User role overrides query parameter if user is branch manager)
  if (user.role === "BRANCH_URGA") {
    filteredPayments = filteredPayments.filter(p => p.branch === "Urga");
  } else if (user.role === "BRANCH_NIHARIKA") {
    filteredPayments = filteredPayments.filter(p => p.branch === "Niharika");
  } else if (branch) {
    filteredPayments = filteredPayments.filter(p => p.branch === branch);
  }

  // 2. Date filters
  if (startDate) {
    filteredPayments = filteredPayments.filter(p => p.paymentDate >= startDate);
  }
  if (endDate) {
    filteredPayments = filteredPayments.filter(p => p.paymentDate <= endDate);
  }

  // 3. Course filters (Need to map to student/course)
  if (course) {
    filteredPayments = filteredPayments.filter(p => {
      const student = db.students.find(s => s.id === p.studentId);
      return student && student.course === course;
    });
  }

  // Aggregate results:
  // - Daily timeline
  // - Course-wise share
  // - Payment Mode distribution
  const dailyTimeline: Record<string, number> = {};
  const courseCollection: Record<string, number> = {};
  const modeCollection: Record<string, number> = { "Cash": 0, "UPI": 0, "Bank Transfer": 0 };
  const branchCollection: Record<string, number> = { "Urga": 0, "Niharika": 0 };

  filteredPayments.forEach(p => {
    // Daily
    dailyTimeline[p.paymentDate] = (dailyTimeline[p.paymentDate] || 0) + p.amount;

    // Course
    const student = db.students.find(s => s.id === p.studentId);
    const courseName = student ? student.course : "Other/Unknown";
    courseCollection[courseName] = (courseCollection[courseName] || 0) + p.amount;

    // Mode
    modeCollection[p.paymentMode] = (modeCollection[p.paymentMode] || 0) + p.amount;

    // Branch
    branchCollection[p.branch] = (branchCollection[p.branch] || 0) + p.amount;
  });

  res.json({
    payments: filteredPayments,
    summary: {
      totalCollected: filteredPayments.reduce((sum, p) => sum + p.amount, 0),
      timeline: Object.entries(dailyTimeline).map(([date, amount]) => ({ date, amount })).sort((a,b) => a.date.localeCompare(b.date)),
      byCourse: Object.entries(courseCollection).map(([course, amount]) => ({ course, amount })),
      byMode: Object.entries(modeCollection).map(([mode, amount]) => ({ mode, amount })),
      byBranch: Object.entries(branchCollection).map(([br, amount]) => ({ branch: br, amount }))
    }
  });
});

// Vite middleware for development
const startServer = async () => {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa"
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
};

startServer().catch(err => {
  console.error("Failed to start server", err);
});
