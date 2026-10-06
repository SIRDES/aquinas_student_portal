"use client";
import React from "react";
import { useTheme } from "@mui/material/styles";

const COMPANY_NAME = process.env.NEXT_PUBLIC_COMPANY_NAME;

import {
  AppBar,
  AppBarProps,
  Toolbar,
  Typography,
  useScrollTrigger,
} from "@mui/material";
import Image from "next/image";

interface Props {
  children: React.ReactElement<AppBarProps>;
}

function ElevationScroll(props: Props) {
  const { children } = props;
  const trigger = useScrollTrigger({
    disableHysteresis: true,
    threshold: 0,
  });

  return React.cloneElement(children, {
    elevation: trigger ? 4 : 0,
  });
}

function OnlyLogoAppBar({
  title,
  showRightContent,
  rightContent,
}: {
  title: string;
  showRightContent?: boolean;
  rightContent?: React.ReactNode;
}) {
  const theme = useTheme();
  return (
    <>
      <ElevationScroll>
        <AppBar
          position="sticky"
          sx={{
            backgroundColor: theme.palette.primary.main,
          }}
        >
          <Toolbar>
            <Image
              src={"/images/aquinasLogo.png"}
              alt="logo"
              width={45}
              height={45}
              style={{ marginRight: "10px", backgroundColor: "white" }}
            />
            <Typography sx={{ flexGrow: 1, color: "yellow" }} variant="h6">
              {title}
            </Typography>
            {showRightContent && rightContent}
          </Toolbar>
        </AppBar>
      </ElevationScroll>
    </>
  );
}

export default OnlyLogoAppBar;
