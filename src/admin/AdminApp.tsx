import { useEffect, useMemo, useState, type FormEvent } from 'react';
import { Link, useLocation } from 'wouter';
import {
  Activity, ArrowDown, ArrowLeft, ArrowRight, CalendarDays, Check, ChevronDown,
  Clock3, Eye, EyeOff, FileText, LayoutDashboard, LogOut, Mail, Menu, MessageCircle, Phone,
  RefreshCw, Search, Settings, ShieldCheck, SlidersHorizontal, Trash2, UserRound, X,
} from 'lucide-react';
import { useAdminAuth } from '../hooks/useAdminAuth';
import { useAppointments } from '../hooks/useAppointments';
import type { Appointment, AppointmentStatus } from '../lib/appointments';
import './admin.css';

type Language = 'ar' | 'en';
type Notice = { kind: 'success' | 'error'; text: string } | null;

const words = {
  ar: {
    workspace: 'مساحة الإدارة', clinic: 'أتيليه نور لطب الأسنان', overview: 'نظرة عامة', appointments: 'المواعيد',
    calendar: 'التقويم', settings: 'الإعدادات', secure: 'مساحة آمنة', signOut: 'تسجيل الخروج',
    loginTitle: 'مرحباً بعودتك', loginLead: 'سجّل الدخول لمتابعة طلبات المواعيد وإدارة تفاصيل العناية.',
    email: 'البريد الإلكتروني', password: 'كلمة المرور', login: 'تسجيل الدخول', showPassword: 'إظهار كلمة المرور',
    hidePassword: 'إخفاء كلمة المرور', signInError: 'تعذر تسجيل الدخول. تحقق من البريد وكلمة المرور وحاول مجدداً.',
    notConfigured: 'لم يتم إعداد اتصال الإدارة بعد. يرجى التواصل مع مسؤول النظام.',
    invalidSupabaseUrl: 'رابط Supabase غير صالح. أدخل Project URL من إعدادات API في مشروعك.',
    checking: 'جارٍ التحقق من صلاحية الحساب…', denied: 'هذا الحساب لا يملك صلاحية دخول مساحة الإدارة.',
    verifyAdminError: 'تعذر التحقق من الصلاحية. تأكد من تطبيق إعدادات قاعدة البيانات ثم حاول مجدداً.',
    loadError: 'تعذر تحميل المواعيد. حاول التحديث.', retry: 'إعادة المحاولة', total: 'إجمالي الطلبات',
    pending: 'بانتظار المراجعة', confirmed: 'مؤكد', completed: 'مكتمل', cancelled: 'ملغي',
    statusOverview: 'حالة الطلبات', statusHelp: 'توزيع المواعيد المسجلة حسب الحالة', recent: 'أحدث الطلبات',
    upcoming: 'المواعيد القادمة', viewAll: 'عرض كل المواعيد', noAppointments: 'لا توجد مواعيد مسجلة بعد.',
    noUpcoming: 'لا توجد مواعيد قادمة حالياً.', patient: 'المريض', service: 'الخدمة', date: 'التاريخ',
    status: 'الحالة', actions: 'الإجراء', searchPlaceholder: 'ابحث بالاسم أو رقم الهاتف', allStatuses: 'كل الحالات',
    dateFrom: 'من تاريخ', dateTo: 'إلى تاريخ', sortOldest: 'الأقدم أولاً', sortNewest: 'الأحدث أولاً',
    clearFilters: 'مسح الفلاتر', showing: 'عرض', of: 'من', previous: 'السابق', next: 'التالي',
    noResults: 'لا توجد نتائج تطابق هذه الفلاتر.',
    details: 'تفاصيل الموعد', phone: 'الهاتف', notes: 'ملاحظات', created: 'تاريخ الطلب',
    changeStatus: 'تغيير الحالة', messagePatient: 'مراسلة المريض عبر واتساب', delete: 'حذف الموعد', confirmDelete: 'هل تريد حذف طلب هذا الموعد نهائياً؟',
    cancel: 'إلغاء', confirm: 'تأكيد الحذف', saved: 'تم تحديث حالة الموعد.', deleted: 'تم حذف الموعد.',
    operationError: 'تعذر تنفيذ الإجراء. حاول مرة أخرى.', refresh: 'تحديث البيانات', monthBack: 'الشهر السابق',
    monthForward: 'الشهر التالي', today: 'اليوم', noDayAppointments: 'لا توجد مواعيد في هذا اليوم.',
    account: 'بيانات الحساب', signedInAs: 'مسجل الدخول باسم', accountNote: 'تُدار صلاحيات هذا الحساب بشكل آمن من إعدادات العيادة.',
    logoutConfirm: 'تم تسجيل الخروج بنجاح.', logoutError: 'تعذر تسجيل الخروج. حاول مرة أخرى.',
    loading: 'جارٍ التحميل…', noEmail: 'البريد غير متاح', monday: 'الاثنين', week: ['أحد', 'اثنين', 'ثلاثاء', 'أربعاء', 'خميس', 'جمعة', 'سبت'],
    monthNames: ['يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو', 'يوليو', 'أغسطس', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر'],
    loginEyebrow: 'إدارة العيادة', adminTitle: 'إدارة المواعيد، بهدوء.', detailEmpty: 'اختر موعداً لعرض تفاصيله.',
  },
  en: {
    workspace: 'ADMIN WORKSPACE', clinic: 'NOOR DENTAL ATELIER', overview: 'Overview', appointments: 'Appointments',
    calendar: 'Calendar', settings: 'Settings', secure: 'SECURE WORKSPACE', signOut: 'Sign out',
    loginTitle: 'Welcome back', loginLead: 'Sign in to review appointment requests and manage each care journey.',
    email: 'Email address', password: 'Password', login: 'Sign in', showPassword: 'Show password',
    hidePassword: 'Hide password', signInError: 'Sign in failed. Check your email and password, then try again.',
    notConfigured: 'Admin sign-in is not configured yet. Please contact your system administrator.',
    invalidSupabaseUrl: 'The Supabase project URL is invalid. Enter the Project URL shown in your API settings.',
    checking: 'Checking administrator access…', denied: 'This account does not have administrator access.',
    verifyAdminError: 'Administrator access could not be verified. Confirm the database setup, then try again.',
    loadError: 'Appointments could not be loaded. Please try again.', retry: 'Try again', total: 'Total requests',
    pending: 'Awaiting review', confirmed: 'Confirmed', completed: 'Completed', cancelled: 'Cancelled',
    statusOverview: 'Request status', statusHelp: 'A live view of appointments by status', recent: 'Recent requests',
    upcoming: 'Upcoming visits', viewAll: 'View all appointments', noAppointments: 'No appointments have been recorded yet.',
    noUpcoming: 'There are no upcoming appointments right now.', patient: 'Patient', service: 'Service', date: 'Date',
    status: 'Status', actions: 'Action', searchPlaceholder: 'Search name or phone number', allStatuses: 'All statuses',
    dateFrom: 'From date', dateTo: 'To date', sortOldest: 'Oldest first', sortNewest: 'Newest first',
    clearFilters: 'Clear filters', showing: 'Showing', of: 'of', previous: 'Previous', next: 'Next',
    noResults: 'No appointments match these filters.',
    details: 'Appointment details', phone: 'Phone', notes: 'Notes', created: 'Request received',
    changeStatus: 'Change status', messagePatient: 'Message patient on WhatsApp', delete: 'Delete appointment', confirmDelete: 'Permanently delete this appointment request?',
    cancel: 'Cancel', confirm: 'Delete request', saved: 'Appointment status updated.', deleted: 'Appointment deleted.',
    operationError: 'The action could not be completed. Please try again.', refresh: 'Refresh appointments',
    monthBack: 'Previous month', monthForward: 'Next month', today: 'Today', noDayAppointments: 'No appointments on this day.',
    account: 'Account details', signedInAs: 'Signed in as', accountNote: 'Account permissions are managed securely by the clinic.',
    logoutConfirm: 'You have been signed out.', logoutError: 'Could not sign out. Please try again.',
    loading: 'Loading…', noEmail: 'Email unavailable', monday: 'Monday', week: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
    monthNames: ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'],
    loginEyebrow: 'CLINIC ADMINISTRATION', adminTitle: 'Appointments, thoughtfully managed.', detailEmpty: 'Choose an appointment to see its details.',
  },
} as const;

const statuses: AppointmentStatus[] = ['pending', 'confirmed', 'completed', 'cancelled'];
const statusKeys: Record<AppointmentStatus, 'pending' | 'confirmed' | 'completed' | 'cancelled'> = {
  pending: 'pending', confirmed: 'confirmed', completed: 'completed', cancelled: 'cancelled',
};

function localDate(value: string, language: Language, options?: Intl.DateTimeFormatOptions) {
  const [year, month, day] = value.slice(0, 10).split('-').map(Number);
  if (!year || !month || !day) return value;
  return new Intl.DateTimeFormat(language === 'ar' ? 'ar' : 'en-GB', options ?? { day: 'numeric', month: 'short', year: 'numeric' })
    .format(new Date(year, month - 1, day));
}

function whatsappUrl(phone: string) {
  const digits = phone.replace(/\D/g, '');
  const internationalNumber = digits.startsWith('00') ? digits.slice(2) : digits;
  return internationalNumber ? `https://wa.me/${internationalNumber}` : null;
}

function statusLabel(status: AppointmentStatus, t: typeof words.ar | typeof words.en) {
  return t[statusKeys[status]];
}

function StatusPill({ status, t, id }: { status: AppointmentStatus; t: typeof words.ar | typeof words.en; id?: string }) {
  return <span className={`admin-status status-${status}`} data-testid={id ? `status-appointment-${id}` : `status-label-${status}`}>{statusLabel(status, t)}</span>;
}

function EmptyState({ message }: { message: string }) {
  return <div className="admin-empty"><span className="empty-mark"><CalendarDays size={20} /></span><p>{message}</p></div>;
}

function SkeletonRows() {
  return <div className="admin-skeletons" aria-label="Loading appointments">{[0, 1, 2].map((n) => <div className="skeleton-row" key={n}><i /><i /><i /><i /></div>)}</div>;
}

function Login({ t, language, authStatus, authError, signIn, onLanguageToggle }: {
  t: typeof words.ar | typeof words.en; language: Language; authStatus: string;
  authError: string | null; signIn: (email: string, password: string) => Promise<void>;
  onLanguageToggle: () => void;
}) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [visible, setVisible] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const invalidUrl = authStatus === 'invalid-config';
  const unavailable = authStatus === 'unconfigured' || invalidUrl;

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError('');
    setBusy(true);
    try {
      await signIn(email.trim(), password);
    } catch {
      setError(t.signInError);
    } finally {
      setBusy(false);
    }
  };

  return <main className="admin-login-page" dir={language === 'ar' ? 'rtl' : 'ltr'}>
    <section className="login-aside">
      <Link href="/" className="admin-brand" data-testid="link-clinic-home"><span className="admin-brand-mark">N</span><span><b>NOOR</b><small>DENTAL ATELIER</small></span></Link>
      <button className="login-language-switch" onClick={onLanguageToggle} data-testid="button-admin-language">{language === 'ar' ? 'EN' : 'عربي'}</button>
      <div className="login-aside-copy"><span className="admin-kicker">{t.loginEyebrow}</span><h1>{t.adminTitle}</h1><p>{t.loginLead}</p></div>
      <div className="login-aside-foot"><ShieldCheck size={16} />{t.secure}</div>
    </section>
    <section className="login-form-side">
      <div className="login-card">
        <div className="login-emblem"><UserRound size={23} /></div>
        <span className="admin-kicker">{t.workspace}</span>
        <h2>{t.loginTitle}</h2>
        <p className="login-intro">{t.loginLead}</p>
        {unavailable ? <div className="admin-alert error" role="alert">{invalidUrl ? t.invalidSupabaseUrl : t.notConfigured}</div> : null}
        {authStatus === 'loading' || authStatus === 'checking-admin' ? <div className="login-loading"><span className="admin-pulse" />{t.checking}</div> : null}
        {(error || authError || authStatus === 'unauthorized') && !unavailable ? <div className="admin-alert error" role="alert">{error || (authStatus === 'unauthorized' ? t.denied : authError ? t.verifyAdminError : t.signInError)}</div> : null}
        {!unavailable && authStatus !== 'loading' && authStatus !== 'checking-admin' && <form onSubmit={submit} className="admin-login-form">
          <label>{t.email}<span className="admin-input-wrap"><Mail size={16} /><input data-testid="input-admin-email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="username" required /></span></label>
          <label>{t.password}<span className="admin-input-wrap"><input data-testid="input-admin-password" type={visible ? 'text' : 'password'} value={password} onChange={(e) => setPassword(e.target.value)} autoComplete="current-password" required /><button type="button" className="password-toggle" data-testid="button-password-visibility" aria-label={visible ? t.hidePassword : t.showPassword} onClick={() => setVisible(!visible)}>{visible ? <EyeOff size={17} /> : <Eye size={17} />}</button></span></label>
          <button className="admin-primary login-submit" type="submit" data-testid="button-admin-login" disabled={busy}>{busy ? <><span className="button-spinner" />{t.loading}</> : <>{t.login}<ArrowRight size={16} /></>}</button>
        </form>}
        <div className="login-footnote"><ShieldCheck size={14} />{t.secure}</div>
      </div>
    </section>
  </main>;
}

function AppointmentRows({ rows, t, language, savingId, onStatus, onSelect, onDelete, compact = true }: {
  rows: Appointment[]; t: typeof words.ar | typeof words.en; language: Language; savingId: string | null;
  onStatus: (id: string, status: AppointmentStatus) => void; onSelect: (row: Appointment) => void; onDelete: (row: Appointment) => void;
  compact?: boolean;
}) {
  return <div className={`appointment-list ${compact ? 'compact-list' : 'detailed-list'}`}>
    {rows.map((row) => <article className={`appointment-row ${compact ? 'compact-row' : 'detailed-row'}`} key={row.id} data-testid={`row-appointment-${row.id}`}>
      <button className="appointment-main" type="button" onClick={() => onSelect(row)} data-testid={`button-details-${row.id}`}>
        <span className="patient-avatar">{row.patient_name.trim().charAt(0) || 'N'}</span>
        <span className="patient-summary"><strong>{row.patient_name}</strong>{compact && <small>{row.phone}</small>}</span>
      </button>
      {!compact && <span className="table-phone">{row.phone}</span>}
      {!compact && <span className="table-email" title={row.email || ''}>{row.email || '—'}</span>}
      <span className="row-service">{row.service}</span>
      <span className="row-date">{localDate(row.appointment_date, language)}</span>
      {!compact && <span className="table-notes" title={row.notes || ''}>{row.notes || '—'}</span>}
      {!compact && <StatusPill status={row.status} t={t} id={row.id} />}
      {!compact && <span className="table-created">{localDate(row.created_at, language)}</span>}
      <div className="row-actions">{compact && <StatusPill status={row.status} t={t} id={row.id} />}
        <label className="sr-only" htmlFor={`status-${row.id}`}>{t.changeStatus}</label>
        <span className="status-select-wrap"><select id={`status-${row.id}`} aria-label={t.changeStatus} data-testid={`select-status-${row.id}`} value={row.status} disabled={savingId === row.id} onChange={(e) => onStatus(row.id, e.target.value as AppointmentStatus)}>
          {statuses.map((status) => <option value={status} key={status}>{statusLabel(status, t)}</option>)}
        </select><ChevronDown size={13} /></span>
        {!compact && <button className="icon-button" aria-label={t.details} data-testid={`button-details-action-${row.id}`} onClick={() => onSelect(row)}><FileText size={15} /></button>}
        <button className="icon-button delete-icon" aria-label={t.delete} data-testid={`button-delete-${row.id}`} onClick={() => onDelete(row)} disabled={savingId === row.id}><Trash2 size={15} /></button>
      </div>
    </article>)}
  </div>;
}

export function AdminApp() {
  const auth = useAdminAuth();
  const isAdmin = auth.status === 'admin';
  const data = useAppointments(isAdmin);
  const [location] = useLocation();
  const [language, setLanguage] = useState<Language>(() => localStorage.getItem('noor-language') === 'en' ? 'en' : 'ar');
  const [notice, setNotice] = useState<Notice>(null);
  const [selected, setSelected] = useState<Appointment | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Appointment | null>(null);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [sort, setSort] = useState<'asc' | 'desc'>('asc');
  const [page, setPage] = useState(1);
  const [calendarMonth, setCalendarMonth] = useState(() => new Date(new Date().getFullYear(), new Date().getMonth(), 1));
  const [calendarDay, setCalendarDay] = useState('');
  const [mobileNav, setMobileNav] = useState(false);
  const t = words[language];
  const rtl = language === 'ar';
  const route = location.replace(/\/+$/, '') || '/admin';
  const isAdminRoute = route === '/admin' || route.startsWith('/admin/');
  const pageKey = route === '/admin/appointments' ? 'appointments' : route === '/admin/calendar' ? 'calendar' : route === '/admin/settings' ? 'settings' : 'overview';

  useEffect(() => {
    localStorage.setItem('noor-language', language);
    const previous = { lang: document.documentElement.lang, dir: document.documentElement.dir, bodyDir: document.body.dir, title: document.title };
    document.documentElement.lang = language;
    document.documentElement.dir = rtl ? 'rtl' : 'ltr';
    document.body.dir = rtl ? 'rtl' : 'ltr';
    const routeTitles = language === 'ar'
      ? { overview: 'نظرة عامة', appointments: 'إدارة المواعيد', calendar: 'تقويم العيادة', settings: 'إعدادات الحساب' }
      : { overview: 'Overview', appointments: 'Appointment management', calendar: 'Clinic calendar', settings: 'Account settings' };
    document.title = `${routeTitles[pageKey]} — ${rtl ? 'نور أتيليه طب الأسنان' : 'Noor Dental Atelier'}`;
    return () => {
      document.documentElement.lang = previous.lang;
      document.documentElement.dir = previous.dir;
      document.body.dir = previous.bodyDir;
      document.title = previous.title;
    };
  }, [language, rtl, pageKey]);

  useEffect(() => { setNotice(null); setPage(1); }, [route]);
  useEffect(() => { if (auth.status === 'unauthorized') setNotice({ kind: 'error', text: t.denied }); }, [auth.status, t.denied]);

  const counts = useMemo(() => statuses.reduce((acc, status) => {
    acc[status] = data.appointments.filter((appointment) => appointment.status === status).length;
    return acc;
  }, { pending: 0, confirmed: 0, completed: 0, cancelled: 0 } as Record<AppointmentStatus, number>), [data.appointments]);

  const sorted = useMemo(() => [...data.appointments].sort((a, b) => {
    const byDate = a.appointment_date.localeCompare(b.appointment_date);
    return byDate === 0 ? b.created_at.localeCompare(a.created_at) : sort === 'asc' ? byDate : -byDate;
  }), [data.appointments, sort]);
  const filtered = useMemo(() => sorted.filter((row) => {
    const q = search.trim().toLocaleLowerCase();
    const matchesText = !q || row.patient_name.toLocaleLowerCase().includes(q) || row.phone.toLocaleLowerCase().includes(q);
    return matchesText && (!statusFilter || row.status === statusFilter) && (!fromDate || row.appointment_date >= fromDate) && (!toDate || row.appointment_date <= toDate);
  }), [sorted, search, statusFilter, fromDate, toDate]);
  const pageSize = 8;
  const pageCount = Math.max(1, Math.ceil(filtered.length / pageSize));
  useEffect(() => { setPage((current) => Math.min(current, pageCount)); }, [pageCount]);
  const paginated = filtered.slice((page - 1) * pageSize, page * pageSize);
  const todayString = (() => { const d = new Date(); return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`; })();
  const upcoming = data.appointments.filter((row) => row.appointment_date >= todayString && row.status !== 'cancelled')
    .sort((a, b) => a.appointment_date.localeCompare(b.appointment_date)).slice(0, 5);
  const recent = [...data.appointments].sort((a, b) => b.created_at.localeCompare(a.created_at)).slice(0, 5);
  const selectedWhatsAppUrl = selected ? whatsappUrl(selected.phone) : null;

  const performStatus = async (id: string, status: AppointmentStatus) => {
    try {
      const updated = await data.setStatus(id, status);
      setSelected((current) => current?.id === updated.id ? updated : current);
      setNotice({ kind: 'success', text: t.saved });
    }
    catch { setNotice({ kind: 'error', text: t.operationError }); }
  };
  const performDelete = async () => {
    if (!deleteTarget) return;
    try { await data.remove(deleteTarget.id); setNotice({ kind: 'success', text: t.deleted }); setDeleteTarget(null); setSelected(null); }
    catch { setNotice({ kind: 'error', text: t.operationError }); }
  };
  const clearFilters = () => { setSearch(''); setStatusFilter(''); setFromDate(''); setToDate(''); setSort('asc'); setPage(1); };
  const countText = (status: AppointmentStatus) => `${counts[status]}`;

  if (!isAdminRoute || !['/admin', '/admin/appointments', '/admin/calendar', '/admin/settings'].includes(route)) return null;
  if (auth.status !== 'admin') return <Login t={t} language={language} authStatus={auth.status} authError={auth.authError} signIn={auth.signIn} onLanguageToggle={() => setLanguage(rtl ? 'en' : 'ar')} />;

  const navItems = [
    { href: '/admin', label: t.overview, icon: LayoutDashboard, key: 'overview' },
    { href: '/admin/appointments', label: t.appointments, icon: FileText, key: 'appointments' },
    { href: '/admin/calendar', label: t.calendar, icon: CalendarDays, key: 'calendar' },
    { href: '/admin/settings', label: t.settings, icon: Settings, key: 'settings' },
  ];
  const title = navItems.find((item) => item.key === pageKey)?.label ?? t.overview;
  const goMonth = (delta: number) => setCalendarMonth((current) => new Date(current.getFullYear(), current.getMonth() + delta, 1));
  const monthDays = new Date(calendarMonth.getFullYear(), calendarMonth.getMonth() + 1, 0).getDate();
  const firstDay = new Date(calendarMonth.getFullYear(), calendarMonth.getMonth(), 1).getDay();
  const calendarCells = [...Array(firstDay).fill(null), ...Array.from({ length: monthDays }, (_, i) => i + 1)];
  const dayAppointments = calendarDay ? data.appointments.filter((row) => row.appointment_date === calendarDay).sort((a, b) => a.created_at.localeCompare(b.created_at)) : [];
  return <div className={`admin-shell ${rtl ? 'is-rtl' : ''}`} dir={rtl ? 'rtl' : 'ltr'}>
    <aside className={`admin-sidebar ${mobileNav ? 'mobile-open' : ''}`}>
      <Link href="/" className="admin-brand" data-testid="link-admin-brand"><span className="admin-brand-mark">N</span><span><b>NOOR</b><small>DENTAL ATELIER</small></span></Link>
      <div className="sidebar-label">{t.workspace}</div>
      <nav className="admin-nav" aria-label={language === 'ar' ? 'التنقل الإداري' : 'Admin navigation'}>
        {navItems.map(({ href, label, icon: Icon, key }) => <Link key={key} href={href} data-testid={`link-admin-${key}`} className={`admin-nav-link ${pageKey === key ? 'active' : ''}`} onClick={() => setMobileNav(false)}><Icon size={17} /><span>{label}</span>{pageKey === key && <i />}</Link>)}
      </nav>
      <div className="sidebar-bottom">
        <div className="sidebar-security"><span><ShieldCheck size={16} /></span><div><strong>{t.secure}</strong><small>NOOR · ADMIN</small></div></div>
        <button className="sidebar-logout" onClick={async () => { try { await auth.signOut(); setNotice({ kind: 'success', text: t.logoutConfirm }); } catch { setNotice({ kind: 'error', text: t.logoutError }); } }} data-testid="button-admin-logout"><LogOut size={16} />{t.signOut}</button>
      </div>
    </aside>
    {mobileNav && <button className="admin-scrim" aria-label={t.cancel} onClick={() => setMobileNav(false)} data-testid="button-close-admin-menu" />}
    <main className="admin-main">
      <header className="admin-topbar">
        <button className="mobile-menu-button" aria-label={t.workspace} onClick={() => setMobileNav(true)} data-testid="button-admin-menu"><Menu size={19} /></button>
        <div className="topbar-title"><span>{t.clinic}</span><h1>{title}</h1></div>
        <div className="topbar-actions">
          <span className="secure-chip"><ShieldCheck size={14} />{t.secure}</span>
          <button className="language-switch" onClick={() => setLanguage(rtl ? 'en' : 'ar')} data-testid="button-admin-language">{rtl ? 'EN' : 'عربي'}</button>
          <span className="admin-avatar">{auth.session?.user.email?.charAt(0).toUpperCase() || 'N'}</span>
        </div>
      </header>
      <div className="admin-content">
        {notice && <div className={`admin-toast ${notice.kind}`} role="status" aria-live="polite" data-testid={`notice-${notice.kind}`}><span>{notice.kind === 'success' ? <Check size={16} /> : <Activity size={16} />}{notice.text}</span><button onClick={() => setNotice(null)} aria-label={t.cancel} data-testid="button-dismiss-notice"><X size={15} /></button></div>}
        {data.error && <div className="admin-alert error" role="alert" data-testid="error-appointments"><span>{t.loadError}</span><button onClick={() => void data.refresh()} data-testid="button-retry-appointments">{t.retry}</button></div>}
        {pageKey === 'overview' && <section className="admin-page">
          <div className="page-intro"><div><span className="admin-kicker">{t.workspace}</span><h2>{rtl ? 'صباح الخير، إليك ملخص العيادة.' : 'A clear view of the clinic, at a glance.'}</h2></div><button className="refresh-button" onClick={() => void data.refresh()} disabled={data.refreshing} data-testid="button-refresh-overview"><RefreshCw size={15} className={data.refreshing ? 'spin' : ''} />{t.refresh}</button></div>
          <div className="stat-grid">
            <article className="stat-card total-stat"><div className="stat-label"><span>{t.total}</span><span className="stat-icon"><CalendarDays size={17} /></span></div><strong data-testid="value-total-appointments">{data.appointments.length}</strong><small>{rtl ? 'طلبات محفوظة في النظام' : 'requests recorded in the system'}</small></article>
            {statuses.map((status) => <article className={`stat-card stat-${status}`} key={status}><div className="stat-label"><span>{statusLabel(status, t)}</span><span className={`status-dot dot-${status}`} /></div><strong data-testid={`value-count-${status}`}>{countText(status)}</strong><small>{rtl ? 'موعد' : 'appointments'}</small></article>)}
          </div>
          <div className="overview-grid">
            <section className="panel chart-panel"><div className="panel-heading"><div><span className="admin-kicker">{t.statusOverview}</span><h3>{rtl ? 'توزيع المواعيد' : 'Appointment distribution'}</h3></div><Activity size={18} /></div>
              <StatusChart appointments={data.appointments} counts={counts} t={t} language={language} />
            </section>
            <section className="panel upcoming-panel"><div className="panel-heading"><div><span className="admin-kicker">{t.upcoming}</span><h3>{rtl ? 'على جدول العيادة' : 'On the clinic schedule'}</h3></div><Link href="/admin/calendar" className="panel-link" data-testid="link-overview-calendar">{t.calendar}<ArrowLeft size={14} /></Link></div>
              {data.loading ? <SkeletonRows /> : upcoming.length ? <div className="mini-appointments">{upcoming.map((row) => <button key={row.id} onClick={() => setSelected(row)} className="mini-appointment" data-testid={`button-upcoming-${row.id}`}><span className="mini-date"><strong>{row.appointment_date.slice(8, 10)}</strong><small>{localDate(row.appointment_date, language, { month: 'short' })}</small></span><span className="mini-person"><strong>{row.patient_name}</strong><small>{row.service}</small></span><StatusPill status={row.status} t={t} id={row.id} /></button>)}</div> : <EmptyState message={t.noUpcoming} />}
            </section>
          </div>
          <section className="panel recent-panel"><div className="panel-heading"><div><span className="admin-kicker">{t.recent}</span><h3>{rtl ? 'آخر ما وصل إلى العيادة' : 'Latest from the front desk'}</h3></div><Link href="/admin/appointments" className="panel-link" data-testid="link-overview-appointments">{t.viewAll}<ArrowLeft size={14} /></Link></div>
            {data.loading ? <SkeletonRows /> : recent.length ? <AppointmentRows rows={recent} t={t} language={language} savingId={data.savingId} onStatus={(id, status) => void performStatus(id, status)} onSelect={setSelected} onDelete={setDeleteTarget} /> : <EmptyState message={t.noAppointments} />}
          </section>
        </section>}

        {pageKey === 'appointments' && <section className="admin-page">
          <div className="page-intro"><div><span className="admin-kicker">{t.appointments}</span><h2>{rtl ? 'كل طلب، بتفاصيله.' : 'Every request, in good order.'}</h2></div><button className="refresh-button" onClick={() => void data.refresh()} disabled={data.refreshing} data-testid="button-refresh-appointments"><RefreshCw size={15} className={data.refreshing ? 'spin' : ''} />{t.refresh}</button></div>
          <section className="panel management-panel">
            <div className="filter-bar"><label className="search-field"><Search size={17} /><input value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }} placeholder={t.searchPlaceholder} data-testid="input-appointment-search" /></label>
              <label className="filter-select"><SlidersHorizontal size={15} /><select value={statusFilter} onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }} data-testid="select-filter-status"><option value="">{t.allStatuses}</option>{statuses.map((s) => <option value={s} key={s}>{statusLabel(s, t)}</option>)}</select><ChevronDown size={14} /></label>
              <label className="filter-date"><span>{t.dateFrom}</span><input type="date" value={fromDate} onChange={(e) => { setFromDate(e.target.value); setPage(1); }} data-testid="input-filter-date-from" /></label>
              <label className="filter-date"><span>{t.dateTo}</span><input type="date" value={toDate} onChange={(e) => { setToDate(e.target.value); setPage(1); }} data-testid="input-filter-date-to" /></label>
              <button className="sort-button" onClick={() => setSort(sort === 'asc' ? 'desc' : 'asc')} data-testid="button-sort-appointments"><ArrowDown size={14} />{sort === 'asc' ? t.sortOldest : t.sortNewest}</button>
              <button className="clear-button" onClick={clearFilters} data-testid="button-clear-filters">{t.clearFilters}</button>
            </div>
             {data.loading ? <SkeletonRows /> : paginated.length ? <div className="appointment-table-scroll" role="region" aria-label={t.appointments} tabIndex={0}>
               <div className="list-columns detailed-columns"><span>{t.patient}</span><span>{t.phone}</span><span>{t.email}</span><span>{t.service}</span><span>{t.date}</span><span>{t.notes}</span><span>{t.status}</span><span>{t.created}</span><span>{t.actions}</span></div>
               <AppointmentRows rows={paginated} t={t} language={language} savingId={data.savingId} onStatus={(id, status) => void performStatus(id, status)} onSelect={setSelected} onDelete={setDeleteTarget} compact={false} />
             </div> : <EmptyState message={data.appointments.length ? t.noResults : t.noAppointments} />}
            <div className="pagination"><span>{t.showing} <b>{filtered.length ? (page - 1) * pageSize + 1 : 0}–{Math.min(page * pageSize, filtered.length)}</b> {t.of} <b>{filtered.length}</b></span><div><button onClick={() => setPage(Math.max(1, page - 1))} disabled={page <= 1} data-testid="button-page-previous"><ArrowLeft size={15} />{t.previous}</button><span>{page} / {pageCount}</span><button onClick={() => setPage(Math.min(pageCount, page + 1))} disabled={page >= pageCount} data-testid="button-page-next">{t.next}<ArrowRight size={15} /></button></div></div>
          </section>
        </section>}

        {pageKey === 'calendar' && <section className="admin-page">
          <div className="page-intro"><div><span className="admin-kicker">{t.calendar}</span><h2>{rtl ? 'إيقاع العيادة، شهراً بشهر.' : 'The clinic rhythm, month by month.'}</h2></div><button className="refresh-button" onClick={() => void data.refresh()} disabled={data.refreshing} data-testid="button-refresh-calendar"><RefreshCw size={15} className={data.refreshing ? 'spin' : ''} />{t.refresh}</button></div>
          <div className="calendar-layout">
            <section className="panel calendar-panel"><div className="calendar-controls"><div><span className="admin-kicker">{t.calendar}</span><h3>{t.monthNames[calendarMonth.getMonth()]} <b>{calendarMonth.getFullYear()}</b></h3></div><div className="month-actions"><button onClick={() => setCalendarMonth(new Date())} data-testid="button-calendar-today">{t.today}</button><button aria-label={t.monthBack} onClick={() => goMonth(-1)} data-testid="button-calendar-previous"><ArrowLeft size={16} /></button><button aria-label={t.monthForward} onClick={() => goMonth(1)} data-testid="button-calendar-next"><ArrowRight size={16} /></button></div></div>
              <div className="calendar-grid">{t.week.map((day) => <div className="calendar-weekday" key={day}>{day}</div>)}{calendarCells.map((day, index) => {
                if (!day) return <span className="calendar-blank" key={`blank-${index}`} />;
                const key = `${calendarMonth.getFullYear()}-${String(calendarMonth.getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
                const dayRows = data.appointments.filter((row) => row.appointment_date === key);
                const isToday = key === todayString;
                return <button key={key} className={`calendar-day ${isToday ? 'today' : ''} ${calendarDay === key ? 'selected' : ''}`} onClick={() => setCalendarDay(key)} data-testid={`button-calendar-day-${day}`} aria-label={`${day} ${t.monthNames[calendarMonth.getMonth()]}, ${dayRows.length} appointments`}>
                  <span>{day}</span>{dayRows.length > 0 && <span className="calendar-dots">{statuses.filter((s) => dayRows.some((row) => row.status === s)).map((s) => <i className={`dot-${s}`} key={s} />)}</span>}
                </button>;
              })}</div>
              <div className="calendar-legend">{statuses.map((s) => <span key={s}><i className={`dot-${s}`} />{statusLabel(s, t)}</span>)}</div>
            </section>
            <section className="panel calendar-detail"><span className="admin-kicker">{calendarDay ? localDate(calendarDay, language) : t.details}</span><h3>{calendarDay ? (rtl ? 'مواعيد هذا اليوم' : 'Appointments for this day') : (rtl ? 'اختر يوماً من التقويم' : 'Select a day on the calendar')}</h3>
              {data.loading ? <SkeletonRows /> : calendarDay && dayAppointments.length ? <div className="day-appointment-list">{dayAppointments.map((row) => <button className="day-appointment" key={row.id} onClick={() => setSelected(row)} data-testid={`button-calendar-appointment-${row.id}`}><span className="day-time"><Clock3 size={15} />{row.patient_name}</span><small>{row.service} · {row.phone}</small><StatusPill status={row.status} t={t} id={row.id} /></button>)}</div> : <EmptyState message={calendarDay ? t.noDayAppointments : t.detailEmpty} />}
            </section>
          </div>
        </section>}

        {pageKey === 'settings' && <section className="admin-page">
          <div className="page-intro"><div><span className="admin-kicker">{t.settings}</span><h2>{rtl ? 'مساحة عملك، كما ينبغي.' : 'Your workspace, kept in order.'}</h2></div></div>
          <section className="panel account-panel"><div className="account-heading"><span className="account-icon"><UserRound size={22} /></span><div><span className="admin-kicker">{t.account}</span><h3>{auth.session?.user.email || t.noEmail}</h3></div></div>
            <div className="account-detail"><span>{t.signedInAs}</span><strong data-testid="text-admin-account">{auth.session?.user.email || t.noEmail}</strong></div>
            <div className="account-note"><ShieldCheck size={18} /><p>{t.accountNote}</p></div>
            <button className="admin-danger-button" onClick={async () => { try { await auth.signOut(); } catch { setNotice({ kind: 'error', text: t.logoutError }); } }} data-testid="button-settings-logout"><LogOut size={16} />{t.signOut}</button>
          </section>
        </section>}
        <footer className="admin-footer"><span>NOOR DENTAL ATELIER</span><span>{t.secure}</span></footer>
      </div>
    </main>

    {selected && <div className="admin-modal-backdrop" role="presentation" onMouseDown={(e) => { if (e.target === e.currentTarget) setSelected(null); }}>
      <section className="admin-modal" role="dialog" aria-modal="true" aria-labelledby="appointment-modal-title">
        <div className="modal-head"><div><span className="admin-kicker">{t.details}</span><h2 id="appointment-modal-title">{selected.patient_name}</h2></div><button onClick={() => setSelected(null)} aria-label={t.cancel} className="icon-button" data-testid="button-close-details"><X size={18} /></button></div>
        <StatusPill status={selected.status} t={t} id={`${selected.id}-detail`} />
        <div className="detail-grid"><div><span>{t.service}</span><strong>{selected.service}</strong></div><div><span>{t.date}</span><strong>{localDate(selected.appointment_date, language)}</strong></div><div><span>{t.phone}</span><strong><Phone size={14} />{selected.phone}</strong></div><div><span>{t.email}</span><strong><Mail size={14} />{selected.email || '—'}</strong></div><div><span>{t.created}</span><strong>{localDate(selected.created_at, language)}</strong></div></div>
        <div className="detail-notes"><span>{t.notes}</span><p>{selected.notes || '—'}</p></div>
        <div className="modal-actions"><label>{t.changeStatus}<span className="status-select-wrap"><select value={selected.status} disabled={data.savingId === selected.id} data-testid="select-modal-status" onChange={(e) => { const next = e.target.value as AppointmentStatus; void performStatus(selected.id, next); }}>{statuses.map((s) => <option value={s} key={s}>{statusLabel(s, t)}</option>)}</select><ChevronDown size={14} /></span></label>{selectedWhatsAppUrl && <a className="admin-message-button" href={selectedWhatsAppUrl} target="_blank" rel="noopener noreferrer" aria-label={`${t.messagePatient}: ${selected.phone}`} data-testid="link-message-patient"><MessageCircle size={15} />{t.messagePatient}</a>}<button className="admin-danger-button" onClick={() => setDeleteTarget(selected)} data-testid="button-modal-delete"><Trash2 size={15} />{t.delete}</button></div>
      </section>
    </div>}
    {deleteTarget && <div className="admin-modal-backdrop" role="presentation" onMouseDown={(e) => { if (e.target === e.currentTarget) setDeleteTarget(null); }}><section className="admin-confirm-modal" role="alertdialog" aria-modal="true" aria-labelledby="confirm-delete-title">
      <span className="confirm-icon"><Trash2 size={20} /></span><h2 id="confirm-delete-title">{t.delete}</h2><p>{t.confirmDelete}</p><div><button className="admin-secondary" onClick={() => setDeleteTarget(null)} data-testid="button-cancel-delete">{t.cancel}</button><button className="admin-danger-button" onClick={() => void performDelete()} disabled={data.savingId === deleteTarget.id} data-testid="button-confirm-delete">{data.savingId === deleteTarget.id ? t.loading : t.confirm}</button></div>
    </section></div>}
  </div>;
}

function StatusChart({ appointments, counts, t, language }: {
  appointments: Appointment[]; counts: Record<AppointmentStatus, number>; t: typeof words.ar | typeof words.en; language: Language;
}) {
  const total = appointments.length;
  const colors: Record<AppointmentStatus, string> = { pending: '#bd9864', confirmed: '#617c6c', completed: '#9aab8a', cancelled: '#bd8277' };
  let cumulative = 0;
  const arcs = statuses.map((status) => {
    const fraction = total ? counts[status] / total : 0;
    const start = cumulative;
    cumulative += fraction;
    return { status, start, fraction, color: colors[status] };
  });
  const radius = 64;
  const circumference = 2 * Math.PI * radius;
  return <div className="chart-content">
    <div className="donut-chart" role="img" aria-label={`${t.statusOverview}: ${total} ${language === 'ar' ? 'موعد' : 'appointments'}`} data-testid="chart-appointment-status">
      <svg viewBox="0 0 160 160" aria-hidden="true"><circle cx="80" cy="80" r={radius} fill="none" stroke="#e7e1d7" strokeWidth="13" />{arcs.map(({ status, start, fraction, color }) => fraction > 0 && <circle key={status} cx="80" cy="80" r={radius} fill="none" stroke={color} strokeWidth="13" strokeDasharray={`${circumference * fraction} ${circumference * (1 - fraction)}`} strokeDashoffset={-circumference * start} transform="rotate(-90 80 80)" />)}</svg>
      <div><strong>{total}</strong><span>{language === 'ar' ? 'موعد' : 'requests'}</span></div>
    </div>
    <div className="chart-legend">{statuses.map((status) => <div key={status}><span className="legend-label"><i style={{ backgroundColor: colors[status] }} />{statusLabel(status, t)}</span><strong>{counts[status]}<small>{total ? `${Math.round((counts[status] / total) * 100)}%` : '0%'}</small></strong></div>)}</div>
  </div>;
}

export default AdminApp;
