from flask import Flask, request, jsonify , send_file
from flask_cors import CORS
import asyncio
import nodriver as uc
import time
import os.path
from PIL import Image
import io
from get_slots import SlotFinder , receive_captcha_input

app = Flask(__name__)
CORS(app)

# Global variables to store login details temporarily
login_details = {}
security_questions = {}

@app.route("/submit_data", methods=["POST"])
def submit_data():
    global login_details, security_questions  # Declare globals
    try:
        if request.method == "POST":
            # Retrieve data from the request
            data = request.json

            if data == {}:  # Check if data is empty
                raise Exception("400: Bad Request")

            # Process the data and save to global variables
            # if origin country is not selected, set it to India
            if not data.get("originCountry"):
                login_details["originCountry"] = "India"
            else:
                login_details["originCountry"] = data.get("originCountry") 
            login_details["appointmentStartDate"] = data.get("appointmentStartDate")
            login_details["appointmentEndDate"] = data.get("appointmentEndDate")
            login_details["singleCity"] = data.get("singleCity")
            login_details["selectedCities"] = data.get("selectedCities")
            login_details["autoLoginEnabled"] = data.get("autoLoginEnabled")
            login_details["username"] = data.get("userName")
            login_details["password"] = data.get("password")

            # Check if any of the required fields are empty
            if not login_details["username"] or not login_details["password"]:
                raise Exception("400: Bad Request, username or password is empty")
            
            # either one of the city should be selected
            if not login_details["singleCity"] and not login_details["selectedCities"]:
                raise Exception("400: Bad Request, City is not selected")
            
            if not login_details["appointmentStartDate"] or not login_details["appointmentEndDate"]:
                raise Exception("400: Bad Request, Appointment date is not selected")
            

            security_questions_list = data.get("securityQuestions", [])

            # Check if security questions are empty
            if not security_questions_list:
                raise Exception("400: Bad Request, security questions are empty")
            
            for i, question in enumerate(security_questions_list, 1):
                security_questions[f"question_{i}"] = question.get(f"question_{i}")
                security_questions[f"answer_{i}"] = question.get(f"answer_{i}")

            # Return a response
            return jsonify({"status": "Your response has been submitted successfully."})
        else:
            raise Exception("405: Method Not Allowed")
    except Exception as e:
        return jsonify({"status": str(e)})


@app.route("/captcha_input", methods=["POST"])
def receive_captcha_from_frontend():
    captcha_data = request.json.get("captcha_input")
    print(captcha_data)
    receive_captcha_input(captcha_data)
    return "CAPTCHA input received successfully"

@app.route("/start_process", methods=["GET"])
async def start_process():
    global login_details, security_questions
    print(login_details)
    print(security_questions)
    # Check if login details and security questions are available
    if "username" in login_details and "password" in login_details and security_questions:
        # Start the process with Selenium

        slot_finder = await SlotFinder().create()
        await slot_finder.find_my_slots(login_details["username"], login_details["password"], security_questions , login_details["appointmentStartDate"] , login_details["appointmentEndDate"] , login_details["selectedCities"] , login_details["singleCity"])
        return jsonify({"status": "success"})
    else:
        return jsonify({"error": "Login details or security questions not provided"})


@app.route("/captcha_image", methods=["GET"])
def get_captcha_image():
    # Return the CAPTCHA image file
    return send_file("../Image/captcha_image.png", mimetype="image/png")

@app.route("/view_image", methods=["GET"])
def view_image():
    # Return the CAPTCHA image file
    return send_file("../Image/Full_image.png", mimetype="image/png")

if __name__ == "__main__":
    app.run(debug=True)
