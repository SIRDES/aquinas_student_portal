"use client";

import * as React from "react";
import { useTheme } from "@mui/material/styles";
import Box from "@mui/material/Box";

import { signOut } from "next-auth/react";
import MenuIcon from "@mui/icons-material/Menu";
import Link from "next/link";
const COMPANY_NAME = process.env.NEXT_PUBLIC_COMPANY_NAME;

import {
  AppBar,
  AppBarProps,
  Button,
  Drawer,
  Toolbar,
  Typography,
  useScrollTrigger,
} from "@mui/material";
import IconButton from "@mui/material/IconButton";
import CloseIcon from "@mui/icons-material/Close";
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

export default function MobileNavMenu({
  navLists,
}: {
  navLists: {
    id: number;
    name: string;
    href?: string;
    children?: { id: number; name: string; href: string }[];
  }[];
}) {
  const theme = useTheme();
  const [openNavChildren, setOpenNavChildren] = React.useState<boolean>(false);
  const [selectedNavItem, setSelectedNavItem] = React.useState<number | null>(
    null
  );
  const [isMobileMenuOpen, setIsMobileMenuOpen] =
    React.useState<boolean>(false);

  const handleMobileMenuClose = () => {
    setIsMobileMenuOpen(false);
    setOpenNavChildren(false);
    setSelectedNavItem(null);
  };

  const handleMobileMenuOpen = () => {
    setIsMobileMenuOpen(true);
  };
  const handleNavClick = (index: number) => {
    setSelectedNavItem(index);
    setOpenNavChildren((prev: boolean) => !prev);
    if (!isMobileMenuOpen) {
      setIsMobileMenuOpen(false);
    }
  };
  const handleSignOut = () => {
    handleMobileMenuClose();
    signOut();
  };

  return (
    <>
      <ElevationScroll>
        <AppBar
          color="transparent"
          position="sticky"
          sx={{
            backgroundColor: "#FAFAFA",
            display: {
              xs: "flex",
              md: "none",
            },
          }}
        >
          <Toolbar>
            <Typography sx={{ flexGrow: 1 }} variant="h6" color={"primary"}>
              {COMPANY_NAME}
            </Typography>
            <Box
              sx={{
                // justifyContent: "flex-end",
                padding: "10px 0px",
              }}
            >
              <IconButton
                onClick={handleMobileMenuOpen}
                style={{
                  // marginRight: "30px",
                  fontSize: "24px",
                  // cursor: "pointer",
                }}
              >
                <MenuIcon />
              </IconButton>
            </Box>
          </Toolbar>
        </AppBar>
      </ElevationScroll>
      <Drawer
        anchor="top"
        open={isMobileMenuOpen}
        onClose={handleMobileMenuClose}
      >
        <Box
          sx={{
            display: isMobileMenuOpen ? "flex" : "none",
            flexDirection: "column",
            position: "fixed",
            gap: "10px",
            top: 0,
            right: 0,
            left: 0,
            zIndex: theme.zIndex.drawer + 1,
            backgroundColor: theme.palette.primary.main,
            color: "#fff",
            padding: "10px 0px",
            boxShadow: "0px 1px 6px 0px #D0CDE1",
            // transition: "ease-in-out",
            "&>a": {
              color: "#fff",
              textDecoration: "none",
              padding: "10px 20px",
              fontSize: "14px",
              "&:hover": {
                backgroundColor: theme.palette.primary.light,
              },
            },
          }}
        >
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              padding: "10px",
            }}
          >
            <Typography variant="h6" color={"white"}>
              AQUINAS SHS
            </Typography>

            <IconButton
              onClick={handleMobileMenuClose}
              style={{
                // marginRight: "30px",
                fontSize: "24px",
              }}
            >
              <CloseIcon style={{ color: "#fff" }} />
            </IconButton>
          </Box>
          {navLists.map((nav, index: number) => (
            <React.Fragment key={nav.id + "nav"}>
              <Link
                href={nav?.href || ""}
                key={nav.id}
                onClick={() => {
                  handleNavClick(index);
                  if (nav.href) {
                    handleMobileMenuClose();
                  }
                  // handleMobileMenuClose();
                }}
              >
                {nav.name}
              </Link>
              {openNavChildren &&
                selectedNavItem === index &&
                nav.children &&
                nav.children.map((child) => (
                  <Link
                    href={child.href}
                    key={child.id}
                    onClick={handleMobileMenuClose}
                    style={{
                      marginLeft: "20px",
                    }}
                  >
                    {child.name}
                  </Link>
                ))}
            </React.Fragment>
          ))}
          {/* <Link href={"/account-settings"}>settings</Link> */}
          <Button onClick={handleSignOut} color="inherit">
            Logout
          </Button>
        </Box>
      </Drawer>
    </>
  );
}
