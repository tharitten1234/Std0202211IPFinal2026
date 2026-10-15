import React, { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Alert, Pressable, KeyboardAvoidingView, Platform, SafeAreaView, ScrollView, StyleSheet, Text, TextInput, useWindowDimensions, View } from 'react-native';
import { api, Cluster, Employee } from './api';

const empty = { name: '', position: '', salary: '', status: 'Active' as Employee['status'] };
const message = (error: unknown) => error instanceof Error ? error.message : 'Request failed';
const money = (value: number) => value.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
function notify(title: string, text: string) {
  if (Platform.OS === 'web') window.alert(`${title}\n${text}`);
  else Alert.alert(title, text);
}
type Language = 'th' | 'en';
const thai: Record<string, string> = {
  'Employee Management & Salary Analytics': 'จัดการพนักงานและวิเคราะห์เงินเดือน',
  'Login': 'เข้าสู่ระบบ', 'Username': 'ชื่อผู้ใช้', 'Password': 'รหัสผ่าน',
  'Dashboard': 'ภาพรวม', 'Matching employees': 'พนักงานที่ค้นพบ', 'Employees': 'พนักงาน',
  'Active': 'ทำงาน', 'On Leave': 'ลางาน', 'Search name / position': 'ค้นหาชื่อหรือตำแหน่ง',
  'Search': 'ค้นหา', 'Clear': 'ล้างการค้นหา', 'Edit Employee': 'แก้ไขพนักงาน', 'Add Employee': 'เพิ่มพนักงาน',
  'Name': 'ชื่อพนักงาน', 'Position': 'ตำแหน่ง', 'Salary': 'เงินเดือน (บาท)', 'Status': 'สถานะ',
  'Save Changes': 'บันทึกการแก้ไข', 'Cancel Edit': 'ยกเลิกการแก้ไข', 'Retry': 'ลองใหม่',
  'No employees found.': 'ไม่พบพนักงาน ลองเปลี่ยนคำค้นหรือเพิ่มพนักงาน', 'Edit': 'แก้ไข',
  'Toggle Status': 'เปลี่ยนสถานะ', 'Delete': 'ลบ', 'Salary Analytics': 'วิเคราะห์เงินเดือน',
  'All employees · K-Means k=3': 'วิเคราะห์พนักงานทั้งหมด รวมผู้ลางาน · K-Means k=3',
  'Analyze Salary Structure': 'วิเคราะห์โครงสร้างเงินเดือน', 'Average salary': 'เงินเดือนเฉลี่ย',
  'Validation': 'ตรวจสอบข้อมูล', 'Enter username and password': 'กรุณากรอกชื่อผู้ใช้และรหัสผ่าน',
  'Login failed': 'เข้าสู่ระบบไม่สำเร็จ', 'Analysis failed': 'วิเคราะห์ไม่สำเร็จ', 'Request failed': 'ดำเนินการไม่สำเร็จ',
  'Enter name, position, and a positive salary (maximum 2 decimals)': 'กรุณากรอกชื่อ ตำแหน่ง และเงินเดือนมากกว่า 0 (ทศนิยมไม่เกิน 2 ตำแหน่ง)',
  'Are you sure?': 'ยืนยันการลบ?', 'Cancel': 'ยกเลิก', 'Loading employees': 'กำลังโหลดพนักงาน',
  'Saving employee': 'กำลังบันทึก', 'Logging in': 'กำลังเข้าสู่ระบบ', 'Analyzing salary structure': 'กำลังวิเคราะห์เงินเดือน',
  'Invalid username or password': 'ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง',
  'Request timed out. Check the backend connection.': 'หมดเวลารอ กรุณาตรวจสอบการเชื่อมต่อเซิร์ฟเวอร์',
  'Failed to fetch': 'เชื่อมต่อเซิร์ฟเวอร์ไม่ได้ กรุณาลองใหม่',
  'Database request failed; please try again': 'ฐานข้อมูลไม่พร้อมใช้งาน กรุณาลองใหม่',
  'Fill in all fields before saving.': 'กรอกข้อมูลให้ครบก่อนบันทึก',
  'Actions': 'จัดการ', 'Workspace': 'พื้นที่ทำงาน', 'Welcome back': 'ยินดีต้อนรับกลับ', 'Sign in to manage your team.': 'เข้าสู่ระบบเพื่อจัดการข้อมูลทีมของคุณ', 'Results reflect the current search.': 'จำนวนแสดงตามผลการค้นหาปัจจุบัน', 'Choose a status': 'เลือกสถานะ', 'Tier': 'กลุ่ม',
};
function Button({ title, onPress, disabled, color }: { title: string; onPress: () => void; disabled?: boolean; color?: string }) {
  return <Pressable accessibilityRole="button" accessibilityState={{ disabled: !!disabled }} disabled={disabled} onPress={onPress}
    style={({ pressed }) => [styles.button, color ? styles.dangerButton : null, disabled ? styles.disabled : null, pressed && !disabled ? styles.pressed : null]}>
    <Text style={[styles.buttonText, color ? styles.dangerText : null]}>{title}</Text>
  </Pressable>;
}
export default function App() {
  const { width } = useWindowDimensions();
  const wide = width >= 1100;
  const sections = useRef<Record<string, number>>({});
  const [section, setSection] = useState('Dashboard');
  const go = (name: string) => { setSection(name); scroll.current?.scrollTo({ y: sections.current[name] || 0, animated: true }); };
  const [language, setLanguage] = useState<Language>('th');
  const t = (text: string) => language === 'th' ? (thai[text] || text) : text;
  const alertUser = (title: string, text: string) => notify(t(title), t(text));
  const [token, setToken] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [clusters, setClusters] = useState<Cluster[] | null>(null);
  const [search, setSearch] = useState('');
  const [appliedSearch, setAppliedSearch] = useState('');
  const [form, setForm] = useState(empty);
  const [editing, setEditing] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [loading, setLoading] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [error, setError] = useState('');
  const listRequest = useRef(0);
  const analysisRequest = useRef(0);
  const scroll = useRef<ScrollView>(null);
  async function load(query: string, accessToken = token) {
    const request = ++listRequest.current;
    setLoading(true); setError('');
    try {
      const rows = await api<Employee[]>(`/employees?search=${encodeURIComponent(query)}`, accessToken);
      if (request === listRequest.current) setEmployees(rows);
    } catch (err) { if (request === listRequest.current) setError(message(err)); }
    finally { if (request === listRequest.current) setLoading(false); }
  }
  useEffect(() => {
    if (Platform.OS !== 'web') return;
    const icon = document.querySelector<HTMLLinkElement>('link[rel=\"icon\"]') || document.createElement('link');
    icon.rel = 'icon'; icon.type = 'image/svg+xml'; icon.href = '/favicon.svg'; document.head.appendChild(icon);
    document.documentElement.lang = language;
  }, [language]);
  useEffect(() => { if (token) void load('', token); }, [token]);
  async function login() {
    if (!username.trim() || !password) return alertUser('Validation', 'Enter username and password');
    setBusy(true);
    try {
      const result = await api<{ success: boolean; token: string }>('/login', '', 'POST', { username: username.trim(), password });
      setToken(result.token); setPassword('');
    } catch (err) { alertUser('Login failed', message(err)); }
    finally { setBusy(false); }
  }
  async function analyze() {
    const request = ++analysisRequest.current;
    setAnalyzing(true);
    try {
      const result = await api<{ success: boolean; clusters: Cluster[] }>('/employees/salary-clusters', token);
      if (request === analysisRequest.current) setClusters(result.clusters);
    } catch (err) { if (request === analysisRequest.current) alertUser('Analysis failed', message(err)); }
    finally { if (request === analysisRequest.current) setAnalyzing(false); }
  }
  async function mutate(path: string, method: string, body?: unknown) {
    setBusy(true); setError('');
    try {
      await api(path, token, method, body);
      // Invalidate pending analysis before refreshing after any mutation.
      ++analysisRequest.current; setAnalyzing(false);
      const refreshAnalysis = clusters !== null;
      setClusters(null);
      setForm(empty); setEditing(null);
      await load(appliedSearch);
      if (refreshAnalysis) await analyze();
    } catch (err) { alertUser('Request failed', message(err)); }
    finally { setBusy(false); }
  }
  function save() {
    const salary = Number(form.salary);
    if (!form.name.trim() || !form.position.trim() || !form.salary.trim() ||
        !/^\d+(\.\d{1,2})?$/.test(form.salary.trim()) || !Number.isFinite(salary) || salary <= 0 || salary > 9999999999.99) {
      return alertUser('Validation', 'Enter name, position, and a positive salary (maximum 2 decimals)');
    }
    void mutate(editing ? `/employees/${editing}` : '/employees', editing ? 'PUT' : 'POST', { ...form, name: form.name.trim(), position: form.position.trim(), salary });
  }
  function remove(employee: Employee) {
    const perform = () => void mutate(`/employees/${employee.id}`, 'DELETE');
    if (Platform.OS === 'web') { if (window.confirm(`${t('Are you sure?')} ${t('Delete')} ${employee.name}?`)) perform(); }
    else Alert.alert(t('Are you sure?'), `${t('Delete')} ${employee.name}?`, [{ text: t('Cancel'), style: 'cancel' }, { text: t('Delete'), style: 'destructive', onPress: perform }]);
  }
  const disabled = busy || loading || analyzing;
  return <SafeAreaView style={styles.safe}><KeyboardAvoidingView style={styles.safe} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
    <View style={[styles.shell, !wide && styles.mobileShell]}>
      {!!token && <View style={[styles.sidebar, !wide && styles.mobileSidebar]}>
        <Text style={styles.brand}>HR<Text style={styles.brandAccent}> / </Text>Manager</Text>
        {wide && <Text style={styles.navLabel}>{t('Workspace')}</Text>}
        <View style={!wide ? styles.mobileNav : styles.nav}>{['Dashboard', 'Employees', 'Add Employee', 'Salary Analytics'].map((name, index) => <Pressable key={name} accessibilityRole="button" accessibilityState={{ selected: section === name }} onPress={() => go(name)} style={[styles.navItem, section === name && styles.navActive]}><Text style={[styles.navText, section === name && styles.navActiveText]}>{['◫', '☷', '+', '▥'][index]}  {t(name)}</Text></Pressable>)}</View>
      </View>}
    <ScrollView ref={scroll} scrollEventThrottle={100} onScroll={event => {
      const { contentOffset, layoutMeasurement, contentSize } = event.nativeEvent;
      if (contentOffset.y <= 0) { setSection('Dashboard'); return; }
      if (contentOffset.y + layoutMeasurement.height >= contentSize.height - 4) {
        setSection('Salary Analytics'); return;
      }
      const visible = Object.entries(sections.current).filter(([, y]) => y <= contentOffset.y + 60).sort((a, b) => b[1] - a[1]);
      if (visible.length) setSection(visible[0][0]);
    }} style={styles.main} contentContainerStyle={[styles.container, !token && styles.loginContainer, !wide && styles.mobileContainer]} keyboardShouldPersistTaps="handled">
      <View style={styles.header}><Text style={styles.title}>HR Manager</Text><Pressable accessibilityRole="button" accessibilityLabel="Switch language / เปลี่ยนภาษา" onPress={() => setLanguage(language === 'th' ? 'en' : 'th')} style={styles.language}><Text style={styles.languageText}>{language === 'th' ? 'English' : 'ภาษาไทย'}</Text></Pressable></View><Text style={styles.subtitle}>{t('Employee Management & Salary Analytics')}</Text>
      {!token ? <View style={[styles.card, styles.loginCard]}><Text style={styles.eyebrow}>HR MANAGER</Text><Text style={styles.welcome}>{t('Welcome back')}</Text><Text style={styles.subtitle}>{t('Sign in to manage your team.')}</Text>
        <Text style={styles.heading}>{t('Login')}</Text>
        <Text>{t('Username')}</Text><TextInput accessibilityLabel="Username" style={styles.input} value={username} onChangeText={setUsername} autoCapitalize="none" editable={!busy} />
        <Text>{t('Password')}</Text><TextInput accessibilityLabel="Password" style={styles.input} value={password} onChangeText={setPassword} secureTextEntry editable={!busy} onSubmitEditing={() => { if (!busy) void login(); }} />
        <Button title={t('Login')} onPress={() => void login()} disabled={busy} />{busy && <ActivityIndicator accessibilityLabel="Logging in" />}
      </View> : <>
        <View onLayout={e => { sections.current.Dashboard = e.nativeEvent.layout.y; }}>
          <Text style={styles.heading}>{t('Dashboard')}</Text>
          <View style={styles.stats}>{[
            [t(appliedSearch ? 'Matching employees' : 'Employees'), employees.length],
            [t('Active'), employees.filter(e => e.status === 'Active').length],
            [t('On Leave'), employees.filter(e => e.status === 'On Leave').length],
          ].map(([label, value]) => <View key={label} style={styles.stat}><Text style={styles.subtitle}>{label}</Text><Text style={styles.statValue}>{loading ? '—' : value}</Text></View>)}</View>
          {!!appliedSearch && <Text style={styles.subtitle}>{t('Results reflect the current search.')}</Text>}
        </View>
        <View style={styles.card}>
          <Text style={styles.label}>{t('Search name / position')}</Text>
          <TextInput accessibilityLabel="Search name or position" placeholder={t('Search name / position')} style={styles.input} value={search} onChangeText={setSearch} editable={!disabled} onSubmitEditing={() => { if (!disabled) { setAppliedSearch(search); void load(search); } }} />
          <Button title={t('Search')} disabled={disabled} onPress={() => { setAppliedSearch(search); void load(search); }} />
          {!!(search || appliedSearch) && <Button title={t('Clear')} disabled={disabled} onPress={() => { setSearch(''); setAppliedSearch(''); void load(''); }} />}
        </View>
        <View onLayout={e => { sections.current['Add Employee'] = e.nativeEvent.layout.y; }} style={styles.card}>
          <Text style={styles.heading}>{t(editing ? 'Edit Employee' : 'Add Employee')}</Text>
          <Text style={styles.subtitle}>{t('Fill in all fields before saving.')}</Text>
          <Text>{t('Name')}</Text><TextInput accessibilityLabel="Employee name" style={styles.input} maxLength={100} value={form.name} editable={!disabled} onChangeText={name => setForm({ ...form, name })} />
          <Text>{t('Position')}</Text><TextInput accessibilityLabel="Employee position" style={styles.input} maxLength={100} value={form.position} editable={!disabled} onChangeText={position => setForm({ ...form, position })} />
          <Text>{t('Salary')}</Text><TextInput accessibilityLabel="Employee salary" style={styles.input} keyboardType="decimal-pad" value={form.salary} editable={!disabled} onChangeText={salary => setForm({ ...form, salary })} />
          <Text style={styles.label}>{t('Status')}: {t(form.status)}</Text>
          <View style={styles.buttons}>{(['Active', 'On Leave'] as const).map(status => <Pressable key={status} accessibilityRole="radio" accessibilityState={{ checked: form.status === status, disabled }} disabled={disabled} onPress={() => setForm({ ...form, status })} style={[styles.statusOption, form.status === status && styles.selectedStatus]}><Text style={form.status === status ? styles.selectedText : styles.optionText}>{t(status)}</Text></Pressable>)}</View>
          <View style={styles.gap} /><Button title={t(editing ? 'Save Changes' : 'Add Employee')} onPress={save} disabled={disabled} />
          {editing && <Button title={t('Cancel Edit')} onPress={() => { setEditing(null); setForm(empty); }} disabled={disabled} />}
        </View>
        {busy && <View style={styles.feedback}><ActivityIndicator accessibilityLabel="Saving employee" /><Text>{t('Saving employee')}…</Text></View>}
        <Text onLayout={e => { sections.current.Employees = e.nativeEvent.layout.y; }} style={styles.heading}>{t('Employees')}</Text>
        {wide && <View style={styles.tableHeader}>{['Name', 'Position', 'Status', 'Salary', 'Actions'].map((label, i) => <Text key={label} style={[styles.column, i === 4 && styles.actionColumn, styles.columnLabel]}>{t(label)}</Text>)}</View>}
        {loading && <View style={styles.feedback}><ActivityIndicator accessibilityLabel="Loading employees" /><Text>{t('Loading employees')}…</Text></View>}
        {!!error && <View style={styles.card}><Text style={styles.error}>{t(error)}</Text><Button title={t('Retry')} onPress={() => void load(appliedSearch)} disabled={disabled} /></View>}
        {!loading && !error && employees.length === 0 && <Text>{t('No employees found.')}</Text>}
        {employees.map(employee => <View style={[styles.employeeRow, !wide && styles.employeeMobile]} key={employee.id}>
          <Text style={[styles.column, !wide && styles.mobileColumn, styles.employeeName]}>{employee.name}</Text><Text style={[styles.column, !wide && styles.mobileColumn]}>{employee.position}</Text>
          <View style={[styles.column, !wide && styles.mobileColumn]}><Text style={[styles.badge, employee.status === 'On Leave' && styles.leaveBadge]}>{t(employee.status)}</Text></View><Text style={[styles.column, !wide && styles.mobileColumn]}>฿{money(employee.salary)}</Text>
          <View style={[styles.buttons, wide && styles.actionColumn]}>
            <Button title={t('Edit')} disabled={disabled} onPress={() => { setEditing(employee.id); setForm({ ...employee, salary: String(employee.salary) }); go('Add Employee'); }} />
            <Button title={t('Toggle Status')} disabled={disabled} onPress={() => void mutate(`/employees/${employee.id}/status`, 'PUT')} />
            <Button title={t('Delete')} color="#b42318" disabled={disabled} onPress={() => remove(employee)} />
          </View>
        </View>)}
        <View onLayout={e => { sections.current['Salary Analytics'] = e.nativeEvent.layout.y; }} style={styles.card}>
          <Text style={styles.heading}>{t('Salary Analytics')}</Text><Text style={styles.label}>{t('All employees · K-Means k=3')}</Text>
          <Button title={t('Analyze Salary Structure')} disabled={disabled} onPress={() => void analyze()} />
          {analyzing && <View style={styles.feedback}><ActivityIndicator accessibilityLabel="Analyzing salary structure" /><Text>{t('Analyzing salary structure')}…</Text></View>}
          {clusters?.map(cluster => <View key={language === 'th' ? cluster.group.replace('Tier', 'กลุ่ม') : cluster.group} style={styles.tier}>
            <Text style={styles.heading}>{language === 'th' ? cluster.group.replace('Tier', 'กลุ่ม') : cluster.group}</Text><Text>{t('Employees')}: {cluster.count}</Text>
            <Text>{t('Average salary')}: {cluster.centroid === null ? '—' : `฿${money(cluster.centroid)}`}</Text>
          </View>)}
        </View>
      </>}
    </ScrollView></View>
  </KeyboardAvoidingView></SafeAreaView>;
}
const styles = StyleSheet.create({
  shell: { flex: 1, flexDirection: 'row' }, mobileShell: { flexDirection: 'column' },
  main: { flex: 1 }, mobileContainer: { padding: 16 },
  sidebar: { width: 228, backgroundColor: '#1D344E', padding: 20, paddingTop: 36, gap: 32 },
  mobileSidebar: { width: '100%', padding: 16, gap: 12 },
  brand: { color: '#fff', fontSize: 22, fontWeight: '700' }, brandAccent: { color: '#79B7B4' },
  navLabel: { color: '#B5C6D4', fontSize: 12 }, nav: { gap: 8 }, mobileNav: { flexDirection: 'row', flexWrap: 'wrap', gap: 4 },
  navItem: { padding: 12, borderRadius: 8, minHeight: 44 }, navActive: { backgroundColor: '#304C65' },
  navText: { color: '#C5D2DD', fontSize: 14 }, navActiveText: { color: '#fff', fontWeight: '700' },
  stats: { flexDirection: 'row', flexWrap: 'wrap', gap: 12, marginVertical: 12 },
  stat: { flex: 1, minWidth: 120, backgroundColor: '#fff', borderWidth: 1, borderColor: '#E2E7EB', borderRadius: 12, padding: 18 },
  statValue: { color: '#1D344E', fontSize: 30, fontWeight: '700' },
  loginContainer: { maxWidth: 540, paddingTop: 64 }, loginCard: { padding: 28, gap: 14 },
  eyebrow: { color: '#327C83', fontSize: 12, fontWeight: '700', letterSpacing: 2 }, welcome: { color: '#1D344E', fontSize: 26, fontWeight: '700' },
  tableHeader: { flexDirection: 'row', paddingHorizontal: 16, paddingVertical: 12, gap: 12 },
  column: { flex: 1, minWidth: 0, color: '#475569', fontSize: 14 }, columnLabel: { fontWeight: '600', fontSize: 12 },
  mobileColumn: { flex: 0 },
  actionColumn: { flex: 2.4, marginTop: 0 },
  employeeRow: { backgroundColor: '#fff', flexDirection: 'row', alignItems: 'center', padding: 16, gap: 12, borderRadius: 10, borderWidth: 1, borderColor: '#E2E7EB' },
  employeeMobile: { flexDirection: 'column', alignItems: 'stretch' }, employeeName: { color: '#1D344E', fontWeight: '600' },
  badge: { alignSelf: 'flex-start', color: '#236269', backgroundColor: '#EAF4F3', borderRadius: 6, paddingHorizontal: 10, paddingVertical: 5, fontSize: 12 },
  leaveBadge: { backgroundColor: '#F7F0DF', color: '#796020' },
  safe: { flex: 1, backgroundColor: '#F4F6F8' },
  container: { padding: 20, paddingTop: 32, paddingBottom: 48, maxWidth: 1440, width: '100%', alignSelf: 'center', gap: 16 },
  title: { fontSize: 30, fontWeight: '700', color: '#1D344E' },
  subtitle: { color: '#475569', marginBottom: 8 },
  heading: { fontSize: 19, fontWeight: '600', color: '#1D344E', marginBottom: 8 },
  card: { backgroundColor: 'white', borderRadius: 12, padding: 20, borderWidth: 1, borderColor: '#dbe3ed', gap: 8 },
  input: { borderWidth: 1, borderColor: '#CAD4DC', borderRadius: 6, padding: 12, fontSize: 16, backgroundColor: '#fff', color: '#0f172a' },
  label: { marginVertical: 8 }, gap: { height: 4 },
  buttons: { flexDirection: 'row', flexWrap: 'wrap', gap: 12, marginTop: 8 },
  tier: { backgroundColor: '#EFF5F5', padding: 16, borderRadius: 8, marginTop: 12, gap: 6 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: 12, flexWrap: 'wrap' },
  language: { minHeight: 44, paddingHorizontal: 18, paddingVertical: 12, borderRadius: 24, borderWidth: 1, borderColor: '#bacbdd', backgroundColor: '#fff' },
  languageText: { color: '#1D344E', fontWeight: '600' },
  button: { minHeight: 46, paddingHorizontal: 18, paddingVertical: 12, borderRadius: 8, alignItems: 'center', justifyContent: 'center', backgroundColor: '#327C83' },
  buttonText: { color: '#fff', fontSize: 15, fontWeight: '600', textAlign: 'center' },
  dangerButton: { backgroundColor: '#fff1f0', borderWidth: 1, borderColor: '#f3c2bd' },
  dangerText: { color: '#a92119' },
  disabled: { opacity: 0.45 }, pressed: { opacity: 0.75 },
  statusOption: { minHeight: 44, paddingHorizontal: 20, paddingVertical: 12, borderWidth: 1, borderColor: '#bdcbd9', borderRadius: 8, backgroundColor: '#fff' },
  selectedStatus: { backgroundColor: '#EAF4F3', borderColor: '#327C83' },
  selectedText: { color: '#236269', fontWeight: '700' }, optionText: { color: '#475569' },
  feedback: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 12 },
  error: { color: '#b42318' },
});
