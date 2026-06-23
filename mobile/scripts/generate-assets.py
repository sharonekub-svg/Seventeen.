"""Generate Aptitude app assets (icon, splash, adaptive icon, favicon).
Brand: blue #3B82F6, amber flame #F59E0B (the streak symbol), dark bg #0F1115.
"""
from PIL import Image, ImageDraw

BLUE = (59, 130, 246, 255)
AMBER = (245, 158, 11, 255)
AMBER_LIGHT = (251, 191, 36, 255)
DARK = (15, 17, 21, 255)
WHITE = (255, 255, 255, 255)


def draw_flame(draw, cx, cy, scale, body_color, inner_color):
    """Draw a stylized two-tone flame centered roughly at (cx, cy)."""
    # Outer flame (body ellipse + top triangle), single colour.
    body_rx, body_ry = 190 * scale, 210 * scale
    by = cy + 70 * scale
    draw.ellipse(
        [cx - body_rx, by - body_ry, cx + body_rx, by + body_ry], fill=body_color
    )
    draw.polygon(
        [(cx, cy - 320 * scale), (cx - 165 * scale, by - 40 * scale),
         (cx + 165 * scale, by - 40 * scale)],
        fill=body_color,
    )
    # Inner flame, lighter colour, smaller.
    in_rx, in_ry = 105 * scale, 120 * scale
    iy = cy + 110 * scale
    draw.ellipse(
        [cx - in_rx, iy - in_ry, cx + in_rx, iy + in_ry], fill=inner_color
    )
    draw.polygon(
        [(cx, cy - 130 * scale), (cx - 90 * scale, iy - 20 * scale),
         (cx + 90 * scale, iy - 20 * scale)],
        fill=inner_color,
    )


def make_icon(path, size=1024, bg=BLUE, transparent=False):
    img = Image.new("RGBA", (size, size), (0, 0, 0, 0) if transparent else bg)
    d = ImageDraw.Draw(img)
    cx = size / 2
    cy = size / 2 - size * 0.02
    draw_flame(d, cx, cy, size / 1024, WHITE, AMBER)
    img.save(path)
    print("wrote", path)


def make_splash(path, w=1284, h=1284):
    img = Image.new("RGBA", (w, h), DARK)
    d = ImageDraw.Draw(img)
    draw_flame(d, w / 2, h / 2 - 20, 0.62, BLUE, AMBER)
    img.save(path)
    print("wrote", path)


def make_favicon(path, size=48):
    big = Image.new("RGBA", (512, 512), BLUE)
    d = ImageDraw.Draw(big)
    draw_flame(d, 256, 250, 0.5, WHITE, AMBER)
    big.resize((size, size), Image.LANCZOS).save(path)
    print("wrote", path)


if __name__ == "__main__":
    import os
    out = os.path.join(os.path.dirname(__file__), "assets")
    os.makedirs(out, exist_ok=True)
    make_icon(os.path.join(out, "icon.png"))               # iOS (opaque blue)
    make_icon(os.path.join(out, "adaptive-icon.png"),      # Android foreground
              transparent=True)
    make_splash(os.path.join(out, "splash.png"))
    make_favicon(os.path.join(out, "favicon.png"))
