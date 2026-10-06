import mongoose, { Types } from "mongoose";
import bcrypt from "bcryptjs";

export type IStudent = mongoose.Document & {
  _id: string;
  firstName: string;
  lastName?: string;
  password: string;
  gender: string;
  dob: Date;
  parentPhoneNumber?: string;
  parentFirstName?: string;
  parentLastName?: string;
  parentEmail?: string;
  subjects: Types.ObjectId[];
  classId: Types.ObjectId;
  deviceToken: string | null;
  studentId: string;
  yearOfAdmission: string;
  yearGroup: string; // for promotion
  pushNotificationAllowed?: boolean;
  isDeleted?: boolean;
  isSuspended?: boolean;
  deleteBy?: string;
  beceIndexNumber: string;
  csspsEnrolmentCode: string;
  placeOfBirth: string;
  jhsAttended: string;
  jhsType: string;
  intersts: string;
  schoolAwards: string;
  positionsHeld: string;
  admissionProgramme: string;
  aggregate: number;
  rawScore: number;
  town: string;
  district: string;
  region: string;
  permanentAddress: string;
  fatherFirstName: string;
  fatherLastName: string;
  fatherOccupation: string;
  motherFirstName: string;
  motherLastName: string;
  motherOccupation: string;
  parentPostalAddress: string;
  parentResidentialAddress: string;
  parentAltPhoneNumber: string;




  ssId?: string;



  // Add the comparePassword method to the interface
  comparePassword(password: string): Promise<boolean>;
};
const studentSchema = new mongoose.Schema<IStudent>(
  {
    parentEmail: { type: String, default: null },
    firstName: { type: String, required: true },
    lastName: { type: String, default: null },
    password: { type: String, trim: true, required: true },
    yearGroup: { type: String },
    yearOfAdmission: { type: String },
    parentPhoneNumber: { type: String, default: null },
    parentFirstName: { type: String, default: null },
    parentLastName: { type: String, default: null },
    admissionProgramme: { type: String, default: null },
    dob: { type: Date, default: null },
    gender: { type: String, required: true, default: "male" },
    subjects: { type: [Types.ObjectId], ref: "Subject", default: [] },
    classId: { type: mongoose.Schema.Types.ObjectId, ref: "Class", default: null },
    studentId: { type: String, required: true, unique: true, index: true },
    deviceToken: {
      type: String,
      default: null,
    },
    pushNotificationAllowed: {
      type: Boolean,
      default: true,
    },
    isDeleted: {
      type: Boolean,
      default: false,
    },
    isSuspended: {
      type: Boolean,
      default: false,
    },
    deleteBy: {
      type: String,
    },
    beceIndexNumber: {
      type: String,
      required: true,
    },
    placeOfBirth: {
      type: String,
    },
    csspsEnrolmentCode: {
      type: String,
    },
    jhsAttended: {
      type: String,
    },
    jhsType: {
      type: String,
    },
    intersts: {
      type: String,
    },
    schoolAwards: {
      type: String,
    },
    positionsHeld: {
      type: String,
    },
    aggregate: {
      type: Number,
    },
    rawScore: {
      type: Number,
    },
    town: {
      type: String,
    },
    district: {
      type: String,
    },
    region: {
      type: String,
    },
    permanentAddress: {
      type: String,
    },
    fatherFirstName: {
      type: String,
    },
    fatherLastName: {
      type: String,
    },
    fatherOccupation: {
      type: String,
    },
    motherFirstName: {
      type: String,
    },
    motherLastName: {
      type: String,
    },
    motherOccupation: {
      type: String,
    },
    parentPostalAddress: {
      type: String,
    },
    parentResidentialAddress: {
      type: String,
    },
    parentAltPhoneNumber: {
      type: String,
    },
  },
  { timestamps: true }
);
studentSchema.pre("save", async function (next) {
  try {
    const user = this as IStudent;
    if (user.isModified("password")) {
      const saltRounds = parseInt(process.env.BCRYPT_SALT as string, 10) || 10;
      user.password = await bcrypt.hash(user.password, saltRounds);
    }
    return next();
  } catch (e) {
    return next(e as mongoose.CallbackError);
  }
});

studentSchema.methods.comparePassword = async function (password: string) {
  try {
    return await bcrypt.compare(password, this.password);
  } catch {
    return false;
  }
};
const Student =
  mongoose.models.Student || mongoose.model("Student", studentSchema);
export default Student;
