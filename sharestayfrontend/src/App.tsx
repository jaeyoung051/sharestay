// npm install \
// react react-dom react-router-dom \
// @mui/material @mui/icons-material 
// @emotion/react @emotion/styled \
// axios \
// react-hook-form @hookform/resolvers \
// zod \
// @fontsource/roboto \
// @react-oauth/google
// npm install firebase
// npm install --save firebase

// src/App.tsx
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { GoogleOAuthProvider } from "@react-oauth/google";
import { CssBaseline, ThemeProvider, createTheme } from "@mui/material";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Profile from "./pages/Profile";
import Guide from "./pages/Guide";
import Rooms from "./pages/Rooms";
import RoomDetail from "./pages/RoomDetail";
import ListRoom from "./pages/ListRoom";
import EditRoom from "./pages/EditRoom";
import ForgotPassword from "./pages/ForgotPassword";
import Terms from "./pages/Terms";
import Privacy from "./pages/Privacy";
import LifestyleSetup from "./pages/LifestyleSetup";
import LoginSuccess from "./pages/LoginSuccess";
import ProtectedRoute from "./routes/ProtectedRoute";
import RoomMap from "./pages/RoomMap";
import { AuthProvider } from "./auth/AuthContext";
import AdminDashboard from "./pages/AdminDashboard";
import ContactBoard from "./pages/ContactBoard";
import Contact from "./pages/Contact";

const theme = createTheme({
  palette: {
    primary: {
      main: "#0c51ff",
      contrastText: "#ffffff",
    },
    secondary: {
      main: "#0c51ff",
    },
    info: {
      main: "#0c51ff",
    },
  },
  components: {
    MuiLink: {
      styleOverrides: {
        root: {
          color: "#0c51ff",
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: "none",
        },
      },
    },
  },
});

function App() {
  return (
    // 구글 OAuth와 인증 컨텍스트를 전역으로 감싸 라우터에 제공한다.
    <GoogleOAuthProvider clientId={import.meta.env.VITE_GOOGLE_CLIENT_ID}>
      <AuthProvider>
        <ThemeProvider theme={theme}>
          <CssBaseline />
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/login" element={<Login />} />
            <Route path="/login-success" element={<LoginSuccess />} />
              <Route path="/signup" element={<Signup />} />
              <Route path="/guide" element={<Guide />} />
              <Route path="/rooms" element={<Rooms />} />
              <Route path="/rooms/:roomId" element={<RoomDetail />} />
              <Route path="/RoomMap" element={<RoomMap />} />
              <Route path="/Contact" element={<ContactBoard />} />
              <Route path="/Contact/inquiry" element={<Contact />} />
              <Route
                path="/list-room"
                element={
                  <ProtectedRoute requireRoles={["HOST", "ADMIN"]}>
                    <ListRoom />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/edit-room/:roomId"
                element={
                  <ProtectedRoute requireRoles={["HOST", "ADMIN"]}>
                    <EditRoom />
                  </ProtectedRoute>
                }
              />
              <Route path="/RoomMap" element={<RoomMap />} />
              {/* <Route path="/safety-map" element={<SafetyMap />} /> */}
              <Route
                path="/lifestyle"
                element={
                  <ProtectedRoute>
                    <LifestyleSetup />
                  </ProtectedRoute>
                }
              />
              <Route path="/forgot-password" element={<ForgotPassword />} />
              <Route path="/terms" element={<Terms />} />
              <Route path="/privacy" element={<Privacy />} />
              <Route
                path="/profile"
                element={
                  <ProtectedRoute>
                    <Profile />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin"
                element={
                  <ProtectedRoute requireRoles={["ADMIN"]}>
                    <AdminDashboard />
                  </ProtectedRoute>
                }
              />
            </Routes>
          </BrowserRouter>
        </ThemeProvider>
      </AuthProvider>
    </GoogleOAuthProvider>
  );
}

export default App;
