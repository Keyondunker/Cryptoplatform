import React from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  Box,
  Typography,
  Card,
  CardContent,
  Button,
  Chip,
} from "@mui/material";
import SentimentSatisfiedAltIcon from "@mui/icons-material/SentimentSatisfiedAlt";
import SentimentDissatisfiedIcon from "@mui/icons-material/SentimentDissatisfied";
import SentimentNeutralIcon from "@mui/icons-material/SentimentNeutral";

const PostDetails: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const post = location.state;

  if (!post) {
    return (
      <Box sx={{ padding: 4, textAlign: "center" }}>
        <Typography variant="h5" color="error">
          No post data available. Please go back and select a post.
        </Typography>
        <Button variant="contained" color="primary" onClick={() => navigate(-1)} sx={{ mt: 2 }}>
          Go Back
        </Button>
      </Box>
    );
  }

  // Determine sentiment label with styling
  const getSentimentTag = (label: string) => {
    if (label === "Positive")
      return <Chip icon={<SentimentSatisfiedAltIcon style={{ color: "green" }} />} label="Positive" color="success" />;
    if (label === "Negative")
      return <Chip icon={<SentimentDissatisfiedIcon style={{ color: "red" }} />} label="Negative" color="error" />;
    return <Chip icon={<SentimentNeutralIcon style={{ color: "gray" }} />} label="Neutral" color="default" />;
  };

  return (
    <Box sx={{ padding: 4, maxWidth: "800px", margin: "0 auto", textAlign: "center" }}>
      <Typography variant="h4" fontWeight="bold" gutterBottom color="primary">
        Post Details
      </Typography>
      <Card elevation={3} sx={{ background: "#f8f9fa", borderLeft: `6px solid ${post.sentiment_score > 0 ? "#34d399" : post.sentiment_score < 0 ? "#ef4444" : "#6b7280"}` }}>
        <CardContent>
          <Typography variant="h6" fontWeight="bold">
            Post Title:
          </Typography>
          <Typography variant="body1" color="text.secondary">
            {post.title}
          </Typography>

          <Typography variant="h6" fontWeight="bold" mt={2}>
            Sentiment Score:
          </Typography>
          <Typography variant="body1" sx={{ fontWeight: "bold", color: post.sentiment_score > 0 ? "green" : post.sentiment_score < 0 ? "red" : "gray" }}>
            {post.sentiment_score.toFixed(2)}
          </Typography>

          <Typography variant="h6" fontWeight="bold" mt={2}>
            Sentiment Label:
          </Typography>
          <Box mt={1}>{getSentimentTag(post.sentiment_label)}</Box>

          {post.created_date && (
            <>
              <Typography variant="h6" fontWeight="bold" mt={2}>
                Created Date:
              </Typography>
              <Typography variant="body1">{post.created_date}</Typography>
            </>
          )}
        </CardContent>
      </Card>

      <Button variant="contained" color="primary" onClick={() => navigate(-1)} sx={{ mt: 3 }}>
        Back to Sentiment Analysis
      </Button>
    </Box>
  );
};

export default PostDetails;
