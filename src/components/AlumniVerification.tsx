import React, { useState } from 'react';
import { GoogleGenAI } from "@google/genai";
import { auth, db, handleFirestoreError, OperationType, doc, setDoc, serverTimestamp } from '../firebase';
import { motion } from 'motion/react';
import { FileUp, CheckCircle2, AlertCircle, Loader2, ShieldCheck, Trash2 } from 'lucide-react';

interface VerificationProps {
  currentData: {
    name: string;
    dob: string;
    lastClass: string;
  };
  onVerified: () => void;
}

export default function AlumniVerification({ currentData, onVerified }: VerificationProps) {
  const [file, setFile] = useState<File | null>(null);
  const [verifying, setVerifying] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
      setError(null);
    }
  };

  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => {
        const base64String = (reader.result as string).split(',')[1];
        resolve(base64String);
      };
      reader.onerror = (error) => reject(error);
    });
  };

  const verifyAlumni = async () => {
    if (!file || !auth.currentUser) return;

    setVerifying(true);
    setError(null);

    try {
      const base64Data = await fileToBase64(file);
      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY! });
      
      const prompt = `
        You are an automated alumni verification system for "Jaipuria Vidyalaya".
        Analyze the provided marksheet/document and extract the following details:
        1. School Name (Must be "Jaipuria Vidyalaya" or similar)
        2. Student Name
        3. Date of Birth (DOB)
        4. Class

        Compare these extracted details with the following user profile data:
        - Profile Name: ${currentData.name}
        - Profile DOB: ${currentData.dob}
        - Profile Class: ${currentData.lastClass}

        Return a JSON object with the following structure:
        {
          "isVerified": boolean,
          "extractedData": {
            "schoolName": string,
            "studentName": string,
            "dob": string,
            "class": string
          },
          "matchDetails": {
            "nameMatch": boolean,
            "dobMatch": boolean,
            "classMatch": boolean,
            "schoolMatch": boolean
          },
          "reason": string (if not verified)
        }

        Verification Criteria:
        - School Name must contain "Jaipuria Vidyalaya".
        - Student Name must be a close match to the Profile Name.
        - DOB must match the Profile DOB (IMPORTANT: If the extracted class is "XII" or "12th", ignore the DOB match requirement as it may not be present on the certificate).
        - Class must match the Profile Class.
      `;

      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: [
          {
            parts: [
              { text: prompt },
              {
                inlineData: {
                  mimeType: file.type,
                  data: base64Data
                }
              }
            ]
          }
        ],
        config: {
          responseMimeType: "application/json"
        }
      });

      const result = JSON.parse(response.text || '{}');

      if (result.isVerified) {
        const uid = auth.currentUser.uid;
        await setDoc(doc(db, 'alumni_verification', uid), {
          uid,
          status: 'verified',
          verifiedAt: serverTimestamp(),
          method: 'marksheet_ocr',
          extractedData: result.extractedData
        });
        setSuccess(true);
        onVerified();
      } else {
        setError(result.reason || "Verification failed. The details on the document do not match your profile.");
      }

    } catch (err) {
      console.error("Verification error:", err);
      setError("An error occurred during verification. Please ensure the file is clear and try again.");
    } finally {
      setVerifying(false);
      // "Delete" the file from state (it was never uploaded to a server, only processed in memory)
      setFile(null);
    }
  };

  return (
    <div className="bg-stone-50 rounded-2xl p-6 border border-stone-200">
      <div className="flex items-center space-x-3 mb-4">
        <ShieldCheck className="w-6 h-6 text-stone-900" />
        <h3 className="font-serif font-medium text-lg text-stone-900">Alumni Verification</h3>
      </div>

      {!success ? (
        <div className="space-y-4">
          <p className="text-sm text-stone-600">
            Upload your marksheet from the last class attended at Jaipuria Vidyalaya to get a verified badge. 
            Our AI will verify your Name, DOB, and Class automatically. (Note: DOB matching is skipped for Class XII certificates).
          </p>

          <div className="flex flex-col items-center justify-center border-2 border-dashed border-stone-300 rounded-xl p-8 bg-white transition-all hover:border-stone-400">
            {file ? (
              <div className="flex flex-col items-center space-y-3">
                <div className="p-3 bg-stone-100 rounded-full">
                  <CheckCircle2 className="w-8 h-8 text-emerald-600" />
                </div>
                <div className="text-center">
                  <p className="text-sm font-medium text-stone-900">{file.name}</p>
                  <p className="text-xs text-stone-500">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                </div>
                <button 
                  onClick={() => setFile(null)}
                  className="text-xs text-red-600 hover:underline flex items-center"
                >
                  <Trash2 className="w-3 h-3 mr-1" /> Remove
                </button>
              </div>
            ) : (
              <label className="flex flex-col items-center cursor-pointer space-y-2">
                <div className="p-3 bg-stone-100 rounded-full">
                  <FileUp className="w-8 h-8 text-stone-400" />
                </div>
                <div className="text-center">
                  <p className="text-sm font-medium text-stone-900">Click to upload or drag and drop</p>
                  <p className="text-xs text-stone-500">PDF, PNG, or JPG (max 5MB)</p>
                </div>
                <input type="file" className="hidden" accept=".pdf,image/*" onChange={handleFileChange} />
              </label>
            )}
          </div>

          {error && (
            <div className="flex items-start space-x-2 p-3 bg-red-50 border border-red-100 rounded-lg text-red-700 text-xs">
              <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <button
            onClick={verifyAlumni}
            disabled={!file || verifying}
            className="w-full py-3 bg-stone-900 text-white rounded-xl font-medium hover:bg-stone-800 transition-all disabled:opacity-50 flex items-center justify-center space-x-2"
          >
            {verifying ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Verifying with AI...</span>
              </>
            ) : (
              <>
                <ShieldCheck className="w-4 h-4" />
                <span>Verify My Profile</span>
              </>
            )}
          </button>
        </div>
      ) : (
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="flex flex-col items-center py-8 space-y-4 text-center"
        >
          <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center">
            <CheckCircle2 className="w-10 h-10 text-emerald-600" />
          </div>
          <div className="space-y-1">
            <h4 className="font-serif font-medium text-xl text-stone-900">Verification Successful!</h4>
            <p className="text-sm text-stone-500">Your profile is now verified. A badge will appear on your directory card.</p>
          </div>
        </motion.div>
      )}
    </div>
  );
}
