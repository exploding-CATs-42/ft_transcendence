import { useEffect, useState } from "react";
import { toast } from "react-toastify";

import api from "api";
import { getErrorMessage } from "utils";

import type { MyProfileUser, ProfileUser } from "pages/ProfilePage/types";

interface Props {
  userId: string | undefined;
  isMyProfile: boolean;
}

export const useUser = ({ userId, isMyProfile }: Props) => {
  const [user, setUser] = useState<ProfileUser | MyProfileUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        let data: ProfileUser | MyProfileUser | null = null;

        if (isMyProfile) {
          data = await api.me.getMe();
        } else if (userId) {
          data = await api.users.getUserById(userId);
        }

        setUser(data);
      } catch (error) {
        const errorMessage = getErrorMessage(error);
        setUser(null);
        toast(errorMessage);
      } finally {
        setLoading(false);
      }
    };
    fetchUser();
  }, [isMyProfile, userId]);

  const updateUser = (updates: ProfileUser) => {
    setUser((prev) => {
      if (!prev) return prev;

      return {
        ...prev,
        ...updates,
      };
    });
  };

  return {
    user,
    userLoading: loading,
    updateUser,
  };
};
