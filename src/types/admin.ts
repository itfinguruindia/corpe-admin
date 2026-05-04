import { Role } from "./roles";

export interface AuthResponse {
  accessToken: string | null;
  refreshToken: string | null;
  admin: Admin | null;
  profilePictureUrl?: string | null;
}

export interface Admin {
  id: string;
  name: string;
  email: string;
  phoneNumber?: string;
  isSuperAdmin: boolean;
  role: Role;
  permissions: string[];
  profilePicture?: string;
}

export interface NotificationPreferences {
  systemNotification: boolean;
  chatMessages: boolean;
  newCompany: boolean;
  statutesUpdates: boolean;
}

export interface AdminPreferences {
  _id?: string;
  admin?: string;
  notification: NotificationPreferences;
  sound: boolean;
}
