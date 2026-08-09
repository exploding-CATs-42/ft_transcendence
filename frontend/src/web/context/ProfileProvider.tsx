// Libraries
import { useCallback, useEffect, useState, type ReactNode } from "react";
import { toast } from "react-toastify";
// Project level
import api from "api";
import { useAuth } from "hooks";
import { getErrorMessage } from "utils";
import type {
  MyProfileUser,
  MyProfileUserWithStats,
} from "@exploding-cats/contracts";
// Local level
import { ProfileContext } from "./ProfileContext";

interface Props {
  children: ReactNode;
}

const ProfileProvider = ({ children }: Props) => {
  const { authStatus } = useAuth();
  const isLoggedIn = authStatus === "authenticated";

  const [profile, setProfile] = useState<MyProfileUserWithStats | null>(null);
  const [profileLoading, setProfileLoading] = useState(isLoggedIn);

  const updateProfile = useCallback((updates: Partial<MyProfileUser>) => {
    setProfile((prev) => (prev ? { ...prev, ...updates } : prev));
  }, []);

  const refreshProfile = useCallback(async () => {
    if (!isLoggedIn) return;

    setProfileLoading(true);

    try {
      setProfile(await api.me.getMe());
    } catch (error) {
      setProfile(null);
      toast.error(getErrorMessage(error));
    } finally {
      setProfileLoading(false);
    }
  }, [isLoggedIn]);

  useEffect(() => {
    if (!isLoggedIn) return;

    const fetchProfile = async () => {
      setProfileLoading(true);

      try {
        const user = await api.me.getMe();

        setProfile(user);
      } catch (error) {
        setProfile(null);
        toast.error(getErrorMessage(error));
      } finally {
        setProfileLoading(false);
      }
    };

    fetchProfile();
  }, [isLoggedIn]);

  return (
    <ProfileContext.Provider
      value={{ profile, profileLoading, updateProfile, refreshProfile }}
    >
      {children}
    </ProfileContext.Provider>
  );
};

export default ProfileProvider;
