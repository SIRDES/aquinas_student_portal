// import axios from "axios";

import { HTTPCodes } from "@/lib/constants";
import { connectDB } from "@/lib/mongodb";
import axios from "axios";
import { NextRequest, NextResponse } from "next/server";

export const POST = async (request: any, response: any) => {
  const reqBody = await request.json()
  try {
    // await connectDB();
    // verify placement status from cssps to see if student is placed in this school
    // The user will submit BECE index number
    const student = { firstName: "Judith", lastName: "Adjei-Mintah", jhsAttended: "Essam JHS B", indexNumber: reqBody.indexNumber, programme: "General Science" };
    return new NextResponse(
      JSON.stringify({ status: "success", message: "student has been placed in this school", data: student }),
      {
        status: HTTPCodes.accepted,
      }
    );
  } catch (error: any) {
    return new NextResponse(
      JSON.stringify({ status: error.message, message: "Failed to register" }),
      {
        status: HTTPCodes.internalServerError,
      }
    );
  }
};
