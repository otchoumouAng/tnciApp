export interface User {
  id: string;
  name: string;
  userName: string;
  isDisabled: boolean;
  locationID: number;
  locationName: string; // Nouveau
  employeeNumber?: string;
  functionName: string;
  email: string; // Renommé
  mustChangePwd?: boolean;
  magasinID?: number; // Nouveau
  magasinNom?: string; // Nouveau
  // Ajoutez d'autres champs au besoin
}

export interface LoginCredentials {
  username: string;
  password: string;
}

export interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (credentials: LoginCredentials) => Promise<void>;
  logout: () => void;
  isLoading: boolean;
  resetInactivityTimer: () => void;
}