#!/usr/bin/env python3
"""
GFC Employer — Search: trial copy 7-day → 14-day, no card (2026-09-09).

Site + checkout moved to a 14-day no-card employer trial. Update the three
RSAs (headline "Free 7-Day Trial" and the one description that mentions the
7-day trial) and swap the "Free 7-Day Trial" callout for a 14-day/no-card one.
Budgets, keywords, and schedule unchanged.

  /Users/christopherray/.mcp-servers/mcp-google-ads/.venv/bin/python \
    scripts/ads/2026-09-09-gfc-employer-14day-no-card.py --apply
"""

import json
import os
import sys

MCP_DIR = "/Users/christopherray/.mcp-servers/mcp-google-ads"
sys.path.insert(0, MCP_DIR)

from dotenv import load_dotenv  # noqa: E402

load_dotenv(os.path.join(MCP_DIR, ".env"))

import requests  # noqa: E402
from google.auth.transport.requests import Request  # noqa: E402
from google.oauth2.credentials import Credentials  # noqa: E402

API_VERSION = "v24"
CUSTOMER_ID = "3466711027"
CAMPAIGN_ID = "24158336820"
CAMPAIGN = f"customers/{CUSTOMER_ID}/campaigns/{CAMPAIGN_ID}"
APPLY = "--apply" in sys.argv
BASE = f"https://googleads.googleapis.com/{API_VERSION}/customers/{CUSTOMER_ID}"

OLD_HEADLINE = "Free 7-Day Trial"
NEW_HEADLINE = "Free 14-Day Trial, No Card"  # 26 chars (limit 30)
OLD_DESC_FRAGMENT = "7-day free trial"
NEW_DESC = "Plans from $99/month for 10 seats. Free 14-day trial, no card, no sales call."  # 77 (limit 90)

OLD_CALLOUT_CAMPAIGN_ASSET = f"customers/{CUSTOMER_ID}/campaignAssets/{CAMPAIGN_ID}~411341218247~CALLOUT"
NEW_CALLOUT_TEXT = "14-Day Trial, No Card"  # 21 chars (limit 25)

assert len(NEW_HEADLINE) <= 30 and len(NEW_DESC) <= 90 and len(NEW_CALLOUT_TEXT) <= 25


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


def search(headers, query):
    body = {"query": query}
    rows = []
    while True:
        resp = requests.post(f"{BASE}/googleAds:search", headers=headers, json=body)
        resp.raise_for_status()
        data = resp.json()
        rows.extend(data.get("results", []))
        token = data.get("nextPageToken")
        if not token:
            return rows
        body["pageToken"] = token


def mutate(headers, path, operations, label):
    body = {"operations": operations}
    if not APPLY:
        body["validateOnly"] = True
    resp = requests.post(f"{BASE}/{path}", headers=headers, json=body)
    mode = "APPLY" if APPLY else "VALIDATE"
    if resp.status_code != 200:
        print(f"\n[{mode}] {label} FAILED {resp.status_code}")
        print(json.dumps(resp.json(), indent=2)[:4000])
        sys.exit(1)
    print(f"[{mode}] {label}: OK ({len(operations)} ops)")
    return resp.json()


def strip_asset_text(asset):
    # Keep only writable fields (text + pinnedField); drop performance/policy.
    out = {"text": asset["text"]}
    if asset.get("pinnedField"):
        out["pinnedField"] = asset["pinnedField"]
    return out


def update_rsas(headers):
    rows = search(
        headers,
        "SELECT ad_group_ad.ad.resource_name, ad_group_ad.ad.responsive_search_ad.headlines, "
        "ad_group_ad.ad.responsive_search_ad.descriptions FROM ad_group_ad "
        f"WHERE campaign.id = {CAMPAIGN_ID} AND ad_group_ad.status != 'REMOVED' "
        "AND ad_group_ad.ad.type = 'RESPONSIVE_SEARCH_AD'",
    )
    ops = []
    for row in rows:
        ad = row["adGroupAd"]["ad"]
        rsa = ad["responsiveSearchAd"]
        headlines = [strip_asset_text(h) for h in rsa["headlines"]]
        descriptions = [strip_asset_text(d) for d in rsa["descriptions"]]
        changed = False
        for h in headlines:
            if h["text"] == OLD_HEADLINE:
                h["text"] = NEW_HEADLINE
                changed = True
        for d in descriptions:
            if OLD_DESC_FRAGMENT in d["text"].lower():
                d["text"] = NEW_DESC
                changed = True
        if not changed:
            print(f"  skip (no 7-day copy) {ad['resourceName']}")
            continue
        print(f"  update {ad['resourceName']}")
        ops.append({
            "update": {
                "resourceName": ad["resourceName"],
                "responsiveSearchAd": {"headlines": headlines, "descriptions": descriptions},
            },
            "updateMask": "responsive_search_ad.headlines,responsive_search_ad.descriptions",
        })
    if ops:
        mutate(headers, "ads:mutate", ops, "RSA trial copy")
    else:
        print("No RSAs to update.")


def swap_callout(headers):
    existing = search(
        headers,
        "SELECT asset.resource_name, asset.callout_asset.callout_text FROM asset "
        "WHERE asset.type = 'CALLOUT'",
    )
    asset_rn = None
    for row in existing:
        if row["asset"].get("calloutAsset", {}).get("calloutText") == NEW_CALLOUT_TEXT:
            asset_rn = row["asset"]["resourceName"]
            print(f"  callout exists: {asset_rn}")
    if not asset_rn:
        result = mutate(
            headers,
            "assets:mutate",
            [{"create": {"calloutAsset": {"calloutText": NEW_CALLOUT_TEXT}}}],
            "create callout asset",
        )
        if not APPLY:
            print("  (dry run: campaign link + old callout removal would follow)")
            return
        asset_rn = result["results"][0]["resourceName"]
        print(f"  created callout: {asset_rn}")

    ops = [
        {"create": {"campaign": CAMPAIGN, "asset": asset_rn, "fieldType": "CALLOUT"}},
        {"remove": OLD_CALLOUT_CAMPAIGN_ASSET},
    ]
    mutate(headers, "campaignAssets:mutate", ops, "link new callout / unlink 7-day callout")


if __name__ == "__main__":
    print(f"Mode: {'APPLY' if APPLY else 'DRY RUN (validateOnly)'}\n")
    hdrs = get_headers()
    update_rsas(hdrs)
    swap_callout(hdrs)
    print("\nDone.")
