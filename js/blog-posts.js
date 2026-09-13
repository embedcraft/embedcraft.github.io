/*
  Manifest of local, file-based blog posts — the team's own long-form guides,
  as opposed to the Firebase-backed community posts in blog.html/dashboard.html.

  To add a new one:
  1. Make a folder under blog-posts/<slug>/ with an index.md (plain Markdown,
     GitHub-flavored — tables, fenced code, images all work) and an images/
     subfolder for anything it references.
  2. Add one entry below. That's it — blog.html and post.html both read from
     this list, nothing else needs to change.
*/
window.LOCAL_POSTS = [
  {
    slug: "mipi-csi-2",
    title: "Camera MIPI CSI-2",
    category: "Sensors & Vision",
    date: "2026-08-26",
    author: "LRX-Labs",
    summary: "What each part of a camera module does, how the ISP pipeline turns RAW Bayer output into YUV, and how MIPI CSI-2 carries that data off the sensor.",
    file: "blog-posts/mipi-csi-2/index.md",
    cover: "blog-posts/mipi-csi-2/images/MIPI-Camera.png"
  },
  {
    slug: "camera-colors",
    title: "Camera Colour Formats & Pixel Metadata",
    category: "Sensors & Vision",
    date: "2026-08-26",
    author: "LRX-Labs",
    summary: "RAW, RGB and YUV colour formats explained with one worked example carried through all three, plus how per-frame metadata rides alongside the pixels.",
    file: "blog-posts/camera-colors/index.md",
    cover: "blog-posts/camera-colors/images/MIPI-Camera.png"
  },
  {
    slug: "color-balancing",
    title: "Camera Settings & Colour Balancing",
    category: "Sensors & Vision",
    date: "2026-08-26",
    author: "LRX-Labs",
    summary: "Exposure, HDR, bit depth, white balance, denoise, sharpness and autofocus — what each control changes in the image and how its usable range is decided.",
    file: "blog-posts/color-balancing/index.md",
    cover: "blog-posts/color-balancing/images/MIPI-Camera.png"
  },
  {
    slug: "ov5640-stm32-bringup",
    title: "OV5640 → STM32H7R7 Bring-up Guide",
    category: "Sensors & Vision",
    date: "2026-08-25",
    author: "LRX-Labs",
    summary: "A hands-on MIPI CSI-2 bring-up: power rails, clock tree, D-PHY timing and the DCMIPP pipeline, from datasheet to a frame in memory. Includes the full driver source.",
    file: "blog-posts/ov5640-stm32-bringup/index.md",
    cover: "blog-posts/ov5640-stm32-bringup/images/MIPI-Camera.png"
  }
];

window.getLocalPost = function(slug){
  return window.LOCAL_POSTS.find(function(p){ return p.slug === slug; });
};
