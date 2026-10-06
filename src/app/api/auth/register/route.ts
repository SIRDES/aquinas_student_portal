// import axios from "axios";

import { HTTPCodes } from "@/lib/constants";
import { connectDB } from "@/lib/mongodb";
import Student from "@/models/Student";
import axios from "axios";
import { NextRequest, NextResponse } from "next/server";

export const POST = async (request: any, response: any) => {
  const reqBody = await request.json()
  try {
    await connectDB();
    const student = await Student.create(reqBody);
    return new NextResponse(
      JSON.stringify({ status: "success", message: "success", data: student }),
      {
        status: HTTPCodes.created,
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
