// Libraries
import { useContext } from "react";
// Project level
import { ProfileContext } from "context/ProfileContext";

export const useProfile = () => {
  const context = useContext(ProfileContext);

  if (!context) {
    throw new Error("useProfile must be used within a ProfileProvider");
  }

  return context;
};
