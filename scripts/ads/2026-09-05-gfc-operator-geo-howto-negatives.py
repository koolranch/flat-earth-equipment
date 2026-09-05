#!/usr/bin/env python3
"""
GFC Operator — Search: close the geo / how-to / foreign-phrasing leaks (2026-09-05).

Sep 4 clicked terms included "forklift certification long beach", "forklift
training tampa", "forklift training nashville", "forklift certification tulsa"
(5 clicks, $8.87) — in-person local intent. The Operator campaign already
carries all 50 state names and ~45 cities, but is missing the rest of the
Employer campaign's city list plus its research / content / foreign negatives.

Ported from GFC Employer (24158336820) → Operator (24184008234), minus:
  - Employer's EXACT head-term negatives ([forklift certification], [forklift
    license], ...) — those ARE the Operator campaign's intent.
  - Buyer-research phrases we want to keep: "how much", "how long", "renew my",
    "cheap", "card", "license", "exam", "test", "driver", equipment-type
    variants (reach truck, pallet jack, ...), "beginners".
Plus a top-metro fill for large US cities neither campaign had yet.

Run with the MCP server venv python:
  /Users/christopherray/.mcp-servers/mcp-google-ads/.venv/bin/python \
    scripts/ads/2026-09-05-gfc-operator-geo-howto-negatives.py [--apply]
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
OPERATOR = f"customers/{CUSTOMER_ID}/campaigns/24184008234"

APPLY = "--apply" in sys.argv

# Cities the Employer campaign blocks that Operator was missing (incl. the
# four that actually spent on Sep 4).
CITIES_FROM_EMPLOYER = [
    "albuquerque", "allentown", "anaheim", "arlington", "augusta", "baton rouge",
    "boston", "bronx", "brooklyn", "buffalo", "charleston", "charlotte", "columbia",
    "concord", "corpus christi", "detroit", "fontana", "fort lauderdale",
    "gainesville", "harrisburg", "indianapolis", "jackson", "long beach",
    "los angeles", "louisville", "miami", "milwaukee", "minneapolis", "murfreesboro",
    "nashville", "new orleans", "norfolk", "omaha", "orlando", "palmdale", "phoenix",
    "portland", "queens", "raleigh", "reno", "san francisco", "santa fe springs",
    "seattle", "shreveport", "spokane", "st louis", "stockton", "syracuse", "tacoma",
    "tampa", "tucson", "tulsa", "visalia", "west palm beach", "york pa",
    "nj", "nd",
]

# Large US metros neither campaign had. Local-class intent, same as above.
CITIES_TOP_METRO_FILL = [
    "san jose", "oakland", "cleveland", "pittsburgh", "st paul", "salt lake city",
    "oklahoma city", "mesa", "fort wayne", "toledo", "wichita", "little rock",
    "boise", "des moines", "grand rapids", "lexington", "knoxville", "chattanooga",
    "greensboro", "durham", "winston salem", "virginia beach", "newark",
    "jersey city", "providence", "hartford", "albany", "rochester", "honolulu",
    "anchorage", "laredo", "mcallen", "lubbock", "amarillo", "colorado springs",
    "tempe", "chandler", "glendale", "scottsdale", "henderson", "irvine",
    "santa ana", "ontario ca", "pomona", "ventura", "salinas", "chula vista",
    "spring", "pasadena", "garland", "irving", "plano", "arlington tx",
]

# Non-US phrasing / countries (Presence-only geo still lets these through when
# the searcher is physically in the US).
FOREIGN = [
    "ticket", "licence", "uk", "australia", "new zealand", "nz", "ireland",
    "adelaide", "tesda", "sertifikasi", "lesen", "pito",
]

# Research / content / test-prep phrasing (no purchase intent). Mirrors the
# existing "how to get" / "what is" / "where can i" negatives already live.
RESEARCH = [
    "how do i", "how do you", "how can i", "how does", "how to obtain",
    "how to check", "how to drive a forklift", "how old", "minimum age",
    "requirements to be", "what do i need", "what do you need", "what does it take",
    "where to", "where to get", "where do i", "where do you", "where can you",
    "can i get", "can you get", "is there", "is it", "best place", "learn to",
    "lookup", "reddit", "video", "powerpoint", "study guide", "pretest",
    "which of the following", "according to", "you must", "consists of",
]

# In-person schools / employers / competitors / OEM brand not yet blocked.
SCHOOLS_BRANDS = [
    "ivy tech", "keller", "liftoff", "atlas", "apft", "barclay", "barkly",
    "ryder", "united rental", "united rentals", "walmart", "salvation army",
    "mechanic", "technician", "jungheinrich",
]

NEGATIVES = [
    ("PHRASE", t)
    for t in CITIES_FROM_EMPLOYER + CITIES_TOP_METRO_FILL + FOREIGN + RESEARCH + SCHOOLS_BRANDS
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


def existing_negatives(headers):
    """Current Operator negatives so re-runs never submit duplicates."""
    url = (
        f"https://googleads.googleapis.com/{API_VERSION}"
        f"/customers/{CUSTOMER_ID}/googleAds:search"
    )
    query = (
        "SELECT campaign_criterion.keyword.text, campaign_criterion.keyword.match_type "
        "FROM campaign_criterion WHERE campaign.id = 24184008234 "
        "AND campaign_criterion.negative = TRUE AND campaign_criterion.type = 'KEYWORD'"
    )
    have = set()
    body = {"query": query}
    while True:
        resp = requests.post(url, headers=headers, json=body)
        resp.raise_for_status()
        data = resp.json()
        for row in data.get("results", []):
            kw = row["campaignCriterion"]["keyword"]
            have.add((kw["matchType"], kw["text"].lower()))
        token = data.get("nextPageToken")
        if not token:
            return have
        body["pageToken"] = token


def main():
    headers = get_headers()
    have = existing_negatives(headers)
    print(f"Operator currently has {len(have)} negative keywords\n")

    seen = set()
    ops = []
    for match_type, text in NEGATIVES:
        key = (match_type, text.lower())
        if key in seen:
            continue
        seen.add(key)
        if key in have:
            print(f"  skip (exists)  {match_type:6}  {text}")
            continue
        print(f"  OPERATOR       {match_type:6}  {text}")
        ops.append({
            "create": {
                "campaign": OPERATOR,
                "negative": True,
                "keyword": {"matchType": match_type, "text": text},
            }
        })

    if not ops:
        print("\nNothing to add.")
        return

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
        print(f"\n[{mode}] FAILED {resp.status_code}")
        print(json.dumps(resp.json(), indent=2)[:3000])
        sys.exit(1)
    print(f"\n[{mode}] Operator geo/how-to negatives: OK ({len(ops)} ops)")
    created = [r["resourceName"] for r in resp.json().get("results", []) if r.get("resourceName")]
    if created:
        print(f"    created {len(created)} criteria")


if __name__ == "__main__":
    print(f"Mode: {'APPLY' if APPLY else 'DRY RUN (validateOnly)'}\n")
    main()
    print("\nDone.")
