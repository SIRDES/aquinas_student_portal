import { connectDB } from "@/lib/mongodb";
import { NextRequest, NextResponse } from "next/server";
import { makePayment } from "@/utils/services/makePayment";
import AdmissionPayment from "@/models/AdmissionPayment";
const { NPOINTU_ADMISSION_PAYMENT_CALLBACK_URL } = process.env;

export const POST = async (request: NextRequest) => {
  if (!request.body) {
    return NextResponse.json(
      { error: "Request body is null" },
      { status: 400 }
    );
  }

  const { msisdn, placedStudentId, admissionId, network, hashedBeceIndexNumber, beceIndexNumber, amount, parentPhoneNumber } =
    await request.json();
  try {
    await connectDB();


    const newPaymentTransaction = new AdmissionPayment({
      status: "Pending",
      responseMessage: "",
      msisdn: msisdn,
      parentPhoneNumber: parentPhoneNumber,
      network,
      beceIndexNumber: beceIndexNumber,
      hashedBeceIndexNumber: hashedBeceIndexNumber,
      placedStudentId: placedStudentId,
      admissionId: admissionId,
    });
    await newPaymentTransaction.save();
    const paymentResponse = await makePayment({
      vendor: network,
      number: msisdn,
      transactionId: newPaymentTransaction._id.toString(),
      amount,
      // amount: "1.00",
      shortDescription: "Aquinas SHS admission",
      callback: NPOINTU_ADMISSION_PAYMENT_CALLBACK_URL || "",
    });
    return NextResponse.json(
      {
        success: true,
        message: "Your payment is being processed",
        data: newPaymentTransaction,
      },
      { status: 201 }
    );
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error?.message || "Error adding student" },
      { status: 500 }
    );
  }
};
