import { createCanvas, loadImage } from "@napi-rs/canvas";
import axios from "axios";

export default async function handler(req, res) {
  const { avatar1, avatar2 } = req.query;

  if (!avatar1 || !avatar2) {
    return res.status(400).json({ error: "Missing avatar1 or avatar2 URL" });
  }

  try {
    // Load template (466x659 base image)
    const template = await loadImage("https://i.ibb.co/YFJrLSpL/image.jpg");

    // Load avatar 1
    const avatar1Resp = await axios.get(avatar1, { responseType: "arraybuffer" });
    const avatarImg1 = await loadImage(Buffer.from(avatar1Resp.data));

    // Load avatar 2
    const avatar2Resp = await axios.get(avatar2, { responseType: "arraybuffer" });
    const avatarImg2 = await loadImage(Buffer.from(avatar2Resp.data));

    // Create canvas with template size
    const canvas = createCanvas(466, 659);
    const ctx = canvas.getContext("2d");

    // Draw background template
    ctx.drawImage(template, 0, 0, 466, 659);

    // === Position avatars inside template (from GoatBot cmd) ===
    ctx.drawImage(avatarImg1, 150, 76, 110, 110);   // avatar1
    ctx.drawImage(avatarImg2, 245, 305, 100, 100);  // avatar2

    // Output image
    res.setHeader("Content-Type", "image/png");
    const buffer = await canvas.encode("png");
    return res.send(buffer);

  } catch (err) {
    console.error("Canvas error:", err);
    return res.status(500).json({ error: "Error generating image" });
  }
}
