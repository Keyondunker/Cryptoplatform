import React, { useEffect, useState } from "react";
import { getAnomalies } from "../services/apiService";
import {
  CircularProgress,
  Typography,
  Box,
  Card,
  CardContent,
  Grid,
  Chip,
  Paper,
} from "@mui/material";
import WarningIcon from "@mui/icons-material/Warning";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import { Line } from "react-chartjs-2";

const AnomalyPage: React.FC = () => {
  const [anomalyData, setAnomalyData] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>("");

  useEffect(() => {
    fetchAnomalies();
  }, []);

  const fetchAnomalies = async () => {
    setLoading(true);
    setError("");
    try {
      const response = await getAnomalies();
      if (response && response.anomalies_detected) {
        setAnomalyData(response.anomalies_detected);
      } else {
        setError("Invalid data format received.");
      }
    } catch (err) {
      setError("Failed to fetch anomaly data. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Prepare data for the chart
  const labels = anomalyData.map((item) => item.date);
  const prices = anomalyData.map((item) => item.price);
  const marketCaps = anomalyData.map((item) => item.market_cap);
  const volumes = anomalyData.map((item) => item.volume_24h);
  const anomalies = anomalyData.map((item) =>
    item.is_anomaly === "Anomaly" ? item.price : null
  );

  const chartData = {
    labels,
    datasets: [
      {
        label: "Price",
        data: prices,
        borderColor: "rgba(34, 197, 94, 1)",
        backgroundColor: "rgba(34, 197, 94, 0.2)",
        borderWidth: 2,
        tension: 0.4,
      },
      {
        label: "Market Cap",
        data: marketCaps,
        borderColor: "rgba(54, 162, 235, 1)",
        backgroundColor: "rgba(54, 162, 235, 0.2)",
        borderWidth: 2,
        tension: 0.4,
      },
      {
        label: "Volume (24h)",
        data: volumes,
        borderColor: "rgba(255, 159, 64, 1)",
        backgroundColor: "rgba(255, 159, 64, 0.2)",
        borderWidth: 2,
        tension: 0.4,
      },
      {
        label: "Anomalies",
        data: anomalies,
        borderColor: "rgba(239, 68, 68, 1)",
        backgroundColor: "rgba(239, 68, 68, 0.5)",
        borderWidth: 3,
        pointRadius: 6,
        pointBackgroundColor: "red",
        showLine: false,
      },
    ],
  };

  const getAnomalyChip = (label: string) => {
    return label === "Anomaly" ? (
      <Chip icon={<WarningIcon />} label="Anomaly" color="error" />
    ) : (
      <Chip icon={<CheckCircleIcon />} label="Normal" color="success" />
    );
  };

  return (
    <Box sx={{ padding: 4, maxWidth: "1200px", margin: "0 auto", textAlign: "center" }}>
      <Typography variant="h4" fontWeight="bold" gutterBottom color="primary">
        Cryptocurrency Anomaly Detection
      </Typography>

      {loading ? (
        <CircularProgress />
      ) : error ? (
        <Typography color="error">{error}</Typography>
      ) : (
        <>
          <Paper elevation={3} sx={{ padding: 4, marginBottom: 4 }}>
            <Typography variant="h5" fontWeight="bold" gutterBottom>
              Anomaly Trend Analysis
            </Typography>
            <Line
              data={chartData}
              options={{
                responsive: true,
                plugins: {
                  legend: { display: true, position: "top" as const },
                  title: { display: true, text: "Detected Anomalies in Market Data" },
                },
                scales: {
                  x: { title: { display: true, text: "Date" } },
                  y: { title: { display: true, text: "Values" } },
                },
              }}
            />
          </Paper>

          <Grid container spacing={3} justifyContent="center">
            {anomalyData.map((item, index) => (
              <Grid item xs={12} sm={6} md={4} key={index}>
                <Card
                  elevation={3}
                  sx={{
                    borderLeft: `6px solid ${
                      item.is_anomaly === "Anomaly" ? "#ef4444" : "#34d399"
                    }`,
                    borderRadius: 2,
                  }}
                >
                  <CardContent>
                    <Typography variant="subtitle1" fontWeight="bold">
                      Date: {item.date}
                    </Typography>
                    <Typography variant="body2">
                      <strong>Price:</strong> ${item.price.toLocaleString()}
                    </Typography>
                    <Typography variant="body2">
                      <strong>Market Cap:</strong> ${item.market_cap.toLocaleString()}
                    </Typography>
                    <Typography variant="body2">
                      <strong>24h Volume:</strong> ${item.volume_24h.toLocaleString()}
                    </Typography>
                    <Box mt={1}>{getAnomalyChip(item.is_anomaly)}</Box>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </>
      )}
    </Box>
  );
};

export default AnomalyPage;
