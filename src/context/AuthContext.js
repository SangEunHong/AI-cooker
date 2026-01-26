import { createContext, useState, useContext, useEffect } from "react";

import apiClient from "../utils/api";

const AuthContext = createContext();

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error("useAuth must be used within an AuthProvider");
    }
    return context; 
}

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const token = localStorage.getItem("token");
        const storedUser = localStorage.getItem("user");
        if (token && storedUser) {
            try {
                setUser(JSON.parse(storedUser));
            } catch (error) {
                console.error("Failed to parse user data:", error);
                localStorage.removeItem("token");
                localStorage.removeItem("user");
                setUser(null);
            }
        } else {
            setUser(null);
        }
        setLoading(false);
    }, []);

    const login = async (email, password) => {
        try {
            const response = await apiClient.post("/auth/login", { email, password });
            // Handle both { data: { token, user } } and { token, user } patterns
            const data = response.data.data || response.data;
            const { token, user } = data;
            
            if (!token || !user) {
                throw new Error("Invalid response from server");
            }

            localStorage.setItem("token", token);
            localStorage.setItem("user", JSON.stringify(user));
            setUser(user);

            return {success: true};
        } catch (error) {
            console.error("Login failed:", error);
            return {
                success: false,
                error: error.response?.data?.message || "Login failed"
            };
        }
    };
    
    const register = async (email, password, username) => {
        try {
            await apiClient.post("/auth/register", { email, password, username });
            return {success: true};
        } catch (error) {
            console.error("Register failed:", error);
            return {
                success: false,
                error: error.response.data.message
            };
        }
    };

    const logout = () => {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        setUser(null);
    };

    const value = {
        user,
        loading,
        login,
        register,
        logout
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};
