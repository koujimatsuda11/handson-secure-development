import React, { createContext, useContext } from "react";
import { useAuthenticator } from "@aws-amplify/ui-react";

interface CurrentUserContextType {
  username: string | null;
  isOwner: (postUsername: string) => boolean;
}

const CurrentUserContext = createContext<CurrentUserContextType | undefined>(
  undefined,
);

export const CurrentUserProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const { user } = useAuthenticator((context) => [context.user]);

  const username = user?.username || null;
  const isOwner = (postUsername: string) => username === postUsername;

  return (
    <CurrentUserContext.Provider value={{ username, isOwner }}>
      {children}
    </CurrentUserContext.Provider>
  );
};

export const useCurrentUser = () => {
  const context = useContext(CurrentUserContext);
  if (context === undefined) {
    throw new Error("useCurrentUser must be used within a CurrentUserProvider");
  }
  return context;
};
