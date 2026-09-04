#!/usr/bin/env python3
"""
Tracks Shopping: block machine-sale queries (2026-09-04).

Thu Sep 3 click on RT-T190-400X86X49-C ($2.54) was "bobcats for sale" —
machine shopping, not tracks. Exact [bobcat] and phrase "used bobcat"
already exist; the plural + "for sale" slipped through.

Do not phrase-neg "for sale" alone (blocks "t190 tracks for sale").

Run with the MCP server venv python:
  /Users/christopherray/.mcp-servers/mcp-google-ads/.venv/bin/python \
    scripts/ads/2026-09-04-tracks-bobcat-for-sale-negatives.py [--apply]
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
TRACKS = f"customers/{CUSTOMER_ID}/campaigns/24146723448"

APPLY = "--apply" in sys.argv

# (match_type, text)
NEGATIVES = [
    ("PHRASE", "bobcats for sale"),
    ("PHRASE", "bobcat for sale"),
    ("PHRASE", "used bobcats"),
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
    for match_type, text in NEGATIVES:
        print(f"  TRACKS  {match_type:6}  {text}")
        ops.append({
            "create": {
                "campaign": TRACKS,
                "negative": True,
                "keyword": {"matchType": match_type, "text": text},
            }
        })
    url = (
        f"https://googleads.googleapis.com/{API_VERSION}"
        f"/customers/{CUSTOMER_ID}/campaignCriteria:mutate"
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
    print(f"[{mode}] Tracks machine-sale negatives: OK ({len(ops)} ops)")
    for r in resp.json().get("results", []):
        if r.get("resourceName"):
            print(f"    -> {r['resourceName']}")


if __name__ == "__main__":
    print(f"Mode: {'APPLY' if APPLY else 'DRY RUN (validateOnly)'}\n")
    main()
    print("\nDone.")
