"use server";
import { connectDB } from "@/lib/mongodb";
import Admission from "@/models/Admission";

export const addAdmission = async () => {
  try {

    const batch = [
      {
        name: "2025/2026 Admission",
        date: new Date(),
        reportingDate: new Date("2025-09-28"),
        admissionYear: "2025",
        // date: new Date("2025-02-28"),
        academicYear: "681f560b4f0c6260c74848be",
      },
    ];
    await connectDB();
    const result = await Admission.insertMany(batch);
    return { success: true, message: "Admission added successfully" };
  } catch (err: any) {
    return { success: false, message: err?.message || "An error occurred" };
  }
};
export const getAllAdmissions = async () => {
  try {
    await connectDB();
    // const batches = await Admission.find().sort({ createdAt: 1 });
    const batches = await Admission.aggregate([
      {
        $match: {
          isDeleted: false,
          isSuspended: false,
        },
      },
      {
        $lookup: {
          from: "academicyears", // The collection name for academic years
          localField: "academicYear", // The field in Admission
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
        $project: {
          _id: { $toString: "$_id" }, // Convert `_id` to string
          date: {
            $dateToString: { format: "%Y-%m-%dT%H:%M:%S.%LZ", date: "$date" },
          }, // Convert date to ISO string
          name: 1,
          subjectIds: {
            $map: {
              input: "$subjectIds",
              as: "subjectId",
              in: { $toString: "$$subjectId" }, // Convert each subjectId to a string
            },
          },
          academicYearDetails: {
            name: "$academicYearDetails.name",
            _id: { $toString: "$academicYearDetails._id" }, // Include only name and id
          },
          form: 1,
          isNewCurriculum: 1,
          isDeleted: 1,
          isSuspended: 1,
          isSemester: 1,
          examType: 1,
          createdAt: 1,
        },
      },
      {
        $sort: { createdAt: -1 },
      },
    ]);
    return { success: true, data: batches };
  } catch (err: any) {
    return { success: false, message: err?.message || "An error occurred" };
  }
};

export const getCurrentAdmission = async () => {
  try {
    await connectDB();
    const batches = await Admission.find({ isDeleted: false, isSuspended: false }).sort({ createdAt: -1 });
    return { success: true, data: JSON.parse(JSON.stringify(batches[0])) };
  } catch (err: any) {
    return { success: false, message: err?.message || "An error occurred" };
  }
};


export const getBatchById = async (id: string) => {
  try {
    await connectDB();
    const batch = await Admission.findById(id).lean();
    if (!batch) {
      return { success: false, message: "Batch not found" };
    }
    return { success: true, data: batch };
  } catch (err: any) {
    return { success: false, message: err?.message || "An error occurred" };
  }
};

export const getBatchByName = async (name: string) => {
  try {
    await connectDB();
    const batch = await Admission.findOne({ name }).lean();
    if (!batch) {
      return { success: false, message: "Batch not found" };
    }
    return { success: true, data: batch };
  } catch (err: any) {
    return { success: false, message: err?.message || "An error occurred" };
  }
};
