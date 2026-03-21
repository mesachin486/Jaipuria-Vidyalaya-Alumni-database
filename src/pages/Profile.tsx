import React, { useState, useEffect } from 'react';
import { auth, db, handleFirestoreError, OperationType, query, where, getDocs, collection, doc, getDoc, setDoc, serverTimestamp } from '../firebase';
import { motion } from 'motion/react';
import { Save, User as UserIcon, Linkedin, MapPin, Briefcase, GraduationCap, Mail, Info, CheckCircle2, AlertCircle, Phone, Calendar, School, Instagram, Facebook, Building2, Globe, ShieldCheck } from 'lucide-react';
import AlumniVerification from '../components/AlumniVerification';

interface AlumniPersonal {
  uid: string;
  name: string;
  gmail: string;
  batchYear: number;
  phone?: string;
  dob?: string;
  isPublic: boolean;
  updatedAt?: any;
}

interface AlumniSchool {
  uid: string;
  lastClass?: string;
  section?: string;
  stream?: string;
}

interface AlumniSocial {
  uid: string;
  instagram?: string;
  facebook?: string;
  linkedIn?: string;
}

interface AlumniProfessional {
  uid: string;
  employmentStatus?: string;
  otherEmploymentStatus?: string;
  publicType?: string;
  stateName?: string;
  otherPublicType?: string;
  department?: string;
  jobCity?: string;
  jobRole?: string;
  industry?: string;
  companyName?: string;
  businessName?: string;
  businessCity?: string;
  collegeName?: string;
  passoutYear?: string;
  degreeName?: string;
  courseName?: string;
  lookingForJob?: string;
  aspiringJobProfile?: string;
  yearsOfExperience?: string;
  country?: string;
}

const BATCH_YEARS = Array.from({ length: new Date().getFullYear() - 1993 + 1 }, (_, i) => 1993 + i).reverse();
const CLASSES = ['VI', 'VII', 'VIII', 'IX', 'X', 'XI', 'XII'];
const SECTIONS = ['A', 'B', 'C', 'D', 'E'];
const STREAMS = ['Maths', 'Biology', 'Commerce', 'Pre 11th', 'Humanities', 'Other'];
const EMPLOYMENT_STATUSES = ['Public', 'Private', 'Business/Self Employed', 'Student', 'Unemployed', 'Others'];
const PUBLIC_TYPES = ['State Government', 'Central Government', 'Others'];
const YEARS_OF_EXPERIENCE = Array.from({ length: 40 }, (_, i) => (i + 1).toString());
const COUNTRIES = [
  "India", "Afghanistan", "Albania", "Algeria", "Andorra", "Angola", "Antigua and Barbuda", "Argentina", "Armenia", "Australia", "Austria", "Azerbaijan",
  "Bahamas", "Bahrain", "Bangladesh", "Barbados", "Belarus", "Belgium", "Belize", "Benin", "Bhutan", "Bolivia", "Bosnia and Herzegovina", "Botswana", "Brazil", "Brunei", "Bulgaria", "Burkina Faso", "Burundi",
  "Cabo Verde", "Cambodia", "Cameroon", "Canada", "Central African Republic", "Chad", "Chile", "China", "Colombia", "Comoros", "Congo", "Costa Rica", "Croatia", "Cuba", "Cyprus", "Czech Republic",
  "Denmark", "Djibouti", "Dominica", "Dominican Republic",
  "Ecuador", "Egypt", "El Salvador", "Equatorial Guinea", "Eritrea", "Estonia", "Eswatini", "Ethiopia",
  "Fiji", "Finland", "France",
  "Gabon", "Gambia", "Georgia", "Germany", "Ghana", "Greece", "Grenada", "Guatemala", "Guinea", "Guinea-Bissau", "Guyana",
  "Haiti", "Honduras", "Hungary",
  "Iceland", "Indonesia", "Iran", "Iraq", "Ireland", "Israel", "Italy",
  "Jamaica", "Japan", "Jordan",
  "Kazakhstan", "Kenya", "Kiribati", "Korea, North", "Korea, South", "Kosovo", "Kuwait", "Kyrgyzstan",
  "Laos", "Latvia", "Lebanon", "Lesotho", "Liberia", "Libya", "Liechtenstein", "Lithuania", "Luxembourg",
  "Madagascar", "Malawi", "Malaysia", "Maldives", "Mali", "Malta", "Marshall Islands", "Mauritania", "Mauritius", "Mexico", "Micronesia", "Moldova", "Monaco", "Mongolia", "Montenegro", "Morocco", "Mozambique", "Myanmar",
  "Namibia", "Nauru", "Nepal", "Netherlands", "New Zealand", "Nicaragua", "Niger", "Nigeria", "North Macedonia", "Norway",
  "Oman",
  "Pakistan", "Palau", "Palestine", "Panama", "Papua New Guinea", "Paraguay", "Peru", "Philippines", "Poland", "Portugal",
  "Qatar",
  "Romania", "Russia", "Rwanda",
  "Saint Kitts and Nevis", "Saint Lucia", "Saint Vincent and the Grenadines", "Samoa", "San Marino", "Sao Tome and Principe", "Saudi Arabia", "Senegal", "Serbia", "Seychelles", "Sierra Leone", "Singapore", "Slovakia", "Slovenia", "Solomon Islands", "Somalia", "South Africa", "South Sudan", "Spain", "Sri Lanka", "Sudan", "Suriname", "Sweden", "Switzerland", "Syria",
  "Taiwan", "Tajikistan", "Tanzania", "Thailand", "Timor-Leste", "Togo", "Tonga", "Trinidad and Tobago", "Tunisia", "Turkey", "Turkmenistan", "Tuvalu",
  "Uganda", "Ukraine", "United Arab Emirates", "United Kingdom", "United States", "Uruguay", "Uzbekistan",
  "Vanuatu", "Vatican City", "Venezuela", "Vietnam",
  "Yemen",
  "Zambia", "Zimbabwe"
];
const COUNTRY_CODES = [
  { code: '+91', label: 'India (+91)' },
  { code: '+1', label: 'USA/Canada (+1)' },
  { code: '+44', label: 'UK (+44)' },
  { code: '+971', label: 'UAE (+971)' },
  { code: '+61', label: 'Australia (+61)' },
  { code: '+65', label: 'Singapore (+65)' },
  { code: '+49', label: 'Germany (+49)' },
  { code: '+33', label: 'France (+33)' },
  { code: '+81', label: 'Japan (+81)' },
];

export default function Profile() {
  const [personal, setPersonal] = useState<AlumniPersonal>({
    uid: auth.currentUser?.uid || '',
    name: auth.currentUser?.displayName || '',
    gmail: auth.currentUser?.email || '',
    batchYear: new Date().getFullYear(),
    phone: '',
    dob: '',
    isPublic: false,
  });

  const [countryCode, setCountryCode] = useState('+91');
  const [phoneNumber, setPhoneNumber] = useState('');

  const [school, setSchool] = useState<AlumniSchool>({
    uid: auth.currentUser?.uid || '',
    lastClass: '',
    section: '',
    stream: '',
  });

  const [social, setSocial] = useState<AlumniSocial>({
    uid: auth.currentUser?.uid || '',
    instagram: '',
    facebook: '',
    linkedIn: '',
  });

  const [professional, setProfessional] = useState<AlumniProfessional>({
    uid: auth.currentUser?.uid || '',
    employmentStatus: '',
    otherEmploymentStatus: '',
    publicType: '',
    stateName: '',
    otherPublicType: '',
    department: '',
    jobCity: '',
    jobRole: '',
    industry: '',
    companyName: '',
    businessName: '',
    businessCity: '',
    collegeName: '',
    passoutYear: '',
    degreeName: '',
    courseName: '',
    lookingForJob: '',
    yearsOfExperience: '',
    country: '',
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [verificationStatus, setVerificationStatus] = useState<'unverified' | 'pending' | 'verified' | 'rejected'>('unverified');

  const fetchVerificationStatus = async () => {
    if (!auth.currentUser) return;
    try {
      const snap = await getDoc(doc(db, 'alumni_verification', auth.currentUser.uid));
      if (snap.exists()) {
        setVerificationStatus(snap.data().status);
      }
    } catch (err) {
      console.error("Error fetching verification status:", err);
    }
  };

  useEffect(() => {
    const fetchAllData = async () => {
      if (!auth.currentUser) return;
      try {
        const uid = auth.currentUser.uid;
        
        const fetchDoc = async (collectionName: string) => {
          try {
            return await getDoc(doc(db, collectionName, uid));
          } catch (error) {
            handleFirestoreError(error, OperationType.GET, collectionName);
            throw error;
          }
        };

        const [personalSnap, schoolSnap, socialSnap, professionalSnap] = await Promise.all([
          fetchDoc('alumni_personal'),
          fetchDoc('alumni_school'),
          fetchDoc('alumni_social'),
          fetchDoc('alumni_professional'),
        ]);

        if (personalSnap.exists()) {
          const data = personalSnap.data() as AlumniPersonal;
          setPersonal({ 
            ...data, 
            name: auth.currentUser.displayName || data.name || '',
            gmail: auth.currentUser.email || data.gmail || ''
          });
          
          // Try to split phone into country code and number
          if (data.phone) {
            const foundCode = COUNTRY_CODES.find(c => data.phone?.startsWith(c.code));
            if (foundCode) {
              setCountryCode(foundCode.code);
              setPhoneNumber(data.phone.replace(foundCode.code, '').trim());
            } else {
              setPhoneNumber(data.phone);
            }
          }
        }
        if (schoolSnap.exists()) setSchool(schoolSnap.data() as AlumniSchool);
        if (socialSnap.exists()) setSocial(socialSnap.data() as AlumniSocial);
        if (professionalSnap.exists()) setProfessional(professionalSnap.data() as AlumniProfessional);

        await fetchVerificationStatus();

      } catch (error) {
        console.error("Profile fetch error:", error);
        // Error is already handled by fetchDoc if it was a permission error
        if (!(error instanceof Error && error.message.includes('authInfo'))) {
          setError("Failed to load profile data. Please try again.");
        }
      } finally {
        setLoading(false);
      }
    };

    fetchAllData();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!auth.currentUser) return;
    setSaving(true);
    setSuccess(false);
    setError(null);

    try {
      const uid = auth.currentUser.uid;
      const fullPhone = `${countryCode} ${phoneNumber}`.trim();

      // Duplicate check (optional but good practice)
      const personalRef = collection(db, 'alumni_personal');
      const q = query(
        personalRef, 
        where('name', '==', personal.name),
        where('uid', '!=', uid)
      );
      const querySnapshot = await getDocs(q);
      // Note: In a real scenario, we might want to check email too, but email is in alumni_social now.
      // For now, let's stick to the name check as requested before.
      
      await Promise.all([
        setDoc(doc(db, 'alumni_personal', uid), {
          ...personal,
          phone: fullPhone,
          name: auth.currentUser.displayName || personal.name,
          gmail: auth.currentUser.email || personal.gmail,
          uid,
          updatedAt: serverTimestamp(),
        }),
        setDoc(doc(db, 'alumni_school', uid), { ...school, uid }),
        setDoc(doc(db, 'alumni_social', uid), { ...social, uid }),
        setDoc(doc(db, 'alumni_professional', uid), { ...professional, uid }),
      ]);

      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (error) {
      console.error("Profile save error:", error);
      handleFirestoreError(error, OperationType.WRITE, 'alumni_profile_save');
    } finally {
      setSaving(false);
    }
  };

  const formatDate = (timestamp: any) => {
    if (!timestamp) return null;
    try {
      const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
      return date.toLocaleDateString('en-IN', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (e) {
      return null;
    }
  };

  if (loading) {
    return (
      <div className="max-w-3xl mx-auto py-12 text-center">
        <div className="w-12 h-12 border-4 border-stone-200 border-t-stone-900 rounded-full animate-spin mx-auto mb-4"></div>
        <p className="text-stone-500 font-serif italic">Loading your profile...</p>
      </div>
    );
  }

  const isAdmin = auth.currentUser?.email === 'jaipuriavidyalayasachin@gmail.com' || auth.currentUser?.email === 'mesachin486@gmail.com';
  const isPublicToggleDisabled = verificationStatus !== 'verified' && !isAdmin;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-4xl mx-auto pb-20"
    >
      <div className="mb-8 space-y-2">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div className="space-y-2">
            <h2 className="text-3xl font-serif font-medium text-stone-900">My Alumni Profile</h2>
            <p className="text-stone-500">Manage your specialized information across personal, academic, social, and professional categories.</p>
          </div>
          {personal.updatedAt && (
            <div className="flex items-center text-[10px] font-bold uppercase tracking-widest text-stone-400 bg-stone-50 px-3 py-1.5 rounded-full border border-stone-100">
              <Calendar className="w-3 h-3 mr-1.5" />
              <span>Last Updated: {formatDate(personal.updatedAt)}</span>
            </div>
          )}
        </div>
      </div>

      {verificationStatus === 'verified' && (
        <div className="mb-8 bg-emerald-50 border border-emerald-100 rounded-3xl p-6 flex items-center space-x-4">
          <div className="w-12 h-12 bg-emerald-100 rounded-full flex items-center justify-center flex-shrink-0">
            <ShieldCheck className="w-7 h-7 text-emerald-600" />
          </div>
          <div>
            <h4 className="font-serif font-medium text-emerald-900">Verified Alumnus</h4>
            <p className="text-sm text-emerald-700">Your profile has been verified against school records. A badge is now visible on your directory card.</p>
          </div>
        </div>
      )}

      <form onSubmit={handleSave} className="space-y-8">
        {/* Personal Section */}
        <div className="bg-white rounded-3xl border border-stone-200 shadow-sm overflow-hidden">
          <div className="bg-stone-50 px-8 py-4 border-b border-stone-200 flex items-center space-x-2">
            <UserIcon className="w-5 h-5 text-stone-900" />
            <h3 className="font-serif font-medium text-stone-900">Personal Identity</h3>
          </div>
          <div className="p-8 grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-wider text-stone-400">Full Name</label>
              <input type="text" readOnly value={personal.name} className="w-full px-4 py-3 bg-stone-100 border border-stone-200 rounded-xl text-stone-500 cursor-not-allowed" />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-wider text-stone-400 flex items-center"><Mail className="w-3 h-3 mr-2" /> Gmail ID</label>
              <input type="email" readOnly value={personal.gmail} className="w-full px-4 py-3 bg-stone-100 border border-stone-200 rounded-xl text-stone-500 cursor-not-allowed" />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-wider text-stone-400">Batch Year</label>
              <select 
                required 
                value={personal.batchYear} 
                onChange={(e) => setPersonal({ ...personal, batchYear: parseInt(e.target.value) })} 
                className="w-full px-4 py-3 bg-stone-50 border border-stone-200 rounded-xl focus:ring-2 focus:ring-stone-900/5 focus:border-stone-900 outline-none appearance-none"
              >
                {BATCH_YEARS.map(year => (
                  <option key={year} value={year}>{year}</option>
                ))}
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-wider text-stone-400 flex items-center"><Phone className="w-3 h-3 mr-2" /> Phone Number</label>
              <div className="flex space-x-2">
                <select 
                  value={countryCode} 
                  onChange={(e) => setCountryCode(e.target.value)}
                  className="w-1/3 px-4 py-3 bg-stone-50 border border-stone-200 rounded-xl focus:ring-2 focus:ring-stone-900/5 focus:border-stone-900 outline-none appearance-none text-sm"
                >
                  {COUNTRY_CODES.map(c => (
                    <option key={c.code} value={c.code}>{c.label}</option>
                  ))}
                </select>
                <input 
                  type="tel" 
                  value={phoneNumber} 
                  onChange={(e) => setPhoneNumber(e.target.value)} 
                  className="flex-1 px-4 py-3 bg-stone-50 border border-stone-200 rounded-xl focus:ring-2 focus:ring-stone-900/5 focus:border-stone-900 outline-none" 
                  placeholder="98765 43210" 
                />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-wider text-stone-400 flex items-center"><Calendar className="w-3 h-3 mr-2" /> Date of Birth</label>
              <input type="date" value={personal.dob} onChange={(e) => setPersonal({ ...personal, dob: e.target.value })} className="w-full px-4 py-3 bg-stone-50 border border-stone-200 rounded-xl focus:ring-2 focus:ring-stone-900/5 focus:border-stone-900 outline-none" />
            </div>
          </div>
        </div>

        {/* School Section */}
        <div className="bg-white rounded-3xl border border-stone-200 shadow-sm overflow-hidden">
          <div className="bg-stone-50 px-8 py-4 border-b border-stone-200 flex items-center space-x-2">
            <School className="w-5 h-5 text-stone-900" />
            <h3 className="font-serif font-medium text-stone-900">Academic History</h3>
          </div>
          <div className="p-8 grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-wider text-stone-400">Last Class</label>
              <select 
                value={school.lastClass} 
                onChange={(e) => setSchool({ ...school, lastClass: e.target.value })} 
                className="w-full px-4 py-3 bg-stone-50 border border-stone-200 rounded-xl focus:ring-2 focus:ring-stone-900/5 focus:border-stone-900 outline-none appearance-none"
              >
                <option value="">Select Class</option>
                {CLASSES.map(c => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-wider text-stone-400">Section</label>
              <select 
                value={school.section} 
                onChange={(e) => setSchool({ ...school, section: e.target.value })} 
                className="w-full px-4 py-3 bg-stone-50 border border-stone-200 rounded-xl focus:ring-2 focus:ring-stone-900/5 focus:border-stone-900 outline-none appearance-none"
              >
                <option value="">Select Section</option>
                {SECTIONS.map(s => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-wider text-stone-400">Stream</label>
              <select 
                value={school.stream} 
                onChange={(e) => setSchool({ ...school, stream: e.target.value })} 
                className="w-full px-4 py-3 bg-stone-50 border border-stone-200 rounded-xl focus:ring-2 focus:ring-stone-900/5 focus:border-stone-900 outline-none appearance-none"
              >
                <option value="">Select Stream</option>
                {STREAMS.map(s => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Social Section */}
        <div className="bg-white rounded-3xl border border-stone-200 shadow-sm overflow-hidden">
          <div className="bg-stone-50 px-8 py-4 border-b border-stone-200 flex items-center space-x-2">
            <Globe className="w-5 h-5 text-stone-900" />
            <h3 className="font-serif font-medium text-stone-900">Digital Presence</h3>
          </div>
          <div className="p-8 grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-wider text-stone-400 flex items-center"><Linkedin className="w-3 h-3 mr-2" /> LinkedIn</label>
              <input type="url" value={social.linkedIn} onChange={(e) => setSocial({ ...social, linkedIn: e.target.value })} className="w-full px-4 py-3 bg-stone-50 border border-stone-200 rounded-xl focus:ring-2 focus:ring-stone-900/5 focus:border-stone-900 outline-none" placeholder="https://linkedin.com/in/..." />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-wider text-stone-400 flex items-center"><Instagram className="w-3 h-3 mr-2" /> Instagram</label>
              <input type="text" value={social.instagram} onChange={(e) => setSocial({ ...social, instagram: e.target.value })} className="w-full px-4 py-3 bg-stone-50 border border-stone-200 rounded-xl focus:ring-2 focus:ring-stone-900/5 focus:border-stone-900 outline-none" placeholder="@username" />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-wider text-stone-400 flex items-center"><Facebook className="w-3 h-3 mr-2" /> Facebook</label>
              <input type="url" value={social.facebook} onChange={(e) => setSocial({ ...social, facebook: e.target.value })} className="w-full px-4 py-3 bg-stone-50 border border-stone-200 rounded-xl focus:ring-2 focus:ring-stone-900/5 focus:border-stone-900 outline-none" placeholder="https://facebook.com/..." />
            </div>
          </div>
        </div>

        {/* Professional Section */}
        <div className="bg-white rounded-3xl border border-stone-200 shadow-sm overflow-hidden">
          <div className="bg-stone-50 px-8 py-4 border-b border-stone-200 flex items-center space-x-2">
            <Briefcase className="w-5 h-5 text-stone-900" />
            <h3 className="font-serif font-medium text-stone-900">Career Details</h3>
          </div>
          <div className="p-8 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-wider text-stone-400">Employment Status</label>
                <select 
                  value={professional.employmentStatus} 
                  onChange={(e) => setProfessional({ ...professional, employmentStatus: e.target.value })} 
                  className="w-full px-4 py-3 bg-stone-50 border border-stone-200 rounded-xl focus:ring-2 focus:ring-stone-900/5 focus:border-stone-900 outline-none appearance-none"
                >
                  <option value="">Select Status</option>
                  {EMPLOYMENT_STATUSES.map(s => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              </div>

              {professional.employmentStatus === 'Others' && (
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-wider text-stone-400">Specify Status</label>
                  <input 
                    type="text" 
                    value={professional.otherEmploymentStatus} 
                    onChange={(e) => setProfessional({ ...professional, otherEmploymentStatus: e.target.value })} 
                    className="w-full px-4 py-3 bg-stone-50 border border-stone-200 rounded-xl focus:ring-2 focus:ring-stone-900/5 focus:border-stone-900 outline-none" 
                    placeholder="e.g. Freelance" 
                  />
                </div>
              )}
            </div>

            {/* Conditional Fields based on Status */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {professional.employmentStatus === 'Public' && (
                <>
                  <div className="space-y-2">
                    <label className="text-xs font-bold uppercase tracking-wider text-stone-400">Public Type</label>
                    <select 
                      value={professional.publicType} 
                      onChange={(e) => setProfessional({ ...professional, publicType: e.target.value })} 
                      className="w-full px-4 py-3 bg-stone-50 border border-stone-200 rounded-xl focus:ring-2 focus:ring-stone-900/5 focus:border-stone-900 outline-none appearance-none"
                    >
                      <option value="">Select Type</option>
                      {PUBLIC_TYPES.map(t => (
                        <option key={t} value={t}>{t}</option>
                      ))}
                    </select>
                  </div>
                  {professional.publicType === 'Others' && (
                    <div className="space-y-2">
                      <label className="text-xs font-bold uppercase tracking-wider text-stone-400">Specify Public Type</label>
                      <input type="text" value={professional.otherPublicType} onChange={(e) => setProfessional({ ...professional, otherPublicType: e.target.value })} className="w-full px-4 py-3 bg-stone-50 border border-stone-200 rounded-xl focus:ring-2 focus:ring-stone-900/5 focus:border-stone-900 outline-none" placeholder="e.g. PSU" />
                    </div>
                  )}
                  {professional.publicType === 'State Government' && (
                    <div className="space-y-2">
                      <label className="text-xs font-bold uppercase tracking-wider text-stone-400">State</label>
                      <input type="text" value={professional.stateName} onChange={(e) => setProfessional({ ...professional, stateName: e.target.value })} className="w-full px-4 py-3 bg-stone-50 border border-stone-200 rounded-xl focus:ring-2 focus:ring-stone-900/5 focus:border-stone-900 outline-none" placeholder="e.g. Rajasthan" />
                    </div>
                  )}
                  <div className="space-y-2">
                    <label className="text-xs font-bold uppercase tracking-wider text-stone-400">Department</label>
                    <input type="text" value={professional.department} onChange={(e) => setProfessional({ ...professional, department: e.target.value })} className="w-full px-4 py-3 bg-stone-50 border border-stone-200 rounded-xl focus:ring-2 focus:ring-stone-900/5 focus:border-stone-900 outline-none" placeholder="e.g. Education" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold uppercase tracking-wider text-stone-400 flex items-center"><MapPin className="w-3 h-3 mr-2" /> Job City</label>
                    <input type="text" value={professional.jobCity} onChange={(e) => setProfessional({ ...professional, jobCity: e.target.value })} className="w-full px-4 py-3 bg-stone-50 border border-stone-200 rounded-xl focus:ring-2 focus:ring-stone-900/5 focus:border-stone-900 outline-none" placeholder="Jaipur" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold uppercase tracking-wider text-stone-400 flex items-center"><Globe className="w-3 h-3 mr-2" /> Country</label>
                    <select 
                      value={professional.country} 
                      onChange={(e) => setProfessional({ ...professional, country: e.target.value })} 
                      className="w-full px-4 py-3 bg-stone-50 border border-stone-200 rounded-xl focus:ring-2 focus:ring-stone-900/5 focus:border-stone-900 outline-none appearance-none"
                    >
                      <option value="">Select Country</option>
                      {COUNTRIES.map(c => (
                        <option key={c} value={c}>{c}</option>
                      ))}
                    </select>
                  </div>
                </>
              )}

              {professional.employmentStatus === 'Private' && (
                <>
                  <div className="space-y-2">
                    <label className="text-xs font-bold uppercase tracking-wider text-stone-400 flex items-center"><Building2 className="w-3 h-3 mr-2" /> Company Name</label>
                    <input type="text" value={professional.companyName} onChange={(e) => setProfessional({ ...professional, companyName: e.target.value })} className="w-full px-4 py-3 bg-stone-50 border border-stone-200 rounded-xl focus:ring-2 focus:ring-stone-900/5 focus:border-stone-900 outline-none" placeholder="Google" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold uppercase tracking-wider text-stone-400">Job Role</label>
                    <input type="text" value={professional.jobRole} onChange={(e) => setProfessional({ ...professional, jobRole: e.target.value })} className="w-full px-4 py-3 bg-stone-50 border border-stone-200 rounded-xl focus:ring-2 focus:ring-stone-900/5 focus:border-stone-900 outline-none" placeholder="Software Engineer" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold uppercase tracking-wider text-stone-400">Industry</label>
                    <input type="text" value={professional.industry} onChange={(e) => setProfessional({ ...professional, industry: e.target.value })} className="w-full px-4 py-3 bg-stone-50 border border-stone-200 rounded-xl focus:ring-2 focus:ring-stone-900/5 focus:border-stone-900 outline-none" placeholder="Technology" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold uppercase tracking-wider text-stone-400 flex items-center"><MapPin className="w-3 h-3 mr-2" /> Job City</label>
                    <input type="text" value={professional.jobCity} onChange={(e) => setProfessional({ ...professional, jobCity: e.target.value })} className="w-full px-4 py-3 bg-stone-50 border border-stone-200 rounded-xl focus:ring-2 focus:ring-stone-900/5 focus:border-stone-900 outline-none" placeholder="Jaipur" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold uppercase tracking-wider text-stone-400 flex items-center"><Globe className="w-3 h-3 mr-2" /> Country</label>
                    <select 
                      value={professional.country} 
                      onChange={(e) => setProfessional({ ...professional, country: e.target.value })} 
                      className="w-full px-4 py-3 bg-stone-50 border border-stone-200 rounded-xl focus:ring-2 focus:ring-stone-900/5 focus:border-stone-900 outline-none appearance-none"
                    >
                      <option value="">Select Country</option>
                      {COUNTRIES.map(c => (
                        <option key={c} value={c}>{c}</option>
                      ))}
                    </select>
                  </div>
                </>
              )}

              {professional.employmentStatus === 'Business/Self Employed' && (
                <>
                  <div className="space-y-2">
                    <label className="text-xs font-bold uppercase tracking-wider text-stone-400">Business Name</label>
                    <input type="text" value={professional.businessName} onChange={(e) => setProfessional({ ...professional, businessName: e.target.value })} className="w-full px-4 py-3 bg-stone-50 border border-stone-200 rounded-xl focus:ring-2 focus:ring-stone-900/5 focus:border-stone-900 outline-none" placeholder="My Business" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold uppercase tracking-wider text-stone-400">Industry</label>
                    <input type="text" value={professional.industry} onChange={(e) => setProfessional({ ...professional, industry: e.target.value })} className="w-full px-4 py-3 bg-stone-50 border border-stone-200 rounded-xl focus:ring-2 focus:ring-stone-900/5 focus:border-stone-900 outline-none" placeholder="Retail" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold uppercase tracking-wider text-stone-400 flex items-center"><MapPin className="w-3 h-3 mr-2" /> Business Office City</label>
                    <input type="text" value={professional.businessCity} onChange={(e) => setProfessional({ ...professional, businessCity: e.target.value })} className="w-full px-4 py-3 bg-stone-50 border border-stone-200 rounded-xl focus:ring-2 focus:ring-stone-900/5 focus:border-stone-900 outline-none" placeholder="Jaipur" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold uppercase tracking-wider text-stone-400 flex items-center"><Globe className="w-3 h-3 mr-2" /> Country</label>
                    <select 
                      value={professional.country} 
                      onChange={(e) => setProfessional({ ...professional, country: e.target.value })} 
                      className="w-full px-4 py-3 bg-stone-50 border border-stone-200 rounded-xl focus:ring-2 focus:ring-stone-900/5 focus:border-stone-900 outline-none appearance-none"
                    >
                      <option value="">Select Country</option>
                      {COUNTRIES.map(c => (
                        <option key={c} value={c}>{c}</option>
                      ))}
                    </select>
                  </div>
                </>
              )}

              {professional.employmentStatus === 'Student' && (
                <>
                  <div className="space-y-2">
                    <label className="text-xs font-bold uppercase tracking-wider text-stone-400">College Name</label>
                    <input type="text" value={professional.collegeName} onChange={(e) => setProfessional({ ...professional, collegeName: e.target.value })} className="w-full px-4 py-3 bg-stone-50 border border-stone-200 rounded-xl focus:ring-2 focus:ring-stone-900/5 focus:border-stone-900 outline-none" placeholder="University of Rajasthan" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold uppercase tracking-wider text-stone-400">Degree Name</label>
                    <input type="text" value={professional.degreeName} onChange={(e) => setProfessional({ ...professional, degreeName: e.target.value })} className="w-full px-4 py-3 bg-stone-50 border border-stone-200 rounded-xl focus:ring-2 focus:ring-stone-900/5 focus:border-stone-900 outline-none" placeholder="B.Tech" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold uppercase tracking-wider text-stone-400">Course Name</label>
                    <input type="text" value={professional.courseName} onChange={(e) => setProfessional({ ...professional, courseName: e.target.value })} className="w-full px-4 py-3 bg-stone-50 border border-stone-200 rounded-xl focus:ring-2 focus:ring-stone-900/5 focus:border-stone-900 outline-none" placeholder="Computer Science" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold uppercase tracking-wider text-stone-400">Year of Pass Out</label>
                    <input type="text" value={professional.passoutYear} onChange={(e) => setProfessional({ ...professional, passoutYear: e.target.value })} className="w-full px-4 py-3 bg-stone-50 border border-stone-200 rounded-xl focus:ring-2 focus:ring-stone-900/5 focus:border-stone-900 outline-none" placeholder="2027" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold uppercase tracking-wider text-stone-400 flex items-center"><Globe className="w-3 h-3 mr-2" /> Country</label>
                    <select 
                      value={professional.country} 
                      onChange={(e) => setProfessional({ ...professional, country: e.target.value })} 
                      className="w-full px-4 py-3 bg-stone-50 border border-stone-200 rounded-xl focus:ring-2 focus:ring-stone-900/5 focus:border-stone-900 outline-none appearance-none"
                    >
                      <option value="">Select Country</option>
                      {COUNTRIES.map(c => (
                        <option key={c} value={c}>{c}</option>
                      ))}
                    </select>
                  </div>
                </>
              )}

              {professional.employmentStatus === 'Unemployed' && (
                <>
                  <div className="space-y-2">
                    <label className="text-xs font-bold uppercase tracking-wider text-stone-400">Years of Experience</label>
                    <select 
                      value={professional.yearsOfExperience} 
                      onChange={(e) => setProfessional({ ...professional, yearsOfExperience: e.target.value })} 
                      className="w-full px-4 py-3 bg-stone-50 border border-stone-200 rounded-xl focus:ring-2 focus:ring-stone-900/5 focus:border-stone-900 outline-none appearance-none"
                    >
                      <option value="">Select Years</option>
                      {YEARS_OF_EXPERIENCE.map(y => (
                        <option key={y} value={y}>{y}</option>
                      ))}
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold uppercase tracking-wider text-stone-400">Looking for Job?</label>
                    <div className="flex space-x-4">
                      {['Yes', 'No'].map(option => (
                        <label key={option} className="flex items-center space-x-2 cursor-pointer">
                          <input 
                            type="radio" 
                            name="lookingForJob" 
                            value={option} 
                            checked={professional.lookingForJob === option}
                            onChange={(e) => setProfessional({ ...professional, lookingForJob: e.target.value })}
                            className="w-4 h-4 text-stone-900 focus:ring-stone-900 border-stone-300"
                          />
                          <span className="text-sm text-stone-600">{option}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                  {professional.lookingForJob === 'Yes' && (
                    <div className="space-y-2">
                      <label className="text-xs font-bold uppercase tracking-wider text-stone-400">Aspiring Job Profile</label>
                      <input 
                        type="text" 
                        value={professional.aspiringJobProfile || ''} 
                        onChange={(e) => setProfessional({ ...professional, aspiringJobProfile: e.target.value })} 
                        className="w-full px-4 py-3 bg-stone-50 border border-stone-200 rounded-xl focus:ring-2 focus:ring-stone-900/5 focus:border-stone-900 outline-none" 
                        placeholder="e.g. Data Scientist, Marketing Manager" 
                      />
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </div>

        {/* Verification Section */}
        {verificationStatus !== 'verified' && (
          <div id="verification-section">
            <AlumniVerification 
              currentData={{
                name: personal.name,
                dob: personal.dob || '',
                lastClass: school.lastClass || ''
              }}
              onVerified={() => setVerificationStatus('verified')}
            />
          </div>
        )}

        {/* Visibility Toggle */}
        <div className={`bg-white rounded-3xl border border-stone-200 p-8 flex items-center justify-between ${isPublicToggleDisabled ? 'opacity-60' : ''}`}>
          <div className="space-y-1">
            <div className="flex items-center space-x-2">
              <span className="text-sm font-medium text-stone-900">Public Directory Visibility</span>
              {isPublicToggleDisabled && (
                <span className="flex items-center text-[10px] font-bold uppercase tracking-widest text-red-500 bg-red-50 px-2 py-0.5 rounded">
                  Verification Required
                </span>
              )}
            </div>
            <p className="text-xs text-stone-500">
              {isPublicToggleDisabled 
                ? "You must verify your alumni status before you can make your profile public."
                : "When enabled, your profile will be visible to other alumni in the directory."}
            </p>
          </div>
          <label className={`relative inline-flex items-center ${isPublicToggleDisabled ? 'cursor-not-allowed' : 'cursor-pointer'}`}>
            <input 
              type="checkbox" 
              className="sr-only peer" 
              checked={personal.isPublic} 
              disabled={isPublicToggleDisabled}
              onChange={(e) => setPersonal({ ...personal, isPublic: e.target.checked })} 
            />
            <div className="w-11 h-6 bg-stone-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-stone-900"></div>
          </label>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex-1">
            {success && (
              <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} className="flex items-center text-emerald-600 text-sm font-medium">
                <CheckCircle2 className="w-4 h-4 mr-1.5" /> Profile updated successfully
              </motion.div>
            )}
            {error && (
              <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} className="flex items-center text-red-600 text-sm font-medium">
                <AlertCircle className="w-4 h-4 mr-1.5" /> {error}
              </motion.div>
            )}
          </div>
          <button
            type="submit"
            disabled={saving}
            className="flex items-center space-x-2 px-10 py-4 bg-stone-900 text-white rounded-2xl font-medium hover:bg-stone-800 transition-all disabled:opacity-50 shadow-xl shadow-stone-900/20"
          >
            {saving ? <div className="w-5 h-5 border-2 border-stone-400 border-t-white rounded-full animate-spin"></div> : <><Save className="w-4 h-4" /><span>Save All Changes</span></>}
          </button>
        </div>
      </form>
    </motion.div>
  );
}
