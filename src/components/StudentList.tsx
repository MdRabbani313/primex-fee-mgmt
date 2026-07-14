import React, { useState } from 'react';
import { Search, Plus, Edit2, Trash2, X, GraduationCap, MapPin, Layers, Phone, Mail, ToggleLeft, ToggleRight, Check } from 'lucide-react';
import { Student, CourseFeeStructure, User, Branch } from '../types';

interface StudentListProps {
  students: Student[];
  courses: CourseFeeStructure[];
  user: User;
  onAddStudent: (student: Omit<Student, 'id'>) => Promise<void>;
  onEditStudent: (id: string, student: Partial<Student>) => Promise<void>;
  onDeleteStudent: (id: string) => Promise<void>;
}

export default function StudentList({
  students,
  courses,
  user,
  onAddStudent,
  onEditStudent,
  onDeleteStudent,
}: StudentListProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedBranch, setSelectedBranch] = useState<string>('All');
  const [selectedCourse, setSelectedCourse] = useState<string>('All');
  const [selectedStatus, setSelectedStatus] = useState<string>('Active');

  // Modal State
  const [isOpen, setIsOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentId, setCurrentId] = useState<string | null>(null);

  // Form Fields
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [branch, setBranch] = useState<Branch>('Urga');
  const [course, setCourse] = useState('');
  const [batch, setBatch] = useState('Batch A - Morning');
  const [status, setStatus] = useState<'Active' | 'Inactive'>('Active');
  const [formError, setFormError] = useState<string | null>(null);

  // Initialize branch in form based on user role
  React.useEffect(() => {
    if (user.role === 'BRANCH_URGA') {
      setBranch('Urga');
    } else if (user.role === 'BRANCH_NIHARIKA') {
      setBranch('Niharika');
    }
  }, [user]);

  // Handle open modal for adding
  const openAddModal = () => {
    setIsEditing(false);
    setCurrentId(null);
    setName('');
    setEmail('');
    setPhone('');
    setBranch(user.branch || 'Urga');
    setCourse(courses[0]?.courseName || '');
    setBatch('Batch A - Morning');
    setStatus('Active');
    setFormError(null);
    setIsOpen(true);
  };

  // Handle open modal for editing
  const openEditModal = (student: Student) => {
    setIsEditing(true);
    setCurrentId(student.id);
    setName(student.name);
    setEmail(student.email);
    setPhone(student.phone);
    setBranch(student.branch);
    setCourse(student.course);
    setBatch(student.batch);
    setStatus(student.status);
    setFormError(null);
    setIsOpen(true);
  };

  // Submit form
  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    // Simple validation
    if (!name.trim() || !email.trim() || !phone.trim() || !course || !batch) {
      setFormError('Please fill out all required fields.');
      return;
    }

    const payload = {
      name: name.trim(),
      email: email.trim(),
      phone: phone.trim(),
      branch,
      course,
      batch,
      admissionDate: new Date().toISOString().split('T')[0],
      status,
    };

    try {
      if (isEditing && currentId) {
        await onEditStudent(currentId, payload);
      } else {
        await onAddStudent(payload);
      }
      setIsOpen(false);
    } catch (err: any) {
      setFormError(err.message || 'An error occurred. Please try again.');
    }
  };

  // Delete student with confirm prompt
  const handleDeleteClick = async (student: Student) => {
    const confirmDelete = window.confirm(`Are you sure you want to delete ${student.name}?`);
    if (confirmDelete) {
      try {
        await onDeleteStudent(student.id);
      } catch (err: any) {
        alert(err.message || 'Could not delete student.');
      }
    }
  };

  // Filter students
  const filteredStudents = students.filter((s) => {
    const matchesSearch =
      s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.phone.includes(searchTerm);

    // Branch filter
    let matchesBranch = true;
    if (user.role === 'ADMIN') {
      if (selectedBranch !== 'All') {
        matchesBranch = s.branch === selectedBranch;
      }
    } else {
      matchesBranch = s.branch === user.branch;
    }

    // Course filter
    const matchesCourse = selectedCourse === 'All' || s.course === selectedCourse;

    // Status filter
    const matchesStatus = selectedStatus === 'All' || s.status === selectedStatus;

    return matchesSearch && matchesBranch && matchesCourse && matchesStatus;
  });

  return (
    <div id="student-list-container" className="space-y-6">
      
      {/* Header and Add button */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h3 className="text-xl font-bold text-slate-800 tracking-tight">Student Directory</h3>
          <p className="text-slate-500 text-sm">Create profiles, course allocations, and manage branch details.</p>
        </div>
        <button
          id="add-student-trigger-btn"
          onClick={openAddModal}
          className="inline-flex items-center gap-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-sm rounded-lg shadow-sm shadow-indigo-100 cursor-pointer transition-colors"
        >
          <Plus className="w-4.5 h-4.5" />
          Add Student
        </button>
      </div>

      {/* Filters bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        
        {/* Search */}
        <div className="relative">
          <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
            <Search className="w-4.5 h-4.5" />
          </span>
          <input
            id="student-search-input"
            type="text"
            className="block w-full pl-9 pr-3 py-2 border border-slate-200 rounded-lg text-sm text-slate-900 bg-slate-50/50 focus:outline-none focus:ring-2 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all"
            placeholder="Search name, phone, email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        {/* Branch Filter (Only Admin can change) */}
        {user.role === 'ADMIN' ? (
          <select
            id="branch-filter-select"
            className="block w-full px-3 py-2 border border-slate-200 rounded-lg text-sm text-slate-700 bg-slate-50/50 focus:outline-none focus:ring-2 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all"
            value={selectedBranch}
            onChange={(e) => setSelectedBranch(e.target.value)}
          >
            <option value="All">All Branches</option>
            <option value="Urga">Urga Branch</option>
            <option value="Niharika">Niharika Branch</option>
          </select>
        ) : (
          <div className="block w-full px-3 py-2 border border-slate-200 bg-slate-100 text-slate-500 rounded-lg text-sm font-medium flex items-center gap-1.5">
            <MapPin className="w-4 h-4 text-slate-400" />
            Branch: {user.branch} Only
          </div>
        )}

        {/* Course Filter */}
        <select
          id="course-filter-select"
          className="block w-full px-3 py-2 border border-slate-200 rounded-lg text-sm text-slate-700 bg-slate-50/50 focus:outline-none focus:ring-2 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all"
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
          id="status-filter-select"
          className="block w-full px-3 py-2 border border-slate-200 rounded-lg text-sm text-slate-700 bg-slate-50/50 focus:outline-none focus:ring-2 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all"
          value={selectedStatus}
          onChange={(e) => setSelectedStatus(e.target.value)}
        >
          <option value="All">All Status</option>
          <option value="Active">Active Enrolments</option>
          <option value="Inactive">Inactive/Completed</option>
        </select>

      </div>

      {/* Directory Table Grid */}
      <div className="bg-white rounded-xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 text-slate-500 text-xs font-semibold uppercase tracking-wider border-b border-slate-100">
                <th className="px-6 py-4">Student Info</th>
                <th className="px-6 py-4">Branch</th>
                <th className="px-6 py-4">Course & Batch</th>
                <th className="px-6 py-4">Admission Date</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm text-slate-700">
              {filteredStudents.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-10 text-slate-400 font-medium">
                    No student records found. Click "Add Student" to create a new profile.
                  </td>
                </tr>
              ) : (
                filteredStudents.map((student) => (
                  <tr key={student.id} className="hover:bg-slate-50/50 transition-colors">
                    
                    {/* Student Info */}
                    <td className="px-6 py-4">
                      <div>
                        <p className="font-bold text-slate-900">{student.name}</p>
                        <div className="flex flex-col gap-0.5 mt-1 text-slate-500 text-xs">
                          <span className="flex items-center gap-1">
                            <Mail className="w-3.5 h-3.5 text-slate-400" /> {student.email}
                          </span>
                          <span className="flex items-center gap-1">
                            <Phone className="w-3.5 h-3.5 text-slate-400" /> {student.phone}
                          </span>
                        </div>
                      </div>
                    </td>

                    {/* Branch */}
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold ${
                        student.branch === 'Urga' ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700'
                      }`}>
                        <MapPin className="w-3 h-3" />
                        {student.branch}
                      </span>
                    </td>

                    {/* Course & Batch */}
                    <td className="px-6 py-4">
                      <div>
                        <span className="font-semibold text-slate-800 text-xs flex items-center gap-1 bg-slate-50 px-2 py-1 rounded border border-slate-100 w-fit">
                          <GraduationCap className="w-3.5 h-3.5 text-indigo-500" />
                          {student.course}
                        </span>
                        <p className="text-xs text-slate-500 mt-1 pl-1 font-medium">{student.batch}</p>
                      </div>
                    </td>

                    {/* Admission Date */}
                    <td className="px-6 py-4 text-slate-500 text-xs font-medium">
                      {student.admissionDate}
                    </td>

                    {/* Status badge */}
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold ${
                        student.status === 'Active' 
                          ? 'bg-emerald-100 text-emerald-800' 
                          : 'bg-slate-100 text-slate-600'
                      }`}>
                        {student.status}
                      </span>
                    </td>

                    {/* Actions */}
                    <td className="px-6 py-4 text-right">
                      <div className="inline-flex gap-1">
                        <button
                          onClick={() => openEditModal(student)}
                          className="p-1.5 hover:bg-indigo-50 text-slate-600 hover:text-indigo-600 rounded transition-colors cursor-pointer"
                          title="Edit Profile"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteClick(student)}
                          className="p-1.5 hover:bg-red-50 text-slate-600 hover:text-red-600 rounded transition-colors cursor-pointer"
                          title="Remove Student"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>

                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Overlay Form (Add/Edit) */}
      {isOpen && (
        <div id="student-modal" className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl border border-slate-100 max-w-lg w-full overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            
            {/* Modal Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
              <h3 className="font-bold text-slate-900 text-lg">
                {isEditing ? 'Modify Student Profile' : 'Register New Student'}
              </h3>
              <button
                onClick={() => setIsOpen(false)}
                className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-50 rounded-lg transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body / Form */}
            <form onSubmit={handleFormSubmit} className="p-6 space-y-4">
              
              {formError && (
                <div className="p-3 bg-red-50 border border-red-100 text-red-700 text-xs rounded-lg flex items-center gap-1.5">
                  <span>{formError}</span>
                </div>
              )}

              {/* Full Name */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">Full Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Amit Kumar"
                  className="block w-full px-3 py-2 border border-slate-200 rounded-lg text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/10 focus:border-indigo-500"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Email */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">Email Address *</label>
                  <input
                    type="email"
                    required
                    placeholder="name@example.com"
                    className="block w-full px-3 py-2 border border-slate-200 rounded-lg text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/10 focus:border-indigo-500"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>

                {/* Phone */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">Phone (with country code) *</label>
                  <input
                    type="tel"
                    required
                    placeholder="e.g. +919876543210"
                    className="block w-full px-3 py-2 border border-slate-200 rounded-lg text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/10 focus:border-indigo-500"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                  />
                  <span className="text-[10px] text-slate-400 mt-0.5 block">Format: +919876543210 (required for WhatsApp)</span>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Branch */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5 font-semibold">Campus Branch</label>
                  {user.role === 'ADMIN' ? (
                    <select
                      className="block w-full px-3 py-2 border border-slate-200 rounded-lg text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/10 focus:border-indigo-500"
                      value={branch}
                      onChange={(e) => setBranch(e.target.value as Branch)}
                    >
                      <option value="Urga">Urga Branch</option>
                      <option value="Niharika">Niharika Branch</option>
                    </select>
                  ) : (
                    <div className="px-3 py-2 bg-slate-100 border border-slate-200 text-slate-600 rounded-lg text-sm font-medium">
                      {user.branch} (Locked)
                    </div>
                  )}
                </div>

                {/* Course Selection */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5 font-semibold">Allocated Course *</label>
                  <select
                    className="block w-full px-3 py-2 border border-slate-200 rounded-lg text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/10 focus:border-indigo-500"
                    value={course}
                    onChange={(e) => setCourse(e.target.value)}
                    required
                  >
                    <option value="" disabled>Select a Course</option>
                    {courses.map((c) => (
                      <option key={c.id} value={c.courseName}>
                        {c.courseName}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Batch Choice */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5 font-semibold">Course Batch *</label>
                  <select
                    className="block w-full px-3 py-2 border border-slate-200 rounded-lg text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/10 focus:border-indigo-500"
                    value={batch}
                    onChange={(e) => setBatch(e.target.value)}
                  >
                    <option value="Batch A - Morning">Batch A - Morning</option>
                    <option value="Batch B - Evening">Batch B - Evening</option>
                    <option value="Weekend Batch">Weekend Batch</option>
                  </select>
                </div>

                {/* Status Selection */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5 font-semibold">Enrolment Status</label>
                  <select
                    className="block w-full px-3 py-2 border border-slate-200 rounded-lg text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/10 focus:border-indigo-500"
                    value={status}
                    onChange={(e) => setStatus(e.target.value as 'Active' | 'Inactive')}
                  >
                    <option value="Active">Active</option>
                    <option value="Inactive">Inactive</option>
                  </select>
                </div>
              </div>

              {/* Form Actions */}
              <div className="flex justify-end gap-2 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  className="px-4 py-2 border border-slate-200 text-sm font-semibold text-slate-600 rounded-lg hover:bg-slate-50 transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-sm rounded-lg shadow-sm shadow-indigo-100 transition-colors cursor-pointer"
                >
                  {isEditing ? 'Update Profile' : 'Register Student'}
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

    </div>
  );
}
