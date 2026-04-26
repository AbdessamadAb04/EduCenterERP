import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/layout/Layout';
import Dashboard from './pages/dashboard/Dashboard';
import StudentsList from './pages/students/StudentsList';
import ClassesList from './pages/classes/ClassesList';
import FinanceManager from './pages/finance/FinanceManager';
import SettingsPage from './pages/settings/Settings';
import SupportPage from './pages/support/Support';
import { PaymentSelectionProvider } from './context/PaymentSelectionContext';
import { StudentSelectionProvider } from './context/StudentSelectionContext';
import { ClassSelectionProvider } from './context/ClassSelectionContext';

function App() {
  return (
    <BrowserRouter>
      <PaymentSelectionProvider>
        <StudentSelectionProvider>
          <ClassSelectionProvider>
            <Routes>
              <Route path="/" element={<Layout />}>
                <Route index element={<Dashboard />} />
                <Route path="students" element={<StudentsList />} />
                <Route path="classes" element={<ClassesList />} />
                <Route path="finance" element={<FinanceManager />} />
                <Route path="settings" element={<SettingsPage />} />
                <Route path="support" element={<SupportPage />} />
                <Route path="*" element={<Navigate to="/" replace />} />
              </Route>
            </Routes>
          </ClassSelectionProvider>
        </StudentSelectionProvider>
      </PaymentSelectionProvider>
    </BrowserRouter>
  );
}

export default App;


