import React from "react";
import { Profile } from "../../modules/Profile";

interface ProfilePageProps {
  username?: string;
}

export const ProfilePage: React.FC<ProfilePageProps> = ({ username }) => {
  return <Profile username={username} />;
};
