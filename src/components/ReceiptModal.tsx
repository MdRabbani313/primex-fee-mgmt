import React, { useEffect, useState } from 'react';
import { X, Printer, Share2, Mail, Phone, Landmark, Check, AlertCircle } from 'lucide-react';
import { Student, Payment, FeeRecord } from '../types';
import { apiGetReceipt } from '../api';

interface ReceiptModalProps {
  receiptNo: string | null;
  onClose: () => void;
}

interface ReceiptDetails {
  payment: Payment;
  student: Student;
  feeRecord: FeeRecord;
}

export default function ReceiptModal({ receiptNo, onClose }: ReceiptModalProps) {
  const [details, setDetails] = useState<ReceiptDetails | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!receiptNo) return;

    const fetchReceiptDetails = async () => {
      setLoading(true);
      setError(null);
      try {
        const token = localStorage.getItem('primex_token') || '';
        const data = await apiGetReceipt(token, receiptNo);
        setDetails(data);
      } catch (err: any) {
        setError(err.message || 'Failed to load receipt.');
      } finally {
        setLoading(false);
      }
    };

    fetchReceiptDetails();
  }, [receiptNo]);

  if (!receiptNo) return null;

  // Print helper
  const handlePrint = () => {
    window.print();
  };

  // WhatsApp Share helper
  const handleWhatsAppShare = () => {
    if (!details) return;

    const studentPhone = details.student.phone;
    if (!studentPhone) {
      alert('Student phone number not found.');
      return;
    }

    const cleanPhone = studentPhone.replace(/[^\d+]/g, '');
    const amountPaid = formatINR(details.payment.amount);
    const remainingBalance = formatINR(details.feeRecord.amount - details.feeRecord.paidAmount);

    const message = `Payment Receipt Confirmation:\n\nDear ${details.student.name},\n\nThank you for your payment of ${amountPaid} toward "${details.feeRecord.title}".\n\n- Receipt No: ${details.payment.receiptNo}\n- Date: ${details.payment.paymentDate}\n- Payment Mode: ${details.payment.paymentMode}\n- Remaining Outstanding Due: ${remainingBalance}\n\nThank you for choosing Primex Institute.`;

    const encodedMessage = encodeURIComponent(message);
    const waUrl = `https://wa.me/${cleanPhone}?text=${encodedMessage}`;
    
    window.open(waUrl, '_blank');
  };

  // Format INR Currency
  const formatINR = (value: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(value);
  };

  return (
    <div id="print-receipt-modal" className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-xl shadow-xl border border-slate-100 max-w-2xl w-full overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Modal Controls Bar (Hidden during print) */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 no-print bg-slate-50">
          <h3 className="font-bold text-slate-800 text-sm tracking-tight flex items-center gap-1.5">
            <Check className="w-5 h-5 text-emerald-600" />
            Receipt Recorded Successfully
          </h3>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="inline-flex items-center gap-1 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-md shadow-sm cursor-pointer transition-colors"
            >
              <Printer className="w-3.5 h-3.5" />
              Print / Save PDF
            </button>
            <button
              onClick={handleWhatsAppShare}
              className="inline-flex items-center gap-1 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-md shadow-sm cursor-pointer transition-colors"
            >
              <Share2 className="w-3.5 h-3.5" />
              WhatsApp Share
            </button>
            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-150 rounded-lg cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Receipt Scroll Container */}
        <div className="flex-1 overflow-y-auto p-8 bg-slate-50/20">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-20 text-slate-500 text-sm gap-2">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
              <span>Fetching secure receipt particulars...</span>
            </div>
          ) : error ? (
            <div className="text-center py-10 text-rose-600 flex flex-col items-center gap-2">
              <AlertCircle className="w-8 h-8 text-rose-500" />
              <p>{error}</p>
              <button onClick={onClose} className="text-sm text-indigo-600 font-bold hover:underline">
                Close Modal
              </button>
            </div>
          ) : details ? (
            
            /* Physical Invoice Template */
            <div id="receipt-invoice-body" className="bg-white border border-slate-200 shadow-sm rounded-lg p-6 sm:p-8 space-y-6 max-w-xl mx-auto text-slate-800">
              
              {/* Receipt Header Banner */}
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-100 pb-5">
                <div className="flex items-center gap-2">
                  <div className="w-10 h-10 rounded bg-indigo-600 text-white flex items-center justify-center font-bold text-lg shadow-sm">
                    P
                  </div>
                  <div>
                    <h2 className="text-lg font-extrabold text-slate-950 tracking-tight">PRIMEX INSTITUTE</h2>
                    <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Academics & Tech Skill Lab</p>
                  </div>
                </div>

                <div className="text-left sm:text-right text-xs text-slate-500">
                  <p className="font-bold text-indigo-900 flex items-center sm:justify-end gap-1 text-[10px] uppercase tracking-wider">
                    <Landmark className="w-3.5 h-3.5 text-indigo-500" />
                    Campus Branch: {details.payment.branch}
                  </p>
                  <p className="mt-0.5">
                    {details.payment.branch === 'Urga' 
                      ? 'Urga Campus, Ground Floor, Primex Tower, India'
                      : 'Niharika Campus, Sector-4, Primex Hub, India'}
                  </p>
                  <p>Support: +91 99887 76655 | info@primex.edu</p>
                </div>
              </div>

              {/* Invoice Meta Grid */}
              <div className="grid grid-cols-2 gap-4 text-xs">
                <div className="space-y-1">
                  <p className="text-slate-400 font-bold uppercase tracking-wider text-[9px]">Receipt Issued To</p>
                  <p className="font-bold text-slate-900 text-sm">{details.student.name}</p>
                  <p className="text-slate-500 font-medium">Email: {details.student.email}</p>
                  <p className="text-slate-500 font-medium">Phone: {details.student.phone}</p>
                  <p className="text-slate-600 font-medium mt-1">
                    Course: <span className="font-bold text-slate-800">{details.student.course}</span> ({details.student.batch})
                  </p>
                </div>
                
                <div className="space-y-1 text-right">
                  <p className="text-slate-400 font-bold uppercase tracking-wider text-[9px]">Receipt Details</p>
                  <p className="font-bold text-slate-900 text-sm">{details.payment.receiptNo}</p>
                  <p className="text-slate-500">Payment Date: <span className="font-bold text-slate-700">{details.payment.paymentDate}</span></p>
                  <p className="text-slate-500">Mode: <span className="font-bold text-slate-700">{details.payment.paymentMode}</span></p>
                  <p className="text-slate-500">Status: <span className="font-extrabold text-emerald-700 bg-emerald-50 px-1.5 py-0.2 rounded">CONFIRMED</span></p>
                </div>
              </div>

              {/* Transaction Ledger Table */}
              <div className="border border-slate-200 rounded-lg overflow-hidden mt-2 text-xs">
                <table className="w-full text-left">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold">
                      <th className="px-4 py-2">Billing Description</th>
                      <th className="px-4 py-2 text-right">Invoice Amount</th>
                      <th className="px-4 py-2 text-right">Amount Paid</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-slate-700">
                    <tr>
                      <td className="px-4 py-3">
                        <p className="font-semibold">{details.feeRecord.title}</p>
                        <p className="text-[10px] text-slate-400 mt-0.5">Enrolled Course Tuition Dues</p>
                      </td>
                      <td className="px-4 py-3 text-right font-medium">{formatINR(details.feeRecord.amount)}</td>
                      <td className="px-4 py-3 text-right font-bold text-slate-900">{formatINR(details.payment.amount)}</td>
                    </tr>
                    
                    {/* Totals Summary */}
                    <tr className="bg-slate-50/50">
                      <td colSpan={2} className="px-4 py-2 text-right font-bold text-slate-500 text-[10px] uppercase">Amount Received This Transaction</td>
                      <td className="px-4 py-2 text-right font-extrabold text-indigo-700 text-sm">{formatINR(details.payment.amount)}</td>
                    </tr>
                    <tr>
                      <td colSpan={2} className="px-4 py-2 text-right font-bold text-slate-500 text-[10px] uppercase">Total Cumulative Paid Against Bill</td>
                      <td className="px-4 py-2 text-right font-bold text-emerald-700">{formatINR(details.feeRecord.paidAmount)}</td>
                    </tr>
                    <tr className="bg-rose-50/30">
                      <td colSpan={2} className="px-4 py-2 text-right font-bold text-rose-700 text-[10px] uppercase">Outstanding Balance Remaining</td>
                      <td className="px-4 py-2 text-right font-extrabold text-rose-700">{formatINR(details.feeRecord.amount - details.feeRecord.paidAmount)}</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              {/* Receipt Footer Message */}
              <div className="pt-6 border-t border-slate-100 text-center space-y-4">
                <p className="text-[10px] text-slate-400 font-medium">
                  This is a system-generated electronic receipt of payment issued on behalf of Primex Institute. No physical signature required.
                </p>
                
                {/* Signatory line (Shown on print) */}
                <div className="flex justify-between items-end pt-4 text-[10px] text-slate-500">
                  <div>
                    <p className="font-bold text-slate-700">Student Signatory</p>
                    <div className="w-32 border-b border-dashed border-slate-300 mt-6"></div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-slate-700">Authorized Primex Bursar</p>
                    <div className="w-32 border-b border-dashed border-slate-300 mt-6 inline-block"></div>
                  </div>
                </div>
              </div>

            </div>
          ) : null}
        </div>

      </div>
    </div>
  );
}
