import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { ThemeProvider } from "./context/ThemeContext";
import Login from "./pages/auth/Login";
import Register from "./pages/auth/Register";
import DashboardLayout from "./layouts/DashboardLayout";
import DashboardHome from "./pages/dashboard/DashboardHome";
import Projects from "./pages/dashboard/Projects";
import IPCs from "./pages/dashboard/IPCs";
import Equipment from "./pages/dashboard/Equipment";
import Supplies from "./pages/dashboard/Supplies";
import Contracts from "./pages/dashboard/Contracts";

function App() {
  return (
    <ThemeProvider>
      <div dir="rtl">
        <BrowserRouter>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/dashboard" element={<DashboardLayout />}>
              <Route index element={<DashboardHome />} />
              <Route path="projects" element={<Projects />} />
              <Route path="contracts" element={<Contracts />} />
              <Route path="ipcs" element={<IPCs />} />
              <Route path="equipment" element={<Equipment />} />
              <Route path="supplies" element={<Supplies />} />
              <Route
                path="subcontractors"
                element={<div className="text-center py-10">المقاولين</div>}
              />
              <Route
                path="supply-chain"
                element={<div className="text-center py-10">سلسلة التوريد</div>}
              />
              <Route
                path="reports"
                element={<div className="text-center py-10">التقارير</div>}
              />
            </Route>
            <Route path="/" element={<Navigate to="/login" />} />
            <Route path="*" element={<Navigate to="/login" />} />
          </Routes>
        </BrowserRouter>
      </div>
    </ThemeProvider>
  );
}

export default App;