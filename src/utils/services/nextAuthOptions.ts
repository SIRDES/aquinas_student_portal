
import CredentialsProvider from "next-auth/providers/credentials";
import { NextAuthOptions } from "next-auth";
import { connectDB } from "@/lib/mongodb";
import PlacedStudent from "@/models/PlacedStudent";

export const nextAuthOPtions: NextAuthOptions = {
    providers: [
        // Email & Password
        CredentialsProvider({
            id: "credentials",
            name: "Credentials",
            credentials: { beceIndexNumber: {}, admissionCode: {} },
            async authorize(credentials) {
                try {

                    await connectDB();
                    const user = await PlacedStudent.findOne(
                        {
                            beceIndexNumber: credentials?.beceIndexNumber,
                            admissionCode: credentials?.admissionCode
                        },
                        { admissionCode: 0 }
                    )
                    console.log("user", user);
                    // if (!user) return null;
                    if (!user) throw new Error("Invalid credentials");
                    if (user.isSuspended)
                        throw new Error(
                            "Your account has been deactivated. Contact the admin"
                        );
                    return JSON.parse(JSON.stringify(user));

                } catch (error: any) {
                    console.log("auth catch error", error);
                    return error.message;
                }
            },
        }),
    ],
    callbacks: {
        async session({ session, token }) {
            console.log("session token", token);
            if (session.user) {
                session.user = token as any
            }
            return session;
        },
        async signIn({ user }) {
            console.log("sign in user", user);
            if (user?.beceIndexNumber) {
                return true;
            } else {
                console.log("signIn callback user", user);
                // Return false to display a default error message

                throw new Error(user.toString());
                // Or you can return a URL to redirect to:
                // return '/unauthorized'
            }
        },
        async jwt({ token, user }) {
            console.log("user from jwt", user);
            // console.log("token from jwt", token);
            // 0 * 15 * 60 * 60

            if (user) {
                token = { ...token, ...user };
                return token
            }
            return token;
        },
    },
    pages: {
        signIn: "/login",
        signOut: "/login",
        error: "/login",
    },
    session: {
        strategy: "jwt",
        maxAge:
            process.env.NODE_ENV === "development"
                ? 30 * 24 * 60 * 60
                : 0.02 * 24 * 60 * 60,
    },
    jwt: {
        secret: process.env.NEXTAUTH_JWT_SECRET,
    },
    secret: process.env.NEXTAUTH_SECRET,
}