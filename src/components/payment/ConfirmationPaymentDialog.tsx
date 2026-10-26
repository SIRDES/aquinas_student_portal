import Button from "@mui/material/Button";
import {
  Box,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Slide,
  Typography,
} from "@mui/material";
import { TransitionProps } from "@mui/material/transitions";
import { isValidPhoneNumber } from "react-phone-number-input";
import { showAlert } from "../Alerts";
import { useState } from "react";
import axios from "axios";
import LoadingAlert from "../LoadingAlert";

const Transition = (
  props: TransitionProps & { children: React.ReactElement }
) => {
  return <Slide direction="up" {...props} />;
};


type ConfirmPaymentDataProps = {
  studentNumber: string;
  studentName: string;
  className: string;
  examName: string;
  momoNumber: string;
  momoNetwork: string;
  momoName: string;
  studentId: string;
  examId: string;
  isSemester: boolean;
};



export default function ConfirmationPaymentDialog({
  open,
  onClose,
  handleConfirmation,
  ConfirmPaymentData,
}: {
  open: boolean;
  ConfirmPaymentData: ConfirmPaymentDataProps;
  handleConfirmation: () => void;
  onClose: () => void;
}) {
  const [isLoading, setIsLoading] = useState<boolean>(false);


  const handleMakePayment = async () => {
    onClose();
    setIsLoading(true);
    try {
      if (
        isValidPhoneNumber(ConfirmPaymentData.momoNumber) === false ||
        ConfirmPaymentData.momoNetwork === ""
      ) {
        showAlert({
          title: "Error",
          severity: "error",
          text: "Invalid momo number or network",
        });
        return;
      }
      const res = await axios.post(`/api/make-payment`, {
        msisdn: ConfirmPaymentData.momoNumber.replace("+", ""),
        studentId: ConfirmPaymentData.studentId as string,
        network:
          ConfirmPaymentData.momoNetwork === "AIRTELTIGO"
            ? "tigo"
            : ConfirmPaymentData.momoNetwork === "TELECEL"
              ? "Vodafone"
              : "MTN",
        batchId: ConfirmPaymentData.examId,
        // shortDescription: "Aquinas SHS",
        examType: ConfirmPaymentData.isSemester
          ? "semester_exams"
          : "friday_test",
      });
      if (res.data.success) {
        showAlert({
          title: "Success",
          severity: "success",
          text: "Payment request sent. Please wait for a prompt to authorize your payment",
          handleConfirmButtonClick: () => {
            // setShowPaymentForm(false);
            // setStep(1);
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

  return (
    <>
      <LoadingAlert open={isLoading} />
      <Dialog
        open={open}
        onClose={onClose}
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
              <strong>Name:</strong> {ConfirmPaymentData.studentName}
            </Typography>
            <Typography>
              <strong>Class:</strong> {ConfirmPaymentData.className}
            </Typography>
            <Typography>
              <strong>Exam:</strong> {ConfirmPaymentData.examName}
            </Typography>
            <Typography>
              <strong>MoMo Number:</strong> {ConfirmPaymentData.momoNumber}
            </Typography>
            <Typography>
              <strong>Network:</strong> {ConfirmPaymentData.momoNetwork}
            </Typography>
            <Typography>
              <strong>Name:</strong> {ConfirmPaymentData.momoName}
            </Typography>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose} color="primary">
            Cancel
          </Button>
          <Button
            onClick={handleMakePayment}
            color="primary"
            variant="contained"
            autoFocus
          >
            Confirm & Submit
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
