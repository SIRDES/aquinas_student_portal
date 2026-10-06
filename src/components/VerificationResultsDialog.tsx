import Button from "@mui/material/Button";
import { Dispatch, SetStateAction, useState } from "react";

import IconButton from "@mui/material/IconButton";
import useMediaQuery from "@mui/material/useMediaQuery";
import CloseIcon from "@mui/icons-material/Close";
import RadioButtonUncheckedIcon from '@mui/icons-material/RadioButtonUnchecked';
import RadioButtonCheckedIcon from '@mui/icons-material/RadioButtonChecked';
import {
  Backdrop,
  Box,
  Divider,
  Paper,
  Typography,
  useTheme,
} from "@mui/material";
import { useStudentDetailsContext } from "@/context/StudentDetailsContext";
import { showAlert } from "./Alerts";

export default function VerificationResultsDialog({
  open,
  title,
  onNext,
  handleClose,
  fetchedStudents,
  setOpen,
}: {
  open: boolean;
  title: string;
  onNext?: () => void;
  handleClose: () => void;
  fetchedStudents: Array<any>;
  setOpen: Dispatch<SetStateAction<boolean>>;
}) {
  const theme = useTheme();
  // const router = useRouter();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const { studentDetails, setStudentDetails } = useStudentDetailsContext();
  const handleProceed = () => {
    if (studentDetails?.status !== "placed") {
      setOpen(false);
      setStudentDetails(null);
      showAlert({
        title: "Error",
        severity: "error",
        text: "Student has already been verified",
      })
      return;
    }
    if (onNext) {
      onNext();
      setOpen(false);
    }

    // router.push("/make-payment");
  };
  return (
    <>
      <Backdrop
        aria-labelledby="success-dialog"
        open={open}
        sx={{ zIndex: (theme) => theme.zIndex.drawer + 1 }}
      >
        <Box
          component={Paper}
          sx={{ minHeight: "25vh", width: isMobile ? "90vw" : "45vw" }}
        >
          <Box
            display={"flex"}
            justifyContent={"space-between"}
            alignItems={"center"}
            sx={{ px: isMobile ? 1 : 2, py: 1 }}
          >
            <Typography variant="body2" fontWeight={700}>
              {title}
            </Typography>
            <IconButton
              aria-label="close"
              onClick={handleClose}
              sx={{
                color: (theme) => theme.palette.grey[500],
              }}
            >
              <CloseIcon />
            </IconButton>
          </Box>
          <Divider />
          <Typography variant="body1" align="center" sx={{
            px: isMobile ? 1 : 2,
            py: 1,
            color: theme.palette.text.secondary,
          }}>
            Select to confirm that the details are correct for placement in this school. </Typography>
          <Divider />
          <Box

          >

            <Box sx={{
              maxHeight: "65vh", overflowY: "auto", px: isMobile ? 1 : 2,
            }}>
              {fetchedStudents.map((student: any, index: number) => (
                <Box mb={1} key={index} sx={{ display: "flex", justifyContent: "space-between", backgroundColor: studentDetails?._id === student._id ? theme.palette.primary.main : "", p: isMobile ? 1 : 2, color: studentDetails?._id === student._id ? "#fff" : "", borderBottom: "1px solid #ccc" }} onClick={() => setStudentDetails(student)} >
                  <Box>
                    <Typography variant="body1">
                      Name: {`${student?.firstName ? student.firstName : ""} ${student?.lastName ? student.lastName : ""}`}
                    </Typography>

                    <Typography variant="body1">
                      BECE index number: {`${student?.hashedBeceIndexNumber ? student.hashedBeceIndexNumber : ""}`}
                    </Typography>
                    <Typography variant="body1">
                      Programme: {`${student?.admissionProgramme ? student.admissionProgramme.toUpperCase() : ""} `}
                    </Typography>
                  </Box>
                  <IconButton>
                    {studentDetails?._id === student._id ? <RadioButtonCheckedIcon sx={{ color: "#fff" }} /> : <RadioButtonUncheckedIcon />}
                  </IconButton>
                </Box>
              ))}
            </Box>

            <Typography variant="body1" gutterBottom align="center" color={theme.palette.primary.main}>
              Processing fee for the use of this system is required.
            </Typography>
            <Box display={"flex"} justifyContent={"center"} gap={2} sx={{
              px: isMobile ? 1 : 2,
            }}>
              <Button
                variant="contained"
                size="small"
                // fullWidth
                // color="primary"
                onClick={handleProceed}
                sx={{ my: 1 }}
                disabled={!studentDetails}
              >
                Proceed to make payment
              </Button>
            </Box>
          </Box>
        </Box>
      </Backdrop >
    </>
  );
}
