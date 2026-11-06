"use server";
import { connectDB } from "@/lib/mongodb";
import PaymentTransaction from "@/models/PaymentTransaction";
import Student from "@/models/Student";
import mongoose from "mongoose";
import { sendSms } from "../services/sms";
import { requireAuth } from "../auth";

export const updateStudentParentDetails = async ({
  id,
  parentFirstName,
  parentLastName,
  parentEmail,
}: {
  id: string;
  parentFirstName?: string;
  parentLastName?: string;
  parentEmail?: string;
}) => {
  try {
    await connectDB();
    const updateData: { [key: string]: any } = {};
    if (parentFirstName !== undefined) updateData.parentFirstName = parentFirstName.trim();
    if (parentLastName !== undefined) updateData.parentLastName = parentLastName.trim();
    if (parentEmail !== undefined) updateData.parentEmail = parentEmail.trim().toLowerCase();

    const updatedStudent = await Student.findByIdAndUpdate(
      id,
      { $set: updateData },
      { new: true }
    );

    if (!updatedStudent) {
      return { success: false, message: "Student not found" };
    }

    return {
      success: true,
      message: "Parent details updated successfully",
      data: JSON.parse(JSON.stringify(updatedStudent)),
    };
  } catch (error: any) {
    return {
      success: false,
      message: error?.message || "Failed to update parent details",
    };
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
          studentId: studentId?.trim()?.toUpperCase(),
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


export const changePassword = async ({ oldPassword, password }: { password: string, oldPassword: string }) => {
  try {
    const currentuser = await requireAuth();
    await connectDB();

    const user = await Student.findById(currentuser?._id);
    if (!user) {
      return { success: false, message: "User not found" };
    }

    const isPasswordValid = await user.comparePassword(oldPassword);

    if (!isPasswordValid) {
      return { success: false, message: "Wrong Old password" };
    }

    user.password = password;
    await user.save();

    return { success: true, data: JSON.parse(JSON.stringify(user)), message: "Password changed successfully. You'll need to login again." };
  } catch (err: any) {
    console.log(err);
    return { success: false, message: err?.message || "An error occurred" };
  }
}

