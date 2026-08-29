import requests
import base64

PAYPAL_CLIENT_ID = "TU_CLIENT_ID"
PAYPAL_CLIENT_SECRET = "TU_SECRET"

BASE_URL = "https://api-m.sandbox.paypal.com"


def get_access_token():

    auth = f"{PAYPAL_CLIENT_ID}:{PAYPAL_CLIENT_SECRET}"
    auth_bytes = auth.encode("utf-8")
    auth_base64 = base64.b64encode(auth_bytes).decode("utf-8")

    headers = {
        "Authorization": f"Basic {auth_base64}",
        "Content-Type": "application/x-www-form-urlencoded"
    }

    data = {
        "grant_type": "client_credentials"
    }

    response = requests.post(
        f"{BASE_URL}/v1/oauth2/token",
        headers=headers,
        data=data
    )

    return response.json()["access_token"]