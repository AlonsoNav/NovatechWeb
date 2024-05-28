import './App.css'
import 'bootstrap/dist/css/bootstrap.min.css';
import {BrowserRouter, Route, Routes, Navigate} from "react-router-dom";
// Local Imports
import './App.css'
import Header from "./components/Header.jsx";
// Views
import Login from "./views/Login";
import Profile from "./views/Profile.jsx";
import Projects from "./views/Projects.jsx"
import Collaborators from "./views/Collaborators.jsx";
// Context and AuthProvider
import { AuthProvider, useAuth } from './contexts/AuthContext.jsx';


const ProtectedRoute = ({ children, adminOnly }) => {
    const { isLogin, isAdmin } = useAuth();

    if (!isLogin || (adminOnly && !isAdmin)) return <Navigate to="/" replace />

    return <>{children}</>;

};
function App() {
    const renderWithHeader = (Component, isAdmin) => (
        <div className="App d-flex flex-column vh-100">
            <Header className="App-header sticky-top" isAdmin={isAdmin}/>
            <Component/>
        </div>
    );

    return (
      <AuthProvider>
        <BrowserRouter>
            <Routes>
                <Route path="/" element={<Login/>} />
                <Route path="/profile" element={<ProtectedRoute>{renderWithHeader(Profile)}</ProtectedRoute>} />
                <Route path="/projects" element={<ProtectedRoute>{renderWithHeader(Projects)}</ProtectedRoute>} />
                <Route path="/collaborators/update" element={renderWithHeader(Profile, true)} />
                <Route path="/collaborators" element={renderWithHeader(Collaborators, true)} />
            </Routes>
        </BrowserRouter>
      </AuthProvider>
    )
}

export default App
