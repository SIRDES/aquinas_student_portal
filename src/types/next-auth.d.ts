import nextAuth from "next-auth";

declare module "next-auth" {
  interface User {
    _id: string;
    beceIndexNumber: string;
    admissionCode: string;
    firstName: string;
    lastName: string;
    role: "admin" | "teacher" | "student";
    isSuspended?: boolean;
  }

  interface Session {
    user: User;
  }
}
