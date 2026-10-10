"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import {
  Box,
  Button,
  Container,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  FormControl,
  FormHelperText,
  Grid,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  SelectChangeEvent,
  Slide,
  TextField,
  Typography,
  useTheme,
  // useMediaQuery,
} from "@mui/material";
import { TransitionProps } from "@mui/material/transitions";
import OnlyLogoAppBar from "@/components/OnlyLogoAppBar";
import {
  getAStudentByStudentId,
  sendStudentResultsWithPaymentId,
} from "@/utils/serverActions/student";
import { showAlert } from "@/components/Alerts";
import { getBatchByYearGroup } from "@/utils/serverActions/fridayTestBatch";
// import ConfirmationDialog from "@/components/ConfirmationDialog";
import { checkPaymentMadeForStudent } from "@/utils/serverActions/paymentTransaction";
import { getAccountName } from "@/utils/services/makePayment";
import axios from "axios";
import "react-phone-number-input/style.css";
import PhoneInput, { isValidPhoneNumber } from "react-phone-number-input";
import Link from "next/link";
import LoadingAlert from "@/components/LoadingAlert";
type FormData = {
  studentNumber: string;
  studentName: string;
  className: string;
  exam: string;
  momoNumber: string;
  momoNetwork: string;
  momoName: string;
};

const Transition = (
  props: TransitionProps & { children: React.ReactElement }
) => {
  return <Slide direction="up" {...props} />;
};

export default function CheckResultPage() {
  const theme = useTheme();
  //   const fullScreen = useMediaQuery(theme.breakpoints.down("md"));

  const [step, setStep] = useState<number>(1);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [studentData, setStudentData] = useState<{
    name: string;
    className: string;
    _id: string;
    parentPhoneNumber?: string;
  } | null>(null);
  const [fetchedExams, setFetchedExams] = useState<any[]>([]);

  const [showPaymentForm, setShowPaymentForm] = useState<boolean>(false);
  const [paymentData, setPaymentData] = useState<any>(null);
  const [momoPhoneNum, setMomoPhoneNum] = useState("");
  const [selectedExamData, setSelectedExamData] = useState<any>(null);
  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<FormData>();

  const watchStudentNumber = watch("studentNumber");
  const watchExam = watch("exam");
  const watchMomoNetwork = watch("momoNetwork");

  const handleMomoNumbersChange = (e: any) => {
    if (e === undefined) {
      setValue("momoNumber", "", {
        shouldDirty: true,
        shouldTouch: true,
        shouldValidate: true,
      });
      setMomoPhoneNum(e);
      return;
    }
    setValue("momoNumber", e, {
      shouldDirty: true,
      shouldTouch: true,
      shouldValidate: true,
    });
    setMomoPhoneNum(e);
  };

  const handleStudentNumberSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!watchStudentNumber) return;

    const cleanedStudentNumber = watchStudentNumber.replace(/\s+/g, "");

    setIsLoading(true);
    try {
      const response = await getAStudentByStudentId(cleanedStudentNumber);
      if (!response.success) {
        showAlert({
          title: "Error",
          severity: "error",
          text: response.message || "An error occurred",
        });
        return;
      }
      const data = response.data;
      const examsResponse = await getBatchByYearGroup(data.yearGroup);
      if (!examsResponse.success) {
        showAlert({
          title: "Error",
          severity: "error",
          text: examsResponse.message || "An error occurred",
        });
        return;
      }
      const exams = examsResponse.data;

      setStudentData(data);
      setValue("studentName", data.firstName + " " + data.lastName);
      setValue(
        "className",
        data.classDetails.form + " " + data.classDetails.name
      );
      setFetchedExams(exams);
      setStep(2);
    } catch (error) {
      //   console.error("Error fetching student data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleMakePayment = async (data: FormData) => {
    closeModal();
    setIsLoading(true);
    try {
      if (
        isValidPhoneNumber(data.momoNumber) === false ||
        data.momoNetwork === ""
      ) {
        showAlert({
          title: "Error",
          severity: "error",
          text: "Invalid momo number or network",
        });
        return;
      }
      const res = await axios.post(`/api/make-payment`, {
        msisdn: watch("momoNumber").replace("+", ""),
        studentId: studentData?._id as string,
        network:
          watch("momoNetwork") === "AIRTELTIGO"
            ? "tigo"
            : watch("momoNetwork") === "TELECEL"
              ? "Vodafone"
              : "MTN",
        // amount: selectedExamData?.isSemester ? "10.00" : "5.00",
        batchId: watch("exam"),
        shortDescription: "Aquinas SHS",
        examType: selectedExamData?.isSemester
          ? "semester_exams"
          : "friday_test",
      });
      if (res.data.success) {
        showAlert({
          title: "Success",
          severity: "success",
          text: "Payment request sent. Please wait for a prompt to authorize your payment",
          handleConfirmButtonClick: () => {
            setShowPaymentForm(false);
            setStep(1);
            window.location.reload();
          },
          allowOutsideClick: false,
        });
      } else {
        showAlert({
          title: "Error",
          severity: "error",
          text: "An error occurred, please try again.",
        });
      }
    } catch (error: any) {
      showAlert({
        title: "Error",
        severity: "error",
        text: error.message || "An error occurred, please try again.",
      });
    } finally {
      setIsLoading(false);
    }
  };
  const handleSendResults = async (paymentId: string) => {
    closeModal();
    setIsLoading(true);
    try {
      const res = await sendStudentResultsWithPaymentId({
        transaction_id: paymentId,
        // updateNumberOfTimesUsed: true,
      });
      if (res.success) {
        showAlert({
          title: "Success",
          severity: "success",
          text: "Results sent successfully",
          confirmButtonText: "Close",
          handleConfirmButtonClick: () => {
            setShowPaymentForm(false);
            setStep(1);
            window.location.reload();
          },
          allowOutsideClick: false,
        });
      } else {
        showAlert({
          title: "Error",
          severity: "error",
          text: "An error occurred, please try again.",
        });
      }
    } catch (error: any) {
      showAlert({
        title: "Error",
        severity: "error",
        text: error.message || "An error occurred, please try again.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Add this function to check payment status
  const checkPaymentStatus = async (data: FormData) => {
    try {
      setIsLoading(true);

      const response = await checkPaymentMadeForStudent({
        studentId: studentData?._id as string,
        batchId: data.exam,
      });
      if (response.success) {
        const data = response.data;
        setPaymentData(data);
        showAlert({
          title: "Payment Found",
          severity: "warning",
          text: `You have already paid for this exam. Your result will be sent to ${data?.msisdn}`,
          //   showCancelButton: true,
          //   cancelButtonText: "Close",
          showCloseButton: true,
          confirmButtonText: "Send Result",
          handleConfirmButtonClick: async () => {
            // send result
            await handleSendResults(data._id as string);
            // setPaymentData(null);
          },
        });
      } else {
        setPaymentData(null);
        showAlert({
          title: "Payment Required",
          severity: "warning",
          text: `You need to make payment of GHS ${selectedExamData?.isSemester ? "10.00" : "5.00"
            } to view this exam results.`,
          //   showCancelButton: true,
          //   cancelButtonText: "Close",
          showCloseButton: true,
          confirmButtonText: "Proceed to Payment",
          handleConfirmButtonClick: () => {
            setShowPaymentForm(true);
          },
          // onCancel: () => {
          //   setStep(1); // Go back to first step
          //   setPaymentData(null);
          // }
        });
      }
    } catch (error) {
      showAlert({
        title: "Error",
        severity: "error",
        text: "Failed to verify payment status. Please try again.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Update the exam select change handler
  const handleExamSelect = (e: SelectChangeEvent) => {
    const examId = e.target.value as string;
    setValue("exam", examId);
    setSelectedExamData(fetchedExams.find((exam) => exam._id === examId));
  };
  const formatMomoNumber = () => {
    if (isValidPhoneNumber(watch("momoNumber") || "") === false) {
      return "";
    }
    const formatNumber = `0${watch("momoNumber").slice(4).replace(/ /g, "")}`;
    return formatNumber;
  };
  useEffect(() => {
    const getMomoName = async () => {
      setIsLoading(true);
      setValue("momoName", "", {
        shouldValidate: true,
        shouldDirty: true,
        shouldTouch: true,
      });
      try {
        if (
          isValidPhoneNumber(watch("momoNumber") || "") === false ||
          watch("momoNetwork") === ""
        ) {
          return;
        }
        const getBankCode = () => {
          let bankCode = "";
          if (watch("momoNetwork") === "MTN") {
            bankCode = "MTN";
          } else if (watch("momoNetwork") === "TELECEL") {
            bankCode = "VOD";
          } else if (watch("momoNetwork") === "AIRTELTIGO") {
            bankCode = "ATL";
          }
          return bankCode;
        };
        // format number to 0240084448
        const formatNumber = formatMomoNumber();
        const response = await getAccountName({
          accountNumber: formatNumber,
          bankCode: getBankCode(),
        });
        const data = response;
        if (data.status === true) {
          setValue("momoName", data.data || "", {
            shouldValidate: true,
            shouldDirty: true,
            shouldTouch: true,
          });
        } else {
          showAlert({
            title: "Error",
            severity: "error",
            text: "Failed to get momo name. Please try again.",
          });
        }
      } catch (error) {
        showAlert({
          title: "Error",
          severity: "error",
          text: "Failed to get momo name. Please try again.",
        });
      } finally {
        setIsLoading(false);
      }
    };
    getMomoName();
  }, [setValue, watch("momoNetwork"), watch("momoNumber")]);

  const openModal = () => setIsOpen(true);
  const closeModal = () => setIsOpen(false);

  return (
    <>
      <LoadingAlert open={isLoading} />
      <OnlyLogoAppBar
        title="Check Result"
        showRightContent={true}
        rightContent={
          <Link href="/check-result/faq" style={{ color: "white" }}>
            view FAQs
          </Link>
        }
      />
      <Container component="main" maxWidth="sm">
        <Box
          sx={{
            marginTop: 2,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
          }}
        >
          <Typography variant="body2" sx={{ mb: 2, textAlign: "center" }}>
            For help WhatsApp: <br />
            <a href="https://wa.me/233247199122" target="_blank">
              0247199122
            </a>{" "}
            or{" "}
            <a href="https://wa.me/233240084448" target="_blank">
              0240084448
            </a>
          </Typography>

          {/* Add download instruction link here */}
          <Typography variant="body2" sx={{ mb: 2 }}>
            <a
              href="/how_to_check_exam_result.pdf"
              download="how_to_check_exam_result.pdf"
            >
              Download Instructions
            </a>
          </Typography>

          <Paper
            elevation={1}
            sx={{
              padding: 2,
              width: "100%",
              // marginTop: 2,
            }}
          >
            <Typography variant="h6" align="center" gutterBottom>
              {step === 1
                ? "Enter Student Number e.g. SCI/230/2023"
                : showPaymentForm
                  ? "Payment Form"
                  : "Student Details"}
            </Typography>

            {step === 1 && (
              <Box
                component="form"
                onSubmit={handleStudentNumberSubmit}
                sx={{ mt: 3 }}
              >
                <Grid container spacing={2}>
                  <Grid item xs={12}>
                    <TextField
                      required
                      fullWidth
                      id="studentNumber"
                      label="Student Number"
                      autoFocus
                      {...register("studentNumber", {
                        required: "Student number is required",
                      })}
                      error={!!errors.studentNumber}
                      helperText={errors.studentNumber?.message}
                      disabled={isLoading}
                    />
                  </Grid>
                </Grid>
                <Button
                  type="submit"
                  fullWidth
                  variant="contained"
                  disabled={isLoading}
                  sx={{ mt: 3, mb: 2 }}
                >
                  {isLoading ? "Loading..." : "Continue"}
                </Button>
              </Box>
            )}

            {step === 2 && !showPaymentForm && (
              <Box
                component="form"
                onSubmit={handleSubmit(checkPaymentStatus)}
                sx={{ mt: 3 }}
              >
                <Grid container spacing={2}>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      id="studentName"
                      label="Student Name"
                      InputProps={{
                        readOnly: true,
                      }}
                      variant="outlined"
                      {...register("studentName")}
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      id="className"
                      label="Class"
                      InputProps={{
                        readOnly: true,
                      }}
                      variant="outlined"
                      {...register("className")}
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <FormControl fullWidth error={!!errors.exam}>
                      <InputLabel id="exam-label">Exam *</InputLabel>
                      <Select
                        labelId="exam-label"
                        id="exam"
                        label="Exam *"
                        value={watchExam || ""}
                        {...register("exam", {
                          required: "Please select an exam",
                        })}
                        onChange={handleExamSelect}
                      >
                        <MenuItem value="">
                          <em>Select exam</em>
                        </MenuItem>
                        {fetchedExams.map((exam) => (
                          <MenuItem key={exam._id} value={exam._id}>
                            {exam.name}
                          </MenuItem>
                        ))}
                      </Select>
                      {errors.exam && (
                        <FormHelperText>{errors.exam.message}</FormHelperText>
                      )}
                    </FormControl>
                  </Grid>
                </Grid>

                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    mt: 3,
                  }}
                >
                  <Button
                    variant="outlined"
                    onClick={() => setStep(1)}
                    sx={{ mr: 1 }}
                  >
                    Back
                  </Button>
                  <Button
                    type="submit"
                    variant="contained"
                    color="primary"
                    disabled={isLoading}
                  >
                    {isLoading ? "Loading..." : "Submit"}
                  </Button>
                </Box>
              </Box>
            )}

            {showPaymentForm && (
              <Box
                component="form"
                onSubmit={handleSubmit(openModal)}
                sx={{ mt: 3 }}
              >
                <Grid container spacing={2}>
                  <Grid item xs={12}>
                    {/* <TextField
                      fullWidth
                      id="momoNumber"
                      label="Mobile Money Number"
                      type="tel"
                      placeholder="e.g., 0244123456"
                      {...register("momoNumber", {
                        required: "Mobile money number is required",
                        pattern: {
                          value: /^0\d{9}$/,
                          message:
                            "Please enter a valid phone number (e.g., 0244123456)",
                        },
                      })}
                      error={!!errors.momoNumber}
                      helperText={errors.momoNumber?.message}
                    /> */}
                    <PhoneInput
                      defaultCountry="GH"
                      countries={["GH"]}
                      countryCallingCodeEditable={false}
                      international
                      value={momoPhoneNum}
                      onChange={(formattedValue) =>
                        handleMomoNumbersChange(formattedValue)
                      }
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <FormControl fullWidth error={!!errors.momoNetwork}>
                      <InputLabel id="momo-network-label">
                        Mobile Network *
                      </InputLabel>
                      <Select
                        labelId="momo-network-label"
                        id="momoNetwork"
                        label="Mobile Network *"
                        value={watchMomoNetwork || ""}
                        {...register("momoNetwork", {
                          //   required: "Please select a mobile network",
                        })}
                      >
                        <MenuItem value="">
                          <em>Select network</em>
                        </MenuItem>
                        <MenuItem value="MTN">MTN Mobile Money</MenuItem>
                        <MenuItem value="TELECEL">Telecel Cash</MenuItem>
                        <MenuItem value="AIRTELTIGO">AirtelTigo Money</MenuItem>
                      </Select>
                      {errors.momoNetwork && (
                        <FormHelperText>
                          {errors.momoNetwork.message}
                        </FormHelperText>
                      )}
                    </FormControl>
                  </Grid>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      id="momoName"
                      //   label="Mobile Money Name"
                      type="text"
                      //   InputProps={{
                      //     readOnly: true,
                      //   }}
                      disabled
                      placeholder="e.g., John Doe"
                      {...register("momoName", {
                        required: "Mobile money name is required",
                      })}
                      error={!!errors.momoName}
                      helperText={errors.momoName?.message}
                    />
                  </Grid>
                </Grid>
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    mt: 3,
                  }}
                >
                  <Button
                    variant="outlined"
                    onClick={() => {
                      setShowPaymentForm(false);
                      setValue("exam", "");
                    }}
                  >
                    Back
                  </Button>
                  <Button
                    type="submit"
                    variant="contained"
                    color="primary"
                    disabled={isLoading}
                  >
                    {isLoading ? "Processing..." : "Make Payment"}
                  </Button>
                </Box>
              </Box>
            )}
          </Paper>
        </Box>

        {/* Confirmation Dialog */}
        <Dialog
          // fullScreen={fullScreen}
          open={isOpen}
          onClose={closeModal}
          TransitionComponent={Transition}
          aria-labelledby="confirmation-dialog-title"
        >
          <DialogTitle id="confirmation-dialog-title">
            Confirm Your Details
          </DialogTitle>
          <DialogContent>
            <DialogContentText>
              Please review your information before submitting:
            </DialogContentText>
            <Box sx={{ mt: 2, "& > :not(style)": { mb: 1 } }}>
              <Typography>
                <strong>Name:</strong> {watch("studentName")}
              </Typography>
              <Typography>
                <strong>Class:</strong> {watch("className")}
              </Typography>
              <Typography>
                <strong>Exam:</strong> {selectedExamData?.name}
              </Typography>
              <Typography>
                <strong>MoMo Number:</strong> {watch("momoNumber")}
              </Typography>
              <Typography>
                <strong>Network:</strong> {watch("momoNetwork")}
              </Typography>
              <Typography>
                <strong>Name:</strong> {watch("momoName")}
              </Typography>
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={closeModal} color="primary">
              Cancel
            </Button>
            <Button
              onClick={handleSubmit(handleMakePayment)}
              color="primary"
              variant="contained"
              autoFocus
            >
              Confirm & Submit
            </Button>
          </DialogActions>
        </Dialog>
      </Container>
    </>
  );
}
