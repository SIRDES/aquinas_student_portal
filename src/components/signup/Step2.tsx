"use client";
import { yupResolver } from "@hookform/resolvers/yup";
import {
  Box,
  Button,
  Grid,
  MenuItem,
  Select,
  TextField,
  Typography,
  useTheme,
} from "@mui/material";
import Image from "next/image";
import * as Yup from "yup";
import { useForm } from "react-hook-form";
import { useRouter } from "next/navigation";

import "react-phone-number-input/style.css";
import PhoneInput, { isValidPhoneNumber } from "react-phone-number-input";
import { useEffect, useState } from "react";
import axios from "axios";
import { nameOfSchool } from "@/lib/constants";
import { updateAfterPayment } from "@/utils/serverActions/placedStudent";
import { useAdminSettings } from "@/hooks/useAdminSettings";
import { useStudentDetailsContext } from "@/context/StudentDetailsContext";
import { showAlert } from "../Alerts";
import LoadingAlert from "../LoadingAlert";
import ConfirmationDialog from "../ConfirmationDialog";
import { CustomizedSelect } from "../CustomizedSelect";
import {  getAccountName } from "@/utils/services/makePayment";

const schema = Yup.object().shape({
  parentPhoneNumber: Yup.string().required("Parent/Guardian Phone Number is required"),

  momoNumber: Yup.string().required("MOMO Number is required"),
  network: Yup.string().required("Network is required"),
  momoName: Yup.string().required("Enter a valid MOMO number and select it network"),
  // parentEmail: Yup.string().required("Parent/Guardian Email is required"),
  beceIndexNumber: Yup.string().required("Index Number is required"),
});
export interface FormData extends Yup.InferType<typeof schema> {
  // using interface instead of type generally gives nicer editor feedback
}

export default function Step2({ onPrevious }: { onPrevious: () => void }) {
  const theme = useTheme();
  const router = useRouter();
  const { adminSettings } = useAdminSettings();
  const { studentDetails, setStudentDetails } = useStudentDetailsContext();

  const [openConfirmationModal, setOpenConfirmationModal] = useState<boolean>(false);
  const [loading, setLoading] = useState(false);
  const [phoneNum, setPhoneNum] = useState("");
  const [momoPhoneNum, setMomoPhoneNum] = useState("");
  // const [momoNumber, setMomoNumber] = useState("");
  const form = useForm({
    // defaultValues: {
    //   selectedCard: "placeholder",
    //   prepaidCardNumber: "",
    //   amount: 0.0,
    //   reference: "",
    // },
    resolver: yupResolver(schema),
    mode: "all",
  });

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { errors, isDirty, isValid },
    // control,
  } = form;
  useEffect(() => {
    setValue("beceIndexNumber", studentDetails?.beceIndexNumber || "", {
      shouldValidate: true,
      shouldDirty: true,
      shouldTouch: true,
    });
  }, [setValue, studentDetails?.beceIndexNumber]);

  const formatMomoNumber = () => {
    if (isValidPhoneNumber(watch("momoNumber") || "") === false) {
      return "";
    }
    const formatNumber = `0${watch("momoNumber").slice(4).replace(/ /g, "")}`;
    return formatNumber
  };

  useEffect(() => {
    const getMomoName = async () => {
      setLoading(true);
      try {
        if (isValidPhoneNumber(watch("momoNumber") || "") === false || watch("network") === "") {
          setValue("momoName", "", {
            shouldValidate: true,
            shouldDirty: true,
            shouldTouch: true,
          });
          return;
        }
        const getBankCode = () => {
          let bankCode = "";
          if (watch("network") === "MTN") {
            bankCode = "MTN";
          } else if (watch("network") === "TELECEL") {
            bankCode = "VOD";
          } else if (watch("network") === "AIRTELTIGO") {
            bankCode = "ATL";
          }
          return bankCode;
        }
        // format number to 0240084448
        const formatNumber = formatMomoNumber();
        // console.log("formatNumber", formatNumber)
        const response = await getAccountName({ accountNumber: formatNumber, bankCode: getBankCode() });
        const data = response
        // console.log("data>>>>>>>>>>", data)
        if (data.status === true) {
          setValue("momoName", data.data || "", {
            shouldValidate: true,
            shouldDirty: true,
            shouldTouch: true,
          });
        } else {
          setValue("momoName", "", {
            shouldValidate: true,
            shouldDirty: true,
            shouldTouch: true,
          });
        }
      } catch (error) {

      } finally {
        setLoading(false);
      }
    }
    getMomoName();
  }, [setValue, watch("network"), watch("momoNumber")]);
  const handlePhoneNumbersChange = (e: any, type = "") => {

    if (e === undefined) {
      setValue("parentPhoneNumber", "", {
        shouldDirty: true,
        shouldTouch: true,
        shouldValidate: true,
      });
      setPhoneNum(e);
      return;
    }
    setValue("parentPhoneNumber", e, {
      shouldDirty: true,
      shouldTouch: true,
      shouldValidate: true,
    });
    setPhoneNum(e);
  };
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

  const handleCloseConfirmationModal = () => {
    setOpenConfirmationModal(false);
    // router.push("/login");
  }
  // const handleSuccess = async (response: any) => {
  //   setLoading(true);
  //   try {

  //     const dat = {
  //       ...studentDetails,
  //       parentPhoneNumber: watch("parentPhoneNumber"),
  //       // parentEmail: watch("parentEmail"),
  //       beceIndexNumber: watch("beceIndexNumber"),
  //       paystackPaymentReference: response.reference,
  //       paystackMessage: response.message,
  //       admissionId: adminSettings?.admissionDetails?._id,
  //     };
  //     const result = await updateAfterPayment({ id: studentDetails._id, data: dat });
  //     if (result.status === "success") {
  //       showAlert({
  //         title: "Success",
  //         severity: "success",
  //         text: "Admission code will be sent to parent/Guardian",
  //         handleConfirmButtonClick: () => {
  //           router.push("/login")
  //         },
  //         allowOutsideClick: false
  //       })
  //     }
  //   } catch (error) {

  //   } finally {
  //     setLoading(false)
  //   }
  // };


  const handleMakePayment = async () => {
    setLoading(true);
    handleCloseConfirmationModal();
    try {
      const dat = {
        ...studentDetails,
        parentPhoneNumber: watch("parentPhoneNumber"),
        // parentEmail: watch("parentEmail"),
        beceIndexNumber: watch("beceIndexNumber"),
        // paystackPaymentReference: response.reference,
        // paystackMessage: response.message,
        admissionId: adminSettings?.admissionDetails?._id,
      };

      const res = await axios.post(`/api/make-admission-payment`, {
        // format number to 233240084448 by removing +
        msisdn: watch("momoNumber").replace("+", ""),
        placedStudentId: studentDetails._id,
        network: watch("network") === "AIRTELTIGO" ? "Airtel" : watch("network") === "TELECEL" ? "Vodafone" : "MTN",
        amount: "50.00",
        parentPhoneNumber: watch("parentPhoneNumber"),
        beceIndexNumber: watch("beceIndexNumber"),
        hashedBeceIndexNumber: studentDetails.hashedBeceIndexNumber,
        admissionId: adminSettings?.admissionDetails?._id,
      });
      if (res.data.success) {
        showAlert({
          title: "Success",
          severity: "success",
          text: "Payment request sent. Please wait for a prompt to authorize your payment",
          handleConfirmButtonClick: () => {
            router.push("/login")
          },
          allowOutsideClick: false
        })
      } else {

        showAlert({
          title: "Error",
          severity: "error",
          text: "An error occurred, please try again.",
        })
      }

    } catch (error: any) {
      console.log("error", error)
      showAlert({
        title: "Error",
        severity: "error",
        text: error.message || "An error occurred, please try again.",
      })
    } finally {
      setLoading(false)
    }
  };
  const handleClose = async () => {
  }
  const Submit = async (dat: FormData) => {
    setOpenConfirmationModal(true);
  };
  return (
    <>
      <LoadingAlert open={loading} />
      <ConfirmationDialog open={openConfirmationModal} setOpen={setOpenConfirmationModal} message={`You'll receive a prompt on ${formatMomoNumber()} to confirm your payment. If it delays, dial *170# on MTN or *110# on AIRTELTIGO/TELECEL`} title="Payment Request" confirmationBtnText="OK" handleConfirmation={handleMakePayment} handleOTPModalClose={handleCloseConfirmationModal} />
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
          <Typography variant="h6" sx={{ fontWeight: 600 }}>
            Payment of processing fee
          </Typography>
          <Typography variant="h6" sx={{ fontWeight: 600 }} gutterBottom>You wil be charge an amount of GHC 50.00</Typography>

          <Box
            display={"flex"}
            flexDirection={"column"}
            gap={"15px"}
            width={"100%"}
            mb={2}
          >
            <Box>
              <Typography variant="body2">Parent/Guardian Phone number *</Typography>
              <Typography variant="subtitle1" gutterBottom>
                Login verification code will be sent to this number
              </Typography>
              <PhoneInput
                defaultCountry="GH"
                countries={["GH"]}
                countryCallingCodeEditable={false}
                international
                value={phoneNum}
                onChange={(formattedValue) => handlePhoneNumbersChange(formattedValue)}
              />

              <Typography variant="subtitle2" color="error">
                {errors.parentPhoneNumber?.message}
              </Typography>
            </Box>
            <Box>
              <Typography variant="body2">Mobile Money Number *</Typography>
              <PhoneInput
                defaultCountry="GH"
                countries={["GH"]}
                countryCallingCodeEditable={false}
                international
                value={momoPhoneNum}
                onChange={(formattedValue) => handleMomoNumbersChange(formattedValue)}
              />

              <Typography variant="subtitle2" color="error">
                {errors.parentPhoneNumber?.message}
              </Typography>
            </Box>

            {/* select network */}

            <Box>
              <Typography variant="body2">Select Network</Typography>
              <Select
                fullWidth
                displayEmpty
                input={<CustomizedSelect />}
                renderValue={() => {
                  if (watch("network") === " ") {
                    return <em style={{ color: "#ABB3BF" }}>Select</em>;
                  } else {
                    return <Typography>{(watch("network") || "").toUpperCase()}</Typography>;
                  }
                }}
                {...register("network")}
              >
                <MenuItem value="MTN">MTN</MenuItem>
                <MenuItem value="TELECEL">TELECEL</MenuItem>
                <MenuItem value="AIRTELTIGO">AIRTELTIGO</MenuItem>
              </Select>
              <Typography variant="subtitle2" color="error">
                {errors.network?.message}
              </Typography>
            </Box>

            {/* <Box>
              <Typography variant="body2" gutterBottom>
                Parent/Guardian Email *
              </Typography>
              <TextField
                fullWidth
                variant="standard"
                required
                placeholder="Enter email address"
                inputProps={{
                  style: {
                    border: "2px solid #ABB3BF",
                    padding: "10px",
                    // paddingTop: "17px",
                    borderRadius: "5px",
                  },
                }}
                {...register("parentEmail", {
                  required: true,
                })}
              />
              <Typography variant="subtitle2" color="error">
                {errors.parentEmail?.message}
              </Typography>
            </Box> */}
            <Box>
              <Typography variant="body2" gutterBottom>
                Name
              </Typography>
              <TextField
                fullWidth
                variant="standard"
                required
                disabled
                value={watch("momoName")}
                // placeholder="Enter BECE index number"
                inputProps={{
                  style: {
                    border: "2px solid #ABB3BF",
                    padding: "10px",
                    // paddingTop: "17px",
                    borderRadius: "5px",
                  },
                }}
              // {...register("momoName", {
              //   required: true,
              // })}
              />
              <Typography variant="subtitle2" color="error">
                {errors.momoName?.message}
              </Typography>
            </Box>
            <Box>
              <Typography variant="body2" gutterBottom>
                BECE Index number *
              </Typography>
              <TextField
                fullWidth
                variant="standard"
                required
                disabled
                value={watch("beceIndexNumber")}
                placeholder="Enter BECE index number"
                inputProps={{
                  style: {
                    border: "2px solid #ABB3BF",
                    padding: "10px",
                    // paddingTop: "17px",
                    borderRadius: "5px",
                  },
                }}
              // {...register("beceIndexNumber", {
              //   required: true,
              // })}
              />
              <Typography variant="subtitle2" color="error">
                {errors.beceIndexNumber?.message}
              </Typography>
            </Box>
          </Box>
          <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: "10px" }}>
            <Button
              // sx={{ mb: 2 }}
              variant="outlined"
              // type="submit"
              fullWidth
              onClick={() => {
                reset();
                setStudentDetails(null);
                onPrevious();
              }}
            // disabled={!isDirty || !isValid}
            >
              Go back
            </Button>
            <Button variant="contained" type="submit" disabled={!isDirty || !isValid} fullWidth>
              Make Payment
            </Button>
            {/* <MakePayment handleSuccess={handleSuccess} handleClose={handleClose} disabled={!isDirty || !isValid} paymentDetails={{ name: studentDetails?.firstName, email: watch("parentEmail"), amount: 35, beceIndexNumber: studentDetails?.beceIndexNumber, parentPhoneNumber: watch("parentPhoneNumber") }} /> */}
          </Box>
        </Box>
      </Grid >
    </>
  );
}
