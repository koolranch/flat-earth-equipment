#!/usr/bin/env python3
"""
Lithium Shopping waste negatives (2026-08-27 search-term pass).

Keeps 72V golf-cart queries (76V pack is valid fitment).
Blocks ebike / marine / trolling / scooter / generic EV-pack research
that leaked after the Aug 24 list.

  /Users/christopherray/.mcp-servers/mcp-google-ads/.venv/bin/python \
    scripts/ads/2026-08-27-lithium-waste-negatives.py [--apply]
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
LITHIUM_CAMPAIGN = f"customers/{CUSTOMER_ID}/campaigns/24175252534"

APPLY = "--apply" in sys.argv

# (match_type, text)
NEGATIVES = [
    ("PHRASE", "ebike"),
    ("PHRASE", "e-bike"),
    ("PHRASE", "e bike"),
    ("PHRASE", "trolling motor"),
    ("PHRASE", "marine battery"),
    ("PHRASE", "scooter"),
    ("EXACT", "ev battery packs"),
    ("EXACT", "lithium battery"),
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
    ops = [
        {
            "create": {
                "campaign": LITHIUM_CAMPAIGN,
                "negative": True,
                "keyword": {"matchType": match_type, "text": text},
            }
        }
        for match_type, text in NEGATIVES
    ]
    url = (
        f"https://googleads.googleapis.com/{API_VERSION}/"
        f"customers/{CUSTOMER_ID}/campaignCriteria:mutate"
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
    print(f"[{mode}] lithium waste negatives: OK ({len(ops)} ops)")
    for r in resp.json().get("results", []):
        if r.get("resourceName"):
            print(f"    -> {r['resourceName']}")


if __name__ == "__main__":
    print(f"Mode: {'APPLY' if APPLY else 'DRY RUN (validateOnly)'}\n")
    main()
    print("\nDone.")
