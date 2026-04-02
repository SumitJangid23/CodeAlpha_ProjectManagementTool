import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";

import Navbar from "./components/Navbar";

import Home from "./pages/Home";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import ForgotPassword from "./pages/ForgotPassword";
import Dashboard from "./pages/Dashboard";
import Kanban from "./pages/Kanban";
import ProtectedRoute from "./components/ProtectedRoute";
import Projects from "./pages/Projects";
import Analytics from "./pages/Analytics";
import UserDashboard from "./pages/UserDashboard";
import MyTasks from "./pages/MyTasks";


function Layout() {
  const location = useLocation();

  return (
    <>
      
      {location.pathname === "/" && <Navbar />}

      <Routes>
        <Route path="/" element={<Home />} />

        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/kanban/:projectId" element={<Kanban />} />
        <Route path="/projects" element={<Projects />} />
        <Route path="/analytics" element={<Analytics />} />
        <Route path="/my-tasks" element={<MyTasks />} />
        <Route path="/user-dashboard" element={<UserDashboard />} />

        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />
      </Routes>
    </>
  );
}


function App() {
  return (
    <BrowserRouter>
      <div className="bg-[#0f172a] text-[#e2e8f0] min-h-screen">
        <Layout />
      </div>
    </BrowserRouter>
  );
}

export default App;