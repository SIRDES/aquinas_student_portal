import nextAuth from "next-auth";

declare module "next-auth" {
  interface User {
    _id: string;
    beceIndexNumber: string;
    admissionCode: string;
    firstName: string;
    lastName: string;
    studentId: string;
    yearGroup: string;
    yearOfAdmission: string;
    cassRefID: string;
    classId: string;
    parentEmail: string;
    parentPhoneNumber: string;
    parentFirstName: string;
    parentLastName: string;
    dob: Date;
    gender: string;
    subjects: string[];
    subjectInfo: {
      _id: string;
      name: string;
      type: string;
      isNewCurriculum: boolean;
      isDeleted: boolean;
      isSuspended: boolean;
      __v: number;
      createdAt: Date;
      updatedAt: Date;
      shortName: string;
    }[];
    classInfo: {
      _id: string;
      name: string;
      form: string;
      programme: string;
      isNewCurriculum: boolean;
      isDeleted: boolean;
      isSuspended: boolean;
      __v: number;
      createdAt: Date;
      updatedAt: Date;
      programmeInfo: {
        _id: string;
        name: string;
        isNewCurriculum: boolean;
        isDeleted: boolean;
        isSuspended: boolean;
        __v: number;
        createdAt: Date;
        updatedAt: Date;
      };
    };
    ssId: string;
    deviceToken: string;
    pushNotificationAllowed: boolean;
    // role: "admin" | "teacher" | "student";
    isSuspended?: boolean;
  }

  interface Session {
    user: User;
  }
}
