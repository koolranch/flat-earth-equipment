#!/usr/bin/env python3
"""
High-Margin Parts Shopping (24175332700), 2026-10-02.

Pause the two ad groups that were spending on the wrong searches or a
quote-only page:
  - Bobcat 7123864 swivel (generic "swivel joint" queries)
  - JCB 332/X6237 joystick (Magnasource backorder, page is quote-only)

Add five Buy Now Item IDs, each in its own ad group with everything-else
negated. Bids sit under half of unit profit.

Does not change campaign budget, geo, network, or conversion goals.
Genie 52372 is not a JCB keep-set row; Merchant XML must include
g:id genie-52372-solenoid-proportional and be deployed before that ad serves.

Run:
  /Users/christopherray/.mcp-servers/mcp-google-ads/.venv/bin/python \
    scripts/ads/2026-10-02-highmargin-pause-and-add.py [--apply]
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

PAUSE = [
    ("202551558427", "Bobcat 7123864 swivel"),
    ("197382238297", "JCB 332/X6237 joystick"),
]

# (name, item id, cpc bid micros)
ADD = [
    ("JCB 716/C8932 throttle pedal", "716C8932", 500_000),
    ("JCB 320/08563 A/C compressor", "32008563", 800_000),
    ("Genie 52372 proportional solenoid", "genie-52372-solenoid-proportional", 800_000),
    ("JCB 15/M4039 brake caliper", "15M4039", 500_000),
    ("JCB 320/06165 EGR cooler", "32006165", 500_000),
]

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


def add_group(headers, name, item_id, bid):
    ag_names = mutate(
        headers,
        "adGroups",
        [
            {
                "create": {
                    "campaign": CAMPAIGN_RN,
                    "name": name,
                    "type": "SHOPPING_PRODUCT_ADS",
                    "status": "ENABLED",
                    "cpcBidMicros": str(bid),
                }
            }
        ],
        f"ad group '{name}'",
    )
    if not APPLY:
        print("    (dry run: listing tree skipped — need a real ad group id)")
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
                    "cpcBidMicros": str(bid),
                    "listingGroup": {
                        "type": "UNIT",
                        "parentAdGroupCriterion": root,
                        "caseValue": {"productItemId": {"value": item_id}},
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
        f"listing tree {item_id}",
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
        f"shopping product ad {item_id}",
    )


def main():
    headers = get_headers()
    print(f"Mode: {'APPLY' if APPLY else 'DRY RUN (validateOnly)'}\n")

    mutate(
        headers,
        "adGroups",
        [
            {
                "update": {
                    "resourceName": f"customers/{CUSTOMER_ID}/adGroups/{ag_id}",
                    "status": "PAUSED",
                },
                "updateMask": "status",
            }
            for ag_id, _name in PAUSE
        ],
        "pause swivel + joystick",
    )

    for name, item_id, bid in ADD:
        add_group(headers, name, item_id, bid)


if __name__ == "__main__":
    main()
    print("\nDone.")
