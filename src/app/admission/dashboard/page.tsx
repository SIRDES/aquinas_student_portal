"use client";
import { Button, Card, Grid, Typography } from "@mui/material";
import { Box, useTheme } from "@mui/system";
import { styled } from "@mui/material/styles";
import { useEffect, useState } from "react";
import { SnackbarType } from "@/types/commonTypes";
import LoadingAlert from "@/components/LoadingAlert";
import ProgressAlert from "@/components/ProgressAlert";
import Link from "next/link";
import { getPlacedStudentById } from "@/utils/serverActions/placedStudent";
import { useSession } from "next-auth/react";
import { useAdminSettings } from "@/hooks/useAdminSettings";
import DownloadIcon from '@mui/icons-material/Download';
import { pdf, PDFViewer } from "@react-pdf/renderer";
import StudentPersonalRecordForm from "@/components/StudentPersonalRecordForm";
import StudentAdmissionLetter from "@/components/StudentAdmissionLetter";
import { saveAs } from "file-saver";
import ParentalCommitmentForm from "@/components/ParentalConsentForm";
import { showAlert } from "@/components/Alerts";
import WhatsAppIcon from '@mui/icons-material/WhatsApp';

export default function Dashboard() {
    const theme = useTheme();
    const { adminSettings } = useAdminSettings();
    const { data: session, status: sessionStatus } = useSession();
    const [studentData, setStudentData] = useState<any>(null);
    const [studentName, setStudentName] = useState<string | null>(null);

    const [loading, setLoading] = useState(false);
    const [loadingWithoutBlank, setLoadingWithoutBlank] = useState(false);
    const fetchStudentsData = async () => {
        setLoading(true);
        setStudentData(null);
        try {
            const res = await getPlacedStudentById(session?.user?._id || "");
            if (!res.success) {
                showAlert({
                    title: "Error",
                    severity: "error",
                    text: res?.message || "An error occurred, please try again"
                })
                return
            }

            setStudentData(res?.data);
        } catch (error: any) {

            showAlert({
                title: "Error",
                severity: "error",
                text: error.message || "An error occurred"
            })
        } finally {
            setLoading(false);
        }
    };
    useEffect(() => {
        if (!session?.user?._id) return;
        fetchStudentsData();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [session?.user?._id]);

    useEffect(() => {
        if (studentData) {
            setStudentName(`${studentData?.firstName ? studentData?.firstName?.toUpperCase() : ""}_${studentData?.lastName ? studentData?.lastName?.toUpperCase() : ""}`);
        }
    }, [studentData]);
    const handleSaveStudentPersonalRecordForm = async () => {
        setLoadingWithoutBlank(true);
        const blob = await pdf(<StudentPersonalRecordForm data={studentData} />).toBlob();
        setLoadingWithoutBlank(false);
        saveAs(blob, `${studentName}_data_form.pdf`);
    };
    const handleSaveAdmissionLetter = async () => {
        setLoadingWithoutBlank(true);
        const blob = await pdf(<StudentAdmissionLetter data={{ ...studentData, adminSettings }} />).toBlob();
        saveAs(blob, `${studentData.firstName}_${studentData.lastName}_admission_letter.pdf`);
        setLoadingWithoutBlank(false);
    };


    const handleSaveParentalConsentForm = async () => {
        setLoadingWithoutBlank(true);
        const blob = await pdf(<ParentalCommitmentForm data={{ ...studentData, adminSettings }} />).toBlob();
        setLoadingWithoutBlank(false);
        saveAs(blob, `${studentName}_parental_consent.pdf`);
    };

    if (sessionStatus === "loading" || loading) return <LoadingAlert open={true} />
    return (
        <>
            <LoadingAlert open={loadingWithoutBlank} />
            {/* <ProgressAlert
                open={snackbar.open}
                message={snackbar.message}
                severity={snackbar.severity}
                setOpen={setSnackbar}
            /> */}
            <Box mb={1} mt={2} px={{ xs: 1, sm: 2, md: 3 }}>
                <Grid container spacing={2} mb={2}>
                    <Grid item xs={12} sm={12} md={12}>
                        <Typography
                            variant="h5"
                            gutterBottom
                            sx={{
                                // fontSize: "20px",
                                color: theme.palette.primary.main,
                                fontWeight: 700,
                                lineHeight: "23px",
                            }}
                        >
                            Congratulations on your admission to St. Thomas Aquinas SHS.
                        </Typography>
                        {studentData?.status?.toLowerCase() === "started" && (
                            <>
                                <Typography
                                    variant="body1"
                                    gutterBottom
                                    sx={{
                                        // fontSize: "20px",
                                        color: theme.palette.primary.main,
                                        fontWeight: 700,
                                        lineHeight: "23px",
                                    }}
                                >
                                    Start your admission process by completing your personal records form.
                                </Typography>
                                {/* <Typography
                                    variant="body1"
                                    gutterBottom
                                    sx={{
                                        // fontSize: "20px",
                                        color: "error.main",
                                        fontWeight: 700,
                                        lineHeight: "23px",
                                    }}
                                >
                                    Please Note: You will be required to upload the following documents:
                                </Typography> */}
                                {/* <Typography
                                    variant="body1"
                                    gutterBottom
                                    sx={{
                                        // fontSize: "20px",
                                        // color: "success.main",
                                        fontWeight: 700,
                                        lineHeight: "23px",
                                    }}
                                >
                                    1. A copy of your ENROLMENT FORM from CSSPS
                                </Typography> */}
                                {/* <Typography
                                    variant="body1"
                                    gutterBottom
                                    sx={{
                                        fontWeight: 700,
                                        lineHeight: "23px",
                                    }}
                                >
                                    2. A passport size photograph
                                </Typography> */}
                                {/* <Button variant="contained" color="primary" sx={{ mt: 2 }} LinkComponent={Link} href="/admission/personal-details">
                                    Complete Personal Records Form
                                </Button> */}
                            </>
                        )}
                    </Grid>

                </Grid>
                <Grid container spacing={2}>

                    <Grid
                        item
                        xs={12}
                    >
                        <Typography
                            variant="h6"
                            gutterBottom
                            align="center"
                            sx={{
                                // fontSize: "20px",
                                color: theme.palette.primary.main,
                                fontWeight: 700,
                                lineHeight: "23px",
                            }}
                        >
                            Your placement details ({adminSettings?.admissionDetails?.name})
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
                    <Grid
                        item
                        xs={12}
                        sm={6}
                        md={4}
                        sx={{ display: "flex", gap: "10px" }}
                    >
                        <Typography variant="body1">Index number:</Typography>
                        <Typography variant="body1" fontWeight={700}>
                            {studentData?.beceIndexNumber}                        </Typography>
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
                    {/* Programme */}
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
                        <Typography variant="body1">Programme</Typography>
                        <Typography variant="body1" fontWeight={700}>
                            {studentData?.admissionProgramme?.toUpperCase()}
                        </Typography>
                    </Grid>
                    {/* Aggregate */}
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

                        <Typography variant="body1">Aggregate of best six:</Typography>
                        <Typography variant="body1" fontWeight={700}>
                            {studentData?.aggregate}
                        </Typography>
                    </Grid>
                </Grid>
                {studentData?.status?.toLowerCase() === "started" && (
                    <Button variant="contained" color="primary" sx={{ mt: 2 }} LinkComponent={Link} href="/admission/personal-details">
                        Complete Personal Records Form
                    </Button>
                )}
                {studentData?.status?.toLowerCase() === "completed" && (
                    <Box mt={2}>
                        <Typography
                            variant="body1"
                            gutterBottom
                            sx={{
                                color: theme.palette.primary.main,
                                fontWeight: 700,
                            }}
                        >
                            NOTICE
                        </Typography>
                        <Typography
                            variant="body1"
                            gutterBottom
                            sx={{
                                color: theme.palette.primary.main,
                                fontWeight: 700,
                            }}
                        >
                            Reporting Date: {new Date(adminSettings?.admissionDetails?.reportingDate).toDateString()}
                        </Typography>
                        {/* join parent whataspp */}
                        <Link href="https://chat.whatsapp.com/JOINCODE12345"
                            target="_blank"
                            rel="noopener noreferrer" style={{ alignItems: "center", display: "flex", gap: "5px", marginBottom: "10px" }}>
                            <WhatsAppIcon sx={{ color: "green" }} />
                            Join our parents' WhatsApp Group

                        </Link>
                        <Typography
                            variant="body1"
                            gutterBottom
                            sx={{
                                color: theme.palette.primary.main,
                            }}
                        >
                            You are required to come along with the following:
                        </Typography>
                        <Box>
                            <Typography variant="body1" gutterBottom>
                                1. Admission letter (download below)
                            </Typography>
                            <Typography variant="body1" gutterBottom>
                                2. Signed student data form (download below)
                            </Typography>
                            <Typography variant="body1" gutterBottom>
                                3. Signed parental consent form (download below)
                            </Typography>
                            <Typography variant="body1" gutterBottom>
                                4. Placement form from CSSPS
                            </Typography>
                            <Typography variant="body1" gutterBottom>
                                5. Enrolment form from CSSPS
                            </Typography>
                            <Typography variant="body1" gutterBottom>
                                6.. Prospectus items
                            </Typography>

                        </Box>
                        <Typography
                            variant="body1"
                            gutterBottom
                            sx={{
                                color: theme.palette.primary.main,
                            }}
                        >
                            Documents to be downloaded
                        </Typography>
                        <Box>
                            <Button variant="contained" startIcon={<DownloadIcon />} color="primary" sx={{ mb: 2 }} onClick={handleSaveAdmissionLetter}>
                                Admission Letter
                            </Button>
                            <br />
                            <Button variant="contained" startIcon={<DownloadIcon />} color="primary" sx={{ mb: 2 }} onClick={handleSaveStudentPersonalRecordForm}>
                                Personal record Form
                            </Button> <br />
                            <Button variant="contained" startIcon={<DownloadIcon />} color="primary" sx={{ mb: 2 }} onClick={handleSaveParentalConsentForm}>
                                Parental Consent Form
                            </Button>
                            {/* <br />
                            <Button variant="contained" startIcon={<DownloadIcon />} color="primary" sx={{ mb: 2 }}>
                                Prospectus
                            </Button> */}
                        </Box>
                    </Box>
                )}
                {/* {studentData && <PDFViewer style={{ width: "100%", height: "100vh" }}> */}
                {/* <StudentAdmissionLetter data={{ ...studentData, adminSettings }} />
                    <ParentalCommitmentForm data={{ ...studentData, adminSettings }} /> */}
                {/* <StudentPersonalRecordForm data={studentData} /> */}
                {/* </PDFViewer>} */}

            </Box>
        </>
    );
}