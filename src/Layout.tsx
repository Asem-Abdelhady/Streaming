import {
  browserLocalPersistence,
  getAuth,
  onAuthStateChanged,
  setPersistence,
} from "firebase/auth";
import { type User } from "firebase/auth";
import { useSignInWithGoogle, useSignOut } from "react-firebase-hooks/auth";
import { initializeApp } from "firebase/app";
import {
  AppBar,
  Button,
  CircularProgress,
  IconButton,
  Menu,
  MenuItem,
  Stack,
  Toolbar,
  Typography,
} from "@mui/material";
import GoogleIcon from "@mui/icons-material/Google";
import { useEffect, useState } from "react";
import { AccountCircle } from "@mui/icons-material";
import { Outlet, useNavigate } from "react-router-dom";

interface Config {
  [key: string]: string;
}

export default function Layout() {
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
  const [currentUser, setCurrentUser] = useState<User | false | undefined>(
    undefined
  );
  const [signInWithGoogle, , signInLoading, signInError] =
    useSignInWithGoogle(auth);
  const [signOut, signOutLoading] = useSignOut(auth);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setCurrentUser(user);
      } else {
        setCurrentUser(false);
      }
    });

    return () => unsubscribe();
  });

  const handleMenu = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleSignIn = () => {
    setPersistence(auth, browserLocalPersistence).then(() => {
      signInWithGoogle().then(() => {
        navigate("select_classes");
      });
    });
  };

  const handleSignOut = () => {
    signOut().then(() => navigate(0));
  };

  if (currentUser === undefined)
    return (
      <Stack
        direction={"column"}
        gap={4}
        sx={{ height: "100%", alignItems: "center", justifyContent: "center" }}
      >
        <CircularProgress />
      </Stack>
    );

  if (signInError) {
    return (
      <div>
        <p>signInError: {signInError.message}</p>
      </div>
    );
  }

  if (signInLoading) {
    return (
      <Stack
        direction={"column"}
        gap={4}
        sx={{ height: "100%", alignItems: "center", justifyContent: "center" }}
      >
        <Typography>Sigining you in...</Typography>
        <CircularProgress />
      </Stack>
    );
  }

  return (
    <Stack sx={{ height: "100%" }}>
      <AppBar position="static" color="secondary">
        <Toolbar>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            AutoAds
          </Typography>
          {currentUser ? (
            <div>
              <IconButton
                size="large"
                aria-label="account of current user"
                aria-controls="menu-appbar"
                aria-haspopup="true"
                onClick={handleMenu}
                color="inherit"
              >
                <AccountCircle />
              </IconButton>
              <Menu
                id="menu-appbar"
                anchorEl={anchorEl}
                anchorOrigin={{
                  vertical: "bottom",
                  horizontal: "right",
                }}
                keepMounted
                transformOrigin={{
                  vertical: "top",
                  horizontal: "right",
                }}
                open={Boolean(anchorEl)}
                onClose={handleClose}
              >
                <MenuItem onClick={handleSignOut} disabled={signOutLoading}>
                  Sign out
                </MenuItem>
              </Menu>
            </div>
          ) : (
            <Button
              variant="text"
              sx={{ color: "white" }}
              onClick={handleSignIn}
              startIcon={<GoogleIcon />}
            >
              Sign in with Google
            </Button>
          )}
        </Toolbar>
      </AppBar>
      {currentUser ? (
        <Stack direction={"column"} flex="1" minHeight={0}>
          <Outlet />
        </Stack>
      ) : (
        <Stack
          direction={"column"}
          gap={4}
          sx={{
            height: "100%",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Typography>Please sign in to continue</Typography>
        </Stack>
      )}
    </Stack>
  );
}
