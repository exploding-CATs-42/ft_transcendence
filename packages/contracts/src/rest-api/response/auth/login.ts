import type { RegisterResponse } from "./register";
import type { AccessToken } from "../../../shared";

export interface LoginResponse extends RegisterResponse {
  accessToken: AccessToken;
}
