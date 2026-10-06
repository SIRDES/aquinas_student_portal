import { nextAuthOPtions } from "@/utils/services/nextAuthOptions";
import NextAuth from "next-auth/next";


const handler = NextAuth(nextAuthOPtions);

export { handler as GET, handler as POST };