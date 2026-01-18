// src/theme.js
import { createTheme } from '@mui/material/styles';


const primaryColor = '#efa337';
const secondaryColor = '#1F8D72';

const theme = createTheme({
  palette: {
    primary: {
      main: primaryColor, 
      light: '#F5BE6D',
      dark: '#D88E23', 
      contrastText: 'rgba(0, 0, 0, 0.87)', 
      contrastText2: '#4C4A55'
    },
    secondary: {
      main: secondaryColor, 
      light: '#5DB09C' ,
      dark: '#166F58',
      contrastText: '#ffffff', 
    },
    //(error, warning, info, success)
    success: {
        main: primaryColor, 
    },
    error: {
        main: '#dc3545', 
    },
    background: {
       default: '#f4f6f8', 
       paper: '#ffffff',   
       rightMenu: '#4C4A55',
     }
  },
  // tipografia, espaçamentos, formato dos componentes, etc.
   typography: {
     fontFamily: 'Roboto, Arial, sans-serif',
     h6: {
       fontWeight: 600,
    }
   },
  
});

export default theme;