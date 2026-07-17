#!/usr/bin/env python3
"""Pull live RI solicitations for the weekly outreach cadence.

Sources:
  1. OSP (Ocean State Procures) — public full-text-search API that backs the
     public Bid Board at ridop.ri.gov (WebProcure/Proactis, customerid=46).
  2. RIVIP external listings — municipalities, school districts, and
     quasi-publics, via the public ExternalBidSearch form postback.

Both endpoints are public (no login, no scraping of protected content).
Output: CSV rows on stdout matching tracker/opportunities.csv column order —
review manually and paste qualifying rows into the tracker.

Usage:  python3 pull_opportunities.py [osp|rivip|all]
"""

import csv
import datetime
import io
import json
import re
import ssl
import sys
import urllib.parse
import urllib.request

# State portals present valid public certs; ignore local trust-store gaps.
CTX = ssl.create_default_context()
CTX.check_hostname = False
CTX.verify_mode = ssl.CERT_NONE

OSP_SEARCH = (
    "https://webprocure.proactiscloud.com/wp-full-text-search/search/sols"
    "?customerid=46&q=*&from={frm}&sort=&f=ps%3DOpen&oids="
)
OSP_BOARD_URL = (
    "https://webprocure.proactiscloud.com/wp-web-public/en/#/bidboard/search"
    "?customerid=46&oid=-1"
)
RIVIP_SEARCH = "https://purchasing.ri.gov/bidding/externalbidsearch.aspx"
RIVIP_LISTING = "https://purchasing.ri.gov/bidding/ExternalBidListing.aspx"


def get(url, data=None, headers=None):
    req = urllib.request.Request(url, data=data, headers=headers or {})
    with urllib.request.urlopen(req, context=CTX, timeout=30) as r:
        return r.read().decode("utf-8", "replace")


def ts(ms):
    if not ms:
        return ""
    return datetime.datetime.fromtimestamp(ms / 1000).strftime("%Y-%m-%d")


def pull_osp():
    rows, frm, seen = [], 0, set()
    while True:
        d = json.loads(get(OSP_SEARCH.format(frm=frm), headers={"Accept": "application/json"}))
        recs = d.get("records") or []
        for r in recs:
            n = r.get("bidNumber")
            if n in seen:
                continue
            seen.add(n)
            typ = (r.get("orgBidClassType") or {}).get("description") or ""
            # Skip open-enrollment master lists; RFP/RFQ/QLV are the outreach targets.
            if not typ.startswith(("Request", "Qualified", "RIDOT")):
                continue
            rows.append({
                "solicitation_number": n,
                "title": (r.get("title") or "").strip(),
                "buyer": (r.get("creatorOrg") or {}).get("name") or "",
                "source": "OSP Bid Board",
                "url": OSP_BOARD_URL,
                # openDate = bid opening (submission deadline); collabEndDate = Q&A close
                "deadline": ts(r.get("openDate")),
                "questions_deadline": ts(r.get("collabEndDate")),
                "est_value": r.get("estimatedTotal") or "",
                "vertical": typ,
                "hook_requirement": "READ THE RFP - fill before outreach",
                "page_ref": "",
                "status": "NEW",
                "notes": ("HAS ADDENDA. " if r.get("hasAddendums") else "")
                         + (r.get("description") or "").strip()[:180].replace("\n", " "),
            })
        if not recs or len(seen) >= d.get("hits", 0):
            break
        frm += len(recs)
    return rows


def pull_rivip():
    page = get(RIVIP_SEARCH)

    def field(name):
        m = re.search(r'name="%s"[^>]*value="([^"]*)"' % re.escape(name), page)
        return m.group(1) if m else ""

    m = re.search(
        r'id="ctl00_ContentPlaceHolder1_lstbox_ExBiddingEntities"[^>]*>(.*?)</select>',
        page, re.S)
    entities = re.findall(r'<option[^>]*value="([^"]*)"', m.group(1))

    pairs = [(k, field(k)) for k in (
        "__VIEWSTATE", "__VIEWSTATEGENERATOR", "__PREVIOUSPAGE", "__EVENTVALIDATION")]
    pairs += [("__VIEWSTATEENCRYPTED", ""), ("__EVENTTARGET", ""), ("__EVENTARGUMENT", ""),
              ("ctl00$ContentPlaceHolder1$ddl_ExBiddingGroup", "All External Bidding Groups"),
              ("ctl00$ContentPlaceHolder1$chkbox_ExSelectAll", "on")]
    pairs += [("ctl00$ContentPlaceHolder1$lstbox_ExBiddingEntities", e) for e in entities]
    pairs += [("ctl00$ContentPlaceHolder1$lstbox_ExBidStatus", "Active(Scheduled)"),
              ("ctl00$ContentPlaceHolder1$txtbox_ExBidNumber", ""),
              ("ctl00$ContentPlaceHolder1$txtbox_ExKeywords", ""),
              ("ctl00$ContentPlaceHolder1$txtbox_ExOpeningAfter", ""),
              ("ctl00$ContentPlaceHolder1$txtbox_ExOpeningBefore", ""),
              ("ctl00$ContentPlaceHolder1$btn_ExSearch", "Search")]

    body = urllib.parse.urlencode(pairs).encode()
    result = get(RIVIP_LISTING, data=body, headers={
        "Content-Type": "application/x-www-form-urlencoded",
        "Referer": RIVIP_SEARCH,
    })

    rows = []
    for tr in re.findall(r"<tr[^>]*>(.*?)</tr>", result, re.S):
        cells = [re.sub(r"<[^>]+>|&nbsp;|\s+", " ", c).strip()
                 for c in re.findall(r"<t[dh][^>]*>(.*?)</t[dh]>", tr, re.S)]
        cells = [c for c in cells if c]
        # Listing columns: [A?], opening, number, status, title, group, entity, contact, phone
        if len(cells) < 8 or cells[0] == "Info":
            continue
        if cells[0] == "A":  # addendum row; base row already captured
            continue
        opening, number, status, title, group, entity = cells[0], cells[1], cells[2], cells[3], cells[4], cells[5]
        contact = " ".join(cells[6:8])
        try:
            deadline = datetime.datetime.strptime(opening.split()[0], "%m/%d/%Y").strftime("%Y-%m-%d")
        except ValueError:
            deadline = opening
        rows.append({
            "solicitation_number": number,
            "title": title,
            "buyer": entity,
            "source": "RIVIP External",
            "url": RIVIP_SEARCH,
            "deadline": deadline,
            "questions_deadline": "",
            "est_value": "",
            "vertical": group,
            "hook_requirement": "READ THE BID DOCS - fill before outreach",
            "page_ref": "",
            "status": "NEW",
            "notes": f"Buyer contact: {contact}",
        })
    return rows


def main():
    which = sys.argv[1] if len(sys.argv) > 1 else "all"
    rows = []
    if which in ("osp", "all"):
        rows += pull_osp()
    if which in ("rivip", "all"):
        rows += pull_rivip()
    rows.sort(key=lambda r: r["deadline"])

    out = io.StringIO()
    w = csv.DictWriter(out, fieldnames=[
        "solicitation_number", "title", "buyer", "source", "url", "deadline",
        "questions_deadline", "est_value", "vertical", "hook_requirement",
        "page_ref", "status", "notes"])
    w.writeheader()
    w.writerows(rows)
    sys.stdout.write(out.getvalue())
    print(f"\n# {len(rows)} rows. Review, qualify per 01-opportunity-sourcing.md, "
          "and paste keepers into tracker/opportunities.csv.", file=sys.stderr)


if __name__ == "__main__":
    main()
