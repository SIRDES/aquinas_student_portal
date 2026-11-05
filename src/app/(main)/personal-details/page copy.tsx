"use client";
import React, { FC, SyntheticEvent, useEffect, useState } from "react";

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
    IconButton,
    Chip,
} from "@mui/material";

import { yupResolver } from "@hookform/resolvers/yup";
import { InferType, date, number, object, string } from "yup";
// import "react-phone-number-input/style.css";
import PhoneInput, { formatPhoneNumber, isValidPhoneNumber } from "react-phone-number-input";
import { useForm } from "react-hook-form";
import LoadingAlert from "@/components/LoadingAlert";
import { useRouter } from "next/navigation";
import { SnackbarType } from "@/types/commonTypes";

import { CustomizedSelect } from "@/components/CustomizedSelect";

import { useBatchesContext } from "@/context/BatchesContext";
import { DemoContainer } from '@mui/x-date-pickers/internals/demo';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import axios from "axios";
import ImagesDropzone, { FileType } from "@/components/ImageDropZone";
import regionsAndDistricts from "@/utils/regionAndDistricts.json"
import uploadFile, { deleteFile } from "@/utils/services/cloudinaryUpload";
import { useSession } from "next-auth/react";
import { getPlacedStudentById, updatePlacedStudent } from "@/utils/serverActions/placedStudent";
import PersonalDetailsCompleted from "@/components/PersonalDetailsCompleted";
import EditIcon from '@mui/icons-material/Edit';
import { showAlert } from "@/components/Alerts";
import Image from "next/image";
import dayjs, { Dayjs } from "dayjs";
import { PickerValue } from "@mui/x-date-pickers/internals";



export default function PersonalDetails() {
    const { data: session, status } = useSession();
    const [loading, setLoading] = useState(false);
    const studentData = session?.user;

    //     _id: '685a8b01636aea0e5a6608d8',
    //         parentEmail: '',
    //             firstName: 'KOFI YEBOAH ANNOH JENASMAN',
    //                 lastName: '',
    //                     yearGroup: '2027',
    //                         yearOfAdmission: '2024',
    //                             parentPhoneNumber: '+233559989761',
    //                                 parentFirstName: '',
    //                                     parentLastName: '',
    //                                         dob: null,
    //                                             gender: 'male',
    //                                                 subjects: [
    //                                                     '685441de72cf3cd5e517c2ce',
    //                                                     '685441de72cf3cd5e517c2cf',
    //                                                     '685441de72cf3cd5e517c2d0',
    //                                                     '685a7d410ea9f65999c2ebaa',
    //                                                     '685a7d5f0ea9f65999c2ebab',
    //                                                     '685441de72cf3cd5e517c2d1',
    //                                                     '685441de72cf3cd5e517c2d7',
    //                                                     '685441de72cf3cd5e517c2d8',
    //                                                     '685441de72cf3cd5e517c2dc',
    //                                                     '685441de72cf3cd5e517c2e0'
    //                                                 ],
    //                                                     ssId: 'BUS/25/003',
    //                                                         classId: '67a8c2fdd75474ab03baffb2',
    //                                                             studentId: 'BUS/132/2024',
    //                                                                 deviceToken: null,
    //                                                                     pushNotificationAllowed: true,
    //                                                                         isDeleted: false,
    //                                                                             isSuspended: false,
    //                                                                                 createdAt: '2025-06-24T11:24:49.088Z',
    //                                                                                     updatedAt: '2026-10-07T00:01:47.496Z',
    //                                                                                         __v: 0,
    //                                                                                             cassRefID: '2400101050A6',
    //                                                                                                 classInfo: {
    //         _id: '67a8c2fdd75474ab03baffb2',
    //             name: 'Bus 4',
    //                 form: '3',
    //                     programme: '67a8848a49c2639dfb49c4e1',
    //                         isNewCurriculum: false,
    //                             isDeleted: false,
    //                                 isSuspended: false,
    //                                     __v: 0,
    //                                         createdAt: '2025-02-09T15:00:13.369Z',
    //                                             updatedAt: '2025-02-09T15:00:13.369Z',
    //                                                 programmeInfo: {
    //             _id: '67a8848a49c2639dfb49c4e1',
    //                 name: 'Business',
    //                     isNewCurriculum: false,
    //                         isDeleted: false,
    //                             isSuspended: false,
    //                                 __v: 0,
    //                                     createdAt: '2025-02-09T10:33:46.191Z',
    //                                         updatedAt: '2025-02-09T10:33:46.191Z'
    //         }
    //     },
    //     subjectInfo: [
    //         {
    //             _id: '685441de72cf3cd5e517c2ce',
    //             name: 'ENGLISH LANGUAGE',
    //             type: 'core',
    //             isNewCurriculum: true,
    //             isDeleted: false,
    //             isSuspended: false,
    //             __v: 0,
    //             createdAt: '2025-06-19T16:59:10.499Z',
    //             updatedAt: '2026-05-19T16:01:55.206Z',
    //             shortName: 'ENG'
    //         },
    //         {
    //             _id: '685441de72cf3cd5e517c2cf',
    //             name: 'MATHEMATICS',
    //             type: 'core',
    //             isNewCurriculum: true,
    //             isDeleted: false,
    //             isSuspended: false,
    //             __v: 0,
    //             createdAt: '2025-06-19T16:59:10.500Z',
    //             updatedAt: '2026-05-19T16:01:55.206Z',
    //             shortName: 'MATHS'
    //         },
    //         {
    //             _id: '685441de72cf3cd5e517c2d0',
    //             name: 'SOCIAL STUDIES',
    //             type: 'core',
    //             isNewCurriculum: true,
    //             isDeleted: false,
    //             isSuspended: false,
    //             __v: 0,
    //             createdAt: '2025-06-19T16:59:10.500Z',
    //             updatedAt: '2026-05-19T16:01:55.206Z',
    //             shortName: 'SOCIAL'
    //         },
    //         {
    //             _id: '685441de72cf3cd5e517c2d1',
    //             name: 'GENERAL SCIENCE',
    //             type: 'elective',
    //             isNewCurriculum: true,
    //             isDeleted: false,
    //             isSuspended: false,
    //             __v: 0,
    //             createdAt: '2025-06-19T16:59:10.500Z',
    //             updatedAt: '2026-05-19T16:01:55.206Z',
    //             shortName: 'GEN SCI'
    //         },
    //         {
    //             _id: '685441de72cf3cd5e517c2d7',
    //             name: 'BUSINESS MANAGEMENT',
    //             type: 'elective',
    //             isNewCurriculum: true,
    //             isDeleted: false,
    //             isSuspended: false,
    //             __v: 0,
    //             createdAt: '2025-06-19T16:59:10.501Z',
    //             updatedAt: '2026-05-19T16:01:55.206Z',
    //             shortName: 'BUS MGT'
    //         },
    //         {
    //             _id: '685441de72cf3cd5e517c2d8',
    //             name: 'ACCOUNTING',
    //             type: 'elective',
    //             isNewCurriculum: true,
    //             isDeleted: false,
    //             isSuspended: false,
    //             __v: 0,
    //             createdAt: '2025-06-19T16:59:10.501Z',
    //             updatedAt: '2026-05-19T16:01:55.206Z',
    //             shortName: 'ACC'
    //         },
    //         {
    //             _id: '685441de72cf3cd5e517c2dc',
    //             name: 'ECONOMICS',
    //             type: 'elective',
    //             isNewCurriculum: true,
    //             isDeleted: false,
    //             isSuspended: false,
    //             __v: 0,
    //             createdAt: '2025-06-19T16:59:10.501Z',
    //             updatedAt: '2026-05-19T16:01:55.206Z',
    //             shortName: 'ECONS'
    //         },
    //         {
    //             _id: '685441de72cf3cd5e517c2e0',
    //             name: 'INFO. & COMM. TECH(ICT)',
    //             type: 'elective',
    //             isNewCurriculum: true,
    //             isDeleted: false,
    //             isSuspended: false,
    //             __v: 0,
    //             createdAt: '2025-06-19T16:59:10.502Z',
    //             updatedAt: '2026-05-19T16:01:55.206Z',
    //             shortName: 'ICT'
    //         },
    //         {
    //             _id: '685a7d410ea9f65999c2ebaa',
    //             name: 'REL. & MORAL EDU',
    //             type: 'core',
    //             isNewCurriculum: true,
    //             isDeleted: false,
    //             isSuspended: false,
    //             __v: 0,
    //             createdAt: '2025-06-19T16:59:10.500Z',
    //             updatedAt: '2026-05-19T16:01:55.206Z',
    //             isNoneScoring: true,
    //             shortName: 'RME'
    //         },
    //         {
    //             _id: '685a7d5f0ea9f65999c2ebab',
    //             name: 'PHYSICAL EDUCATION (CORE)',
    //             type: 'core',
    //             isNewCurriculum: true,
    //             isDeleted: false,
    //             isSuspended: false,
    //             __v: 0,
    //             createdAt: '2025-06-19T16:59:10.500Z',
    //             updatedAt: '2026-05-19T16:01:55.206Z',
    //             isNoneScoring: true,
    //             shortName: 'PE'
    //         }
    //     ],
    //         iat: 1791333553,
    //             exp: 1793925553,
    //                 jti: '774a2ba8-0dc2-4dbc-8b06-177e31534e6c'
    // }


    if (loading) return <LoadingAlert open={true} />;
    return (
        <>
            <LoadingAlert open={loading} />
            <Box sx={{ pt: 1, px: { xs: 1, sm: 1, md: 4 } }}>
                <Typography variant="h6" gutterBottom>
                    Personal Details
                </Typography>
                <Divider />

                <Grid container spacing={2} mt={1}>
                    {/* student id */}
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
                        <Typography variant="body1">ID:</Typography>
                        <Typography variant="body1" fontWeight={700}>
                            {studentData?.studentId?.toUpperCase()}
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
                        <Typography variant="body1">CassRefID:</Typography>
                        <Typography variant="body1" fontWeight={700}>
                            {studentData?.cassRefID}
                        </Typography>
                    </Grid>

                    {/* student name */}
                    <Grid
                        item
                        xs={12}
                        sm={6}
                        md={4}
                        sx={{ display: "flex", gap: "10px" }}
                    >
                        <Typography variant="body1">Name:</Typography>
                        <Typography variant="body1" fontWeight={700}>
                            {studentData?.firstName?.toUpperCase()}{" "}
                            {studentData?.lastName?.toUpperCase()}
                        </Typography>
                    </Grid>

                    {/* Gender */}
                    <Grid
                        item
                        xs={12}
                        sm={6}
                        md={4}
                        sx={{ display: "flex", gap: "10px" }}
                    >
                        <Typography variant="body1">Gender:</Typography>
                        <Typography variant="body1" fontWeight={700}>
                            {studentData?.gender?.toUpperCase()}
                        </Typography>
                    </Grid>
                    {/* On scholarship */}
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
                        <Typography variant="body1">Class</Typography>
                        <Typography variant="body1" fontWeight={700}>
                            {`${studentData?.classInfo?.form} ${studentData?.classInfo?.name}`?.toUpperCase()}
                        </Typography>
                    </Grid>

                    {/* Programme */}
                    <Grid
                        item
                        xs={12}
                        sm={6}
                        md={4}
                        sx={{ display: "flex", gap: "10px" }}
                    >
                        <Typography variant="body1">Programme:</Typography>
                        <Typography variant="body1" fontWeight={700}>
                            {studentData?.classInfo?.programmeInfo?.name?.toUpperCase()}
                        </Typography>
                    </Grid>

                    {/* Amount Paid */}
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
                        <Typography variant="body1">Year of admission:</Typography>
                        <Typography variant="body1" fontWeight={700}>
                            {studentData?.yearOfAdmission}
                        </Typography>
                    </Grid>


                    <Grid item xs={12}>
                        <Typography variant="body1" fontWeight={700}>
                            Parent/Guardian Details
                        </Typography>
                    </Grid>
                    {/* parent's name */}
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
                            {studentData?.parentFirstName?.toUpperCase()}{" "}
                            {studentData?.parentLastName?.toUpperCase()}
                        </Typography>
                    </Grid>

                    {/* Email */}
                    <Grid
                        item
                        xs={12}
                        sm={6}
                        md={4}
                        sx={{ display: "flex", gap: "10px" }}
                    >
                        <Typography variant="body1">Email:</Typography>
                        <Typography variant="body1" fontWeight={700}>
                            {studentData?.parentEmail?.toLowerCase()}
                        </Typography>
                    </Grid>
                    {/* phone number */}
                    <Grid
                        item
                        xs={12}
                        sm={6}
                        md={4}
                        sx={{ display: "flex", gap: "10px" }}
                    >
                        <Typography variant="body1">Phone number:</Typography>
                        <Typography variant="body1" fontWeight={700}>
                            {formatPhoneNumber(
                                studentData?.parentPhoneNumber || "",
                            )}
                        </Typography>
                    </Grid>
                </Grid>
                <Grid item xs={12}>
                    <Typography variant="body1" fontWeight={700}>
                        Subjects
                    </Typography>
                </Grid>
                {/* subjects */}
                <Grid
                    item
                    xs={12}
                    sm={12}
                    md={12}
                >
                    <Box sx={{ display: "flex", flexWrap: "wrap", gap: "10px", mt: 1 }}>
                        {studentData?.subjectInfo && studentData.subjectInfo.length > 0 ? (
                            studentData.subjectInfo.map((subject: any) => (
                                <Chip
                                    key={subject?._id || subject?.name}
                                    // icon={<BookIcon sx={{ fontSize: "0.9rem !important" }} />}
                                    label={subject?.name?.toUpperCase()}
                                    variant="outlined"
                                    size="small"
                                    sx={{
                                        borderRadius: "16px",
                                        // fontWeight: 600,
                                        // fontSize: "0.75rem",
                                        px: 0.5,
                                        py: 1.5,
                                        // color: "primary.main",
                                        borderColor: "primary.light",
                                        // backgroundColor: "rgba(44, 120, 115, 0.04)",
                                        // transition: "all 0.2s ease",
                                    }}
                                />
                            ))
                        ) : (
                            <Typography variant="body2" sx={{ color: "text.secondary", fontStyle: "italic" }}>
                                No subjects assigned
                            </Typography>
                        )}
                    </Box>
                </Grid>

            </Box >
        </>
    );
}

