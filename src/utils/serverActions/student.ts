"use server";
import { connectDB } from "@/lib/mongodb";
import PaymentTransaction from "@/models/PaymentTransaction";
import Student from "@/models/Student";
// import { sendSms } from "@/utils/services/sms";
import mongoose from "mongoose";
import { sendSms } from "../services/sms";
function cleanMongoDoc(doc: any): any {
  if (Array.isArray(doc)) {
    return doc.map(cleanMongoDoc);
  }

  if (doc && typeof doc === "object") {
    const newDoc: any = {};
    for (const key in doc) {
      const value = doc[key];

      if (value instanceof mongoose.Types.ObjectId) {
        newDoc[key] = value.toString();
      } else if (value instanceof Date) {
        newDoc[key] = value.toISOString();
      } else if (Array.isArray(value)) {
        newDoc[key] = value.map(cleanMongoDoc);
      } else if (value && typeof value === "object") {
        newDoc[key] = cleanMongoDoc(value);
      } else {
        newDoc[key] = value;
      }
    }
    return newDoc;
  }

  return doc;
}

export const getAllStudents = async () => {
  try {
    await connectDB();
    const students = await Student.aggregate([
      {
        $lookup: {
          from: "classes", // Joining Class collection
          localField: "classId",
          foreignField: "_id",
          as: "classInfo",
        },
      },
      { $unwind: "$classInfo" }, // Convert classInfo array into an object
      {
        $lookup: {
          from: "programmes", // Joining Programme collection
          localField: "classInfo.programme",
          foreignField: "_id",
          as: "classInfo.programmeInfo",
        },
      },
      {
        $unwind: {
          path: "$classInfo.programmeInfo",
          preserveNullAndEmptyArrays: true,
        },
      }, // Unwind programme data
      {
        $addFields: {
          _id: { $toString: "$_id" }, // Convert _id to string
          classId: { $toString: "$classId" }, // Convert classId to string
          studentId: { $toString: "$studentId" }, // Convert studentId to string
          "classInfo._id": { $toString: "$classInfo._id" }, // Convert classInfo._id to string
          "classInfo.programme": { $toString: "$classInfo.programme" }, // Convert programme ID to string
          "classInfo.programmeInfo._id": {
            $toString: "$classInfo.programmeInfo._id",
          }, // Convert programmeInfo._id to string
          createdAt: {
            $dateToString: {
              format: "%Y-%m-%dT%H:%M:%S.%LZ",
              date: "$createdAt",
            },
          },
          updatedAt: {
            $dateToString: {
              format: "%Y-%m-%dT%H:%M:%S.%LZ",
              date: "$updatedAt",
            },
          },
        },
      },
      {
        $sort: { _id: -1 }, // Sort by _id in descending order
      },
    ]);

    if (students.length === 0) {
      return { success: false, message: "No students found" };
    }
    return { success: true, data: students };
  } catch (err: any) {
    return { success: false, message: err?.message || "An error occurred" };
  }
};
export const getStudentByNumber = async ({
  studentNumber,
  form,
}: {
  studentNumber: string;
  form: string;
}) => {
  try {
    await connectDB();
    // const studentNumber = "099";
    // const form = "3";
    console.log("studentNumber", studentNumber);
    console.log("form", form);
    // Use aggregation to fetch students by studentNumber and then filter by form
    const students = await Student.aggregate([
      {
        $match: {
          $expr: {
            $eq: [
              { $arrayElemAt: [{ $split: ["$studentId", "/"] }, 1] },
              studentNumber,
            ],
          },
        },
      },
      {
        $lookup: {
          from: "classes", // Ensure this matches the actual collection name
          localField: "classId",
          foreignField: "_id",
          as: "classDetails",
        },
      },
      { $unwind: "$classDetails" },
      {
        $match: {
          "classDetails.form": form,
        },
      },
    ]);
    if (students.length) {
      return { status: "success", data: students[0] };
    }

    return {
      status: "error",
      message: "No matching student found in the specified form",
    };
  } catch (err: any) {
    return { status: "error", message: err?.message || "An error occurred" };
  }
};

export const getAStudentByStudentId = async (studentId: string) => {
  try {
    await connectDB();
    // console.log("studentId", studentId);

    // Use aggregation to fetch students by studentNumber and then filter by form
    const students = await Student.aggregate([
      {
        $match: {
          studentId: { $regex: new RegExp("^" + studentId + "$", "i") },
        },
      },
      {
        $lookup: {
          from: "classes", // Ensure this matches the actual collection name
          localField: "classId",
          foreignField: "_id",
          as: "classDetails",
        },
      },
      { $unwind: "$classDetails" },
      {
        $project: {
          password: 0,
          __v: 0,
        },
      },
    ]);
    if (students.length) {
      return { success: true, data: JSON.parse(JSON.stringify(students[0])) };
    }

    return {
      success: false,
      message: "No matching student found with this id",
    };
  } catch (err: any) {
    return { success: false, message: err?.message || "An error occurred" };
  }
};

export const isStudentWithSSIdExists = async (ssId: string) => {
  try {
    await connectDB();
    const student = await Student.findOne({ ssId });
    if (student) {
      return { status: "success", message: "Student with this SS ID exists" };
    }
    return {
      status: "error",
      message: "Student with this SS ID does not exist",
    };
  } catch (err: any) {
    return { status: "error", message: err?.message || "An error occurred" };
  }
};
export const addPlusToParentPhoneNumber = async () => {
  try {
    await connectDB();
    const result = await Student.updateMany(
      { parentPhoneNumber: { $ne: "" } },
      [
        {
          $set: {
            parentPhoneNumber: {
              $cond: {
                if: { $eq: [{ $substr: ["$parentPhoneNumber", 0, 1] }, "+"] },
                then: "$parentPhoneNumber",
                else: { $concat: ["+", "$parentPhoneNumber"] },
              },
            },
          },
        },
      ]
    );

    return { status: "success", data: result };
  } catch (err: any) {
    return { status: "error", message: err?.message || "An error occurred" };
  }
};
export const addSubjectToStudent = async () => {
  try {
    await connectDB();
    const result = await Student.updateMany(
      {
        classId: "67a8c2fdd75474ab03baffbb", // Only update students in this class
      },
      {
        $addToSet: {
          subjects: "67a7c20a65f7639968515150", // Replace with the actual subject ID
        },
      }
    );

    return { status: "success", data: result };
  } catch (err: any) {
    return { status: "error", message: err?.message || "An error occurred" };
  }
};

export const getStudentResultsWithPaymentId = async ({
  transaction_id,
  // updateNumberOfTimesUsed,
}: {
  transaction_id: string;
  // updateNumberOfTimesUsed: boolean;
}) => {
  try {
    await connectDB();
    // Use aggregation to fetch student and batch details along with the  transaction
    const result = await PaymentTransaction.aggregate([
      { $match: { _id: new mongoose.Types.ObjectId(transaction_id) } },
      {
        $lookup: {
          from: "students",
          localField: "student",
          foreignField: "_id",
          as: "studentInfo",
        },
      },
      { $project: { "studentInfo.password": 0 } },
      { $unwind: { path: "$studentInfo", preserveNullAndEmptyArrays: true } },
      {
        $lookup: {
          from: "classes",
          localField: "studentInfo.classId",
          foreignField: "_id",
          as: "classDetails",
        },
      },
      { $unwind: { path: "$classDetails", preserveNullAndEmptyArrays: true } },
      {
        $lookup: {
          from: "programmes",
          localField: "classDetails.programme",
          foreignField: "_id",
          as: "programmeDetails",
        },
      },
      {
        $unwind: {
          path: "$programmeDetails",
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $lookup: {
          from: "fridaytestbatches",
          localField: "batchId",
          foreignField: "_id",
          as: "batchInfo",
        },
      },
      { $unwind: { path: "$batchInfo", preserveNullAndEmptyArrays: true } },
      {
        $lookup: {
          from: "academicyears",
          localField: "batchInfo.academicYear",
          foreignField: "_id",
          as: "academicYearDetails",
        },
      },
      {
        $unwind: {
          path: "$academicYearDetails",
          preserveNullAndEmptyArrays: true,
        },
      },

      // Lookup test scores for matched subjects
      {
        $lookup: {
          from: "fridaytestscores",
          let: {
            studentId: "$studentInfo._id",
            batchId: "$batchInfo._id",
            subjects: "$studentInfo.subjects",
          },
          pipeline: [
            {
              $match: {
                $expr: {
                  $and: [
                    { $eq: ["$student", "$$studentId"] },
                    { $eq: ["$fridayTestBatchId", "$$batchId"] },
                    { $in: ["$subject", "$$subjects"] },
                  ],
                },
              },
            },
            {
              $lookup: {
                from: "subjects",
                localField: "subject",
                foreignField: "_id",
                as: "subjectDetails",
              },
            },
            {
              $unwind: {
                path: "$subjectDetails",
                preserveNullAndEmptyArrays: true,
              },
            }, // Fix [Object] issue
          ],
          as: "testScores",
        },
      },
    ]);
    if (!result.length) {
      return { success: false, message: "No student data found" };
    }

    // console.log("Student & Batch:", JSON.parse(JSON.stringify(result[0])));
    return {
      success: true,
      message: "Student data fetched successfully",
      data: JSON.parse(JSON.stringify(result[0])),
    };
  } catch (error: any) {
    return {
      success: false,
      message: error?.message || "Error fetching student data",
    };
  }
};

export const sendStudentResultsWithPaymentId = async ({
  transaction_id,
  // updateNumberOfTimesUsed,
}: {
  transaction_id: string;
  // updateNumberOfTimesUsed: boolean;
}) => {
  try {
    await connectDB();
    // Use aggregation to fetch student and batch details along with the  transaction
    const result = await PaymentTransaction.aggregate([
      { $match: { _id: new mongoose.Types.ObjectId(transaction_id) } },
      {
        $lookup: {
          from: "students",
          localField: "student",
          foreignField: "_id",
          as: "studentInfo",
        },
      },
      { $unwind: { path: "$studentInfo", preserveNullAndEmptyArrays: true } },
      {
        $lookup: {
          from: "classes",
          localField: "studentInfo.classId",
          foreignField: "_id",
          as: "classDetails",
        },
      },
      { $unwind: { path: "$classDetails", preserveNullAndEmptyArrays: true } },
      {
        $lookup: {
          from: "programmes",
          localField: "classDetails.programme",
          foreignField: "_id",
          as: "programmeDetails",
        },
      },
      {
        $unwind: {
          path: "$programmeDetails",
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $lookup: {
          from: "fridaytestbatches",
          localField: "batchId",
          foreignField: "_id",
          as: "batchInfo",
        },
      },
      { $unwind: { path: "$batchInfo", preserveNullAndEmptyArrays: true } },
      {
        $lookup: {
          from: "academicyears",
          localField: "batchInfo.academicYear",
          foreignField: "_id",
          as: "academicYearDetails",
        },
      },
      {
        $unwind: {
          path: "$academicYearDetails",
          preserveNullAndEmptyArrays: true,
        },
      },

      // Lookup test scores for matched subjects
      {
        $lookup: {
          from: "fridaytestscores",
          let: {
            studentId: "$studentInfo._id",
            batchId: "$batchInfo._id",
            subjects: "$studentInfo.subjects",
          },
          pipeline: [
            {
              $match: {
                $expr: {
                  $and: [
                    { $eq: ["$student", "$$studentId"] },
                    { $eq: ["$fridayTestBatchId", "$$batchId"] },
                    { $in: ["$subject", "$$subjects"] },
                  ],
                },
              },
            },
            {
              $lookup: {
                from: "subjects",
                localField: "subject",
                foreignField: "_id",
                as: "subjectDetails",
              },
            },
            {
              $unwind: {
                path: "$subjectDetails",
                preserveNullAndEmptyArrays: true,
              },
            }, // Fix [Object] issue
          ],
          as: "testScores",
        },
      },
    ]);

    if (!result.length) {
      return { success: false, message: "No student data found" };
    }

    console.log("Student & Batch:", JSON.parse(JSON.stringify(result[0])));

    const { studentInfo, batchInfo, testScores, code, msisdn } = result[0];

    let smsMessage = `${batchInfo?.name} results for ${studentInfo?.firstName ? studentInfo?.firstName.toUpperCase() : ""
      } ${studentInfo?.lastName ? studentInfo?.lastName.toUpperCase() : ""}\n`;
    smsMessage += "Subject  I  Marks  I  Grade\n";
    for (const score of testScores) {
      smsMessage += `${score.subjectDetails.name.toUpperCase()}  I  ${batchInfo?.isSemester ? score.totalScore : score.marks
        }  I  ${score.grade.toUpperCase()}\n`;
    }
    if (batchInfo?.isSemester) {
      smsMessage += `Visit: portal.staquinasshs.org/report?token=${transaction_id} for more details`;
    }

    const response = await sendSms({
      recipients: [msisdn],
      message: smsMessage,
    });

    await PaymentTransaction.updateOne(
      { _id: new mongoose.Types.ObjectId(transaction_id) },
      { $inc: { numberOfTimesUsed: 1 } }
    );

    // if (updateNumberOfTimesUsed) {
    //   await PaymentTransaction.updateOne(
    //     { _id: new mongoose.Types.ObjectId(transaction_id) },
    //     { $inc: { numberOfTimesUsed: 1 } }
    //   );
    // }

    return {
      success: true,
      message: "Results sent successfully",
      data: JSON.parse(JSON.stringify(result[0])),
    };
  } catch (error: any) {
    return {
      success: false,
      message: error?.message || "Error fetching student data",
    };
  }
};
