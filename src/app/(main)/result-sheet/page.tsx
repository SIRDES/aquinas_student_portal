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
                    Result Sheet
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

