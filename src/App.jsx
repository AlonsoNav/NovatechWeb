import './App.css'
import 'bootstrap/dist/css/bootstrap.min.css';
import {BrowserRouter, Route, Routes} from "react-router-dom";
import Login from "./views/Login";
import Header from "./components/Header.jsx";
import Profile from "./views/Profile.jsx";

function App() {
    const renderWithHeader = (Component, isAdmin) => (
        <div className="App d-flex flex-column vh-100">
            <Header className="App-header sticky-top" isAdmin={isAdmin}/>
            <Component/>
        </div>
    );

    return (
      <BrowserRouter>
          <Routes>
              <Route path="/" element={<Login/>} />
              <Route path="/profile" element={renderWithHeader(Profile, false)} />
          </Routes>
      </BrowserRouter>
    )
}

export default App
