import { createCanvas, loadImage } from "@napi-rs/canvas";
import axios from "axios";

export default async function handler(req, res) {
  const { av1, av2 } = req.query;

  if (!av1 || !av2) {
    return res.status(400).json({ error: "Missing avatar URLs. Use ?av1=URL&av2=URL" });
  }

  try {
    // Load template
    const template = await loadImage("https://i.ibb.co/YFJrLSpL/image.jpg");

    // Load avatars
    const av1Resp = await axios.get(av1, { responseType: "arraybuffer" });
    const av2Resp = await axios.get(av2, { responseType: "arraybuffer" });
    const avatar1 = await loadImage(Buffer.from(av1Resp.data));
    const avatar2 = await loadImage(Buffer.from(av2Resp.data));

    // Canvas same size as template
    const canvas = createCanvas(template.width, template.height);
    const ctx = canvas.getContext("2d");

    // Draw background
    ctx.drawImage(template, 0, 0, template.width, template.height);

    // === Circle helper function ===
    const drawCircleImage = (img, x, y, size) => {
      ctx.save();
      ctx.beginPath();
      ctx.arc(x + size / 2, y + size / 2, size / 2, 0, Math.PI * 2, true);
      ctx.closePath();
      ctx.clip();
      ctx.drawImage(img, x, y, size, size);
      ctx.restore();
    };

    // === Place avatars (adjust positions to match template) ===
    drawCircleImage(avatar1, 150, 76, 110); // top person
    drawCircleImage(avatar2, 245, 305, 100); // bottom person

    // Output image
    res.setHeader("Content-Type", "image/png");
    const buffer = await canvas.encode("png");
    return res.send(buffer);
  } catch (err) {
    console.error("Canvas error:", err);
    return res.status(500).json({ error: "Error generating image" });
  }
}
