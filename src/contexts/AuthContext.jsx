import { createContext, useContext, useState } from "react";

const AuthContext = createContext({
    isLogin: false,
    isAdmin: false,
    login: () => {},
    logout: () => {},
  });

export const AuthProvider = ({ children }) => {
    const [isLogin, setIsLogin] = useState(!!localStorage.getItem("user"))
    const [isAdmin, setIsAdmin] = useState(localStorage.getItem("user") ? JSON.parse(localStorage.getItem("user")).admin : false)

    const login = (user) => {
        localStorage.setItem("user", JSON.stringify(user));
        setIsLogin(true);
        setIsAdmin(user.admin);
    }

    const logout = () => {
        localStorage.removeItem("user")
        setIsLogin(false);
        setIsAdmin(false);
    }

    return (
        <AuthContext.Provider value={{isLogin, isAdmin, login, logout}}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);