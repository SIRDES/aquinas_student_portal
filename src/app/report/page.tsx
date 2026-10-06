"use client";
import React, { useState, useEffect, Suspense, useMemo } from "react";
import Box from "@mui/material/Box";
import { pdf } from "@react-pdf/renderer";

import { saveAs } from "file-saver";
import { Button } from "@mui/material";
import LoadingAlert from "@/components/LoadingAlert";
import { useSearchParams } from "next/navigation";
import { getStudentResultsWithPaymentId } from "@/utils/serverActions/student";
import { showAlert } from "@/components/Alerts";
import StudentReportCard from "@/components/StudentReportCard";
import OnlyLogoAppBar from "@/components/OnlyLogoAppBar";

const PDFFileViewer = React.lazy(() => import("@/components/PdfViewer"));

function ReportContent() {
  const token = useSearchParams().get("token");
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [studentName, setStudentName] = useState<string | null>(null);
  const [reportFile, setReportFile] = useState<Blob | null>(null);
  const handleFetchData = async () => {
    setLoading(true);
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
        // updateNumberOfTimesUsed: false,
      });

      if (!response.success) {
        showAlert({
          title: "Error",
          severity: "error",
          text: response.message,
        });
        return;
      }
      setData(response.data);
    } catch (error) {
      showAlert({
        title: "Error",
        severity: "error",
        text: "An error occurred, please try again.",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    handleFetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  useEffect(() => {
    if (data) {
      setStudentName(
        `${
          data?.studentInfo?.firstName
            ? data?.studentInfo?.firstName?.toUpperCase()
            : ""
        }_${
          data?.studentInfo?.lastName
            ? data?.studentInfo?.lastName?.toUpperCase()
            : ""
        }`
      );
    }
  }, [data]);

  useMemo(() => {
    if (!data) return null;
    const generateReport = async () => {
      try {
        const blob = await pdf(<StudentReportCard data={data} />).toBlob();
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
  }, [data]);

  const handleSaveAsWithPrint = async () => {
    const blob = await pdf(<StudentReportCard data={data} />).toBlob();
    saveAs(blob, `${studentName}_report.pdf`);
  };

  return (
    <>
      <LoadingAlert open={loading} />

      <OnlyLogoAppBar title="Student Report" />
      {data && (
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

      {data && (
        <Box
          sx={{
            width: { xs: "100%", md: "60%" },
            margin: "auto",
            marginBottom: "20px",
            overflow: "scroll",
          }}
        >
          <PDFFileViewer file={reportFile} />
          {/* <PDFFileViewer file={reportFile} /> */}
          {/* <PDFViewer width={"100%"} height="1000px">
                        <StudentReportCard data={data} />
                    </PDFViewer> */}
        </Box>
      )}
    </>
  );
}

export default function Report() {
  return (
    <Suspense fallback={<LoadingAlert open={true} />}>
      <ReportContent />
    </Suspense>
  );
}
