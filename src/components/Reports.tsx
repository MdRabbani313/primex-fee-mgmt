import React, { useState, useEffect } from 'react';
import { Calendar, Filter, FileText, Download, ListFilter, GraduationCap, MapPin, TrendingUp, AlertTriangle, Printer } from 'lucide-react';
import { FeeRecord, Student, User, Payment } from '../types';

interface ReportsProps {
  feeRecords: FeeRecord[];
  payments: Payment[];
  students: Student[];
  user: User;
}

interface CollectionReportData {
  payments: Payment[];
  summary: {
    totalCollected: number;
    timeline: { date: string; amount: number }[];
    byCourse: { course: string; amount: number }[];
    byMode: { mode: string; amount: number }[];
    byBranch: { branch: string; amount: number }[];
  };
}

export default function Reports({ feeRecords, payments, students, user }: ReportsProps) {
  const [activeReportTab, setActiveReportTab] = useState<'collection' | 'pending'>('collection');
  
  // Date filters
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');
  const [filterBranch, setFilterBranch] = useState<string>('All');
  const [filterCourse, setFilterCourse] = useState<string>('All');

  const [reportData, setReportData] = useState<CollectionReportData | null>(null);

  useEffect(() => {
    // Compile report data client-side based on inputs
    let filteredPayments = [...payments];

    // Branch filter matching user restrictions
    if (user.role === 'BRANCH_URGA') {
      filteredPayments = filteredPayments.filter(p => p.branch === 'Urga');
    } else if (user.role === 'BRANCH_NIHARIKA') {
      filteredPayments = filteredPayments.filter(p => p.branch === 'Niharika');
    } else if (filterBranch !== 'All') {
      filteredPayments = filteredPayments.filter(p => p.branch === filterBranch);
    }

    // Date filters
    if (startDate) {
      filteredPayments = filteredPayments.filter(p => p.paymentDate >= startDate);
    }
    if (endDate) {
      filteredPayments = filteredPayments.filter(p => p.paymentDate <= endDate);
    }

    // Course filter
    if (filterCourse !== 'All') {
      filteredPayments = filteredPayments.filter(p => {
        const student = students.find(s => s.id === p.studentId);
        return student && student.course === filterCourse;
      });
    }

    // Aggregates
    const dailyTimeline: Record<string, number> = {};
    const courseMap: Record<string, number> = {};
    const modeMap: Record<string, number> = { 'Cash': 0, 'UPI': 0, 'Bank Transfer': 0 };
    const branchMap: Record<string, number> = { 'Urga': 0, 'Niharika': 0 };

    filteredPayments.forEach(p => {
      dailyTimeline[p.paymentDate] = (dailyTimeline[p.paymentDate] || 0) + p.amount;

      const student = students.find(s => s.id === p.studentId);
      const cName = student ? student.course : 'Other';
      courseMap[cName] = (courseMap[cName] || 0) + p.amount;

      modeMap[p.paymentMode] = (modeMap[p.paymentMode] || 0) + p.amount;
      branchMap[p.branch] = (branchMap[p.branch] || 0) + p.amount;
    });

    setReportData({
      payments: filteredPayments,
      summary: {
        totalCollected: filteredPayments.reduce((sum, p) => sum + p.amount, 0),
        timeline: Object.entries(dailyTimeline).map(([date, amount]) => ({ date, amount })).sort((a,b) => a.date.localeCompare(b.date)),
        byCourse: Object.entries(courseMap).map(([course, amount]) => ({ course, amount })),
        byMode: Object.entries(modeMap).map(([mode, amount]) => ({ mode, amount })),
        byBranch: Object.entries(branchMap).map(([br, amount]) => ({ branch: br, amount }))
      }
    });

  }, [feeRecords, payments, students, user, startDate, endDate, filterBranch, filterCourse]);

  // List unique courses
  const uniqueCourses = Array.from(new Set(students.map(s => s.course)));

  // Generate Pending Dues report details
  const getPendingDuesReport = () => {
    let list = feeRecords.filter(r => r.status !== 'Paid');

    if (user.role === 'BRANCH_URGA') {
      list = list.filter(r => r.branch === 'Urga');
    } else if (user.role === 'BRANCH_NIHARIKA') {
      list = list.filter(r => r.branch === 'Niharika');
    } else if (filterBranch !== 'All') {
      list = list.filter(r => r.branch === filterBranch);
    }

    if (filterCourse !== 'All') {
      list = list.filter(r => r.course === filterCourse);
    }

    return list.map(r => ({
      ...r,
      outstanding: r.amount - r.paidAmount
    }));
  };

  const pendingDuesList = getPendingDuesReport();
  const totalOutstandingDue = pendingDuesList.reduce((sum, item) => sum + item.outstanding, 0);

  // Format currency helpers
  const formatINR = (value: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(value);
  };

  // CSV Exporter
  const exportToCSV = (headers: string[], rows: string[][], filename: string) => {
    const csvContent = "data:text/csv;charset=utf-8," 
      + [headers.join(','), ...rows.map(e => e.map(val => `"${String(val).replace(/"/g, '""')}"`).join(','))].join('\n');
    
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `${filename}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Collection Report Export Trigger
  const handleExportCollection = () => {
    if (!reportData) return;
    const headers = ["Payment Date", "Receipt No", "Student Name", "Campus Branch", "Payment Mode", "Collection Amount (INR)", "Notes"];
    const rows = reportData.payments.map(p => [
      p.paymentDate,
      p.receiptNo,
      p.studentName,
      p.branch,
      p.paymentMode,
      String(p.amount),
      p.notes || ''
    ]);
    exportToCSV(headers, rows, `Primex_Fee_Collections_Report_${new Date().toISOString().split('T')[0]}`);
  };

  // Pending Report Export Trigger
  const handleExportPending = () => {
    const headers = ["Student Name", "Campus Branch", "Course Name", "Batch", "Billing Title", "Total Bill (INR)", "Amount Paid (INR)", "Net Outstanding (INR)", "Due Date"];
    const rows = pendingDuesList.map(item => [
      item.studentName,
      item.branch,
      item.course,
      item.batch,
      item.title,
      String(item.amount),
      String(item.paidAmount),
      String(item.outstanding),
      item.dueDate
    ]);
    exportToCSV(headers, rows, `Primex_Pending_Dues_Report_${new Date().toISOString().split('T')[0]}`);
  };

  const handlePrintReport = () => {
    window.print();
  };

  return (
    <div id="reports-tab-content" className="space-y-6">
      
      {/* Report Header & Action */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 no-print">
        <div>
          <h3 className="text-xl font-bold text-slate-800 tracking-tight">Reports & Audits</h3>
          <p className="text-slate-500 text-sm font-medium">Verify daily collections, course enrollments, and pending dues balances.</p>
        </div>
        
        {/* PDF / Excel controls */}
        <div className="flex gap-2 shrink-0">
          <button
            onClick={handlePrintReport}
            className="inline-flex items-center gap-1.5 px-3 py-2 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-bold rounded-lg cursor-pointer transition-colors"
          >
            <Printer className="w-4 h-4 text-slate-400" />
            Print Report
          </button>
          
          <button
            onClick={activeReportTab === 'collection' ? handleExportCollection : handleExportPending}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-lg shadow-xs cursor-pointer transition-all"
          >
            <Download className="w-4 h-4" />
            Export to Excel (CSV)
          </button>
        </div>
      </div>

      {/* Report Switcher Tabs */}
      <div className="border-b border-slate-200 flex gap-4 no-print">
        <button
          onClick={() => setActiveReportTab('collection')}
          className={`pb-3 text-sm font-bold border-b-2 transition-all cursor-pointer ${
            activeReportTab === 'collection' 
              ? 'border-indigo-600 text-indigo-700' 
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          Fee Collection Summary
        </button>
        <button
          onClick={() => setActiveReportTab('pending')}
          className={`pb-3 text-sm font-bold border-b-2 transition-all cursor-pointer ${
            activeReportTab === 'pending' 
              ? 'border-indigo-600 text-indigo-700' 
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          Pending Dues breakdown
        </button>
      </div>

      {/* Filters Ribbon (No-Print) */}
      <div className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 no-print">
        
        {/* Start Date */}
        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-400 font-semibold uppercase shrink-0">From</span>
          <input
            type="date"
            className="block w-full px-3 py-1.5 border border-slate-200 rounded-lg text-sm text-slate-700"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
          />
        </div>

        {/* End Date */}
        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-400 font-semibold uppercase shrink-0">To</span>
          <input
            type="date"
            className="block w-full px-3 py-1.5 border border-slate-200 rounded-lg text-sm text-slate-700"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
          />
        </div>

        {/* Branch */}
        {user.role === 'ADMIN' ? (
          <select
            className="block w-full px-3 py-2 border border-slate-200 rounded-lg text-sm text-slate-700"
            value={filterBranch}
            onChange={(e) => setFilterBranch(e.target.value)}
          >
            <option value="All">All Branches</option>
            <option value="Urga">Urga Branch</option>
            <option value="Niharika">Niharika Branch</option>
          </select>
        ) : (
          <div className="block w-full px-3 py-2 border border-slate-200 bg-slate-100 text-slate-500 rounded-lg text-sm font-medium">
            Campus: {user.branch} (Locked)
          </div>
        )}

        {/* Course */}
        <select
          className="block w-full px-3 py-2 border border-slate-200 rounded-lg text-sm text-slate-700"
          value={filterCourse}
          onChange={(e) => setFilterCourse(e.target.value)}
        >
          <option value="All">All Courses</option>
          {uniqueCourses.map(c => (
            <option key={c} value={c}>{c}</option>
          ))}
        </select>

      </div>

      {/* TAB 1: COLLECTION REPORT CONTENT */}
      {activeReportTab === 'collection' && reportData && (
        <div className="space-y-6">
          
          {/* Quick Metrics */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            
            {/* Total collected within date-range */}
            <div className="bg-emerald-50/40 p-5 rounded-xl border border-emerald-100 flex items-center gap-4">
              <div className="w-10 h-10 rounded-lg bg-emerald-500 text-white flex items-center justify-center font-bold">
                ₹
              </div>
              <div>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Collections In Period</p>
                <h4 className="text-xl font-bold text-emerald-800 tracking-tight">{formatINR(reportData.summary.totalCollected)}</h4>
                <p className="text-[10px] text-slate-400 font-semibold">{reportData.payments.length} successful receipts</p>
              </div>
            </div>

            {/* UPI Share bar */}
            <div className="bg-white p-5 rounded-xl border border-slate-100 shadow-sm">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Collection Channel Share</p>
              <div className="space-y-1.5 text-xs">
                {reportData.summary.byMode.map(m => {
                  const share = reportData.summary.totalCollected > 0 ? Math.round((m.amount / reportData.summary.totalCollected) * 100) : 0;
                  return (
                    <div key={m.mode} className="space-y-0.5">
                      <div className="flex justify-between text-[11px] font-medium text-slate-600">
                        <span>{m.mode}</span>
                        <span className="font-bold text-slate-900">{formatINR(m.amount)} ({share}%)</span>
                      </div>
                      <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                        <div className="bg-indigo-500 h-full" style={{ width: `${share}%` }}></div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Branch Share bar (Visible to Admin only) */}
            <div className="bg-white p-5 rounded-xl border border-slate-100 shadow-sm">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Branch Collection Distribution</p>
              {user.role === 'ADMIN' ? (
                <div className="space-y-1.5 text-xs">
                  {reportData.summary.byBranch.map(b => {
                    const share = reportData.summary.totalCollected > 0 ? Math.round((b.amount / reportData.summary.totalCollected) * 100) : 0;
                    return (
                      <div key={b.branch} className="space-y-0.5">
                        <div className="flex justify-between text-[11px] font-medium text-slate-600">
                          <span>Campus {b.branch}</span>
                          <span className="font-bold text-slate-900">{formatINR(b.amount)} ({share}%)</span>
                        </div>
                        <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                          <div className={`h-full ${b.branch === 'Urga' ? 'bg-emerald-500' : 'bg-amber-500'}`} style={{ width: `${share}%` }}></div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="h-full flex items-center justify-center text-xs text-slate-400 font-medium">
                  Branch isolation locks Urga vs Niharika comparison.
                </div>
              )}
            </div>

          </div>

          {/* Course-wise collection summary */}
          <div className="bg-white p-6 rounded-xl border border-slate-100 shadow-sm space-y-4">
            <h4 className="text-sm font-bold text-slate-800 flex items-center gap-1.5">
              <GraduationCap className="w-4 h-4 text-indigo-500" />
              Course-wise Fees Collected Across Batches
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {reportData.summary.byCourse.length === 0 ? (
                <p className="text-xs text-slate-400 py-4 col-span-2 text-center">No course-specific collections in this filter period.</p>
              ) : (
                reportData.summary.byCourse.map(c => {
                  const percent = reportData.summary.totalCollected > 0 ? Math.round((c.amount / reportData.summary.totalCollected) * 100) : 0;
                  return (
                    <div key={c.course} className="p-3 bg-slate-50/50 rounded-lg border border-slate-100 flex flex-col justify-between">
                      <div className="flex justify-between text-xs font-semibold text-slate-700">
                        <span>{c.course}</span>
                        <span>{formatINR(c.amount)}</span>
                      </div>
                      <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden mt-2">
                        <div className="bg-indigo-600 h-full" style={{ width: `${percent}%` }}></div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* Detailed Receipts Ledger */}
          <div className="bg-white rounded-xl border border-slate-100 shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100">
              <h4 className="text-sm font-bold text-slate-800">Collections Record Ledger</h4>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-50 text-slate-500 font-bold uppercase tracking-wider border-b border-slate-100">
                    <th className="px-6 py-3.5">Payment Date</th>
                    <th className="px-6 py-3.5">Receipt No</th>
                    <th className="px-6 py-3.5">Student</th>
                    <th className="px-6 py-3.5">Campus</th>
                    <th className="px-6 py-3.5">Mode</th>
                    <th className="px-6 py-3.5 text-right">Amount (INR)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700">
                  {reportData.payments.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="text-center py-10 text-slate-400 font-medium">
                        No transactions registered under current filters.
                      </td>
                    </tr>
                  ) : (
                    reportData.payments.map((p) => (
                      <tr key={p.id} className="hover:bg-slate-50/30">
                        <td className="px-6 py-3 font-medium text-slate-500">{p.paymentDate}</td>
                        <td className="px-6 py-3 font-mono font-bold text-indigo-700">{p.receiptNo}</td>
                        <td className="px-6 py-3 font-bold text-slate-900">{p.studentName}</td>
                        <td className="px-6 py-3">
                          <span className={`inline-block px-2 py-0.2 text-[10px] font-bold rounded ${p.branch === 'Urga' ? 'bg-emerald-50 text-emerald-800' : 'bg-amber-50 text-amber-800'}`}>
                            {p.branch}
                          </span>
                        </td>
                        <td className="px-6 py-3 font-semibold text-slate-500">{p.paymentMode}</td>
                        <td className="px-6 py-3 text-right font-bold text-slate-900">{formatINR(p.amount)}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

        </div>
      )}

      {/* TAB 2: PENDING DUES REPORT CONTENT */}
      {activeReportTab === 'pending' && (
        <div className="space-y-6">
          
          {/* Outstanding totals block */}
          <div className="bg-rose-50 border border-rose-100 p-5 rounded-xl flex items-center gap-4">
            <div className="w-12 h-12 rounded-lg bg-rose-500 text-white flex items-center justify-center text-xl font-bold">
              ₹
            </div>
            <div>
              <p className="text-[10px] font-bold text-rose-500 uppercase tracking-wider">Aggregated Outstanding Dues Balance</p>
              <h4 className="text-2xl font-bold text-rose-700 tracking-tight">{formatINR(totalOutstandingDue)}</h4>
              <p className="text-[10px] text-slate-500 font-semibold">{pendingDuesList.length} unique outstanding invoices require collection</p>
            </div>
          </div>

          {/* Student Breakdown Register */}
          <div className="bg-white rounded-xl border border-slate-100 shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center">
              <h4 className="text-sm font-bold text-slate-800">Student-Level Pending Breakdown</h4>
              <span className="text-xs font-semibold text-slate-400">{pendingDuesList.length} accounts overdue</span>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-50 text-slate-500 font-bold uppercase border-b border-slate-100">
                    <th className="px-6 py-3.5">Student Name</th>
                    <th className="px-6 py-3.5">Campus Branch</th>
                    <th className="px-6 py-3.5">Allocated Course & Batch</th>
                    <th className="px-6 py-3.5">Billing Description</th>
                    <th className="px-6 py-3.5 text-right">Invoiced (INR)</th>
                    <th className="px-6 py-3.5 text-right">Dues Outstanding (INR)</th>
                    <th className="px-6 py-3.5">Due Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700">
                  {pendingDuesList.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="text-center py-10 text-slate-400 font-medium">
                        All clear! No pending student dues found matching this filter set.
                      </td>
                    </tr>
                  ) : (
                    pendingDuesList.map((item) => (
                      <tr key={item.id} className="hover:bg-slate-50/30">
                        <td className="px-6 py-3 font-bold text-slate-900">{item.studentName}</td>
                        <td className="px-6 py-3">
                          <span className={`inline-block px-1.5 py-0.2 text-[10px] font-bold rounded ${item.branch === 'Urga' ? 'bg-emerald-50 text-emerald-800' : 'bg-amber-50 text-amber-800'}`}>
                            {item.branch}
                          </span>
                        </td>
                        <td className="px-6 py-3 text-slate-500">
                          <p className="font-medium">{item.course}</p>
                          <p className="text-[10px] text-slate-400 mt-0.5">{item.batch}</p>
                        </td>
                        <td className="px-6 py-3 font-semibold text-slate-700">{item.title}</td>
                        <td className="px-6 py-3 text-right text-slate-500">{formatINR(item.amount)}</td>
                        <td className="px-6 py-3 text-right font-bold text-rose-600">{formatINR(item.outstanding)}</td>
                        <td className="px-6 py-3 font-medium text-slate-600">{item.dueDate}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

        </div>
      )}

    </div>
  );
}
