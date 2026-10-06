"use client";

import * as React from "react";
import { styled, alpha, useTheme } from "@mui/material/styles";
import AppBar from "@mui/material/AppBar";
import Box from "@mui/material/Box";
import Toolbar from "@mui/material/Toolbar";
import Typography from "@mui/material/Typography";
import InputBase from "@mui/material/InputBase";
import Badge from "@mui/material/Badge";
import MenuItem from "@mui/material/MenuItem";
import Menu from "@mui/material/Menu";
import IconButton from "@mui/material/IconButton";
import CloseIcon from "@mui/icons-material/Close";
import Image from "next/image";
import useScrollTrigger from "@mui/material/useScrollTrigger";
import MenuIcon from '@mui/icons-material/Menu';
import Link from "next/link";
import { Button, Drawer, useMediaQuery } from "@mui/material";
import { useRouter } from "next/navigation";
import { signOut } from "next-auth/react";
import { admissionNavLists } from "@/utils/navList";
import PersonIcon from '@mui/icons-material/Person';
interface Props {
  children: React.ReactElement;
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

export default function Appbar() {
  const theme = useTheme();
  const router = useRouter()
  const isMobileView = useMediaQuery(theme.breakpoints.down("md"));
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] =
    React.useState<boolean>(false);

  const isMenuOpen = Boolean(anchorEl);

  const handleProfileMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMobileMenuClose = () => {
    setIsMobileMenuOpen(false);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    handleMobileMenuClose();
  };

  const handleMobileMenuOpen = () => {
    setIsMobileMenuOpen(true);
  };
  const handleSignOut = () => {
    signOut()
  };
  const menuId = "primary-search-account-menu";
  const renderMenu = (
    <Menu
      anchorEl={anchorEl}
      anchorOrigin={{
        vertical: "top",
        horizontal: "right",
      }}
      id={menuId}
      keepMounted
      transformOrigin={{
        vertical: "top",
        horizontal: "right",
      }}
      open={isMenuOpen}
      onClose={handleMenuClose}
    >
      {/* <MenuItem onClick={handleMenuClose}>Profile</MenuItem> */}
      <MenuItem onClick={handleSignOut}>Sign out</MenuItem>
    </Menu>
  );

  const mobileMenuId = "primary-search-account-menu-mobile";
  const renderMobileMenu = (
    <Drawer anchor="top" open={isMobileMenuOpen} onClose={handleMobileMenuClose}>
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
        <IconButton>
          <CloseIcon onClick={handleMobileMenuClose} />
        </IconButton>
        {admissionNavLists.map((nav) => (
          <Link href={nav.href} key={nav.id} onClick={handleMobileMenuClose}>
            {nav.name}
          </Link>
        ))}
        {/* <Link href={"/account-settings"}>settings</Link> */}
        <Button onClick={handleSignOut} >Sign out</Button>
      </Box>
    </Drawer>
  );

  return (
    <>
      <ElevationScroll>
        <AppBar color="transparent" position="sticky" sx={{ backgroundColor: "#fff" }}>
          <Toolbar>
            <Link href="/charities">
              <Image
                width={114}
                height={45}
                src={"/assets/images/venekaLogo1.png"}
                alt="Logo image"
              />
            </Link>
            <Box sx={{ flexGrow: 1 }} />
            <Box
              sx={{
                display: { xs: "none", md: "flex" },
                alignItems: "center",
                gap: "25px",
              }}
            >
              {/* <Link href="/account-settings">
                <FontAwesomeIcon
                  style={{
                    fontSize: "20px",
                    color: theme.palette.text.disabled,
                  }}
                  icon={faGear}
                />
              </Link> */}

              {/* <FontAwesomeIcon
                style={{
                  fontSize: "20px",
                  color: theme.palette.text.disabled,
                }}
                icon={faCircleQuestion}
              /> */}
              <Box
                aria-label="account of current user"
                aria-controls={menuId}
                aria-haspopup="true"
                onClick={handleProfileMenuOpen}
                sx={{ cursor: "pointer" }}
              >
                <IconButton>
                  <PersonIcon />
                </IconButton>
                {/* <FontAwesomeIcon
                  style={{
                    fontSize: "20px",
                    color: theme.palette.text.disabled,
                  }}
                  icon={faCaretDown}
                /> */}
              </Box>
            </Box>
            <Box
              sx={{ display: { xs: "block", md: "none", cursor: "pointer" } }}
              onClick={handleMobileMenuOpen}
            >
              <MenuIcon />
              {/* <FontAwesomeIcon icon={faBars} style={{ fontSize: "20px" }} /> */}
            </Box>
          </Toolbar>
        </AppBar>
      </ElevationScroll>
      {renderMobileMenu}
      {renderMenu}
    </>

  );
}
