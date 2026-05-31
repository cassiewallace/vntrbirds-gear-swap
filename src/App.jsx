import { Routes, Route, Navigate } from 'react-router-dom';
import IntroPage from './pages/IntroPage';
import SellerInfoPage from './pages/SellerInfoPage';
import ItemEntryPage from './pages/ItemEntryPage';
import ConfirmationPage from './pages/ConfirmationPage';
import AdminPage from './pages/AdminPage';
import AdminSettingsPage from './pages/AdminSettingsPage';

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<IntroPage />} />
      <Route path="/seller" element={<SellerInfoPage />} />
      <Route path="/items" element={<ItemEntryPage />} />
      <Route path="/confirmation" element={<ConfirmationPage />} />
      <Route path="/admin" element={<AdminPage />} />
      <Route path="/admin/settings" element={<AdminSettingsPage />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
