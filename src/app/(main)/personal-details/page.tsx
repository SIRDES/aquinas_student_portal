"use client";
import React, { useState } from "react";

import Box from "@mui/material/Box";
import {
    Typography,
    Button,
    TextField,
    Grid,
    Divider,
    Chip,
    Paper,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    CircularProgress,
} from "@mui/material";

import { formatPhoneNumberIntl } from "react-phone-number-input";
import LoadingAlert from "@/components/LoadingAlert";
import { signOut, useSession } from "next-auth/react";
import { updateStudentParentDetails } from "@/utils/serverActions/student";
import EditIcon from '@mui/icons-material/Edit';
import { showAlert } from "@/components/Alerts";
import Image from "next/image";



export default function PersonalDetails() {
    const { data: session, status, update } = useSession();
    const [loading, setLoading] = useState(false);
    const studentData = session?.user;

    const [isEditOpen, setIsEditOpen] = useState(false);
    const [parentFirstName, setParentFirstName] = useState("");
    const [parentLastName, setParentLastName] = useState("");
    const [parentEmail, setParentEmail] = useState("");
    const [saving, setSaving] = useState(false);

    const handleOpenEdit = () => {
        setParentFirstName(studentData?.parentFirstName || "");
        setParentLastName(studentData?.parentLastName || "");
        setParentEmail(studentData?.parentEmail || "");
        setIsEditOpen(true);
    };

    const handleCloseEdit = () => {
        if (!saving) {
            setIsEditOpen(false);
        }
    };

    const handleSave = async (e?: React.FormEvent) => {
        if (e) e.preventDefault();
        if (!studentData?._id) return;

        if (parentEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(parentEmail)) {
            showAlert({
                title: "Invalid Email",
                text: "Please enter a valid email address.",
                severity: "warning",
            });
            return;
        }

        try {
            setSaving(true);
            const res = await updateStudentParentDetails({
                id: studentData._id,
                parentFirstName,
                parentLastName,
                parentEmail,
            });

            if (res.success) {
                // Update session state
                if (update) {
                    await update({
                        ...session,
                        user: {
                            ...studentData,
                            parentFirstName: parentFirstName.trim(),
                            parentLastName: parentLastName.trim(),
                            parentEmail: parentEmail.trim().toLowerCase(),
                        },
                    });
                }
                setIsEditOpen(false);
                showAlert({
                    title: "Success",
                    text: "Parent details updated successfully. Logout and login to see the changes.",
                    severity: "success",
                    confirmButtonText: "Logout",
                    handleConfirmButtonClick: () => {
                        signOut({ redirect: false });
                    },
                });
            } else {
                showAlert({
                    title: "Error",
                    text: res.message || "Failed to update parent details.",
                    severity: "error",
                });
            }
        } catch (err: any) {
            showAlert({
                title: "Error",
                text: err?.message || "An unexpected error occurred.",
                severity: "error",
            });
        } finally {
            setSaving(false);
        }
    };


    if (loading) return <LoadingAlert open={true} />;
    return (
        <>
            <LoadingAlert open={loading} />
            <Box sx={{ pt: 1, px: { xs: 1, sm: 1, md: 4 } }}>
                <Typography variant="h6" gutterBottom>
                    Personal Details
                </Typography>
                <Divider />

                <Paper
                    elevation={0}
                    sx={{
                        p: { xs: 2, sm: 3 },
                        mb: 3,
                        borderRadius: "12px",
                        border: "1px solid #e2e8f0",
                        backgroundColor: "#ffffff",
                        boxShadow: "0 1px 3px 0 rgba(0, 0, 0, 0.05)",
                    }}
                >
                    <Grid container spacing={3} alignItems="flex-start">
                        {/* Profile Image & Quick Identity */}
                        <Grid item xs={12} sm={4} md={3} lg={2.5}>
                            <Box
                                sx={{
                                    display: "flex",
                                    flexDirection: "column",
                                    alignItems: "center",
                                    textAlign: "center",
                                    p: 1,
                                    borderRadius: "10px",
                                    backgroundColor: "#f8fafc",
                                    border: "1px solid #e2e8f0",
                                }}
                            >
                                <Box
                                    sx={{
                                        position: "relative",
                                        width: { xs: 120, sm: 140, md: 150 },
                                        height: { xs: 120, sm: 140, md: 150 },
                                        mb: 1.5,
                                    }}
                                >
                                    <Box
                                        sx={{
                                            width: "100%",
                                            height: "100%",
                                            borderRadius: "12px",
                                            overflow: "hidden",
                                            boxShadow: "0 4px 10px rgba(0,0,0,0.08)",
                                            border: "3px solid #ffffff",
                                            position: "relative",
                                        }}
                                    >
                                        <Image
                                            src={studentData?.profileImage || "/images/default-avatar.svg"}
                                            alt={`${studentData?.firstName || "Student"} ${studentData?.lastName || ""}`}
                                            fill
                                            sizes="(max-width: 600px) 120px, 150px"
                                            style={{ objectFit: "cover" }}
                                            priority
                                        />
                                    </Box>

                                </Box>



                                <Typography variant="subtitle1" fontWeight={700} sx={{ lineHeight: 1.3, mb: 0.5 }}>
                                    {studentData?.firstName?.toUpperCase()?.trim()} {studentData?.lastName?.toUpperCase()?.trim()}
                                </Typography>
                                <Chip
                                    label={`${studentData?.classInfo?.form || ""} ${studentData?.classInfo?.name || ""}`.trim().toUpperCase() || "STUDENT"}
                                    size="small"
                                    color="primary"
                                    sx={{ fontWeight: 600, fontSize: "0.75rem", mb: 0.5 }}
                                />
                            </Box>
                        </Grid>

                        {/* Detailed Student & Academic Info + Parent Info */}
                        <Grid item xs={12} sm={8} md={9} lg={9.5}>
                            {/* Student Details section */}
                            <Box mb={2.5}>
                                <Typography
                                    variant="subtitle2"
                                    sx={{
                                        fontWeight: 700,
                                        textTransform: "uppercase",
                                        letterSpacing: "0.5px",
                                        color: "primary.main",
                                        mb: 1.5,
                                    }}
                                >
                                    Academic & Personal Information
                                </Typography>
                                <Grid container spacing={2}>
                                    <Grid item xs={12} sm={6} md={4}>
                                        <Typography variant="caption" color="text.secondary" display="block">Student ID</Typography>
                                        <Typography variant="body2" fontWeight={700}>{studentData?.studentId?.toUpperCase() || "N/A"}</Typography>
                                    </Grid>
                                    <Grid item xs={12} sm={6} md={4}>
                                        <Typography variant="caption" color="text.secondary" display="block">CASS Reference ID</Typography>
                                        <Typography variant="body2" fontWeight={700}>{studentData?.cassRefID || "N/A"}</Typography>
                                    </Grid>
                                    <Grid item xs={12} sm={6} md={4}>
                                        <Typography variant="caption" color="text.secondary" display="block">Gender</Typography>
                                        <Typography variant="body2" fontWeight={700}>{studentData?.gender?.toUpperCase() || "N/A"}</Typography>
                                    </Grid>
                                    <Grid item xs={12} sm={6} md={4}>
                                        <Typography variant="caption" color="text.secondary" display="block">Class</Typography>
                                        <Typography variant="body2" fontWeight={700}>{`${studentData?.classInfo?.form || ""} ${studentData?.classInfo?.name || ""}`.trim().toUpperCase() || "N/A"}</Typography>
                                    </Grid>
                                    <Grid item xs={12} sm={6} md={4}>
                                        <Typography variant="caption" color="text.secondary" display="block">Programme</Typography>
                                        <Typography variant="body2" fontWeight={700}>{studentData?.classInfo?.programmeInfo?.name?.toUpperCase() || "N/A"}</Typography>
                                    </Grid>
                                    <Grid item xs={12} sm={6} md={4}>
                                        <Typography variant="caption" color="text.secondary" display="block">Year of Admission</Typography>
                                        <Typography variant="body2" fontWeight={700}>{studentData?.yearOfAdmission || "N/A"}</Typography>
                                    </Grid>
                                </Grid>
                            </Box>

                            <Divider sx={{ my: 2 }} />

                            {/* Parent/Guardian Details */}
                            <Box>
                                <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: 1.5 }}>
                                    <Typography
                                        variant="subtitle2"
                                        sx={{
                                            fontWeight: 700,
                                            textTransform: "uppercase",
                                            letterSpacing: "0.5px",
                                            color: "primary.main",
                                        }}
                                    >
                                        Parent / Guardian Details
                                    </Typography>
                                    <Button
                                        size="small"
                                        variant="outlined"
                                        startIcon={<EditIcon sx={{ fontSize: "16px !important" }} />}
                                        onClick={handleOpenEdit}
                                        sx={{
                                            textTransform: "none",
                                            fontWeight: 600,
                                            fontSize: "0.75rem",
                                            py: 0.25,
                                            px: 1.2,
                                            borderRadius: "6px",
                                        }}
                                    >
                                        Edit
                                    </Button>
                                </Box>
                                <Grid container spacing={2}>
                                    <Grid item xs={12} sm={6} md={4}>
                                        <Typography variant="caption" color="text.secondary" display="block">Parent Name</Typography>
                                        <Typography variant="body2" fontWeight={700}>
                                            {studentData?.parentFirstName || studentData?.parentLastName
                                                ? `${studentData?.parentFirstName || ""} ${studentData?.parentLastName || ""}`.trim().toUpperCase()
                                                : "N/A"}
                                        </Typography>
                                    </Grid>
                                    <Grid item xs={12} sm={6} md={4}>
                                        <Typography variant="caption" color="text.secondary" display="block">Email</Typography>
                                        <Typography variant="body2" fontWeight={700}>{studentData?.parentEmail?.toLowerCase() || "N/A"}</Typography>
                                    </Grid>
                                    <Grid item xs={12} sm={6} md={4}>
                                        <Typography variant="caption" color="text.secondary" display="block">Phone Number</Typography>
                                        <Typography variant="body2" fontWeight={700}>
                                            {studentData?.parentPhoneNumber
                                                ? formatPhoneNumberIntl(studentData.parentPhoneNumber)
                                                : "N/A"}
                                        </Typography>
                                    </Grid>
                                </Grid>
                            </Box>
                        </Grid>
                    </Grid>

                    {/* Subjects Section */}
                    <Divider sx={{ my: 2.5 }} />
                    <Box>
                        <Typography
                            variant="subtitle2"
                            sx={{
                                fontWeight: 700,
                                textTransform: "uppercase",
                                letterSpacing: "0.5px",
                                color: "primary.main",
                                mb: 1,
                            }}
                        >
                            Enrolled Subjects
                        </Typography>
                        <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1, mt: 1 }}>
                            {studentData?.subjectInfo && studentData.subjectInfo.length > 0 ? (
                                studentData.subjectInfo.map((subject: any) => (
                                    <Chip
                                        key={subject?._id || subject?.name}
                                        label={subject?.name?.toUpperCase()}
                                        variant="outlined"
                                        size="small"
                                        sx={{
                                            borderRadius: "16px",
                                            borderColor: "primary.light",
                                            px: 0.5,
                                            py: 1.5,
                                        }}
                                    />
                                ))
                            ) : (
                                <Typography variant="body2" sx={{ color: "text.secondary", fontStyle: "italic" }}>
                                    No subjects assigned
                                </Typography>
                            )}
                        </Box>
                    </Box>
                </Paper>

                {/* Edit Parent Details Dialog */}
                <Dialog
                    open={isEditOpen}
                    onClose={handleCloseEdit}
                    maxWidth="xs"
                    fullWidth
                    PaperProps={{
                        sx: { borderRadius: "12px", p: 1 }
                    }}
                >
                    <DialogTitle sx={{ fontWeight: 700, pb: 1 }}>
                        Edit Parent / Guardian Details
                    </DialogTitle>
                    <form onSubmit={handleSave}>
                        <DialogContent dividers sx={{ display: "flex", flexDirection: "column", gap: 2.5, pt: 2 }}>
                            <TextField
                                label="Parent First Name"
                                fullWidth
                                size="small"
                                value={parentFirstName}
                                required
                                onChange={(e) => setParentFirstName(e.target.value)}
                                disabled={saving}
                            />
                            <TextField
                                label="Parent Last Name"
                                fullWidth
                                size="small"
                                value={parentLastName}
                                onChange={(e) => setParentLastName(e.target.value)}
                                disabled={saving}
                            />
                            <TextField
                                label="Parent Email"
                                type="email"
                                fullWidth
                                size="small"
                                value={parentEmail}
                                onChange={(e) => setParentEmail(e.target.value)}
                                disabled={saving}
                                placeholder="example@email.com"
                            />
                        </DialogContent>
                        <DialogActions sx={{ px: 3, py: 2 }}>
                            <Button
                                onClick={handleCloseEdit}
                                disabled={saving}
                                color="inherit"
                                sx={{ textTransform: "none" }}
                            >
                                Cancel
                            </Button>
                            <Button
                                type="submit"
                                variant="contained"
                                disabled={saving}
                                sx={{ textTransform: "none", minWidth: 90 }}
                            >
                                {saving ? <CircularProgress size={22} color="inherit" /> : "Save"}
                            </Button>
                        </DialogActions>
                    </form>
                </Dialog>

            </Box >
        </>
    );
}

