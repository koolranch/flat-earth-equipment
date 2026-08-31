#!/usr/bin/env python3
"""
Search-term negative pass (2026-08-31).

Operator Search is an intentional $49 test — do not pause it and do not
block head terms (forklift certification / training / license). Add the
in-person, Canada, and how-to leaks that still matched this morning.

Also add leftover Shopping waste from the last 7 days. Navitas queries
are on-intent (keep motor-upgrade); no Navitas changes.

  /Users/christopherray/.mcp-servers/mcp-google-ads/.venv/bin/python \
    scripts/ads/2026-08-31-search-term-negatives.py [--apply]
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

OPERATOR = f"customers/{CUSTOMER_ID}/campaigns/24184008234"
EMPLOYER = f"customers/{CUSTOMER_ID}/campaigns/24158336820"
LITHIUM = f"customers/{CUSTOMER_ID}/campaigns/24175252534"
TRACKS = f"customers/{CUSTOMER_ID}/campaigns/24146723448"
CHARGERS = f"customers/{CUSTOMER_ID}/campaigns/24175330522"
HIGH_MARGIN = f"customers/{CUSTOMER_ID}/campaigns/24175332700"

# (campaign, match_type, text) — skip any already on the campaign.
KEYWORD_NEGATIVES = [
    # Operator: informational / in-person / Canada. Keep cert/training/license.
    (OPERATOR, "PHRASE", "how to be"),
    (OPERATOR, "PHRASE", "how to become"),
    (OPERATOR, "PHRASE", "how to get"),
    (OPERATOR, "PHRASE", "hands on"),
    (OPERATOR, "PHRASE", "classroom"),
    (OPERATOR, "PHRASE", "community college"),
    (OPERATOR, "PHRASE", "union"),
    (OPERATOR, "PHRASE", "one day"),
    (OPERATOR, "PHRASE", "canada"),
    (OPERATOR, "PHRASE", "toronto"),
    (OPERATOR, "PHRASE", "vancouver"),
    (OPERATOR, "PHRASE", "calgary"),
    (OPERATOR, "PHRASE", "edmonton"),
    (OPERATOR, "PHRASE", "montreal"),
    (OPERATOR, "PHRASE", "ontario"),
    (OPERATOR, "PHRASE", "surrey"),
    (OPERATOR, "PHRASE", "fargo"),
    (OPERATOR, "PHRASE", "cincinnati"),
    (OPERATOR, "PHRASE", "lawrenceville"),
    (OPERATOR, "PHRASE", "what is"),
    (OPERATOR, "PHRASE", "where can i"),
    # Employer: Fargo leaked (ND is already on the list; "nd" is not).
    (EMPLOYER, "PHRASE", "fargo"),
    (EMPLOYER, "PHRASE", "canada"),
    # Lithium: generic / wrong-use leftovers. Keep 72V golf-cart queries.
    (LITHIUM, "EXACT", "batterie lithium"),
    (LITHIUM, "EXACT", "battery lithium"),
    (LITHIUM, "EXACT", "ev batteries"),
    (LITHIUM, "EXACT", "48v battery"),
    (LITHIUM, "EXACT", "48 volt battery"),
    (LITHIUM, "EXACT", "32 volt lithium battery"),
    (LITHIUM, "EXACT", "lithium batteries for"),
    (LITHIUM, "PHRASE", "inverter"),
    (LITHIUM, "PHRASE", "trojan"),
    (LITHIUM, "PHRASE", "topmaq"),
    # Tracks: machine / local-dealer / tractor / wrong-model. Do not
    # phrase-neg "for sale" (blocks "t190 tracks for sale").
    (TRACKS, "PHRASE", "near me"),
    (TRACKS, "PHRASE", "open now"),
    (TRACKS, "PHRASE", "tractor"),
    (TRACKS, "PHRASE", "turbo"),
    (TRACKS, "PHRASE", "specs"),
    (TRACKS, "PHRASE", "t250"),
    (TRACKS, "PHRASE", "accesorios"),
    (TRACKS, "PHRASE", "minicargador"),
    (TRACKS, "PHRASE", "cerca de mi"),
    (TRACKS, "PHRASE", "cerca de mí"),
    (TRACKS, "PHRASE", "shoup"),
    (TRACKS, "PHRASE", "price of"),
    (TRACKS, "PHRASE", "used bobcat"),
    (TRACKS, "EXACT", "bobcat"),
    (TRACKS, "EXACT", "bobcat machine"),
    (TRACKS, "EXACT", "bobcat equipment"),
    (TRACKS, "EXACT", "john deere 50"),
    # Chargers: whole-charger queries (exact so module/PN still match).
    (CHARGERS, "EXACT", "forklift lithium battery charger"),
    (CHARGERS, "EXACT", "hyster battery charger"),
    (CHARGERS, "EXACT", "electric forklift charger"),
    (CHARGERS, "EXACT", "hyster forklift charger"),
    (CHARGERS, "EXACT", "enersys charger"),
    (CHARGERS, "EXACT", "hawker charger"),
    (CHARGERS, "PHRASE", "cargador de montacargas"),
    (CHARGERS, "PHRASE", "cargador para montacargas"),
    # High-Margin: machine / local / attachment browsers.
    (HIGH_MARGIN, "PHRASE", "near me"),
    (HIGH_MARGIN, "PHRASE", "for sale"),
    (HIGH_MARGIN, "PHRASE", "attachments"),
    (HIGH_MARGIN, "PHRASE", "rebuild"),
    (HIGH_MARGIN, "EXACT", "bobcat excavator"),
]

# Canada location negative — US Presence-or-interest still leaks CA queries.
LOCATION_NEGATIVES = [
    (OPERATOR, "geoTargetConstants/2124"),
    (EMPLOYER, "geoTargetConstants/2124"),
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


def mutate(headers, operations, label):
    url = (
        f"https://googleads.googleapis.com/{API_VERSION}"
        f"/customers/{CUSTOMER_ID}/campaignCriteria:mutate"
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
    print(f"[{mode}] {label}: OK ({len(operations)} ops)")
    for r in resp.json().get("results", []):
        if r.get("resourceName"):
            print(f"    -> {r['resourceName']}")


def main():
    headers = get_headers()
    kw_ops = []
    for campaign, match_type, text in KEYWORD_NEGATIVES:
        print(f"  KW  {campaign.split('/')[-1]}  {match_type:6}  {text}")
        kw_ops.append({
            "create": {
                "campaign": campaign,
                "negative": True,
                "keyword": {"matchType": match_type, "text": text},
            }
        })
    loc_ops = []
    for campaign, geo in LOCATION_NEGATIVES:
        print(f"  GEO {campaign.split('/')[-1]}  negative  {geo}")
        loc_ops.append({
            "create": {
                "campaign": campaign,
                "negative": True,
                "location": {"geoTargetConstant": geo},
            }
        })
    mutate(headers, kw_ops, "search-term keyword negatives")
    mutate(headers, loc_ops, "Canada location negatives")


if __name__ == "__main__":
    print(f"Mode: {'APPLY' if APPLY else 'DRY RUN (validateOnly)'}\n")
    main()
    print("\nDone.")
