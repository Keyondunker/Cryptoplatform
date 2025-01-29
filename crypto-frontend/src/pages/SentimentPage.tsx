import React from "react";
import SentimentAnalysis from "../components/SentimentAnalysis";
import { Container, Typography } from "@mui/material";

const SentimentPage: React.FC = () => {
  return (
    <Container>
      <Typography variant="h4" style={{ marginTop: "20px", textAlign: "center" }}>
        Crypto Market Sentiment Analysis
      </Typography>
      <SentimentAnalysis />
    </Container>
  );
};

export default SentimentPage;
