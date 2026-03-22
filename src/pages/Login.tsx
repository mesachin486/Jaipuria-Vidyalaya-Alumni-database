import React, { useState, useEffect } from 'react';
import { signInWithPopup, onAuthStateChanged } from 'firebase/auth';
import { auth, googleProvider, db, doc, setDoc, getDoc, serverTimestamp, handleFirestoreError, OperationType } from '../firebase';
import { collection, onSnapshot, query, getCountFromServer } from 'firebase/firestore';
import { motion } from 'motion/react';
import { GraduationCap, ShieldCheck, Users, Globe } from 'lucide-react';

export default function Login() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [userCount, setUserCount] = useState<number | null>(null);

  useEffect(() => {
    const q = query(collection(db, 'users'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setUserCount(snapshot.size);
    }, (error) => {
      console.error("Error fetching user count:", error);
    });
    return () => unsubscribe();
  }, []);

  const handleGoogleLogin = async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const user = result.user;

      // Create user document if it doesn't exist
      const userRef = doc(db, 'users', user.uid);
      let userSnap;
      try {
        userSnap = await getDoc(userRef);
      } catch (error) {
        handleFirestoreError(error, OperationType.GET, `users/${user.uid}`);
        throw error;
      }

      if (!userSnap.exists()) {
        try {
          await setDoc(userRef, {
            uid: user.uid,
            email: user.email,
            displayName: user.displayName,
            photoURL: user.photoURL,
            role: 'alumni',
            createdAt: serverTimestamp(),
          });
        } catch (error) {
          handleFirestoreError(error, OperationType.WRITE, `users/${user.uid}`);
          throw error;
        }
      }
    } catch (err: any) {
      console.error('Login error:', err);
      setError(err.message || 'Failed to sign in with Google');
    } finally {
      setLoading(false);
    }
  };

  const features = [
    { icon: Users, title: 'Network', desc: 'Connect with fellow alumni from all batches since 1993.' },
    { icon: ShieldCheck, title: 'Secure', desc: 'A private database accessible only to verified alumni.' },
    { icon: Globe, title: 'Global', desc: 'Find alumni in your city or profession across the world.' },
  ];

  return (
    <div className="min-h-[calc(100vh-8rem)] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl w-full grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="text-left"
        >
          <div className="flex items-center space-x-3 mb-6">
            <div className="w-12 h-12 bg-stone-900 flex items-center justify-center rounded-xl">
              <GraduationCap className="text-white w-7 h-7" />
            </div>
            <h1 className="text-3xl font-serif font-bold text-stone-900">Jaipuria Vidyalaya</h1>
          </div>
          <h2 className="text-5xl font-serif font-medium text-stone-900 leading-tight mb-6">
            Reconnect with your <span className="italic text-stone-500 underline decoration-stone-200 underline-offset-8">alma mater</span>.
          </h2>
          
          {userCount !== null && (
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="inline-flex items-center space-x-2 px-4 py-2 bg-stone-100 rounded-full mb-6 border border-stone-200"
            >
              <Users className="w-4 h-4 text-stone-900" />
              <span className="text-sm font-medium text-stone-900">
                <span className="font-bold">{userCount}</span> People joined
              </span>
              <div className="flex -space-x-2 ml-2">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="w-6 h-6 rounded-full border-2 border-white bg-stone-200 flex items-center justify-center overflow-hidden">
                    <img src={`https://picsum.photos/seed/user${i}/40/40`} alt="user" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                  </div>
                ))}
              </div>
            </motion.div>
          )}

          <p className="text-lg text-stone-600 mb-8 leading-relaxed">
            The official alumni network for Jaipuria Vidyalaya, Jaipur. Join our community to share experiences, find mentors, and stay connected with the school that shaped your future.
          </p>
          
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-8">
            {features.map((f, i) => (
              <div key={i} className="flex flex-col space-y-2">
                <div className="w-8 h-8 bg-stone-100 rounded-lg flex items-center justify-center">
                  <f.icon className="w-4 h-4 text-stone-600" />
                </div>
                <h3 className="font-medium text-stone-900 text-sm">{f.title}</h3>
                <p className="text-xs text-stone-500 leading-tight">{f.desc}</p>
              </div>
            ))}
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-3xl shadow-2xl shadow-stone-200/50 border border-stone-200 p-10 flex flex-col items-center text-center"
        >
          <div className="w-20 h-20 bg-stone-50 rounded-full flex items-center justify-center mb-6 border border-stone-100">
            <Users className="w-10 h-10 text-stone-400" />
          </div>
          <h3 className="text-2xl font-serif font-medium text-stone-900 mb-2">Welcome Back</h3>
          <p className="text-stone-500 mb-8">Sign in with your Google account to access the alumni directory.</p>

          {error && (
            <div className="w-full mb-6 p-4 bg-red-50 border border-red-100 rounded-xl text-red-600 text-sm">
              {error}
            </div>
          )}

          <button
            onClick={handleGoogleLogin}
            disabled={loading}
            className="w-full flex items-center justify-center space-x-3 py-4 px-6 bg-white border-2 border-stone-900 text-stone-900 rounded-2xl font-medium hover:bg-stone-900 hover:text-white transition-all disabled:opacity-50 disabled:cursor-not-allowed group"
          >
            {loading ? (
              <div className="w-5 h-5 border-2 border-stone-400 border-t-stone-900 rounded-full animate-spin"></div>
            ) : (
              <>
                <svg className="w-5 h-5 group-hover:fill-white transition-colors" viewBox="0 0 24 24">
                  <path
                    fill="currentColor"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="currentColor"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="currentColor"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"
                  />
                  <path
                    fill="currentColor"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  />
                </svg>
                <span>Continue with Google</span>
              </>
            )}
          </button>

          <p className="mt-8 text-xs text-stone-400 max-w-xs">
            By signing in, you agree to our community guidelines and privacy policy.
          </p>
        </motion.div>
      </div>
    </div>
  );
}
