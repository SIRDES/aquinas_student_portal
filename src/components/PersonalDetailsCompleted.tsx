"use client";
import React, { FC, SyntheticEvent, use, useEffect, useState } from "react";

import Box from "@mui/material/Box";
import {
    Typography,
    useTheme,
    Button,
    MenuItem,
    TextField,
    Select,
    Grid,
    Autocomplete,
    AutocompleteChangeReason,
    AutocompleteChangeDetails,
    Divider,
} from "@mui/material";

import { yupResolver } from "@hookform/resolvers/yup";
import { InferType, array, boolean, date, mixed, number, object, string } from "yup";
import "react-phone-number-input/style.css";
import PhoneInput, { formatPhoneNumber, isValidPhoneNumber } from "react-phone-number-input";
import { useForm } from "react-hook-form";
import LoadingAlert from "@/components/LoadingAlert";
import ProgressAlert from "@/components/ProgressAlert";

import { useRouter } from "next/navigation";
import { SnackbarType } from "@/types/commonTypes";

import { CustomizedSelect } from "@/components/CustomizedSelect";

import { useBatchesContext } from "@/context/BatchesContext";

import axios from "axios";
import ImagesDropzone, { FileType } from "@/components/ImageDropZone";
import regionsAndDistricts from "@/utils/regionAndDistricts.json"
import uploadFile, { deleteFile } from "@/utils/services/cloudinaryUpload";
import { useSession } from "next-auth/react";


export default function PersonalDetailsCompleted({ studentData }: { studentData: any }) {

    ;
    return (
        <>
            <Box>
                <Grid container spacing={3} mb={3}>
                    {/* Index number */}
                    <Grid
                        item
                        xs={12}
                        sm={6}
                        md={4}
                        sx={{
                            display: "flex",
                            gap: "5px",
                        }}
                    >
                        <Typography variant="body1">Index Number:</Typography>
                        <Typography variant="body1" fontWeight={700}>
                            {studentData?.beceIndexNumber}
                        </Typography>
                    </Grid>
                    <Grid
                        item
                        xs={12}
                        sm={6}
                        md={4}
                        sx={{
                            display: "flex",
                            gap: "5px",
                        }}
                    >
                        <Typography variant="body1">Name:</Typography>
                        <Typography variant="body1" fontWeight={700}>
                            {studentData?.firstName}
                        </Typography>
                    </Grid>
                    <Grid
                        item
                        xs={12}
                        sm={6}
                        md={4}
                        sx={{
                            display: "flex",
                            gap: "5px",
                        }}
                    >
                        <Typography variant="body1">Gender:</Typography>
                        <Typography variant="body1" fontWeight={700}>
                            {studentData?.gender}
                        </Typography>
                    </Grid>
                    <Grid
                        item
                        xs={12}
                        sm={6}
                        md={4}
                        sx={{
                            display: "flex",
                            gap: "5px",
                        }}
                    >
                        <Typography variant="body1">Programme:</Typography>
                        <Typography variant="body1" fontWeight={700}>
                            {studentData?.admissionProgramme}
                        </Typography>
                    </Grid>
                    <Grid
                        item
                        xs={12}
                        sm={6}
                        md={4}
                        sx={{
                            display: "flex",
                            gap: "5px",
                        }}
                    >
                        <Typography variant="body1">Aggregate:</Typography>
                        <Typography variant="body1" fontWeight={700}>
                            {studentData?.aggregate}
                        </Typography>
                    </Grid>
                    <Grid
                        item
                        xs={12}
                        sm={6}
                        md={4}
                        sx={{
                            display: "flex",
                            gap: "5px",
                        }}
                    >
                        <Typography variant="body1">Date of birth:</Typography>
                        <Typography variant="body1" fontWeight={700}>
                            {new Date(studentData?.dob).toLocaleDateString()}
                        </Typography>
                    </Grid>
                    <Grid
                        item
                        xs={12}
                        sm={6}
                        md={4}
                        sx={{
                            display: "flex",
                            gap: "5px",
                        }}
                    >
                        <Typography variant="body1">Place of birth:</Typography>
                        <Typography variant="body1" fontWeight={700}>
                            {studentData?.placeOfBirth?.toUpperCase()}
                        </Typography>
                    </Grid>
                    <Grid
                        item
                        xs={12}
                        sm={6}
                        md={4}
                        sx={{
                            display: "flex",
                            gap: "5px",
                        }}
                    >
                        <Typography variant="body1">Nationality:</Typography>
                        <Typography variant="body1" fontWeight={700}>
                            {studentData?.nationality?.toUpperCase()}
                        </Typography>
                    </Grid>
                    <Grid
                        item
                        xs={12}
                        sm={6}
                        md={4}
                        sx={{
                            display: "flex",
                            gap: "5px",
                        }}
                    >
                        <Typography variant="body1">Religion:</Typography>
                        <Typography variant="body1" fontWeight={700}>
                            {studentData?.religion?.toUpperCase()}
                        </Typography>
                    </Grid>
                    <Grid
                        item
                        xs={12}
                        sm={6}
                        md={4}
                        sx={{
                            display: "flex",
                            gap: "5px",
                        }}
                    >
                        <Typography variant="body1">Denomination:</Typography>
                        <Typography variant="body1" fontWeight={700}>
                            {studentData?.religiousDenomination?.toUpperCase()}
                        </Typography>
                    </Grid>

                    <Grid
                        item
                        xs={12}
                        sm={6}
                        md={4}
                        sx={{
                            display: "flex",
                            gap: "5px",
                        }}
                    >
                        <Typography variant="body1">Raw score:</Typography>
                        <Typography variant="body1" fontWeight={700}>
                            {studentData?.rawScore}
                        </Typography>
                    </Grid>
                    <Grid
                        item
                        xs={12}
                        sm={6}
                        md={4}
                        sx={{
                            display: "flex",
                            gap: "5px",
                        }}
                    >
                        <Typography variant="body1">Enrolment code:</Typography>
                        <Typography variant="body1" fontWeight={700}>
                            {studentData?.csspsEnrolmentCode}
                        </Typography>
                    </Grid>
                    <Grid
                        item
                        xs={12}
                        sm={6}
                        md={4}
                        sx={{
                            display: "flex",
                            gap: "5px",
                        }}
                    >
                        <Typography variant="body1">JHS attended:</Typography>
                        <Typography variant="body1" fontWeight={700}>
                            {studentData?.jhsAttended?.toUpperCase()}
                        </Typography>
                    </Grid>
                    <Grid
                        item
                        xs={12}
                        sm={6}
                        md={4}
                        sx={{
                            display: "flex",
                            gap: "5px",
                        }}
                    >
                        <Typography variant="body1">JHS type:</Typography>
                        <Typography variant="body1" fontWeight={700}>
                            {studentData?.jhsType?.toUpperCase()}
                        </Typography>
                    </Grid>
                    <Grid
                        item
                        xs={12}
                        sm={6}
                        md={4}
                        sx={{
                            display: "flex",
                            gap: "5px",
                        }}
                    >
                        <Typography variant="body1">Interests:</Typography>
                        <Typography variant="body1" fontWeight={700}>
                            {studentData?.interests?.toUpperCase() || "None"}
                        </Typography>
                    </Grid>
                    <Grid
                        item
                        xs={12}
                        sm={6}
                        md={4}
                        sx={{
                            display: "flex",
                            gap: "5px",
                        }}
                    >
                        <Typography variant="body1">Awards:</Typography>
                        <Typography variant="body1" fontWeight={700}>
                            {studentData?.schoolAwards?.toUpperCase() || "None"}
                        </Typography>
                    </Grid>
                    <Grid
                        item
                        xs={12}
                        sm={6}
                        md={4}
                        sx={{
                            display: "flex",
                            gap: "5px",
                        }}
                    >
                        <Typography variant="body1">Positions held:</Typography>
                        <Typography variant="body1" fontWeight={700}>
                            {studentData?.positionsHeld?.toUpperCase() || "None"}
                        </Typography>
                    </Grid>
                    <Grid
                        item
                        xs={12}
                        sm={6}
                        md={4}
                        sx={{
                            display: "flex",
                            gap: "5px",
                        }}
                    >
                        <Typography variant="body1">Address:</Typography>
                        <Typography variant="body1" fontWeight={700}>
                            {studentData?.permanentAddress?.toUpperCase()}
                        </Typography>
                    </Grid>
                    <Grid
                        item
                        xs={12}
                        sm={6}
                        md={4}
                        sx={{
                            display: "flex",
                            gap: "5px",
                        }}
                    >
                        <Typography variant="body1">Town:</Typography>
                        <Typography variant="body1" fontWeight={700}>
                            {studentData?.town?.toUpperCase()}
                        </Typography>
                    </Grid>
                    <Grid
                        item
                        xs={12}
                        sm={6}
                        md={4}
                        sx={{
                            display: "flex",
                            gap: "5px",
                        }}
                    >
                        <Typography variant="body1">Town:</Typography>
                        <Typography variant="body1" fontWeight={700}>
                            {studentData?.town?.toUpperCase()}
                        </Typography>
                    </Grid>
                    <Grid
                        item
                        xs={12}
                        sm={6}
                        md={4}
                        sx={{
                            display: "flex",
                            gap: "5px",
                        }}
                    >
                        <Typography variant="body1">Region:</Typography>
                        <Typography variant="body1" fontWeight={700}>
                            {studentData?.region?.toUpperCase()}
                        </Typography>
                    </Grid>
                    <Grid
                        item
                        xs={12}
                        sm={6}
                        md={4}
                        sx={{
                            display: "flex",
                            gap: "5px",
                        }}
                    >
                        <Typography variant="body1">District:</Typography>
                        <Typography variant="body1" fontWeight={700}>
                            {studentData?.district?.toUpperCase()}
                        </Typography>
                    </Grid>
                    <Grid
                        item
                        xs={12}
                        sm={6}
                        md={4}
                        sx={{
                            display: "flex",
                            gap: "5px",
                        }}
                    >
                        <Typography variant="body1">Father's first name:</Typography>
                        <Typography variant="body1" fontWeight={700}>
                            {studentData?.fatherFirstName?.toUpperCase()}
                        </Typography>
                    </Grid>
                    <Grid
                        item
                        xs={12}
                        sm={6}
                        md={4}
                        sx={{
                            display: "flex",
                            gap: "5px",
                        }}
                    >
                        <Typography variant="body1">Father's last name:</Typography>
                        <Typography variant="body1" fontWeight={700}>
                            {studentData?.fatherLastName?.toUpperCase()}
                        </Typography>
                    </Grid>
                    <Grid
                        item
                        xs={12}
                        sm={6}
                        md={4}
                        sx={{
                            display: "flex",
                            gap: "5px",
                        }}
                    >
                        <Typography variant="body1">Father's occupation:</Typography>
                        <Typography variant="body1" fontWeight={700}>
                            {studentData?.fatherOccupation?.toUpperCase()}
                        </Typography>
                    </Grid>
                    <Grid
                        item
                        xs={12}
                        sm={6}
                        md={4}
                        sx={{
                            display: "flex",
                            gap: "5px",
                        }}
                    >
                        <Typography variant="body1">Mother's first name:</Typography>
                        <Typography variant="body1" fontWeight={700}>
                            {studentData?.motherFirstName?.toUpperCase()}
                        </Typography>
                    </Grid>
                    <Grid
                        item
                        xs={12}
                        sm={6}
                        md={4}
                        sx={{
                            display: "flex",
                            gap: "5px",
                        }}
                    >
                        <Typography variant="body1">Mother's last name:</Typography>
                        <Typography variant="body1" fontWeight={700}>
                            {studentData?.motherLastName?.toUpperCase()}
                        </Typography>
                    </Grid>
                    <Grid
                        item
                        xs={12}
                        sm={6}
                        md={4}
                        sx={{
                            display: "flex",
                            gap: "5px",
                        }}
                    >
                        <Typography variant="body1">Mother's occupation:</Typography>
                        <Typography variant="body1" fontWeight={700}>
                            {studentData?.motherOccupation?.toUpperCase()}
                        </Typography>
                    </Grid>
                    <Grid
                        item
                        xs={12}
                        sm={6}
                        md={4}
                        sx={{
                            display: "flex",
                            gap: "5px",
                        }}
                    >
                        <Typography variant="body1">Guardian first name:</Typography>
                        <Typography variant="body1" fontWeight={700}>
                            {studentData?.parentFirstName?.toUpperCase()}
                        </Typography>
                    </Grid>
                    <Grid
                        item
                        xs={12}
                        sm={6}
                        md={4}
                        sx={{
                            display: "flex",
                            gap: "5px",
                        }}
                    >
                        <Typography variant="body1">Guardian last name:</Typography>
                        <Typography variant="body1" fontWeight={700}>
                            {studentData?.parentLastName?.toUpperCase()}
                        </Typography>
                    </Grid>
                    <Grid
                        item
                        xs={12}
                        sm={6}
                        md={4}
                        sx={{
                            display: "flex",
                            gap: "5px",
                        }}
                    >
                        <Typography variant="body1">Guardian email:</Typography>
                        <Typography variant="body1" fontWeight={700}>
                            {studentData?.parentEmail?.toLowerCase()}
                        </Typography>
                    </Grid>
                    <Grid
                        item
                        xs={12}
                        sm={6}
                        md={4}
                        sx={{
                            display: "flex",
                            gap: "5px",
                        }}
                    >
                        <Typography variant="body1">Guardian phone number:</Typography>
                        <Typography variant="body1" fontWeight={700}>
                            {formatPhoneNumber(studentData?.parentPhoneNumber)}
                        </Typography>
                    </Grid>
                    <Grid
                        item
                        xs={12}
                        sm={6}
                        md={4}
                        sx={{
                            display: "flex",
                            gap: "5px",
                        }}
                    >
                        <Typography variant="body1">Guardian Alt. phone number:</Typography>
                        <Typography variant="body1" fontWeight={700}>
                            {formatPhoneNumber(studentData?.parentAltPhoneNumber) || "N/A"}
                        </Typography>
                    </Grid>
                </Grid>
            </Box>
        </>
    );
}

