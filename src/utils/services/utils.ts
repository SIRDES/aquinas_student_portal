import axios from "axios";
// replace card number with stars

export const contactNumbers = "0247199122/0240084448"

export const formatter = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "GHC",
});
export const currencyFormatter = (value: number | bigint) => {
  const formatter = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "GHC",
  });
  return formatter.format(value);
};

export function isGreaterThan24HourAgo(date: Date) {
  //                      hour  min  sec  milliseconds
  const twentyFourHrInMs = 24 * 60 * 60 * 1000;

  const twentyFourHoursAgo = Date.now() - twentyFourHrInMs;
  console.log(new Date(date).getTime(), twentyFourHoursAgo);
  console.log(new Date(date).getTime() <= twentyFourHoursAgo);

  return new Date(date).getTime() <= twentyFourHoursAgo;
}

export const sortSubjects = (subject1: any, subject2: any) => {
  if (subject1?.name < subject2?.name) {
    return -1;
  }
  if (subject1?.name > subject2?.name) {
    return 1;
  }
  return 0;
};

export function removePlusSign(phoneNumber: string) {
  return phoneNumber.replace("+", "");
}


