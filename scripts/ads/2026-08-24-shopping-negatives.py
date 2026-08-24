#!/usr/bin/env python3
"""
First negative-keyword pass on the Shopping campaigns (2026-08-24), based on
the initial search-terms report:

- Charger Modules (24175330522): all matched queries so far are whole-charger
  queries, not module/PN queries. EXACT negatives on the generic head terms
  (exact, not phrase, so "forklift charger module" and PN queries still match).
- Navitas Kits (24170389196): kits fit electric carts only — block gas-cart
  queries.
- Lithium Golf Kits (24175252534): block non-golf-cart applications and a
  voltage we do not sell.

Run with the MCP server venv python:
  /Users/christopherray/.mcp-servers/mcp-google-ads/.venv/bin/python \
    scripts/ads/2026-08-24-shopping-negatives.py [--apply]
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

CHARGER_CAMPAIGN = f"customers/{CUSTOMER_ID}/campaigns/24175330522"
NAVITAS_CAMPAIGN = f"customers/{CUSTOMER_ID}/campaigns/24170389196"
LITHIUM_CAMPAIGN = f"customers/{CUSTOMER_ID}/campaigns/24175252534"

# (campaign, match_type, text)
NEGATIVES = [
    # Charger modules: generic whole-charger queries. EXACT so that
    # "forklift charger module", "hawker charger module", and PN queries
    # keep matching.
    (CHARGER_CAMPAIGN, "EXACT", "forklift charger"),
    (CHARGER_CAMPAIGN, "EXACT", "forklift chargers"),
    (CHARGER_CAMPAIGN, "EXACT", "forklift battery charger"),
    (CHARGER_CAMPAIGN, "EXACT", "forklift battery chargers"),
    (CHARGER_CAMPAIGN, "EXACT", "used forklift charger"),
    (CHARGER_CAMPAIGN, "EXACT", "cargador de baterias de montacargas"),
    (CHARGER_CAMPAIGN, "EXACT", "golf cart battery charger"),
    (CHARGER_CAMPAIGN, "EXACT", "car battery charger"),
    # Navitas: electric-cart kits only.
    (NAVITAS_CAMPAIGN, "PHRASE", "carbureted"),
    (NAVITAS_CAMPAIGN, "PHRASE", "gas golf cart"),
    (NAVITAS_CAMPAIGN, "PHRASE", "gas powered golf cart"),
    # Lithium: wrong applications / voltages we do not sell.
    (LITHIUM_CAMPAIGN, "PHRASE", "motos electricas"),
    (LITHIUM_CAMPAIGN, "PHRASE", "motorcycle"),
    (LITHIUM_CAMPAIGN, "EXACT", "ev battery"),
    (LITHIUM_CAMPAIGN, "EXACT", "solid state lithium battery"),
    (LITHIUM_CAMPAIGN, "EXACT", "96 volt lithium ion battery"),
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
    ops = [{
        "create": {
            "campaign": campaign,
            "negative": True,
            "keyword": {"matchType": match_type, "text": text},
        }
    } for campaign, match_type, text in NEGATIVES]
    url = f"https://googleads.googleapis.com/{API_VERSION}/customers/{CUSTOMER_ID}/campaignCriteria:mutate"
    body = {"operations": ops}
    if not APPLY:
        body["validateOnly"] = True
    resp = requests.post(url, headers=headers, json=body)
    mode = "APPLY" if APPLY else "VALIDATE"
    if resp.status_code != 200:
        print(f"[{mode}] FAILED {resp.status_code}")
        print(json.dumps(resp.json(), indent=2)[:3000])
        sys.exit(1)
    print(f"[{mode}] negative keywords: OK ({len(ops)} ops)")
    for r in resp.json().get("results", []):
        if r.get("resourceName"):
            print(f"    -> {r['resourceName']}")


if __name__ == "__main__":
    print(f"Mode: {'APPLY' if APPLY else 'DRY RUN (validateOnly)'}\n")
    main()
    print("\nDone.")
