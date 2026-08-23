#!/usr/bin/env python3
"""
Wave 1 Shopping rollout (2026-08-23), per the profit-tiered plan:

1. Re-bid the 3 live units on campaign 24146723448 (Rubber Tracks Shopping T190)
   to profit-derived ceilings. This bid edit also forces Google to re-evaluate
   the stuck MOST_ADS_UNDER_REVIEW state.
2. Add ad group "JD G-series C-pattern" (3 John Deere track SKUs, $1.00 CPC)
   to the same campaign.
3. Create "Lithium Golf Kits Shopping" ($25/day) and "Navitas Kits Shopping"
   ($10/day) as standard Shopping, manual CPC, US-only presence, Google Search
   network only, listing groups subdivided by Item ID with everything-else
   negated. Created PAUSED, verified, then ENABLED.

Charger modules are wave 2 (after wave 1 serves) per the core-handling plan.

Auth reuses the local Google Ads MCP server's credentials (.env + token.json
in ~/.mcp-servers/mcp-google-ads). Run with that server's venv python:

  /Users/christopherray/.mcp-servers/mcp-google-ads/.venv/bin/python \
    scripts/ads/2026-08-23-shopping-wave1.py [--apply]

Without --apply it runs every mutate with validate_only=true (dry run).
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
TRACKS_CAMPAIGN_ID = "24146723448"
US_GEO = "geoTargetConstants/2840"

APPLY = "--apply" in sys.argv
SKIP_STEPS_1_2 = "--skip-steps-1-2" in sys.argv

# Budgets already created by a prior partial run (reused instead of recreated).
EXISTING_BUDGETS = {
    "Lithium Golf Kits Shopping": "customers/3466711027/campaignBudgets/15811729562",
}


def get_headers():
    # credentials.json is the file the MCP server actively refreshes;
    # token.json holds a stale, superseded refresh token.
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
    """Call a per-resource mutate endpoint, honoring the dry-run flag."""
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


# ---------------------------------------------------------------------------
# Step 1 — re-bid the three live units (profit-derived ceilings; forces review)
# ---------------------------------------------------------------------------
BID_UPDATES = [
    # (ad_group_id~criterion_id, new bid micros, note)
    ("201844036280~2497536964055", 1_750_000, "rt-t190-400x86x49-c -> $1.75"),
    ("201844036280~2497917345058", 1_300_000, "rt-t190-320x86x49-c -> $1.30"),
    ("199818139816~2495896741110", 1_300_000, "rt-320x86x52-c -> $1.30"),
]


def step1_rebid():
    ops = []
    for cid, micros, _note in BID_UPDATES:
        ops.append({
            "update": {
                "resourceName": f"customers/{CUSTOMER_ID}/adGroupCriteria/{cid}",
                "cpcBidMicros": str(micros),
            },
            "updateMask": "cpc_bid_micros",
        })
    mutate("adGroupCriteria", ops, "Step 1: re-bid live T190/T650 units")


# ---------------------------------------------------------------------------
# Step 2 — JD G-series ad group inside the existing tracks campaign
# ---------------------------------------------------------------------------
JD_ITEMS = ["rt-317g-320x86x50-c", "rt-325g-320x86x52-c", "rt-317g-400x86x50-c"]


def build_ad_group(campaign_rn, name, default_bid_micros):
    names = mutate("adGroups", [{
        "create": {
            "campaign": campaign_rn,
            "name": name,
            "type": "SHOPPING_PRODUCT_ADS",
            "status": "ENABLED",
            "cpcBidMicros": str(default_bid_micros),
        }
    }], f"ad group '{name}'")
    if not APPLY:
        return None
    return names[0]


def build_listing_tree(ad_group_rn, items_with_bids, label):
    """Root subdivision -> one UNIT per item id (bid) + everything-else negative."""
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


def build_shopping_ad(ad_group_rn, label):
    mutate("adGroupAds", [{
        "create": {
            "adGroup": ad_group_rn,
            "status": "ENABLED",
            "ad": {"shoppingProductAd": {}},
        }
    }], f"shopping product ad: {label}")


def step2_jd_ad_group():
    campaign_rn = f"customers/{CUSTOMER_ID}/campaigns/{TRACKS_CAMPAIGN_ID}"
    ag = build_ad_group(campaign_rn, "JD G-series C-pattern", 1_000_000)
    if not APPLY:
        print("    (dry run: listing tree + ad skipped — need real ad group id)")
        return
    build_listing_tree(ag, [(i, 1_000_000) for i in JD_ITEMS], "JD G-series")
    build_shopping_ad(ag, "JD G-series")


# ---------------------------------------------------------------------------
# Step 3 — new campaigns (Lithium, Navitas)
# ---------------------------------------------------------------------------
NEW_CAMPAIGNS = [
    {
        "name": "Lithium Golf Kits Shopping",
        "daily_budget_micros": 25_000_000,
        "ad_groups": [
            {
                "name": "Demand kits",
                "bid": 1_500_000,
                "items": ["113-lr51v65ah", "113-lr38v105ah", "113-lr51v105ah"],
            },
            {
                "name": "High capacity",
                "bid": 1_250_000,
                "items": ["113-lr51v120ah", "113-lr76v105ah"],
            },
        ],
    },
    {
        "name": "Navitas Kits Shopping",
        "daily_budget_micros": 10_000_000,
        "ad_groups": [
            {
                "name": "TAC2 Yamaha",
                "bid": 1_000_000,
                "items": ["64-navyamtac2-g29-4"],
            },
            {
                "name": "TAC3 850A",
                "bid": 2_000_000,
                "items": [
                    "222-48vcantxttac33850-7",
                    "222-48vcancctac3850-7",
                    "222-48vcanyamtac3850-7",
                ],
            },
        ],
    },
]


def step3_new_campaigns():
    created = []
    for spec in NEW_CAMPAIGNS:
        if spec["name"] in EXISTING_BUDGETS:
            budget_names = [EXISTING_BUDGETS[spec["name"]]]
            print(f"[reuse] budget for '{spec['name']}': {budget_names[0]}")
        else:
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
                # Required in v24; we run US-only with no political content.
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
            ag = build_ad_group(campaign_rn, ag_spec["name"], ag_spec["bid"])
            build_listing_tree(
                ag,
                [(i, ag_spec["bid"]) for i in ag_spec["items"]],
                f"{spec['name']} / {ag_spec['name']}",
            )
            build_shopping_ad(ag, f"{spec['name']} / {ag_spec['name']}")
        created.append(campaign_rn)
    return created


def step4_enable(campaign_rns):
    if not campaign_rns:
        return
    ops = [{
        "update": {"resourceName": rn, "status": "ENABLED"},
        "updateMask": "status",
    } for rn in campaign_rns]
    mutate("campaigns", ops, "Step 4: enable new campaigns")


if __name__ == "__main__":
    print(f"Mode: {'APPLY' if APPLY else 'DRY RUN (validateOnly)'}\n")
    if SKIP_STEPS_1_2:
        print("(skipping steps 1-2 — already applied)\n")
    else:
        step1_rebid()
        step2_jd_ad_group()
    created = step3_new_campaigns()
    if APPLY:
        step4_enable(created)
    print("\nDone.")
