import { AlertColor } from "@mui/material";


export type BatchDetailsType = {
  form:"",
  amount:number,
  startDate:Date,
  endDate:Date
}
export type SnackbarType = {
  open: boolean;
  message: string;
  severity: AlertColor | undefined;
};


export type StudentType = {
  id: string;
  parentFirstName: string;
  paymentType: 'FULL PAYMENT' | 'PART PAYMENT';
  parentAreaOfResidence?: string;
  parentEmail?: string;

  onScholarship: 'NO' | 'YES';

  parentOccupation?: string;
  amountPaid: number,
  middleName?: string;
  phoneNumber?: string;
  email?: string;
 
  lastName: string;
  programme: string;
  schoolName: string;
  firstName: string;
  parentMiddleName?: string;

  gender: 'MALE' | 'FEMALE';
  parentPhoneNumber: string;
  studentNumber: string;
  areaOfResidence: string;
  parentLastName: string;
};


