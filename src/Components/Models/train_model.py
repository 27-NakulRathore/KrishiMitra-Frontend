# Import libraries
import pandas as pd
from sklearn.ensemble import RandomForestClassifier
from sklearn.model_selection import train_test_split
import joblib
import os

BASE_DIR = os.path.dirname(__file__)  
data_path = os.path.join(BASE_DIR, "data", "Crop_recommendation.csv")
# Load dataset
data = pd.read_csv(data_path)


# Separate features (X) and target (y)
X = data[['N', 'P', 'K', 'temperature', 'humidity', 'ph', 'rainfall']]
y = data['label']

# Split into training (80%) and testing (20%)
X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

# Initialize and train the model
model = RandomForestClassifier(n_estimators=100, random_state=42)
model.fit(X_train, y_train)

# Evaluate accuracy
accuracy = model.score(X_test, y_test)
print(f"Model Accuracy: {accuracy * 100:.2f}%")  # Expected: ~99%

# Save the trained model
joblib.dump(model, 'crop_recommender.joblib')
print("Model saved as 'crop_recommender.joblib'")