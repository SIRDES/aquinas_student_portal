"use client";
import { redirect } from "next/navigation";
import { useSession, signIn, signOut } from "next-auth/react";
import LoadingAlert from "@/components/LoadingAlert";
import { useEffect, useState } from "react";
import { useBatchesContext } from "@/context/BatchesContext";
import { getAdminSetting } from "@/utils/serverActions/adminSettings";
import { set } from "mongoose";

export default function Home() {
  const { data: session, status } = useSession();
  const [isLoading, setIsLoading] = useState(false);

  if (isLoading) return <LoadingAlert open={true} />
  if (status === "loading") {
    return <LoadingAlert open={true} />;
  }

  if (status === "authenticated") {
    // if (session?.user?.role === "admin") {
    //   return redirect("/dashboard");
    // }
    return redirect("/admission/dashboard/");
  }

  redirect("/login");
  // redirect("/report");
}
