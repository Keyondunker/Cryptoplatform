import praw
import pandas as pd
from textblob import TextBlob
from datetime import datetime, timedelta

# Reddit API credentials
reddit = praw.Reddit(
    client_id='YwxOFABSDN6GNKl2xv8p5A',
    client_secret='5d3-63RDuuvBmGTSe1vxFqrPw7dGKw',
    user_agent='crypto-sentiment-analyzer'
)

def analyze_sentiment(subreddit_name, search_term, limit=200, days = 7):
    """
    Analyze sentiment of Reddit posts for a given search term and time period.

    :param subreddit_name: Name of the subreddit to search in.
    :param search_term: Keyword to search for.
    :param limit: Number of posts to retrieve (default is 100).
    :param days: Filter posts within the past X days (default is 7 days).
    :return: List of dictionaries with post details and sentiment analysis.
    """

    subreddit = reddit.subreddit(subreddit_name)
    posts = []
     # Map days to Reddit's supported time filters
    time_filter_map = {
        1: "day",
        7: "week",
        30: "month",
        365: "year",
    }

    time_filter = time_filter_map.get(days, "all")  # Default to 'all' if days not in map

    # Calculate timestamp for filtering posts within the last X days
    time_threshold = datetime.utcnow() - timedelta(days=days)
    time_threshold_unix = int(time_threshold.timestamp())

    for post in subreddit.search(search_term, limit=limit, time_filter=time_filter):
        # Convert post creation timestamp to datetime
        post_date = datetime.utcfromtimestamp(post.created_utc)

        if post_date >= time_threshold:
            sentiment = TextBlob(post.title).sentiment.polarity
            posts.append({
                'title': post.title,
                'created_date': post_date.strftime('%Y-%m-%d %H:%M:%S'),
                'sentiment_score': sentiment,
                'sentiment_label': 'Positive' if sentiment > 0 else ('Negative' if sentiment < 0 else 'Neutral')
            })

    # Convert to dataframe and save to CSV
    if posts:
        df = pd.DataFrame(posts)
        df.to_csv('data/reddit_crypto_sentiment.csv', index=False)
        return df.to_dict(orient="records")
    else:
        return {"message": "No posts found for the given criteria."}

# Example usage
if __name__ == "__main__":
    results = analyze_sentiment("cryptocurrency", "Bitcoin", limit=200, days=30)
    print(results)
