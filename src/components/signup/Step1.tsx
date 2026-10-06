"use client";
import { yupResolver } from "@hookform/resolvers/yup";
import {
  Box,
  Button,
  Grid,
  TextField,
  Typography,
  useTheme,
} from "@mui/material";
import * as Yup from "yup";
import { useForm } from "react-hook-form";
import { useRouter } from "next/navigation";

import "react-phone-number-input/style.css";
import { useState } from "react";
import { nameOfSchool } from "@/lib/constants";
import { getStudentByHashedBeceIndexNumber } from "@/utils/serverActions/placedStudent";
import { useAdminSettings } from "@/hooks/useAdminSettings";
import { useStudentDetailsContext } from "@/context/StudentDetailsContext";
import { showAlert } from "../Alerts";
import LoadingAlert from "../LoadingAlert";
import VerificationResultsDialog from "../VerificationResultsDialog";

const schema = Yup.object().shape({
  indexNumber: Yup.string()
    .required("Index Number is required")
    .length(12, "Index Number must be exactly 12 characters"),
});
export interface FormData extends Yup.InferType<typeof schema> {
  // using interface instead of type generally gives nicer editor feedback
}

export default function Step1({ onNext }: { onNext: () => void }) {
  const theme = useTheme();
  const router = useRouter();
  const { adminSettings } = useAdminSettings()
  const { setStudentDetails } = useStudentDetailsContext();
  const [openVerificationDialog, setOpenVerificationDialog] = useState(false);
  const [fetechedStudents, setFetchedStudents] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  // const [phoneNum, setPhoneNum] = useState("");
  const form = useForm({
    resolver: yupResolver(schema),
    mode: "all",
  });

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isDirty, isValid },
    // control,
  } = form;

  const handleCloseVerificationDialog = () => {
    // router.push("/students");
    setStudentDetails(null);
    setOpenVerificationDialog(false);
  };
  const Submit = async (dat: FormData) => {
    setLoading(true)
    try {
      const res = await getStudentByHashedBeceIndexNumber({ beceIndexNumber: dat.indexNumber, yearOfAdmission: adminSettings?.admissionDetails?.admissionYear });
      if (res.success === false) {
        showAlert({
          title: "Error",
          severity: "error",
          text: res.message || "An error occurred",
        })
        return
      }
      const data = res.data;
      let list: any[] = [];
      data.forEach((item: any) => {
        list.push({
          ...item,
          beceIndexNumber: dat.indexNumber,
          hashedBeceIndexNumber: item.hashedBeceIndexNumber,
          firstName: item.firstName,
          lastName: item.lastName,
          admissionProgramme: item.admissionProgramme,
          aggregate: item.aggregate,
        });
      });
      setFetchedStudents(list);
      setOpenVerificationDialog(true);

    } catch (error: any) {
      showAlert({
        title: "Error",
        severity: "error",
        text: error.message || "An error occurred",
      })

    } finally {
      setLoading(false)
    }
  };

  return (
    <>
      <LoadingAlert open={loading} />
      <VerificationResultsDialog
        open={openVerificationDialog}
        title="Verification Results"
        fetchedStudents={fetechedStudents}
        onNext={onNext}
        handleClose={handleCloseVerificationDialog}
        setOpen={setOpenVerificationDialog}
      />
      <Grid
        item
        xs={12}
        md={6}
        style={{
          padding: "10px 20px",
        }}
      >
        <Box
          component={"form"}
          onSubmit={handleSubmit(Submit)}
          noValidate
          style={{
            width: "100%",
            color: theme.palette.text.primary,
          }}
        >
          {/* <Button onClick={handleAddAdmission}>handleAddAdmission</Button> */}
          <Typography variant="h6" sx={{ fontWeight: 700 }}>
            Verify your placement to this school
          </Typography>
          <Typography>{nameOfSchool}</Typography>

          <Box
            display={"flex"}
            flexDirection={"column"}
            gap={"20px"}
            width={"100%"}
            mb={2}
          >
            <Box>
              <Typography variant="body2" gutterBottom>
                BECE Index number
              </Typography>
              <TextField
                fullWidth
                variant="standard"
                required
                placeholder="Enter BECE index number"
                inputProps={{
                  style: {
                    border: "2px solid #ABB3BF",
                    padding: "10px",
                    // paddingTop: "17px",
                    borderRadius: "5px",
                  },
                }}
                {...register("indexNumber", {
                  required: true,
                })}
              />
              <Typography variant="subtitle2" color="error">
                {errors.indexNumber?.message}
              </Typography>
            </Box>
          </Box>
          <Button
            sx={{ mb: 2 }}
            variant="contained"
            type="submit"
            fullWidth
            disabled={!isDirty || !isValid || loading}
          >
            {loading ? "verifying..." : "Verify"}
          </Button>
          <Typography color={theme.palette.text.disabled}>
            I have already verify and made payment?{" "}
            <span
              style={{ color: theme.palette.primary.main, cursor: "pointer" }}
              onClick={() => router.push("/login")}
            >
              Login
            </span>
          </Typography>
        </Box>
      </Grid>
    </>
  );
}
