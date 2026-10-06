"use client";
import { redirect } from "next/navigation";
import { useSession } from "next-auth/react";
import LoadingAlert from "@/components/LoadingAlert";

export default function AdmissionDashboard() {
  const { data: session, status } = useSession();


  if (status === "loading") {
    return <LoadingAlert open={true} />
  }

  if (status === "authenticated") {
    // if (session?.user?.role === "admin") {
    //   return redirect("/dashboard")
    // }
    return redirect("/admission/dashboard")
  }

  redirect("/login")
  // redirect("/admission/dashboard")
}
