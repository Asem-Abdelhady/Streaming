import { getAuth } from "firebase/auth";
import { useSignInWithGoogle } from "react-firebase-hooks/auth";
import { initializeApp } from "firebase/app";
import { Navigate } from "react-router-dom";
import { Button, CircularProgress } from "@mui/material";
import GoogleIcon from "@mui/icons-material/Google";

interface Config {
  [key: string]: string;
}

export default function App() {
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
  const auth = getAuth(app);
  const [signInWithGoogle, user, loading, error] = useSignInWithGoogle(auth);

  if (error) {
    return (
      <div>
        <p>Error: {error.message}</p>
      </div>
    );
  }

  if (loading) {
    return <CircularProgress />;
  }

  if (user) {
    const username = user.user.displayName || user.user.email;
    return (
      <Navigate to={`/stream?username=${encodeURIComponent(username!)}`} />
    );
  }

  return (
    <div className="App">
      <Button onClick={() => signInWithGoogle()} startIcon={<GoogleIcon />}>
        Sign in with Google
      </Button>
    </div>
  );
}
