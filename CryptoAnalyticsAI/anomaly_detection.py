import pandas as pd
from sklearn.ensemble import IsolationForest

def detect_anomalies(file_path):
    df = pd.read_csv(file_path)
    features = df[['price', 'volume_24h']].fillna(0)
    
    model = IsolationForest(n_estimators=100, contamination=0.05, random_state=42)
    df['anomaly_score'] = model.fit_predict(features)
    df['is_anomaly'] = df['anomaly_score'].apply(lambda x: 'Anomaly' if x == -1 else 'Normal')

    anomalies = df[df['is_anomaly'] == 'Anomaly']
    anomalies.to_csv('data/crypto_anomalies.csv', index=False)
    return anomalies.to_dict(orient="records")
