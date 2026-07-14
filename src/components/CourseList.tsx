import React, { useState } from 'react';
import { BookOpen, Search, Plus, Edit2, Trash2, Calendar, Award, DollarSign, X, AlertCircle } from 'lucide-react';
import { CourseFeeStructure, User } from '../types';

interface CourseListProps {
  courses: CourseFeeStructure[];
  user: User;
  onAddCourse: (course: Omit<CourseFeeStructure, 'id'>) => Promise<void>;
  onEditCourse: (id: string, course: Partial<CourseFeeStructure>) => Promise<void>;
  onDeleteCourse: (id: string) => Promise<void>;
}

export default function CourseList({ courses, user, onAddCourse, onEditCourse, onDeleteCourse }: CourseListProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCourse, setEditingCourse] = useState<CourseFeeStructure | null>(null);

  // Form Fields State
  const [courseName, setCourseName] = useState('');
  const [totalFee, setTotalFee] = useState<number | ''>('');
  const [monthlyFee, setMonthlyFee] = useState<number | ''>('');
  const [dueDateDay, setDueDateDay] = useState<number | ''>(10);

  const [formError, setFormError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  const isAdmin = user.role === 'ADMIN';

  const formatINR = (value: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(value);
  };

  const filteredCourses = courses.filter(course =>
    course.courseName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const openAddModal = () => {
    setEditingCourse(null);
    setCourseName('');
    setTotalFee('');
    setMonthlyFee('');
    setDueDateDay(10);
    setFormError(null);
    setIsModalOpen(true);
  };

  const openEditModal = (course: CourseFeeStructure) => {
    setEditingCourse(course);
    setCourseName(course.courseName);
    setTotalFee(course.totalFee);
    setMonthlyFee(course.monthlyFee);
    setDueDateDay(course.dueDateDay);
    setFormError(null);
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAdmin) {
      setFormError("Only administrators can perform this action");
      return;
    }

    if (!courseName.trim()) {
      setFormError("Course name is required");
      return;
    }

    if (totalFee === '' || totalFee <= 0) {
      setFormError("Please enter a valid Total Fee greater than 0");
      return;
    }

    if (monthlyFee === '' || monthlyFee < 0) {
      setFormError("Please enter a valid Monthly Fee (can be 0 if single payment)");
      return;
    }

    if (dueDateDay === '' || dueDateDay < 1 || dueDateDay > 31) {
      setFormError("Due date day must be between 1 and 31");
      return;
    }

    setFormError(null);
    setIsSubmitting(true);

    try {
      if (editingCourse) {
        await onEditCourse(editingCourse.id, {
          courseName: courseName.trim(),
          totalFee: Number(totalFee),
          monthlyFee: Number(monthlyFee),
          dueDateDay: Number(dueDateDay)
        });
      } else {
        await onAddCourse({
          courseName: courseName.trim(),
          totalFee: Number(totalFee),
          monthlyFee: Number(monthlyFee),
          dueDateDay: Number(dueDateDay)
        });
      }
      setIsModalOpen(false);
    } catch (err: any) {
      setFormError(err.message || "Failed to save course structure. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!isAdmin) return;
    try {
      await onDeleteCourse(id);
      setDeleteConfirmId(null);
    } catch (err: any) {
      alert(err.message || "Failed to delete course.");
    }
  };

  const avgTotalFee = courses.length > 0
    ? courses.reduce((sum, c) => sum + c.totalFee, 0) / courses.length
    : 0;

  return (
    <div id="course-management-tab" className="space-y-6">
      
      {/* 1. SECTION HEADER */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h3 className="text-xl font-bold text-slate-800 tracking-tight">Course Structures</h3>
          <p className="text-slate-500 text-sm font-medium">Configure program catalogs, pricing tiers, and monthly billing schedules.</p>
        </div>

        {isAdmin && (
          <button
            id="add-course-btn"
            onClick={openAddModal}
            className="inline-flex items-center gap-1.5 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-lg shadow-xs cursor-pointer transition-all shrink-0"
          >
            <Plus className="w-4 h-4" />
            Add New Program
          </button>
        )}
      </div>

      {/* 2. STATS CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-xl border border-slate-100 shadow-xs flex items-center gap-4">
          <div className="w-10 h-10 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
            <BookOpen className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Active Programs</p>
            <h4 className="text-xl font-bold text-slate-900 mt-0.5">{courses.length} Courses</h4>
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-100 shadow-xs flex items-center gap-4">
          <div className="w-10 h-10 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <Award className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Average Program Fee</p>
            <h4 className="text-xl font-bold text-slate-900 mt-0.5">{formatINR(avgTotalFee)}</h4>
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-100 shadow-xs flex items-center gap-4">
          <div className="w-10 h-10 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
            <Calendar className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Standard Due Date Day</p>
            <h4 className="text-xl font-bold text-slate-900 mt-0.5">10th of Month</h4>
          </div>
        </div>
      </div>

      {/* 3. SEARCH & LIST TABLE */}
      <div className="bg-white rounded-xl border border-slate-100 shadow-xs overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex flex-col sm:flex-row justify-between items-center gap-3">
          <div className="relative w-full sm:max-w-xs">
            <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
              <Search className="w-4 h-4" />
            </span>
            <input
              type="text"
              placeholder="Search programs..."
              className="block w-full pl-9 pr-4 py-2 border border-slate-200 rounded-lg text-xs font-semibold placeholder-slate-400 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 bg-slate-50/50"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <span className="text-xs text-slate-400 font-semibold">{filteredCourses.length} programs loaded</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50 text-slate-500 font-bold uppercase tracking-wider border-b border-slate-100">
                <th className="px-6 py-3.5">Course Name / Title</th>
                <th className="px-6 py-3.5">Total Package Fee</th>
                <th className="px-6 py-3.5">Monthly Installment</th>
                <th className="px-6 py-3.5">Due Date Cycle</th>
                {isAdmin && <th className="px-6 py-3.5 text-right">Actions</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {filteredCourses.length === 0 ? (
                <tr>
                  <td colSpan={5} className="text-center py-12 text-slate-400 font-medium">
                    No course structures found matching current search filters.
                  </td>
                </tr>
              ) : (
                filteredCourses.map((course) => (
                  <tr key={course.id} className="hover:bg-slate-50/40">
                    <td className="px-6 py-4 font-bold text-slate-900 text-sm">
                      {course.courseName}
                    </td>
                    <td className="px-6 py-4 font-bold text-indigo-700 text-sm">
                      {formatINR(course.totalFee)}
                    </td>
                    <td className="px-6 py-4 font-semibold text-slate-600 text-xs">
                      {course.monthlyFee > 0 ? `${formatINR(course.monthlyFee)} / month` : 'Single Installment'}
                    </td>
                    <td className="px-6 py-4 text-slate-500 font-medium text-xs">
                      Day <span className="font-bold text-slate-800">{course.dueDateDay}</span> of every billing month
                    </td>
                    {isAdmin && (
                      <td className="px-6 py-4 text-right">
                        {deleteConfirmId === course.id ? (
                          <div className="flex justify-end items-center gap-1.5">
                            <span className="text-[10px] text-red-500 font-bold">Delete?</span>
                            <button
                              onClick={() => handleDelete(course.id)}
                              className="px-2 py-1 bg-red-600 text-white rounded text-[10px] font-bold"
                            >
                              Yes
                            </button>
                            <button
                              onClick={() => setDeleteConfirmId(null)}
                              className="px-2 py-1 bg-slate-200 text-slate-700 rounded text-[10px] font-bold"
                            >
                              No
                            </button>
                          </div>
                        ) : (
                          <div className="flex justify-end gap-1.5">
                            <button
                              onClick={() => openEditModal(course)}
                              className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-md transition-all cursor-pointer"
                              title="Edit Program"
                            >
                              <Edit2 className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => setDeleteConfirmId(course.id)}
                              className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-md transition-all cursor-pointer"
                              title="Delete Program"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        )}
                      </td>
                    )}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* 4. DIALOG MODAL (ADD / EDIT) */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-xl border border-slate-100 max-w-md w-full overflow-hidden animate-in fade-in duration-200">
            
            <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
              <h3 className="font-bold text-slate-800 text-base">
                {editingCourse ? 'Modify Course Details' : 'Register New Course'}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-md"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              
              {formError && (
                <div className="p-3 bg-red-50 border border-red-100 text-red-700 rounded-lg flex items-start gap-2 text-xs font-semibold">
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-red-500" />
                  <span>{formError}</span>
                </div>
              )}

              {/* Course Name */}
              <div className="space-y-1">
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider">Program Name</label>
                <input
                  type="text"
                  placeholder="e.g. Cyber Security Practitioner"
                  className="block w-full px-3.5 py-2 border border-slate-200 rounded-lg text-sm placeholder-slate-400 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                  value={courseName}
                  onChange={(e) => setCourseName(e.target.value)}
                  required
                />
              </div>

              {/* Fee Grid */}
              <div className="grid grid-cols-2 gap-4">
                {/* Total Fee */}
                <div className="space-y-1">
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider">Total Package Fee (INR)</label>
                  <input
                    type="number"
                    placeholder="45000"
                    className="block w-full px-3.5 py-2 border border-slate-200 rounded-lg text-sm placeholder-slate-400 focus:outline-none focus:border-indigo-500"
                    value={totalFee}
                    onChange={(e) => setTotalFee(e.target.value === '' ? '' : Number(e.target.value))}
                    required
                  />
                </div>

                {/* Monthly Fee */}
                <div className="space-y-1">
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider">Monthly Fee (INR)</label>
                  <input
                    type="number"
                    placeholder="5000"
                    className="block w-full px-3.5 py-2 border border-slate-200 rounded-lg text-sm placeholder-slate-400 focus:outline-none focus:border-indigo-500"
                    value={monthlyFee}
                    onChange={(e) => setMonthlyFee(e.target.value === '' ? '' : Number(e.target.value))}
                    required
                  />
                </div>
              </div>

              {/* Due Date Cycle Day */}
              <div className="space-y-1">
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider">Due Date Calendar Day (1 - 31)</label>
                <input
                  type="number"
                  min="1"
                  max="31"
                  placeholder="10"
                  className="block w-full px-3.5 py-2 border border-slate-200 rounded-lg text-sm placeholder-slate-400 focus:outline-none focus:border-indigo-500"
                  value={dueDateDay}
                  onChange={(e) => setDueDateDay(e.target.value === '' ? '' : Number(e.target.value))}
                  required
                />
                <p className="text-[10px] text-slate-400 font-semibold">Standard calendar day of month for monthly bills collection.</p>
              </div>

              {/* Actions Footer */}
              <div className="flex justify-end gap-2 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-xs font-bold text-slate-500 hover:bg-slate-50 rounded-lg border border-slate-200 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-4 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 rounded-lg shadow-sm cursor-pointer"
                >
                  {isSubmitting ? 'Saving...' : 'Save Structure'}
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

    </div>
  );
}
