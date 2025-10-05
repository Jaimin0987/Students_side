import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import { ThemeProvider } from "./contexts/ThemeContext";

// Components & Pages
import { Navbar } from "./components/Navbar";
import { Dashboard } from "./pages/Dashboard";
import { Groups } from "./pages/Groups";
import { StudentFiles } from "./pages/StudentFiles";
import { Assignments } from "./pages/Assignments";
import Intract from "./pages/Intract";
import SignInPage from "./pages/SignIn";
import SignUpPage from "./pages/SignUp";

// The main layout for authenticated users
function AppLayout({ user, onLogout, children }) {
  return (
    <div className="min-h-screen bg-[#01161E] font-sans text-white">
      <header className="sticky top-0 z-10">
        <Navbar onLogout={onLogout} />
      </header>

      <main className="py-10">
        <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">{children}</div>
      </main>

      <footer className="bg-[#124559]/30 py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-[#AEC3B0]">
          <p>&copy; 2025 OpenStudy. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}

function App() {
  const isSignedIn = !!localStorage.getItem("jwt");
  console.log(isSignedIn);

  const handleLogout = () => {
    localStorage.removeItem("jwt");
    window.location.href = '/';
  };

  return (
    <ThemeProvider>
      <Router>
        <Toaster position="top-right" />
        <Routes>
          {isSignedIn ? (
            // Routes for signed-in users
            <Route path="/*" element={
              <AppLayout user={{}} onLogout={handleLogout}>
                <Routes>
                  <Route path="/" element={<Dashboard user={{}} />} />
                  <Route path="/groups" element={<Groups />} />
                  <Route path="/files" element={<StudentFiles />} />
                  <Route path="/assignments" element={<Assignments />} />
                  <Route path="/interact" element={<Intract />} />
                  {/* Redirect any other authenticated routes to dashboard */}
                  <Route path="*" element={<Navigate to="/" />} />
                </Routes>
              </AppLayout>
            }/>
          ) : (
            // Routes for signed-out users
            <>
              <Route path="/" element={<SignInPage />} />
              <Route path="/sign-up" element={<SignUpPage />} />
              {/* Redirect any other unauthenticated routes to sign-in */}
              <Route path="*" element={<Navigate to="/" />} />
            </>
          )}
        </Routes>
      </Router>
    </ThemeProvider>
  );
}

export default App;