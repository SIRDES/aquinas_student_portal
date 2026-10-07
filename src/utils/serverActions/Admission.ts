"use server";
import { connectDB } from "@/lib/mongodb";
import Admission from "@/models/Admission";


export const getCurrentAdmission = async () => {
  try {
    await connectDB();
    const batches = await Admission.find({ isDeleted: false, isSuspended: false }).sort({ createdAt: -1 });
    return { success: true, data: JSON.parse(JSON.stringify(batches[0])) };
  } catch (err: any) {
    return { success: false, message: err?.message || "An error occurred" };
  }
};

