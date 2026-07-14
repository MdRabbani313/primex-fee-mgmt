import React from 'react';
import { Landmark, TrendingUp, Users, AlertCircle, IndianRupee, MapPin } from 'lucide-react';
import { DashboardStats, User } from '../types';

interface DashboardProps {
  stats: DashboardStats | null;
  user: User;
  isLoading: boolean;
  onNavigate: (tab: string) => void;
}

export default function Dashboard({ stats, user, isLoading, onNavigate }: DashboardProps) {
  if (isLoading || !stats) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  // Format currency helpers
  const formatINR = (value: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(value);
  };

  const totalPossible = stats.totalCollected + stats.totalPending;
  const collectionPercentage = totalPossible > 0 ? Math.round((stats.totalCollected / totalPossible) * 100) : 0;

  const urgaPossible = stats.branchStats.Urga.collected + stats.branchStats.Urga.pending;
  const urgaPercentage = urgaPossible > 0 ? Math.round((stats.branchStats.Urga.collected / urgaPossible) * 100) : 0;

  const niharikaPossible = stats.branchStats.Niharika.collected + stats.branchStats.Niharika.pending;
  const niharikaPercentage = niharikaPossible > 0 ? Math.round((stats.branchStats.Niharika.collected / niharikaPossible) * 100) : 0;

  const showBranchComparison = user.role === 'ADMIN';

  return (
    <div id="dashboard-tab-content" className="space-y-6">
      
      {/* Welcome message */}
      <div className="bg-gradient-to-r from-indigo-900 to-slate-900 rounded-xl p-6 text-white shadow-sm">
        <h2 className="text-xl sm:text-2xl font-bold tracking-tight">
          Welcome back, {user.name}!
        </h2>
        <p className="text-indigo-200 text-sm mt-1">
          {user.role === 'ADMIN' 
            ? 'Super Administrator dashboard' 
            : `Branch Management System — Campus ${user.branch}`}
        </p>
      </div>

      {/* Grid Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Card 1: Total Collected */}
        <div id="stat-collected" className="bg-white p-5 rounded-xl border border-slate-100 shadow-sm flex items-center gap-4 hover:border-slate-200 transition-all">
          <div className="w-12 h-12 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
            <TrendingUp className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Total Collected</p>
            <h3 className="text-xl sm:text-2xl font-bold text-slate-800 tracking-tight mt-0.5">{formatINR(stats.totalCollected)}</h3>
            <span className="text-[10px] font-medium text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded-full">
              {collectionPercentage}% of generated fees
            </span>
          </div>
        </div>

        {/* Card 2: Total Pending */}
        <div id="stat-pending" className="bg-white p-5 rounded-xl border border-slate-100 shadow-sm flex items-center gap-4 hover:border-slate-200 transition-all">
          <div className="w-12 h-12 rounded-lg bg-rose-50 text-rose-600 flex items-center justify-center shrink-0">
            <IndianRupee className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Outstanding Dues</p>
            <h3 className="text-xl sm:text-2xl font-bold text-slate-800 tracking-tight mt-0.5">{formatINR(stats.totalPending)}</h3>
            <button 
              onClick={() => onNavigate('pending')}
              className="text-[10px] font-semibold text-indigo-600 hover:underline inline-flex items-center gap-0.5 cursor-pointer"
            >
              View pending dues &rarr;
            </button>
          </div>
        </div>

        {/* Card 3: Active Students */}
        <div id="stat-students" className="bg-white p-5 rounded-xl border border-slate-100 shadow-sm flex items-center gap-4 hover:border-slate-200 transition-all">
          <div className="w-12 h-12 rounded-lg bg-sky-50 text-sky-600 flex items-center justify-center shrink-0">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Active Students</p>
            <h3 className="text-xl sm:text-2xl font-bold text-slate-800 tracking-tight mt-0.5">{stats.activeStudents}</h3>
            <span className="text-[10px] font-medium text-slate-500">Currently enrolled</span>
          </div>
        </div>

        {/* Card 4: Overdue reminders */}
        <div id="stat-reminders" className="bg-white p-5 rounded-xl border border-slate-100 shadow-sm flex items-center gap-4 hover:border-slate-200 transition-all">
          <div className="w-12 h-12 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
            <AlertCircle className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Overdue Bills</p>
            <h3 className="text-xl sm:text-2xl font-bold text-slate-800 tracking-tight mt-0.5">{stats.pendingRemindersCount}</h3>
            <span className="text-[10px] font-medium text-amber-700 bg-amber-50 px-1.5 py-0.5 rounded-full">
              Requires attention
            </span>
          </div>
        </div>

      </div>

      {/* Progress metrics */}
      <div className="bg-white p-6 rounded-xl border border-slate-100 shadow-sm">
        <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4">Overall Collection Pipeline</h4>
        <div className="space-y-2">
          <div className="flex justify-between text-sm font-medium">
            <span className="text-slate-600">Total Generated Fee Value: {formatINR(totalPossible)}</span>
            <span className="text-slate-900 font-semibold">{collectionPercentage}% Achieved</span>
          </div>
          <div className="w-full bg-slate-100 h-3.5 rounded-full overflow-hidden flex">
            <div className="bg-emerald-500 h-full rounded-l-full" style={{ width: `${collectionPercentage}%` }}></div>
            <div className="bg-rose-300 h-full" style={{ width: `${100 - collectionPercentage}%` }}></div>
          </div>
          <div className="flex justify-between text-xs text-slate-500 pt-1">
            <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block"></span>Collected: {formatINR(stats.totalCollected)}</span>
            <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-rose-300 inline-block"></span>Pending Dues: {formatINR(stats.totalPending)}</span>
          </div>
        </div>
      </div>

      {/* Branch Comparisons (Only viewable by admin user) */}
      {showBranchComparison && (
        <div id="admin-branch-comparisons" className="space-y-4">
          <h3 className="text-base font-bold text-slate-800 tracking-tight flex items-center gap-1.5">
            <MapPin className="w-5 h-5 text-indigo-600" />
            Branch comparison summary (Urga vs Niharika)
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Urga Branch Block */}
            <div className="bg-white p-6 rounded-xl border border-slate-100 shadow-sm space-y-4 hover:border-emerald-200 transition-all">
              <div className="flex items-center justify-between border-b border-slate-50 pb-3">
                <h4 className="font-bold text-emerald-800 text-lg flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block"></span>
                  Campus Urga
                </h4>
                <span className="text-xs font-medium text-slate-500">{stats.branchStats.Urga.count} Active Students</span>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-emerald-50/40 p-3 rounded-lg">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Collected</p>
                  <p className="text-lg font-bold text-emerald-700 mt-1">{formatINR(stats.branchStats.Urga.collected)}</p>
                </div>
                <div className="bg-rose-50/40 p-3 rounded-lg">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Pending Dues</p>
                  <p className="text-lg font-bold text-rose-700 mt-1">{formatINR(stats.branchStats.Urga.pending)}</p>
                </div>
              </div>

              <div className="space-y-1 pt-2">
                <div className="flex justify-between text-xs font-medium text-slate-600">
                  <span>Collection Ratio</span>
                  <span>{urgaPercentage}%</span>
                </div>
                <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                  <div className="bg-emerald-500 h-full" style={{ width: `${urgaPercentage}%` }}></div>
                </div>
              </div>
            </div>

            {/* Niharika Branch Block */}
            <div className="bg-white p-6 rounded-xl border border-slate-100 shadow-sm space-y-4 hover:border-amber-200 transition-all">
              <div className="flex items-center justify-between border-b border-slate-50 pb-3">
                <h4 className="font-bold text-amber-800 text-lg flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-500 inline-block"></span>
                  Campus Niharika
                </h4>
                <span className="text-xs font-medium text-slate-500">{stats.branchStats.Niharika.count} Active Students</span>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="bg-amber-50/40 p-3 rounded-lg">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Collected</p>
                  <p className="text-lg font-bold text-amber-700 mt-1">{formatINR(stats.branchStats.Niharika.collected)}</p>
                </div>
                <div className="bg-rose-50/40 p-3 rounded-lg">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Pending Dues</p>
                  <p className="text-lg font-bold text-rose-700 mt-1">{formatINR(stats.branchStats.Niharika.pending)}</p>
                </div>
              </div>

              <div className="space-y-1 pt-2">
                <div className="flex justify-between text-xs font-medium text-slate-600">
                  <span>Collection Ratio</span>
                  <span>{niharikaPercentage}%</span>
                </div>
                <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                  <div className="bg-amber-500 h-full" style={{ width: `${niharikaPercentage}%` }}></div>
                </div>
              </div>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
