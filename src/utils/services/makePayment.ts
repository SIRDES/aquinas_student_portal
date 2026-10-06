"use server";

import axios from "axios";
const { BASE_URL, PAYSTACK_SECRET_KEY, NPOINTU_UID, NPOINTU_PASS } = process.env;

export const axiosInstance = axios.create({
  baseURL: BASE_URL,
});

export const getAccountName = async ({
  accountNumber,
  bankCode,
}: {
  accountNumber: string;
  bankCode: string;
}) => {
  try {
    const headers = {
      Authorization: "Bearer " + PAYSTACK_SECRET_KEY,
      "Content-Type": "application/json",
    };
    let response = await axios.get(
      `https://api.paystack.co/bank/resolve?account_number=${accountNumber}&bank_code=${bankCode}`,
      { headers }
    );
    const data = response.data;
    // console.log("data", data)
    if (data.status === true) {
      return {
        status: true,
        data: data.data.account_name,
      };
    }
    return { status: false, data: null };
  } catch (error) {
    console.log("Error fetching account name:", error);
    return { status: false, data: null };
  }
};

export const makePayment = async ({
  number,
  transactionId,
  vendor,
  amount,
  shortDescription,
  callback,
}: {
  number: string;
  transactionId: string;
  vendor: "MTN" | "Airtel" | "Vodafone" | "Tigo";
  amount: string;
  shortDescription: string;
  callback: string;
}) => {
  const msg = "Aquinas SHS admission"; // Replace with your actual message

  // const amt = "5.00";

  const requestBody = {
    // number,
    // vendor,
    // uid: NPOINTU_UID,
    // pass: NPOINTU_PASS,
    // tp: transactionId,
    // cbk: callback,
    // amt: amount,
    // msg: shortDescription,
    // trans_type: "debit",






    "transaction_id": transactionId,
    "network": vendor.toLowerCase(),
    "amount": amount,
    "phone_number": number,
    "reference": shortDescription,
    "callback_url": callback
  };

  // console.log("make payement requestBody", requestBody);
  // console.log("NPOINTU_UID", NPOINTU_UID);
  // console.log("NPOINTU_PASS", NPOINTU_PASS);
  try {
    const authHeader = `Basic ${Buffer.from(`${NPOINTU_UID}:${NPOINTU_PASS}`).toString("base64")}`;
    const response = await axios.post(
      "https://pay.npontu.com/api/v1/pay",
      // "https://pay.npontu.com/api/pay",
      requestBody,
      {
        headers: {
          Authorization: authHeader,
        },
      }
    );
    console.log("make payement req response.data", response.data);
    return response;
  } catch (error) {
    console.error("Error making payment:", error);
  }
};
