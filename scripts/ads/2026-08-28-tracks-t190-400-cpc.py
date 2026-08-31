#!/usr/bin/env python3
"""
T190 400 C-pattern CPC lift (2026-08-28).

Tracks Shopping (24146723448) is Eligible/Serving with $0 spend at $30/day.
Lost-IS is ~88% rank, 0% budget — do not raise budget.

T190 400 (RT-T190-400X86X49-C) is the impression SKU and the only unit
with headroom under the 0.8% CVR break-even:

  T190 400  $2.25 -> $2.65   (profit ~$331, BE ~$2.65)

Leave T190 320 / T650 320 / JD G-series at their Aug 25 ceilings.

Run with the MCP server venv python:
  /Users/christopherray/.mcp-servers/mcp-google-ads/.venv/bin/python \
    scripts/ads/2026-08-28-tracks-t190-400-cpc.py [--apply]
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

APPLY = "--apply" in sys.argv

# (ad_group_id~criterion_id, new bid micros, note)
BID_UPDATES = [
    ("201844036280~2497536964055", 2_650_000, "rt-t190-400x86x49-c $2.25 -> $2.65"),
]


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
    ops = []
    for cid, micros, note in BID_UPDATES:
        print(f"  {note}")
        ops.append({
            "update": {
                "resourceName": f"customers/{CUSTOMER_ID}/adGroupCriteria/{cid}",
                "cpcBidMicros": str(micros),
            },
            "updateMask": "cpc_bid_micros",
        })
    url = (
        f"https://googleads.googleapis.com/{API_VERSION}"
        f"/customers/{CUSTOMER_ID}/adGroupCriteria:mutate"
    )
    body = {"operations": ops}
    if not APPLY:
        body["validateOnly"] = True
    resp = requests.post(url, headers=headers, json=body)
    mode = "APPLY" if APPLY else "VALIDATE"
    if resp.status_code != 200:
        print(f"[{mode}] FAILED {resp.status_code}")
        print(json.dumps(resp.json(), indent=2)[:3000])
        sys.exit(1)
    print(f"[{mode}] T190 400 CPC lift: OK ({len(ops)} ops)")
    for r in resp.json().get("results", []):
        if r.get("resourceName"):
            print(f"    -> {r['resourceName']}")


if __name__ == "__main__":
    print(f"Mode: {'APPLY' if APPLY else 'DRY RUN (validateOnly)'}\n")
    main()
    print("\nDone.")
