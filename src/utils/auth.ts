"use server";

import { getServerSession } from "next-auth";
import { nextAuthOPtions } from "./services/nextAuthOptions";

/**
 * Requires that the caller is authenticated.
 * Throws an error if there is no active session.
 * @returns The authenticated user from the session.
 */
export async function requireAuth() {
  const session = await getServerSession(nextAuthOPtions);
  if (!session?.user) {
    throw new Error("Unauthorized: You must be logged in to perform this action");
  }
  return session.user;
}

