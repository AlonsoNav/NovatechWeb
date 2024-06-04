import 'bootstrap/dist/css/bootstrap.min.css';
import {BrowserRouter, Route, Routes, Navigate} from "react-router-dom";
// Local Imports
import './App.css'
import Header from "./components/Header.jsx";
// Views
import Login from "./views/collaborators/Login.jsx";
import Profile from "./views/collaborators/Profile.jsx";
import Projects from "./views/projects/Projects.jsx"
import Collaborators from "./views/collaborators/admin/Collaborators.jsx";
import CollaboratorsAdd from "./views/collaborators/admin/CollaboratorsAdd.jsx";
import ProjectsAdd from "./views/projects/admin/ProjectsAdd.jsx";
// Context and AuthProvider
import { AuthProvider, useAuth } from './contexts/AuthContext.jsx';

const ProtectedRoute = ({ children, adminOnly }) => {
    const { isLogin, isAdmin } = useAuth();

    if (!isLogin || (adminOnly && !isAdmin)) return <Navigate to="/" replace />

    return <>{children}</>;

};
function App() {
    const renderWithHeader = (Component) => (
        <div className="App d-flex flex-column min-vh-100 min-vw-100">
            <Header className="App-header sticky-top"/>
            <Component/>
        </div>
    );

    return (
      <AuthProvider>
        <BrowserRouter>
            <Routes>
                <Route path="/" element={<Login/>} />
                <Route path="/profile" element={<ProtectedRoute>{renderWithHeader(Profile)}</ProtectedRoute>} />
                <Route path="/collaborators" element={<ProtectedRoute>{renderWithHeader(Collaborators)}</ProtectedRoute>} />
                <Route path="/collaborators/add" element={<ProtectedRoute>{renderWithHeader(CollaboratorsAdd)}</ProtectedRoute>} />
                <Route path="/projects" element={<ProtectedRoute>{renderWithHeader(Projects)}</ProtectedRoute>} />
                <Route path="/projects/add" element={<ProtectedRoute>{renderWithHeader(ProjectsAdd)}</ProtectedRoute>} />
            </Routes>
        </BrowserRouter>
      </AuthProvider>
    )
}

export default App
