"use server";
import { connectDB } from "@/lib/mongodb";
import Student from "@/models/Student";
import PaymentTransaction from "@/models/PaymentTransaction";
import mongoose from "mongoose";
import { contactNumbers } from "@/utils/services/utils";
import PlacedStudent, { IPlacedStudent } from "@/models/PlacedStudent";
import { sendSms } from "../services/sms";
import Admission from "@/models/Admission";
import AdmissionPayment from "@/models/AdmissionPayment";


// export const AddMultiplePlacedStudents = async (students: Array<IPlacedStudent>) => {
//   try {
//     await connectDB();
//     const result = await PlacedStudent.insertMany(students);
//     return { status: "success", data: JSON.parse(JSON.stringify(result)) };
//   } catch (err: any) {
//     return { status: "error", message: err?.message || "An error occurred" };
//   }
// }
const generateAdmissionCode = () => {
  const characters = "0123456789";
  let admissionCode = "";
  for (let i = 0; i < 6; i++) {
    admissionCode += characters.charAt(
      Math.floor(Math.random() * characters.length)
    );
  }
  return admissionCode;
}


export const updateAfterPayment = async ({ id, data }: { id: string, data: any }) => {
  try {
    await connectDB();
    const admissionCode = generateAdmissionCode();
    const { parentPhoneNumber, parentEmail, beceIndexNumber, hashedBeceIndexNumber, admissionId, paystackPaymentReference, paystackMessage } = data;

    let student = await PlacedStudent.findOne({ _id: id });
    if (!student) {
      return { status: "error", message: "Placed student not found" };
    }

    // add admission payment to db
    const payment = await AdmissionPayment.insertOne({
      hashedBeceIndexNumber, beceIndexNumber, status: "SUCCESS", admissionId, placedStudentId: id, paystackPaymentReference, responseMessage: paystackMessage
    });
    // let programme = student.admissionProgramme;
    // get placed students whose admission programme is the same as the student's admission programme and their studentId is not null
    // Find placed students in the same programme with assigned studentId
    // let placedStudents = await PlacedStudent.find({ admissionProgramme: programme, studentId: { $ne: null } }).lean();

    // Generate next studentId
    // const prefix = programme.substring(0, 3).toUpperCase();
    // const year = new Date().getFullYear();
    // let nextNumber = 1;

    // if (placedStudents.length > 0) {
    //   // Extract the numeric part from studentId and find the max
    //   const numbers = placedStudents
    //     .map(s => {
    //       const match = s.studentId?.match(/^([A-Z]{3})\/(\d{3})\/(\d{4})$/);
    //       return match ? parseInt(match[2], 10) : null;
    //     })
    //     .filter(n => n !== null) as number[];
    //   if (numbers.length > 0) {
    //     nextNumber = Math.max(...numbers) + 1;
    //   }
    // }
    // const studentId = `${prefix}/${nextNumber.toString().padStart(3, "0")}/${year}`;

    const result = await PlacedStudent.updateOne({ _id: id }, { $set: { admissionCode, parentPhoneNumber, parentEmail, beceIndexNumber, status: "started" } });

    // send admission code to parent/Guardian
    await sendSms({
      recipients: [parentPhoneNumber],
      message: `Your admission code is ${admissionCode}.Kindly login to your account to complete your admission process.`,
    });

    return { status: "success", data: JSON.parse(JSON.stringify(result)) };
  } catch (err: any) {
    return { status: "error", message: err?.message || "An error occurred" };
  }
}

// update student  data after payment
export const updatePlacedStudent = async ({ id, data }: { id: string, data: any }) => {
  try {
    await connectDB();
    const prevStatus = data.status;
    const result = await PlacedStudent.updateOne({ _id: id }, { $set: { ...data, status: "completed" } });
    if (prevStatus?.toLowerCase() === "started") {
      await sendSms({
        recipients: [data.parentPhoneNumber],
        message: `Your admission has been completed.\n
        Your are required to come along with the following:\n
        1. Admission letter\n
        2. Signed student data form\n
        3. Signed parental consent form\n
        4. Placement form from CSSPS\n
        5. Enrolment form from CSSPS\n
        6. Prospectus items\n`,
      });
    }
    return { status: "success", data: JSON.parse(JSON.stringify(result)) };
  } catch (err: any) {
    return { status: "error", message: err?.message || "An error occurred" };
  }
}
// export const getAllPlacedStudents = async (yearOfAdmission: string) => {
//   try {
//     await connectDB();
//     const students = await PlacedStudent.find({ yearOfAdmission: yearOfAdmission }).lean();

//     if (students.length === 0) {
//       return { success: false, message: "No students found" };
//     }
//     return { success: true, data: JSON.parse(JSON.stringify(students)) };
//   } catch (err: any) {
//     return { success: false, message: err?.message || "An error occurred" };
//   }
// };

export const getPlacedStudentById = async (id: string) => {
  try {
    await connectDB();
    const student = await PlacedStudent.findById(id).lean();
    if (!student) {
      return { success: false, message: "Student not found" };
    }
    return { success: true, data: JSON.parse(JSON.stringify(student)) };
  } catch (err: any) {
    return { success: false, message: err?.message || "An error occurred" };
  }
}



export const getStudentByHashedBeceIndexNumber = async ({
  beceIndexNumber,
  yearOfAdmission,
}: {
  beceIndexNumber: string;
  yearOfAdmission: string;
}) => {
  // const hashString = (str: string) => {

  // }
  // get the first 3 and last 4 characters of the bece index number and make the rest *
  const hashedBeceIndexNumber = beceIndexNumber.substring(0, 3) + "*".repeat(5) + beceIndexNumber.slice(-4);
  // console.log("hashedBeceIndexNumber", hashedBeceIndexNumber);
  try {
    await connectDB();
    // const students = await PlacedStudent.aggregate([
    //   {
    //     $match: {
    //       $expr: {
    //         $and: [
    //           {
    //             $eq: [
    //               { $substr: ["$hashedBeceIndexNumber", 0, 3] },
    //               beceIndexNumber.substring(0, 3),
    //             ],
    //           },
    //           {
    //             $eq: [
    //               {
    //                 $substr: [
    //                   "$hashedBeceIndexNumber",
    //                   { $subtract: [{ $strLenCP: "$hashedBeceIndexNumber" }, 4] },
    //                   4,
    //                 ],
    //               },
    //               beceIndexNumber.slice(-4),
    //             ],
    //           },
    //           { $eq: ["$yearOfAdmission", yearOfAdmission] },
    //         ],
    //       },
    //     },
    //   },
    //   {
    //     $project: {
    //       admissionCode: 0, // Exclude the admissionCode field
    //     },
    //   },
    // ]);



    const students = await PlacedStudent.aggregate([
      {
        $match: {
          yearOfAdmission: yearOfAdmission,
          hashedBeceIndexNumber: hashedBeceIndexNumber,
          // beceIndexNumber: hashedBeceIndexNumber
        },
      },
      {
        $project: {
          admissionCode: 0, // Exclude the admissionCode field
        },
      },
    ]);


    // console.log("students>>>>>>>>>>>", students);
    if (students.length > 0) {
      return { success: true, data: JSON.parse(JSON.stringify(students)), message: "Matching student found" };
    }
    return {
      success: false,
      message: "No matching student found",
    };
  } catch (err: any) {
    return { success: false, message: "An error occurred" };
  }
};

export const isStudentWithHashedBeceIndexNumberExists = async ({ hashedBeceIndexNumbers, yearOfAdmission }: { hashedBeceIndexNumbers: Array<string>, yearOfAdmission: string }) => {
  try {
    await connectDB();
    // Step 2: Query MongoDB once to find all existing students
    const existingStudents = await PlacedStudent.find({
      hashedBeceIndexNumber: { $in: hashedBeceIndexNumbers },
      yearOfAdmission: yearOfAdmission
    }).select('hashedBeceIndexNumbers').lean();

    if (existingStudents.length > 0) {
      return { status: "success", data: JSON.parse(JSON.stringify(existingStudents)), message: "Students exists" };
    }
    return { status: "error", message: "Students does not exist" };
  } catch (err: any) {
    return { status: "error", message: err?.message || "An error occurred" };
  }
};


export const getPlacedStudentByStudentId = async (studentId: string) => {
  try {
    await connectDB();
    const student = await PlacedStudent.findOne({ studentId: studentId?.toUpperCase() })
    if (student) {
      return { status: "success", data: JSON.parse(JSON.stringify(student)), message: "Student with this Student ID exists" };
    }
    return { status: "error", message: "Student with this Student ID does not exist" };
  } catch (err: any) {
    return { status: "error", message: err?.message || "An error occurred" };
  }
};

export const addSubjectToStudent = async ({ _id, subjectsId, parentPhoneNumber }: { _id: string, subjectsId: Array<string>, parentPhoneNumber: string }) => {
  try {
    await connectDB();

    const result = await Student.updateOne(
      { _id: new mongoose.Types.ObjectId(_id) }, // Find student by ID
      {
        // $addToSet: {
        //   subjects: { $each: subjectsId }, // Add all subject IDs to the subjects array
        // },
        $set: {
          parentPhoneNumber: parentPhoneNumber, // Update the ssId field
        },
      }
    );

    // const result = await Student.updateOne(
    //   { ssId: studentId }, // Find student by ID
    //   {
    //     $addToSet: {
    //       subjects: { $each: subjectsId }, // Add all subject IDs to the subjects array
    //     },
    //   }
    // );

    return { status: "success", data: JSON.parse(JSON.stringify(result)) };
  } catch (err: any) {
    return { status: "error", message: err?.message || "An error occurred" };
  }
};

export const getStudentResultsWithPaymentId = async ({
  transaction_id,
  updateNumberOfTimesUsed,
}: {
  transaction_id: string;
  updateNumberOfTimesUsed: boolean;
}) => {
  try {
    await connectDB();
    // Update PaymentTransaction and fetch related data

    // Use aggregation to fetch student and batch details along with the updated transaction
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
          from: "fridaytestbatches",
          localField: "batchId",
          foreignField: "_id",
          as: "batchInfo",
        },
      },
      { $unwind: { path: "$batchInfo", preserveNullAndEmptyArrays: true } },

      // Filter test scores that match student subjects, batchId, and studentId
      {
        $lookup: {
          from: "fridaytestscores",
          let: {
            studentId: "$studentInfo._id",
            batchId: "$batchInfo._id",
            studentSubjects: "$studentInfo.subjects",
          },
          pipeline: [
            {
              $match: {
                $expr: {
                  $and: [
                    { $eq: ["$student", "$$studentId"] },
                    { $eq: ["$fridayTestBatchId", "$$batchId"] },
                    { $in: ["$subject", "$$studentSubjects"] },
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
            },
          ],
          as: "testScores",
        },
      },
    ]);
    console.log("process.env.NEXT_PUBLIC_STUDENT_REPORT_URL", process.env.NEXT_PUBLIC_STUDENT_REPORT_URL)
    console.log("STUDENT_REPORT_URL", process.env.STUDENT_REPORT_URL)

    if (!result.length) {
      return { success: false, message: "Transaction not found after update" };
    }

    console.log("result", result[0])
    const { studentInfo, batchInfo, testScores, code, msisdn } = result[0];
    if (
      studentInfo.parentPhoneNumber &&
      studentInfo.parentPhoneNumber.length > 0
    ) {
      let smsMessage = `${batchInfo?.name} results for ${studentInfo?.firstName ? studentInfo?.firstName.toUpperCase() : ""} ${studentInfo?.lastName ? studentInfo?.lastName.toUpperCase() : ""}\n`;
      smsMessage += "Subject \u00A0|\u00A0 Marks \u00A0|\u00A0 Grade\n";
      for (const score of testScores) {
        smsMessage += `${score.subjectDetails.name.toUpperCase()} \u00A0|\u00A0 ${batchInfo?.isSemester ? score.totalScore : score.marks
          } \u00A0|\u00A0 ${score.grade.toUpperCase()}\n`;
      }
      if (batchInfo?.isSemester) {
        smsMessage += `Visit: ${process.env.NEXT_PUBLIC_STUDENT_REPORT_URL}?token=${transaction_id} for more details`;
      }

      // console.log("smsMessage", smsMessage); ${score.marks}
      // const parentPhoneNumber = removePlusSign(studentInfo?.parentPhoneNumber)
      await sendSms({
        recipients: [studentInfo.parentPhoneNumber],
        message: smsMessage,
      });
    } else {
      // console.log("No parent phone number");
      await sendSms({
        recipients: [msisdn],
        message: `There is no parent/guardian phone number for ${studentInfo?.firstName?.toUpperCase()} ${studentInfo?.lastName?.toUpperCase()}\nCall/whatsapp: ${contactNumbers}`,
      });
    }
    if (updateNumberOfTimesUsed) {
      await PaymentTransaction.updateOne(
        { _id: new mongoose.Types.ObjectId(transaction_id) },
        { $inc: { numberOfTimesUsed: 1 } }
      );
    }
    return {
      success: true,
      message: "Transaction updated successfully",
      // transaction: updatedTransaction,
    };
  } catch (error: any) {

    return {
      success: false,
      error: error?.message || "Error updating transaction",
    };
  }
};
