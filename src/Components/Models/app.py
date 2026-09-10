from flask import Flask, request, jsonify
import joblib
import pandas as pd
from flask_cors import CORS

app = Flask(__name__)
CORS(app)

# Load the trained model
model = joblib.load('crop_recommender.joblib')

@app.route('/predict', methods=['POST'])
def predict():
    # Get data from POST request
    data = request.json
    
    # Convert to DataFrame
    input_data = pd.DataFrame([[
        data['N'], data['P'], data['K'],
        data['temperature'], data['humidity'],
        data['ph'], data['rainfall']
    ]], columns=['N', 'P', 'K', 'temperature', 'humidity', 'ph', 'rainfall'])
    
    # Predict
    prediction = model.predict(input_data)
    
    # Return result
    return jsonify({"recommended_crop": prediction[0]})

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5000)