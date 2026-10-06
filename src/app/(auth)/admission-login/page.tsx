"use client";
import React, { useState } from "react";
import { yupResolver } from "@hookform/resolvers/yup";
import {
  Box,
  Button,
  Card,
  IconButton,
  InputAdornment,
  TextField,
  Typography,
  useTheme,
} from "@mui/material";
import * as Yup from "yup";
import { useForm } from "react-hook-form";
import { useRouter } from "next/navigation";
import { signIn, useSession } from "next-auth/react";
import LoadingAlert from "../../../components/LoadingAlert";
import { showAlert } from "../../../components/Alerts";
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import VisibilityIcon from '@mui/icons-material/Visibility';
const schema = Yup.object().shape({
  email: Yup.string().required("Bece index number is required"),
  password: Yup.string().required("Admission code is required"),
});
export interface FormData extends Yup.InferType<typeof schema> { }

export default function Login() {
  const theme = useTheme();
  const router = useRouter();
  const session = useSession();

  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const form = useForm({
    resolver: yupResolver(schema),
    mode: "all",
  });

  const {
    register,
    handleSubmit,
    formState: { errors, isDirty, isValid },
    // control,
  } = form;

  const handleClickShowPassword = () => {
    setShowPassword(!showPassword);
  };

  // const handleShowAlert = () => {
  //   showAlert({
  //     title: "Success",
  //     severity: "success",
  //     text: "Your details updated successfully",
  //     handleConfirmButtonClick: () => {
  //       router.push("/signup")
  //     },
  //     allowOutsideClick: false
  //   })
  // }

  const Submit = async (dat: FormData) => {
    try {
      setLoading(true);
      const res = await signIn("credentials", {
        beceIndexNumber: dat.email,
        admissionCode: dat.password,
        callbackUrl: "/admission/dashboard",
        redirect: false,
      });
      if (res?.error === null) {
        router.push("/admission/dashboard");
      } else {
        showAlert({
          title: "Error",
          severity: "error",
          text: res?.error || "An error occurred",
        })
      }
    } catch (error: any) {

      showAlert({
        title: "Error",
        severity: "error",
        text: error.error || error.message || "An error occurred",
      })
    } finally {
      setLoading(false);
    }
  };


  if (session?.status === "loading") {
    return <LoadingAlert open={true} />;
  }
  if (session?.status === "authenticated") {
    // if (session?.data?.user?.role === "admin") {
    //   router.push("/dashboard");
    //   return;
    // }
    router.push("/admission/dashboard");
    return;
  }
  return (
    <>
      <LoadingAlert open={loading} />
      <Box
        height={"100vh"}
        sx={{
          px: { xs: 2, sm: 2, md: 3 },
          backgroundImage: `
    linear-gradient(rgba(0,0,0,0.5), rgba(0,0,0,0.5)),
    url(/images/Saint_Thomas_Aquinas_SHS-entrance_e.jpg)
  `,
          backgroundRepeat: 'no-repeat',
          backgroundPosition: 'center center',
          backgroundSize: 'cover',
          // backgroundColor: (theme) => theme.palette.background.default,
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
        }}
      >
        {/* <Typography variant="h5" textAlign={"center"} onClick={handleShowAlert} gutterBottom>
          handleShowAlert
        </Typography> */}
        {/* <Typography variant="h5" textAlign={"center"} gutterBottom>
          AQUINAS PORTAL
        </Typography> */}
        <Box sx={{ mx: "auto", width: { xs: "100%", sm: "80%", md: "40%" } }}>
          <Card
            component={"form"}
            onSubmit={handleSubmit(Submit)}
            noValidate
            sx={{
              display: "flex",
              flexDirection: "column",
              width: "100%",
              // justifyContent: "center",
              // alignItems: "center",
              borderRadius: "10px",
              boxShadow: "0px 4px 30px 0px #00000012",
              gap: "15px",
              color: theme.palette.text.primary,
              p: { xs: 2, sm: 4 },
            }}
          >
            <Box>
              <Typography
                variant="h5"
                textAlign={"center"}
                color={theme.palette.primary.main}
                sx={{ fontWeight: 700 }}
                gutterBottom
              >
                AQUINAS PORTAL
              </Typography>
              {/* <Typography
                variant="h5"
                textAlign={"center"}
                sx={{ fontWeight: 700 }}
                gutterBottom
              >
                Sign In
              </Typography> */}
              <Typography color={theme.palette.text.disabled} align="center">
                If you've not verified your placement in this school,{" "} <br />
                <span
                  style={{
                    color: "red",
                    cursor: "pointer",
                    textDecoration: "underline",
                  }}
                  onClick={() => router.push("/signup")}
                >
                  CLICK HERE
                </span>
              </Typography>
            </Box>
            {/* Email */}
            <Box>
              <Typography gutterBottom>Bece index number</Typography>
              <TextField
                fullWidth
                type="text"
                variant="standard"
                placeholder="Enter your BECE index number"

                inputProps={{

                  // autoFocus: true,
                  style: {
                    border: "2px solid #ABB3BF",
                    padding: "6px",
                    paddingTop: "7px",
                    borderRadius: "5px",
                  },
                }}
                {...register("email", { required: true })}
              />
              <Typography variant="subtitle2" color="error">
                {errors.email?.message}
              </Typography>
            </Box>
            {/* Password */}
            <Box>
              <Typography gutterBottom>Admission code</Typography>
              <TextField
                fullWidth
                variant="standard"
                // type="password"
                type={showPassword ? "text" : "password"}
                placeholder="Enter your admission code"

                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        aria-label="toggle password visibility"
                        onClick={handleClickShowPassword}
                      // onMouseDown={handleMouseDownPassword}
                      >
                        {showPassword ? <VisibilityIcon /> : <VisibilityOffIcon />}
                      </IconButton>
                    </InputAdornment>
                  ),
                  style: {
                    border: "2px solid #ABB3BF",
                    padding: "6px",
                    paddingTop: "7px",
                    borderRadius: "5px",
                  },
                }}
                {...register("password", { required: true })}
              />
              <Typography variant="subtitle2" color="error">
                {errors.password?.message}
              </Typography>
            </Box>

            <Box>
              <Button
                variant="contained"
                type="submit"
                fullWidth
                disabled={!isDirty || !isValid}
                sx={{ mb: 2, padding: "7px" }}
              >
                Login
              </Button>

            </Box>
          </Card>
        </Box >
      </Box >
    </>
  );
}
