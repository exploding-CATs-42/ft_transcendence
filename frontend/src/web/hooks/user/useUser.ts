import type { MyProfileUser, ProfileUser } from "pages/ProfilePage/types";
import { useState } from "react";

export const useFriends = () => {
  const [user, _setUser] = useState<ProfileUser | MyProfileUser | null>(null);

  return user;
};
