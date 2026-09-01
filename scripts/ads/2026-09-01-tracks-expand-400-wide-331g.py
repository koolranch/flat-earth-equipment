#!/usr/bin/env python3
"""
Tracks Shopping: add T550/T590 400-wide + JD 331G Item IDs (2026-09-01).

Comp research (Sep 1) showed the 400x86x49 C card at $949 is the cheapest
mainstream offer (Grizzly $1,095-1,100, Fortis $1,149, Prowler $1,165) with
$331 unit profit ($618.06 cost). The identical vendor part serves T550 and
T590, so those Item IDs join the T190 ad group at the same $2.65 break-even
bid to triple the query surface at zero pricing risk. (Supersedes the
earlier "do not add T550/T590 400" test-scoping note - user approved.)

JD 331G 450x86x58 C ($1,350 cost, $1,649 sell, ~$299 profit) had an organic
abandoned cart at full price on Aug 29. Bid $1.55 uses the tax-haircut
profit (~$200, ~$100 kill line) until multistate resale certs are filed.

The narrow 320s stay as-is: comps sell at $861-935 vs our $800 cost, so
they cannot win Shopping profitably.

Run with the MCP server venv python:
  /Users/christopherray/.mcp-servers/mcp-google-ads/.venv/bin/python \
    scripts/ads/2026-09-01-tracks-expand-400-wide-331g.py [--apply]
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

# (ad_group_id, root_criterion_id, product_item_id, bid_micros, note)
ADDITIONS = [
    ("201844036280", "293946777986", "rt-t550-400x86x49-c", 2_650_000,
     "T550 400 C $949 (same PN as T190 400) @ $2.65"),
    ("201844036280", "293946777986", "rt-t590-400x86x49-c", 2_650_000,
     "T590 400 C $949 (same PN as T190 400) @ $2.65"),
    ("198753051799", "293946777986", "rt-331g-450x86x58-c", 1_550_000,
     "JD 331G 450x86x58 C $1649 @ $1.55 (tax-haircut ceiling)"),
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
    for ad_group_id, root_id, item_id, bid_micros, note in ADDITIONS:
        print(f"  {note}")
        ops.append({
            "create": {
                "adGroup": f"customers/{CUSTOMER_ID}/adGroups/{ad_group_id}",
                "status": "ENABLED",
                "cpcBidMicros": str(bid_micros),
                "listingGroup": {
                    "type": "UNIT",
                    "parentAdGroupCriterion": (
                        f"customers/{CUSTOMER_ID}/adGroupCriteria/{ad_group_id}~{root_id}"
                    ),
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
    print(f"[{mode}] Tracks Item ID additions: OK ({len(ops)} ops)")
    for r in resp.json().get("results", []):
        if r.get("resourceName"):
            print(f"    -> {r['resourceName']}")


if __name__ == "__main__":
    print(f"Mode: {'APPLY' if APPLY else 'DRY RUN (validateOnly)'}\n")
    main()
    print("\nDone.")
