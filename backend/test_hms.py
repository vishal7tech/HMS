import requests
import json
import random
import datetime

BASE_URL = "http://127.0.0.1:8080/api"
RANDOM_ID = str(random.randint(1000, 9999))

def log(msg, color="white"):
    print(f"[{datetime.datetime.now().time()}] {msg}")

def register(username, role, doctor_id=None):
    url = f"{BASE_URL}/auth/register"
    data = {"username": username, "password": "pass123", "role": role}
    if doctor_id:
        data["doctorId"] = doctor_id
    try:
        res = requests.post(url, json=data)
        if res.status_code in [200, 201]:
            log(f"Registered {role}: {username}", "green")
            return True
        else:
            log(f"Failed to register {username}: {res.text}", "red")
            return False
    except Exception as e:
        log(f"Error registering {username}: {e}", "red")
        return False

def login(username):
    url = f"{BASE_URL}/auth/login"
    data = {"username": username, "password": "pass123"}
    try:
        res = requests.post(url, json=data)
        if res.status_code == 200:
            return res.json().get("token")
        else:
            log(f"Login failed for {username}: {res.text}", "red")
            return None
    except Exception as e:
        log(f"Error logging in {username}: {e}", "red")
        return None

def run_tests():
    admin_user = f"admin_{RANDOM_ID}"
    recep_user = f"recep_{RANDOM_ID}"
    doc_user = f"doc_{RANDOM_ID}"

    log("\n--- 1. Authentication ---")
    register(admin_user, "ADMIN")
    register(recep_user, "RECEPTIONIST")
    
    admin_token = login(admin_user)
    recep_token = login(recep_user)
    
    if not admin_token or not recep_token:
        log("Critical: Failed to get tokens.", "red")
        return

    admin_headers = {"Authorization": f"Bearer {admin_token}"}
    recep_headers = {"Authorization": f"Bearer {recep_token}"}

    log("\n--- 2. Doctor Management ---")
    doc_body = {
        "name": f"Dr. Python_{RANDOM_ID}",
        "specialization": "Neurology",
        "email": f"dr_{RANDOM_ID}@py.test",
        "phone": "1234567890",
        "qualification": "PhD",
        "availability": "Mon-Fri 09:00-17:00",
        "shiftStart": "09:00:00",
        "shiftEnd": "17:00:00"
    }
    
    res = requests.post(f"{BASE_URL}/doctors", json=doc_body, headers=admin_headers)
    if res.status_code == 201:
        doctor = res.json()
        log(f"Doctor Created: {doctor['name']} (ID: {doctor['id']})", "green")
        if doctor.get("availability") == "Mon-Fri 09:00-17:00":
             log("Verified Availability Field", "green")
        else:
             log("Availability Field Missing/Wrong", "red")
    else:
        log(f"Failed to create doctor: {res.text}", "red")
        return

    # Register Doctor User
    register(doc_user, "DOCTOR", doctor['id'])
    doc_token = login(doc_user)
    doc_headers = {"Authorization": f"Bearer {doc_token}"}

    log("\n--- 3. Patient Management ---")
    pat_body = {
        "name": f"Patient_{RANDOM_ID}",
        "age": 45,
        "email": f"pat_{RANDOM_ID}@py.test",
        "phoneNumber": "9876543210",
        "medicalHistory": "Migraine",
        "gender": "FEMALE"
    }

    res = requests.post(f"{BASE_URL}/patients", json=pat_body, headers=recep_headers)
    if res.status_code == 201:
        patient = res.json()
        log(f"Patient Created: {patient['name']} (ID: {patient['id']})", "green")
    else:
        log(f"Failed to create patient: {res.text}", "red")
        return

    # Doctor Reads Patient
    res = requests.get(f"{BASE_URL}/patients/{patient['id']}", headers=doc_headers)
    if res.status_code == 200:
        log("Doctor retrieved patient successfully", "green")
    else:
        log(f"Doctor failed to read patient: {res.status_code}", "red")

    log("\n--- 4. Appointment & Overlap ---")
    future_date = (datetime.datetime.now() + datetime.timedelta(days=7)).replace(hour=10, minute=0, second=0, microsecond=0)
    date_str = future_date.isoformat()

    app_body = {
        "patientId": patient['id'],
        "doctorId": doctor['id'],
        "dateTime": date_str,
        "reason": "Checkup"
    }

    # Book 1st
    res = requests.post(f"{BASE_URL}/appointments", json=app_body, headers=recep_headers)
    if res.status_code == 201:
        app = res.json()
        log(f"Appointment 1 Booked: {app['dateTime']}", "green")
    else:
        log(f"Failed to book appt 1: {res.text}", "red")
        return

    # Overlap
    log("Attempting Overlapping Booking...")
    res = requests.post(f"{BASE_URL}/appointments", json=app_body, headers=recep_headers)
    if res.status_code == 409:
        log("SUCCESS: Overlapping appointment rejected (409)", "green")
    else:
        log(f"FAILURE: Overlap allowed or wrong code: {res.status_code}", "red")

    log("\n--- 5. Billing & Dashboard ---")
    bill_amount = 200.0
    bill_body = {
        "patientId": patient['id'],
        "appointmentId": app['id'],
        "amount": bill_amount,
        "paymentMethod": "CASH",
        "paymentStatus": "PAID"
    }
    
    res = requests.post(f"{BASE_URL}/billings", json=bill_body, headers=recep_headers)
    if res.status_code == 201:
        log(f"Bill Created: {res.json()['amount']}", "green")
    else:
        log(f"Failed to create bill: {res.text}", "red")

    # Dashboard
    res = requests.get(f"{BASE_URL}/dashboard/stats", headers=admin_headers)
    if res.status_code == 200:
        stats = res.json()
        revenue = stats.get("totalRevenue", 0)
        log(f"Dashboard Revenue: {revenue}")
        if float(revenue) >= bill_amount:
            log("SUCCESS: Dashboard Revenue updated", "green")
        else:
            log("FAILURE: Revenue not updated", "red")

if __name__ == "__main__":
    try:
        # Check requests lib
        import requests
        run_tests()
    except ImportError:
        print("Please install requests: pip install requests")
