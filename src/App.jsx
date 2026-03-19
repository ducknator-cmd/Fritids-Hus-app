import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AppProvider } from './context/AppContext';
import Layout from './components/Layout';
import Toast from './components/Toast';
import PropertiesPage from './pages/PropertiesPage';
import AddEditPropertyPage from './pages/AddEditPropertyPage';
import PropertyDetailPage from './pages/PropertyDetailPage';
import ComparePage from './pages/ComparePage';
import SettingsPage from './pages/SettingsPage';

export default function App() {
  return (
    <BrowserRouter>
      <AppProvider>
        <Layout>
          <Routes>
            <Route path="/" element={<PropertiesPage />} />
            <Route path="/add" element={<AddEditPropertyPage />} />
            <Route path="/edit/:id" element={<AddEditPropertyPage />} />
            <Route path="/property/:id" element={<PropertyDetailPage />} />
            <Route path="/compare" element={<ComparePage />} />
            <Route path="/settings" element={<SettingsPage />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Layout>
        <Toast />
      </AppProvider>
    </BrowserRouter>
  );
}
