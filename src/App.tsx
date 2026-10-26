import { createContext, useContext, useEffect, useState } from "react"
import { api, serverUrl, supabase } from "./lib/supabase"

type IconName = "grid" | "users" | "calendar" | "pill" | "flask" | "bike" | "chart" | "settings" | "search" | "bell" | "plus" | "arrow"
type Language = "en" | "am" | "om"
const LanguageContext = createContext<{ language: Language; setLanguage: (language: Language) => void }>({ language: "en", setLanguage: () => {} })
const translations: Record<Language, Record<string, string>> = {
  en: { solutions: "Solutions", network: "Network", partner: "Partner portal", signIn: "Staff sign in", home: "Home healthcare", followUp: "Follow-up", dashboard: "Dashboard", partners: "Partners management", applications: "Partner applications", approve: "Approve", reject: "Reject", language: "Language", online: "Organization online", submit: "Submit application", review: "Review", seats: "User seats", admin: "Partner admin", connected: "ONE CONNECTED HEALTH SYSTEM", hero: "Care begins before the patient travels.", heroText: "Connect referrals, patient history, appointments, diagnostics, pharmacies and hospital operations across Ethiopia—using one Fayda-linked health record.", accessStaff: "Access staff portal", authorized: "Authorized health workers only", normal: "Network operating normally", live: "Live", referralAccepted: "Remote referral accepted", confirmed: "Confirmed", pharmacies: "12 pharmacies", stock: "Live stock search", fayda: "Fayda linked", history: "One patient history", travel: "Travel ready", built: "BUILT FOR THE FULL CARE JOURNEY", careTitle: "Less waiting. Safer referrals. Connected care.", remoteTitle: "Remote referral access", remoteText: "Patients are reviewed and scheduled before traveling long distances to TASH.", medicineTitle: "Medicine delivery", medicineText: "Find prescribed medicine from verified pharmacies, approve the price and receive delivery.", erpTitle: "National health ERP", erpText: "Role-based operations from country and region management to bedside clinical care.", networkTitle: "CONNECTED CARE NETWORK", networkText: "Designed to scale from one hospital to the whole country.", regions: "Regions ready", capacity: "Facility capacity", record: "Longitudinal record", footer: "Secure, role-based healthcare coordination", authorizedAccess: "AUTHORIZED ACCESS", welcome: "Welcome back", signInCopy: "Sign in with an account provisioned by the platform Super Admin.", workEmail: "Work email", password: "Password", enterPassword: "Enter your password", secureSignIn: "Sign in securely", firstSetup: "First-time setup: create the Super Admin account", back: "Back to website", approved: "APPROVED PARTNERS", accessOrganization: "Access your organization", partnerCopy: "Only accounts created by the platform Super Admin after institutional verification can sign in." },
  am: { solutions: "መፍትሄዎች", network: "ኔትወርክ", partner: "የአጋር ፖርታል", signIn: "የሰራተኛ መግቢያ", home: "የቤት ጤና አገልግሎት", followUp: "ክትትል", dashboard: "ዳሽቦርድ", partners: "የአጋሮች አስተዳደር", applications: "የአጋር ማመልከቻዎች", approve: "አጽድቅ", reject: "ውድቅ አድርግ", language: "ቋንቋ", online: "ድርጅቱ በመስመር ላይ ነው", submit: "ማመልከቻ ላክ", review: "ገምግም", seats: "የተጠቃሚ መቀመጫዎች", admin: "የአጋር አስተዳዳሪ", connected: "አንድ የተገናኘ የጤና ስርዓት", hero: "እንክብካቤ የሚጀምረው ታካሚው ከመጓዙ በፊት ነው።", heroText: "ሪፈራሎችን፣ የታካሚ ታሪክን፣ ቀጠሮዎችን፣ ምርመራዎችን፣ ፋርማሲዎችን እና የሆስፒታል ስራዎችን በአንድ የፋይዳ መዝገብ ያገናኙ።", accessStaff: "የሰራተኛ ፖርታል ይክፈቱ", authorized: "ለተፈቀዱ የጤና ሰራተኞች ብቻ", normal: "ኔትወርኩ በመደበኛነት እየሰራ ነው", live: "ቀጥታ", referralAccepted: "የርቀት ሪፈራል ተቀባይነት አግኝቷል", confirmed: "ተረጋግጧል", pharmacies: "12 ፋርማሲዎች", stock: "የመድሃኒት ክምችት ፍለጋ", fayda: "ከፋይዳ ጋር ተገናኝቷል", history: "አንድ የታካሚ ታሪክ", travel: "ለጉዞ ዝግጁ", built: "ለሙሉ የእንክብካቤ ጉዞ የተሰራ", careTitle: "ያነሰ መጠበቅ። የተሻለ ሪፈራል። የተገናኘ እንክብካቤ።", remoteTitle: "የርቀት ሪፈራል መዳረሻ", remoteText: "ታካሚዎች ረጅም ጉዞ ከማድረጋቸው በፊት ይገመገማሉ እና ቀጠሮ ይያዛል።", medicineTitle: "የመድሃኒት ማድረስ", medicineText: "ከተረጋገጡ ፋርማሲዎች መድሃኒት ያግኙ፣ ዋጋውን ያጽድቁ እና ማድረስ ይቀበሉ።", erpTitle: "ብሔራዊ የጤና ERP", erpText: "ከሀገር እና ክልል አስተዳደር እስከ የታካሚ እንክብካቤ ድረስ በሚና የተመራ ስራ።", networkTitle: "የተገናኘ የእንክብካቤ ኔትወርክ", networkText: "ከአንድ ሆስፒታል እስከ መላው ሀገር ለማደግ የተነደፈ።", regions: "ዝግጁ ክልሎች", capacity: "የተቋም አቅም", record: "የታካሚ የረጅም ጊዜ መዝገብ", footer: "አስተማማኝ፣ በሚና የተመራ የጤና ቅንጅት", authorizedAccess: "የተፈቀደ መዳረሻ", welcome: "እንኳን ደህና መጡ", signInCopy: "በሱፐር አስተዳዳሪ በተፈቀደ መለያ ይግቡ።", workEmail: "የስራ ኢሜይል", password: "የይለፍ ቃል", enterPassword: "የይለፍ ቃል ያስገቡ", secureSignIn: "በደህንነት ይግቡ", firstSetup: "የመጀመሪያ ማዋቀር፡ ሱፐር አስተዳዳሪ ይፍጠሩ", back: "ወደ ድረ-ገጹ ተመለስ", approved: "የተፈቀዱ አጋሮች", accessOrganization: "ድርጅትዎን ይድረሱ", partnerCopy: "በሱፐር አስተዳዳሪ የተፈጠሩ መለያዎች ብቻ መግባት ይችላሉ።" },
  om: { solutions: "Furmaata", network: "Neetworkii", partner: "Poortaalii michootaa", signIn: "Seensa hojjetaa", home: "Tajaajila fayyaa mana keessaa", followUp: "Hordoffii", dashboard: "Daashboordii", partners: "Bulchiinsa michootaa", applications: "Iyyata michootaa", approve: "Mirkaneessi", reject: "Kufaa godhi", language: "Afaan", online: "Dhaabbanni sarara irra jira", submit: "Iyyata ergi", review: "Qori", seats: "Teessoo fayyadamtootaa", admin: "Bulchaa michaa", connected: "SIRNA FAYYAA TOKKO WALQABATE", hero: "Kunuunsi fayyaa imala dhukkubsataa dura jalqaba.", heroText: "Ergaalee dabarsaa, seenaa dhukkubsataa, beellama, qorannoo, mana qorichaa fi hojii hospitaalaa Itoophiyaa keessatti galmee Faydaa tokkoon walqabsiisi.", accessStaff: "Poortaalii hojjetaa bani", authorized: "Hojjettoota fayyaa hayyamamaniif qofa", normal: "Neetworkiin sirriitti hojjechaa jira", live: "Jira", referralAccepted: "Ergaan dabarsaa fagoo fudhatameera", confirmed: "Mirkanaa'e", pharmacies: "Mana qorichaa 12", stock: "Kuusaa qorichaa barbaadi", fayda: "Faydaa waliin walqabate", history: "Seenaa dhukkubsataa tokko", travel: "Imalaaf qophaa'e", built: "IMALA KUNUUNSA FAYYAA GUUTUUF", careTitle: "Eegumsa xiqqaa. Ergaa dabarsaa nageenya qabu. Kunuunsa walqabate.", remoteTitle: "Darbarsa fagoo", remoteText: "Dhukkubsattoonni imala dheeraa dura ni qoratamu, beellamnis ni qabama.", medicineTitle: "Qoricha geessuu", medicineText: "Mana qorichaa mirkanaa'e irraa qoricha argadhu, gatii mirkaneessi, geejjiba fudhadhu.", erpTitle: "ERP fayyaa biyyaalessaa", erpText: "Bulchiinsa biyyaafi naannoo irraa hanga kunuunsa dhukkubsataatti hojii qooda irratti hundaa'e.", networkTitle: "NEETWORKII KUNUUNSA WALQABATE", networkText: "Hospitaala tokko irraa hanga biyya guutuutti guddachuuf qophaa'e.", regions: "Naannolee qophaa'an", capacity: "Dandeettii dhaabbataa", record: "Galmee fayyaa yeroo dheeraa", footer: "Qindoomina fayyaa nageenya qabu, qooda irratti hundaa'e", authorizedAccess: "SEENSA HAYYAMAME", welcome: "Baga nagaan dhuftan", signInCopy: "Herrega Super Adminiin kennameen seeni.", workEmail: "Imeelii hojii", password: "Jecha icciitii", enterPassword: "Jecha icciitii galchi", secureSignIn: "Nageenyaan seeni", firstSetup: "Qophii jalqabaa: Super Admin uumi", back: "Gara marsariitii deebi'i", approved: "MICHOOOTA MIRKANA'AN", accessOrganization: "Dhaabbata kee seeni", partnerCopy: "Herregawwan Super Adminiin uumaman qofa seenuu danda'u." },
}
function useLanguage() {
  const { language } = useContext(LanguageContext)
  return (key: string) => translations[language][key] || translations.en[key] || key
}
function translatedLabel(label: string, t: (key: string) => string) {
  const keys: Record<string, string> = { "Home healthcare": "home", "Follow-up": "followUp", "Partners management": "partners", "Partner applications": "applications", "Dashboard": "dashboard", "Approve": "approve", "Reject": "reject", "Review": "review", "User seats": "seats", "Partner admin": "admin" }
  return keys[label] ? t(keys[label]) : label
}
function LanguageSwitcher() {
  const { language, setLanguage } = useContext(LanguageContext)
  return <label className="language-switcher"><span>{translations[language].language}</span><select value={language} onChange={e => setLanguage(e.target.value as Language)}><option value="en">English</option><option value="am">አማርኛ</option><option value="om">Afaan Oromo</option></select></label>
}

function Icon({ name, size = 18 }: { name: IconName; size?: number }) {
  const paths: Record<IconName, React.ReactNode> = {
    grid: <><rect x="3" y="3" width="7" height="7" rx="2"/><rect x="14" y="3" width="7" height="7" rx="2"/><rect x="3" y="14" width="7" height="7" rx="2"/><rect x="14" y="14" width="7" height="7" rx="2"/></>,
    users: <><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"/></>,
    calendar: <><rect x="3" y="5" width="18" height="16" rx="2"/><path d="M16 3v4M8 3v4M3 11h18"/></>,
    pill: <><path d="m10.5 20.5 10-10a4.95 4.95 0 0 0-7-7l-10 10a4.95 4.95 0 0 0 7 7Z"/><path d="m8.5 8.5 7 7"/></>,
    flask: <><path d="M9 3h6M10 3v7.5L4.5 20a1 1 0 0 0 .9 1.5h13.2a1 1 0 0 0 .9-1.5L14 10.5V3"/><path d="M7.5 16h9"/></>,
    bike: <><circle cx="5.5" cy="17.5" r="3.5"/><circle cx="18.5" cy="17.5" r="3.5"/><path d="M15 6h3l-2 3h-5l3 8M9 17.5l-3-8h4l3 4"/></>,
    chart: <><path d="M4 19V9M10 19V5M16 19v-7M22 19H2"/></>,
    settings: <><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.7 1.7 0 0 0 .34 1.88l.06.06-2.83 2.83-.06-.06A1.7 1.7 0 0 0 15 19.4a1.7 1.7 0 0 0-1 .6 1.7 1.7 0 0 0-.4 1v.1h-4v-.1a1.7 1.7 0 0 0-1.1-1.6 1.7 1.7 0 0 0-1.88.34l-.06.06-2.83-2.83.06-.06A1.7 1.7 0 0 0 4.6 15a1.7 1.7 0 0 0-.6-1 1.7 1.7 0 0 0-1-.4h-.1v-4H3a1.7 1.7 0 0 0 1.6-1.1 1.7 1.7 0 0 0-.34-1.88l-.06-.06 2.83-2.83.06.06A1.7 1.7 0 0 0 9 4.6a1.7 1.7 0 0 0 1-.6 1.7 1.7 0 0 0 .4-1v-.1h4V3a1.7 1.7 0 0 0 1.1 1.6 1.7 1.7 0 0 0 1.88-.34l.06-.06 2.83 2.83-.06.06A1.7 1.7 0 0 0 19.4 9c.16.38.37.72.6 1 .27.32.62.4 1 .4h.1v4H21a1.7 1.7 0 0 0-1.6.6Z"/></>,
    search: <><circle cx="11" cy="11" r="7"/><path d="m20 20-4-4"/></>,
    bell: <><path d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9M10 21h4"/></>,
    plus: <path d="M12 5v14M5 12h14"/>,
    arrow: <><path d="M5 12h14M13 6l6 6-6 6"/></>,
  }
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">{paths[name]}</svg>
}

const queue = [
  { id: "TASH-4821", name: "Meseret Tadesse", type: "Referral", detail: "Cardiology · Oromia", time: "09:30", status: "Awaiting review", tone: "amber", initials: "MT" },
  { id: "MED-1093", name: "Abebe Girma", type: "Medication", detail: "Oncology ward · Bed 12", time: "10:05", status: "Courier assigned", tone: "blue", initials: "AG" },
  { id: "LAB-2384", name: "Hanna Kebede", type: "Diagnostic", detail: "ICL · Immunology panel", time: "10:20", status: "In transit", tone: "purple", initials: "HK" },
  { id: "TASH-4827", name: "Selamawit Berhanu", type: "Referral", detail: "Neurology · Amhara", time: "11:00", status: "Confirmed", tone: "green", initials: "SB" },
]

const departmentOptions = [
  "Hospital-wide",
  "Emergency & Critical Care",
  "Internal Medicine",
  "Surgery",
  "Pediatrics",
  "Oncology",
  "Cardiology",
  "Neurology",
  "Obstetrics & Gynecology",
  "Orthopedics",
  "Radiology",
  "Pathology & Laboratory",
  "Pharmacy",
  "Finance",
  "Reception & Records",
]

const roleOptions = [
  "Country Manager",
  "Region Manager",
  "Hospital Super Admin",
  "Hospital Manager",
  "Hospital Admin",
  "Department Manager",
  "Doctor Manager",
  "Nurse Manager",
  "Doctor",
  "Physician",
  "Nurse",
  "Receptionist",
  "Finance",
  "Pharmacy Super Admin",
  "Pharmacist",
  "Pharmacy Staff",
  "Courier Manager",
  "Courier",
  "Diagnostic Manager",
  "Laboratory Staff",
]

function Landing({ onLogin, onPartner }: { onLogin: () => void; onPartner: () => void }) {
  const t = useLanguage()
  return <div className="landing">
    <header className="landing-nav"><div className="brand landing-brand"><div className="brand-mark"><span></span><span></span></div><div><strong>MedLink</strong><small>Ethiopia Care ERP</small></div></div><nav><button onClick={() => document.getElementById("services")?.scrollIntoView({ behavior: "smooth" })}>{t("solutions")}</button><button onClick={() => document.getElementById("network")?.scrollIntoView({ behavior: "smooth" })}>{t("network")}</button><button onClick={onPartner}>{t("partner")}</button><LanguageSwitcher/><button onClick={onLogin} className="landing-login">{t("signIn")} <Icon name="arrow" size={16}/></button></nav></header>
    <main className="landing-main"><section className="landing-hero"><div><span className="landing-kicker">{t("connected")}</span><h1>{t("hero")}</h1><p>{t("heroText")}</p><div className="landing-actions"><button onClick={onLogin}>{t("accessStaff")} <Icon name="arrow"/></button><span>{t("authorized")}</span></div></div><div className="hero-visual"><div className="visual-top"><span><i></i> {t("normal")}</span><b>{t("live")}</b></div><div className="visual-patient"><span>MT</span><p><strong>{t("referralAccepted")}</strong><small>Cardiology · TASH · Oct 17, 09:30</small></p><b>{t("confirmed")}</b></div><div className="visual-route"><span>Oromia Health Center</span><i></i><i></i><i></i><span>Tikur Anbessa</span></div><div className="visual-cards"><div><Icon name="pill"/><strong>{t("pharmacies")}</strong><small>{t("stock")}</small></div><div><Icon name="users"/><strong>{t("fayda")}</strong><small>{t("history")}</small></div><div><Icon name="calendar"/><strong>{t("travel")}</strong><small>{t("confirmed")}</small></div></div></div></section>
    <section className="landing-services" id="services"><span>{t("built")}</span><h2>{t("careTitle")}</h2><div><article><Icon name="calendar"/><h3>{t("remoteTitle")}</h3><p>{t("remoteText")}</p></article><article><Icon name="pill"/><h3>{t("medicineTitle")}</h3><p>{t("medicineText")}</p></article><article><Icon name="grid"/><h3>{t("erpTitle")}</h3><p>{t("erpText")}</p></article></div></section>
    <section className="landing-network" id="network"><div><span>{t("networkTitle")}</span><h2>{t("networkText")}</h2></div><div><strong>14</strong><span>{t("regions")}</span></div><div><strong>86+</strong><span>{t("capacity")}</span></div><div><strong>1</strong><span>{t("record")}</span></div></section></main>
    <footer className="landing-footer"><strong>MedLink Ethiopia</strong><span>{t("footer")}</span></footer>
  </div>
}

type PartnerType = "Hospital" | "Pharmacy"

function PartnerAccess({ onBack, onEnter }: { onBack: () => void; onEnter: (type: PartnerType, organizationName: string) => void }) {
  const [mode, setMode] = useState<"login" | "apply">("login")
  const [type, setType] = useState<PartnerType>("Hospital")
  const [sent, setSent] = useState(false)
  const [error, setError] = useState("")
  const t = useLanguage()
  async function login(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const data = new FormData(e.currentTarget)
    const email = String(data.get("email")).toLowerCase()
    const password = String(data.get("password"))
    setError("")
    const { error: signInError } = await supabase.auth.signInWithPassword({ email, password })
    if (signInError) return setError("This partner account is not active or the credentials are incorrect.")
    try {
      const { profile } = await api("/me")
      if (profile.status !== "active") throw new Error("Inactive")
      const isPharmacy = String(profile.role).startsWith("pharmacy") || profile.role === "pharmacist"
      const isHospital = String(profile.role).startsWith("hospital") || ["department_manager","doctor_manager","nurse_manager","doctor","physician","nurse","receptionist","finance"].includes(profile.role)
      if (!isPharmacy && !isHospital) throw new Error("Not partner scoped")
      onEnter(isPharmacy ? "Pharmacy" : "Hospital", profile.organization?.name || profile.organization_name || (isPharmacy ? "Partner Pharmacy" : "Partner Hospital"))
    } catch {
      await supabase.auth.signOut()
      setError("This account does not have an active partner organization assignment.")
    }
  }
  return <div className="partner-access"><button className="back-button" onClick={onBack}>← {t("back")}</button><div className="partner-access-card">
    <div className="partner-intro"><div className="brand login-brand"><div className="brand-mark"><span></span><span></span></div><div><strong>MedLink Partner</strong><small>Connected provider network</small></div></div><span>PARTNER WITH US</span><h1>Extend care beyond your facility.</h1><p>Join the verified network connecting hospitals, health centers, pharmacies and patients across Ethiopia.</p><div><span><Icon name="users"/><b>Institution-managed teams</b></span><span><Icon name="pill"/><b>Live service coordination</b></span><span><Icon name="chart"/><b>Auditable performance</b></span></div></div>
    <div className="partner-form">
      <div className="access-tabs"><button className={mode==="login"?"active":""} onClick={()=>setMode("login")}>Partner sign in</button><button className={mode==="apply"?"active":""} onClick={()=>setMode("apply")}>Apply to partner</button></div>
      {mode === "login" ? <><div className="login-copy"><span>{t("approved")}</span><h2>{t("accessOrganization")}</h2><p>{t("partnerCopy")}</p></div><form onSubmit={login}><label>{t("workEmail")}<input name="email" type="email" required placeholder="admin@organization.et"/></label><label>{t("password")}<input name="password" type="password" required placeholder={t("enterPassword")}/></label>{error&&<div className="login-error">{error}</div>}<button className="login-submit">{t("signIn")} <Icon name="arrow"/></button></form></>
      : sent ? <div className="application-success"><span><Icon name="users"/></span><h2>Application received</h2><p>Reference: PART-2026-084. Our network team will verify licenses, ownership and service readiness before activating the organization.</p><button onClick={()=>setMode("login")}>Return to partner sign in</button></div>
      : <><div className="login-copy"><span>NEW ORGANIZATION</span><h2>Partner application</h2><p>Submit your institution for compliance and network review.</p></div><form onSubmit={async (e)=>{e.preventDefault(); const form = new FormData(e.currentTarget); try { await api("/partner-applications",{method:"POST",body:JSON.stringify({organizationName:form.get("organizationName"),organizationType:type,licenseNumber:form.get("licenseNumber"),regionId:form.get("regionId"),representativeName:form.get("representativeName"),representativeEmail:form.get("representativeEmail"),requestedSeats:form.get("requestedSeats")})}); setSent(true) } catch (applicationError) { setError(applicationError instanceof Error ? applicationError.message : "Unable to submit application") }}}><label>Organization type<select value={type} onChange={e=>setType(e.target.value as PartnerType)}><option>Hospital</option><option>Pharmacy</option></select></label><label>Legal organization name<input name="organizationName" required placeholder="Registered institution name"/></label><div className="form-row"><label>License number<input name="licenseNumber" required placeholder="EFDA / facility license"/></label><label>Region<select name="regionId"><option value="addis-ababa">Addis Ababa</option><option value="oromia">Oromia</option><option value="amhara">Amhara</option><option value="tigray">Tigray</option><option value="somali">Somali</option><option value="snnpr">SNNPR</option></select></label></div><label>Authorized representative<input name="representativeName" required placeholder="Full name and official position"/></label><label>Work email<input name="representativeEmail" required type="email" placeholder="admin@organization.et"/></label><label>{t("seats")}<input name="requestedSeats" type="number" min="1" max="10000" defaultValue="10" required/></label>{error&&<div className="login-error">{error}</div>}<button className="login-submit">{t("submit")} <Icon name="arrow"/></button></form></>}
    </div>
  </div></div>
}

function PartnerPortal({ type, organizationName, onLogout }: { type: PartnerType; organizationName: string; onLogout: () => void }) {
  const [active, setActive] = useState("Dashboard")
  const [notice, setNotice] = useState("")
  const isHospital = type === "Hospital"
  const t = useLanguage()
  const menus = isHospital ? ["Dashboard","Referrals","Patients","Appointments","Home healthcare","Follow-up","Departments","Staff & roles","Reports","Settings"] : ["Dashboard","Prescription requests","Inventory","Orders & delivery","Home healthcare","Follow-up","Payments","Staff","Reports","Settings"]
  const notify=(text:string)=>{setNotice(text);setTimeout(()=>setNotice(""),2200)}
  return <div className="partner-portal"><aside className="partner-sidebar"><div className="brand"><div className="brand-mark"><span></span><span></span></div><div><strong>MedLink Partner</strong><small>{type} workspace</small></div></div><div className="partner-org"><span>{isHospital?"TH":"HP"}</span><p><strong>{organizationName}</strong><small>{t("online")}</small></p></div><LanguageSwitcher/><nav>{menus.map(item=><button key={item} className={active===item?"active":""} onClick={()=>setActive(item)}><Icon name={item.includes("Staff")?"users":item.includes("Order")?"bike":item.includes("Prescription")?"pill":item==="Reports"?"chart":item==="Settings"?"settings":"grid"}/>{translatedLabel(item, t)}</button>)}</nav><button className="partner-logout" onClick={onLogout}>Log out <Icon name="arrow"/></button></aside><main className="partner-content"><header><div><span>{type.toUpperCase()} PARTNER PORTAL</span><h1>{translatedLabel(active, t)}</h1></div><button className="primary-button" onClick={()=>notify(isHospital?"New staff invitation started":"Inventory update started")}><Icon name="plus"/>{isHospital?"Invite staff":"Update stock"}</button></header>
    {active === "Dashboard" ? <><section className="partner-welcome"><div><h2>{isHospital?"Good morning, hospital team":"Good morning, pharmacy team"}</h2><p>{isHospital?"Coordinate referrals, departments and your institution’s workforce.":"Respond to prescription requests and keep medicine availability current."}</p></div><span><i></i> Organization online</span></section><section className="partner-metrics">{(isHospital?[["42","Active referrals"],["18","Appointments today"],["126","Active staff"],["8","Departments"]]:[["16","New requests"],["9","Awaiting approval"],["7","Deliveries today"],["92%","Fill rate"]]).map(x=><div key={x[1]}><strong>{x[0]}</strong><span>{x[1]}</span></div>)}</section><div className="partner-dashboard-grid"><section className="panel"><div className="panel-head"><div><h2>{isHospital?"Referral activity":"Prescription requests"}</h2><p>Requires action from your team</p></div><button onClick={()=>notify("Full queue opened")}>View all</button></div>{queue.slice(0,3).map((x,i)=><div className="partner-row" key={x.id}><span className="patient"><i>{x.initials}</i><span><strong>{x.name}</strong><small>{isHospital?x.detail:`${i+1} medicine items · ${x.id}`}</small></span></span><b className={`status ${x.tone}`}><i></i>{i?"In review":"New"}</b><button onClick={()=>notify(`${x.name}'s request opened`)}>Review</button></div>)}</section><section className="panel"><div className="panel-head"><div><h2>{isHospital?"Workforce overview":"Fulfillment performance"}</h2><p>{isHospital?"Accounts managed by your institution":"Last 30 days"}</p></div></div>{isHospital?<div className="workforce-list">{[["Hospital Super Admin","2"],["Hospital Managers","4"],["Doctors & Physicians","48"],["Nurses","63"],["Reception & Finance","9"]].map(x=><div key={x[0]}><span>{x[0]}</span><strong>{x[1]}</strong></div>)}</div>:<div className="fulfillment"><strong>486</strong><span>Orders fulfilled</span><div><i></i></div><p>Average confirmation <b>4m 12s</b></p><p>Average delivery <b>31 min</b></p></div>}</section></div></>
    : active === "Home healthcare" || active === "Follow-up" ? <HomeCareWorkspace mode={active === "Home healthcare" ? "home" : "followup"} action={notify}/> : active === "Staff" || active === "Staff & roles" ? <PartnerStaffWorkspace action={notify}/> : <section className="panel partner-module"><div className="panel-head"><div><h2>{active}</h2><p>{isHospital?"Managed within your hospital’s approved organizational scope.":"Managed within this licensed pharmacy’s partner account."}</p></div><button onClick={()=>notify(`New ${active.toLowerCase()} item started`)}><Icon name="plus"/> Add new</button></div><div className="partner-empty"><Icon name={active.includes("Staff")?"users":active.includes("Order")?"bike":"grid"} size={30}/><h2>{active} workspace</h2><p>This role-aware workspace is ready for the organization’s approved administrators and assigned staff.</p><button onClick={()=>notify(`${active} records loaded`)}>Load records</button></div></section>}
  </main>{notice&&<div className="toast"><i></i>{notice}</div>}</div>
}

function HomeCareWorkspace({ mode, action }: { mode: "home" | "followup"; action: (message: string) => void }) {
  const [items, setItems] = useState<any[]>([])
  const [loaded, setLoaded] = useState(false)
  const endpoint = mode === "home" ? "/home-care" : "/follow-ups"
  useEffect(() => { api(endpoint).then(data => { setItems(mode === "home" ? data.requests || [] : data.tasks || []); setLoaded(true) }).catch(() => setLoaded(true)) }, [endpoint, mode])
  return <section className="panel partner-module"><div className="panel-head"><div><h2>{mode === "home" ? "Home healthcare requests" : "Follow-up queue"}</h2><p>{mode === "home" ? "Schedule safe, assigned care in the patient’s home." : "Track reminders, outreach and post-care continuity."}</p></div><button onClick={() => action(mode === "home" ? "Home-care request form opened" : "Follow-up task form opened")}><Icon name="plus"/> Add new</button></div><div className="service-summary"><strong>{items.length || (loaded ? 0 : "—")}</strong><span>{mode === "home" ? "Requests in your organization" : "Open follow-up tasks"}</span></div>{items.length ? items.slice(0, 6).map(item => <div className="partner-row" key={item.id}><span><strong>{item.patients?.full_name || "Unlinked patient"}</strong><small>{mode === "home" ? item.address : new Date(item.due_at).toLocaleString()}</small></span><b className="status blue"><i></i>{item.status}</b><button onClick={() => action("Service record opened")}>Review</button></div>) : <div className="partner-empty"><Icon name={mode === "home" ? "users" : "calendar"} size={30}/><h2>{mode === "home" ? "No home-care requests yet" : "No follow-ups due"}</h2><p>Use Add new to start managing this service.</p></div>}</section>
}

function PartnerStaffWorkspace({ action }: { action: (message: string) => void }) {
  const [profile, setProfile] = useState<any>(null)
  const [created, setCreated] = useState(false)
  useEffect(() => { api("/me").then(data => setProfile(data.profile)).catch(error => action(error instanceof Error ? error.message : "Unable to load organization access")) }, [])
  return <section className="panel partner-module"><div className="panel-head"><div><h2>Staff & roles</h2><p>Invite users within your approved organization seat limit.</p></div><span className="secure-pill">Organization admin</span></div><form className="workflow-form" onSubmit={async e => { e.preventDefault(); const form = new FormData(e.currentTarget); try { await api("/users",{method:"POST",body:JSON.stringify({fullName:form.get("fullName"),email:form.get("email"),username:form.get("username"),password:form.get("password"),employeeNumber:form.get("employeeNumber"),organizationId:profile.organization_id,role:String(form.get("role")),isPartnerAdmin:false})}); setCreated(true); action("Partner user created successfully"); e.currentTarget.reset() } catch(error) { action(error instanceof Error ? error.message : "Unable to create partner user") } }}><div className="form-row"><label>Full name<input name="fullName" required placeholder="Staff member name"/></label><label>Work email<input name="email" type="email" required placeholder="name@organization.et"/></label></div><div className="form-row"><label>Username<input name="username" required placeholder="staff.username"/></label><label>Employee number<input name="employeeNumber" required placeholder="ORG-001"/></label></div><div className="form-row"><label>Temporary password<input name="password" type="password" minLength={10} required placeholder="Minimum 10 characters"/></label><label>Access role<select name="role" defaultValue="receptionist"><option value="hospital_admin">Hospital Admin</option><option value="department_manager">Department Manager</option><option value="doctor">Doctor</option><option value="nurse">Nurse</option><option value="receptionist">Receptionist</option><option value="pharmacist">Pharmacist</option><option value="pharmacy_staff">Pharmacy Staff</option></select></label></div><button className="form-submit"><Icon name="plus"/> Create organization user</button>{created&&<div className="success-message"><strong>User created</strong><span>The user can now sign in through the partner portal.</span></div>}</form></section>
}

type StaffAccessPlan = { type: string; access: string; role: string }

function StaffAccessPlanner({ onChange }: { onChange: (plan: StaffAccessPlan[]) => void }) {
  const [count, setCount] = useState(3)
  const [plan, setPlan] = useState<StaffAccessPlan[]>([
    { type: "Clinical", access: "Department", role: "doctor" },
    { type: "Nursing", access: "Department", role: "nurse" },
    { type: "Front desk", access: "Organization", role: "receptionist" },
  ])
  function updateCount(value: number) {
    const nextCount = Math.max(1, Math.min(100, value || 1))
    const next = Array.from({ length: nextCount }, (_, index) => plan[index] || { type: "Clinical", access: "Department", role: "doctor" })
    setCount(nextCount)
    setPlan(next)
    onChange(next)
  }
  function updateRow(index: number, field: keyof StaffAccessPlan, value: string) {
    const next = plan.map((item, itemIndex) => itemIndex === index ? { ...item, [field]: value } : item)
    setPlan(next)
    onChange(next)
  }
  return <section className="staff-access-planner">
    <div className="staff-planner-heading"><div><span className="eyebrow">ACCESS PLAN</span><h3>How many staff need access?</h3><p>Define the first access groups now. You can invite named staff after the organization is active.</p></div><label className="staff-count-field">Staff needing access<input type="number" min="1" max="100" value={count} onChange={e => updateCount(Number(e.target.value))}/><small>of the partner seat allowance</small></label></div>
    <div className="staff-plan-header"><span>Staff type</span><span>Access scope</span><span>System role</span><span></span></div>
    <div className="staff-plan-rows">{plan.map((item, index) => <div className="staff-plan-row" key={index}>
      <label><span className="mobile-field-label">Staff type</span><select value={item.type} onChange={e => updateRow(index, "type", e.target.value)}><option>Clinical</option><option>Nursing</option><option>Front desk</option><option>Finance</option><option>Pharmacy</option><option>Laboratory</option><option>Logistics</option></select></label>
      <label><span className="mobile-field-label">Access scope</span><select value={item.access} onChange={e => updateRow(index, "access", e.target.value)}><option>Organization</option><option>Department</option><option>Assigned patients</option><option>Reports only</option><option>Inventory</option><option>Dispatch</option></select></label>
      <label><span className="mobile-field-label">System role</span><select value={item.role} onChange={e => updateRow(index, "role", e.target.value)}><option value="hospital_admin">Hospital Admin</option><option value="department_manager">Department Manager</option><option value="doctor">Doctor</option><option value="nurse">Nurse</option><option value="receptionist">Receptionist</option><option value="finance">Finance</option><option value="pharmacist">Pharmacist</option><option value="laboratory_staff">Laboratory Staff</option><option value="courier">Courier</option></select></label>
      <button type="button" className="remove-staff-row" aria-label={`Remove staff access row ${index + 1}`} disabled={plan.length === 1} onClick={() => updateCount(plan.length - 1)}>×</button>
    </div>)}</div>
    <button type="button" className="add-staff-row" onClick={() => updateCount(count + 1)} disabled={count >= 100}><Icon name="plus" size={14}/> Add access group</button>
  </section>
}

function PartnerManagement({ action }: { action: (message: string) => void }) {
  const [applications, setApplications] = useState<any[]>([])
  const [seatLimit, setSeatLimit] = useState("10")
  const [staffPlan, setStaffPlan] = useState<StaffAccessPlan[]>([
    { type: "Clinical", access: "Department", role: "doctor" },
    { type: "Nursing", access: "Department", role: "nurse" },
    { type: "Front desk", access: "Organization", role: "receptionist" },
  ])
  const [showCreate, setShowCreate] = useState(false)
  const [created, setCreated] = useState(false)
  const t = useLanguage()
  useEffect(() => { api("/partner-applications").then(data => setApplications(data.applications || [])).catch(error => action(error instanceof Error ? error.message : "Unable to load applications")) }, [])
  async function review(id: string, status: "approved" | "rejected") {
    try { await api(`/partner-applications/${id}`, { method: "PUT", body: JSON.stringify({ status, seatLimit: Number(seatLimit) }) }); setApplications(items => items.map(item => item.id === id ? { ...item, status } : item)); action(status === "approved" ? "Partner approved and organization activated" : "Partner application rejected") } catch (error) { action(error instanceof Error ? error.message : "Partner review failed") }
  }
  return <div className="module-page"><section className="welcome module-welcome"><div><p>SUPER ADMIN CONSOLE</p><h1>Partners management</h1><span>Review direct applications, create verified partners and control partner access.</span></div><div className="welcome-actions"><button className="primary-button" onClick={() => { setShowCreate(!showCreate); setCreated(false) }}><Icon name="plus"/> Create partner</button><span className="owner-badge">Owner · Super Admin</span></div></section>{showCreate && <form className="panel partner-create-form" onSubmit={async e => { e.preventDefault(); const form = new FormData(e.currentTarget); try { await api("/partners", { method: "POST", body: JSON.stringify({ organizationName: form.get("organizationName"), organizationType: form.get("organizationType"), licenseNumber: form.get("licenseNumber"), regionId: form.get("regionId"), seatLimit: form.get("seatLimit"), staffPlan, adminFullName: form.get("adminFullName"), adminEmail: form.get("adminEmail"), adminUsername: form.get("adminUsername"), adminPassword: form.get("adminPassword"), employeeNumber: form.get("employeeNumber"), adminRole: form.get("adminRole") }) }); setCreated(true); action("Partner organization and administrator created"); e.currentTarget.reset() } catch (error) { action(error instanceof Error ? error.message : "Partner creation failed") } }}><div className="partner-create-hero"><div><span className="eyebrow">SECURE PARTNER ONBOARDING</span><h2>Create a verified care partner</h2><p>Set up the organization, owner account and staff access plan in one guided workflow.</p></div><div className="partner-create-steps"><span className="active">01 <small>Organization</small></span><i></i><span>02 <small>Access plan</small></span><i></i><span>03 <small>Administrator</small></span></div></div><div className="panel-head"><div><h2>Organization details</h2><p>Verified identity and capacity for the new partner.</p></div><span className="secure-pill">Verified by Super Admin</span></div><div className="org-details-grid"><label className="org-field"><span>Organization name</span><input name="organizationName" required placeholder="Registered hospital or pharmacy"/></label><label className="org-field"><span>Organization type</span><select name="organizationType"><option value="hospital">Hospital</option><option value="pharmacy">Pharmacy</option><option value="health_center">Health center</option><option value="diagnostic_center">Diagnostic center</option></select></label><label className="org-field"><span>License number</span><input name="licenseNumber" required placeholder="Facility or EFDA license"/></label><label className="org-field"><span>Region</span><select name="regionId"><option value="addis-ababa">Addis Ababa</option><option value="oromia">Oromia</option><option value="amhara">Amhara</option><option value="tigray">Tigray</option><option value="somali">Somali</option><option value="snnpr">SNNPR</option></select></label></div><div className="org-capacity-card"><label className="org-field"><span>User seats</span><input name="seatLimit" type="number" min="1" max="10000" defaultValue="10" required/></label><small>This sets the initial access capacity for this partner organization.</small></div><StaffAccessPlanner onChange={setStaffPlan}/><div className="partner-form-divider">Partner administrator</div><div className="form-row"><label>Full name<input name="adminFullName" required placeholder="Administrator full name"/></label><label>Work email<input name="adminEmail" type="email" required placeholder="admin@organization.et"/></label></div><div className="form-row"><label>Username<input name="adminUsername" required placeholder="organization.admin"/></label><label>Employee number<input name="employeeNumber" required placeholder="ORG-ADMIN-001"/></label></div><div className="form-row"><label>Temporary password<input name="adminPassword" type="password" minLength={10} required placeholder="Minimum 10 characters"/></label><label>Admin role<select name="adminRole"><option value="hospital_super_admin">Hospital Super Admin</option><option value="hospital_manager">Hospital Manager</option><option value="pharmacy_super_admin">Pharmacy Super Admin</option><option value="diagnostic_manager">Diagnostic Manager</option></select></label></div><button className="form-submit"><Icon name="plus"/> Create partner and grant access</button>{created&&<div className="success-message"><strong>Partner created successfully</strong><span>The organization is active and its administrator can sign in immediately.</span></div>}</form>}<section className="access-stats"><div><strong>{applications.filter(item => item.status === "pending").length}</strong><span>Pending applications</span></div><div><strong>{applications.filter(item => item.status === "approved").length}</strong><span>Approved partners</span></div><div><strong>{applications.reduce((sum, item) => sum + (Number(item.requested_seats) || 0), 0)}</strong><span>Requested user seats</span></div></section><div className="panel account-list"><div className="panel-head"><div><h2>Partner applications</h2><p>Approve access only after license and representative verification.</p></div><label>{t("seats")}<input className="seat-input" type="number" min="1" value={seatLimit} onChange={e => setSeatLimit(e.target.value)}/></label></div>{applications.length ? applications.map(item => <div key={item.id}><span className="patient"><i>{String(item.organization_name).slice(0, 2).toUpperCase()}</i><span><strong>{item.organization_name}</strong><small>{item.organization_type} · {item.representative_name} · {item.license_number}</small></span></span><b className={`status ${item.status === "pending" ? "amber" : item.status === "approved" ? "green" : "blue"}`}><i></i>{item.status}</b>{item.status === "pending" ? <span className="partner-review-actions"><button onClick={() => review(item.id, "approved")}>{t("approve")}</button><button onClick={() => review(item.id, "rejected")}>{t("reject")}</button></span> : <span></span>}</div>) : <div className="partner-empty"><Icon name="users"/><h2>No applications yet</h2><p>Direct partner applications will appear here.</p></div>}</div></div>
}

function Bootstrap({ onComplete, onBack }: { onComplete: (email: string) => void; onBack: () => void }) {
  const [error, setError] = useState("")
  const [message, setMessage] = useState("")
  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError("")
    setMessage("")
    const form = new FormData(e.currentTarget)
    const body = {
      email: String(form.get("email")).trim().toLowerCase(),
      password: String(form.get("password")),
      username: String(form.get("username")).trim(),
      fullName: String(form.get("fullName")).trim(),
      employeeNumber: String(form.get("employeeNumber")).trim(),
    }
    try {
      const response = await fetch(`${serverUrl}/bootstrap`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Bootstrap-Secret": String(form.get("bootstrapSecret")),
        },
        body: JSON.stringify(body),
      })
      const data = await response.json()
      if (!response.ok) throw new Error(data.error || "Bootstrap failed")
      setMessage("Super Admin account created. You can now sign in.")
      window.setTimeout(() => onComplete(body.email), 900)
    } catch (bootstrapError) {
      setError(bootstrapError instanceof TypeError ? "The MedLink server function is not deployed to this Supabase project yet. Deploy the server function, then try again." : bootstrapError instanceof Error ? bootstrapError.message : "Unable to create the Super Admin account.")
    }
  }
  return <div className="login-page"><button className="back-button" onClick={onBack}>← Back to website</button><div className="login-card"><div className="brand login-brand"><div className="brand-mark"><span></span><span></span></div><div><strong>MedLink</strong><small>First-time setup</small></div></div><div className="login-copy"><span>ONE-TIME SETUP</span><h1>Create Super Admin</h1><p>Use the bootstrap secret configured on the MedLink server. This setup is available only before the first profile is created.</p></div><form onSubmit={submit}><label>Super Admin email<input name="email" type="email" required placeholder="owner@medlink.et"/></label><label>Full name<input name="fullName" required placeholder="Full name"/></label><label>Username<input name="username" required placeholder="owner"/></label><label>Employee number<input name="employeeNumber" required placeholder="EMP-001"/></label><label>Password<input name="password" type="password" minLength={8} required placeholder="At least 8 characters"/></label><label>Bootstrap secret<input name="bootstrapSecret" type="password" required placeholder="Configured server secret"/></label>{error && <div className="login-error">{error}</div>}{message && <div className="login-success">{message}</div>}<button className="login-submit">Create securely <Icon name="arrow"/></button></form></div></div>
}

function Login({ onSuccess, onBack, onBootstrap }: { onSuccess: (profile: any) => void; onBack: () => void; onBootstrap: () => void }) {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const t = useLanguage()
  async function submit(e: React.FormEvent) {
    e.preventDefault()
    setError("")
    const normalizedEmail = email.trim().toLowerCase()
    const { error: signInError } = await supabase.auth.signInWithPassword({ email: normalizedEmail, password })
    if (signInError) {
      if (signInError.status === 400) {
        return setError("Supabase rejected these credentials. Verify the email and password, or bootstrap the first Super Admin account.")
      }
      return setError("Unable to sign in right now. Please try again.")
    }
    try {
      const { profile } = await api("/me")
      if (profile.status !== "active") throw new Error("Inactive")
      onSuccess(profile)
    } catch (requestError) {
      await supabase.auth.signOut()
      const status = requestError instanceof Error && "status" in requestError ? requestError.status : undefined
      setError(status === 404 ? "The deployed MedLink server is outdated and does not include this route. Redeploy make-server-2f11454b from the current project source, then try again." : requestError instanceof Error && requestError.message === "Inactive" ? "Your profile exists but is not active. Set profiles.status to active in Supabase." : "Your account has no active access profile. Contact the platform Super Admin.")
    }
  }
  return <div className="login-page"><button className="back-button" onClick={onBack}>← {t("back")}</button><div className="login-card"><div className="brand login-brand"><div className="brand-mark"><span></span><span></span></div><div><strong>MedLink</strong><small>{t("signIn")}</small></div></div><div className="login-copy"><span>{t("authorizedAccess")}</span><h1>{t("welcome")}</h1><p>{t("signInCopy")}</p></div><form onSubmit={submit}><label>{t("workEmail")}<input type="email" required value={email} onChange={e => setEmail(e.target.value)} placeholder="name@hospital.et"/></label><label>{t("password")}<input type="password" required value={password} onChange={e => setPassword(e.target.value)} placeholder={t("enterPassword")}/></label>{error && <div className="login-error">{error}</div>}<button className="login-submit">{t("secureSignIn")} <Icon name="arrow"/></button></form><button className="text-button" onClick={onBootstrap}>{t("firstSetup")}</button><div className="login-security"><Icon name="settings"/><span><strong>MedLink</strong><small>{t("partnerCopy")}</small></span></div></div></div>
}

function PatientPortal({ profile, onLogout }: { profile: any; onLogout: () => void }) {
  const [data, setData] = useState<any>(null)
  const [tab, setTab] = useState("My progress")
  const [message, setMessage] = useState("")
  useEffect(() => { api("/patient/portal").then(setData).catch(error => setMessage(error.message)) }, [])
  async function apply(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const form = new FormData(e.currentTarget)
    try {
      await api("/patient/consultations", { method: "POST", body: JSON.stringify({ specialty: form.get("specialty"), reason: form.get("reason"), channel: form.get("channel") }) })
      setMessage("Your consultation application was submitted successfully.")
      e.currentTarget.reset()
    } catch (error) { setMessage(error instanceof Error ? error.message : "Unable to submit application") }
  }
  const referral = data?.referrals?.[0]
  const appointment = data?.appointments?.[0]
  return <div className="patient-portal"><header><div className="brand landing-brand"><div className="brand-mark"><span></span><span></span></div><div><strong>MedLink Patient</strong><small>Your care journey</small></div></div><div><span>Signed in as <strong>{profile.full_name || profile.username}</strong></span><button onClick={onLogout}>Log out</button></div></header><div className="patient-layout"><aside><div className="patient-id"><span>{String(profile.full_name || "Patient").split(" ").map((x:string)=>x[0]).join("").slice(0,2)}</span><p><strong>{profile.full_name}</strong><small>Verified patient account</small></p></div>{["My progress","Schedule","Consultation","Notifications"].map(item=><button key={item} className={tab===item?"active":""} onClick={()=>setTab(item)}><Icon name={item==="Schedule"?"calendar":item==="Consultation"?"users":item==="Notifications"?"bell":"chart"}/>{item}</button>)}</aside><main>
    <div className="patient-heading"><span>PATIENT PORTAL</span><h1>{tab}</h1><p>Only your verified health-service application information is shown here.</p></div>
    {message&&<div className="patient-message">{message}</div>}
    {tab==="My progress"&&<><section className="patient-summary"><div><span>Application</span><strong>{referral?.id?.slice(0,8).toUpperCase() || "No active referral"}</strong></div><div><span>Current status</span><strong>{referral?.status?.replaceAll("_"," ") || "Not submitted"}</strong></div><div><span>Specialty</span><strong>{referral?.specialty || "—"}</strong></div></section><section className="panel patient-progress"><div className="panel-head"><div><h2>Your referral progress</h2><p>Updates verified by your care coordination team</p></div></div>{["Submitted","Verification","Clinical triage","Appointment scheduled","Consultation","Outcome"].map((step,i)=><div key={step} className={i<3?"complete":i===3?"current":""}><i></i><p><strong>{step}</strong><small>{i<3?"Completed":i===3?"Current step":"Pending"}</small></p></div>)}</section></>}
    {tab==="Schedule"&&<section className="panel patient-appointment"><div className="panel-head"><div><h2>Upcoming schedule</h2><p>Your confirmed visits and preparation instructions</p></div></div>{appointment?<div><span className="date-box"><strong>{new Date(appointment.starts_at).getDate()}</strong><small>{new Date(appointment.starts_at).toLocaleString("en",{month:"short"})}</small></span><p><strong>{appointment.departments?.name || "Hospital appointment"}</strong><span>{appointment.organizations?.name}</span><small>{new Date(appointment.starts_at).toLocaleString()}</small></p><b>{appointment.status}</b></div>:<div className="empty-note">No upcoming appointment has been confirmed yet. You will receive SMS and email when scheduling is complete.</div>}</section>}
    {tab==="Consultation"&&<form className="panel workflow-form patient-consult" onSubmit={apply}><div className="panel-head"><div><h2>Apply for consultation</h2><p>Your request will be reviewed before an appointment is offered.</p></div></div><label>Specialty<select name="specialty" required><option value="">Choose specialty</option><option>Cardiology</option><option>Oncology</option><option>Neurology</option><option>Pediatrics</option><option>Surgery</option></select></label><label>Reason for consultation<textarea name="reason" required placeholder="Describe your concern and what support you need."/></label><label>Preferred consultation type<select name="channel"><option value="in_person">In-person</option><option value="phone">Phone</option><option value="video">Video</option></select></label><button className="form-submit">Submit consultation application <Icon name="arrow"/></button></form>}
    {tab==="Notifications"&&<section className="panel notification-settings"><div className="panel-head"><div><h2>Notification preferences</h2><p>Choose how to receive referral and appointment updates.</p></div></div>{[["Email notifications","Appointment confirmations and progress updates"],["SMS notifications","Time-sensitive reminders on your mobile"],["Appointment reminders","Messages before scheduled visits"],["Referral updates","Notifications when your application changes"]].map((x,i)=><label key={x[0]}><span><strong>{x[0]}</strong><small>{x[1]}</small></span><input type="checkbox" defaultChecked onChange={async e=>{await api("/patient/notifications",{method:"PUT",body:JSON.stringify({[["email_enabled","sms_enabled","appointment_reminders","referral_updates"][i]]:e.target.checked})});setMessage("Notification preference saved.")}}/></label>)}</section>}
  </main></div></div>
}

const dashboardByRole: Record<string, { icon: IconName; title: string; subtitle: string; stats: [string, string, string][]; actions: string[] }> = {
  super_admin: { icon: "settings", title: "Executive & platform dashboard", subtitle: "National capacity, partner onboarding, access control and system health.", stats: [["86", "Connected facilities", "Across 14 regions"], ["1,284", "Active accounts", "Role access monitored"], ["7", "Pending approvals", "Partner reviews"], ["94.2%", "Network SLA", "Above target"]], actions: ["Review partner applications", "Audit access changes"] },
  country_manager: { icon: "chart", title: "Country health operations dashboard", subtitle: "Regional performance, referral movement and facility capacity across Ethiopia.", stats: [["14", "Regions ready", "National coverage"], ["186", "Open referrals", "Across facilities"], ["86+", "Facilities", "Connected network"], ["92%", "Referral SLA", "This month"]], actions: ["Compare regions", "Export national report"] },
  region_manager: { icon: "chart", title: "Regional operations dashboard", subtitle: "Monitor hospitals, service demand and referral turnaround in your region.", stats: [["18", "Facilities", "In this region"], ["42", "Open referrals", "Needs coordination"], ["76%", "Bed capacity", "Current utilization"], ["3.8h", "Avg. turnaround", "Down 24 min"]], actions: ["Review facility queue", "Open regional report"] },
  hospital_super_admin: { icon: "grid", title: "Hospital executive dashboard", subtitle: "Hospital-wide performance, staffing, beds, revenue and safety alerts.", stats: [["1,842", "Patients this month", "↑ 12%"], ["76%", "Bed occupancy", "4 beds available"], ["42", "Active staff", "3 shifts today"], ["ETB 2.4m", "Collected", "This month"]], actions: ["Review bed capacity", "Open finance report"] },
  hospital_manager: { icon: "grid", title: "Hospital management dashboard", subtitle: "Coordinate departments, staffing, patient flow and operational performance.", stats: [["148", "Patients supported", "↑ 12% today"], ["36", "Appointments", "29 confirmed"], ["24", "Open care cases", "4 resolved this hour"], ["94.2%", "SLA compliance", "Above target"]], actions: ["Review service queue", "Compare departments"] },
  hospital_admin: { icon: "calendar", title: "Registration & appointments dashboard", subtitle: "Keep arrivals, patient registration, queues and referrals moving safely.", stats: [["64", "Arrivals today", "18 waiting"], ["36", "Appointments", "29 confirmed"], ["12", "New registrations", "Fayda matched"], ["8 min", "Avg. wait", "Down 3 min"]], actions: ["Register patient", "Manage queue"] },
  department_manager: { icon: "users", title: "Department operations dashboard", subtitle: "Manage your team workload, patient flow, escalations and handovers.", stats: [["28", "Assigned patients", "6 new today"], ["9", "Open tasks", "2 urgent"], ["94%", "Care completion", "This shift"], ["12 min", "Avg. response", "Within target"]], actions: ["Assign work", "Review handovers"] },
  doctor_manager: { icon: "users", title: "Clinical leadership dashboard", subtitle: "Oversee consultations, diagnoses, clinical referrals and clinician workload.", stats: [["42", "Patients reviewed", "This week"], ["18", "Referrals", "6 awaiting triage"], ["96%", "Notes completed", "Within 24 hours"], ["14", "Clinicians", "On duty today"]], actions: ["Triage referrals", "Review clinical reports"] },
  doctor: { icon: "users", title: "Clinician dashboard", subtitle: "Focus on assigned patients, consultations, diagnoses and safe prescribing.", stats: [["12", "Assigned patients", "4 appointments"], ["6", "Open consultations", "2 urgent"], ["8", "Results to review", "3 critical"], ["4", "Follow-ups due", "Today"]], actions: ["Open patient list", "Review results"] },
  physician: { icon: "users", title: "Physician dashboard", subtitle: "Review patient history, clinical notes, diagnostics and treatment plans.", stats: [["12", "Assigned patients", "4 appointments"], ["6", "Open consultations", "2 urgent"], ["8", "Results to review", "3 critical"], ["4", "Follow-ups due", "Today"]], actions: ["Open patient list", "Review results"] },
  nurse_manager: { icon: "users", title: "Nursing & inpatient dashboard", subtitle: "Track observations, medication rounds, handovers and patient escalation.", stats: [["32", "Patients on wards", "5 high acuity"], ["18", "Medication rounds", "Next in 40 min"], ["7", "Open handovers", "2 overdue"], ["98%", "Observation coverage", "This shift"]], actions: ["Open ward board", "Review escalations"] },
  nurse: { icon: "users", title: "Nursing care dashboard", subtitle: "Prioritize observations, medication administration and bedside care tasks.", stats: [["8", "Assigned patients", "2 high acuity"], ["12", "Care tasks", "3 due now"], ["4", "Medication rounds", "Next in 40 min"], ["0", "Critical alerts", "All clear"]], actions: ["Record observations", "Start handover"] },
  receptionist: { icon: "calendar", title: "Reception & patient services dashboard", subtitle: "Register patients, verify identity, manage arrivals and coordinate appointments.", stats: [["64", "Arrivals today", "18 waiting"], ["12", "New registrations", "Fayda matched"], ["36", "Appointments", "29 confirmed"], ["8 min", "Avg. wait", "Down 3 min"]], actions: ["Register patient", "Open appointment queue"] },
  finance: { icon: "chart", title: "Billing & finance dashboard", subtitle: "Monitor collections, outstanding balances, claims and service revenue.", stats: [["ETB 2.4m", "Collected", "This month"], ["ETB 184k", "Outstanding", "↓ 8%"], ["96%", "Claims accepted", "This cycle"], ["ETB 84k", "Today", "Across services"]], actions: ["Reconcile today", "Review outstanding"] },
  pharmacy_super_admin: { icon: "pill", title: "Pharmacy operations dashboard", subtitle: "Manage dispensing, inventory, expiry risk, orders and pharmacy staff.", stats: [["1,284", "Orders this month", "↑ 8%"], ["86%", "Fill rate", "12 pharmacies"], ["24", "Low-stock items", "8 urgent"], ["4", "Expiring batches", "Within 30 days"]], actions: ["Review inventory", "Manage pharmacy staff"] },
  pharmacist: { icon: "pill", title: "Pharmacy dispensing dashboard", subtitle: "Verify prescriptions, check interactions and prepare safe medication orders.", stats: [["18", "Orders to verify", "5 urgent"], ["42", "Ready to dispense", "Today"], ["96%", "Stock availability", "Current"], ["3", "Interaction alerts", "Review now"]], actions: ["Verify prescriptions", "Check inventory"] },
  pharmacy_staff: { icon: "pill", title: "Pharmacy inventory dashboard", subtitle: "Track stock, batches, expiry dates and assigned medication orders.", stats: [["18", "Orders assigned", "6 preparing"], ["96%", "Stock availability", "Current"], ["24", "Low-stock items", "8 urgent"], ["12", "Deliveries", "In progress"]], actions: ["Update stock", "Open assigned orders"] },
  courier_manager: { icon: "bike", title: "Diagnostics & delivery logistics dashboard", subtitle: "Coordinate routes, couriers, sample custody and medication handoffs.", stats: [["12", "Active deliveries", "8 medication · 4 lab"], ["5", "Riders on duty", "3 available"], ["94%", "On-time delivery", "This week"], ["31 min", "Avg. delivery", "Down 6 min"]], actions: ["Dispatch route", "Review delivery exceptions"] },
  courier: { icon: "bike", title: "Courier delivery dashboard", subtitle: "Follow assigned routes and record secure pickup, transit and handover.", stats: [["4", "Assigned deliveries", "2 medication"], ["3", "Stops remaining", "Next: TASH"], ["31 min", "Avg. delivery", "Today"], ["100%", "Handover captured", "This shift"]], actions: ["Open route", "Record handover"] },
  diagnostic_manager: { icon: "flask", title: "Laboratory & imaging dashboard", subtitle: "Manage orders, specimens, results, turnaround and diagnostic capacity.", stats: [["18", "Samples in transit", "6 priority"], ["42", "Tests processing", "12 ready"], ["3.8h", "Avg. turnaround", "Down 24 min"], ["96%", "QC pass rate", "This month"]], actions: ["Review worklist", "Open turnaround report"] },
  laboratory_staff: { icon: "flask", title: "Laboratory worklist dashboard", subtitle: "Track specimen collection, processing, quality control and result entry.", stats: [["18", "Assigned samples", "4 priority"], ["12", "Results ready", "2 critical"], ["3.8h", "Avg. turnaround", "Within target"], ["100%", "Chain of custody", "Today"]], actions: ["Open sample worklist", "Enter result"] },
}

function RoleDashboard({ profile, action }: { profile: any; action: (message: string) => void }) {
  const dashboard = dashboardByRole[profile?.role] || dashboardByRole.hospital_manager
  const roleLabel = String(profile?.role || "staff").replaceAll("_", " ")
  return <section className="role-dashboard">
    <div className="role-dashboard-intro"><div className="role-dashboard-icon"><Icon name={dashboard.icon}/></div><div><span>ROLE-BASED WORKSPACE · {roleLabel.toUpperCase()}</span><h2>{dashboard.title}</h2><p>{dashboard.subtitle}</p></div><div className="role-dashboard-actions">{dashboard.actions.map(label => <button key={label} onClick={() => action(`${label} opened`)}>{label}<Icon name="arrow" size={14}/></button>)}</div></div>
    <div className="role-dashboard-stats">{dashboard.stats.map(([value, label, detail]) => <div key={label}><strong>{value}</strong><span>{label}</span><small>{detail}</small></div>)}</div>
  </section>
}

function Workspace({ active, action, department, role, setDepartment, setRole }: { active: string; action: (message: string) => void; department: string; role: string; setDepartment: (value: string) => void; setRole: (value: string) => void }) {
  const [submitted, setSubmitted] = useState(false)
  const [selectedRole, setSelectedRole] = useState("Doctor")
  const content: Record<string, { icon: IconName; title: string; subtitle: string; stat: string; label: string }> = {
    Patients: { icon: "users", title: "National patient registry", subtitle: "One longitudinal record linked to Fayda identity across the care network.", stat: "24,892", label: "Verified patient records" },
    Appointments: { icon: "calendar", title: "Referral & appointment coordination", subtitle: "Review remote referrals before patients travel to Addis Ababa.", stat: "186", label: "Referrals awaiting review" },
    Diagnostics: { icon: "flask", title: "External diagnostic logistics", subtitle: "Secure sample custody, partner-lab capacity and verified result return.", stat: "18", label: "Samples in transit" },
    "Fleet & dispatch": { icon: "bike", title: "Fleet & dispatch control", subtitle: "Coordinate riders, routes, handoffs and temperature-sensitive deliveries.", stat: "5", label: "Riders currently active" },
    Reports: { icon: "chart", title: "Operations & impact reporting", subtitle: "Hospital performance, patient access and social-dividend accountability.", stat: "94.2%", label: "Network SLA compliance" },
    Settings: { icon: "settings", title: "ERP access control", subtitle: "Configure facilities, roles, permissions and connected service providers.", stat: "12", label: "Active role profiles" },
  }

  if (active === "Partners management") return <PartnerManagement action={action}/>
  if (active === "Home healthcare" || active === "Follow-up") return <HomeCareWorkspace mode={active === "Home healthcare" ? "home" : "followup"} action={action}/>

  if (active === "Medication orders") {
    return <div className="module-page">
      <div className="module-hero medicine-hero"><div><span className="eyebrow">CONNECTED PHARMACY NETWORK</span><h1>Medication sourcing & delivery</h1><p>Find prescribed medicine from verified pharmacies and deliver it safely to the patient.</p></div><div className="hero-stat"><strong>12</strong><span>pharmacies online</span><small>Average match time: 4 min</small></div></div>
      <div className="module-grid">
        <form className="panel workflow-form" onSubmit={(e) => { e.preventDefault(); setSubmitted(true); action("Prescription sent to verified pharmacies") }}>
          <div className="panel-head"><div><h2>New medication request</h2><p>Prescription verification and transparent price matching</p></div><span className="secure-pill">Secure</span></div>
          <label>Patient Fayda ID or hospital card<input required placeholder="Enter Fayda ID or MRN" /></label>
          <div className="form-row"><label>Patient mobile<input required placeholder="+251 9..." /></label><label>Delivery location<select><option>TASH ward / clinic</option><option>Patient location</option><option>Caregiver pickup</option></select></label></div>
          <label>Upload or enter prescription<textarea required placeholder="Medicine, strength, dosage and quantity..." /></label>
          <label className="upload-box"><Icon name="plus"/><span><strong>Attach prescription</strong><small>Photo or PDF issued by an authorized clinician</small></span><input type="file" accept="image/*,.pdf" /></label>
          <div className="consent"><input required type="checkbox" id="consent"/><label htmlFor="consent">Patient consents to share this prescription with verified licensed pharmacies for price and stock confirmation.</label></div>
          <button className="form-submit"><Icon name="search"/> Find medicine & compare prices</button>
          {submitted && <div className="success-message"><strong>Request MED-1101 created</strong><span>Checking stock and prices across 12 verified pharmacies. The patient will approve the final price before dispatch.</span></div>}
        </form>
        <div className="side-stack">
          <div className="panel"><div className="panel-head"><div><h2>Best available matches</h2><p>Live stock from licensed pharmacies</p></div><span className="pulse">Live</span></div>
            <div className="pharmacy-list">
              <div><span>HG</span><p><strong>Hager Pharmacy</strong><small>0.8 km · 3 items in stock</small></p><b>ETB 1,240</b><button onClick={() => action("Hager Pharmacy selected")}>Select</button></div>
              <div><span>SP</span><p><strong>St. Paul Pharmacy</strong><small>1.4 km · All items in stock</small></p><b>ETB 1,315</b><button onClick={() => action("St. Paul Pharmacy selected")}>Select</button></div>
              <div><span>HP</span><p><strong>Hayat Pharmacy</strong><small>2.1 km · 2 items in stock</small></p><b>ETB 1,180</b><button onClick={() => action("Hayat Pharmacy selected")}>Select</button></div>
            </div>
          </div>
          <div className="panel delivery-flow"><h2>Safe delivery workflow</h2><div><b>1</b><span><strong>Prescription verified</strong><small>By licensed pharmacist</small></span></div><div><b>2</b><span><strong>Patient approves price</strong><small>No purchase without consent</small></span></div><div><b>3</b><span><strong>Sealed courier delivery</strong><small>Receipt, batch and expiry recorded</small></span></div><div><b>4</b><span><strong>Proof of handover</strong><small>Patient or caregiver confirmation</small></span></div></div>
        </div>
      </div>
    </div>
  }

  if (active === "Access & roles") {
    const roles = ["Super Admin", "Country Manager", "Region Manager", "Hospital Super Admin", "Hospital Manager", "Hospital Admin", "Department Manager", "Doctor Manager", "Nurse Manager", "Doctor", "Physician", "Nurse", "Receptionist", "Finance", "Pharmacy Super Admin", "Pharmacist", "Pharmacy Staff", "Courier Manager", "Courier", "Diagnostic Manager", "Laboratory Staff"]
    const permissions: Record<string, string[]> = {
      "Super Admin": ["All organizations", "User & role control", "System configuration", "Audit & reports"],
      "Hospital Manager": ["Hospital dashboard", "Departments", "Staff oversight", "Finance reports"],
      "Doctor": ["Assigned patients", "Clinical records", "Referral decisions", "Prescriptions"],
      "Nurse": ["Assigned wards", "Patient observations", "Care tasks", "Handover"],
      "Receptionist": ["Patient registration", "Appointments", "Fayda verification", "Notifications"],
      "Finance": ["Service fees", "Payment records", "Reconciliation", "Financial reports"],
    }
    return <div className="module-page">
      <section className="welcome module-welcome"><div><p>SUPER ADMIN CONSOLE</p><h1>Accounts, roles & access</h1><span>Grant the minimum access each person needs by country, region, hospital and department.</span></div><span className="owner-badge">Owner · Super Admin</span></section>
      <section className="access-stats"><div><strong>1,284</strong><span>Active accounts</span></div><div><strong>86</strong><span>Hospitals connected</span></div><div><strong>14</strong><span>Regions configured</span></div><div><strong>7</strong><span>Pending approvals</span></div></section>
      <div className="access-grid">
        <form className="panel workflow-form" onSubmit={async (e) => { e.preventDefault(); const form = new FormData(e.currentTarget); try { await api("/users", { method: "POST", body: JSON.stringify({ fullName: form.get("fullName"), email: form.get("email"), username: form.get("username"), password: form.get("password"), employeeNumber: form.get("employeeNumber"), organizationId: form.get("organizationId"), regionId: form.get("regionId"), departmentId: form.get("departmentId"), teamIds: String(form.get("teamIds") || "").split(",").map(x=>x.trim()).filter(Boolean), role: selectedRole.toLowerCase().replaceAll(" ","_"), isPartnerAdmin: form.get("isPartnerAdmin") === "on" }) }); setSubmitted(true); action("Account securely created in Supabase") } catch (error) { action(error instanceof Error ? error.message : "Account creation failed") } }}>
          <div className="panel-head"><div><h2>Create staff account</h2><p>Identity, workplace and role assignment</p></div><span className="secure-pill">Super Admin only</span></div>
          <div className="form-row"><label>Full name<input name="fullName" required placeholder="Employee full name" /></label><label>Work email<input name="email" type="email" required placeholder="name@hospital.et" /></label></div>
          <div className="form-row"><label>Username<input name="username" required placeholder="e.g. hana.abebe" /></label><label>Employee number<input name="employeeNumber" required placeholder="e.g. TASH-00418" /></label></div>
          <div className="form-row"><label>Initial password<input name="password" type="password" minLength={10} required placeholder="Minimum 10 characters" /></label><label>Team IDs<input name="teamIds" placeholder="cardiology-a, referral-review" /></label></div>
          <div className="form-row"><label>Country<select><option>Ethiopia</option></select></label><label>Region<select name="regionId"><option value="addis-ababa">Addis Ababa</option><option value="oromia">Oromia</option><option value="amhara">Amhara</option><option value="tigray">Tigray</option><option value="somali">Somali</option><option value="snnpr">SNNPR</option></select></label></div>
          <div className="form-row"><label>Organization<select name="organizationId"><option value="tash">Tikur Anbessa Specialized Hospital</option><option value="st-pauls">St. Paul’s Hospital Millennium Medical College</option><option value="jimma-umc">Jimma University Medical Center</option><option value="hawassa-uch">Hawassa University Comprehensive Hospital</option></select></label><label>Department<select name="departmentId"><option value="hospital-wide">Hospital-wide</option><option value="emergency">Emergency & Critical Care</option><option value="internal-medicine">Internal Medicine</option><option value="surgery">Surgery</option><option value="pediatrics">Pediatrics</option><option value="oncology">Oncology</option><option value="cardiology">Cardiology</option><option value="neurology">Neurology</option><option value="obgyn">Obstetrics & Gynecology</option><option value="orthopedics">Orthopedics</option><option value="radiology">Radiology</option><option value="laboratory">Pathology & Laboratory</option><option value="pharmacy">Pharmacy</option><option value="finance">Finance</option><option value="reception">Reception & Records</option></select></label></div>
          <label>System role<select value={selectedRole} onChange={e => setSelectedRole(e.target.value)}>{roles.map(role => <option key={role}>{role}</option>)}</select></label>
          <div className="consent"><input type="checkbox" id="is-partner-admin" name="isPartnerAdmin"/><label htmlFor="is-partner-admin"><strong>Partner admin</strong><br/>Allow this account to manage partner users within the assigned organization.</label></div>
          <div className="permission-preview"><strong>{selectedRole} access preview</strong><div>{(permissions[selectedRole] || ["Role-specific dashboard", "Assigned facility records", "Department workflow", "Activity history"]).map(item => <span key={item}><i></i>{item}</span>)}</div></div>
          <div className="consent"><input required type="checkbox" id="account-policy"/><label htmlFor="account-policy">Require password change at first login and enforce organization, department, team and role restrictions.</label></div>
          <button className="form-submit"><Icon name="plus"/> Create account & send invitation</button>
          {submitted && <div className="success-message"><strong>Account invitation created</strong><span>The account remains pending until identity verification and first-login security setup are completed.</span></div>}
        </form>
        <div className="side-stack">
          <div className="panel role-hierarchy"><div className="panel-head"><div><h2>Access hierarchy</h2><p>Scope narrows at every level</p></div></div>
            <div className="level owner"><b>01</b><p><strong>Owners · Super Admins</strong><small>Platform-wide control and audit</small></p></div>
            <div className="level country"><b>02</b><p><strong>Country & Region Managers</strong><small>Aggregated oversight in assigned geography</small></p></div>
            <div className="level hospital"><b>03</b><p><strong>Hospital Managers & Admins</strong><small>Facility operations, users and reporting</small></p></div>
            <div className="level department"><b>04</b><p><strong>Department & Clinical Managers</strong><small>Department teams, queues and quality</small></p></div>
            <div className="level workforce"><b>05</b><p><strong>Clinical & Administrative Staff</strong><small>Task-based access to assigned patients</small></p></div>
          </div>
          <div className="panel security-card"><Icon name="settings"/><p><strong>Every access event is auditable</strong><small>Role changes, record views, exports and clinical actions are recorded with user, time and facility.</small></p></div>
        </div>
      </div>
      <div className="role-dashboard-catalog"><div className="panel-head"><div><h2>Role dashboard catalog</h2><p>Each role opens a focused dashboard with only the data and actions required for their work.</p></div></div><div>{roles.map((role, index) => <article key={role}><span>{String(index + 1).padStart(2,"0")}</span><p><strong>{role}</strong><small>{role.includes("Manager") || role.includes("Admin") ? "Oversight, team performance, approvals and reports" : role === "Finance" ? "Billing, payments, reconciliation and audit" : "Assigned patient care, tasks and handovers"}</small></p><button onClick={() => action(`${role} dashboard preview opened`)}>Preview</button></article>)}</div></div>
      <div className="panel account-list"><div className="panel-head"><div><h2>Recent account activity</h2><p>Approvals, role changes and security events</p></div><button onClick={() => action("User directory opened")}>Open user directory <Icon name="arrow" size={14}/></button></div>
        {[["Dr. Rahel Alemu","Doctor Manager · Oncology","Role granted","green"],["Marta Bekele","Receptionist · Patient Services","Invitation pending","amber"],["Henok Tesfaye","Region Manager · Oromia","MFA verified","blue"]].map(row => <div key={row[0]}><span className="patient"><i>{row[0].split(" ").map(x=>x[0]).join("").slice(0,2)}</i><span><strong>{row[0]}</strong><small>{row[1]}</small></span></span><b className={`status ${row[3]}`}><i></i>{row[2]}</b><button onClick={() => action(`${row[0]}'s access profile opened`)}>Review access</button></div>)}
      </div>
    </div>
  }

  if (active === "Settings") {
    return <div className="module-page"><section className="welcome module-welcome"><div><p>SYSTEM CONFIGURATION</p><h1>Settings</h1><span>Organization, security, communication and connected-service configuration.</span></div><span className="owner-badge">Super Admin access</span></section><div className="settings-grid">
      {[["Organization profile","Facilities, regions, departments and operating hours","Country, region & hospital hierarchy"],["Security & authentication","Password policy, MFA, session rules and approved domains","MFA required for privileged roles"],["Notifications","SMS, email, Telegram, WhatsApp and call reminders","4 channels currently active"],["Fayda integration","Identity verification, consent and patient matching","Connected · Healthy"],["Pharmacy network","Licensed providers, service areas and fulfillment rules","12 verified partners"],["Referral configuration","Intake fields, urgency rules, routing and service targets","18 specialty pathways"],["Billing & social dividend","Fees, payment methods and 6% impact allocation","Reconciliation up to date"],["Audit & data governance","Retention, exports, access logs and incident review","No unresolved incidents"]].map((item, i)=><button key={item[0]} onClick={() => action(`${item[0]} settings opened`)}><span className={`settings-icon s${i}`}><Icon name={i===2?"bell":i===4?"pill":i===5?"calendar":i===6?"chart":"settings"}/></span><p><strong>{item[0]}</strong><small>{item[1]}</small><b>{item[2]}</b></p><Icon name="arrow"/></button>)}
    </div></div>
  }

  if (active === "Appointments") {
    return <div className="module-page">
      <div className="module-hero referral-hero"><div><span className="eyebrow">REMOTE REFERRAL ACCESS</span><h1>Travel only when care is ready</h1><p>Patients apply from their home region, are clinically reviewed, and receive a confirmed visit plan before traveling.</p></div><div className="hero-stat"><strong>47</strong><span>regions & facilities connected</span><small>82% unnecessary travel avoided</small></div></div>
      <div className="referral-steps"><div className="done"><b>1</b><span>Fayda identity</span></div><i></i><div className="active"><b>2</b><span>Referral details</span></div><i></i><div><b>3</b><span>Clinical review</span></div><i></i><div><b>4</b><span>Visit plan</span></div></div>
      <div className="referral-intelligence">
        <div><span>Intake completeness</span><strong>91%</strong><small>Required clinical data received</small></div>
        <div><span>Median triage time</span><strong>3.4h</strong><small>Down 42 minutes this week</small></div>
        <div><span>Consult completion</span><strong>84%</strong><small>Closed-loop outcomes captured</small></div>
        <div className="attention"><span>Stalled referrals</span><strong>12</strong><small>Require coordinator action</small></div>
      </div>
      <div className="module-grid">
        <form className="panel workflow-form" onSubmit={(e) => { e.preventDefault(); setSubmitted(true); action("Referral submitted for clinical triage") }}>
          <div className="panel-head"><div><h2>Submit a remote referral</h2><p>Accessible from any participating Ethiopian health facility</p></div><span className="secure-pill">Fayda linked</span></div>
          <div className="form-row"><label>Fayda identification number<input required placeholder="XXXX XXXX XXXX XXXX" /></label><label>Patient mobile<input required placeholder="+251 9..." /></label></div>
          <div className="form-row"><label>Referring facility<input required placeholder="Health center or hospital" /></label><label>Region<select><option>Select region</option><option>Oromia</option><option>Amhara</option><option>Tigray</option><option>SNNPR</option><option>Somali</option></select></label></div>
          <div className="form-row"><label>Requested specialty<select><option>Choose department</option><option>Cardiology</option><option>Oncology</option><option>Neurology</option><option>Pediatrics</option><option>Surgery</option></select></label><label>Clinical urgency<select><option>Routine</option><option>Urgent</option><option>Emergency transfer</option></select></label></div>
          <label>Clinical summary<textarea required placeholder="Presenting condition, history, prior treatment and reason for referral..." /></label>
          <label className="upload-box"><Icon name="plus"/><span><strong>Attach referral package</strong><small>Referral paper, investigations and imaging reports</small></span><input type="file" multiple /></label>
          <button className="form-submit"><Icon name="arrow"/> Submit for TASH clinical review</button>
          {submitted && <div className="success-message"><strong>Referral REF-4832 received</strong><span>A TASH reviewer will verify the case. The patient will be notified by SMS and phone with department, date, clinician, required documents and arrival instructions.</span></div>}
        </form>
        <div className="side-stack">
          <div className="panel appointment-preview"><span className="preview-label">VISIT PLAN PREVIEW</span><h2>Everything the patient receives</h2><div><Icon name="calendar"/><p><strong>Confirmed date & arrival time</strong><small>No need to wait in Addis Ababa for weeks</small></p></div><div><Icon name="users"/><p><strong>Department & clinician</strong><small>Exact building, desk and contact point</small></p></div><div><Icon name="pill"/><p><strong>Preparation checklist</strong><small>Documents, fasting and expected fees</small></p></div><button onClick={() => action("Sample patient visit plan opened")}>Preview patient notification</button></div>
          <div className="panel urgency-card"><span>Priority safety rule</span><strong>Emergency cases are never placed in the routine queue.</strong><p>They are escalated immediately to the referring clinician and TASH emergency coordination team.</p></div>
        </div>
      </div>
      <div className="closed-loop panel">
        <div className="panel-head"><div><h2>Closed-loop referral tracking</h2><p>One auditable history from referring facility to clinical outcome</p></div><button onClick={() => action("Referral audit log opened")}>View full audit history <Icon name="arrow" size={14}/></button></div>
        <div className="loop-case"><div className="case-patient"><span>MT</span><p><strong>Meseret Tadesse</strong><small>REF-4821 · Cardiology · Oromia</small></p></div><div className="case-progress"><div className="complete"><i></i><span>Submitted<small>Oct 10 · 08:12</small></span></div><b></b><div className="complete"><i></i><span>Triaged<small>Dr. Hana · 10:45</small></span></div><b></b><div className="complete"><i></i><span>Scheduled<small>Oct 17 · 09:30</small></span></div><b></b><div className="current"><i></i><span>Consult<small>Awaiting visit</small></span></div><b></b><div><i></i><span>Outcome<small>Pending</small></span></div></div><button onClick={() => action("Meseret's referral record opened")}>Open case</button></div>
        <div className="loop-case stalled"><div className="case-patient"><span>BG</span><p><strong>Bereket Getachew</strong><small>REF-4816 · Neurology · Amhara</small></p></div><div className="stall-reason"><b>Stalled 36h</b><span>Missing CT report · Reminder sent to referring facility</span></div><button onClick={() => action("Coordinator follow-up started")}>Resolve issue</button></div>
      </div>
    </div>
  }

  const item = content[active] || content.Patients
  return <div className="module-page">
    <section className="welcome module-welcome"><div><p>CARE NETWORK ERP</p><h1>{item.title}</h1><span>{item.subtitle}</span></div><button className="primary-button" onClick={() => action(`New ${active.toLowerCase()} record started`)}><Icon name="plus"/> Create record</button></section>
    <section className="module-summary">
      <div className="summary-main"><span className="metric-icon teal"><Icon name={item.icon}/></span><p><strong>{item.stat}</strong><small>{item.label}</small></p></div>
      <div><span>Network access</span><strong>Role controlled</strong><small>Permissions follow staff position</small></div>
      <div><span>Identity matching</span><strong>Fayda enabled</strong><small>Duplicate records prevented</small></div>
      <div><span>Data exchange</span><strong>Across facilities</strong><small>Authorized clinical history</small></div>
    </section>
    <div className="panel registry-panel"><div className="panel-head"><div><h2>{active} workspace</h2><p>Authorized records available to your Operations Lead role</p></div><button onClick={() => action(`${active} data refreshed`)}>Refresh data</button></div>
      <div className="record-list">{queue.map((row, index) => <div key={row.id}><span className="patient"><i>{row.initials}</i><span><strong>{row.name}</strong><small>Fayda verified · {row.id}</small></span></span><span><strong>{index % 2 ? "TASH" : "Regional facility"}</strong><small>Shared care record</small></span><b className={`status ${row.tone}`}><i></i>{row.status}</b><button onClick={() => action(`${row.name}'s record opened`)}>Open record <Icon name="arrow" size={14}/></button></div>)}</div>
    </div>
  </div>
}

function AppContent() {
  const t = useLanguage()
  const [screen, setScreen] = useState<"landing" | "login" | "bootstrap" | "partner" | "partnerPortal" | "patientPortal" | "app">("landing")
  const [partnerType, setPartnerType] = useState<PartnerType>("Hospital")
  const [partnerOrganizationName, setPartnerOrganizationName] = useState("Partner organization")
  const [active, setActive] = useState("Overview")
  const [toast, setToast] = useState("")
  const [showMenu, setShowMenu] = useState(false)
  const [queueFilter, setQueueFilter] = useState("All")
  const [selectedDepartment, setSelectedDepartment] = useState("Hospital-wide")
  const [selectedRole, setSelectedRole] = useState("Hospital Manager")
  const [profile, setProfile] = useState<any>(null)
  const nav = [["Overview", "grid"], ["Patients", "users"], ["Appointments", "calendar"], ["Home healthcare", "users"], ["Follow-up", "calendar"], ["Medication orders", "pill"], ["Diagnostics", "flask"], ["Fleet & dispatch", "bike"], ["Reports", "chart"], ["Access & roles", "settings"], ["Partners management", "users"]] as [string, IconName][]
  const roleModules: Record<string, string[]> = {
    super_admin: nav.map(x => x[0]).concat("Settings"),
    country_manager: ["Overview", "Patients", "Appointments", "Reports"],
    region_manager: ["Overview", "Patients", "Appointments", "Reports"],
    hospital_super_admin: ["Overview", "Patients", "Appointments", "Home healthcare", "Follow-up", "Medication orders", "Diagnostics", "Reports", "Settings"],
    hospital_manager: ["Overview", "Patients", "Appointments", "Home healthcare", "Follow-up", "Medication orders", "Diagnostics", "Reports"],
    hospital_admin: ["Overview", "Patients", "Appointments", "Home healthcare", "Follow-up", "Reports"],
    department_manager: ["Overview", "Patients", "Appointments", "Home healthcare", "Follow-up", "Reports"],
    doctor_manager: ["Overview", "Patients", "Appointments", "Diagnostics", "Reports"],
    nurse_manager: ["Overview", "Patients", "Appointments", "Home healthcare", "Follow-up", "Reports"],
    doctor: ["Overview", "Patients", "Appointments", "Diagnostics"],
    physician: ["Overview", "Patients", "Appointments", "Diagnostics"],
    nurse: ["Overview", "Patients", "Appointments"],
    receptionist: ["Overview", "Patients", "Appointments"],
    finance: ["Overview", "Reports"],
    pharmacy_super_admin: ["Overview", "Medication orders", "Reports", "Settings"],
    pharmacist: ["Overview", "Medication orders"],
    pharmacy_staff: ["Overview", "Medication orders"],
    courier_manager: ["Overview", "Medication orders", "Diagnostics", "Fleet & dispatch", "Reports"],
    courier: ["Overview", "Fleet & dispatch"],
    diagnostic_manager: ["Overview", "Diagnostics", "Reports"],
    laboratory_staff: ["Overview", "Diagnostics"],
  }
  const visibleNav = nav.filter(([label]) => (roleModules[profile?.role] || ["Overview"]).includes(label))

  function action(message: string) {
    setToast(message)
    window.setTimeout(() => setToast(""), 2600)
  }

  if (screen === "landing") return <Landing onLogin={() => setScreen("login")} onPartner={() => setScreen("partner")}/>
  if (screen === "login") return <Login onSuccess={(nextProfile) => { setProfile(nextProfile); setScreen(nextProfile.role === "patient" ? "patientPortal" : "app") }} onBack={() => setScreen("landing")} onBootstrap={() => setScreen("bootstrap")}/>
  if (screen === "bootstrap") return <Bootstrap onComplete={() => setScreen("login")} onBack={() => setScreen("login")}/>
  if (screen === "partner") return <PartnerAccess onBack={() => setScreen("landing")} onEnter={(type, organizationName) => { setPartnerType(type); setPartnerOrganizationName(organizationName); setScreen("partnerPortal") }}/>
  if (screen === "partnerPortal") return <PartnerPortal type={partnerType} organizationName={partnerOrganizationName} onLogout={async () => { await supabase.auth.signOut(); setScreen("landing") }}/>
  if (screen === "patientPortal") return <PatientPortal profile={profile} onLogout={async () => { await supabase.auth.signOut(); setProfile(null); setScreen("landing") }}/>

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="brand">
          <div className="brand-mark"><span></span><span></span></div>
          <div><strong>MedLink</strong><small>Ethiopia Care ERP</small></div>
        </div>
        <nav>
          <p className="nav-label">Workspace</p>
          {visibleNav.map(([label, icon]) => (
            <button key={label} className={active === label ? "nav-item active" : "nav-item"} onClick={() => { setActive(label); action(`${label} workspace selected`) }}>
              <Icon name={icon}/><span>{translatedLabel(label, t)}</span>{label === "Medication orders" && <b>8</b>}{label === "Partners management" && <b>3</b>}
            </button>
          ))}
        </nav>
        <div className="sidebar-bottom">
          <div className="impact-card">
            <div className="impact-icon">6%</div>
            <strong>Social dividend</strong>
            <p>Giving back to TASH and patients in need.</p>
            <div className="impact-split"><span>4% Hospital</span><span>2% Patient fund</span></div>
          </div>
          {(roleModules[profile?.role] || []).includes("Settings") && <button className={active === "Settings" ? "nav-item active" : "nav-item"} onClick={() => setActive("Settings")}><Icon name="settings"/><span>Settings</span></button>}
          <div className="profile">
            <div className="avatar">{String(profile?.full_name || "User").split(" ").map(x=>x[0]).join("").slice(0,2)}</div><div><strong>{profile?.full_name || profile?.username}</strong><small>{String(profile?.role || "").replaceAll("_"," ")}</small></div><button>···</button>
          </div>
          <button className="logout-button" onClick={async () => { await supabase.auth.signOut(); setProfile(null); setActive("Overview"); setScreen("landing") }}>Log out <Icon name="arrow" size={15}/></button>
        </div>
      </aside>

      <main>
        <header>
          <div className="mobile-brand"><strong>MedLink</strong></div>
          <div className="search"><Icon name="search"/><input aria-label="Search" placeholder="Search patient, order or ID..." /><kbd>⌘ K</kbd></div>
          <div className="header-actions">
            <LanguageSwitcher/>
            <button className="icon-button" onClick={() => action("No new notifications")}><Icon name="bell"/><i></i></button>
            <button className="primary-button" onClick={() => setShowMenu(!showMenu)}><Icon name="plus"/> New request</button>
            {showMenu && <div className="action-menu">{["Register a referral", "Medication delivery", "Diagnostic logistics"].map(x => <button key={x} onClick={() => { setActive(x === "Register a referral" ? "Appointments" : x === "Medication delivery" ? "Medication orders" : "Diagnostics"); setShowMenu(false) }}>{x}<Icon name="arrow" size={15}/></button>)}</div>}
          </div>
        </header>

        <div className="content">
          {active === "Overview" ? <>
          <section className="welcome">
            <div><p>MONDAY, 26 OCTOBER 2026</p><h1>{selectedDepartment === "Hospital-wide" ? "Hospital-wide operations" : `${selectedDepartment} dashboard`}</h1><span>Live care coordination for {String(profile?.role || selectedRole).replaceAll("_", " ")} access.</span></div>
            <div className="dashboard-scope">
              <label>Department<select value={selectedDepartment} onChange={e => { setSelectedDepartment(e.target.value); action(`${e.target.value} dashboard selected`) }}>{departmentOptions.map(item => <option key={item}>{item}</option>)}</select></label>
              <label>Role<select value={selectedRole} onChange={e => { setSelectedRole(e.target.value); action(`${e.target.value} view selected`) }}>{roleOptions.map(item => <option key={item}>{item}</option>)}</select></label>
              <span className="live"><i></i> Operations live</span>
            </div>
          </section>

          <RoleDashboard profile={profile} action={action}/>

          <section className="command-strip">
            <div className="command-title">
              <span className="command-symbol"><Icon name="chart"/></span>
              <p><strong>Care command center</strong><small>System-wide operational intelligence</small></p>
            </div>
            <div className="command-stat"><span>Open cases</span><strong>24</strong><small className="good">4 resolved this hour</small></div>
            <div className="command-stat"><span>SLA compliance</span><strong>94.2%</strong><small className="good">Above 90% target</small></div>
            <div className="command-stat"><span>At-risk requests</span><strong className="risk">3</strong><small className="risk">Action required</small></div>
            <button onClick={() => action("Operations intelligence report opened")}>Open command center <Icon name="arrow" size={15}/></button>
          </section>

          <section className="metrics">
            <article><div className="metric-icon teal"><Icon name="users"/></div><div className="metric-copy"><span>Patients supported</span><strong>148</strong><small><b>↑ 12%</b> from yesterday</small></div><div className="spark green-bars">{[35,45,37,61,48,72,65,82].map((v,i)=><i key={i} style={{height:`${v}%`}}></i>)}</div></article>
            <article><div className="metric-icon orange"><Icon name="calendar"/></div><div className="metric-copy"><span>Appointments today</span><strong>36</strong><small><b>29</b> confirmed</small></div><div className="donut">81%</div></article>
            <article><div className="metric-icon blue"><Icon name="bike"/></div><div className="metric-copy"><span>Active deliveries</span><strong>12</strong><small><b>8</b> medication · <b>4</b> lab</small></div><div className="fleet"><i></i><i></i><i></i><i className="off"></i></div></article>
            <article><div className="metric-icon purple"><Icon name="chart"/></div><div className="metric-copy"><span>Avg. turnaround</span><strong>34 <em>min</em></strong><small><b>↓ 6 min</b> this week</small></div><div className="mini-line"><svg viewBox="0 0 90 40"><path d="M2 10 C14 12 16 25 29 20 S42 28 53 22 67 30 88 13"/></svg></div></article>
          </section>

          <section className="work-grid">
            <div className="panel queue-panel">
              <div className="panel-head queue-heading"><div><h2>Today’s service queue</h2><p>Requests requiring attention across all services</p></div><div className="queue-controls">{["All","Referral","Medication","Diagnostic"].map(item => <button key={item} className={queueFilter === item ? "selected" : ""} onClick={() => setQueueFilter(item)}>{item}</button>)}</div></div>
              <div className="table">
                <div className="table-row table-header"><span>Patient</span><span>Service</span><span>Time</span><span>Status</span><span></span></div>
                {queue.filter(row => queueFilter === "All" || row.type === queueFilter).map((row) => <div className="table-row" key={row.id}>
                  <span className="patient"><i>{row.initials}</i><span><strong>{row.name}</strong><small>{row.id}</small></span></span>
                  <span><strong>{row.type}</strong><small>{row.detail}</small></span>
                  <span className="time">{row.time}</span>
                  <span><b className={`status ${row.tone}`}><i></i>{row.status}</b></span>
                  <button className="row-more" onClick={() => action(`${row.name}'s request opened`)}>•••</button>
                </div>)}
              </div>
            </div>

            <div className="panel activity">
              <div className="panel-head"><div><h2>Live activity</h2><p>Real-time service updates</p></div><span className="pulse">Live</span></div>
              <div className="timeline">
                <div><i className="blue-dot"><Icon name="bike" size={14}/></i><p><strong>Courier arrived at ICL</strong><span>Sample LAB-2384 handed over</span><small>2 min ago</small></p></div>
                <div><i className="green-dot"><Icon name="pill" size={14}/></i><p><strong>Medication delivered</strong><span>Order MED-1089 · Oncology</span><small>8 min ago</small></p></div>
                <div><i className="amber-dot"><Icon name="calendar" size={14}/></i><p><strong>Appointment confirmed</strong><span>Selamawit · Neurology clinic</span><small>14 min ago</small></p></div>
                <div><i className="purple-dot"><Icon name="flask" size={14}/></i><p><strong>Results ready for pickup</strong><span>Arsho Lab · 2 reports</span><small>21 min ago</small></p></div>
              </div>
            </div>
          </section>

          <section className="bottom-grid">
            <div className="panel service-card">
              <div className="panel-head"><div><h2>Service performance</h2><p>Today’s progress against target</p></div><select aria-label="Period"><option>Today</option><option>This week</option></select></div>
              <div className="services">
                <div><span className="service-icon referral"><Icon name="users"/></span><p><strong>Referral & navigation</strong><small>42 of 48 requests complete</small></p><div className="progress"><span style={{width:"88%"}}></span></div><b>88%</b></div>
                <div><span className="service-icon medication"><Icon name="pill"/></span><p><strong>Medication delivery</strong><small>27 of 34 orders delivered</small></p><div className="progress"><span style={{width:"79%"}}></span></div><b>79%</b></div>
                <div><span className="service-icon diagnostic"><Icon name="flask"/></span><p><strong>Diagnostic logistics</strong><small>18 of 24 samples returned</small></p><div className="progress"><span style={{width:"75%"}}></span></div><b>75%</b></div>
              </div>
            </div>
            <div className="panel fleet-card">
              <div className="panel-head"><div><h2>Fleet availability</h2><p>Current e-bike status</p></div><button onClick={() => action("Fleet workspace opened")}>Manage fleet</button></div>
              <div className="fleet-count"><strong>3</strong><span>of 4 bikes available</span><div><i></i><i></i><i></i><i className="busy"></i></div></div>
              <div className="riders"><span>Riders on duty</span><div className="avatar-stack"><i>AM</i><i>TD</i><i>BK</i><b>+2</b></div><small>5 active riders</small></div>
            </div>
          </section>

          <section className="network-panel panel">
            <div className="panel-head"><div><h2>Connected care network</h2><p>Verified partners and live service capacity around TASH</p></div><button onClick={() => action("Partner directory opened")}>View partner directory <Icon name="arrow" size={15}/></button></div>
            <div className="partners">
              <div><span className="partner-logo lab">ICL</span><p><strong>International Clinical Labs</strong><small>Diagnostics · 18 tests available</small></p><b><i></i> Online</b><em>Avg. TAT 4.2h</em></div>
              <div><span className="partner-logo arsho">AR</span><p><strong>Arsho Medical Laboratory</strong><small>Diagnostics · Priority intake</small></p><b><i></i> Online</b><em>Avg. TAT 3.8h</em></div>
              <div><span className="partner-logo pharmacy">RX</span><p><strong>Verified Pharmacy Network</strong><small>12 licensed pharmacies nearby</small></p><b><i></i> 10 active</b><em>86% fill rate</em></div>
            </div>
          </section>
          </> : <Workspace active={active} action={action} department={selectedDepartment} role={selectedRole} setDepartment={setSelectedDepartment} setRole={setSelectedRole}/>}
        </div>
      </main>
      {toast && <div className="toast"><i></i>{toast}</div>}
    </div>
  )
}

export default function App() {
  const [language, setLanguage] = useState<Language>(() => (localStorage.getItem("medlink-language") as Language) || "en")
  function changeLanguage(next: Language) {
    setLanguage(next)
    localStorage.setItem("medlink-language", next)
  }
  return <LanguageContext.Provider value={{ language, setLanguage: changeLanguage }}><AppContent/></LanguageContext.Provider>
}
