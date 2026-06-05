import { Request } from "express";

export const getPublicUrl = (req: Request, subPath: string) => {
  const forwardedPrefix = req.get("x-forwarded-prefix") ?? "";
  const publicBaseUrl = `${forwardedPrefix}${req.baseUrl}`;
  const publicUrl = `${publicBaseUrl}${subPath}`;

  return publicUrl;
};
