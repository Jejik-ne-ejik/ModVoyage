import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { apiRequest } from "@/lib/queryClient";

// Тип для данных пользователя
interface User {
  id: number;
  username: string;
}

// Тип для контекста авторизации
interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (username: string, password: string) => Promise<User>;
  logout: () => void;
  isAuthenticated: boolean;
}

// Создаем контекст с начальными значениями
const AuthContext = createContext<AuthContextType>({
  user: null,
  isLoading: false,
  login: async () => {
    throw new Error("Not implemented");
  },
  logout: () => {},
  isAuthenticated: false,
});

// Хук для использования контекста в компонентах
export const useAuth = () => useContext(AuthContext);

interface AuthProviderProps {
  children: ReactNode;
}

// Провайдер для оборачивания приложения
export const AuthProvider = ({ children }: AuthProviderProps) => {
  // Проверяем localStorage при инициализации
  const [user, setUser] = useState<User | null>(() => {
    const savedUserData = localStorage.getItem('auth_user');
    if (savedUserData) {
      try {
        return JSON.parse(savedUserData);
      } catch {
        localStorage.removeItem('auth_user');
        return null;
      }
    }
    return null;
  });
  
  const [isLoading, setIsLoading] = useState<boolean>(!user);

  // Загружаем информацию о пользователе при первом рендере если нет в localStorage
  useEffect(() => {
    // Используем пустой массив зависимостей, чтобы useEffect выполнился только один раз
    // Если уже есть данные из localStorage, не делаем запрос
    if (user) {
      setIsLoading(false);
      return;
    }
    
    const loadUser = async () => {
      try {
        // Проверяем, авторизован ли пользователь
        const userData = await apiRequest("GET", "/api/auth/user");
        setUser(userData.user);
        // Сохраняем в localStorage
        localStorage.setItem('auth_user', JSON.stringify(userData.user));
      } catch (error) {
        // Если нет авторизации, устанавливаем user как null
        setUser(null);
        localStorage.removeItem('auth_user');
      } finally {
        setIsLoading(false);
      }
    };

    loadUser();
  }, []);

  // Функция для входа в систему
  const login = async (username: string, password: string): Promise<User> => {
    setIsLoading(true);
    try {
      const response = await apiRequest("POST", "/api/auth/login", { username, password });
      
      // Сохраняем пользователя в состоянии и в localStorage
      setUser(response.user);
      localStorage.setItem('auth_user', JSON.stringify(response.user));
      
      return response.user;
    } finally {
      setIsLoading(false);
    }
  };

  // Функция для выхода из системы
  const logout = () => {
    // Очищаем пользователя из состояния
    setUser(null);
    
    // Удаляем из localStorage
    localStorage.removeItem('auth_user');
    
    // В реальном приложении здесь также был бы запрос на сервер для уничтожения сессии
  };

  const isAuthenticated = user !== null;

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        login,
        logout,
        isAuthenticated,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};