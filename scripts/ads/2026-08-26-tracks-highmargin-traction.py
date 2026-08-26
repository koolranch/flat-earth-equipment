#!/usr/bin/env python3
"""
Traction pass (2026-08-26) for the two priority Shopping campaigns.

Tracks (24146723448): 85% lost impression share is rank, $0 spend at $30/day.
  Raise listing-group CPCs under break-even at 0.8% CVR.

High-Margin Parts (24175332700): 70% lost-IS is budget, rank-lost is 0%.
  Raise daily budget $10 -> $20. Leave CPC alone (swivel already wins at $1.33).

Run:
  /Users/christopherray/.mcp-servers/mcp-google-ads/.venv/bin/python \
    scripts/ads/2026-08-26-tracks-highmargin-traction.py [--apply]
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

HIGH_MARGIN_BUDGET = "customers/3466711027/campaignBudgets/15811785077"

# (ad_group_id~criterion_id, new bid micros, note)
BID_UPDATES = [
    ("201844036280~2497536964055", 2_250_000, "rt-t190-400x86x49-c $1.75 -> $2.25"),
    ("201844036280~2497917345058", 1_600_000, "rt-t190-320x86x49-c $1.30 -> $1.60"),
    ("199818139816~2495896741110", 1_600_000, "rt-320x86x52-c $1.30 -> $1.60"),
    ("198753051799~2690256890592", 1_400_000, "rt-317g-320x86x50-c $1.00 -> $1.40"),
    ("198753051799~2690256890632", 1_400_000, "rt-325g-320x86x52-c $1.00 -> $1.40"),
    ("198753051799~2690256890792", 1_400_000, "rt-317g-400x86x50-c $1.00 -> $1.40"),
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


def mutate(headers, service, operations, label):
    url = (
        f"https://googleads.googleapis.com/{API_VERSION}"
        f"/customers/{CUSTOMER_ID}/{service}:mutate"
    )
    body = {"operations": operations}
    if not APPLY:
        body["validateOnly"] = True
    resp = requests.post(url, headers=headers, json=body)
    mode = "APPLY" if APPLY else "VALIDATE"
    if resp.status_code != 200:
        print(f"[{mode}] {label}: FAILED {resp.status_code}")
        print(json.dumps(resp.json(), indent=2)[:3000])
        sys.exit(1)
    print(f"[{mode}] {label}: OK ({len(operations)} ops)")
    for r in resp.json().get("results", []):
        if r.get("resourceName"):
            print(f"    -> {r['resourceName']}")


def main():
    headers = get_headers()
    bid_ops = []
    for cid, micros, note in BID_UPDATES:
        print(f"  {note}")
        bid_ops.append({
            "update": {
                "resourceName": f"customers/{CUSTOMER_ID}/adGroupCriteria/{cid}",
                "cpcBidMicros": str(micros),
            },
            "updateMask": "cpc_bid_micros",
        })
    mutate(headers, "adGroupCriteria", bid_ops, "track listing-group bid lift")
    mutate(headers, "adGroups", [{
        "update": {
            "resourceName": f"customers/{CUSTOMER_ID}/adGroups/198753051799",
            "cpcBidMicros": "1400000",
        },
        "updateMask": "cpc_bid_micros",
    }], "JD ad-group default bid $1.00 -> $1.40")
    mutate(headers, "campaignBudgets", [{
        "update": {
            "resourceName": HIGH_MARGIN_BUDGET,
            "amountMicros": "20000000",
        },
        "updateMask": "amount_micros",
    }], "High-Margin daily budget $10 -> $20")


if __name__ == "__main__":
    print(f"Mode: {'APPLY' if APPLY else 'DRY RUN (validateOnly)'}\n")
    main()
    print("\nDone.")
