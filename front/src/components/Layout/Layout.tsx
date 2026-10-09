import React from "react";
import { Box, CssBaseline, GlobalStyles } from "@mui/material";
import { SideNav } from "../../modules/SideNav";
import { layoutStyles, sideNavStyles, feedStyles } from "./styles";
import { globalStyles } from "../../styles/global";

interface LayoutProps {
  activePage: "home" | "profile";
  onNavigate: (page: string, username?: string) => void;
  children: React.ReactNode;
}

export const Layout: React.FC<LayoutProps> = ({
  activePage,
  onNavigate,
  children,
}) => {
  return (
    <>
      <CssBaseline />
      <GlobalStyles styles={globalStyles} />
      <Box sx={layoutStyles}>
        {/* サイドナビは常に表示（レスポンシブ対応） */}
        <Box sx={sideNavStyles}>
          <SideNav activePage={activePage} onNavigate={onNavigate} />
        </Box>

        <Box sx={feedStyles}>{children}</Box>
      </Box>
    </>
  );
};
