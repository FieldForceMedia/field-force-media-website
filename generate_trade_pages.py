#!/usr/bin/env python3
"""
Field Force Media: trade landing pages (window cleaning, pest control,
lawn care & landscaping, permanent lighting).

Every number on these pages is a dated snapshot that already appears on the
home or results page (or in Sales/Proof Bank with "OK to share"). Never add a
result here that isn't public there first.

The GA tag, nav and footer are copied from results.html so they stay in sync.
Run: python3 generate_trade_pages.py  (writes <slug>.html in the site root)
"""

import json
import re
from pathlib import Path

ROOT = Path(__file__).parent
SRC = (ROOT / "results.html").read_text(encoding="utf-8")

# --- shared chrome, lifted from results.html --------------------------------
GA_BLOCK = SRC[SRC.index("  <!-- Google tag (gtag.js) -->"):SRC.index("  <meta name=\"viewport\"")]
NAV = SRC[SRC.index("<nav class=\"nav\""):SRC.index("<header class=\"h2s s-dark phero\">")]
NAV = NAV.replace(' style="color:var(--gold);"', "")  # no page is "current" in the nav
FOOTER = SRC[SRC.index("<footer class=\"footer\">"):SRC.index("</footer>") + len("</footer>")]

# (arrow icon no longer used)
_ARROW = '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M5 12h14M12 5l7 7-7 7"/></svg>'


def case_card(c):
    """One result card (same look as the homepage cards)."""
    k = c["card"]
    logo = (f'\n          <div class="rcard-logo"><img src="images/clients/{k["logo"][0]}" alt="" width="{k["logo"][1]}" height="{k["logo"][2]}" loading="lazy" decoding="async"></div>'
            if k["logo"] else "")
    stats = "".join(f"<div><dt>{a}</dt><dd>{b}</dd></div>" for a, b in k["stats"])
    return f"""        <article class="rcard cut" aria-label="{strip_tags(c["name"])}">{logo}
          <h3 class="rcard-name">{c["name"]}</h3>
          <p class="rcard-trade">{k["trade"]}</p>
          <p class="rcard-big"><b>{k["big"]}</b><span>{k["big_label"]}</span></p>
          <dl class="rcard-stats">{stats}</dl>
          <p class="rcard-when">{k["when"]}</p>
        </article>"""


def case_story(c):
    """The challenge / what we ran, in a closed panel under the cards (words stay on the page)."""
    body = "".join(f"<p><b>{k}.</b> {v}</p>" for k, v in c["story"])
    return (f'      <details class="faq-item">\n'
            f'        <summary class="faq-q">How we did it: {c["name"]}</summary>\n'
            f'        <div class="faq-a">{body}</div>\n'
            f'      </details>')


SITE_SHOTS = {
    "slate": ("Slate Window Washing", "https://slatewindowwashing.com"),
    "island": ("Island Scape North Shore", "https://islandscapeoahu.com"),
    "pacific": ("Pacific Breeze Window Cleaning", "https://pacificbreezewindowcleaning.com"),
    "rrp": ("Red Rock Palms", ""), "triumph": ("Triumph Services", ""), "source": ("Source Pest Control", ""),
    "valley": ("Valley Pest Control", ""), "mcw": ("My Clean Windows", ""), "hydro": ("HydroSpark", ""),
}


def site_shot(key):
    name, url = SITE_SHOTS[key]
    inner = f'<img src="images/work/{key}-t.jpg" alt="" loading="lazy" decoding="async" width="400" height="250"><span>{name}</span>'
    return f'<li><a href="{url}" target="_blank" rel="noopener">{inner}</a></li>' if url else f"<li><div>{inner}</div></li>"


def faq_html(faqs):
    out = []
    for i, (q, a) in enumerate(faqs):
        out.append(
            f'      <details class="faq-item">\n'
            f'        <summary class="faq-q">{q}</summary>\n'
            f'        <div class="faq-a">{a}</div>\n'
            f'      </details>'
        )
    return "\n\n".join(out)


def strip_tags(s):
    s = re.sub(r"<[^>]+>", "", s)
    return (s.replace("&amp;", "&").replace("&ndash;", "–").replace("&times;", "×")
             .replace("&rsquo;", "’").replace("&nbsp;", " "))


# Answers shared by every trade page. Source: Sales/Offer Pack/Client FAQ.md.
COMMON_FAQS = [
    ("Who owns the ad account and the leads?",
     "You do. Your ad accounts, pages, Google profile, domain and every lead are in your name. We get partner or manager access to do the work."),
    ("Is ad spend included in your fee?",
     "No. You pay Meta or Google directly for ads, on your own card. Our fee is for the work: strategy, creative, setup and management. We'll recommend a budget, and it never goes up without your OK."),
    ("How fast will I get leads?",
     "Our goal is your first qualified lead within 14 days of having your access and assets. Most of that time is building creative and getting your accounts ready."),
    ("Do I have to sign a long contract?",
     "No. Everything we offer is month to month: cancel any time with 15 days' written notice. Websites come with a monthly care plan (hosting, updates and support); if you leave, you can buy the site outright (landing page $999, full site $1,999, half that after 36 months on a care plan) or keep it on our basic plan."),
]


TRADES = [
    {
        "slug": "window-cleaning-marketing",
        "trade": "Window Cleaning",
        "plural": "window cleaning companies",
        "short": "window cleaning",
        "title": "Window Cleaning Marketing: Ads &amp; Websites | Field Force Media",
        "desc": "Marketing for window cleaning companies: Meta ads, websites and branding. NEO Window Cleaning saw a 10.7x return on ad spend. Book a free strategy call.",
        "h1": "Marketing for<br><span class=\"gold\">Window Cleaning Companies.</span>",
        "lede": "Meta ads, websites and branding for window cleaning businesses, from a home service marketing agency that has run ads and built sites for window crews in California, Nevada, Colorado and Hawaii.",
        "cases_sub": "Numbers from the client's own Meta ad account or their books, with the time frame it took.",
        "cases": [
            {"tag": "Window Cleaning", "where": "Fresno, CA", "name": "NEO Window Cleaning",
             "card": {"logo": None, "trade": "Window cleaning &middot; Fresno, CA", "big": "10.7&times;", "big_label": "return on ad spend", "stats": [("Month 1 revenue", "$8K+"), ("Year 1 projected", "$200K+")], "when": "Meta ads"},
             "story": [("The Challenge", "A newer window cleaning company with capacity to spare and no reliable way to fill the calendar week to week."),
                       ("What We Ran", "Meta advertising: offer, creative, and targeting built specifically for local window cleaning demand.")],
             "stats": [("Return on ad spend", "10.7×", True), ("Month 1 revenue", "$8K+", False),
                       ("Year 1 projected", "$200K+", True), ("Channel", "Meta<span>&nbsp;ads</span>", False)]},
        ],
        "extra_proof": "Hear it from the owners of NEO Window Cleaning and Pacific Breeze Window Cleaning in their own words on our <a href=\"results.html\">results page</a>.",
        "sites_h2": "Window cleaning sites we've built.",
        "sites": ["slate", "pacific", "hydro"],
        "cpl_faq": None,
        "services": [
            ("Meta Ads", "Facebook and Instagram campaigns that put your crew in front of homeowners in your service area, with offers and creative built for window cleaning."),
            ("Website Design", "A phone-first site with a quote form that sends every request straight to you, built to rank in local search."),
            ("Brand Identity", "Logo, colors and type that make a one-truck crew look like the established, professional choice."),
            ("Direct Mail", "Door hangers, EDDM mailers and yard signs for the neighborhoods you already work in."),
            ("Marketing Strategy", "A plan built around your revenue goal: which channels first, what to spend, and in what order."),
        ],
    },
    {
        "slug": "pest-control-marketing",
        "trade": "Pest Control",
        "plural": "pest control companies",
        "short": "pest control",
        "title": "Pest Control Marketing: Meta Ads &amp; Websites | Field Force Media",
        "desc": "Marketing for pest control companies: Meta ads and websites. Valley Pest Control signed $19K+ in contracts in 9 weeks from our Meta ads. Free strategy call.",
        "h1": "Marketing for<br><span class=\"gold\">Pest Control Companies.</span>",
        "lede": "Meta ads, websites and landing pages for pest control businesses, from a home service marketing agency that has run campaigns for pest control companies in California.",
        "cases_sub": "Numbers from the client's own Meta ad account, with the time frame it took.",
        "cases": [
            {"tag": "Pest Control", "where": "Clovis / Fresno, CA", "name": "Valley Pest Control",
             "card": {"logo": ("valley.png", 520, 148), "trade": "Pest control &middot; Clovis / Fresno, CA", "big": "6.2&times;", "big_label": "return on ad spend", "stats": [("Contracts signed", "$19K+ in 9 wks"), ("Leads", "148")], "when": "Jul 8 &ndash; Oct 19, 2026"},
             "story": [("The Challenge", "Strong local reputation, a clear guarantee to sell, and no paid channel turning that into new signed accounts."),
                       ("What We Ran", "Meta advertising anchored on the Total Shield guarantee and the same-technician promise, driving to phone and form, plus the landing page behind the ads.")],
             "stats": [("Return on ad spend", "6.2×", True), ("Contracts signed", "$19K+", True),
                       ("Contracts signed in", "9<span>wks</span>", False), ("Leads, Jul 8 &ndash; Oct 19, 2026", "148", True)]},
            {"tag": "Pest Control", "where": "Temecula, CA", "name": "Source Pest Control",
             "card": {"logo": ("source.png", 500, 135), "trade": "Pest control &middot; Temecula, CA", "big": "91", "big_label": "leads in 5 weeks", "stats": [("Cost per lead", "$35.22"), ("Ad spend", "$3,205")], "when": "Oct 8 &ndash; Nov 11, 2026"},
             "story": [("What We Ran", "A fast, call-first website that sends every quote request straight to the owner, plus Meta ad campaigns tracked in the client's own ad account.")],
             "stats": [("Leads, Oct 8 &ndash; Nov 11, 2026", "91", True), ("Time frame", "5<span>wks</span>", False),
                       ("Ad spend", "$3,205", False), ("Cost per lead", "$35.22", True)]},
        ],
        "extra_proof": None,
        "sites_h2": "Pest control sites we've built.",
        "sites": ["valley", "source"],
        "cpl_faq": ("What do Meta ad leads cost for a pest control company?",
                    "It depends on your market, your offer and the season, so we won't quote a number before we've seen your business. For reference: Valley Pest Control paid $34.52 per lead (148 leads, Jul 8 &ndash; Oct 19, 2026) and Source Pest Control paid $35.22 per lead (91 leads, Oct 8 &ndash; Nov 11, 2026)."),
        "services": [
            ("Meta Ads", "Facebook and Instagram campaigns built around your guarantee and your service area, driving homeowners to call or fill out a form."),
            ("Website Design", "Call-first websites and landing pages that send every quote request straight to you, built to rank in local search."),
            ("Brand Identity", "A brand that looks as trustworthy as the technician you send into the home."),
            ("Direct Mail", "Door hangers, EDDM mailers and yard signs for the neighborhoods you already service."),
            ("Marketing Strategy", "A plan built around your revenue goal: which channels first, what to spend, and in what order."),
        ],
    },
    {
        "slug": "lawn-care-marketing",
        "trade": "Lawn Care &amp; Landscaping",
        "plural": "lawn care and landscaping companies",
        "short": "lawn care",
        "title": "Lawn Care &amp; Landscaping Marketing | Field Force Media",
        "desc": "Marketing for lawn care and landscaping companies: Meta ads, websites, branding and direct mail. Island Scape North Shore grew 17.5x in 14 months.",
        "h1": "Marketing for Lawn Care<br><span class=\"gold\">&amp; Landscaping Companies.</span>",
        "lede": "Meta ads, websites, branding and direct mail for lawn care and landscaping businesses. Field Force grew out of a lawn care company, so we know the seasons, the routes and the margins.",
        "cases_sub": "The starting point, the system we built, and the numbers that followed.",
        "cases": [
            {"tag": "Lawn Care &amp; Landscaping", "where": "North Shore, O'ahu, Hawaii", "name": "Island Scape North Shore LLC",
             "card": {"logo": ("island-dark.png", 305, 300), "trade": "Lawn care &middot; O&#8217;ahu, HI", "big": "17.5&times;", "big_label": "revenue growth", "stats": [("Monthly revenue", "$2K &rarr; $35K"), ("Cost per lead", "$27.79")], "when": "Over 14 months"},
             "story": [("The Challenge", "A skilled operator stuck at $2,000/month: no website that converted, no ad engine, no brand. A great service business that looked like a side hustle."),
                       ("What We Ran", "Website redesign, Meta advertising, brand identity, local SEO, and direct mail, built to work as one system. Meta ads brought in 42 leads at $27.79 each (Nov &ndash; Dec 2025).")],
             "stats": [("Starting revenue", "$2K<span>/mo</span>", False), ("Peak revenue", "$35K<span>/mo</span>", True),
                       ("Revenue multiple", "17.5×", True), ("Timeline", "14<span>mo</span>", False)]},
        ],
        "extra_proof": None,
        "sites_h2": "Lawn and landscape sites we've built.",
        "sites": ["island", "rrp"],
        "cpl_faq": None,
        "services": [
            ("Meta Ads", "Facebook and Instagram campaigns that fill your routes with homeowners in the neighborhoods you already serve."),
            ("Website Design", "A phone-first site with service-area pages and a quote form that sends every request straight to you."),
            ("Brand Identity", "Logo, colors, truck and uniform designs that make your crew look like the established choice."),
            ("Direct Mail", "Door hangers, EDDM mailers and yard signs that turn one good lawn into the next job on the street."),
            ("Marketing Strategy", "A plan built around your revenue goal and your season: which channels first, what to spend, and in what order."),
        ],
    },
    {
        "slug": "permanent-lighting-marketing",
        "trade": "Permanent Lighting",
        "plural": "permanent lighting companies",
        "short": "permanent lighting",
        "title": "Permanent Lighting Marketing: Meta Ads | Field Force Media",
        "desc": "Meta ads and landing pages for permanent lighting companies. bluEmber Lighting got 1,516 leads at $35.06 each in 8 weeks. Book a free strategy call.",
        "h1": "Marketing for<br><span class=\"gold\">Permanent Lighting Companies.</span>",
        "lede": "Meta lead ads and landing pages for permanent and holiday lighting installers, from a home service marketing agency that has run lighting campaigns in California, Montana and Utah.",
        "cases_sub": "Numbers from the client's own Meta ad account, with the time frame it took.",
        "cases": [
            {"tag": "Permanent Lighting", "where": "Fresno, CA &amp; Bozeman, MT", "name": "bluEmber Lighting",
             "card": {"logo": ("bluember.png", 520, 123), "trade": "Permanent lighting &middot; Fresno &amp; Bozeman", "big": "1,516", "big_label": "leads in 8 weeks", "stats": [("Cost per lead", "$35.06"), ("Ad spend", "$53,149")], "when": "Sep 15 &ndash; Nov 11, 2026"},
             "story": [("The Challenge", "A permanent lighting company that needed a steady stream of homeowner leads to keep its install calendar full."),
                       ("What We Ran", "Meta lead ad campaigns for permanent lighting installs, tracked in the client's own ad account.")],
             "stats": [("Leads, Sep 15 &ndash; Nov 11, 2026", "1,516", True), ("Time frame", "8<span>wks</span>", False),
                       ("Ad spend", "$53.1K", False), ("Cost per lead", "$35.06", True)]},
        ],
        "extra_proof": None,
        "sites_h2": "Lighting sites and pages we've built.",
        "sites": ["mcw", "triumph"],
        "cpl_faq": ("What do Meta ad leads cost for a permanent lighting company?",
                    "It depends on your market, your offer and the season, so we won't quote a number before we've seen your business. For reference: bluEmber Lighting paid $35.06 per lead (1,516 leads on $53,149 of ad spend, Sep 15 &ndash; Nov 11, 2026)."),
        "services": [
            ("Meta Ads", "Facebook and Instagram lead ads that keep your install calendar full, with creative built for permanent lighting."),
            ("Landing Pages &amp; Websites", "Pages built to turn ad clicks into booked consultations, wired so every lead reaches you fast."),
            ("Brand Identity", "A brand that looks as polished as the lights on the roofline."),
            ("Direct Mail", "Door hangers, EDDM mailers and yard signs for the neighborhoods where your installs are already lit up."),
            ("Marketing Strategy", "A plan built around your revenue goal and your season: which channels first, what to spend, and in what order."),
        ],
    },
]


def build(t):
    url = f"https://fieldforcemedia.com/{t['slug']}.html"
    faqs = list(COMMON_FAQS)
    if t["cpl_faq"]:
        faqs.insert(0, t["cpl_faq"])

    schema = {
        "@context": "https://schema.org",
        "@graph": [
            {
                "@type": "Service",
                "@id": url + "#service",
                "name": f"{strip_tags(t['trade'])} Marketing",
                "serviceType": f"Marketing for {t['plural']}",
                "description": strip_tags(t["lede"]),
                "url": url,
                "provider": {"@type": "ProfessionalService", "@id": "https://fieldforcemedia.com/#organization", "name": "Field Force Media", "telephone": "+1-385-543-3158", "url": "https://fieldforcemedia.com"},
                "areaServed": {"@type": "Country", "name": "United States"},
                "audience": {"@type": "BusinessAudience", "audienceType": strip_tags(t["plural"]).capitalize()},
            },
            {
                "@type": "BreadcrumbList",
                "itemListElement": [
                    {"@type": "ListItem", "position": 1, "name": "Home", "item": "https://fieldforcemedia.com/"},
                    {"@type": "ListItem", "position": 2, "name": "Services", "item": "https://fieldforcemedia.com/services.html"},
                    {"@type": "ListItem", "position": 3, "name": f"{strip_tags(t['trade'])} Marketing", "item": url},
                ],
            },
            {
                "@type": "FAQPage",
                "mainEntity": [
                    {"@type": "Question", "name": strip_tags(q), "acceptedAnswer": {"@type": "Answer", "text": strip_tags(a)}}
                    for q, a in faqs
                ],
            },
        ],
    }
    schema_json = json.dumps(schema, indent=2, ensure_ascii=False)
    schema_json = "\n".join("  " + line for line in schema_json.splitlines())

    n = len(t["cases"])
    cards = "\n".join(case_card(c) for c in t["cases"])
    stories = "\n".join(case_story(c) for c in t["cases"])
    extra = f'\n    <p class="do-trades plain">{t["extra_proof"]}</p>' if t["extra_proof"] else ""
    dots = '\n    <div class="rdots" id="rdots" aria-label="Choose a client"></div>' if n > 1 else ""
    rows = "\n".join(
        f'      <li><a href="services.html"><b>{name}</b><span>{desc}</span></a></li>'
        for name, desc in t["services"]
    )
    shots = "".join(site_shot(k) for k in t["sites"])
    others = [o for o in TRADES if o["slug"] != t["slug"]]
    other_links = ", ".join(f'<a href="{o["slug"]}.html">{o["trade"].lower()}</a>' for o in others)
    h1 = t["h1"].replace('class="gold"', 'class="hl"').replace("<br>", " <br>")  # space so it reads right when the break is hidden on phones

    plain_title = strip_tags(t["title"])
    return f"""<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
{GA_BLOCK}  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>{t["title"]}</title>
  <meta name="description" content="{t["desc"]}" />
  <link rel="canonical" href="{url}" />
  <link rel="icon" href="/favicon.ico?v=2" sizes="any" />
  <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png?v=2" />
  <link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png?v=2" />
  <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png?v=2" />
  <link rel="manifest" href="/site.webmanifest" />
  <meta name="theme-color" content="#0A0A0A" />
  <meta property="og:type" content="website" />
  <meta property="og:url" content="{url}" />
  <meta property="og:site_name" content="Field Force Media" />
  <meta property="og:title" content="{plain_title}" />
  <meta property="og:description" content="{t["desc"]}" />
  <meta property="og:image" content="https://fieldforcemedia.com/images/og-image.png" />
  <script type="application/ld+json">
{schema_json}
  </script>
  <link rel="stylesheet" href="css/styles.css" />
  <link rel="stylesheet" href="css/home.css" />
  <link rel="stylesheet" href="css/lp.css" />
  <link rel="stylesheet" href="css/home-m.css" />
  <link rel="stylesheet" href="css/site.css" />
  <link rel="stylesheet" href="/css/fx.css" />
</head>
<body>

{NAV}<header class="h2s s-dark phero">
  <div class="w2">
    <p class="crumbs plain"><a href="/">Home</a> / <a href="services.html">Services</a> / {t["trade"]} Marketing</p>
    <h1>{h1}</h1>
    <p class="phero-sub">{t["lede"]}</p>
    <a href="contact.html" class="hb hb-gold">Book a free strategy call</a>
    <p class="phero-fine">Free 30-minute call. Month-to-month, cancel with 15 days' notice.</p>
  </div>
</header>

<main>

<!-- PROOF -->
<section class="h2s s-dark hsec" id="results" aria-labelledby="res-h" style="padding-top:1rem">
  <div class="w2">
    <h2 class="lp-h" id="res-h">{t["trade"]} results we've tracked.</h2>
    <p class="lp-lede">{t["cases_sub"]}</p>
    <div class="rtrack r{min(n, 3)}" id="rtrack" tabindex="0" aria-label="Client results">
{cards}
    </div>{dots}
    <div class="stories faq2">
{stories}
    </div>{extra}
    <div class="svc-cta cut book-band"><div><h3>Want results like these?</h3><p>Book a free 30-minute strategy call. We'll look at your business and your market and tell you what would move the needle.</p></div><a href="contact.html" class="hb">Book a free strategy call</a></div>
  </div>
</section>

<!-- SERVICES -->
<section class="h2s s-light hsec" aria-labelledby="svc-h">
  <div class="w2">
    <h2 class="lp-h" id="svc-h">What we run for {t["plural"]}.</h2>
    <p class="lp-lede">Every piece works together: your website feeds your ads, and your brand makes every ad and mailer work harder.</p>
    <ul class="do-list wide three">
{rows}
    </ul>
  </div>
</section>

<!-- SITES -->
<section class="h2s s-dark hsec" aria-labelledby="sites-h">
  <div class="w2">
    <h2 class="lp-h" id="sites-h">{t["sites_h2"]}</h2>
    <p class="lp-lede">Built phone-first and wired so every quote request goes straight to the owner.</p>
    <div class="sites">
      <ul class="sites-row" tabindex="0" aria-label="{strip_tags(t["sites_h2"])}">{shots}</ul>
    </div>
  </div>
</section>

<!-- FAQ -->
<section class="h2s s-light hsec" aria-labelledby="faq-h">
  <div class="w2">
    <h2 class="lp-h" id="faq-h">{t["trade"]} marketing <span class="hl">questions.</span></h2>
    <div class="faq2 faq3">

{faq_html(faqs)}

    </div>
    <p class="do-trades plain">We also do marketing for {other_links} companies, and every other home service trade. <a href="services.html">See all our services</a>.</p>
  </div>
</section>

<section class="h2s s-dark cta2 cta3">
  <div class="w2">
    <h2 class="h2-title">Ready to grow your <span class="hl">{t["short"]} business?</span></h2>
    <p>Book a free 30-minute strategy call. We'll look at your business, your market and your revenue goal, and give you a clear picture of what to do next.</p>
    <a href="contact.html" class="hb hb-gold">Book a free strategy call</a>
    <p class="fine">Month-to-month terms. Cancel with 15 days' notice.</p>
  </div>
</section>

</main>

{FOOTER}

<script src="js/main.js"></script>
<script src="js/rcards.js"></script>
<script src="/js/fx.js" defer></script>
<!-- GoHighLevel chat + phone widget -->
<script src="https://widgets.leadconnectorhq.com/loader.js" data-resources-url="https://widgets.leadconnectorhq.com/chat-widget/loader.js" data-widget-id="6afcc076f31f8c02e6114837"></script>
</body>
</html>
"""


def main():
    for t in TRADES:
        out = ROOT / f"{t['slug']}.html"
        out.write_text(build(t), encoding="utf-8")
        print(f"wrote {out.name}")


if __name__ == "__main__":
    main()
