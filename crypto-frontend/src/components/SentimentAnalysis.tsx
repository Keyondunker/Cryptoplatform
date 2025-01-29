import React, { useEffect, useState } from "react";
import { getSentimentAnalysis } from "../services/apiService";
import {
  CircularProgress,
  Typography,
  Box,
  Card,
  CardContent,
  Grid,
  Chip,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Container,
  Paper,
} from "@mui/material";
import SentimentSatisfiedAltIcon from "@mui/icons-material/SentimentSatisfiedAlt";
import SentimentDissatisfiedIcon from "@mui/icons-material/SentimentDissatisfied";
import SentimentNeutralIcon from "@mui/icons-material/SentimentNeutral";
import { Line } from "react-chartjs-2";
import { useNavigate } from "react-router-dom";


const SentimentAnalysis: React.FC = () => {
  const [sentimentData, setSentimentData] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>("");
  const [selectedPeriod, setSelectedPeriod] = useState<number>(7); // Default period 7 days

  const navigate = useNavigate();

  useEffect(() => {
    fetchSentimentData(selectedPeriod);
  }, [selectedPeriod]);

  const fetchSentimentData = async (period: number) => {
    setLoading(true);
    setError("");
    try {
      const data = await getSentimentAnalysis(period);
      if (Array.isArray(data)) {
        setSentimentData(data);
      } else {
        setError("Invalid data format received.");
        setSentimentData([]);
      }
    } catch (err) {
      setError("Failed to fetch sentiment data. Please try again.");
      setSentimentData([]);
    } finally {
      setLoading(false);
    }
  };

  // Handle chart click event
  const handleChartClick = (event: any, elements: any) => {
    if (elements.length > 0) {
      const index = elements[0].index;
      const selectedPost = sentimentData[index];
      navigate(`/post/${index}`, { state: selectedPost });
    }
  };

  // Handle period selection change
  const handlePeriodChange = (event: any) => {
    setSelectedPeriod(event.target.value);
  };

  // Generate labels for chart display
  const labels = sentimentData.map((_, index) => `Post #${index + 1}`);
  const sentimentScores = sentimentData.map((item) => item.sentiment_score);

  const chartData = {
    labels,
    datasets: [
      {
        label: `Sentiment Score (${selectedPeriod} days)`,
        data: sentimentScores,
        borderColor: sentimentScores.map((score) =>
          score > 0 ? "rgba(34, 197, 94, 1)" : score < 0 ? "rgba(239, 68, 68, 1)" : "rgba(156, 163, 175, 1)"
        ),
        backgroundColor: "rgba(75, 192, 192, 0.2)",
        borderWidth: 2,
        pointRadius: 6,
        tension: 0.4,
      },
    ],
  };

  const getSentimentTag = (label: string) => {
    if (label === "Positive") return <Chip icon={<SentimentSatisfiedAltIcon style={{ color: "green" }} />} label="Positive" color="success" />;
    if (label === "Negative") return <Chip icon={<SentimentDissatisfiedIcon style={{ color: "red" }} />} label="Negative" color="error" />;
    return <Chip icon={<SentimentNeutralIcon style={{ color: "gray" }} />} label="Neutral" color="default" />;
  };

  return (
    <Container sx={{ paddingY: 4 }}>
      <Paper elevation={3} sx={{ padding: 4, textAlign: "center", borderRadius: 4 }}>
        <Typography variant="h4" fontWeight="bold" color="primary" gutterBottom>
          Cryptocurrency Sentiment Analysis
        </Typography>

        {/* Period selection dropdown */}
        <FormControl sx={{ minWidth: 300, mb: 4 }}>
          <InputLabel>Select Period</InputLabel>
          <Select value={selectedPeriod} onChange={handlePeriodChange}>
            <MenuItem value={7}>Last 7 Days</MenuItem>
            <MenuItem value={30}>Last 30 Days</MenuItem>
            <MenuItem value={90}>Last 90 Days</MenuItem>
            <MenuItem value={365}>Last 1 year</MenuItem>
            <MenuItem value={3650}>Last 10 years</MenuItem>
          </Select>
        </FormControl>

        {loading ? (
          <CircularProgress />
        ) : error ? (
          <Typography color="error">{error}</Typography>
        ) : (
          <>
            {/* Chart Section */}
            <Box sx={{ marginBottom: 5 }}>
              <Typography variant="h5" fontWeight="bold" gutterBottom>
                Sentiment Trends
              </Typography>
              <Line
                data={chartData}
                options={{
                  responsive: true,
                  plugins: {
                    legend: { display: true, position: "top" as const },
                    title: { display: true, text: `Sentiment Analysis (${selectedPeriod}-day period)` },
                  },
                  onClick: handleChartClick,
                  scales: {
                    x: { title: { display: true, text: "Posts" } },
                    y: { title: { display: true, text: "Sentiment Score" }, suggestedMin: -1, suggestedMax: 1 },
                  },
                }}
              />
            </Box>

            {/* Posts Section */}
            <Grid container spacing={3}>
              {sentimentData.map((item, index) => (
                <Grid item xs={12} sm={6} md={4} key={index}>
                  <Card
                    elevation={3}
                    sx={{
                      borderLeft: `6px solid ${
                        item.sentiment_score > 0 ? "#34d399" : item.sentiment_score < 0 ? "#ef4444" : "#6b7280"
                      }`,
                      borderRadius: 2,
                      transition: "0.3s",
                      "&:hover": { transform: "scale(1.02)" },
                    }}
                  >
                    <CardContent>
                      <Typography variant="subtitle1" fontWeight="bold">
                        Post #{index + 1}
                      </Typography>
                      <Typography variant="body2" color="text.secondary" sx={{ fontStyle: "italic" }}>
                        {item.title}
                      </Typography>
                      <Box mt={1}>{getSentimentTag(item.sentiment_label)}</Box>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          </>
        )}
      </Paper>
    </Container>
  );
};

export default SentimentAnalysis;
