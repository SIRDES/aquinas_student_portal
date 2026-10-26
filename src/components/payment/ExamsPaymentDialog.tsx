import Button from "@mui/material/Button";
import { Dispatch, SetStateAction, useEffect, useState } from "react";

import IconButton from "@mui/material/IconButton";
import useMediaQuery from "@mui/material/useMediaQuery";

import CloseIcon from "@mui/icons-material/Close";
import {
  Backdrop,
  Box,
  Divider,
  FormControl,
  FormHelperText,
  Grid,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  TextField,
  Typography,
  useTheme,
} from "@mui/material";
import { useForm } from "react-hook-form";
import PhoneInput, { isValidPhoneNumber } from "react-phone-number-input";
import { showAlert } from "../Alerts";
import { getAccountName } from "@/utils/services/makePayment";

type PaymentFormData = {
  momoNumber: string;
  momoNetwork: string;
  momoName: string;
};
export default function ExamsPaymentDialog({
  open,
  handleClose,
  handleMakePayment,
}: {
  open: boolean;
  handleMakePayment: (e: PaymentFormData) => void;
  handleClose: () => void;
}) {
  const theme = useTheme();

  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const [momoPhoneNum, setMomoPhoneNum] = useState("");
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<PaymentFormData>();
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

  const handlePayment = (data: PaymentFormData) => {
    // console.log(data);
    handleMakePayment(data);
  }
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

  return (
    <Backdrop
      aria-labelledby="payment-dialog"
      open={open}
      sx={{ zIndex: (theme) => theme.zIndex.drawer + 1 }}
    >
      <Box
        component={Paper}
        sx={{ minHeight: "25vh", width: isMobile ? "90vw" : "35vw" }}
      >
        <Box
          display={"flex"}
          justifyContent={"space-between"}
          alignItems={"center"}
          sx={{ px: isMobile ? 1 : 2 }}
        >
          <Typography fontWeight={700}>Payment Form</Typography>
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
        <Box
          component="form"
          onSubmit={handleSubmit(handlePayment)}
          // sx={{ mt: 3 }}
          sx={{
            p: isMobile ? 1 : 2,
            // mt: 3
          }}
        >
          <Grid container spacing={2}>
            <Grid item xs={12}>

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
                handleClose();
                // setValue("exam", "");
              }}
            >
              Close
            </Button>
            <Button
              type="submit"
              variant="contained"
              color="primary"
              disabled={isLoading}
            >
              {isLoading ? "Loading..." : "Make Payment"}
            </Button>
          </Box>
        </Box>
      </Box>
    </Backdrop>
  );
}
