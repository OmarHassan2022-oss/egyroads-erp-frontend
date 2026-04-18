import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
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
            <Route path="subcontractors" element={<div style={{ padding: "24px 28px" }}><div className="card-title">مقاولو الباطن</div></div>} />
            <Route path="hr" element={<div style={{ padding: "24px 28px" }}><div className="card-title">الموارد البشرية</div></div>} />
            <Route path="finance" element={<div style={{ padding: "24px 28px" }}><div className="card-title">الحسابات والمالية</div></div>} />
            <Route path="settings" element={<div style={{ padding: "24px 28px" }}><div className="card-title">الإعدادات</div></div>} />
            <Route path="help" element={<div style={{ padding: "24px 28px" }}><div className="card-title">دليل المستخدم</div></div>} />
            <Route path="ai-deliveries" element={<div style={{ padding: "24px 28px" }}><div className="card-title">تسليمات AI</div></div>} />
            <Route path="ocr" element={<div style={{ padding: "24px 28px" }}><div className="card-title">نظام المركبات OCR</div></div>} />
          </Route>
          <Route path="/" element={<Navigate to="/login" />} />
          <Route path="*" element={<Navigate to="/login" />} />
        </Routes>
      </BrowserRouter>
    </div>
  );
}

export default App;