import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { onAuthStateChanged, User } from 'firebase/auth';
import { auth, db, handleFirestoreError, OperationType } from './firebase';
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { ErrorBoundary } from './components/ErrorBoundary';
import Navbar from './components/Navbar';
import BottomNav from './components/BottomNav';
import Home from './pages/Home';
import Profile from './pages/Profile';
import Login from './pages/Login';
import { motion, AnimatePresence } from 'motion/react';

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAuthReady, setIsAuthReady] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        // Ensure user record exists in Firestore
        try {
          const userDocRef = doc(db, 'users', currentUser.uid);
          const userDoc = await getDoc(userDocRef);
          
          if (!userDoc.exists()) {
            await setDoc(userDocRef, {
              uid: currentUser.uid,
              email: currentUser.email,
              displayName: currentUser.displayName,
              photoURL: currentUser.photoURL,
              role: 'alumni',
              createdAt: serverTimestamp(),
            });
          }
          setUser(currentUser);
        } catch (error: any) {
          console.error("Firestore initialization error:", error);
          if (error.message?.includes('offline')) {
            // If offline, we still set the user so they can see the UI, 
            // but subsequent writes will likely fail until the DB is created.
            setUser(currentUser);
          } else {
            handleFirestoreError(error, OperationType.WRITE, `users/${currentUser.uid}`);
          }
        }
      } else {
        setUser(null);
      }
      setLoading(false);
      setIsAuthReady(true);
    });

    return () => unsubscribe();
  }, []);

  if (loading || !isAuthReady) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-stone-50">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center"
        >
          <div className="w-12 h-12 border-4 border-stone-200 border-t-stone-900 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-stone-600 font-serif italic">Jaipuria Vidyalaya Alumni Network...</p>
        </motion.div>
      </div>
    );
  }

  return (
    <ErrorBoundary>
      <Router>
        <div className="h-[100dvh] flex flex-col bg-stone-50 text-stone-900 font-sans selection:bg-stone-200 overflow-hidden">
          {user && <Navbar user={user} />}
          <main className="flex-1 overflow-y-auto scroll-smooth">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
              <AnimatePresence mode="wait">
                <Routes>
                  <Route path="/login" element={!user ? <Login /> : <Navigate to="/profile" />} />
                  <Route path="/" element={user ? <Navigate to="/profile" /> : <Navigate to="/login" />} />
                  <Route path="/directory" element={user ? <Home /> : <Navigate to="/login" />} />
                  <Route path="/profile" element={user ? <Profile /> : <Navigate to="/login" />} />
                  <Route path="*" element={<Navigate to="/" />} />
                </Routes>
              </AnimatePresence>
            </div>
          </main>
          {user && <BottomNav />}
        </div>
      </Router>
    </ErrorBoundary>
  );
}
