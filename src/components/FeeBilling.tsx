import React, { useState } from 'react';
import { Search, Plus, CreditCard, Layers, MapPin, GraduationCap, Calendar, ListFilter, AlertCircle, Sparkles, CheckCircle, HelpCircle } from 'lucide-react';
import { FeeRecord, Student, CourseFeeStructure, User, Branch, Payment } from '../types';

interface FeeBillingProps {
  feeRecords: FeeRecord[];
  students: Student[];
  courses: CourseFeeStructure[];
  user: User;
  onGenerateFee: (record: Omit<FeeRecord, 'id' | 'paidAmount' | 'status' | 'createdAt'>) => Promise<void>;
  onGenerateBulkFees: (data: {
    branch: Branch;
    course: string;
    batch: string;
    title: string;
    amount: number;
    dueDate: string;
  }) => Promise<string>;
  onRecordPayment: (data: {
    feeRecordId: string;
    amount: number;
    paymentMode: 'Cash' | 'UPI' | 'Bank Transfer';
    notes?: string;
  }) => Promise<{ payment: Payment; feeRecord: FeeRecord }>;
  onShowReceipt: (receiptNo: string) => void;
}

export default function FeeBilling({
  feeRecords,
  students,
  courses,
  user,
  onGenerateFee,
  onGenerateBulkFees,
  onRecordPayment,
  onShowReceipt
}: FeeBillingProps) {
  // Filtering and Searching
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedBranch, setSelectedBranch] = useState<string>('All');
  const [selectedCourse, setSelectedCourse] = useState<string>('All');
  const [selectedStatus, setSelectedStatus] = useState<string>('All');

  // Modals state
  const [isBulkOpen, setIsBulkOpen] = useState(false);
  const [isSingleOpen, setIsSingleOpen] = useState(false);
  const [isPaymentOpen, setIsPaymentOpen] = useState(false);

  // Bulk Form Fields
  const [bulkBranch, setBulkBranch] = useState<Branch>(user.branch || 'Urga');
  const [bulkCourse, setBulkCourse] = useState('');
  const [bulkBatch, setBulkBatch] = useState('Batch A - Morning');
  const [bulkTitle, setBulkTitle] = useState('');
  const [bulkAmount, setBulkAmount] = useState<number>(0);
  const [bulkDueDate, setBulkDueDate] = useState('');
  const [bulkError, setBulkError] = useState<string | null>(null);
  const [bulkSuccess, setBulkSuccess] = useState<string | null>(null);

  // Single Form Fields
  const [singleStudentId, setSingleStudentId] = useState('');
  const [singleTitle, setSingleTitle] = useState('');
  const [singleAmount, setSingleAmount] = useState<number>(0);
  const [singleDueDate, setSingleDueDate] = useState('');
  const [singleError, setSingleError] = useState<string | null>(null);

  // Payment Form Fields
  const [payingRecord, setPayingRecord] = useState<FeeRecord | null>(null);
  const [paymentAmount, setPaymentAmount] = useState<number>(0);
  const [paymentMode, setPaymentMode] = useState<'Cash' | 'UPI' | 'Bank Transfer'>('UPI');
  const [paymentNotes, setPaymentNotes] = useState('');
  const [paymentError, setPaymentError] = useState<string | null>(null);

  React.useEffect(() => {
    // Select first course by default for form helpers
    if (courses.length > 0) {
      setBulkCourse(courses[0].courseName);
    }
  }, [courses]);

  // Sync amount when course is selected in bulk form
  const handleBulkCourseChange = (courseName: string) => {
    setBulkCourse(courseName);
    const matched = courses.find(c => c.courseName === courseName);
    if (matched) {
      setBulkAmount(matched.monthlyFee); // default to monthly fee
    }
  };

  // Sync amount when student is selected in individual form
  const handleSingleStudentChange = (studentId: string) => {
    setSingleStudentId(studentId);
    const student = students.find(s => s.id === studentId);
    if (student) {
      const matchedCourse = courses.find(c => c.courseName === student.course);
      if (matchedCourse) {
        setSingleAmount(matchedCourse.monthlyFee);
      }
    }
  };

  // Submit Bulk Fee Form
  const handleBulkSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBulkError(null);
    setBulkSuccess(null);

    if (!bulkTitle.trim() || !bulkDueDate || bulkAmount <= 0) {
      setBulkError('Please enter a valid billing title, amount, and due date.');
      return;
    }

    try {
      const message = await onGenerateBulkFees({
        branch: bulkBranch,
        course: bulkCourse,
        batch: bulkBatch,
        title: bulkTitle.trim(),
        amount: bulkAmount,
        dueDate: bulkDueDate
      });
      setBulkSuccess(message);
      setBulkTitle('');
      setBulkDueDate('');
      setTimeout(() => {
        setIsBulkOpen(false);
        setBulkSuccess(null);
      }, 2000);
    } catch (err: any) {
      setBulkError(err.message || 'Failed to generate bulk fees.');
    }
  };

  // Submit Single Fee Form
  const handleSingleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSingleError(null);

    if (!singleStudentId || !singleTitle.trim() || !singleDueDate || singleAmount <= 0) {
      setSingleError('Please select a student, provide a billing title, amount and due date.');
      return;
    }

    const student = students.find(s => s.id === singleStudentId);
    if (!student) return;

    try {
      await onGenerateFee({
        studentId: singleStudentId,
        studentName: student.name,
        branch: student.branch,
        course: student.course,
        batch: student.batch,
        title: singleTitle.trim(),
        amount: singleAmount,
        dueDate: singleDueDate
      });
      setIsSingleOpen(false);
      setSingleStudentId('');
      setSingleTitle('');
      setSingleDueDate('');
    } catch (err: any) {
      setSingleError(err.message || 'Failed to generate student fee.');
    }
  };

  // Trigger Record Payment Modal
  const openPaymentModal = (record: FeeRecord) => {
    setPayingRecord(record);
    setPaymentAmount(record.amount - record.paidAmount); // Default to full pending due
    setPaymentMode('UPI');
    setPaymentNotes('');
    setPaymentError(null);
    setIsPaymentOpen(true);
  };

  // Submit Payment
  const handlePaymentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setPaymentError(null);

    if (!payingRecord) return;
    const remaining = payingRecord.amount - payingRecord.paidAmount;

    if (paymentAmount <= 0) {
      setPaymentError('Payment amount must be greater than zero.');
      return;
    }

    if (paymentAmount > remaining) {
      setPaymentError(`Payment amount cannot exceed the outstanding dues of ₹${remaining}`);
      return;
    }

    try {
      const result = await onRecordPayment({
        feeRecordId: payingRecord.id,
        amount: paymentAmount,
        paymentMode,
        notes: paymentNotes
      });
      setIsPaymentOpen(false);
      // Immediately trigger the receipt view of the newly recorded payment!
      if (result && result.payment) {
        onShowReceipt(result.payment.receiptNo);
      }
    } catch (err: any) {
      setPaymentError(err.message || 'Failed to record payment.');
    }
  };

  // Format INR Currency
  const formatINR = (value: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(value);
  };

  // Filter Fee Records
  const filteredRecords = feeRecords.filter(r => {
    const matchesSearch = r.studentName.toLowerCase().includes(searchTerm.toLowerCase()) || r.title.toLowerCase().includes(searchTerm.toLowerCase());

    let matchesBranch = true;
    if (user.role === 'ADMIN') {
      if (selectedBranch !== 'All') matchesBranch = r.branch === selectedBranch;
    } else {
      matchesBranch = r.branch === user.branch;
    }

    const matchesCourse = selectedCourse === 'All' || r.course === selectedCourse;
    const matchesStatus = selectedStatus === 'All' || r.status === selectedStatus;

    return matchesSearch && matchesBranch && matchesCourse && matchesStatus;
  });

  return (
    <div id="fee-billing-container" className="space-y-6">
      
      {/* Upper Action Bar */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h3 className="text-xl font-bold text-slate-800 tracking-tight">Fee Management</h3>
          <p className="text-slate-500 text-sm font-medium">Generate academic billing structures, collect individual payments, and manage receipts.</p>
        </div>
        
        {/* Bulk & Single Billing Controls */}
        <div className="flex flex-wrap gap-2">
          <button
            id="bulk-billing-btn"
            onClick={() => {
              setBulkBranch(user.branch || 'Urga');
              setIsBulkOpen(true);
            }}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-700 hover:to-indigo-800 text-white text-xs font-bold rounded-lg shadow-sm cursor-pointer transition-all"
          >
            <Sparkles className="w-4 h-4" />
            Bulk Generate Fees
          </button>
          
          <button
            id="single-billing-btn"
            onClick={() => setIsSingleOpen(true)}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 text-xs font-bold rounded-lg shadow-xs cursor-pointer transition-colors"
          >
            <Plus className="w-4 h-4 text-indigo-500" />
            Single Student Fee
          </button>
        </div>
      </div>

      {/* Filter Ribbon */}
      <div className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        
        {/* Search */}
        <div className="relative">
          <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
            <Search className="w-4.5 h-4.5" />
          </span>
          <input
            id="billing-search-input"
            type="text"
            className="block w-full pl-9 pr-3 py-2 border border-slate-200 rounded-lg text-sm text-slate-900 bg-slate-50/50 focus:outline-none focus:ring-2 focus:ring-indigo-500/10 focus:border-indigo-500"
            placeholder="Search student or description..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        {/* Branch Filter */}
        {user.role === 'ADMIN' ? (
          <select
            id="billing-branch-select"
            className="block w-full px-3 py-2 border border-slate-200 rounded-lg text-sm text-slate-700 bg-slate-50/50 focus:outline-none"
            value={selectedBranch}
            onChange={(e) => setSelectedBranch(e.target.value)}
          >
            <option value="All">All Branches</option>
            <option value="Urga">Urga Branch</option>
            <option value="Niharika">Niharika Branch</option>
          </select>
        ) : (
          <div className="block w-full px-3 py-2 border border-slate-200 bg-slate-100 text-slate-500 rounded-lg text-sm font-medium flex items-center gap-1">
            <MapPin className="w-4 h-4" /> {user.branch} Campus Only
          </div>
        )}

        {/* Course Filter */}
        <select
          id="billing-course-select"
          className="block w-full px-3 py-2 border border-slate-200 rounded-lg text-sm text-slate-700 bg-slate-50/50 focus:outline-none"
          value={selectedCourse}
          onChange={(e) => setSelectedCourse(e.target.value)}
        >
          <option value="All">All Courses</option>
          {courses.map((c) => (
            <option key={c.id} value={c.courseName}>
              {c.courseName}
            </option>
          ))}
        </select>

        {/* Status Filter */}
        <select
          id="billing-status-select"
          className="block w-full px-3 py-2 border border-slate-200 rounded-lg text-sm text-slate-700 bg-slate-50/50 focus:outline-none"
          value={selectedStatus}
          onChange={(e) => setSelectedStatus(e.target.value)}
        >
          <option value="All">All Statuses</option>
          <option value="Unpaid">Unpaid</option>
          <option value="Partial">Partial Paid</option>
          <option value="Paid">Fully Paid</option>
        </select>

      </div>

      {/* Fee Records Table */}
      <div className="bg-white rounded-xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 text-slate-500 text-xs font-semibold uppercase tracking-wider border-b border-slate-100">
                <th className="px-6 py-4">Student</th>
                <th className="px-6 py-4">Fee Details</th>
                <th className="px-6 py-4">Total Amount</th>
                <th className="px-6 py-4">Paid / Due</th>
                <th className="px-6 py-4">Due Date</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm text-slate-700">
              {filteredRecords.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-10 text-slate-400 font-medium">
                    No fee billing records found. Click "Bulk Generate Fees" to charge batches.
                  </td>
                </tr>
              ) : (
                filteredRecords.map((record) => {
                  const remainingDue = record.amount - record.paidAmount;
                  const isOverdue = record.status !== 'Paid' && new Date(record.dueDate) < new Date();
                  
                  return (
                    <tr key={record.id} className="hover:bg-slate-50/50 transition-colors">
                      
                      {/* Student Info */}
                      <td className="px-6 py-4">
                        <div>
                          <p className="font-bold text-slate-900">{record.studentName}</p>
                          <div className="flex items-center gap-1.5 mt-1">
                            <span className="text-[10px] font-semibold text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded">
                              {record.branch}
                            </span>
                            <span className="text-[10px] font-semibold text-slate-400">
                              {record.batch}
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* Title & Course */}
                      <td className="px-6 py-4">
                        <div>
                          <p className="font-semibold text-slate-800">{record.title}</p>
                          <p className="text-xs text-slate-500 mt-0.5 flex items-center gap-1">
                            <GraduationCap className="w-3.5 h-3.5 text-indigo-400" />
                            {record.course}
                          </p>
                        </div>
                      </td>

                      {/* Total Amount */}
                      <td className="px-6 py-4 font-bold text-slate-900">
                        {formatINR(record.amount)}
                      </td>

                      {/* Paid and Due Amount */}
                      <td className="px-6 py-4">
                        <div className="text-xs space-y-0.5">
                          <p className="text-emerald-700 font-medium">Paid: {formatINR(record.paidAmount)}</p>
                          <p className={`font-bold ${remainingDue > 0 ? 'text-rose-600' : 'text-slate-400'}`}>
                            Due: {formatINR(remainingDue)}
                          </p>
                        </div>
                      </td>

                      {/* Due Date */}
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-1 text-xs">
                          <Calendar className={`w-3.5 h-3.5 ${isOverdue ? 'text-rose-500' : 'text-slate-400'}`} />
                          <span className={`font-medium ${isOverdue ? 'text-rose-600 font-semibold' : 'text-slate-600'}`}>
                            {record.dueDate}
                          </span>
                        </div>
                      </td>

                      {/* Status */}
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold ${
                          record.status === 'Paid' 
                            ? 'bg-emerald-50 text-emerald-700' 
                            : record.status === 'Partial' 
                            ? 'bg-amber-50 text-amber-700' 
                            : 'bg-rose-50 text-rose-700'
                        }`}>
                          {record.status === 'Paid' ? 'Paid' : record.status === 'Partial' ? 'Partial' : 'Unpaid'}
                        </span>
                      </td>

                      {/* Action */}
                      <td className="px-6 py-4 text-center">
                        {record.status !== 'Paid' ? (
                          <button
                            onClick={() => openPaymentModal(record)}
                            className="inline-flex items-center gap-1 px-2.5 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-bold text-xs rounded-lg cursor-pointer transition-colors"
                          >
                            <CreditCard className="w-3.5 h-3.5" />
                            Collect
                          </button>
                        ) : (
                          <div className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-600 bg-emerald-50/50 px-2.5 py-1.5 rounded-lg">
                            <CheckCircle className="w-3.5 h-3.5" />
                            Completed
                          </div>
                        )}
                      </td>

                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Bulk Fee Generation Modal */}
      {isBulkOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
              <h3 className="font-bold text-slate-900 text-base flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-indigo-600 animate-pulse" />
                Bulk Generate Fee Bills
              </h3>
              <button onClick={() => setIsBulkOpen(false)} className="p-1 text-slate-400 hover:text-slate-600 cursor-pointer">
                &times;
              </button>
            </div>

            <form onSubmit={handleBulkSubmit} className="p-6 space-y-4">
              
              {bulkError && <div className="p-2 bg-red-50 text-red-700 text-xs rounded border border-red-100">{bulkError}</div>}
              {bulkSuccess && <div className="p-2 bg-emerald-50 text-emerald-700 text-xs rounded border border-emerald-100">{bulkSuccess}</div>}

              {/* Branch */}
              <div>
                <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">Target Campus Branch</label>
                {user.role === 'ADMIN' ? (
                  <select
                    className="block w-full px-3 py-2 border border-slate-200 rounded-lg text-sm text-slate-900 focus:outline-none"
                    value={bulkBranch}
                    onChange={(e) => setBulkBranch(e.target.value as Branch)}
                  >
                    <option value="Urga">Urga Branch</option>
                    <option value="Niharika">Niharika Branch</option>
                  </select>
                ) : (
                  <div className="px-3 py-2 bg-slate-100 border border-slate-200 text-slate-500 rounded-lg text-sm font-semibold">
                    {user.branch} Campus (Prefilled)
                  </div>
                )}
              </div>

              {/* Course selection */}
              <div>
                <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">Select Course</label>
                <select
                  className="block w-full px-3 py-2 border border-slate-200 rounded-lg text-sm text-slate-900 focus:outline-none"
                  value={bulkCourse}
                  onChange={(e) => handleBulkCourseChange(e.target.value)}
                  required
                >
                  {courses.map(c => (
                    <option key={c.id} value={c.courseName}>{c.courseName}</option>
                  ))}
                </select>
              </div>

              {/* Batch selection */}
              <div>
                <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">Course Batch</label>
                <select
                  className="block w-full px-3 py-2 border border-slate-200 rounded-lg text-sm text-slate-900"
                  value={bulkBatch}
                  onChange={(e) => setBulkBatch(e.target.value)}
                >
                  <option value="Batch A - Morning">Batch A - Morning</option>
                  <option value="Batch B - Evening">Batch B - Evening</option>
                  <option value="Weekend Batch">Weekend Batch</option>
                </select>
              </div>

              {/* Title */}
              <div>
                <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">Billing Description / Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Monthly Fee - July 2026"
                  className="block w-full px-3 py-2 border border-slate-200 rounded-lg text-sm text-slate-900"
                  value={bulkTitle}
                  onChange={(e) => setBulkTitle(e.target.value)}
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                {/* Amount */}
                <div>
                  <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">Amount (₹)</label>
                  <input
                    type="number"
                    required
                    min="1"
                    className="block w-full px-3 py-2 border border-slate-200 rounded-lg text-sm text-slate-900"
                    value={bulkAmount}
                    onChange={(e) => setBulkAmount(Number(e.target.value))}
                  />
                </div>

                {/* Due date */}
                <div>
                  <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">Payment Due Date</label>
                  <input
                    type="date"
                    required
                    className="block w-full px-3 py-2 border border-slate-200 rounded-lg text-sm text-slate-900"
                    value={bulkDueDate}
                    onChange={(e) => setBulkDueDate(e.target.value)}
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsBulkOpen(false)}
                  className="px-4 py-2 border border-slate-200 text-sm font-semibold text-slate-600 rounded-lg hover:bg-slate-50 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-sm rounded-lg cursor-pointer shadow-xs"
                >
                  Generate Bulk Invoices
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

      {/* Individual Fee Generation Modal */}
      {isSingleOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
              <h3 className="font-bold text-slate-900 text-base">Generate Individual Fee Record</h3>
              <button onClick={() => setIsSingleOpen(false)} className="p-1 text-slate-400 hover:text-slate-600 cursor-pointer">
                &times;
              </button>
            </div>

            <form onSubmit={handleSingleSubmit} className="p-6 space-y-4">
              
              {singleError && <div className="p-2 bg-red-50 text-red-700 text-xs rounded border border-red-100">{singleError}</div>}

              {/* Student */}
              <div>
                <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">Select Student</label>
                <select
                  className="block w-full px-3 py-2 border border-slate-200 rounded-lg text-sm text-slate-900 focus:outline-none"
                  value={singleStudentId}
                  onChange={(e) => handleSingleStudentChange(e.target.value)}
                  required
                >
                  <option value="">-- Choose Student --</option>
                  {students
                    .filter(s => s.status === 'Active' && (user.role === 'ADMIN' || s.branch === user.branch))
                    .map(s => (
                      <option key={s.id} value={s.id}>{s.name} ({s.branch} - {s.course})</option>
                    ))}
                </select>
              </div>

              {/* Title */}
              <div>
                <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">Description / Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Admission / Registration Fee"
                  className="block w-full px-3 py-2 border border-slate-200 rounded-lg text-sm text-slate-900"
                  value={singleTitle}
                  onChange={(e) => setSingleTitle(e.target.value)}
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                {/* Amount */}
                <div>
                  <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">Amount (₹)</label>
                  <input
                    type="number"
                    required
                    min="1"
                    className="block w-full px-3 py-2 border border-slate-200 rounded-lg text-sm text-slate-900"
                    value={singleAmount}
                    onChange={(e) => setSingleAmount(Number(e.target.value))}
                  />
                </div>

                {/* Due date */}
                <div>
                  <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">Payment Due Date</label>
                  <input
                    type="date"
                    required
                    className="block w-full px-3 py-2 border border-slate-200 rounded-lg text-sm text-slate-900"
                    value={singleDueDate}
                    onChange={(e) => setSingleDueDate(e.target.value)}
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsSingleOpen(false)}
                  className="px-4 py-2 border border-slate-200 text-sm font-semibold text-slate-600 rounded-lg hover:bg-slate-50 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-sm rounded-lg cursor-pointer"
                >
                  Create Bill
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

      {/* Record Payment Modal */}
      {isPaymentOpen && payingRecord && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
              <h3 className="font-bold text-slate-900 text-base">Record Payment Transaction</h3>
              <button onClick={() => setIsPaymentOpen(false)} className="p-1 text-slate-400 hover:text-slate-600 cursor-pointer">
                &times;
              </button>
            </div>

            <div className="px-6 py-3 bg-indigo-50 border-b border-indigo-100 flex justify-between items-center text-xs text-indigo-900">
              <div>
                <p className="font-bold">{payingRecord.studentName}</p>
                <p className="text-[10px] text-indigo-700">{payingRecord.title}</p>
              </div>
              <div className="text-right">
                <p className="font-bold text-sm">{formatINR(payingRecord.amount - payingRecord.paidAmount)}</p>
                <p className="text-[9px] text-indigo-700 font-semibold uppercase">Pending Due</p>
              </div>
            </div>

            <form onSubmit={handlePaymentSubmit} className="p-6 space-y-4">
              
              {paymentError && <div className="p-2 bg-red-50 text-red-700 text-xs rounded border border-red-100">{paymentError}</div>}

              {/* Amount to pay */}
              <div>
                <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">Payment Amount (₹)</label>
                <input
                  type="number"
                  required
                  min="1"
                  max={payingRecord.amount - payingRecord.paidAmount}
                  className="block w-full px-3 py-2 border border-slate-200 rounded-lg text-sm text-slate-900 font-bold focus:outline-none focus:ring-2 focus:ring-indigo-500/10 focus:border-indigo-500"
                  value={paymentAmount}
                  onChange={(e) => setPaymentAmount(Number(e.target.value))}
                />
              </div>

              {/* Payment Mode */}
              <div>
                <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1 font-semibold">Payment Mode</label>
                <div className="grid grid-cols-3 gap-2">
                  {(['UPI', 'Cash', 'Bank Transfer'] as const).map((mode) => (
                    <button
                      key={mode}
                      type="button"
                      onClick={() => setPaymentMode(mode)}
                      className={`py-2 px-3 border text-xs font-semibold rounded-lg cursor-pointer transition-all text-center ${
                        paymentMode === mode
                          ? 'border-indigo-600 bg-indigo-50 text-indigo-700 font-bold shadow-xs'
                          : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                      }`}
                    >
                      {mode}
                    </button>
                  ))}
                </div>
              </div>

              {/* Notes */}
              <div>
                <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">Notes / Remarks</label>
                <input
                  type="text"
                  placeholder="e.g. Transaction Ref No, partial payment memo"
                  className="block w-full px-3 py-2 border border-slate-200 rounded-lg text-sm text-slate-900"
                  value={paymentNotes}
                  onChange={(e) => setPaymentNotes(e.target.value)}
                />
              </div>

              <div className="flex justify-end gap-2 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsPaymentOpen(false)}
                  className="px-4 py-2 border border-slate-200 text-sm font-semibold text-slate-600 rounded-lg hover:bg-slate-50 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-sm rounded-lg cursor-pointer flex items-center gap-1.5"
                >
                  Confirm & Print Receipt
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

    </div>
  );
}
