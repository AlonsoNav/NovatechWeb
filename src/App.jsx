import './App.css'
import 'bootstrap/dist/css/bootstrap.min.css';
import {BrowserRouter, Route, Routes} from "react-router-dom";
import Login from "./views/Login";
import Header from "./components/Header.jsx";
import Profile from "./views/Profile.jsx";
import { AuthProvider } from './contexts/AuthContext.jsx';

function App() {
    const renderWithHeader = (Component, isAdmin) => (
        <div className="App d-flex flex-column vh-100">
            <Header className="App-header sticky-top" />
            <Component/>
        </div>
    );

    return (
      <AuthProvider>
        <BrowserRouter>
            <Routes>
                <Route path="/" element={<Login/>} />
                <Route path="/profile" element={renderWithHeader(Profile, false)} />
            </Routes>
        </BrowserRouter>
      </AuthProvider>
    )
}

export default App
