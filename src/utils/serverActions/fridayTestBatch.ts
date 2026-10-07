"use server";
import { connectDB } from "@/lib/mongodb";
import FridayTestBatch from "@/models/FridayTestBatch";

export const getBatchByYearGroup = async (yearGroup: string) => {
  try {
    await connectDB();
    const batches = await FridayTestBatch.aggregate([
      {
        $match: {
          yearGroup,
          isDeleted: false,
          isSuspended: false,
        },
      },
      {
        $lookup: {
          from: "academicyears", // The collection name for academic years
          localField: "academicYear", // The field in FridayTestBatch
          foreignField: "_id", // The field in academicYears
          as: "academicYearDetails",
        },
      },
      {
        $unwind: {
          path: "$academicYearDetails",
          preserveNullAndEmptyArrays: true, // In case there is no matching academicYear
        },
      },
      {
        $match: {
          "academicYearDetails.isDeleted": false,
          "academicYearDetails.isSuspended": false,
        },
      },
      {
        $sort: { createdAt: -1 },
      },
    ]);
    if (!batches || batches.length === 0) {
      return { success: false, message: "No exams found" };
    }
    return { success: true, data: JSON.parse(JSON.stringify(batches)) };
  } catch (err: any) {
    console.log(err);
    return { success: false, message: err?.message || "An error occurred" };
  }
};

