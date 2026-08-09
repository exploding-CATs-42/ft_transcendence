// Libraries
import { createContext } from "react";
// Project level
import type {
  MyProfileUser,
  MyProfileUserWithStats,
} from "@exploding-cats/contracts";

export interface ProfileContextValue {
  profile: MyProfileUserWithStats | null;
  profileLoading: boolean;
  updateProfile: (updates: Partial<MyProfileUser>) => void;
  refreshProfile: () => Promise<void>;
}

export const ProfileContext = createContext<ProfileContextValue | null>(null);
