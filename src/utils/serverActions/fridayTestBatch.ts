"use server";
import { connectDB } from "@/lib/mongodb";
import FridayTestBatch from "@/models/FridayTestBatch";

export const getBatchByYearGroup = async (yearGroup:string) => {
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
      // {
      //   $project: {
      //     _id: { $toString: "$_id" }, // Convert `_id` to string
      //     date: {
      //       $dateToString: { format: "%Y-%m-%dT%H:%M:%S.%LZ", date: "$date" },
      //     }, // Convert date to ISO string
      //     name: 1,
      //     subjectIds: {
      //       $map: {
      //         input: "$subjectIds",
      //         as: "subjectId",
      //         in: { $toString: "$$subjectId" }, // Convert each subjectId to a string
      //       },
      //     },
      //     academicYearDetails: {
      //       name: "$academicYearDetails.name",
      //       _id: { $toString: "$academicYearDetails._id" }, // Include only name and id
      //     },
      //     form: 1,
      //     isNewCurriculum: 1,
      //     isDeleted: 1,
      //     isSuspended: 1,
      //     yearGroup: 1,
      //     isSemester: 1,
      //     examType: 1,
      //     createdAt: 1,
      //   },
      // },
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


// export const getBatchByYearGroup = async (yearGroup: string) => {
//   try {
//     await connectDB();
//     const batch = await FridayTestBatch.find({ yearGroup }).lean();
//     if (!batch || batch.length === 0) {
//       return { success: false, message: "Batch not found" };
//     }
//     return { success: true, data: JSON.parse(JSON.stringify(batch)) };
//   } catch (err: any) {
//     console.log(err);
//     return { success: false, message: err?.message || "An error occurred" };
//   }
// };
