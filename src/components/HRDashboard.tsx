import { useState } from 'react';

// ─── Mock Data ────────────────────────────────────────────────────────────────
const employees = [
  { id: 'EMP-001', name: 'Saad Abdullah',    role: 'Store Manager',       dept: 'Management',  status: 'active',  avatar: 'SA', joined: 'Jan 2022', salary: 95000, attendance: 97, shift: 'Morning' },
  { id: 'EMP-002', name: 'Ayesha Malik',     role: 'Head Cashier',        dept: 'Operations',  status: 'active',  avatar: 'AM', joined: 'Mar 2022', salary: 58000, attendance: 94, shift: 'Morning' },
  { id: 'EMP-003', name: 'Bilal Khan',       role: 'Inventory Supervisor',dept: 'Inventory',   status: 'active',  avatar: 'BK', joined: 'Jun 2021', salary: 72000, attendance: 91, shift: 'Evening' },
  { id: 'EMP-004', name: 'Fatima Zahra',     role: 'Sales Associate',     dept: 'Sales',       status: 'active',  avatar: 'FZ', joined: 'Sep 2023', salary: 42000, attendance: 88, shift: 'Morning' },
  { id: 'EMP-005', name: 'Usman Qureshi',    role: 'Security Guard',      dept: 'Security',    status: 'active',  avatar: 'UQ', joined: 'Feb 2023', salary: 38000, attendance: 99, shift: 'Night'   },
  { id: 'EMP-006', name: 'Hina Siddiqui',    role: 'Accounts Officer',    dept: 'Finance',     status: 'leave',   avatar: 'HS', joined: 'Nov 2020', salary: 68000, attendance: 82, shift: 'Morning' },
  { id: 'EMP-007', name: 'Zain ul Abideen',  role: 'Stock Keeper',        dept: 'Inventory',   status: 'active',  avatar: 'ZA', joined: 'Apr 2022', salary: 45000, attendance: 95, shift: 'Evening' },
  { id: 'EMP-008', name: 'Mariam Tariq',     role: 'Customer Relations',  dept: 'Sales',       status: 'inactive',avatar: 'MT', joined: 'Jul 2021', salary: 52000, attendance: 76, shift: 'Morning' },
];

const deptColors: Record<string, { bg: string; text: string; border: string }> = {
  Management: { bg: 'bg-orange-500/10',  text: 'text-orange-400',  border: 'border-orange-500/20'  },
  Operations:  { bg: 'bg-blue-500/10',   text: 'text-blue-400',    border: 'border-blue-500/20'    },
  Inventory:   { bg: 'bg-amber-500/10',  text: 'text-amber-400',   border: 'border-amber-500/20'   },
  Sales:       { bg: 'bg-emerald-500/10',text: 'text-emerald-400', border: 'border-emerald-500/20' },
  Security:    { bg: 'bg-red-500/10',    text: 'text-red-400',     border: 'border-red-500/20'     },
  Finance:     { bg: 'bg-indigo-500/10', text: 'text-indigo-400',  border: 'border-indigo-500/20'  },
};

const avatarColors: Record<string, string> = {
  SA: 'from-orange-500 to-amber-600',
  AM: 'from-pink-500 to-rose-600',
  BK: 'from-blue-500 to-indigo-600',
  FZ: 'from-emerald-500 to-teal-600',
  UQ: 'from-red-500 to-rose-600',
  HS: 'from-violet-500 to-purple-600',
  ZA: 'from-amber-500 to-orange-600',
  MT: 'from-sky-500 to-cyan-600',
};

const weekAttendance = [
  { day: 'Mon', present: 7, absent: 1 },
  { day: 'Tue', present: 8, absent: 0 },
  { day: 'Wed', present: 6, absent: 2 },
  { day: 'Thu', present: 8, absent: 0 },
  { day: 'Fri', present: 7, absent: 1 },
  { day: 'Sat', present: 5, absent: 3 },
  { day: 'Sun', present: 4, absent: 4 },
];

const payrollSummary = [
  { dept: 'Management',  total: 95000,  color: 'bg-orange-500' },
  { dept: 'Operations',  total: 58000,  color: 'bg-blue-500'   },
  { dept: 'Inventory',   total: 117000, color: 'bg-amber-500'  },
  { dept: 'Sales',       total: 94000,  color: 'bg-emerald-500'},
  { dept: 'Security',    total: 38000,  color: 'bg-red-500'    },
  { dept: 'Finance',     total: 68000,  color: 'bg-indigo-500' },
];

const totalPayroll = payrollSummary.reduce((s, d) => s + d.total, 0);

// ─── Main Component ───────────────────────────────────────────────────────────
export default function HRDashboard() {
  const [activeSection, setActiveSection] = useState<'roster' | 'attendance' | 'payroll'>('roster');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedEmp, setSelectedEmp] = useState<typeof employees[0] | null>(null);
  const [filterDept, setFilterDept] = useState('All');

  const depts = ['All', ...Array.from(new Set(employees.map(e => e.dept)))];
  const filtered = employees.filter(e =>
    (filterDept === 'All' || e.dept === filterDept) &&
    (e.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
     e.role.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const activeCount   = employees.filter(e => e.status === 'active').length;
  const onLeaveCount  = employees.filter(e => e.status === 'leave').length;
  const avgAttendance = Math.round(employees.reduce((s, e) => s + e.attendance, 0) / employees.length);

  return (
    <div className="space-y-6">

      {/* ── Page Header ── */}
      <div className="flex items-end justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-100 tracking-tight uppercase">
            Human Resources
          </h2>
          <p className="text-slate-500 text-xs mt-1 font-medium tracking-wide uppercase">
            Staff management, attendance & payroll intelligence
          </p>
        </div>
        <div className="flex items-center gap-2.5">
          <button className="flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 rounded-xl text-xs font-bold text-white transition-all cursor-pointer">
            Add Employee
          </button>
          <button className="flex items-center gap-2 px-4 py-2 bg-[#121216]/60 border border-[#1a1a24]/80 rounded-xl text-xs font-bold text-slate-400 hover:text-slate-200 transition-all cursor-pointer">
            Export
          </button>
        </div>
      </div>

      {/* ── KPI Strip ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          {
            label: 'Total Staff',
            value: employees.length,
            sub: 'Registered employees',
            icon: (
              <svg className="w-5 h-5 text-violet-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="1.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" />
              </svg>
            ),
            color: 'violet',
            accent: 'border-violet-500/15',
            bg: 'bg-violet-500/8',
            val_color: 'text-violet-300',
          },
          {
            label: 'On Duty',
            value: activeCount,
            sub: 'Currently active',
            icon: (
              <svg className="w-5 h-5 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="1.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            ),
            color: 'emerald',
            accent: 'border-emerald-500/15',
            bg: 'bg-emerald-500/8',
            val_color: 'text-emerald-300',
          },
          {
            label: 'On Leave',
            value: onLeaveCount,
            sub: 'Approved absences',
            icon: (
              <svg className="w-5 h-5 text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="1.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
              </svg>
            ),
            color: 'amber',
            accent: 'border-amber-500/15',
            bg: 'bg-amber-500/8',
            val_color: 'text-amber-300',
          },
          {
            label: 'Avg Attendance',
            value: `${avgAttendance}%`,
            sub: 'Past 30 days',
            icon: (
              <svg className="w-5 h-5 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="1.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" />
              </svg>
            ),
            color: 'blue',
            accent: 'border-blue-500/15',
            bg: 'bg-blue-500/8',
            val_color: 'text-blue-300',
          },
        ].map((kpi, i) => (
          <div key={i} className={`bg-[#0c0c0e]/60 backdrop-blur-md border border-[#1a1a24]/80 rounded-2xl p-5 relative overflow-hidden group hover:bg-[#121216]/60 transition-colors duration-300`}>
            <p className="text-[11px] font-bold text-slate-500 mb-2 tracking-widest uppercase">{kpi.label}</p>
            <p className={`text-3xl font-black ${kpi.val_color} tracking-tight leading-none`}>{kpi.value}</p>
            <p className="text-[10px] text-slate-600 mt-2 font-medium">{kpi.sub}</p>
          </div>
        ))}
      </div>

      {/* ── Section Nav Tabs ── */}
      <div className="flex items-center gap-1 bg-[#0c0c0e]/60 border border-[#1a1a24]/80 rounded-2xl p-1.5 w-fit">
        {(['roster', 'attendance', 'payroll'] as const).map(tab => (
          <button
            key={tab}
            onClick={() => setActiveSection(tab)}
            className={`px-5 py-2 rounded-xl text-[11px] font-bold uppercase tracking-wider transition-all cursor-pointer ${
              activeSection === tab
                ? 'bg-violet-500/15 border border-violet-500/25 text-violet-300 shadow-md shadow-violet-500/5'
                : 'text-slate-500 hover:text-slate-300'
            }`}
          >
            {tab === 'roster' ? '📋 Roster' : tab === 'attendance' ? '📅 Attendance' : '💰 Payroll'}
          </button>
        ))}
      </div>

      {/* ══════════════════ ROSTER SECTION ══════════════════ */}
      {activeSection === 'roster' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          {/* Employee List */}
          <div className="lg:col-span-2 bg-[#0c0c0e]/60 backdrop-blur-md border border-[#1a1a24]/80 rounded-2xl overflow-hidden">
            {/* Search + Filter Bar */}
            <div className="p-4 border-b border-[#1a1a24]/60 flex items-center gap-3">
                <input
                  type="text"
                  placeholder="Search by name or role..."
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  className="w-full bg-[#121216]/60 border border-[#1a1a24]/80 rounded-xl px-4 py-2 text-[11px] text-slate-300 placeholder-slate-600 focus:outline-none focus:border-slate-500/40 focus:bg-[#121216] transition-all"
                />
              </div>
              <select
                value={filterDept}
                onChange={e => setFilterDept(e.target.value)}
                className="bg-[#121216]/60 border border-[#1a1a24]/80 rounded-xl px-3 py-2 text-[11px] text-slate-400 focus:outline-none focus:border-violet-500/40 cursor-pointer transition-all"
              >
                {depts.map(d => <option key={d} value={d}>{d}</option>)}
              </select>
            </div>

            <div className="overflow-x-auto w-full">
              <div className="min-w-[600px]">
                {/* Table Header */}
                <div className="grid grid-cols-12 gap-2 px-4 py-2.5 bg-[#08080a]/40 border-b border-[#1a1a24]/40">
                  <span className="col-span-4 text-[9px] font-bold text-slate-600 uppercase tracking-widest">Employee</span>
                  <span className="col-span-3 text-[9px] font-bold text-slate-600 uppercase tracking-widest">Department</span>
                  <span className="col-span-2 text-[9px] font-bold text-slate-600 uppercase tracking-widest">Shift</span>
                  <span className="col-span-2 text-[9px] font-bold text-slate-600 uppercase tracking-widest">Attend.</span>
                  <span className="col-span-1 text-[9px] font-bold text-slate-600 uppercase tracking-widest">Status</span>
                </div>

                {/* Employee Rows */}
                <div className="divide-y divide-[#1a1a24]/30 max-h-[440px] overflow-y-auto scrollbar-thin">
              {filtered.map(emp => {
                const dc = deptColors[emp.dept] || deptColors['Operations'];
                const isSelected = selectedEmp?.id === emp.id;
                return (
                  <div
                    key={emp.id}
                    onClick={() => setSelectedEmp(isSelected ? null : emp)}
                    className={`grid grid-cols-12 gap-2 px-4 py-3 cursor-pointer transition-all duration-200 ${
                      isSelected
                        ? 'bg-violet-500/5 border-l-2 border-l-violet-500/60'
                        : 'hover:bg-[#121216]/30'
                    }`}
                  >
                    {/* Name + Avatar */}
                    <div className="col-span-4 flex items-center gap-2.5">
                      <div className={`w-8 h-8 rounded-xl bg-gradient-to-br ${avatarColors[emp.avatar]} flex items-center justify-center text-[10px] font-black text-white shadow-md shrink-0`}>
                        {emp.avatar}
                      </div>
                      <div className="min-w-0">
                        <p className="text-[11px] font-bold text-slate-200 truncate">{emp.name}</p>
                        <p className="text-[9px] text-slate-500 truncate">{emp.role}</p>
                      </div>
                    </div>
                    {/* Dept */}
                    <div className="col-span-3 flex items-center">
                      <span className={`px-2 py-0.5 rounded-lg text-[9px] font-bold ${dc.bg} ${dc.text} border ${dc.border}`}>
                        {emp.dept}
                      </span>
                    </div>
                    {/* Shift */}
                    <div className="col-span-2 flex items-center">
                      <span className="text-[10px] text-slate-400 font-semibold">{emp.shift}</span>
                    </div>
                    {/* Attendance bar */}
                    <div className="col-span-2 flex items-center gap-1.5">
                      <div className="flex-1 bg-[#1b1b22] rounded-full h-1">
                        <div
                          className={`h-1 rounded-full ${emp.attendance >= 90 ? 'bg-emerald-500' : emp.attendance >= 80 ? 'bg-amber-500' : 'bg-red-500'}`}
                          style={{ width: `${emp.attendance}%` }}
                        />
                      </div>
                      <span className="text-[9px] font-bold text-slate-500 w-7 text-right">{emp.attendance}%</span>
                    </div>
                    {/* Status dot */}
                    <div className="col-span-1 flex items-center justify-center">
                      <div className={`w-2 h-2 rounded-full ${
                        emp.status === 'active' ? 'bg-emerald-400 shadow-[0_0_6px_rgba(52,211,153,0.5)]' :
                        emp.status === 'leave'  ? 'bg-amber-400 shadow-[0_0_6px_rgba(251,191,36,0.5)]' :
                  {filtered.map(emp => {
                    const dc = deptColors[emp.dept] || deptColors['Operations'];
                    const isSelected = selectedEmp?.id === emp.id;
                    return (
                      <div
                        key={emp.id}
                        onClick={() => setSelectedEmp(isSelected ? null : emp)}
                        className={`grid grid-cols-12 gap-2 px-4 py-3 cursor-pointer transition-all duration-200 ${
                          isSelected
                            ? 'bg-violet-500/5 border-l-2 border-l-violet-500/60'
                            : 'hover:bg-[#121216]/30'
                        }`}
                      >
                        {/* Name + Avatar */}
                        <div className="col-span-4 flex items-center gap-2.5">
                          <div className={`w-8 h-8 rounded-xl bg-gradient-to-br ${avatarColors[emp.avatar]} flex items-center justify-center text-[10px] font-black text-white shadow-md shrink-0`}>
                            {emp.avatar}
                          </div>
                          <div className="min-w-0">
                            <p className="text-[11px] font-bold text-slate-200 truncate">{emp.name}</p>
                            <p className="text-[9px] text-slate-500 truncate">{emp.role}</p>
                          </div>
                        </div>
                        {/* Dept */}
                        <div className="col-span-3 flex items-center">
                          <span className={`px-2 py-0.5 rounded-lg text-[9px] font-bold ${dc.bg} ${dc.text} border ${dc.border}`}>
                            {emp.dept}
                          </span>
                        </div>
                        {/* Shift */}
                        <div className="col-span-2 flex items-center">
                          <span className="text-[10px] text-slate-400 font-semibold">{emp.shift}</span>
                        </div>
                        {/* Attendance bar */}
                        <div className="col-span-2 flex items-center gap-1.5">
                          <div className="flex-1 bg-[#1b1b22] rounded-full h-1">
                            <div
                              className={`h-1 rounded-full ${emp.attendance >= 90 ? 'bg-emerald-500' : emp.attendance >= 80 ? 'bg-amber-500' : 'bg-red-500'}`}
                              style={{ width: `${emp.attendance}%` }}
                            />
                          </div>
                          <span className="text-[9px] font-bold text-slate-500 w-7 text-right">{emp.attendance}%</span>
                        </div>
                        {/* Status dot */}
                        <div className="col-span-1 flex items-center justify-center">
                          <div className={`w-2 h-2 rounded-full ${
                            emp.status === 'active' ? 'bg-emerald-400 shadow-[0_0_6px_rgba(52,211,153,0.5)]' :
                            emp.status === 'leave'  ? 'bg-amber-400 shadow-[0_0_6px_rgba(251,191,36,0.5)]' :
                            'bg-slate-600'
                          }`} />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>

          {/* Employee Detail Panel */}
          <div className="bg-[#0c0c0e]/60 backdrop-blur-md border border-[#1a1a24]/80 rounded-2xl overflow-hidden flex flex-col">
            {selectedEmp ? (
              <>
                {/* Profile Header */}
                <div className="p-6 border-b border-[#1a1a24]/50 bg-gradient-to-br from-violet-500/5 to-indigo-500/5 flex flex-col items-center text-center">
                  <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${avatarColors[selectedEmp.avatar]} flex items-center justify-center text-lg font-black text-white shadow-xl mb-3`}>
                    {selectedEmp.avatar}
                  </div>
                  <h3 className="text-sm font-black text-slate-100">{selectedEmp.name}</h3>
                  <p className="text-[10px] text-slate-400 mt-0.5">{selectedEmp.role}</p>
                  <div className="flex items-center gap-1.5 mt-2.5">
                    <span className={`px-2.5 py-1 rounded-lg text-[9px] font-bold border ${
                      selectedEmp.status === 'active'   ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' :
                      selectedEmp.status === 'leave'    ? 'bg-amber-500/10 text-amber-400 border-amber-500/20' :
                      'bg-slate-500/10 text-slate-400 border-slate-500/20'
                    }`}>
                      {selectedEmp.status === 'active' ? '● Active' : selectedEmp.status === 'leave' ? '◔ On Leave' : '○ Inactive'}
                    </span>
                    <span className="px-2.5 py-1 rounded-lg text-[9px] font-bold bg-violet-500/10 text-violet-400 border border-violet-500/20">
                      {selectedEmp.shift} Shift
                    </span>
                  </div>
                </div>

                {/* Details */}
                <div className="p-5 flex flex-col gap-4 flex-1">
                  {[
                    { label: 'Employee ID',   value: selectedEmp.id },
                    { label: 'Department',    value: selectedEmp.dept },
                    { label: 'Joined',        value: selectedEmp.joined },
                    { label: 'Monthly Salary',value: `PKR ${selectedEmp.salary.toLocaleString()}` },
                    { label: 'Attendance',    value: `${selectedEmp.attendance}% this month` },
                  ].map((row, i) => (
                    <div key={i} className="flex items-center gap-3">
                      <div>
                        <p className="text-[9px] text-slate-500 font-bold uppercase tracking-widest">{row.label}</p>
                        <p className="text-[11px] text-slate-200 font-bold mt-0.5">{row.value}</p>
                      </div>
                    </div>
                  ))}

                  {/* Attendance bar large */}
                  <div className="mt-1 p-3.5 bg-[#121216]/40 border border-[#1a1a24]/60 rounded-xl">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-[9px] font-bold text-slate-500 uppercase tracking-wider">Attendance Rate</span>
                      <span className={`text-[11px] font-black ${selectedEmp.attendance >= 90 ? 'text-emerald-400' : selectedEmp.attendance >= 80 ? 'text-amber-400' : 'text-red-400'}`}>
                        {selectedEmp.attendance}%
                      </span>
                    </div>
                    <div className="w-full bg-[#1b1b22] rounded-full h-2">
                      <div
                        className={`h-2 rounded-full transition-all ${selectedEmp.attendance >= 90 ? 'bg-gradient-to-r from-emerald-500 to-teal-400' : selectedEmp.attendance >= 80 ? 'bg-gradient-to-r from-amber-500 to-yellow-400' : 'bg-gradient-to-r from-red-500 to-rose-400'}`}
                        style={{ width: `${selectedEmp.attendance}%` }}
                      />
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="p-4 border-t border-[#1a1a24]/50 flex gap-2">
                  <button className="flex-1 py-2 bg-violet-500/10 hover:bg-violet-500/20 border border-violet-500/20 rounded-xl text-[10px] font-bold text-violet-400 transition-all cursor-pointer">Edit</button>
                  <button className="flex-1 py-2 bg-[#121216]/40 hover:bg-[#121216]/80 border border-[#1a1a24]/60 rounded-xl text-[10px] font-bold text-slate-400 hover:text-slate-200 transition-all cursor-pointer">View History</button>
                </div>
              </>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center text-center p-8">
                <div className="w-16 h-16 bg-[#121216]/60 rounded-2xl flex items-center justify-center mb-4 border border-[#1a1a24]/60 text-xs text-slate-600 font-bold uppercase">
                  Select
                </div>
                <p className="text-[11px] text-slate-500 font-semibold">Select an employee</p>
                <p className="text-[10px] text-slate-600 mt-1">Click any row to view full profile</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ══════════════════ ATTENDANCE SECTION ══════════════════ */}
      {activeSection === 'attendance' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          {/* Weekly Bar Chart */}
          <div className="lg:col-span-2 bg-[#0c0c0e]/60 backdrop-blur-md border border-[#1a1a24]/80 rounded-2xl p-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-[13px] font-bold text-slate-200">Weekly Attendance Overview</h3>
                <p className="text-[10px] text-slate-500 mt-0.5">Current week · {employees.length} staff members</p>
              </div>
              <div className="flex items-center gap-3 text-[10px] font-semibold">
                <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-sm bg-violet-500 inline-block" /> Present</span>
                <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-sm bg-[#1b1b22] inline-block" /> Absent</span>
              </div>
            </div>

            {/* Bar Chart */}
            <div className="flex items-end gap-4 h-48">
              {weekAttendance.map((d, i) => {
                const total = d.present + d.absent;
                const pct = (d.present / total) * 100;
                return (
                  <div key={i} className="flex-1 flex flex-col items-center gap-2">
                    <div className="text-[9px] font-bold text-slate-500">{d.present}/{total}</div>
                    <div className="w-full bg-[#1b1b22] rounded-xl overflow-hidden flex-1 max-h-36 relative flex flex-col-reverse">
                      <div
                        className="w-full bg-gradient-to-t from-violet-600 to-violet-400 rounded-xl transition-all duration-700 shadow-[0_0_12px_rgba(139,92,246,0.3)]"
                        style={{ height: `${pct}%` }}
                      />
                    </div>
                    <div className="text-[10px] font-bold text-slate-400">{d.day}</div>
                  </div>
                );
              })}
            </div>

            {/* Summary row */}
            <div className="mt-5 grid grid-cols-3 gap-3">
              {[
                { label: 'Best Day', value: 'Tuesday', sub: '100% present', color: 'text-emerald-400' },
                { label: 'Lowest Day', value: 'Sunday', sub: '50% present', color: 'text-red-400' },
                { label: 'Weekly Avg', value: '82%', sub: 'attendance rate', color: 'text-violet-400' },
              ].map((s, i) => (
                <div key={i} className="bg-[#121216]/40 border border-[#1a1a24]/60 rounded-xl p-3 text-center">
                  <p className="text-[9px] font-bold text-slate-600 uppercase tracking-wider mb-1">{s.label}</p>
                  <p className={`text-sm font-black ${s.color}`}>{s.value}</p>
                  <p className="text-[9px] text-slate-600 mt-0.5">{s.sub}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Per-employee attendance list */}
          <div className="bg-[#0c0c0e]/60 backdrop-blur-md border border-[#1a1a24]/80 rounded-2xl overflow-hidden">
            <div className="p-4 border-b border-[#1a1a24]/50">
              <h3 className="text-[12px] font-bold text-slate-200">Individual Rates</h3>
              <p className="text-[9px] text-slate-500 mt-0.5 font-medium">Past 30 days</p>
            </div>
            <div className="divide-y divide-[#1a1a24]/30 overflow-y-auto max-h-[460px] scrollbar-thin">
              {[...employees].sort((a, b) => b.attendance - a.attendance).map(emp => (
                <div key={emp.id} className="flex items-center gap-3 px-4 py-3 hover:bg-[#121216]/30 transition-all">
                  <div className={`w-7 h-7 rounded-xl bg-gradient-to-br ${avatarColors[emp.avatar]} flex items-center justify-center text-[9px] font-black text-white shrink-0`}>
                    {emp.avatar}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[10px] font-bold text-slate-200 truncate">{emp.name}</p>
                    <div className="flex items-center gap-1.5 mt-1">
                      <div className="flex-1 bg-[#1b1b22] rounded-full h-1">
                        <div
                          className={`h-1 rounded-full ${emp.attendance >= 90 ? 'bg-emerald-500' : emp.attendance >= 80 ? 'bg-amber-500' : 'bg-red-500'}`}
                          style={{ width: `${emp.attendance}%` }}
                        />
                      </div>
                    </div>
                  </div>
                  <span className={`text-[10px] font-black w-8 text-right ${emp.attendance >= 90 ? 'text-emerald-400' : emp.attendance >= 80 ? 'text-amber-400' : 'text-red-400'}`}>
                    {emp.attendance}%
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ══════════════════ PAYROLL SECTION ══════════════════ */}
      {activeSection === 'payroll' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          {/* Payroll Table */}
          <div className="lg:col-span-2 bg-[#0c0c0e]/60 backdrop-blur-md border border-[#1a1a24]/80 rounded-2xl overflow-hidden">
            <div className="p-5 border-b border-[#1a1a24]/50 flex items-center justify-between">
              <div>
                <h3 className="text-[13px] font-bold text-slate-200">Monthly Payroll Ledger</h3>
                <p className="text-[10px] text-slate-500 mt-0.5">June 2026 · All employees</p>
              </div>
              <div className="px-3 py-1.5 bg-emerald-500/10 border border-emerald-500/20 rounded-xl">
                <span className="text-[10px] font-black text-emerald-400">Total: PKR {totalPayroll.toLocaleString()}</span>
              </div>
            </div>

            <div className="overflow-x-auto w-full">
              <div className="min-w-[600px]">
                {/* Column headers */}
                <div className="grid grid-cols-12 gap-2 px-5 py-2.5 bg-[#08080a]/40 border-b border-[#1a1a24]/40">
                  <span className="col-span-3 text-[9px] font-bold text-slate-600 uppercase tracking-widest">Employee</span>
                  <span className="col-span-3 text-[9px] font-bold text-slate-600 uppercase tracking-widest">Role</span>
                  <span className="col-span-2 text-[9px] font-bold text-slate-600 uppercase tracking-widest">Department</span>
                  <span className="col-span-2 text-[9px] font-bold text-slate-600 uppercase tracking-widest">Salary (PKR)</span>
                  <span className="col-span-2 text-[9px] font-bold text-slate-600 uppercase tracking-widest">Status</span>
                </div>

                <div className="divide-y divide-[#1a1a24]/30 max-h-[400px] overflow-y-auto scrollbar-thin">
                  {employees.map((emp) => {
                    const dc = deptColors[emp.dept] || deptColors['Operations'];
                    return (
                      <div key={emp.id} className="grid grid-cols-12 gap-2 px-5 py-3.5 hover:bg-[#121216]/30 transition-all">
                        <div className="col-span-3 flex items-center gap-2">
                          <div className={`w-7 h-7 rounded-xl bg-gradient-to-br ${avatarColors[emp.avatar]} flex items-center justify-center text-[9px] font-black text-white`}>
                            {emp.avatar}
                          </div>
                          <span className="text-[10px] font-bold text-slate-200 truncate">{emp.name}</span>
                        </div>
                        <div className="col-span-3 flex items-center">
                          <span className="text-[10px] text-slate-400 truncate">{emp.role}</span>
                        </div>
                        <div className="col-span-2 flex items-center">
                          <span className={`px-1.5 py-0.5 rounded text-[8px] font-bold ${dc.bg} ${dc.text} border ${dc.border}`}>{emp.dept}</span>
                        </div>
                        <div className="col-span-2 flex items-center">
                          <span className="text-[11px] font-black text-slate-200">{emp.salary.toLocaleString()}</span>
                        </div>
                        <div className="col-span-2 flex items-center">
                          <span className={`px-2 py-0.5 rounded-lg text-[8px] font-bold border ${
                            emp.status === 'active'   ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' :
                            emp.status === 'leave'    ? 'bg-amber-500/10 text-amber-400 border-amber-500/20' :
                            'bg-slate-500/10 text-slate-500 border-slate-500/20'
                          }`}>
                            {emp.status === 'active' ? 'Paid' : emp.status === 'leave' ? 'Partial' : 'Hold'}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>

          {/* Department Payroll Breakdown */}
          <div className="bg-[#0c0c0e]/60 backdrop-blur-md border border-[#1a1a24]/80 rounded-2xl p-6 flex flex-col gap-5">
            <div>
              <h3 className="text-[13px] font-bold text-slate-200">By Department</h3>
              <p className="text-[10px] text-slate-500 mt-0.5">Cost distribution</p>
            </div>

            <div className="space-y-4">
              {payrollSummary.map((d, i) => {
                const pct = Math.round((d.total / totalPayroll) * 100);
                return (
                  <div key={i}>
                    <div className="flex justify-between items-center mb-1.5">
                      <span className="text-[10px] font-bold text-slate-300">{d.dept}</span>
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] text-slate-500">{pct}%</span>
                        <span className="text-[10px] font-black text-slate-200">{d.total.toLocaleString()}</span>
                      </div>
                    </div>
                    <div className="w-full bg-[#1b1b22] rounded-full h-1.5">
                      <div
                        className={`${d.color} h-1.5 rounded-full transition-all duration-700`}
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Total Card */}
            <div className="mt-auto p-4 bg-gradient-to-br from-violet-500/8 to-indigo-500/5 border border-violet-500/15 rounded-2xl">
              <p className="text-[9px] font-bold text-slate-500 uppercase tracking-widest mb-1">Total Monthly Payroll</p>
              <p className="text-2xl font-black text-violet-300">PKR {(totalPayroll / 1000).toFixed(0)}K</p>
              <p className="text-[9px] text-slate-600 mt-1.5">Across {employees.length} employees · {Object.keys(deptColors).length} departments</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
