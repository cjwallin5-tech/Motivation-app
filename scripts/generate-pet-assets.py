"""Generates procedural pixel-art sprite sheets + room background for the pet.
Run with: python3 scripts/generate-pet-assets.py
Outputs into public/pet/. Re-run after editing to regenerate.
"""
from PIL import Image, ImageDraw
import colorsys
import os

HERE = os.path.dirname(os.path.abspath(__file__))
OUT = os.path.join(HERE, "..", "public", "pet")
os.makedirs(OUT, exist_ok=True)

FRAME = 40


def new_frame():
    return Image.new("RGBA", (FRAME, FRAME), (0, 0, 0, 0))


def draw_wyrm(body, belly, dark, horn, size_scale, leg_phase, eye_open, bob, wing_up, mouth_open=False, outfit=None):
    """Shared body plan for hatchling/dragon: body+head+tail+legs+wings, facing right."""
    img = new_frame()
    d = ImageDraw.Draw(img)

    cx, cy = 18, 23 - bob
    s = size_scale  # 1.0 = hatchling, 1.25 = dragon

    def sc(v):
        return v * s

    # tail
    d.polygon(
        [
            (cx - sc(14), cy + sc(7)),
            (cx - sc(23), cy + sc(2)),
            (cx - sc(15), cy - sc(1)),
        ],
        fill=body,
    )

    # back legs (drawn before body so body overlaps them slightly)
    leg_a = 2 if leg_phase == 0 else 0
    leg_b = 0 if leg_phase == 0 else 2
    d.rectangle([cx - sc(7), cy + sc(7) + leg_a, cx - sc(3), cy + sc(12) + leg_a], fill=dark)
    d.rectangle([cx + sc(3), cy + sc(7) + leg_b, cx + sc(7), cy + sc(12) + leg_b], fill=dark)

    # wing
    wing_y = cy - sc(6) - (2 if wing_up else 0)
    d.polygon(
        [
            (cx - sc(2), wing_y),
            (cx + sc(6), wing_y - sc(7)),
            (cx + sc(9), wing_y + sc(1)),
        ],
        fill=belly,
    )

    # body
    d.ellipse([cx - sc(11), cy - sc(9), cx + sc(11), cy + sc(9)], fill=body)
    # belly patch
    d.ellipse([cx - sc(5), cy - sc(1), cx + sc(6), cy + sc(8)], fill=belly)

    # head
    hx, hy = cx + sc(11), cy - sc(4)
    d.ellipse([hx - sc(7), hy - sc(7), hx + sc(7), hy + sc(7)], fill=body)
    # horn
    d.polygon(
        [(hx + sc(1), hy - sc(7)), (hx + sc(4), hy - sc(13)), (hx + sc(5), hy - sc(6))],
        fill=horn,
    )
    # snout
    d.ellipse([hx + sc(4), hy - sc(1), hx + sc(11), hy + sc(4)], fill=body)
    # eye
    if eye_open:
        d.ellipse([hx + sc(2), hy - sc(2), hx + sc(5), hy + sc(1)], fill=dark)
    else:
        d.line([(hx + sc(1), hy), (hx + sc(5), hy)], fill=dark, width=1)
    # open mouth (happy/eating reaction)
    if mouth_open:
        d.ellipse([hx + sc(7), hy + sc(1), hx + sc(10), hy + sc(4)], fill=dark)

    if outfit:
        ax, ay = (hx - sc(1), hy - sc(8)) if outfit not in NECK_OUTFITS else (cx + sc(7), cy + sc(3))
        draw_outfit(d, outfit, ax, ay, s)

    return img


def sheet(frames):
    w = FRAME * len(frames)
    sheet_img = Image.new("RGBA", (w, FRAME), (0, 0, 0, 0))
    for i, f in enumerate(frames):
        sheet_img.paste(f, (i * FRAME, 0), f)
    return sheet_img


# --- Outfits: cosmetic level-up rewards, drawn on top of a species' own art at an anchor
# point each draw_* function already computes for itself (its head, or its neck/chest).
# Colors are fixed, not tinted by the species' color variant — an outfit looks the same
# whichever recolor of a companion is wearing it. Keys must match src/outfits.ts.


def draw_bandana(d, ax, ay, s):
    def sc(v):
        return v * s

    base = (74, 120, 196, 255)
    dot = (255, 255, 255, 255)
    # thin band across the neck, with a small triangular flap hanging at the front
    d.rectangle([ax - sc(4), ay - sc(1), ax + sc(4), ay + sc(1)], fill=base)
    d.polygon([(ax - sc(2), ay + sc(0.5)), (ax + sc(2), ay + sc(0.5)), (ax, ay + sc(4))], fill=base)
    d.ellipse([ax - sc(1), ay + sc(1.5), ax + sc(0.4), ay + sc(2.9)], fill=dot)


def draw_bow(d, ax, ay, s):
    def sc(v):
        return v * s

    base = (232, 90, 140, 255)
    dark = (180, 50, 100, 255)
    d.polygon([(ax - sc(1), ay), (ax - sc(6), ay - sc(4)), (ax - sc(6), ay + sc(4))], fill=base)
    d.polygon([(ax - sc(1), ay), (ax + sc(4), ay - sc(4)), (ax + sc(4), ay + sc(4))], fill=base)
    d.ellipse([ax - sc(2.2), ay - sc(1.2), ax + sc(0.2), ay + sc(1.2)], fill=dark)


def draw_crown(d, ax, ay, s):
    def sc(v):
        return v * s

    base = (250, 210, 70, 255)
    gem = (110, 170, 240, 255)
    d.polygon(
        [
            (ax - sc(6), ay + sc(1)),
            (ax - sc(4), ay - sc(4)),
            (ax - sc(1), ay),
            (ax + sc(1.5), ay - sc(5)),
            (ax + sc(4), ay),
            (ax + sc(6), ay - sc(4)),
            (ax + sc(6), ay + sc(2)),
            (ax - sc(6), ay + sc(2)),
        ],
        fill=base,
    )
    d.ellipse([ax - sc(1.5), ay - sc(2), ax + sc(1), ay + sc(0.5)], fill=gem)


def draw_scarf(d, ax, ay, s):
    def sc(v):
        return v * s

    base = (196, 90, 60, 255)
    stripe = (240, 200, 150, 255)
    d.rectangle([ax - sc(5), ay - sc(1.5), ax + sc(5), ay + sc(1.5)], fill=base)
    d.rectangle([ax - sc(5), ay - sc(0.4), ax + sc(5), ay + sc(0.4)], fill=stripe)
    d.polygon([(ax - sc(1), ay + sc(1)), (ax + sc(1.5), ay + sc(1)), (ax + sc(0.5), ay + sc(6))], fill=base)
    d.rectangle([ax - sc(0.3), ay + sc(3), ax + sc(1.2), ay + sc(3.8)], fill=stripe)


def draw_cape(d, ax, ay, s):
    def sc(v):
        return v * s

    base = (170, 60, 90, 255)
    clasp = (230, 190, 90, 255)
    d.polygon(
        [(ax - sc(5), ay), (ax + sc(5), ay), (ax + sc(3), ay + sc(8)), (ax - sc(3), ay + sc(8))],
        fill=base,
    )
    d.ellipse([ax - sc(1.2), ay - sc(1.2), ax + sc(1.2), ay + sc(1.2)], fill=clasp)


def draw_party_hat(d, ax, ay, s):
    def sc(v):
        return v * s

    base = (90, 170, 220, 255)
    stripe = (255, 255, 255, 255)
    pompom = (255, 214, 92, 255)
    d.polygon([(ax - sc(4), ay + sc(2)), (ax + sc(4), ay + sc(2)), (ax, ay - sc(7))], fill=base)
    band_y = ay - sc(2)
    d.rectangle([ax - sc(2.4), band_y - sc(0.8), ax + sc(2.4), band_y + sc(0.8)], fill=stripe)
    d.ellipse([ax - sc(1.5), ay - sc(8.7), ax + sc(1.5), ay - sc(5.7)], fill=pompom)


def draw_wizard_hat(d, ax, ay, s):
    def sc(v):
        return v * s

    base = (90, 70, 160, 255)
    star = (255, 214, 92, 255)
    d.ellipse([ax - sc(6), ay + sc(1), ax + sc(6), ay + sc(3.5)], fill=base)
    d.polygon([(ax - sc(3.5), ay + sc(2)), (ax + sc(2), ay + sc(2)), (ax - sc(1), ay - sc(9))], fill=base)
    d.ellipse([ax - sc(2.2), ay - sc(6), ax - sc(0.2), ay - sc(4)], fill=star)


# Outfits whose anchor is the neck/chest spot each draw_* function computes, rather than the
# head-top spot — every other outfit defaults to the head anchor. Adding a new neck-slot outfit
# only means adding its id here, not touching any of the 8 species functions again.
NECK_OUTFITS = {"bandana", "scarf", "cape"}


def draw_outfit(d, outfit, ax, ay, s):
    if outfit == "bandana":
        draw_bandana(d, ax, ay, s)
    elif outfit == "scarf":
        draw_scarf(d, ax, ay, s)
    elif outfit == "cape":
        draw_cape(d, ax, ay, s)
    elif outfit == "party_hat":
        draw_party_hat(d, ax, ay, s)
    elif outfit == "wizard_hat":
        draw_wizard_hat(d, ax, ay, s)
    elif outfit == "bow":
        draw_bow(d, ax, ay, s)
    elif outfit == "crown":
        draw_crown(d, ax, ay, s)


# --- Other companion body plans ---
# Each takes the same argument shape as draw_wyrm: (body, belly, dark, accent, size_scale,
# leg_phase, eye_open, bob, action_flag, mouth_open=False), facing right, on a 40x40 canvas.
# `accent` stands in for whatever detail color that shape doesn't share with draw_wyrm's horn
# (ear tips, a beak, wing membranes, spike tips, a nose).


def draw_fox(body, belly, dark, accent, size_scale, leg_phase, eye_open, bob, tail_up, mouth_open=False, outfit=None):
    img = new_frame()
    d = ImageDraw.Draw(img)
    cx, cy = 18, 23 - bob
    s = size_scale

    def sc(v):
        return v * s

    lift = sc(3) if tail_up else 0
    d.polygon(
        [
            (cx - sc(8), cy + sc(4)),
            (cx - sc(13), cy - sc(3) - lift),
            (cx - sc(10), cy - lift),
            (cx - sc(7), cy + sc(8)),
        ],
        fill=body,
    )
    d.ellipse([cx - sc(14), cy - sc(5) - lift, cx - sc(9), cy - lift], fill=accent)

    leg_a = 2 if leg_phase == 0 else 0
    leg_b = 0 if leg_phase == 0 else 2
    d.rectangle([cx - sc(6), cy + sc(6) + leg_a, cx - sc(2), cy + sc(12) + leg_a], fill=dark)
    d.rectangle([cx + sc(4), cy + sc(6) + leg_b, cx + sc(8), cy + sc(12) + leg_b], fill=dark)

    d.ellipse([cx - sc(10), cy - sc(8), cx + sc(10), cy + sc(8)], fill=body)
    d.ellipse([cx - sc(3), cy - sc(1), cx + sc(7), cy + sc(7)], fill=belly)

    hx, hy = cx + sc(10), cy - sc(5)
    d.ellipse([hx - sc(7), hy - sc(6), hx + sc(6), hy + sc(6)], fill=body)
    d.polygon([(hx - sc(6), hy - sc(4)), (hx - sc(6.5), hy - sc(12)), (hx - sc(1), hy - sc(5))], fill=body)
    d.polygon([(hx - sc(5.3), hy - sc(4.7)), (hx - sc(5.6), hy - sc(9.5)), (hx - sc(2.2), hy - sc(5.2))], fill=dark)
    d.polygon([(hx + sc(1), hy - sc(5)), (hx + sc(1.5), hy - sc(13)), (hx + sc(6), hy - sc(4))], fill=body)
    d.polygon([(hx + sc(1.7), hy - sc(5.5)), (hx + sc(2), hy - sc(10.5)), (hx + sc(5.2), hy - sc(4.7))], fill=dark)
    d.ellipse([hx + sc(4), hy - sc(1), hx + sc(11), hy + sc(3)], fill=belly)
    d.ellipse([hx + sc(9), hy, hx + sc(11.5), hy + sc(2.2)], fill=dark)
    if eye_open:
        d.ellipse([hx + sc(1), hy - sc(2), hx + sc(4), hy + sc(1)], fill=dark)
    else:
        d.line([(hx, hy - sc(0.5)), (hx + sc(4), hy - sc(0.5))], fill=dark, width=1)
    if mouth_open:
        d.ellipse([hx + sc(7), hy + sc(1.5), hx + sc(10), hy + sc(4)], fill=dark)

    if outfit:
        ax, ay = (hx - sc(2), hy - sc(7)) if outfit not in NECK_OUTFITS else (cx + sc(7), cy + sc(3))
        draw_outfit(d, outfit, ax, ay, s)

    return img


def draw_otter(body, belly, dark, accent, size_scale, leg_phase, eye_open, bob, action, mouth_open=False, outfit=None):
    img = new_frame()
    d = ImageDraw.Draw(img)
    cx, cy = 18, 25 - bob
    s = size_scale

    def sc(v):
        return v * s

    d.polygon(
        [
            (cx - sc(9), cy + sc(1)),
            (cx - sc(20), cy - sc(4)),
            (cx - sc(21), cy + sc(3)),
            (cx - sc(9), cy + sc(7)),
        ],
        fill=body,
    )

    leg_a = 1 if leg_phase == 0 else 0
    leg_b = 0 if leg_phase == 0 else 1
    d.ellipse([cx - sc(6), cy + sc(6) + leg_a, cx - sc(2), cy + sc(10) + leg_a], fill=dark)
    d.ellipse([cx + sc(3), cy + sc(6) + leg_b, cx + sc(7), cy + sc(10) + leg_b], fill=dark)

    d.ellipse([cx - sc(12), cy - sc(6), cx + sc(10), cy + sc(6)], fill=body)
    d.ellipse([cx - sc(4), cy - sc(1), cx + sc(6), cy + sc(5)], fill=belly)

    hx, hy = cx + sc(10), cy - sc(3)
    d.ellipse([hx - sc(6), hy - sc(6), hx + sc(6), hy + sc(6)], fill=body)
    d.ellipse([hx - sc(4), hy - sc(8), hx - sc(1), hy - sc(5)], fill=body)
    d.ellipse([hx + sc(1), hy - sc(8), hx + sc(4), hy - sc(5)], fill=body)
    d.ellipse([hx + sc(3), hy - sc(1), hx + sc(9), hy + sc(4)], fill=belly)
    d.ellipse([hx + sc(7), hy + sc(0.5), hx + sc(9.5), hy + sc(2.8)], fill=dark)
    whisker_len = sc(5) if action else sc(4)
    d.line([(hx + sc(5), hy + sc(1)), (hx + sc(5) + whisker_len, hy)], fill=accent, width=1)
    d.line([(hx + sc(5), hy + sc(2.3)), (hx + sc(5) + whisker_len, hy + sc(2.5))], fill=accent, width=1)
    if eye_open:
        d.ellipse([hx - sc(1), hy - sc(2), hx + sc(2), hy + sc(1)], fill=dark)
    else:
        d.line([(hx - sc(1.5), hy - sc(0.5)), (hx + sc(2.5), hy - sc(0.5))], fill=dark, width=1)
    if mouth_open:
        d.ellipse([hx + sc(5), hy + sc(2.5), hx + sc(8), hy + sc(5)], fill=dark)

    if outfit:
        ax, ay = (hx - sc(1), hy - sc(9)) if outfit not in NECK_OUTFITS else (cx + sc(7), cy + sc(4))
        draw_outfit(d, outfit, ax, ay, s)

    return img


def draw_cat(body, belly, dark, accent, size_scale, leg_phase, eye_open, bob, tail_up, mouth_open=False, outfit=None):
    img = new_frame()
    d = ImageDraw.Draw(img)
    cx, cy = 18, 23 - bob
    s = size_scale

    def sc(v):
        return v * s

    lift = sc(4) if tail_up else 0
    d.line(
        [
            (cx - sc(9), cy + sc(5)),
            (cx - sc(16), cy - sc(2) - lift),
            (cx - sc(13), cy - sc(10) - lift),
        ],
        fill=body,
        width=max(2, int(sc(3))),
    )

    leg_a = 2 if leg_phase == 0 else 0
    leg_b = 0 if leg_phase == 0 else 2
    d.rectangle([cx - sc(5), cy + sc(6) + leg_a, cx - sc(2), cy + sc(11) + leg_a], fill=dark)
    d.rectangle([cx + sc(3), cy + sc(6) + leg_b, cx + sc(6), cy + sc(11) + leg_b], fill=dark)

    d.ellipse([cx - sc(9), cy - sc(7), cx + sc(9), cy + sc(7)], fill=body)
    d.ellipse([cx - sc(2), cy - sc(1), cx + sc(6), cy + sc(6)], fill=belly)

    hx, hy = cx + sc(9), cy - sc(5)
    d.ellipse([hx - sc(6), hy - sc(6), hx + sc(6), hy + sc(6)], fill=body)
    d.polygon([(hx - sc(5), hy - sc(4)), (hx - sc(6), hy - sc(11)), (hx - sc(1), hy - sc(5))], fill=body)
    d.polygon([(hx + sc(1), hy - sc(5)), (hx + sc(2), hy - sc(12)), (hx + sc(5), hy - sc(4))], fill=body)
    d.polygon([(hx - sc(4.5), hy - sc(4.5)), (hx - sc(5), hy - sc(9)), (hx - sc(2), hy - sc(5))], fill=accent)
    d.polygon([(hx + sc(1.5), hy - sc(5.5)), (hx + sc(2.3), hy - sc(10)), (hx + sc(4), hy - sc(4.5))], fill=accent)
    d.ellipse([hx + sc(3), hy - sc(1), hx + sc(9), hy + sc(3)], fill=belly)
    d.ellipse([hx + sc(8), hy + sc(0.2), hx + sc(9.6), hy + sc(1.8)], fill=accent)
    d.line([(hx + sc(4), hy + sc(0.5)), (hx + sc(10), hy - sc(0.5))], fill=dark, width=1)
    d.line([(hx + sc(4), hy + sc(1.5)), (hx + sc(10), hy + sc(1.8))], fill=dark, width=1)
    if eye_open:
        d.ellipse([hx, hy - sc(2), hx + sc(3), hy + sc(1)], fill=dark)
    else:
        d.line([(hx - sc(0.5), hy - sc(0.5)), (hx + sc(3.5), hy - sc(0.5))], fill=dark, width=1)
    if mouth_open:
        d.ellipse([hx + sc(6), hy + sc(1.5), hx + sc(8.5), hy + sc(3.5)], fill=dark)

    if outfit:
        ax, ay = (hx - sc(2), hy - sc(6)) if outfit not in NECK_OUTFITS else (cx + sc(6), cy + sc(3))
        draw_outfit(d, outfit, ax, ay, s)

    return img


def draw_chick(body, belly, dark, accent, size_scale, leg_phase, eye_open, bob, wing_up, mouth_open=False, outfit=None):
    img = new_frame()
    d = ImageDraw.Draw(img)
    cx, cy = 20, 22 - bob
    s = size_scale

    def sc(v):
        return v * s

    leg_a = 1 if leg_phase == 0 else 0
    leg_b = 0 if leg_phase == 0 else 1
    d.line([(cx - sc(2), cy + sc(8) + leg_a), (cx - sc(2), cy + sc(12) + leg_a)], fill=accent, width=2)
    d.line([(cx + sc(3), cy + sc(8) + leg_b), (cx + sc(3), cy + sc(12) + leg_b)], fill=accent, width=2)

    d.ellipse([cx - sc(9), cy - sc(9), cx + sc(9), cy + sc(9)], fill=body)
    d.ellipse([cx - sc(3), cy - sc(1), cx + sc(6), cy + sc(7)], fill=belly)

    wing_y = cy - sc(2) - (sc(3) if wing_up else 0)
    d.polygon(
        [(cx - sc(3), wing_y - sc(3)), (cx - sc(11), wing_y - sc(6)), (cx - sc(8), wing_y + sc(6)), (cx - sc(2), wing_y + sc(3))],
        fill=accent,
    )
    d.polygon([(cx + sc(1), cy - sc(9)), (cx + sc(3), cy - sc(14)), (cx + sc(4), cy - sc(8))], fill=accent)

    hx, hy = cx + sc(8), cy - sc(2)
    beak_open = sc(3) if mouth_open else 0
    d.polygon(
        [(hx, hy - sc(2) - beak_open), (hx + sc(6), hy), (hx, hy + sc(2) + beak_open)],
        fill=accent,
    )
    if eye_open:
        d.ellipse([hx - sc(4), hy - sc(3), hx - sc(1), hy], fill=dark)
    else:
        d.line([(hx - sc(4), hy - sc(1.5)), (hx - sc(1), hy - sc(1.5))], fill=dark, width=1)

    if outfit:
        ax, ay = (cx - sc(3), cy - sc(8)) if outfit not in NECK_OUTFITS else (cx + sc(3), cy + sc(3))
        draw_outfit(d, outfit, ax, ay, s)

    return img


def draw_bunny(body, belly, dark, accent, size_scale, leg_phase, eye_open, bob, ears_up, mouth_open=False, outfit=None):
    img = new_frame()
    d = ImageDraw.Draw(img)
    cx, cy = 18, 26 - bob
    s = size_scale

    def sc(v):
        return v * s

    d.ellipse([cx - sc(14), cy - sc(1), cx - sc(9), cy + sc(4)], fill=belly)

    leg_a = 2 if leg_phase == 0 else 0
    leg_b = 0 if leg_phase == 0 else 2
    d.ellipse([cx - sc(6), cy + sc(4) + leg_a, cx - sc(1), cy + sc(10) + leg_a], fill=dark)
    d.ellipse([cx + sc(3), cy + sc(4) + leg_b, cx + sc(8), cy + sc(10) + leg_b], fill=dark)

    d.ellipse([cx - sc(9), cy - sc(6), cx + sc(9), cy + sc(6)], fill=body)
    d.ellipse([cx - sc(2), cy - sc(1), cx + sc(6), cy + sc(5)], fill=belly)

    hx, hy = cx + sc(8), cy - sc(6)
    lean = 0 if ears_up else sc(2)
    d.ellipse([hx - sc(4) - lean, hy - sc(13), hx - sc(1) - lean, hy - sc(4)], fill=body)
    d.ellipse([hx + sc(1) + lean, hy - sc(14), hx + sc(4) + lean, hy - sc(5)], fill=body)
    d.ellipse([hx - sc(3.3) - lean, hy - sc(11.5), hx - sc(1.7) - lean, hy - sc(5)], fill=accent)
    d.ellipse([hx + sc(1.7) + lean, hy - sc(12.5), hx + sc(3.3) + lean, hy - sc(6)], fill=accent)
    d.ellipse([hx - sc(5), hy - sc(4), hx + sc(5), hy + sc(5)], fill=body)
    d.ellipse([hx + sc(2), hy - sc(1), hx + sc(8), hy + sc(3)], fill=belly)
    d.ellipse([hx + sc(6.5), hy + sc(0.2), hx + sc(8), hy + sc(1.8)], fill=accent)
    if eye_open:
        d.ellipse([hx, hy - sc(2), hx + sc(3), hy + sc(1)], fill=dark)
    else:
        d.line([(hx, hy - sc(0.5)), (hx + sc(3.5), hy - sc(0.5))], fill=dark, width=1)
    if mouth_open:
        d.ellipse([hx + sc(5), hy + sc(1.5), hx + sc(7.5), hy + sc(3.5)], fill=dark)

    if outfit:
        ax, ay = (hx - sc(1), hy - sc(4.5)) if outfit not in NECK_OUTFITS else (cx + sc(6), cy + sc(3))
        draw_outfit(d, outfit, ax, ay, s)

    return img


def draw_bat(body, belly, dark, accent, size_scale, leg_phase, eye_open, bob, wings_open, mouth_open=False, outfit=None):
    img = new_frame()
    d = ImageDraw.Draw(img)
    cx, cy = 18, 22 - bob
    s = size_scale

    def sc(v):
        return v * s

    spread = sc(4) if wings_open else 0
    d.polygon(
        [
            (cx - sc(2), cy - sc(2)),
            (cx - sc(14) - spread, cy - sc(6) - spread * 0.6),
            (cx - sc(12) - spread * 0.7, cy + sc(2)),
            (cx - sc(4), cy + sc(5)),
        ],
        fill=accent,
    )
    d.polygon(
        [
            (cx + sc(2), cy - sc(2)),
            (cx + sc(14) + spread, cy - sc(6) - spread * 0.6),
            (cx + sc(12) + spread * 0.7, cy + sc(2)),
            (cx + sc(4), cy + sc(5)),
        ],
        fill=accent,
    )

    leg_a = 1 if leg_phase == 0 else 0
    leg_b = 0 if leg_phase == 0 else 1
    d.line([(cx - sc(2), cy + sc(6) + leg_a), (cx - sc(2), cy + sc(9) + leg_a)], fill=dark, width=2)
    d.line([(cx + sc(2), cy + sc(6) + leg_b), (cx + sc(2), cy + sc(9) + leg_b)], fill=dark, width=2)

    d.ellipse([cx - sc(6), cy - sc(6), cx + sc(6), cy + sc(6)], fill=body)
    d.ellipse([cx - sc(2), cy - sc(1), cx + sc(4), cy + sc(5)], fill=belly)

    hx, hy = cx, cy - sc(7)
    d.ellipse([hx - sc(5), hy - sc(5), hx + sc(5), hy + sc(5)], fill=body)
    d.polygon([(hx - sc(4), hy - sc(3)), (hx - sc(6), hy - sc(9)), (hx - sc(1), hy - sc(4))], fill=body)
    d.polygon([(hx + sc(1), hy - sc(4)), (hx + sc(6), hy - sc(9)), (hx + sc(4), hy - sc(3))], fill=body)

    if eye_open:
        d.ellipse([hx - sc(3), hy - sc(1), hx - sc(1), hy + sc(1)], fill=dark)
        d.ellipse([hx + sc(1), hy - sc(1), hx + sc(3), hy + sc(1)], fill=dark)
    else:
        d.line([(hx - sc(3), hy), (hx - sc(1), hy)], fill=dark, width=1)
        d.line([(hx + sc(1), hy), (hx + sc(3), hy)], fill=dark, width=1)

    if mouth_open:
        d.ellipse([hx - sc(1.5), hy + sc(1.5), hx + sc(1.5), hy + sc(4)], fill=dark)

    if outfit:
        ax, ay = (hx, hy - sc(5)) if outfit not in NECK_OUTFITS else (cx, cy + sc(3))
        draw_outfit(d, outfit, ax, ay, s)

    return img


def draw_hedgehog(body, belly, dark, accent, size_scale, leg_phase, eye_open, bob, action, mouth_open=False, outfit=None):
    img = new_frame()
    d = ImageDraw.Draw(img)
    cx, cy = 18, 26 - bob
    s = size_scale

    def sc(v):
        return v * s

    leg_a = 1 if leg_phase == 0 else 0
    leg_b = 0 if leg_phase == 0 else 1
    d.rectangle([cx - sc(5), cy + sc(4) + leg_a, cx - sc(2), cy + sc(8) + leg_a], fill=dark)
    d.rectangle([cx + sc(2), cy + sc(4) + leg_b, cx + sc(5), cy + sc(8) + leg_b], fill=dark)

    d.pieslice([cx - sc(10), cy - sc(10), cx + sc(10), cy + sc(8)], 180, 360, fill=body)
    d.rectangle([cx - sc(10), cy - sc(1), cx + sc(10), cy + sc(5)], fill=body)
    d.ellipse([cx - sc(6), cy, cx + sc(6), cy + sc(7)], fill=belly)

    for i, sx in enumerate(range(-8, 6, 4)):
        px = cx + sc(sx)
        py = cy - sc(6) + sc((i % 2))
        d.polygon([(px, py), (px + sc(2), py - sc(6)), (px + sc(4), py)], fill=accent)

    hx, hy = cx + sc(9), cy - sc(1)
    d.polygon([(hx - sc(3), hy - sc(4)), (hx + sc(6), hy), (hx - sc(3), hy + sc(4))], fill=body)
    d.ellipse([hx + sc(3), hy - sc(1.2), hx + sc(6), hy + sc(1.2)], fill=dark)
    if eye_open:
        d.ellipse([hx - sc(1), hy - sc(2.8), hx + sc(1.5), hy - sc(0.8)], fill=dark)
    else:
        d.line([(hx - sc(1), hy - sc(1.8)), (hx + sc(1.5), hy - sc(1.8))], fill=dark, width=1)
    if mouth_open:
        d.ellipse([hx + sc(1), hy + sc(0.5), hx + sc(3.5), hy + sc(2.5)], fill=dark)

    if outfit:
        ax, ay = (hx - sc(2), hy - sc(5)) if outfit not in NECK_OUTFITS else (cx + sc(3), cy + sc(4))
        draw_outfit(d, outfit, ax, ay, s)

    return img


# Every species also ships in a few alternate color schemes, derived from its base ("classic")
# palette by rotating hue (and, for pastel, softening saturation/value) rather than hand-picking
# 24 more palettes. The rotation amount is fixed per variant so the effect reads the same way
# across every species. Keys must match the ids in VARIANTS in src/petSpecies.ts.
VARIANT_RULES = {
    "classic": None,
    "vivid": {"hue_shift": 150, "sat_mult": 1.2, "val_mult": 0.95},
    "pastel": {"hue_shift": 255, "sat_mult": 0.5, "val_mult": 1.12, "val_add": 0.04},
}


def shift_color(rgba, hue_shift=0.0, sat_mult=1.0, val_mult=1.0, val_add=0.0):
    r, g, b, a = rgba
    h, s, v = colorsys.rgb_to_hsv(r / 255, g / 255, b / 255)
    h = (h + hue_shift / 360.0) % 1.0
    s = max(0.0, min(1.0, s * sat_mult))
    v = max(0.0, min(1.0, v * val_mult + val_add))
    r2, g2, b2 = colorsys.hsv_to_rgb(h, s, v)
    return (round(r2 * 255), round(g2 * 255), round(b2 * 255), 255)


def variant_palette(base_palette, rule):
    if rule is None:
        return base_palette
    return tuple(shift_color(c, **rule) for c in base_palette)


# Keys must match the `id`s in src/petSpecies.ts. Hatchling tones are a lighter tint of the
# dragon's, same as the original single-species version. These are each species' "classic" base
# palette — variant_palette() derives "vivid"/"pastel" from them at generation time.
SPECIES = {
    "moss": {
        "draw": draw_wyrm,
        "hatchling": ((110, 201, 137, 255), (222, 247, 222, 255), (46, 92, 61, 255), (247, 214, 122, 255)),
        "dragon": ((43, 138, 96, 255), (247, 214, 122, 255), (25, 58, 45, 255), (240, 240, 245, 255)),
    },
    "cinder": {
        "draw": draw_fox,
        "hatchling": ((235, 140, 110, 255), (255, 224, 190, 255), (120, 58, 42, 255), (255, 250, 245, 255)),
        "dragon": ((214, 90, 64, 255), (255, 196, 140, 255), (110, 40, 30, 255), (255, 250, 245, 255)),
    },
    "marine": {
        "draw": draw_otter,
        "hatchling": ((110, 180, 202, 255), (222, 245, 247, 255), (46, 88, 100, 255), (60, 60, 60, 255)),
        "dragon": ((58, 140, 168, 255), (200, 236, 240, 255), (28, 72, 92, 255), (40, 40, 40, 255)),
    },
    "aurora": {
        "draw": draw_cat,
        "hatchling": ((176, 148, 227, 255), (238, 224, 255, 255), (80, 60, 120, 255), (255, 214, 240, 255)),
        "dragon": ((140, 102, 214, 255), (232, 214, 255, 255), (72, 48, 112, 255), (255, 200, 235, 255)),
    },
    "solstice": {
        "draw": draw_chick,
        "hatchling": ((240, 200, 120, 255), (255, 244, 214, 255), (140, 104, 40, 255), (232, 150, 60, 255)),
        "dragon": ((232, 178, 64, 255), (255, 236, 190, 255), (120, 86, 20, 255), (214, 130, 40, 255)),
    },
    "frost": {
        "draw": draw_bunny,
        "hatchling": ((205, 228, 240, 255), (245, 252, 255, 255), (120, 150, 168, 255), (170, 205, 225, 255)),
        "dragon": ((176, 214, 232, 255), (240, 250, 255, 255), (90, 120, 140, 255), (140, 190, 220, 255)),
    },
    "obsidian": {
        "draw": draw_bat,
        "hatchling": ((90, 80, 108, 255), (168, 150, 196, 255), (44, 38, 58, 255), (140, 110, 190, 255)),
        "dragon": ((58, 50, 74, 255), (140, 120, 168, 255), (20, 16, 28, 255), (110, 84, 158, 255)),
    },
    "bloom": {
        "draw": draw_hedgehog,
        "hatchling": ((240, 176, 196, 255), (255, 232, 236, 255), (160, 96, 116, 255), (255, 244, 220, 255)),
        "dragon": ((232, 140, 168, 255), (255, 214, 224, 255), (140, 70, 92, 255), (255, 240, 200, 255)),
    },
}


# Sheet frame order for hatchling/dragon: idle-a, idle-b(blink), walk-a, walk-b, reaction(happy)
# Cosmetic level-up rewards. "none" (the existing plain sprites) isn't suffixed onto the
# filename — only owning an outfit adds a `-<outfit>` segment. Keys must match src/outfits.ts.
OUTFITS = ["none", "bandana", "bow", "crown", "scarf", "party_hat", "wizard_hat", "cape"]


def make_species(species_id, spec):
    draw = spec["draw"]

    for variant_id, rule in VARIANT_RULES.items():
        for outfit in OUTFITS:
            suffix = f"-{outfit}" if outfit != "none" else ""
            outfit_arg = None if outfit == "none" else outfit

            body, belly, dark, accent = variant_palette(spec["hatchling"], rule)
            frames = [
                draw(body, belly, dark, accent, 1.0, 0, True, 0, False, outfit=outfit_arg),
                draw(body, belly, dark, accent, 1.0, 0, False, 0, False, outfit=outfit_arg),
                draw(body, belly, dark, accent, 1.0, 0, True, 1, True, outfit=outfit_arg),
                draw(body, belly, dark, accent, 1.0, 1, True, 0, False, outfit=outfit_arg),
                draw(body, belly, dark, accent, 1.0, 0, True, 2, True, mouth_open=True, outfit=outfit_arg),
            ]
            sheet(frames).save(os.path.join(OUT, f"{species_id}-{variant_id}-hatchling{suffix}.png"))

            body, belly, dark, accent = variant_palette(spec["dragon"], rule)
            frames = [
                draw(body, belly, dark, accent, 1.2, 0, True, 0, False, outfit=outfit_arg),
                draw(body, belly, dark, accent, 1.2, 0, False, 0, False, outfit=outfit_arg),
                draw(body, belly, dark, accent, 1.2, 0, True, 1, True, outfit=outfit_arg),
                draw(body, belly, dark, accent, 1.2, 1, True, 0, False, outfit=outfit_arg),
                draw(body, belly, dark, accent, 1.2, 0, True, 2, True, mouth_open=True, outfit=outfit_arg),
            ]
            sheet(frames).save(os.path.join(OUT, f"{species_id}-{variant_id}-dragon{suffix}.png"))


def make_egg():
    shell = (245, 236, 214, 255)
    speck = (196, 168, 122, 255)
    shine = (255, 250, 235, 255)

    def draw(show_shine):
        img = new_frame()
        d = ImageDraw.Draw(img)
        cx, cy = 20, 24
        d.ellipse([cx - 10, cy - 14, cx + 10, cy + 14], fill=shell)
        for dx, dy in [(-4, -3), (3, 2), (-2, 6), (5, -6)]:
            d.ellipse([cx + dx - 1, cy + dy - 1, cx + dx + 2, cy + dy + 2], fill=speck)
        if show_shine:
            d.ellipse([cx - 6, cy - 9, cx - 3, cy - 6], fill=shine)
        return img

    sheet([draw(False), draw(True)]).save(os.path.join(OUT, "egg.png"))


def make_treat():
    img = new_frame()
    d = ImageDraw.Draw(img)
    cx, cy = 20, 24
    red = (216, 78, 78, 255)
    shine = (255, 160, 160, 255)
    stem = (110, 82, 46, 255)
    leaf = (110, 189, 122, 255)
    d.ellipse([cx - 8, cy - 6, cx + 8, cy + 10], fill=red)
    d.ellipse([cx - 5, cy - 3, cx - 1, cy + 1], fill=shine)
    d.rectangle([cx - 1, cy - 10, cx + 1, cy - 5], fill=stem)
    d.polygon([(cx + 1, cy - 9), (cx + 7, cy - 11), (cx + 3, cy - 5)], fill=leaf)
    img.save(os.path.join(OUT, "treat.png"))


def make_toy():
    img = new_frame()
    d = ImageDraw.Draw(img)
    cx, cy = 20, 24
    ball = (124, 92, 255, 255)
    stripe = (255, 214, 92, 255)
    shine = (220, 210, 255, 255)
    d.ellipse([cx - 9, cy - 9, cx + 9, cy + 9], fill=ball)
    d.rectangle([cx - 9, cy - 2, cx + 9, cy + 2], fill=stripe)
    d.ellipse([cx - 5, cy - 6, cx - 2, cy - 3], fill=shine)
    img.save(os.path.join(OUT, "toy.png"))


# --- More treats & toys: unlocked by level (not bought), swapped in for the Feed/Play
# interaction via PetState.equippedTreatId/equippedToyId. Keys must match src/treats.ts /
# src/toys.ts ids. Same simple layered-shape style and 40x40 canvas as the classic props above.


def make_treat_cookie():
    img = new_frame()
    d = ImageDraw.Draw(img)
    cx, cy = 20, 24
    dough = (214, 168, 110, 255)
    dough_dark = (188, 140, 88, 255)
    choc = (96, 62, 42, 255)
    d.ellipse([cx - 9, cy - 9, cx + 9, cy + 9], fill=dough)
    d.ellipse([cx - 9, cy - 9, cx + 9, cy + 9], outline=dough_dark, width=1)
    for dx, dy in [(-4, -3), (3, 2), (-2, 5), (5, -4), (0, 0), (-5, 3)]:
        d.ellipse([cx + dx - 1.3, cy + dy - 1.3, cx + dx + 1.3, cy + dy + 1.3], fill=choc)
    img.save(os.path.join(OUT, "treat-cookie.png"))


def make_treat_carrot():
    img = new_frame()
    d = ImageDraw.Draw(img)
    cx, cy = 20, 24
    orange = (232, 132, 60, 255)
    orange_dark = (204, 108, 46, 255)
    green = (110, 189, 122, 255)
    d.polygon([(cx - 6, cy - 4), (cx + 6, cy - 4), (cx + 1, cy + 13)], fill=orange)
    d.line([(cx - 4, cy), (cx + 3, cy)], fill=orange_dark, width=1)
    d.line([(cx - 3, cy + 5), (cx + 2, cy + 5)], fill=orange_dark, width=1)
    d.polygon([(cx - 1, cy - 4), (cx - 5, cy - 11), (cx - 1, cy - 5)], fill=green)
    d.polygon([(cx, cy - 4), (cx, cy - 12), (cx + 1, cy - 4)], fill=green)
    d.polygon([(cx + 1, cy - 4), (cx + 4, cy - 10), (cx + 2, cy - 4)], fill=green)
    img.save(os.path.join(OUT, "treat-carrot.png"))


def make_treat_cupcake():
    img = new_frame()
    d = ImageDraw.Draw(img)
    cx, cy = 20, 25
    liner = (230, 150, 90, 255)
    liner_dark = (200, 120, 70, 255)
    frosting = (250, 225, 235, 255)
    cherry = (200, 50, 70, 255)
    d.polygon([(cx - 7, cy + 2), (cx + 7, cy + 2), (cx + 5, cy + 11), (cx - 5, cy + 11)], fill=liner)
    for x in range(cx - 6, cx + 7, 3):
        d.line([(x, cy + 2), (x + 1, cy + 11)], fill=liner_dark, width=1)
    d.ellipse([cx - 8, cy - 6, cx + 8, cy + 4], fill=frosting)
    d.ellipse([cx - 5, cy - 12, cx + 5, cy - 3], fill=frosting)
    d.ellipse([cx - 2, cy - 13, cx + 2, cy - 9], fill=cherry)
    img.save(os.path.join(OUT, "treat-cupcake.png"))


def make_toy_bone():
    img = new_frame()
    d = ImageDraw.Draw(img)
    cx, cy = 20, 24
    bone = (245, 240, 225, 255)
    shade = (215, 208, 188, 255)
    d.rounded_rectangle([cx - 9, cy - 3, cx + 9, cy + 3], radius=3, fill=bone)
    for dx, dy in [(-9, -6), (-9, 6), (9, -6), (9, 6)]:
        d.ellipse([cx + dx - 4, cy + dy - 4, cx + dx + 4, cy + dy + 4], fill=bone)
    d.ellipse([cx - 2, cy - 1, cx + 2, cy + 1], fill=shade)
    img.save(os.path.join(OUT, "toy-bone.png"))


def make_toy_yarn():
    img = new_frame()
    d = ImageDraw.Draw(img)
    cx, cy = 20, 24
    yarn = (214, 92, 130, 255)
    yarn_dark = (180, 66, 104, 255)
    d.ellipse([cx - 9, cy - 9, cx + 9, cy + 9], fill=yarn)
    d.arc([cx - 9, cy - 9, cx + 9, cy + 9], 20, 160, fill=yarn_dark, width=1)
    d.arc([cx - 9, cy - 9, cx + 9, cy + 9], 200, 340, fill=yarn_dark, width=1)
    d.arc([cx - 6, cy - 9, cx + 9, cy + 6], 100, 260, fill=yarn_dark, width=1)
    d.line([(cx + 7, cy - 2), (cx + 11, cy + 3)], fill=yarn_dark, width=1)
    img.save(os.path.join(OUT, "toy-yarn.png"))


def make_toy_frisbee():
    img = new_frame()
    d = ImageDraw.Draw(img)
    cx, cy = 20, 24
    disc = (92, 200, 190, 255)
    disc_dark = (66, 168, 158, 255)
    d.ellipse([cx - 10, cy - 5, cx + 10, cy + 5], fill=disc_dark)
    d.ellipse([cx - 10, cy - 7, cx + 10, cy + 3], fill=disc)
    d.ellipse([cx - 6, cy - 6, cx + 6, cy - 1], fill=disc_dark)
    img.save(os.path.join(OUT, "toy-frisbee.png"))


# --- Decor shop props: standalone room furnishings, bought with coins. Keys must match
# src/decor.ts ids. Same simple layered-shape style as the treat/toy props above.


def make_decor_rug():
    img = new_frame()
    d = ImageDraw.Draw(img)
    cx, cy = 20, 27
    base = (224, 122, 92, 255)
    dark = (196, 96, 68, 255)
    d.rounded_rectangle([cx - 16, cy - 6, cx + 16, cy + 7], radius=4, fill=base)
    d.rounded_rectangle([cx - 12, cy - 3, cx + 12, cy + 4], radius=3, outline=dark, width=2)
    img.save(os.path.join(OUT, "decor-rug.png"))


def make_decor_plant():
    img = new_frame()
    d = ImageDraw.Draw(img)
    cx, cy = 20, 23
    pot = (176, 110, 78, 255)
    pot_dark = (150, 90, 62, 255)
    leaf = (96, 176, 118, 255)
    leaf_dark = (72, 148, 94, 255)
    d.rectangle([cx - 8, cy + 2, cx + 8, cy + 13], fill=pot)
    d.rectangle([cx - 9, cy + 11, cx + 9, cy + 14], fill=pot_dark)
    d.ellipse([cx - 10, cy - 14, cx + 2, cy + 1], fill=leaf)
    d.ellipse([cx - 2, cy - 18, cx + 10, cy - 3], fill=leaf_dark)
    d.ellipse([cx - 6, cy - 11, cx + 6, cy + 3], fill=leaf)
    img.save(os.path.join(OUT, "decor-plant.png"))


def make_decor_lantern():
    img = new_frame()
    d = ImageDraw.Draw(img)
    cx, cy = 20, 22
    frame = (90, 74, 60, 255)
    glass = (255, 214, 120, 255)
    glow = (255, 236, 180, 255)
    d.rectangle([cx - 1, cy - 14, cx + 1, cy - 10], fill=frame)
    d.polygon([(cx - 6, cy - 10), (cx + 6, cy - 10), (cx + 8, cy - 6), (cx - 8, cy - 6)], fill=frame)
    d.rectangle([cx - 6, cy - 6, cx + 6, cy + 9], fill=frame)
    d.rectangle([cx - 4, cy - 4, cx + 4, cy + 7], fill=glass)
    d.ellipse([cx - 2, cy - 1, cx + 2, cy + 3], fill=glow)
    d.polygon([(cx - 6, cy + 9), (cx + 6, cy + 9), (cx + 8, cy + 13), (cx - 8, cy + 13)], fill=frame)
    img.save(os.path.join(OUT, "decor-lantern.png"))


def make_decor_cushion():
    img = new_frame()
    d = ImageDraw.Draw(img)
    cx, cy = 20, 27
    base = (140, 110, 214, 255)
    dark = (112, 84, 184, 255)
    d.ellipse([cx - 14, cy - 8, cx + 14, cy + 8], fill=base)
    d.arc([cx - 14, cy - 8, cx + 14, cy + 8], 200, 340, fill=dark, width=1)
    d.ellipse([cx - 3, cy - 3, cx + 3, cy + 3], fill=dark)
    img.save(os.path.join(OUT, "decor-cushion.png"))


ZONE_W, ZONE_H = 300, 600
ZONE_FLOOR_Y = 470  # kept consistent across zones so the pet's grounded position never jumps


def make_zone_room():
    """The starter zone, always unlocked."""
    W, H, floor_y = ZONE_W, ZONE_H, ZONE_FLOOR_Y
    img = Image.new("RGBA", (W, H), (0, 0, 0, 0))
    d = ImageDraw.Draw(img)

    wall = (233, 228, 245, 255)
    wall_trim = (219, 211, 237, 255)
    floor = (196, 154, 110, 255)
    floor_dark = (181, 138, 96, 255)
    rug = (124, 92, 255, 255)
    rug_dark = (104, 74, 220, 255)
    pot = (150, 96, 70, 255)
    plant = (86, 163, 108, 255)
    plant_dark = (64, 133, 84, 255)

    d.rectangle([0, 0, W, floor_y], fill=wall)
    d.rectangle([0, floor_y - 8, W, floor_y], fill=wall_trim)
    d.rectangle([0, floor_y, W, H], fill=floor)
    for x in range(0, W, 34):
        d.line([(x, floor_y), (x, H)], fill=floor_dark, width=2)
    d.line([(0, floor_y + 24), (W, floor_y + 24)], fill=floor_dark, width=1)

    # rug, centered
    d.rounded_rectangle([90, floor_y + 20, 210, H - 10], radius=8, fill=rug)
    d.rounded_rectangle([100, floor_y + 28, 200, H - 20], radius=7, outline=rug_dark, width=2)

    # potted plant, bottom-left
    d.rectangle([20, floor_y - 30, 46, floor_y + 8], fill=pot)
    d.ellipse([12, floor_y - 66, 54, floor_y - 22], fill=plant)
    d.ellipse([6, floor_y - 52, 32, floor_y - 18], fill=plant_dark)
    d.ellipse([34, floor_y - 55, 60, floor_y - 20], fill=plant_dark)

    # window, upper wall
    d.rounded_rectangle([W / 2 - 42, 90, W / 2 + 42, 170], radius=6, fill=(255, 255, 255, 180))
    d.line([(W / 2, 90), (W / 2, 170)], fill=wall_trim, width=2)
    d.line([(W / 2 - 42, 130), (W / 2 + 42, 130)], fill=wall_trim, width=2)

    img.save(os.path.join(OUT, "zone-room.png"))


def make_zone_garden():
    """Unlocks at a mid-level milestone."""
    W, H, floor_y = ZONE_W, ZONE_H, ZONE_FLOOR_Y
    img = Image.new("RGBA", (W, H), (0, 0, 0, 0))
    d = ImageDraw.Draw(img)

    sky = (200, 226, 245, 255)
    sun = (255, 214, 120, 255)
    cloud = (255, 255, 255, 200)
    grass = (150, 205, 120, 255)
    grass_dark = (128, 186, 100, 255)
    fence = (222, 200, 160, 255)
    fence_dark = (196, 172, 132, 255)
    flower_colors = [(240, 130, 150, 255), (255, 214, 92, 255), (170, 140, 230, 255)]
    stem = (96, 160, 96, 255)

    d.rectangle([0, 0, W, floor_y], fill=sky)
    d.ellipse([W - 90, 30, W - 30, 90], fill=sun)
    for cx, cy in [(70, 70), (100, 60), (85, 85)]:
        d.ellipse([cx - 24, cy - 14, cx + 24, cy + 14], fill=cloud)

    d.rectangle([0, floor_y, W, H], fill=grass)
    for x in range(6, W, 16):
        d.line([(x, floor_y + 4), (x, floor_y + 12)], fill=grass_dark, width=2)
    d.rectangle([0, floor_y, W, floor_y + 6], fill=grass_dark)

    # low picket fence along the back of the grass
    for x in range(10, W - 10, 28):
        d.rectangle([x, floor_y - 24, x + 10, floor_y + 4], fill=fence)
        d.polygon([(x, floor_y - 24), (x + 5, floor_y - 32), (x + 10, floor_y - 24)], fill=fence)
    d.rectangle([0, floor_y - 12, W, floor_y - 6], fill=fence_dark)

    # flowers scattered along the front of the grass
    for i, x in enumerate(range(24, W - 20, 46)):
        y = floor_y + 30 + (i % 2) * 14
        d.line([(x, y), (x, y + 16)], fill=stem, width=2)
        d.ellipse([x - 6, y - 6, x + 6, y + 6], fill=flower_colors[i % len(flower_colors)])

    img.save(os.path.join(OUT, "zone-garden.png"))


def make_zone_loft():
    """Unlocks at a higher-level milestone: a cozy upstairs nook."""
    W, H, floor_y = ZONE_W, ZONE_H, ZONE_FLOOR_Y
    img = Image.new("RGBA", (W, H), (0, 0, 0, 0))
    d = ImageDraw.Draw(img)

    wall = (247, 231, 224, 255)
    wall_trim = (237, 214, 203, 255)
    floor = (196, 154, 110, 255)
    floor_dark = (181, 138, 96, 255)
    bed = (240, 190, 150, 255)
    bed_dark = (214, 158, 116, 255)
    shelf = (150, 96, 70, 255)
    book_colors = [(124, 92, 255, 255), (86, 163, 108, 255), (216, 78, 78, 255)]
    porthole = (255, 255, 255, 180)

    d.rectangle([0, 0, W, floor_y], fill=wall)
    d.rectangle([0, floor_y - 8, W, floor_y], fill=wall_trim)
    d.rectangle([0, floor_y, W, H], fill=floor)
    for x in range(0, W, 34):
        d.line([(x, floor_y), (x, H)], fill=floor_dark, width=2)
    d.line([(0, floor_y + 24), (W, floor_y + 24)], fill=floor_dark, width=1)

    # string lights along the top of the wall
    light_colors = [
        (255, 214, 92, 255),
        (255, 150, 150, 255),
        (150, 210, 255, 255),
        (180, 255, 180, 255),
    ]
    d.line([(0, 16), (W, 16)], fill=wall_trim, width=1)
    for i, x in enumerate(range(14, W - 14, 26)):
        d.ellipse([x - 4, 13, x + 4, 21], fill=light_colors[i % len(light_colors)])

    # round window
    cx, cy, r = W / 2, 110, 40
    d.ellipse([cx - r, cy - r, cx + r, cy + r], fill=porthole, outline=wall_trim, width=3)
    d.line([(cx - r, cy), (cx + r, cy)], fill=wall_trim, width=2)
    d.line([(cx, cy - r), (cx, cy + r)], fill=wall_trim, width=2)

    # small shelf with books, upper-left
    d.rectangle([20, 190, 100, 200], fill=shelf)
    for i, bx in enumerate(range(24, 96, 16)):
        d.rectangle([bx, 168, bx + 12, 190], fill=book_colors[i % len(book_colors)])

    # cozy pet bed, bottom-right
    d.rounded_rectangle([W - 66, floor_y + 26, W - 14, H - 12], radius=12, fill=bed_dark)
    d.rounded_rectangle([W - 60, floor_y + 32, W - 20, H - 22], radius=10, fill=bed)

    img.save(os.path.join(OUT, "zone-loft.png"))


def make_app_icons():
    """App/home-screen icons, built from our own pixel-art dragon sprite (not a rendered emoji glyph)."""
    icons_out = os.path.join(HERE, "..", "public", "icons")
    os.makedirs(icons_out, exist_ok=True)
    bg = (124, 92, 255, 255)

    sheet = Image.open(os.path.join(OUT, "moss-classic-dragon.png")).convert("RGBA")
    frame = sheet.crop((0, 0, FRAME, FRAME))  # idle-a frame

    variants = [
        (192, "icon-192.png", 0.14),
        (512, "icon-512.png", 0.14),
        (512, "icon-512-maskable.png", 0.30),  # extra padding for Android's safe zone
    ]
    for size, name, pad_frac in variants:
        img = Image.new("RGBA", (size, size), bg)
        inner = int(size * (1 - pad_frac * 2))
        sprite = frame.resize((inner, inner), Image.NEAREST)
        pos = ((size - inner) // 2, (size - inner) // 2)
        img.paste(sprite, pos, sprite)
        img.save(os.path.join(icons_out, name))


def make_native_icon_source():
    """A large transparent source logo for @capacitor/assets (Easy Mode) to generate the native
    iOS/Android app icon and splash screen from — see 'npx @capacitor/assets generate --ios --android'.
    Kept separate from make_app_icons()'s PWA icons, which already have their own bg baked in and
    are left untouched."""
    assets_out = os.path.join(HERE, "..", "assets")
    os.makedirs(assets_out, exist_ok=True)

    sheet = Image.open(os.path.join(OUT, "moss-classic-dragon.png")).convert("RGBA")
    frame = sheet.crop((0, 0, FRAME, FRAME))  # idle-a frame

    size = 1024
    pad_frac = 0.14
    inner = int(size * (1 - pad_frac * 2))
    img = Image.new("RGBA", (size, size), (0, 0, 0, 0))
    sprite = frame.resize((inner, inner), Image.NEAREST)
    pos = ((size - inner) // 2, (size - inner) // 2)
    img.paste(sprite, pos, sprite)
    img.save(os.path.join(assets_out, "logo.png"))


for species_id, palette in SPECIES.items():
    make_species(species_id, palette)
make_egg()
make_treat()
make_toy()
make_treat_cookie()
make_treat_carrot()
make_treat_cupcake()
make_toy_bone()
make_toy_yarn()
make_toy_frisbee()
make_decor_rug()
make_decor_plant()
make_decor_lantern()
make_decor_cushion()
make_zone_room()
make_zone_garden()
make_zone_loft()
make_app_icons()
make_native_icon_source()

# Clean up filenames from before companions/color variants existed.
stale_names = ["hatchling.png", "dragon.png"]
for species_id in SPECIES:
    stale_names += [f"{species_id}-hatchling.png", f"{species_id}-dragon.png"]
for stale in stale_names:
    stale_path = os.path.join(OUT, stale)
    if os.path.exists(stale_path):
        os.remove(stale_path)

print("done")
