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
import ProjectIndividual from "./views/projects/ProjectIndividual.jsx";
import Forum from "./views/Forum/Forum.jsx";
import Statistics from "./views/Statistics.jsx"
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
                <Route exact path="/" element={<Login/>} />
                <Route exact path="/profile" element={<ProtectedRoute>{renderWithHeader(Profile)}</ProtectedRoute>} />
                <Route exact path="/collaborators" element={<ProtectedRoute>{renderWithHeader(Collaborators)}</ProtectedRoute>} />
                <Route exact path="/collaborators/add" element={<ProtectedRoute>{renderWithHeader(CollaboratorsAdd)}</ProtectedRoute>} />
                <Route exact path="/projects" element={<ProtectedRoute>{renderWithHeader(Projects)}</ProtectedRoute>} />
                <Route exact path="/projects/add" element={<ProtectedRoute>{renderWithHeader(ProjectsAdd)}</ProtectedRoute>} />
                <Route exact path="/projects/:projectName" element={<ProtectedRoute>{renderWithHeader(ProjectIndividual)}</ProtectedRoute>} />
                <Route exact path="/forum" element={<ProtectedRoute>{renderWithHeader(Forum)}</ProtectedRoute>} />
                <Route exact path="/statistics" element={<ProtectedRoute>{renderWithHeader(Statistics)}</ProtectedRoute>} />
            </Routes>
        </BrowserRouter>
    </AuthProvider>
    )
}

export default App
