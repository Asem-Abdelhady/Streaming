import { createTheme } from '@mui/material/styles';
import {  } from '@mui/material/colors';


const theme = createTheme({
  palette: {
    primary: {
      main: "#46ACC2",
    },
    secondary: {
      main: "#37474f",
    },
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          color: "white"
        }
      }
    }
  }
});

export default theme;
