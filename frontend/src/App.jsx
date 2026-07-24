import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import Dashboard from './pages/Dashboard';
import StockRegister from './pages/StockRegister';
import AddEditMedicine from './pages/AddEditMedicine';

export default function App() {
  return (
    <BrowserRouter>
      <Navbar />
      <main>
        <Routes>
          <Route path="/"        element={<Dashboard />} />
          <Route path="/stock"   element={<StockRegister />} />
          <Route path="/add"     element={<AddEditMedicine />} />
          <Route path="/edit/:id" element={<AddEditMedicine />} />
          <Route path="*"        element={<Navigate to="/" replace />} />
        </Routes>
      </main>
    </BrowserRouter>
  );
}
