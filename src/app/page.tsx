"use client";
import { getAuth, signInWithEmailAndPassword, signOut } from "firebase/auth";
import { useSignInWithGoogle } from "react-firebase-hooks/auth";
import { initializeApp } from "firebase/app";
import { useEffect } from "react";
import { useRouter } from "next/navigation";

interface Config {
  [key: string]: string;
}
export default function Home() {
  const firebaseConfig: Config = {
    apiKey: "AIzaSyAyOVuEMc0Sv5sGyD0uJAhDvVA6s_nIL-Y",
    authDomain: "streamthing-5e53a.firebaseapp.com",
    projectId: "streamthing-5e53a",
    storageBucket: "streamthing-5e53a.appspot.com",
    messagingSenderId: "818193993825",
    appId: "1:818193993825:web:deac576da0795ebf10da20",
    measurementId: "G-QS0SN371FE",
  };

  const app = initializeApp(firebaseConfig);
  const auth = getAuth();
  const [signInWithGoogle, user, loading, error] = useSignInWithGoogle(auth);

  // Router for redirection
  const router = useRouter();

  // Redirect to /stream when the user is signed in
  useEffect(() => {
    if (user) {
      const username = user.user.displayName || user.user.email;
      router.push(`/stream?username=${encodeURIComponent(username!)}`);
    }
  }, [user, router]);

  if (error) {
    return (
      <div>
        <p>Error: {error.message}</p>
      </div>
    );
  }

  if (loading) {
    return <p>Loading...</p>;
  }

  // The sign-in button is displayed if the user is not signed in
  return (
    <div className="App">
      <button onClick={() => signInWithGoogle()}>Sign In</button>
    </div>
  );
}
