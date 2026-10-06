"use client";
import {
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Box,
  Container,
  Typography,
  // useMediaQuery,
} from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import OnlyLogoAppBar from "@/components/OnlyLogoAppBar";

import Link from "next/link";

const faqData = [
  {
    id: "panel1",
    question: "How many times can I check after paying for a semester results?",
    answer:
      "After making a payment for a semester's results, you can check your results an unlimited number of times for that specific semester with the results link that was sent via SMS. The results link can be requested three times if needed.",
  },
  {
    id: "panel2",
    question:
      "Can I check the previous semesters after paying to check the current semester results?",
    answer:
      "No, the payment for checking results is specific to the semester you paid for. Each semester's results require a separate payment. If you need to check results from a previous semester, you'll need to make a separate payment for that specific semester.",
  },
  {
    id: "panel3",
    question: "What happens if I miss the results link sent via SMS?",
    answer:
      "If you miss the results link sent via SMS, you can request it to be resent up to three times. After that, you'll need to make another payment to receive the link again.",
  },
  {
    id: "panel4",
    question: "How long are the results links valid?",
    answer:
      "The results links do not expire and can be used multiple times for that specific semester.",
  },
  {
    id: "panel5",
    question: "Helplines or contact",
    answer:
      "You can reach our support team via WhatsApp on 0247199122 / 0240084448 for any assistance.",
  },
];
export default function FAQPage() {
  return (
    <>
      <OnlyLogoAppBar
        title="Check Result - FAQs"
        showRightContent={true}
        rightContent={
          <Link href="/check-result" style={{ color: "white" }}>
            Check Result
          </Link>
        }
      />
      <Container component="main" maxWidth="sm">
        <Box
          sx={{
            marginTop: 4,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
          }}
        >
          <Typography
            variant="h4"
            component="h1"
            gutterBottom
            align="center"
            sx={{ mb: 4 }}
          >
            Frequently Asked Questions
          </Typography>

          {faqData.map((faq, index) => (
            <Accordion key={faq.id}>
              <AccordionSummary
                expandIcon={<ExpandMoreIcon />}
                aria-controls={`${faq.id}-content`}
                id={`${faq.id}-header`}
              >
                <Typography variant="subtitle1">
                  {index + 1}. {faq.question}
                </Typography>
              </AccordionSummary>
              <AccordionDetails>
                <Typography variant="body1" color="text.secondary">
                  {faq.answer}
                </Typography>
              </AccordionDetails>
            </Accordion>
          ))}
        </Box>
      </Container>
    </>
  );
}
