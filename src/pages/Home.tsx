import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { collection, query, where, onSnapshot, orderBy, getDocs, setDoc, doc, getDoc, serverTimestamp } from 'firebase/firestore';
import { db, handleFirestoreError, OperationType, auth } from '../firebase';
import { motion, AnimatePresence } from 'motion/react';
import { Search, Filter, User as UserIcon, Linkedin, MapPin, Briefcase, GraduationCap, Globe, Instagram, Facebook, Mail, Phone, Calendar, Database, ShieldCheck } from 'lucide-react';

interface AlumniCombined {
  uid: string;
  name: string;
  batchYear: number;
  phone?: string;
  dob?: string;
  isPublic: boolean;
  // Professional
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
  company?: string;
  city?: string;
  // Social
  linkedIn?: string;
  instagram?: string;
  facebook?: string;
  gmail?: string;
  // School
  lastClass?: string;
  section?: string;
  stream?: string;
  // Verification
  isVerified?: boolean;
  updatedAt?: any;
}

export default function Home() {
  const [alumni, setAlumni] = useState<AlumniCombined[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedBatch, setSelectedBatch] = useState<string>('all');
  const [filters, setFilters] = useState({
    stream: 'all',
    employmentStatus: 'all',
    city: 'all',
    industry: 'all'
  });
  const [showFilters, setShowFilters] = useState(false);
  const [seeding, setSeeding] = useState(false);
  const [viewerVerificationStatus, setViewerVerificationStatus] = useState<'unverified' | 'pending' | 'verified' | 'rejected'>('unverified');
  const [checkingVerification, setCheckingVerification] = useState(true);

  const seedTestData = async () => {
    setSeeding(true);
    const firstNames = ['Aarav', 'Vihaan', 'Aditya', 'Arjun', 'Sai', 'Ishaan', 'Aaryan', 'Krishna', 'Ananya', 'Diya', 'Pari', 'Saanvi', 'Ira', 'Kyra', 'Riya', 'Aadhya'];
    const lastNames = ['Sharma', 'Verma', 'Gupta', 'Singh', 'Jain', 'Agarwal', 'Mehta', 'Kumar', 'Patel', 'Reddy', 'Nair', 'Iyer', 'Choudhary', 'Yadav'];
    const cities = ['Jaipur', 'Delhi', 'Mumbai', 'Bangalore', 'Pune', 'Hyderabad', 'Ahmedabad', 'Chennai', 'Kolkata', 'Gurgaon'];
    const roles = ['Software Engineer', 'Product Manager', 'Data Scientist', 'Doctor', 'Architect', 'Lawyer', 'Entrepreneur', 'Marketing Head', 'Civil Servant', 'Teacher'];
    const companies = ['Google', 'Microsoft', 'Amazon', 'TCS', 'Infosys', 'Zomato', 'Paytm', 'Reliance', 'HDFC', 'Self-employed'];
    const streams = ['Maths', 'Biology', 'Commerce', 'Pre 11th', 'Humanities'];
    const classes = ['VI', 'VII', 'VIII', 'IX', 'X', 'XI', 'XII'];
    const sections = ['A', 'B', 'C', 'D', 'E'];

    try {
      for (let i = 1; i <= 20; i++) {
        const uid = `test_alumni_${Math.random().toString(36).substring(7)}`;
        const name = `${firstNames[Math.floor(Math.random() * firstNames.length)]} ${lastNames[Math.floor(Math.random() * lastNames.length)]}`;
        const batchYear = 1993 + Math.floor(Math.random() * (new Date().getFullYear() - 1993 + 1));
        
        const personal = {
          uid,
          name,
          batchYear,
          phone: `+91 ${Math.floor(7000000000 + Math.random() * 2999999999)}`,
          dob: `19${70 + Math.floor(Math.random() * 30)}-0${1 + Math.floor(Math.random() * 9)}-${10 + Math.floor(Math.random() * 18)}`,
          isPublic: false,
          updatedAt: serverTimestamp(),
        };

        const school = {
          uid,
          lastClass: classes[Math.floor(Math.random() * classes.length)],
          section: sections[Math.floor(Math.random() * sections.length)],
          stream: streams[Math.floor(Math.random() * streams.length)],
        };

        const social = {
          uid,
          gmail: `${name.toLowerCase().replace(' ', '.')}@gmail.com`,
          linkedIn: `https://linkedin.com/in/${name.toLowerCase().replace(' ', '-')}`,
          instagram: `@${name.toLowerCase().replace(' ', '_')}`,
        };

        const employmentStatuses = ['Public', 'Private', 'Business/Self Employed', 'Student', 'Unemployed', 'Others'];
        const status = employmentStatuses[Math.floor(Math.random() * employmentStatuses.length)];
        
        let professional: any = {
          uid,
          employmentStatus: status,
          industry: 'Technology',
        };

        if (status === 'Public') {
          const publicTypes = ['State Government', 'Central Government', 'Others'];
          const pType = publicTypes[Math.floor(Math.random() * publicTypes.length)];
          professional.publicType = pType;
          professional.department = 'Education';
          professional.jobCity = cities[Math.floor(Math.random() * cities.length)];
          if (pType === 'State Government') professional.stateName = 'Rajasthan';
        } else if (status === 'Private') {
          professional.jobRole = roles[Math.floor(Math.random() * roles.length)];
          professional.companyName = companies[Math.floor(Math.random() * companies.length)];
          professional.jobCity = cities[Math.floor(Math.random() * cities.length)];
        } else if (status === 'Business/Self Employed') {
          professional.businessName = `${name}'s Venture`;
          professional.businessCity = cities[Math.floor(Math.random() * cities.length)];
        } else if (status === 'Student') {
          professional.collegeName = 'IIT Delhi';
          professional.degreeName = 'B.Tech';
          professional.courseName = 'Computer Science';
          professional.passoutYear = '2025';
        } else if (status === 'Unemployed') {
          professional.lookingForJob = 'Yes';
        } else {
          professional.otherEmploymentStatus = 'Freelancer';
        }

        await Promise.all([
          setDoc(doc(db, 'alumni_personal', uid), personal),
          setDoc(doc(db, 'alumni_school', uid), school),
          setDoc(doc(db, 'alumni_social', uid), social),
          setDoc(doc(db, 'alumni_professional', uid), professional),
          setDoc(doc(db, 'alumni_verification', uid), {
            uid,
            status: 'verified',
            verifiedAt: serverTimestamp(),
            method: 'seed_data'
          }),
          setDoc(doc(db, 'users', uid), { 
            uid, 
            email: social.gmail, 
            role: 'alumni', 
            displayName: name,
            createdAt: serverTimestamp()
          })
        ]);
      }
      // Data will update automatically via onSnapshot
    } catch (error) {
      console.error("Error seeding data:", error);
    } finally {
      setSeeding(false);
    }
  };

  useEffect(() => {
    const fetchAlumniData = async () => {
      // Only fetch if verified or admin
      if (viewerVerificationStatus !== 'verified' && auth.currentUser?.email !== 'jaipuriavidyalayasachin@gmail.com' && auth.currentUser?.email !== 'mesachin486@gmail.com') {
        setLoading(false);
        return;
      }

      const q = query(
        collection(db, 'alumni_personal'),
        where('isPublic', '==', true),
        orderBy('batchYear', 'desc')
      );

      const unsubscribe = onSnapshot(q, async (snapshot) => {
        const personalData = snapshot.docs.map(doc => doc.data());
        const uids = personalData.map(p => p.uid);

        if (uids.length === 0) {
          setAlumni([]);
          setLoading(false);
          return;
        }

        // Fetch professional and social data for these UIDs
        // Note: In a large scale app, we'd use a more efficient way to "join"
        try {
          const fetchCollection = async (collectionName: string) => {
            try {
              return await getDocs(collection(db, collectionName));
            } catch (error) {
              handleFirestoreError(error, OperationType.LIST, collectionName);
              throw error;
            }
          };

          const [profSnap, socialSnap, schoolSnap, verificationSnap] = await Promise.all([
            fetchCollection('alumni_professional'),
            fetchCollection('alumni_social'),
            fetchCollection('alumni_school'),
            fetchCollection('alumni_verification')
          ]);

          const profMap = new Map();
          profSnap.docs.forEach(doc => profMap.set(doc.id, doc.data()));

          const socialMap = new Map();
          socialSnap.docs.forEach(doc => socialMap.set(doc.id, doc.data()));

          const socialData = Array.from(socialMap.values());

          const schoolMap = new Map();
          schoolSnap.docs.forEach(doc => schoolMap.set(doc.id, doc.data()));

          const verificationMap = new Map();
          verificationSnap.docs.forEach(doc => verificationMap.set(doc.id, doc.data()));

          const combined: AlumniCombined[] = personalData.map(p => ({
            ...p,
            ...profMap.get(p.uid),
            ...socialMap.get(p.uid),
            ...schoolMap.get(p.uid),
            isVerified: verificationMap.get(p.uid)?.status === 'verified'
          })) as AlumniCombined[];

          setAlumni(combined);
        } catch (err) {
          console.error("Error fetching joined data:", err);
        } finally {
          setLoading(false);
        }
      }, (error) => {
        handleFirestoreError(error, OperationType.LIST, 'alumni_personal');
      });

      return () => unsubscribe();
    };

    fetchAlumniData();
  }, [viewerVerificationStatus]);

  useEffect(() => {
    const checkViewerVerification = async () => {
      if (!auth.currentUser) {
        setCheckingVerification(false);
        return;
      }
      try {
        const snap = await getDoc(doc(db, 'alumni_verification', auth.currentUser.uid));
        if (snap.exists()) {
          setViewerVerificationStatus(snap.data().status);
        }
      } catch (err) {
        console.error("Error checking viewer verification:", err);
      } finally {
        setCheckingVerification(false);
      }
    };

    checkViewerVerification();
  }, []);

  const filteredAlumni = alumni.filter(person => {
    const matchesSearch = 
      person.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      person.jobRole?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      person.company?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      person.city?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      person.industry?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesBatch = selectedBatch === 'all' || person.batchYear.toString() === selectedBatch;
    const matchesStream = filters.stream === 'all' || person.stream === filters.stream;
    const matchesEmploymentStatus = filters.employmentStatus === 'all' || person.employmentStatus === filters.employmentStatus;
    const matchesCity = filters.city === 'all' || person.jobCity === filters.city || person.businessCity === filters.city || person.city === filters.city;
    const matchesIndustry = filters.industry === 'all' || person.industry === filters.industry;
    
    return matchesSearch && matchesBatch && matchesStream && matchesEmploymentStatus && matchesCity && matchesIndustry;
  });

  const formatDate = (timestamp: any) => {
    if (!timestamp) return null;
    try {
      const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
      return date.toLocaleDateString('en-IN', {
        day: 'numeric',
        month: 'short',
        year: 'numeric'
      });
    } catch (e) {
      return null;
    }
  };

  const batchYears = Array.from(new Set(alumni.map(a => Number(a.batchYear)))).sort((a, b) => Number(b) - Number(a));
  const streams = Array.from(new Set(alumni.map(a => a.stream).filter(Boolean))).sort();
  const employmentStatuses = Array.from(new Set(alumni.map(a => a.employmentStatus).filter(Boolean))).sort();
  const cities = Array.from(new Set([
    ...alumni.map(a => a.jobCity).filter(Boolean),
    ...alumni.map(a => a.businessCity).filter(Boolean),
    ...alumni.map(a => a.city).filter(Boolean)
  ])).sort();
  const industries = Array.from(new Set(alumni.map(a => a.industry).filter(Boolean))).sort();

  const activeFilterCount = [
    selectedBatch !== 'all',
    filters.stream !== 'all',
    filters.employmentStatus !== 'all',
    filters.city !== 'all',
    filters.industry !== 'all'
  ].filter(Boolean).length;

  const clearFilters = () => {
    setSelectedBatch('all');
    setFilters({
      stream: 'all',
      employmentStatus: 'all',
      city: 'all',
      industry: 'all'
    });
    setSearchTerm('');
  };

  const isBlurred = viewerVerificationStatus !== 'verified';

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="space-y-8 relative"
    >
      <div className={`sticky top-0 z-40 bg-stone-50/90 backdrop-blur-sm py-4 -mx-4 px-4 sm:-mx-6 sm:px-6 lg:-mx-8 lg:px-8 border-b border-stone-200/50 mb-4 space-y-4 ${isBlurred ? 'pointer-events-none' : ''}`}>
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="space-y-2">
            <h2 className="text-3xl font-serif font-medium text-stone-900">Alumni Directory</h2>
            <p className="text-stone-500">Discover and connect with fellow Jaipuria Vidyalaya graduates across the globe.</p>
            {auth.currentUser?.email === 'jaipuriavidyalayasachin@gmail.com' && (
              <button 
                onClick={seedTestData} 
                disabled={seeding}
                className="flex items-center space-x-2 text-[10px] font-bold uppercase tracking-widest text-stone-400 hover:text-stone-900 transition-colors disabled:opacity-50"
              >
                <Database className="w-3 h-3" />
                <span>{seeding ? 'Seeding...' : 'Seed 20 Test Alumni'}</span>
              </button>
            )}
          </div>

          <div className="flex flex-col sm:flex-row gap-4 w-full md:w-auto">
            <div className="relative flex-1 sm:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
              <input
                type="text"
                placeholder="Search by name, role, city..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-white border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-stone-900/5 focus:border-stone-900 transition-all text-sm"
              />
            </div>
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`flex items-center space-x-2 px-4 py-2 rounded-xl border transition-all text-sm font-medium ${
                showFilters || activeFilterCount > 0
                  ? 'bg-stone-900 text-white border-stone-900'
                  : 'bg-white text-stone-600 border-stone-200 hover:border-stone-900'
              }`}
            >
              <Filter className="w-4 h-4" />
              <span>Filters</span>
              {activeFilterCount > 0 && (
                <span className="flex items-center justify-center w-5 h-5 bg-white text-stone-900 rounded-full text-[10px] font-bold">
                  {activeFilterCount}
                </span>
              )}
            </button>
          </div>
        </div>

        <AnimatePresence>
          {showFilters && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden"
            >
              <div className="p-6 bg-stone-50 rounded-3xl border border-stone-200 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-stone-400 ml-1">Batch Year</label>
                  <select
                    value={selectedBatch}
                    onChange={(e) => setSelectedBatch(e.target.value)}
                    className="w-full px-4 py-2 bg-white border border-stone-200 rounded-xl focus:outline-none focus:border-stone-900 text-sm appearance-none"
                  >
                    <option value="all">All Batches</option>
                    {batchYears.map(year => (
                      <option key={year} value={year.toString()}>Class of {year}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-stone-400 ml-1">Stream</label>
                  <select
                    value={filters.stream}
                    onChange={(e) => setFilters({ ...filters, stream: e.target.value })}
                    className="w-full px-4 py-2 bg-white border border-stone-200 rounded-xl focus:outline-none focus:border-stone-900 text-sm appearance-none"
                  >
                    <option value="all">All Streams</option>
                    {streams.map(s => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-stone-400 ml-1">Employment</label>
                  <select
                    value={filters.employmentStatus}
                    onChange={(e) => setFilters({ ...filters, employmentStatus: e.target.value })}
                    className="w-full px-4 py-2 bg-white border border-stone-200 rounded-xl focus:outline-none focus:border-stone-900 text-sm appearance-none"
                  >
                    <option value="all">All Statuses</option>
                    {employmentStatuses.map(s => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-stone-400 ml-1">Industry</label>
                  <select
                    value={filters.industry}
                    onChange={(e) => setFilters({ ...filters, industry: e.target.value })}
                    className="w-full px-4 py-2 bg-white border border-stone-200 rounded-xl focus:outline-none focus:border-stone-900 text-sm appearance-none"
                  >
                    <option value="all">All Industries</option>
                    {industries.map(i => (
                      <option key={i} value={i}>{i}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-stone-400 ml-1">City</label>
                  <div className="flex items-center space-x-2">
                    <select
                      value={filters.city}
                      onChange={(e) => setFilters({ ...filters, city: e.target.value })}
                      className="flex-1 px-4 py-2 bg-white border border-stone-200 rounded-xl focus:outline-none focus:border-stone-900 text-sm appearance-none"
                    >
                      <option value="all">All Cities</option>
                      {cities.map(c => (
                        <option key={c} value={c}>{c}</option>
                      ))}
                    </select>
                    {activeFilterCount > 0 && (
                      <button
                        onClick={clearFilters}
                        className="p-2 text-stone-400 hover:text-red-500 transition-colors"
                        title="Clear all filters"
                      >
                        <Database className="w-4 h-4 rotate-180" />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {loading || checkingVerification ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map(i => (
            <div key={i} className="h-64 bg-stone-100 rounded-2xl animate-pulse"></div>
          ))}
        </div>
      ) : (
        <div className="relative">
          {isBlurred && (
            <div className="absolute inset-0 z-50 pointer-events-none">
              <div className="sticky top-24 md:top-48 flex items-center justify-center p-4 pointer-events-auto">
                <div className="bg-white/80 backdrop-blur-md border border-stone-200 p-8 rounded-3xl shadow-2xl max-w-md text-center space-y-6">
                  <div className="w-16 h-16 bg-stone-900 text-white rounded-2xl flex items-center justify-center mx-auto shadow-lg">
                    <ShieldCheck className="w-8 h-8" />
                  </div>
                  <div className="space-y-2">
                    <h3 className="text-2xl font-serif font-medium text-stone-900">Verification Required</h3>
                    <p className="text-stone-600">
                      To maintain the privacy and integrity of our alumni network, the directory is only accessible to verified alumni.
                    </p>
                  </div>
                  <div className="pt-4">
                    <Link 
                      to="/profile#verification-section" 
                      className="inline-flex items-center space-x-2 px-8 py-3 bg-stone-900 text-white rounded-xl font-medium hover:bg-stone-800 transition-all shadow-lg shadow-stone-900/20"
                    >
                      <span>Verify My Profile</span>
                      <ShieldCheck className="w-4 h-4" />
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          )}
          
          {filteredAlumni.length > 0 ? (
            <div className={`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 transition-all duration-700 ${isBlurred ? 'blur-md select-none opacity-40 grayscale' : ''}`}>
              <AnimatePresence>
                {filteredAlumni.map((person) => (
                  <motion.div
                    key={person.uid}
                    layout
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className="group bg-white rounded-2xl border border-stone-200 p-6 hover:shadow-xl hover:shadow-stone-200/50 transition-all duration-300"
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div className="w-14 h-14 bg-stone-50 rounded-xl flex items-center justify-center border border-stone-100 group-hover:bg-stone-900 group-hover:text-white transition-colors duration-300">
                        <UserIcon className="w-7 h-7" />
                      </div>
                      <div className="px-3 py-1 bg-stone-100 text-stone-600 rounded-full text-[10px] font-bold uppercase tracking-wider">
                        Class of {person.batchYear}
                      </div>
                    </div>

                    <div className="space-y-4">
                      <div>
                        <div className="flex items-center space-x-2 mb-1">
                          <h3 className="text-xl font-serif font-medium text-stone-900 group-hover:text-stone-700 transition-colors">
                            {person.name}
                          </h3>
                          {person.isVerified && (
                            <div className="flex items-center text-emerald-600" title="Verified Alumnus">
                              <ShieldCheck className="w-5 h-5" />
                            </div>
                          )}
                        </div>
                        <div className="flex items-center text-stone-50 text-sm mt-1">
                          <div className="flex items-center text-stone-500">
                            <Briefcase className="w-3.5 h-3.5 mr-1.5" />
                            <span>
                              {person.employmentStatus === 'Student' ? (
                                `${person.degreeName || 'Student'} @ ${person.collegeName || 'College'}`
                              ) : person.employmentStatus === 'Business/Self Employed' ? (
                                `${person.businessName || 'Business Owner'}`
                              ) : person.employmentStatus === 'Public' ? (
                                `${person.jobRole || person.department || 'Public Servant'}`
                              ) : person.employmentStatus === 'Unemployed' && person.lookingForJob === 'Yes' ? (
                                `Aspiring ${person.aspiringJobProfile || 'Professional'}`
                              ) : (
                                `${person.jobRole || 'Alumnus'} ${person.companyName ? `@ ${person.companyName}` : ''}`
                              )}
                            </span>
                          </div>
                        </div>
                        {(person.stream || person.lastClass) && (
                          <div className="flex items-center text-stone-400 text-xs mt-1">
                            <GraduationCap className="w-3 h-3 mr-1.5" />
                            <span>{person.stream || ''} {person.lastClass ? `(Class ${person.lastClass}${person.section ? `-${person.section}` : ''})` : ''}</span>
                          </div>
                        )}
                        {(person.industry || person.employmentStatus) && (
                          <div className="text-[10px] text-stone-400 uppercase tracking-widest mt-1 font-bold flex items-center space-x-2">
                            {person.industry && <span>{person.industry}</span>}
                            {person.industry && person.employmentStatus && <span className="w-1 h-1 bg-stone-300 rounded-full"></span>}
                            {person.employmentStatus && (
                              <span>{person.employmentStatus === 'Others' ? person.otherEmploymentStatus : person.employmentStatus}</span>
                            )}
                          </div>
                        )}
                      </div>

                      <div className="pt-4 border-t border-stone-100 flex flex-col space-y-2">
                        <div className="flex items-center justify-between">
                          <div className="flex flex-col space-y-1">
                            <div className="flex items-center text-stone-400 text-xs">
                              <MapPin className="w-3 h-3 mr-1" />
                              <span>{person.jobCity || person.businessCity || person.city || 'Location N/A'}</span>
                            </div>
                            {person.updatedAt && (
                              <div className="flex items-center text-[9px] font-bold uppercase tracking-widest text-stone-300">
                                <Calendar className="w-2.5 h-2.5 mr-1" />
                                <span>Updated: {formatDate(person.updatedAt)}</span>
                              </div>
                            )}
                            {person.gmail && (
                              <a 
                                href={`mailto:${person.gmail}`}
                                className="flex items-center text-stone-400 hover:text-stone-900 transition-colors text-[10px]"
                              >
                                <Mail className="w-2.5 h-2.5 mr-1" />
                                <span className="truncate max-w-[120px]">{person.gmail}</span>
                              </a>
                            )}
                          </div>
                          <div className="flex items-center space-x-1.5">
                            {person.linkedIn && (
                              <a
                                href={person.linkedIn}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="p-1.5 bg-stone-50 text-stone-400 hover:text-[#0077b5] hover:bg-[#0077b5]/5 rounded-lg transition-all"
                              >
                                <Linkedin className="w-3.5 h-3.5" />
                              </a>
                            )}
                            {person.instagram && (
                              <a
                                href={person.instagram.startsWith('http') ? person.instagram : `https://instagram.com/${person.instagram.replace('@', '')}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="p-1.5 bg-stone-50 text-stone-400 hover:text-[#E4405F] hover:bg-[#E4405F]/5 rounded-lg transition-all"
                              >
                                <Instagram className="w-3.5 h-3.5" />
                              </a>
                            )}
                            {person.facebook && (
                              <a
                                href={person.facebook}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="p-1.5 bg-stone-50 text-stone-400 hover:text-[#1877F2] hover:bg-[#1877F2]/5 rounded-lg transition-all"
                              >
                                <Facebook className="w-3.5 h-3.5" />
                              </a>
                            )}
                          </div>
                        </div>

                        {(person.phone || person.dob) && (
                          <div className="flex items-center space-x-4 pt-2 border-t border-stone-50">
                            {person.phone && (
                              <a 
                                href={`tel:${person.phone.replace(/\s+/g, '')}`}
                                className="flex items-center text-stone-400 hover:text-stone-900 transition-colors text-[10px]"
                              >
                                <Phone className="w-2.5 h-2.5 mr-1" />
                                <span>{person.phone}</span>
                              </a>
                            )}
                            {person.dob && (
                              <div className="flex items-center text-stone-400 text-[10px]">
                                <Calendar className="w-2.5 h-2.5 mr-1" />
                                <span>{person.dob}</span>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          ) : (
            <div className="py-20 text-center bg-white rounded-3xl border border-dashed border-stone-200">
              <div className="w-16 h-16 bg-stone-50 rounded-full flex items-center justify-center mx-auto mb-4">
                <Search className="w-8 h-8 text-stone-300" />
              </div>
              <h3 className="text-xl font-serif font-medium text-stone-900">No alumni found</h3>
              <p className="text-stone-500 mt-2">Try adjusting your search or filter criteria.</p>
            </div>
          )}
        </div>
      )}
    </motion.div>
  );
}
