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
    Paper,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Accordion,
    AccordionSummary,
    AccordionDetails,
    Chip,
    Stack,
} from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";

import LoadingAlert from "@/components/LoadingAlert";

import { useSession } from "next-auth/react";

import { showAlert } from "@/components/Alerts";

import { getBatchByYearGroup } from "@/utils/serverActions/fridayTestBatch";
import { checkPaymentMadeForStudent } from "@/utils/serverActions/paymentTransaction";
import { getStudentResultsWithPaymentId } from "@/utils/serverActions/student";
import { styled } from "@mui/material/styles";
import { tableCellClasses } from "@mui/material/TableCell";
import StudentReportCard from "@/components/StudentReportCard";
import { pdf } from "@react-pdf/renderer";

import { saveAs } from "file-saver";
import PDFFileViewer from "@/components/PdfViewer";
import ExamsPaymentDialog from "@/components/payment/ExamsPaymentDialog";
import ConfirmationPaymentDialog from "@/components/payment/ConfirmationPaymentDialog";

const StyledTableCell = styled(TableCell)(({ theme }) => ({
    padding: "4px",
    lineHeight: 1.3,
    [`&.${tableCellClasses.head}`]: {
        backgroundColor: theme.palette.primary.main,
        color: theme.palette.common.white,
        fontSize: 14,

    },
    [`&.${tableCellClasses.body}`]: {
        fontSize: 14,
    },
}));

const StyledTableRow = styled(TableRow)(({ theme }) => ({
    "&:nth-of-type(odd)": {
        backgroundColor: theme.palette.action.hover,
    },
    // hide last border
    "&:last-child td, &:last-child th": {
        border: 0,
    },
    // "&:hover": {
    //   cursor: "pointer",
    // },
}));
export default function StatementOfResults() {
    const { data: session, status } = useSession();
    const [loading, setLoading] = useState(false);
    const studentData = session?.user;
    const [fetchedExams, setFetchedExams] = useState<any[]>([]);
    const [showPaymentForm, setShowPaymentForm] = useState<boolean>(false);
    const [openConfirmationPaymentDialog, setOpenConfirmationPaymentDialog] = useState<boolean>(false);
    const [selectedExamData, setSelectedExamData] = useState<any>(null);
    const [studentResultsData, setStudentResultsData] = useState<any>(null);
    const [reportFile, setReportFile] = useState<Blob | null>(null);
    const [momoDetails, setMomoDetails] = useState<{
        momoNumber: string;
        momoNetwork: string;
        momoName: string;
    } | null>(null);

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
                // console.log("payment result data", data)
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
            const data = response.data;
            // console.log("student result data", data);
            setStudentResultsData(response.data);
        } catch (error) {
            showAlert({
                title: "Error",
                severity: "error",
                text: "An error occurred, please try again.",
            });
        }
    };



    // useMemo(() => {
    //     if (!studentResultsData) return null;
    //     const generateReport = async () => {
    //         try {
    //             const blob = await pdf(<StudentReportCard data={studentResultsData} />).toBlob();
    //             setReportFile(blob);
    //             // if (!cancelled) {
    //             //     setReportFile(blob);
    //             // }
    //         } catch (error) {
    //             console.error("Error generating report:", error);
    //         }
    //     };
    //     generateReport();
    //     return null;
    //     // eslint-disable-next-line react-hooks/exhaustive-deps
    // }, [studentResultsData]);

    const handleOpenConfirmMakePayment = async (data: {
        momoNumber: string;
        momoNetwork: string;
        momoName: string;
    }) => {
        // console.log(data);
        setMomoDetails(data)
        setShowPaymentForm(false)
        setOpenConfirmationPaymentDialog(true)
    };
    return (
        <>
            <LoadingAlert open={loading} />
            <ExamsPaymentDialog open={showPaymentForm} handleClose={() => setShowPaymentForm(false)} handleMakePayment={(data) => handleOpenConfirmMakePayment(data)} />

            <ConfirmationPaymentDialog open={openConfirmationPaymentDialog} onClose={() => setOpenConfirmationPaymentDialog(false)} handleConfirmation={() => { }} ConfirmPaymentData={{
                studentNumber: studentData?.studentId || "",
                studentName: `${studentData?.firstName} ${studentData?.lastName}`?.toUpperCase()?.trim() || "",
                className: `${studentData?.classInfo?.form} ${studentData?.classInfo?.name}`?.toUpperCase()?.trim() || "",
                examName: selectedExamData?.name?.toUpperCase()?.trim() || "",
                momoNumber: momoDetails?.momoNumber || "",
                momoNetwork: momoDetails?.momoNetwork || "",
                momoName: momoDetails?.momoName || "",
                studentId: studentData?._id || "",
                examId: selectedExamData?._id || "",
                isSemester: selectedExamData?.isSemester || false,
            }} />

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
                    <Box mt={2} mb={4}>
                        {/* Desktop Table View (md and up) */}
                        <TableContainer
                            component={Paper}
                            sx={{
                                display: { xs: "none", md: "block" },
                                maxHeight: "calc(100vh - 200px)",
                                overflow: "auto",
                            }}
                        >
                            <Table
                                stickyHeader
                                sx={{
                                    minWidth: 650,
                                }}
                                aria-label="students table"
                            >
                                <TableHead>
                                    <TableRow>
                                        <StyledTableCell>Subject</StyledTableCell>
                                        {(studentResultsData?.batchInfo?.isSemester === true && studentResultsData?.batchInfo?.isNewCurriculum) && (
                                            <>
                                                <StyledTableCell align="center">Individual Class Assessment (15%)</StyledTableCell>
                                                <StyledTableCell align="center">Mid-Sem (15%)</StyledTableCell>
                                                <StyledTableCell align="center">Practical or Portfolio (10%)</StyledTableCell>
                                                <StyledTableCell align="center">Individual Projects, Research, or Case Studies (20%)</StyledTableCell>
                                            </>
                                        )}
                                        {studentResultsData?.batchInfo?.isSemester === true ? (
                                            <>
                                                <StyledTableCell align="center">{studentResultsData?.batchInfo?.isNewCurriculum ? "Class Score (60%)" : "Class Score"}</StyledTableCell>
                                                <StyledTableCell align="center">{studentResultsData?.batchInfo?.isNewCurriculum ? "Exam Score (40%)" : "Exam Score"}</StyledTableCell>
                                                <StyledTableCell align="center">{studentResultsData?.batchInfo?.isNewCurriculum ? "Total Score (100%)" : "Total Score"}</StyledTableCell>
                                            </>
                                        ) : (
                                            <StyledTableCell align="center">Marks</StyledTableCell>
                                        )}
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {studentResultsData?.testScores?.length > 0 &&
                                        studentResultsData?.testScores
                                            .map((testScore: any, index: number) => (
                                                <StyledTableRow
                                                    key={testScore?._id}

                                                // sx={{ cursor: "pointer" }}
                                                >

                                                    <StyledTableCell>
                                                        {testScore?.subjectDetails?.name?.toUpperCase()}
                                                    </StyledTableCell>

                                                    {(studentResultsData?.batchInfo?.isSemester === true && studentResultsData?.batchInfo?.isNewCurriculum) && (
                                                        <>
                                                            <StyledTableCell align="center">{testScore?.individualClassScore || 0}</StyledTableCell>
                                                            <StyledTableCell align="center">{testScore?.midSemScore || 0}</StyledTableCell>
                                                            <StyledTableCell align="center">{testScore?.practicalScore || 0}</StyledTableCell>
                                                            <StyledTableCell align="center">{testScore?.groupWorkScore || 0}</StyledTableCell>
                                                        </>
                                                    )}
                                                    {studentResultsData?.batchInfo?.isSemester === true && (
                                                        <StyledTableCell align="center">

                                                            {testScore?.classScore}
                                                        </StyledTableCell>
                                                    )}
                                                    <StyledTableCell align="center">
                                                        {testScore?.marks}

                                                    </StyledTableCell>
                                                    {studentResultsData?.batchInfo?.isSemester === true && (
                                                        <StyledTableCell align="center">
                                                            <Typography variant="body1" display="block" sx={{ lineHeight: 1.5, fontSize: "12px", fontWeight: "normal" }}>
                                                                {testScore?.totalScore}
                                                            </Typography>
                                                            <Typography variant="body1" display="block" sx={{ lineHeight: 1, fontSize: "12px", fontWeight: "normal" }}>
                                                                {testScore?.grade}
                                                            </Typography>
                                                        </StyledTableCell>
                                                    )}

                                                </StyledTableRow>
                                            ))}
                                </TableBody>
                            </Table>
                        </TableContainer>

                        {/* Mobile Cards / Accordion View (sm and down) */}
                        <Box sx={{
                            display: { xs: "flex", md: "none" }, flexDirection: "column", gap: 1.5
                        }}>
                            {studentResultsData?.testScores?.length > 0 &&
                                studentResultsData?.testScores.map((testScore: any, index: number) => {
                                    const isSemester = studentResultsData?.batchInfo?.isSemester === true;
                                    const isNewCurriculum = isSemester && Boolean(studentResultsData?.batchInfo?.isNewCurriculum);

                                    return (
                                        <Accordion
                                            key={testScore?._id || index}
                                            variant="outlined"
                                            disableGutters
                                            sx={{
                                                borderRadius: "8px !important",
                                                "&:before": { display: "none" },
                                                boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
                                                overflow: "hidden",
                                                borderColor: "divider",


                                            }}
                                        >
                                            <AccordionSummary
                                                expandIcon={<ExpandMoreIcon />}
                                                aria-controls={`score-content-${index}`}
                                                id={`score-header-${index}`}
                                                sx={{
                                                    bgcolor: (theme) =>
                                                        theme.palette.mode === "light"
                                                            ? theme.palette.grey[50]
                                                            : theme.palette.grey[900],
                                                    "& .MuiAccordionSummary-content": {
                                                        my: 1,
                                                        display: "block",
                                                    },
                                                }}
                                            >
                                                <Box sx={{ width: "100%", pr: 1 }}>
                                                    <Box
                                                        sx={{
                                                            display: "flex",
                                                            justifyContent: "space-between",
                                                            alignItems: "center",
                                                            flexWrap: "wrap",
                                                            gap: 1,
                                                        }}
                                                    >
                                                        <Typography
                                                            variant="subtitle2"
                                                            sx={{
                                                                fontWeight: 700,
                                                                fontSize: "0.95rem",
                                                                color: "primary.main",
                                                            }}
                                                        >
                                                            {testScore?.subjectDetails?.name?.toUpperCase()}
                                                        </Typography>

                                                        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                                                            {isSemester ? (
                                                                <>
                                                                    {testScore?.grade && (
                                                                        <Chip
                                                                            label={`Grade: ${testScore?.grade}`}
                                                                            size="small"
                                                                            color="primary"
                                                                            sx={{ fontWeight: 600, fontSize: "0.75rem" }}
                                                                        />
                                                                    )}
                                                                    {testScore?.totalScore !== undefined && testScore?.totalScore !== null && (
                                                                        <Chip
                                                                            label={`Total: ${testScore?.totalScore}`}
                                                                            size="small"
                                                                            variant="outlined"
                                                                            color="primary"
                                                                            sx={{ fontWeight: 600, fontSize: "0.75rem" }}
                                                                        />
                                                                    )}
                                                                </>
                                                            ) : (
                                                                testScore?.marks !== undefined && (
                                                                    <Chip
                                                                        label={`Marks: ${testScore?.marks}`}
                                                                        size="small"
                                                                        color="primary"
                                                                        sx={{ fontWeight: 600, fontSize: "0.75rem" }}
                                                                    />
                                                                )
                                                            )}
                                                        </Box>
                                                    </Box>

                                                    {isSemester && (
                                                        <Box sx={{ display: "flex", gap: 2, mt: 0.75, flexWrap: "wrap" }}>
                                                            <Typography variant="caption" color="text.secondary">
                                                                {isNewCurriculum ? "Class Score (60%)" : "Class Score"}:{" "}
                                                                <Box component="span" sx={{ fontWeight: 600, color: "text.primary" }}>
                                                                    {testScore?.classScore ?? "-"}
                                                                </Box>
                                                            </Typography>
                                                            <Typography variant="caption" color="text.secondary">
                                                                {isNewCurriculum ? "Exam (40%)" : "Exam"}:{" "}
                                                                <Box component="span" sx={{ fontWeight: 600, color: "text.primary" }}>
                                                                    {testScore?.marks ?? "-"}
                                                                </Box>
                                                            </Typography>
                                                        </Box>
                                                    )}
                                                </Box>
                                            </AccordionSummary>

                                            <AccordionDetails sx={{ p: 2, borderTop: "1px solid", borderColor: "divider" }}>
                                                {isNewCurriculum && (
                                                    <Box mb={2}>
                                                        <Typography
                                                            variant="caption"
                                                            color="text.secondary"
                                                            sx={{
                                                                fontWeight: 600,
                                                                textTransform: "uppercase",
                                                                letterSpacing: 0.5,
                                                                display: "block",
                                                                mb: 1,
                                                            }}
                                                        >
                                                            Assessment Breakdown
                                                        </Typography>
                                                        <Grid container spacing={1}>
                                                            <Grid item xs={6}>
                                                                <Box sx={{ p: 1, borderRadius: 1, bgcolor: "action.hover" }}>
                                                                    <Typography variant="caption" color="text.secondary" display="block">
                                                                        Individual Class (15%)
                                                                    </Typography>
                                                                    <Typography variant="body2" fontWeight={600}>
                                                                        {testScore?.individualClassScore || 0}
                                                                    </Typography>
                                                                </Box>
                                                            </Grid>
                                                            <Grid item xs={6}>
                                                                <Box sx={{ p: 1, borderRadius: 1, bgcolor: "action.hover" }}>
                                                                    <Typography variant="caption" color="text.secondary" display="block">
                                                                        Mid-Sem (15%)
                                                                    </Typography>
                                                                    <Typography variant="body2" fontWeight={600}>
                                                                        {testScore?.midSemScore || 0}
                                                                    </Typography>
                                                                </Box>
                                                            </Grid>
                                                            <Grid item xs={6}>
                                                                <Box sx={{ p: 1, borderRadius: 1, bgcolor: "action.hover" }}>
                                                                    <Typography variant="caption" color="text.secondary" display="block">
                                                                        Practical / Portfolio (10%)
                                                                    </Typography>
                                                                    <Typography variant="body2" fontWeight={600}>
                                                                        {testScore?.practicalScore || 0}
                                                                    </Typography>
                                                                </Box>
                                                            </Grid>
                                                            <Grid item xs={6}>
                                                                <Box sx={{ p: 1, borderRadius: 1, bgcolor: "action.hover" }}>
                                                                    <Typography variant="caption" color="text.secondary" display="block">
                                                                        Projects / Research (20%)
                                                                    </Typography>
                                                                    <Typography variant="body2" fontWeight={600}>
                                                                        {testScore?.groupWorkScore || 0}
                                                                    </Typography>
                                                                </Box>
                                                            </Grid>
                                                        </Grid>
                                                        <Divider sx={{ my: 1.5 }} />
                                                    </Box>
                                                )}

                                                {isSemester ? (
                                                    <Stack spacing={1}>
                                                        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                                                            <Typography variant="body2" color="text.secondary">
                                                                {isNewCurriculum ? "Class Score (60%)" : "Class Score"}
                                                            </Typography>
                                                            <Typography variant="body2" fontWeight={600}>
                                                                {testScore?.classScore ?? "-"}
                                                            </Typography>
                                                        </Box>
                                                        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                                                            <Typography variant="body2" color="text.secondary">
                                                                {isNewCurriculum ? "Exam Score (40%)" : "Exam Score"}
                                                            </Typography>
                                                            <Typography variant="body2" fontWeight={600}>
                                                                {testScore?.marks ?? "-"}
                                                            </Typography>
                                                        </Box>
                                                        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                                                            <Typography variant="body2" color="text.secondary">
                                                                {isNewCurriculum ? "Total Score (100%)" : "Total Score"}
                                                            </Typography>
                                                            <Typography variant="body2" fontWeight={700} color="primary.main">
                                                                {testScore?.totalScore ?? "-"}
                                                            </Typography>
                                                        </Box>
                                                        {testScore?.grade && (
                                                            <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                                                                <Typography variant="body2" color="text.secondary">
                                                                    Grade
                                                                </Typography>
                                                                <Typography variant="body2" fontWeight={700}>
                                                                    {testScore?.grade}
                                                                </Typography>
                                                            </Box>
                                                        )}
                                                    </Stack>
                                                ) : (
                                                    <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                                                        <Typography variant="body2" color="text.secondary">
                                                            Marks
                                                        </Typography>
                                                        <Typography variant="body1" fontWeight={700} color="primary.main">
                                                            {testScore?.marks ?? "-"}
                                                        </Typography>
                                                    </Box>
                                                )}
                                            </AccordionDetails>
                                        </Accordion>
                                    );
                                })}
                        </Box>

                    </Box>
                )}

            </Box >
        </>
    );
}

