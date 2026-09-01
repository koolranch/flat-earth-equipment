#!/usr/bin/env python3
"""
Lithium Shopping: exclude 48V 65Ah + 36V 105Ah Item IDs (2026-09-01).

After 9 days (Aug 23-31) Lithium Golf Kits (24175252534) has 181 clicks,
$221 spend, zero sales AND zero Stripe checkout starts. Early trim per
the Aug 31 review, ahead of the per-Item kill lines:

  113-lr51v65ah   48V 65Ah   $42.29 of ~$90 kill (47%), smallest profit
                             (~$183) - would pause ~Sep 10 anyway
  113-lr38v105ah  36V 105Ah  worst CTR (0.41%), generic lead-acid
                             replacement queries, not kit buyers

Keepers run to their ~$230-250 lines: 72V 105Ah, 48V 120Ah, 48V 105Ah.

Note: listing-group UNIT criteria do not support status=PAUSED (the API
silently ignores it). The UI-equivalent of pausing a product group is
excluding it: remove the positive unit and recreate it as negative under
the same subdivision, in one atomic mutate.

Tree in "Demand kits" (ad group 199184571803):
  root subdivision 293946777986
    unit 113-lr51v65ah  2497685643971 (positive)  <- exclude
    unit 113-lr38v105ah 2497685644011 (positive)  <- exclude
    unit 113-lr51v105ah 2497685644051 (positive)  keep
    unit everything-else 294682000766 (negative)  keep

Run with the MCP server venv python:
  /Users/christopherray/.mcp-servers/mcp-google-ads/.venv/bin/python \
    scripts/ads/2026-09-01-lithium-pause-65ah-36v.py [--apply]
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
AD_GROUP_ID = "199184571803"
ROOT = f"customers/{CUSTOMER_ID}/adGroupCriteria/{AD_GROUP_ID}~293946777986"

APPLY = "--apply" in sys.argv

# (existing positive criterion id, product item id, note)
EXCLUSIONS = [
    ("2497685643971", "113-lr51v65ah", "48V 65Ah -> EXCLUDED"),
    ("2497685644011", "113-lr38v105ah", "36V 105Ah -> EXCLUDED"),
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
    for crit_id, item_id, note in EXCLUSIONS:
        print(f"  {item_id}: {note}")
        ops.append({
            "remove": f"customers/{CUSTOMER_ID}/adGroupCriteria/{AD_GROUP_ID}~{crit_id}"
        })
        ops.append({
            "create": {
                "adGroup": f"customers/{CUSTOMER_ID}/adGroups/{AD_GROUP_ID}",
                "negative": True,
                "listingGroup": {
                    "type": "UNIT",
                    "parentAdGroupCriterion": ROOT,
                    "caseValue": {"productItemId": {"value": item_id}},
                },
            }
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
    print(f"[{mode}] Lithium Item ID exclusions: OK ({len(ops)} ops)")
    for r in resp.json().get("results", []):
        if r.get("resourceName"):
            print(f"    -> {r['resourceName']}")


if __name__ == "__main__":
    print(f"Mode: {'APPLY' if APPLY else 'DRY RUN (validateOnly)'}\n")
    main()
    print("\nDone.")
