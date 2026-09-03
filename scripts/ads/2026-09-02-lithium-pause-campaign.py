#!/usr/bin/env python3
"""
Pause Lithium Golf Kits Shopping (24175252534) — 2026-09-02.

Aug 23–Sep 2: 229 clicks, $275.86, 0.67% CTR, zero Ads conversions, and
zero Stripe checkout starts on any lithium SKU. Sep 1 excluded 48V 65Ah
and 36V 105Ah; the three keepers still spent $24.85 on Sep 2 with no carts.

PDPs and the Merchant feed stay live. Re-enable if a real kit checkout
appears or unit economics change.

Run with the MCP server venv python:
  /Users/christopherray/.mcp-servers/mcp-google-ads/.venv/bin/python \
    scripts/ads/2026-09-02-lithium-pause-campaign.py [--apply]
"""

import json
import os
import sys

MCP_DIR = "/Users/christopherray/.mcp-servers/mcp-google-ads"
sys.path.insert(0, MCP_DIR)

from dotenv import load_dotenv  # noqa: E402

load_dotenv(os.path.join(MCP_DIR, ".env"))

import requests  # noqa: E402
from google.oauth2.credentials import Credentials  # noqa: E402
from google.auth.transport.requests import Request  # noqa: E402

API_VERSION = "v24"
CUSTOMER_ID = "3466711027"
CAMPAIGN_ID = "24175252534"

APPLY = "--apply" in sys.argv


def get_headers():
    creds_path = os.environ["GOOGLE_ADS_CREDENTIALS_PATH"]
    creds = Credentials.from_authorized_user_info(
        json.load(open(creds_path)), scopes=["https://www.googleapis.com/auth/adwords"]
    )
    if not creds.valid:
        creds.refresh(Request())
    headers = {
        "Authorization": f"Bearer {creds.token}",
        "developer-token": os.environ["GOOGLE_ADS_DEVELOPER_TOKEN"],
        "Content-Type": "application/json",
    }
    login_cid = os.environ.get("GOOGLE_ADS_LOGIN_CUSTOMER_ID", "").replace("-", "")
    if login_cid:
        headers["login-customer-id"] = login_cid
    return headers


def main():
    headers = get_headers()
    print("  Lithium Golf Kits Shopping 24175252534 -> PAUSED")
    url = (
        f"https://googleads.googleapis.com/{API_VERSION}"
        f"/customers/{CUSTOMER_ID}/campaigns:mutate"
    )
    body = {
        "operations": [
            {
                "update": {
                    "resourceName": f"customers/{CUSTOMER_ID}/campaigns/{CAMPAIGN_ID}",
                    "status": "PAUSED",
                },
                "updateMask": "status",
            }
        ]
    }
    if not APPLY:
        body["validateOnly"] = True
    resp = requests.post(url, headers=headers, json=body)
    mode = "APPLY" if APPLY else "VALIDATE"
    if resp.status_code != 200:
        print(f"[{mode}] FAILED {resp.status_code}")
        print(json.dumps(resp.json(), indent=2)[:3000])
        sys.exit(1)
    print(f"[{mode}] Lithium campaign pause: OK")
    for r in resp.json().get("results", []):
        if r.get("resourceName"):
            print(f"    -> {r['resourceName']}")


if __name__ == "__main__":
    print(f"Mode: {'APPLY' if APPLY else 'DRY RUN (validateOnly)'}\n")
    main()
    print("\nDone.")
