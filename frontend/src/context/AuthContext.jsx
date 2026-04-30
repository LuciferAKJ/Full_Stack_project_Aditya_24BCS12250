import { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const storedUser = localStorage.getItem('attendai_user');
    const storedToken = localStorage.getItem('attendai_token');
    const looksLikeJwt = typeof storedToken === 'string' && storedToken.split('.').length === 3;

    if (looksLikeJwt) {
      setToken(storedToken);
      try {
        const parsed = storedUser ? JSON.parse(storedUser) : null;
        setUser(parsed && typeof parsed === 'object' ? parsed : null);
      } catch {
        // Corrupted user JSON should not break auth if token is valid.
        setUser(null);
      }
    } else {
      localStorage.removeItem('attendai_user');
      localStorage.removeItem('attendai_token');
      setUser(null);
      setToken(null);
    }
    setLoading(false);
  }, []);

  const login = (userData, authToken) => {
    if (typeof authToken !== 'string' || authToken.split('.').length !== 3) {
      throw new Error('Invalid authentication token from server');
    }
    setUser(userData);
    setToken(authToken);
    localStorage.setItem('attendai_user', JSON.stringify(userData));
    localStorage.setItem('attendai_token', authToken);
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('attendai_user');
    localStorage.removeItem('attendai_token');
  };

  return (
    <AuthContext.Provider value={{ user, token, login, logout, loading, isAuthenticated: !!token }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};
