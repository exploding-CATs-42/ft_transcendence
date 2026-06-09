// Local level
import type {
  MyProfileUser,
  ProfileUser,
} from "pages/ProfilePage/types/ProfileUser";
import { api } from "../axios";
import type { UpdateMeRequestBody } from "schemas/updateMeSchema";

const getMe = async (): Promise<MyProfileUser> => {
  const result = await api.get("/me");
  return result.data.user;
};

const updateMe = async (body: UpdateMeRequestBody): Promise<ProfileUser> => {
  const result = await api.patch("/me", body);
  return result.data.user;
};

export default {
  getMe,
  updateMe,
};
