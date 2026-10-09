import React from "react";
import { Feed } from "../../modules/Feed";

interface TimelinePageProps {
  onAvatarClick: (page: string, username?: string) => void;
}

export const TimelinePage: React.FC<TimelinePageProps> = ({
  onAvatarClick,
}) => {
  return <Feed onAvatarClick={onAvatarClick} />;
};
