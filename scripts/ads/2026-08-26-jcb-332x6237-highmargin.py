#!/usr/bin/env python3
"""
Add JCB 332/X6237 joystick to High-Margin Parts Shopping (24175332700).

New ad group + Item ID listing tree (everything-else negated), same structure
as the swivel / Tennant / Skytrack groups. CPC $1.25 under ~$389 unit profit
($1699 sell − $1310.40 cost, TVH prepaid free freight). Mag floor $1721.71.

Does not change campaign budget, geo, network, or conversion goals.

Run:
  /Users/christopherray/.mcp-servers/mcp-google-ads/.venv/bin/python \
    scripts/ads/2026-08-26-jcb-332x6237-highmargin.py [--apply]
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
CAMPAIGN_RN = "customers/3466711027/campaigns/24175332700"
ITEM_ID = "332X6237"
BID_MICROS = 1_250_000
AG_NAME = "JCB 332/X6237 joystick"
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
    results = resp.json().get("results", [])
    names = [r.get("resourceName", "") for r in results]
    print(f"[{mode}] {label}: OK ({len(operations)} ops)")
    for n in names:
        if n:
            print(f"    -> {n}")
    return names


def crit(ad_group_rn, temp_id):
    return f"{ad_group_rn.replace('adGroups', 'adGroupCriteria')}~{temp_id}"


def main():
    headers = get_headers()
    print(f"Mode: {'APPLY' if APPLY else 'DRY RUN (validateOnly)'}\n")

    ag_names = mutate(
        headers,
        "adGroups",
        [
            {
                "create": {
                    "campaign": CAMPAIGN_RN,
                    "name": AG_NAME,
                    "type": "SHOPPING_PRODUCT_ADS",
                    "status": "ENABLED",
                    "cpcBidMicros": str(BID_MICROS),
                }
            }
        ],
        f"ad group '{AG_NAME}'",
    )
    if not APPLY:
        print("    (dry run: listing tree + product ad skipped — need real ad group id)")
        return

    ad_group_rn = ag_names[0]
    root = crit(ad_group_rn, -1)
    mutate(
        headers,
        "adGroupCriteria",
        [
            {
                "create": {
                    "resourceName": root,
                    "adGroup": ad_group_rn,
                    "status": "ENABLED",
                    "listingGroup": {"type": "SUBDIVISION"},
                }
            },
            {
                "create": {
                    "adGroup": ad_group_rn,
                    "status": "ENABLED",
                    "cpcBidMicros": str(BID_MICROS),
                    "listingGroup": {
                        "type": "UNIT",
                        "parentAdGroupCriterion": root,
                        "caseValue": {"productItemId": {"value": ITEM_ID}},
                    },
                }
            },
            {
                "create": {
                    "adGroup": ad_group_rn,
                    "negative": True,
                    "listingGroup": {
                        "type": "UNIT",
                        "parentAdGroupCriterion": root,
                        "caseValue": {"productItemId": {}},
                    },
                }
            },
        ],
        f"listing tree {ITEM_ID}",
    )
    mutate(
        headers,
        "adGroupAds",
        [
            {
                "create": {
                    "adGroup": ad_group_rn,
                    "status": "ENABLED",
                    "ad": {"shoppingProductAd": {}},
                }
            }
        ],
        "shopping product ad",
    )


if __name__ == "__main__":
    main()
    print("\nDone.")
