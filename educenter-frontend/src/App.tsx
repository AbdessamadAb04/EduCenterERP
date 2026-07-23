import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Layout from './components/layout/Layout';
import Dashboard from './pages/dashboard/Dashboard';
import StudentsList from './pages/students/StudentsList';
import ClassesList from './pages/classes/ClassesList';
import FinanceManager from './pages/finance/FinanceManager';
import SettingsPage from './pages/settings/Settings';
import SupportPage from './pages/support/Support';
import MonProfil from './pages/compte/MonProfil';
import MonCompte from './pages/compte/MonCompte';
import MonEtablissement from './pages/compte/MonEtablissement';
import MesEtablissements from './pages/compte/MesEtablissements';
import LoginPage from './pages/system/LoginPage';
import SignupPage from './pages/system/SignupPage';
import PostSignupPage from './pages/system/PostSignupPage';
import LoadingScreen from './pages/system/LoadingScreen';
import NouvelEtablissement from './pages/system/NouvelEtablissement';
import NotFoundPage from './pages/system/NotFoundPage';
import LandingPage from './pages/landing/LandingPage';
import ProtectedRoute from './components/auth/ProtectedRoute';
import ErrorBoundary from './components/auth/ErrorBoundary';
import { PaymentSelectionProvider } from './context/PaymentSelectionContext';
import { StudentSelectionProvider } from './context/StudentSelectionContext';
import { ClassSelectionProvider } from './context/ClassSelectionContext';
import { CenterProvider } from './context/CenterContext.tsx';
import { PaymentDataProvider } from './context/PaymentDataContext.tsx';

function App() {
  return (
    <BrowserRouter>
      <ErrorBoundary>
        <CenterProvider>
          <PaymentDataProvider>
            <PaymentSelectionProvider>
              <StudentSelectionProvider>
                <ClassSelectionProvider>
                  <Routes>
                    <Route path="/" element={<LandingPage />} />
                    <Route path="/login" element={<LoginPage />} />
                    <Route path="/signup" element={<SignupPage />} />
                    <Route path="/post-signup" element={<PostSignupPage />} />
                    <Route path="/loading" element={<LoadingScreen />} />

                    <Route path="/profil" element={<ProtectedRoute />}>
                      <Route index element={<MonProfil />} />
                    </Route>
                    <Route element={<ProtectedRoute />}>
                      <Route path="/mes-etablissements" element={<MesEtablissements />} />
                      <Route path="/nouvel-etablissement" element={<NouvelEtablissement />} />
                      <Route element={<Layout />}>
                        <Route path="/mes-etablissements/etablissement/:etablissementId/dashboard" element={<Dashboard />} />
                        <Route path="/mes-etablissements/etablissement/:etablissementId/students" element={<StudentsList />} />
                        <Route path="/mes-etablissements/etablissement/:etablissementId/classes" element={<ClassesList />} />
                        <Route path="/mes-etablissements/etablissement/:etablissementId/finance" element={<FinanceManager />} />
                        <Route path="/mes-etablissements/etablissement/:etablissementId/settings" element={<SettingsPage />} />
                        <Route path="/mes-etablissements/etablissement/:etablissementId/support" element={<SupportPage />} />
                        <Route path="/mes-etablissements/etablissement/:etablissementId/profil" element={<MonProfil />} />
                        <Route path="/mes-etablissements/etablissement/:etablissementId/parametres" element={<MonEtablissement />} />
                      </Route>
                    </Route>
                    <Route path="*" element={<NotFoundPage />} />
                  </Routes>
                </ClassSelectionProvider>
              </StudentSelectionProvider>
            </PaymentSelectionProvider>
          </PaymentDataProvider>
        </CenterProvider>
      </ErrorBoundary>
    </BrowserRouter>
  );
}

export default App;


