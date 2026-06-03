// Local level
import type { ProfileUser } from "pages/ProfilePage/types";
import { api } from "../axios";

const getMe = async (): Promise<ProfileUser> => {
  const result = await api.get("/me");
  return result.data.user;
};

export default {
  getMe,
};
