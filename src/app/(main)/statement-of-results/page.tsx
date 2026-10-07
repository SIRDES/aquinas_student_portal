"use client";
import React, { useEffect, useMemo, useState } from "react";
import Box from "@mui/material/Box";
import {
    Typography,
    Button,
    MenuItem,
    Select,
    Grid,
    Divider,
    IconButton,
    InputLabel,
    SelectChangeEvent,
    FormControl,
} from "@mui/material";

import LoadingAlert from "@/components/LoadingAlert";

import { useSession } from "next-auth/react";

import { showAlert } from "@/components/Alerts";

import { getBatchByYearGroup } from "@/utils/serverActions/fridayTestBatch";
import { checkPaymentMadeForStudent } from "@/utils/serverActions/paymentTransaction";
import { getStudentResultsWithPaymentId } from "@/utils/serverActions/student";

import StudentReportCard from "@/components/StudentReportCard";
import { pdf } from "@react-pdf/renderer";

import { saveAs } from "file-saver";
import PDFFileViewer from "@/components/PdfViewer";

export default function StatementOfResults() {
    const { data: session, status } = useSession();
    const [loading, setLoading] = useState(false);
    const studentData = session?.user;
    const [fetchedExams, setFetchedExams] = useState<any[]>([]);
    const [showPaymentForm, setShowPaymentForm] = useState<boolean>(false);
    const [selectedExamData, setSelectedExamData] = useState<any>(null);
    const [studentResultsData, setStudentResultsData] = useState<any>(null);
    const [reportFile, setReportFile] = useState<Blob | null>(null);

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
    const handleFetchStudentExams = async () => {
        setLoading(true);
        try {

            const examsResponse = await getBatchByYearGroup(studentData?.yearGroup || "");
            if (!examsResponse.success) {
                showAlert({
                    title: "Error",
                    severity: "error",
                    text: examsResponse.message || "An error occurred",
                });
                return;
            }
            const exams = examsResponse.data;
            setFetchedExams(exams);
        } catch (error) {
            //   console.error("Error fetching student data:", error);
        } finally {
            setLoading(false);
        }
    };
    useEffect(() => {
        handleFetchStudentExams();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [studentData?.yearGroup]);

    const checkPaymentStatus = async () => {
        try {

            if (!selectedExamData?._id) {
                showAlert({
                    title: "Error",
                    severity: "error",
                    text: "Please select an exam",
                });
                return;
            }
            setLoading(true);
            setStudentResultsData(null);



            const response = await checkPaymentMadeForStudent({
                studentId: studentData?._id as string,
                batchId: selectedExamData?._id,
            });
            if (response.success) {
                const data = response.data;
                console.log("payment result data", data)
                // setPaymentData(data);
                await handleFetchData(data._id);

            } else {
                // setPaymentData(null);
                showAlert({
                    title: "Payment Required",
                    severity: "warning",
                    text: `You need to make payment of GHS ${selectedExamData?.isSemester ? "10.00" : "5.00"
                        } to view this exam results.`,
                    //   showCancelButton: true,
                    //   cancelButtonText: "Close",
                    showCloseButton: true,
                    confirmButtonText: "Make Payment",
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
            setLoading(false);
        }
    };

    const handleExamSelect = (e: SelectChangeEvent) => {
        const examId = e.target.value as string;
        // setValue("exam", examId);
        setSelectedExamData(fetchedExams.find((exam) => exam._id === examId));
    };
    const handleFetchData = async (token: string) => {
        try {
            if (!token) {
                showAlert({
                    title: "Error",
                    severity: "error",
                    text: `No token provided. Please try again.`,
                });
                return;
            }
            const response = await getStudentResultsWithPaymentId({
                transaction_id: token,
            });

            if (!response.success) {
                showAlert({
                    title: "Error",
                    severity: "error",
                    text: response.message,
                });
                return;
            }
            setStudentResultsData(response.data);
        } catch (error) {
            showAlert({
                title: "Error",
                severity: "error",
                text: "An error occurred, please try again.",
            });
        }
    };



    useMemo(() => {
        if (!studentResultsData) return null;
        const generateReport = async () => {
            try {
                const blob = await pdf(<StudentReportCard data={studentResultsData} />).toBlob();
                setReportFile(blob);
                // if (!cancelled) {
                //     setReportFile(blob);
                // }
            } catch (error) {
                console.error("Error generating report:", error);
            }
        };
        generateReport();
        return null;
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [studentResultsData]);


    const handleSaveAsWithPrint = async () => {
        const studentName = `${studentData?.firstName?.toUpperCase()} ${studentData?.lastName?.toUpperCase()}`;
        const blob = await pdf(<StudentReportCard data={studentResultsData} />).toBlob();
        saveAs(blob, `${studentName?.trim()} report.pdf`);
    };
    return (
        <>
            <LoadingAlert open={loading} />
            <Box sx={{ pt: 1, px: { xs: 1, sm: 1, md: 4 } }}>
                <Typography variant="h6" gutterBottom>
                    Statement of results
                </Typography>
                <Divider />

                <Grid container spacing={2} alignItems="center" sx={{ my: 2 }}>
                    <Grid item xs={12} sm={8} md={6}>
                        <FormControl fullWidth size="small">
                            <InputLabel id="exam-label">Select Exam</InputLabel>
                            <Select
                                labelId="exam-label"
                                id="exam"
                                label="Select Exam"
                                // size="small"
                                value={selectedExamData?._id || ""}
                                onChange={handleExamSelect}
                            >
                                <MenuItem value="" >
                                    <em>Select exam</em>
                                </MenuItem>
                                {fetchedExams.map((exam) => (
                                    <MenuItem key={exam._id} value={exam._id}>
                                        {exam.name}
                                    </MenuItem>
                                ))}
                            </Select>
                        </FormControl>
                    </Grid>

                    <Grid item xs={12} sm="auto">
                        <Button
                            type="button"
                            onClick={checkPaymentStatus}
                            variant="contained"
                            color="primary"
                            disabled={loading || !selectedExamData}
                            sx={{
                                // height: "56px",
                                px: 4,
                                width: { xs: "100%", sm: "auto" },
                            }}
                        >
                            {loading ? "Loading..." : "Submit"}
                        </Button>
                    </Grid>
                </Grid>

                <Divider />
                {studentResultsData && (
                    <Box
                        sx={{
                            width: { xs: "100%", md: "60%" },
                            margin: "auto",
                        }}
                    >
                        <Button
                            variant="contained"
                            onClick={handleSaveAsWithPrint}
                            size="small"
                            sx={{ my: 2 }}
                        >
                            click here to download
                        </Button>
                    </Box>
                )}

                {studentResultsData && (
                    <Box
                        sx={{
                            width: { xs: "100%", md: "60%" },
                            margin: "auto",
                            marginBottom: "20px",
                            overflow: "scroll",
                        }}
                    >
                        <PDFFileViewer file={reportFile} />
                    </Box>
                )}

            </Box >
        </>
    );
}

