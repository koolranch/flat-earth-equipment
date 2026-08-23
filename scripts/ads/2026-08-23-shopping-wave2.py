#!/usr/bin/env python3
"""
Wave 2 Shopping rollout (2026-08-23), following the wave-1 launch:

1. "Charger Modules Shopping" ($10/day):
   - "6LA20671" ad group: Hawker + Enersys reman at $0.75 CPC
     (~$153 effective unit profit after $526 cost, ~$40 freight, ~$30 core admin)
   - "ACT Quantum" ad group: 36/48/80V reman at $1.10 CPC
     (~$217 effective after $513 cost)
2. "High-Margin Parts Shopping" ($10/day):
   - Bobcat 7123864 swivel at $1.50 CPC (known $388 unit profit)
   - Tennant TN9008999 gearbox at $0.75 CPC (proxy ~13% margin -> ~$290)
   - Skytrack 70021617 cylinder at $0.60 CPC (proxy ~13% margin -> ~$225)
   Proxy bids use the observed 13-14% margin on same-batch known-cost
   free-freight TVH items; true costs replace proxies at first PO.

Same guardrails as wave 1: standard Shopping, manual CPC, US presence-only,
Google Search only, listing groups by Item ID with everything-else negated,
campaign priority 0, merchant 5572526006. Created PAUSED, then ENABLED.

Run with the MCP server venv python:
  /Users/christopherray/.mcp-servers/mcp-google-ads/.venv/bin/python \
    scripts/ads/2026-08-23-shopping-wave2.py [--apply]
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
MERCHANT_ID = "5572526006"
US_GEO = "geoTargetConstants/2840"

APPLY = "--apply" in sys.argv


def get_headers():
    # credentials.json is the file the MCP server actively refreshes.
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


HEADERS = get_headers()


def mutate(service, operations, label):
    url = f"https://googleads.googleapis.com/{API_VERSION}/customers/{CUSTOMER_ID}/{service}:mutate"
    body = {"operations": operations}
    if not APPLY:
        body["validateOnly"] = True
    resp = requests.post(url, headers=HEADERS, json=body)
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


def build_listing_tree(ad_group_rn, items_with_bids, label):
    root = crit(ad_group_rn, -1)
    ops = [{
        "create": {
            "resourceName": root,
            "adGroup": ad_group_rn,
            "status": "ENABLED",
            "listingGroup": {"type": "SUBDIVISION"},
        }
    }]
    for item_id, bid_micros in items_with_bids:
        ops.append({
            "create": {
                "adGroup": ad_group_rn,
                "status": "ENABLED",
                "cpcBidMicros": str(bid_micros),
                "listingGroup": {
                    "type": "UNIT",
                    "parentAdGroupCriterion": root,
                    "caseValue": {"productItemId": {"value": item_id}},
                },
            }
        })
    ops.append({
        "create": {
            "adGroup": ad_group_rn,
            "negative": True,
            "listingGroup": {
                "type": "UNIT",
                "parentAdGroupCriterion": root,
                "caseValue": {"productItemId": {}},
            },
        }
    })
    mutate("adGroupCriteria", ops, f"listing tree: {label}")


CAMPAIGNS = [
    {
        "name": "Charger Modules Shopping",
        "daily_budget_micros": 10_000_000,
        "ad_groups": [
            {
                "name": "6LA20671",
                "bid": 750_000,
                "items": [
                    "charger-hawker-6la20671-reman",
                    "charger-enersys-6la20671-reman",
                ],
            },
            {
                "name": "ACT Quantum",
                "bid": 1_100_000,
                "items": [
                    "charger-act-quantum-36vdc-reman",
                    "charger-act-quantum-48vdc-reman",
                    "charger-act-quantum-80vdc-reman",
                ],
            },
        ],
    },
    {
        "name": "High-Margin Parts Shopping",
        "daily_budget_micros": 10_000_000,
        "ad_groups": [
            {"name": "Bobcat 7123864 swivel", "bid": 1_500_000, "items": ["7123864"]},
            {"name": "Tennant 9008999 gearbox", "bid": 750_000, "items": ["tn9008999"]},
            {"name": "Skytrack 70021617 cylinder", "bid": 600_000, "items": ["70021617"]},
        ],
    },
]


def main():
    created = []
    for spec in CAMPAIGNS:
        budget_names = mutate("campaignBudgets", [{
            "create": {
                "name": f"{spec['name']} budget",
                "amountMicros": str(spec["daily_budget_micros"]),
                "deliveryMethod": "STANDARD",
                "explicitlyShared": False,
            }
        }], f"budget for '{spec['name']}'")
        if not APPLY:
            print(f"    (dry run: campaign '{spec['name']}' chain skipped — needs real budget id)")
            continue
        campaign_names = mutate("campaigns", [{
            "create": {
                "name": spec["name"],
                "advertisingChannelType": "SHOPPING",
                "status": "PAUSED",
                "containsEuPoliticalAdvertising": "DOES_NOT_CONTAIN_EU_POLITICAL_ADVERTISING",
                "manualCpc": {"enhancedCpcEnabled": False},
                "campaignBudget": budget_names[0],
                "shoppingSetting": {
                    "merchantId": MERCHANT_ID,
                    "campaignPriority": 0,
                },
                "networkSettings": {
                    "targetGoogleSearch": True,
                    "targetSearchNetwork": False,
                    "targetContentNetwork": False,
                    "targetPartnerSearchNetwork": False,
                },
                "geoTargetTypeSetting": {"positiveGeoTargetType": "PRESENCE"},
            }
        }], f"campaign '{spec['name']}' (PAUSED)")
        campaign_rn = campaign_names[0]
        mutate("campaignCriteria", [{
            "create": {
                "campaign": campaign_rn,
                "location": {"geoTargetConstant": US_GEO},
            }
        }], f"US geo on '{spec['name']}'")
        for ag_spec in spec["ad_groups"]:
            ag_names = mutate("adGroups", [{
                "create": {
                    "campaign": campaign_rn,
                    "name": ag_spec["name"],
                    "type": "SHOPPING_PRODUCT_ADS",
                    "status": "ENABLED",
                    "cpcBidMicros": str(ag_spec["bid"]),
                }
            }], f"ad group '{ag_spec['name']}'")
            ag = ag_names[0]
            build_listing_tree(
                ag,
                [(i, ag_spec["bid"]) for i in ag_spec["items"]],
                f"{spec['name']} / {ag_spec['name']}",
            )
            mutate("adGroupAds", [{
                "create": {
                    "adGroup": ag,
                    "status": "ENABLED",
                    "ad": {"shoppingProductAd": {}},
                }
            }], f"shopping product ad: {ag_spec['name']}")
        created.append(campaign_rn)
    if APPLY and created:
        mutate("campaigns", [{
            "update": {"resourceName": rn, "status": "ENABLED"},
            "updateMask": "status",
        } for rn in created], "enable wave-2 campaigns")


if __name__ == "__main__":
    print(f"Mode: {'APPLY' if APPLY else 'DRY RUN (validateOnly)'}\n")
    main()
    print("\nDone.")
