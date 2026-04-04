import { Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "./context/useAuth";
import LoginPage from "./pages/auth/LoginPage";
import RegisterPage from "./pages/auth/RegisterPage";
import ClientsPage from "./pages/dashboard/ClientsPage";
import ClientDetailPage from "./pages/dashboard/ClientDetailPage";
import PoliciesPage from "./pages/dashboard/PoliciesPage";
import PolicyDetailPage from "./pages/dashboard/PolicyDetailPage";
import ClaimsPage from "./pages/dashboard/ClaimsPage";

function App() {
  const { isAuthenticated } = useAuth();

  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route
        path="/"
        element={isAuthenticated ? <ClientsPage /> : <Navigate to="/login" />}
      />
      <Route
        path="/clients/:id"
        element={
          isAuthenticated ? <ClientDetailPage /> : <Navigate to="/login" />
        }
      />
      <Route
        path="/policies"
        element={isAuthenticated ? <PoliciesPage /> : <Navigate to="/login" />}
      />
      <Route
        path="/policies/:id"
        element={
          isAuthenticated ? <PolicyDetailPage /> : <Navigate to="/login" />
        }
      />
      <Route
        path="/claims"
        element={isAuthenticated ? <ClaimsPage /> : <Navigate to="/login" />}
      />
      <Route path="/*" element={<Navigate to="/" />} />
    </Routes>
  );
}

export default App;
