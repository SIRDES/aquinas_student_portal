"use server";
import axios, { AxiosRequestConfig } from "axios";
import { getAdminSetting } from "../serverActions/adminSettings";

const API_URL = "https://sms.arkesel.com/api/v2/sms/template/send";
const API_KEY = process.env.ARKESEL_SMS_API_KEY as string; // Replace with your actual API key
const MNOTIFY_API_KEY = process.env.MNOTIFY_API_KEY as string;
const SMS_SENDER = "AQUINAS SHS";
// Define TypeScript interfaces for structured typing
interface SmsPayload {
  message: string;
  recipients: any[];
  callback_url?: string;
}

const headers = {
  "api-key": API_KEY,
  "Content-Type": "application/json",
};

// Function to send SMS
const sendSms = async (body: SmsPayload) => {
  const data = {
    sender: SMS_SENDER,
    message: body.message,
    recipients: body.recipients,
  };
  const mnofityData = {
    'recipient': body.recipients,
    'sender': SMS_SENDER,
    'message': body.message,
    'is_schedule': 'false',
    'schedule_date': ''
  }
  const config: AxiosRequestConfig = {
    method: "post",
    url: "https://sms.arkesel.com/api/v2/sms/send",
    headers,
    data,
  };

  const mnotifyConfig: AxiosRequestConfig = {
    method: 'post',
    url: 'https://api.mnotify.com/api/sms/quick?key=' + MNOTIFY_API_KEY,
    headers: {
      'Accept': 'application/json'
    },
    data: mnofityData

  }
  // console.log("config", config);
  try {
    const adminSettings = await getAdminSetting()
    if (adminSettings?.data?.smsProvider == 'MNOTIFY') {
      const response = await axios(mnotifyConfig);
      // console.log("Response:", response);
    } else {
      const response = await axios(config);
    }
    // console.log("Response:", response);
  } catch (error) {
    console.error("Error:", error);
  }
};

const sendTemplateSms = async (body: SmsPayload) => {
  const data = {
    sender: SMS_SENDER,
    message: body.message,
    recipients: body.recipients,
  };

  const config: AxiosRequestConfig = {
    method: "post",
    url: "https://sms.arkesel.com/api/v2/sms/template/send",
    headers,
    data: data,
  };

  try {
    const response = await axios(config);
  } catch (error) {
    console.error("Error:", error);
  }
};

export const sendSMSWithCallbackUrl = async ({
  parentPhoneNumber,
  content,
  callback_url,
}: {
  parentPhoneNumber: string;
  content: string;
  callback_url: string;
}) => {
  try {
    // console.log("headersList", headersList);
    let bodyContent = JSON.stringify({
      sender: SMS_SENDER,
      message: content,
      recipients: parentPhoneNumber,
      callback_url: callback_url,
    });

    let reqOptions = {
      url: "https://sms.arkesel.com/api/v2/sms/send",
      method: "POST",
      headers,
      data: bodyContent,
    };
    let response = await axios.request(reqOptions);
    // console.log("sendMessage ok res", response.data);
    return response.data;
  } catch (error: any) {
    console.log("sendMessage error res", error);
    console.log("sendMessage error res data", error.response.data);
    return error?.response?.data;
  }
};

export { sendSms, sendTemplateSms };
