import React, { useState } from 'react';
import { Phone, MessageSquare, Search, MapPin, GraduationCap, Calendar, AlertCircle, ListFilter, IndianRupee } from 'lucide-react';
import { FeeRecord, Student, User } from '../types';

interface PendingPaymentsProps {
  feeRecords: FeeRecord[];
  students: Student[];
  user: User;
}

export default function PendingPayments({ feeRecords, students, user }: PendingPaymentsProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedBranch, setSelectedBranch] = useState<string>('All');
  const [selectedCourse, setSelectedCourse] = useState<string>('All');
  const [overdueOnly, setOverdueOnly] = useState<boolean>(false);
  
  // Date range filters for Due Date
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');

  const todayStr = new Date().toISOString().split('T')[0];

  // Map students to quick phone lookup
  const getStudentPhone = (studentId: string) => {
    const s = students.find(st => st.id === studentId);
    return s ? s.phone : '';
  };

  // Get student email lookup
  const getStudentEmail = (studentId: string) => {
    const s = students.find(st => st.id === studentId);
    return s ? s.email : '';
  };

  // Format INR Currency
  const formatINR = (value: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(value);
  };

  // Filter pending fee records
  const pendingRecords = feeRecords.filter(r => {
    // 1. Must have outstanding dues
    const hasOutstanding = r.status !== 'Paid';
    if (!hasOutstanding) return false;

    // 2. Search filter
    const matchesSearch = r.studentName.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          r.title.toLowerCase().includes(searchTerm.toLowerCase());

    // 3. Branch filter
    let matchesBranch = true;
    if (user.role === 'ADMIN') {
      if (selectedBranch !== 'All') matchesBranch = r.branch === selectedBranch;
    } else {
      matchesBranch = r.branch === user.branch;
    }

    // 4. Course filter
    const matchesCourse = selectedCourse === 'All' || r.course === selectedCourse;

    // 5. Overdue filter
    const isOverdue = r.dueDate < todayStr;
    const matchesOverdue = !overdueOnly || isOverdue;

    // 6. Date range filter
    let matchesDateRange = true;
    if (startDate) {
      matchesDateRange = matchesDateRange && r.dueDate >= startDate;
    }
    if (endDate) {
      matchesDateRange = matchesDateRange && r.dueDate <= endDate;
    }

    return matchesSearch && matchesBranch && matchesCourse && matchesOverdue && matchesDateRange;
  });

  // Calculate total outstanding pending of filtered results
  const totalOutstandingFiltered = pendingRecords.reduce((sum, r) => sum + (r.amount - r.paidAmount), 0);

  // Trigger WhatsApp Reminder opens wa.me Link
  const handleWhatsAppReminder = (record: FeeRecord) => {
    const studentPhone = getStudentPhone(record.studentId);
    if (!studentPhone) {
      alert('Student phone number not found.');
      return;
    }

    // Clean phone number (keep only digits and + symbol)
    const cleanPhone = studentPhone.replace(/[^\d+]/g, '');
    
    const remainingDue = record.amount - record.paidAmount;
    
    // Construct friendly professional message
    const message = `Gentle Reminder: Dear ${record.studentName}, your fee payment of ${formatINR(remainingDue)} for "${record.title}" is outstanding. The payment due date was ${record.dueDate}. Please make the payment via UPI, Cash, or Bank Transfer at your earliest convenience. Thank you, Primex Institute.`;

    const encodedMessage = encodeURIComponent(message);
    const waUrl = `https://wa.me/${cleanPhone}?text=${encodedMessage}`;
    
    window.open(waUrl, '_blank');
  };

  // List unique courses for filtering selection
  const uniqueCourses = Array.from(new Set(students.map(s => s.course)));

  return (
    <div id="pending-payments-tab-content" className="space-y-6">
      
      {/* Upper header summary panel */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-5 rounded-xl border border-slate-100 shadow-sm">
        <div>
          <h3 className="text-xl font-bold text-slate-800 tracking-tight flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-500 inline-block animate-pulse"></span>
            Outstanding Dues & Reminders
          </h3>
          <p className="text-slate-500 text-sm font-medium">Outreach console for students with unpaid fee balances, past due reminders, and dialing.</p>
        </div>

        <div className="bg-rose-50 border border-rose-100 p-4 rounded-xl flex items-center gap-3 shrink-0">
          <div className="w-10 h-10 rounded-lg bg-rose-500 text-white flex items-center justify-center font-bold">
            ₹
          </div>
          <div>
            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Total Outstanding Due</p>
            <h4 className="text-xl font-bold text-rose-700 tracking-tight">{formatINR(totalOutstandingFiltered)}</h4>
            <p className="text-[9px] text-slate-400 font-semibold">{pendingRecords.length} accounts pending</p>
          </div>
        </div>
      </div>

      {/* Filters bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm space-y-4">
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          
          {/* Search bar */}
          <div className="relative">
            <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
              <Search className="w-4.5 h-4.5" />
            </span>
            <input
              id="pending-search-input"
              type="text"
              className="block w-full pl-9 pr-3 py-2 border border-slate-200 rounded-lg text-sm text-slate-900 bg-slate-50/50 focus:outline-none"
              placeholder="Search student or course..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          {/* Branch Filter */}
          {user.role === 'ADMIN' ? (
            <select
              id="pending-branch-select"
              className="block w-full px-3 py-2 border border-slate-200 rounded-lg text-sm text-slate-700 bg-slate-50/50 focus:outline-none"
              value={selectedBranch}
              onChange={(e) => setSelectedBranch(e.target.value)}
            >
              <option value="All">All Branches</option>
              <option value="Urga">Urga Branch</option>
              <option value="Niharika">Niharika Branch</option>
            </select>
          ) : (
            <div className="block w-full px-3 py-2 border border-slate-200 bg-slate-100 text-slate-500 rounded-lg text-sm font-medium flex items-center gap-1.5">
              <MapPin className="w-4 h-4 text-slate-400" /> {user.branch} Campus Dues
            </div>
          )}

          {/* Course filter */}
          <select
            id="pending-course-select"
            className="block w-full px-3 py-2 border border-slate-200 rounded-lg text-sm text-slate-700 bg-slate-50/50 focus:outline-none"
            value={selectedCourse}
            onChange={(e) => setSelectedCourse(e.target.value)}
          >
            <option value="All">All Courses</option>
            {uniqueCourses.map(cName => (
              <option key={cName} value={cName}>{cName}</option>
            ))}
          </select>

          {/* Overdue Checkbox Trigger */}
          <button
            type="button"
            onClick={() => setOverdueOnly(!overdueOnly)}
            className={`w-full px-3 py-2 border rounded-lg text-sm font-semibold transition-all flex items-center justify-center gap-2 cursor-pointer ${
              overdueOnly 
                ? 'bg-rose-50 border-rose-300 text-rose-700 font-bold' 
                : 'border-slate-200 bg-slate-50/30 hover:bg-slate-50 text-slate-600'
            }`}
          >
            <AlertCircle className={`w-4 h-4 ${overdueOnly ? 'text-rose-600' : 'text-slate-400'}`} />
            Show Overdue Only
          </button>

        </div>

        {/* Date Filters block */}
        <div className="pt-3 border-t border-slate-100 flex flex-col sm:flex-row items-start sm:items-center gap-3">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1 shrink-0">
            <ListFilter className="w-3.5 h-3.5 text-indigo-500" />
            Filter by Due Date:
          </span>
          
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <input
              type="date"
              className="px-2.5 py-1 border border-slate-200 rounded-lg text-xs text-slate-600 focus:outline-none"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              placeholder="Start Date"
            />
            <span className="text-slate-400 text-xs">to</span>
            <input
              type="date"
              className="px-2.5 py-1 border border-slate-200 rounded-lg text-xs text-slate-600 focus:outline-none"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              placeholder="End Date"
            />
            {(startDate || endDate) && (
              <button
                onClick={() => { setStartDate(''); setEndDate(''); }}
                className="text-xs text-indigo-600 hover:underline ml-1 font-semibold cursor-pointer"
              >
                Clear Dates
              </button>
            )}
          </div>
        </div>

      </div>

      {/* Directory Table Grid */}
      <div className="bg-white rounded-xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 text-slate-500 text-xs font-semibold uppercase tracking-wider border-b border-slate-100">
                <th className="px-6 py-4">Student & Contact</th>
                <th className="px-6 py-4">Billing Item</th>
                <th className="px-6 py-4">Course</th>
                <th className="px-6 py-4">Dues (INR)</th>
                <th className="px-6 py-4">Due Date</th>
                <th className="px-6 py-4 text-center">Remind & Contact</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm text-slate-700">
              {pendingRecords.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-10 text-slate-400 font-medium">
                    No outstanding dues found matching the filter criteria. All clear!
                  </td>
                </tr>
              ) : (
                pendingRecords.map((record) => {
                  const studentPhone = getStudentPhone(record.studentId);
                  const studentEmail = getStudentEmail(record.studentId);
                  const remainingDue = record.amount - record.paidAmount;
                  const isOverdue = record.dueDate < todayStr;

                  return (
                    <tr key={record.id} className="hover:bg-slate-50/50 transition-colors">
                      
                      {/* Name & phone */}
                      <td className="px-6 py-4">
                        <div>
                          <p className="font-bold text-slate-900">{record.studentName}</p>
                          <p className="text-xs text-slate-500 font-medium mt-0.5">{studentPhone || studentEmail}</p>
                          <span className="text-[10px] font-semibold text-slate-400 bg-slate-50 px-1.5 py-0.5 border border-slate-100 rounded mt-1 inline-block">
                            Campus: {record.branch}
                          </span>
                        </div>
                      </td>

                      {/* Billing Item */}
                      <td className="px-6 py-4">
                        <div>
                          <p className="font-semibold text-slate-800">{record.title}</p>
                          <p className="text-xs text-slate-400 mt-0.5">Total Generated: {formatINR(record.amount)}</p>
                        </div>
                      </td>

                      {/* Course */}
                      <td className="px-6 py-4">
                        <span className="text-xs font-medium text-slate-600 flex items-center gap-1 bg-slate-100/50 px-2 py-1 rounded w-fit">
                          <GraduationCap className="w-3.5 h-3.5 text-indigo-400" />
                          {record.course}
                        </span>
                      </td>

                      {/* Dues */}
                      <td className="px-6 py-4 font-bold text-rose-600">
                        <div className="flex items-center gap-0.5">
                          <span>{formatINR(remainingDue)}</span>
                          {record.paidAmount > 0 && (
                            <span className="text-[10px] text-slate-400 font-normal pl-1">
                              (Paid ₹{record.paidAmount})
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Due Date */}
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-1 text-xs">
                          <Calendar className={`w-3.5 h-3.5 ${isOverdue ? 'text-rose-500 animate-pulse' : 'text-slate-400'}`} />
                          <span className={`font-medium ${isOverdue ? 'text-rose-600 font-semibold' : 'text-slate-600'}`}>
                            {record.dueDate}
                          </span>
                          {isOverdue && (
                            <span className="text-[9px] font-extrabold text-rose-700 bg-rose-50 border border-rose-100 px-1 py-0.2 rounded-full">
                              OVERDUE
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Remind and Contact */}
                      <td className="px-6 py-4 text-center">
                        <div className="inline-flex items-center gap-2">
                          
                          {/* WhatsApp Reminder */}
                          <button
                            onClick={() => handleWhatsAppReminder(record)}
                            className="inline-flex items-center gap-1 px-2.5 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 text-xs font-bold rounded-lg cursor-pointer transition-colors"
                            title="Send WhatsApp Reminder"
                          >
                            <MessageSquare className="w-3.5 h-3.5" />
                            Reminder
                          </button>

                          {/* Click-to-Call */}
                          {studentPhone ? (
                            <a
                              href={`tel:${studentPhone}`}
                              className="inline-flex items-center justify-center p-1.5 bg-sky-50 hover:bg-sky-100 text-sky-700 hover:text-sky-800 rounded-lg transition-colors"
                              title={`Dial Student (${studentPhone})`}
                            >
                              <Phone className="w-4 h-4" />
                            </a>
                          ) : (
                            <span className="p-1.5 bg-slate-50 text-slate-300 rounded cursor-not-allowed">
                              <Phone className="w-4 h-4" />
                            </span>
                          )}

                        </div>
                      </td>

                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}
