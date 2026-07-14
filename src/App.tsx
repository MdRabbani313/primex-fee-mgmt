import React, { useState, useEffect } from 'react';
import { Landmark, Users, CreditCard, AlertCircle, FileText, LogOut, User as UserIcon, Shield, Menu, X, HelpCircle, MapPin } from 'lucide-react';
import { User, Student, CourseFeeStructure, FeeRecord, Payment, DashboardStats, Branch } from './types';
import Login from './components/Login';
import Dashboard from './components/Dashboard';
import StudentList from './components/StudentList';
import FeeBilling from './components/FeeBilling';
import PendingPayments from './components/PendingPayments';
import Reports from './components/Reports';
import ReceiptModal from './components/ReceiptModal';
import {
  apiGetMe,
  apiGetStudents,
  apiAddStudent,
  apiEditStudent,
  apiDeleteStudent,
  apiGetCourses,
  apiGetFeeRecords,
  apiGenerateFee,
  apiGenerateBulkFees,
  apiGetPayments,
  apiRecordPayment,
  apiGetReportsSummary
} from './api';

export default function App() {
  // Authentication State
  const [token, setToken] = useState<string | null>(localStorage.getItem('primex_token'));
  const [user, setUser] = useState<User | null>(null);
  const [authLoading, setAuthLoading] = useState(true);

  // Global App States
  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [students, setStudents] = useState<Student[]>([]);
  const [courses, setCourses] = useState<CourseFeeStructure[]>([]);
  const [feeRecords, setFeeRecords] = useState<FeeRecord[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [dashboardStats, setDashboardStats] = useState<DashboardStats | null>(null);
  
  // App UI Helpers
  const [dataLoading, setDataLoading] = useState(false);
  const [activeReceiptNo, setActiveReceiptNo] = useState<string | null>(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // 1. Session check on boot
  useEffect(() => {
    const verifySession = async () => {
      const storedToken = localStorage.getItem('primex_token');
      if (!storedToken) {
        setAuthLoading(false);
        return;
      }

      try {
        const data = await apiGetMe(storedToken);
        if (data.user) {
          setToken(storedToken);
          setUser(data.user);
        } else {
          // Token expired or invalid
          handleLogout();
        }
      } catch (err) {
        console.error('Session verify failed', err);
        handleLogout();
      } finally {
        setAuthLoading(false);
      }
    };

    verifySession();
  }, []);

  // 2. Fetch full system data upon successful login
  const fetchSystemData = async () => {
    if (!token || !user) return;
    setDataLoading(true);
    try {
      // Parallelize fetches to keep execution extremely fast and snappy!
      const [studentsData, coursesData, feeRecordsData, paymentsData, statsData] = await Promise.all([
        apiGetStudents(token, user),
        apiGetCourses(token),
        apiGetFeeRecords(token, user),
        apiGetPayments(token, user),
        apiGetReportsSummary(token, user)
      ]);

      setStudents(studentsData);
      setCourses(coursesData);
      setFeeRecords(feeRecordsData);
      setPayments(paymentsData);
      setDashboardStats(statsData);
    } catch (err) {
      console.error('Failed to load system data', err);
    } finally {
      setDataLoading(false);
    }
  };

  useEffect(() => {
    if (token && user) {
      fetchSystemData();
    }
  }, [token, user]);

  const handleLoginSuccess = (userToken: string, loggedInUser: User) => {
    localStorage.setItem('primex_token', userToken);
    setToken(userToken);
    setUser(loggedInUser);
    setActiveTab('dashboard');
  };

  const handleLogout = () => {
    localStorage.removeItem('primex_token');
    setToken(null);
    setUser(null);
    setStudents([]);
    setCourses([]);
    setFeeRecords([]);
    setPayments([]);
    setDashboardStats(null);
  };

  // 3. API state-modifying handlers to flow back to database
  const handleAddStudent = async (studentPayload: Omit<Student, 'id'>) => {
    try {
      if (!token || !user) return;
      await apiAddStudent(token, studentPayload, user);
      await fetchSystemData();
    } catch (err: any) {
      throw err;
    }
  };

  const handleEditStudent = async (id: string, updatePayload: Partial<Student>) => {
    try {
      if (!token || !user) return;
      await apiEditStudent(token, id, updatePayload, user);
      await fetchSystemData();
    } catch (err: any) {
      throw err;
    }
  };

  const handleDeleteStudent = async (id: string) => {
    try {
      if (!token || !user) return;
      await apiDeleteStudent(token, id, user);
      await fetchSystemData();
    } catch (err: any) {
      throw err;
    }
  };

  const handleGenerateFee = async (feePayload: Omit<FeeRecord, 'id' | 'paidAmount' | 'status' | 'createdAt'>) => {
    try {
      if (!token || !user) return;
      await apiGenerateFee(token, feePayload, user);
      await fetchSystemData();
    } catch (err: any) {
      throw err;
    }
  };

  const handleGenerateBulkFees = async (bulkPayload: {
    branch: Branch;
    course: string;
    batch: string;
    title: string;
    amount: number;
    dueDate: string;
  }) => {
    try {
      if (!token || !user) return;
      const message = await apiGenerateBulkFees(token, bulkPayload, user);
      await fetchSystemData();
      return message;
    } catch (err: any) {
      throw err;
    }
  };

  const handleRecordPayment = async (paymentPayload: {
    feeRecordId: string;
    amount: number;
    paymentMode: 'Cash' | 'UPI' | 'Bank Transfer';
    notes?: string;
  }) => {
    try {
      if (!token || !user) return;
      const data = await apiRecordPayment(token, paymentPayload, user);
      await fetchSystemData();
      return data; // Returns payment + updated feeRecord
    } catch (err: any) {
      throw err;
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="flex flex-col items-center gap-3 text-slate-500 text-sm">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-600"></div>
          <span className="font-semibold">Loading secure portal...</span>
        </div>
      </div>
    );
  }

  if (!token || !user) {
    return <Login onLoginSuccess={handleLoginSuccess} />;
  }

  // Define tab navigation based on role
  const navigationItems = [
    { id: 'dashboard', label: 'Dashboard', icon: Landmark },
    { id: 'students', label: 'Students Directory', icon: Users },
    { id: 'billing', label: 'Fee Collections', icon: CreditCard },
    { id: 'pending', label: 'Reminders outreach', icon: AlertCircle },
    { id: 'reports', label: 'Financial Reports', icon: FileText },
  ];

  return (
    <div id="app-wrapper" className="min-h-screen bg-slate-50/60 flex flex-col sm:flex-row text-slate-800 font-sans">
      
      {/* 1. SIDEBAR NAVIGATION PANELS (Hidden during print) */}
      <aside id="app-sidebar" className="w-full sm:w-64 bg-slate-900 text-slate-300 flex flex-col shrink-0 border-r border-slate-850 no-print sm:sticky sm:top-0 sm:h-screen">
        
        {/* Sidebar Brand Header */}
        <div className="px-6 py-5 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded bg-indigo-600 text-white flex items-center justify-center font-bold text-sm">
              P
            </div>
            <div>
              <h1 className="text-sm font-black text-white tracking-wider">PRIMEX FEE</h1>
              <p className="text-[10px] text-slate-400 font-semibold uppercase tracking-widest mt-0.5">Fee Desk Manager</p>
            </div>
          </div>
          
          {/* Mobile Menu burger trigger */}
          <button 
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} 
            className="sm:hidden p-1 text-slate-400 hover:text-white cursor-pointer"
          >
            {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>

        {/* Sidebar Nav Links */}
        <nav className={`flex-1 px-4 py-4 space-y-1.5 ${isMobileMenuOpen ? 'block' : 'hidden sm:block'}`}>
          {navigationItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                id={`nav-${item.id}-btn`}
                onClick={() => {
                  setActiveTab(item.id);
                  setIsMobileMenuOpen(false);
                }}
                className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  isActive 
                    ? 'bg-indigo-600 text-white shadow-sm shadow-indigo-600/10' 
                    : 'text-slate-400 hover:bg-slate-800/60 hover:text-slate-200'
                }`}
              >
                <Icon className={`w-4.5 h-4.5 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                {item.label}
              </button>
            );
          })}
        </nav>

        {/* Sidebar active user profile panel */}
        <div className={`p-4 border-t border-slate-800 ${isMobileMenuOpen ? 'block' : 'hidden sm:block'}`}>
          <div className="flex items-center gap-3 bg-slate-850 p-3 rounded-xl border border-slate-800">
            <div className="w-8 h-8 rounded-full bg-indigo-500/20 text-indigo-400 flex items-center justify-center">
              <UserIcon className="w-4.5 h-4.5" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-bold text-white truncate">{user.name}</p>
              <p className="text-[9px] text-indigo-400 font-semibold uppercase tracking-wider flex items-center gap-1 mt-0.5">
                <Shield className="w-3 h-3 shrink-0" />
                {user.role === 'ADMIN' ? 'Admin Access' : `${user.branch} Campus`}
              </p>
            </div>
            
            {/* Logout trigger */}
            <button
              id="sidebar-logout-btn"
              onClick={handleLogout}
              className="p-1 text-slate-400 hover:text-red-400 rounded-lg transition-colors cursor-pointer"
              title="Sign Out"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>

      </aside>

      {/* 2. MAIN CORE APPLICATION BODY */}
      <main id="app-main" className="flex-1 flex flex-col min-w-0">
        
        {/* Top Header info (No-Print) */}
        <header id="app-top-header" className="bg-white border-b border-slate-100 px-6 py-4 flex justify-between items-center no-print">
          <div className="flex items-center gap-2">
            <span className={`h-2 w-2 rounded-full ${dataLoading ? 'bg-amber-400 animate-ping' : 'bg-emerald-500'}`}></span>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
              {dataLoading ? 'Fetching update...' : 'System Live'}
            </span>
          </div>

          <div className="text-xs text-slate-500 font-semibold flex items-center gap-1.5 bg-slate-50 px-2.5 py-1.5 rounded-lg border border-slate-100">
            <MapPin className="w-4 h-4 text-indigo-500 shrink-0" />
            Current Scope: <span className="text-slate-900 font-bold">{user.role === 'ADMIN' ? 'All Campuses' : `${user.branch} Campus`}</span>
          </div>
        </header>

        {/* Dynamic Inner Tab container */}
        <div id="tab-outlet-container" className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto space-y-6">
          
          {activeTab === 'dashboard' && (
            <Dashboard 
              stats={dashboardStats} 
              user={user} 
              isLoading={dataLoading && students.length === 0} 
              onNavigate={(tab) => setActiveTab(tab)}
            />
          )}

          {activeTab === 'students' && (
            <StudentList
              students={students}
              courses={courses}
              user={user}
              onAddStudent={handleAddStudent}
              onEditStudent={handleEditStudent}
              onDeleteStudent={handleDeleteStudent}
            />
          )}

          {activeTab === 'billing' && (
            <FeeBilling
              feeRecords={feeRecords}
              students={students}
              courses={courses}
              user={user}
              onGenerateFee={handleGenerateFee}
              onGenerateBulkFees={handleGenerateBulkFees}
              onRecordPayment={handleRecordPayment}
              onShowReceipt={(receiptNo) => setActiveReceiptNo(receiptNo)}
            />
          )}

          {activeTab === 'pending' && (
            <PendingPayments
              feeRecords={feeRecords}
              students={students}
              user={user}
            />
          )}

          {activeTab === 'reports' && (
            <Reports
              feeRecords={feeRecords}
              payments={payments}
              students={students}
              user={user}
            />
          )}

        </div>

      </main>

      {/* 3. PRINT RECEIPT MODAL DRAWER OVERLAY */}
      {activeReceiptNo && (
        <ReceiptModal 
          receiptNo={activeReceiptNo} 
          onClose={() => setActiveReceiptNo(null)} 
        />
      )}

    </div>
  );
}
