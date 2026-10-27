import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import { ToastProvider } from './context/ToastContext'
import { RequireRole } from './components/AppLayout'

/* Pages publiques */
import Landing   from './pages/Landing'
import Login     from './pages/Login'
import Register  from './pages/Register'

/* Espace étudiant */
import EtudiantDashboard from './pages/etudiant/Dashboard'
import EtudiantModules   from './pages/etudiant/Modules'
import EtudiantRendus    from './pages/etudiant/Rendus'
import EtudiantProfil    from './pages/etudiant/Profil'

/* Espace professeur */
import ProfDashboard from './pages/professeur/Dashboard'
import ProfModules   from './pages/professeur/Modules'
import ProfPublier   from './pages/professeur/Publier'
import ProfRendus    from './pages/professeur/Rendus'
import ProfProfil    from './pages/professeur/Profil'

/* Espace admin */
import AdminDashboard    from './pages/admin/Dashboard'
import AdminFilieres     from './pages/admin/Filieres'
import AdminModules      from './pages/admin/Modules'
import AdminUtilisateurs from './pages/admin/Utilisateurs'
import AdminRessources   from './pages/admin/Ressources'
import AdminProfil       from './pages/admin/Profil'

/* Page partagée : détail d'un module */
import ModuleDetail from './pages/ModuleDetail'

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <ToastProvider>
          <Routes>
            {/* Publiques */}
            <Route path="/"           element={<Landing />} />
            <Route path="/connexion"  element={<Login />} />
            <Route path="/inscription" element={<Register />} />

            {/* Étudiant */}
            <Route element={<RequireRole role="etudiant" />}>
              <Route path="/etudiant"           element={<EtudiantDashboard />} />
              <Route path="/etudiant/modules"   element={<EtudiantModules />} />
              <Route path="/etudiant/modules/:id" element={<ModuleDetail role="etudiant" />} />
              <Route path="/etudiant/rendus"    element={<EtudiantRendus />} />
              <Route path="/etudiant/profil"    element={<EtudiantProfil />} />
            </Route>

            {/* Professeur */}
            <Route element={<RequireRole role="professeur" />}>
              <Route path="/professeur"             element={<ProfDashboard />} />
              <Route path="/professeur/modules"     element={<ProfModules />} />
              <Route path="/professeur/modules/:id" element={<ModuleDetail role="professeur" />} />
              <Route path="/professeur/publier"     element={<ProfPublier />} />
              <Route path="/professeur/rendus"      element={<ProfRendus />} />
              <Route path="/professeur/profil"      element={<ProfProfil />} />
            </Route>

            {/* Admin */}
            <Route element={<RequireRole role="admin" />}>
              <Route path="/admin"                  element={<AdminDashboard />} />
              <Route path="/admin/filieres"         element={<AdminFilieres />} />
              <Route path="/admin/modules"          element={<AdminModules />} />
              <Route path="/admin/modules/:id"      element={<ModuleDetail role="admin" />} />
              <Route path="/admin/utilisateurs"     element={<AdminUtilisateurs />} />
              <Route path="/admin/ressources"       element={<AdminRessources />} />
              <Route path="/admin/profil"           element={<AdminProfil />} />
            </Route>

            {/* Catch-all */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </ToastProvider>
      </AuthProvider>
    </BrowserRouter>
  )
}
