import { getAuth } from "firebase/auth";
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
import { useState } from "react";
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
  const [signInWithGoogle, user, signInLoading, signInError] =
    useSignInWithGoogle(auth);
  const [signOut, signOutLoading] = useSignOut(auth);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const navigate = useNavigate();

  if (signInError) {
    return (
      <div>
        <p>signInError: {signInError.message}</p>
      </div>
    );
  }

  if (signInLoading) {
    return <CircularProgress />;
  }

  const handleMenu = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleSignIn = () => {
    signInWithGoogle().then(() => navigate("select_classes"));
  };

  const handleSignOut = () => {
    signOut().then(() => navigate(0));
  };

  return (
    <Stack sx={{ maxHeight: "100%" }}>
      <AppBar position="static" color="secondary">
        <Toolbar>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            TODO: App name
          </Typography>
          {user ? (
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
                  vertical: "top",
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
                <MenuItem onClick={handleClose}>TODO: idk</MenuItem>
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
      {user ? <Outlet /> : null}
    </Stack>
  );
}
