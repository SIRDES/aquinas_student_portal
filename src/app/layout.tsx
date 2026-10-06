import type { Metadata } from "next";
import "./globals.css";
import SessionContextProvider from "@/context/AuthContext";
import { CssBaseline, ThemeProvider } from "@mui/material";
import theme from "@/theme/theme";
import { StudentContextProvider } from "@/context/StudentDetailsContext";

export const metadata: Metadata = {
  title: "AQ Portal",
  description: "Aquinas SHS students portal",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <SessionContextProvider>
          <ThemeProvider theme={theme}>
            <StudentContextProvider>
              <CssBaseline />
              {children}
            </StudentContextProvider>
          </ThemeProvider>
        </SessionContextProvider>
      </body>
    </html>
  );
}
