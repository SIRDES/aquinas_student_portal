"use client";
import {
  Box,
  Grid,
  Stack,
  Typography,
  useTheme,
} from "@mui/material";
import Image from "next/image";
import { useRouter } from "next/navigation";

import { useState } from "react";
import LoadingAlert from "../../../components/LoadingAlert";
import { nameOfSchool } from "../../../lib/constants";
import Step1 from "../../../components/signup/Step1";
import Step2 from "../../../components/signup/Step2";

export default function Signup() {
  const theme = useTheme();
  // const router = useRouter();
  const [activeStep, setActiveStep] = useState<number>(0);

  const [loading, setLoading] = useState(false);

  const handleNext = () => {
    setActiveStep((prevStep) => {
      if (prevStep >= stepComponents.length - 1) {
        return prevStep;
      }
      return prevStep + 1;
    });
  };

  const handleBack = () => {
    setActiveStep((prevStep) => {
      if (prevStep <= 0) {
        return prevStep;
      }
      return prevStep - 1;
    });
  };

  const stepComponents = [
    <Step1 onNext={handleNext} key={0} />,
    <Step2 onPrevious={handleBack} key={1} />,
  ];

  const CurrentStep = stepComponents[activeStep];

  return (
    <>
      <LoadingAlert open={loading} />
      <Stack direction={{ xs: "column", md: "row" }} sx={{ minHeight: "100vh" }}>
        <Box

          // height={{ xs: "40vh", md: "auto" }}
          sx={{
            p: { xs: 2, md: 6 },
            backgroundColor: theme.palette.primary.main,
            color: theme.palette.common.white,
            display: "flex",
            flexDirection: "column",
            gap: "10px",
            // justifyContent: "flex-end",
          }}
        >
          <Box
            sx={{
              backgroundColor: "white",
              borderRadius: 0.5,
              pt: 1,
              // mb: 3,
              width: "max-content",
              height: "max-content",
            }}
          >
            <Image
              width={80}
              height={80}
              src={"/images/aquinasLogo.png"}
              alt="Logo image"
            // priority
            // style={{ height: "auto" }}
            />
          </Box>

          <Typography variant="h6">
            {nameOfSchool} <br /> online Admission Portal
          </Typography>
          <Typography variant="body1">
            This is an optional online admission process
          </Typography>
        </Box>
        {CurrentStep}
      </Stack>
    </>
  );
}
