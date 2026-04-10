/**
 * QR Format Encoders
 * Each function returns a string that encodes the given data in the
 * appropriate format for the respective QR code type.
 */

export type WifiEncryptionType = "WPA" | "WEP" | "nopass";

export interface WifiData {
  ssid: string;
  password: string;
  encryption: WifiEncryptionType;
  hidden?: boolean;
}

export interface VCardData {
  firstName: string;
  lastName: string;
  phone: string;
  email: string;
  company: string;
  title: string;
  website: string;
}

export interface EmailData {
  to: string;
  subject: string;
  body: string;
}

export interface SmsData {
  phone: string;
  message: string;
}

export const encodeWifi = (data: WifiData): string => {
  const hidden = data.hidden ? "H:true;" : "";
  // Escape special chars per the Wi-Fi QR spec
  const escape = (s: string) => s.replace(/([;,:"\\])/g, "\\$1");
  return `WIFI:T:${data.encryption};S:${escape(data.ssid)};P:${escape(data.password)};${hidden};`;
};

export const encodeVCard = (data: VCardData): string => {
  const lines = [
    "BEGIN:VCARD",
    "VERSION:3.0",
    `FN:${data.firstName} ${data.lastName}`,
    `N:${data.lastName};${data.firstName};;;`,
    data.phone ? `TEL;TYPE=CELL:${data.phone}` : "",
    data.email ? `EMAIL:${data.email}` : "",
    data.company ? `ORG:${data.company}` : "",
    data.title ? `TITLE:${data.title}` : "",
    data.website ? `URL:${data.website}` : "",
    "END:VCARD",
  ];
  return lines.filter(Boolean).join("\n");
};

export const encodeEmail = (data: EmailData): string => {
  const parts: string[] = [];
  if (data.subject) parts.push(`subject=${encodeURIComponent(data.subject)}`);
  if (data.body) parts.push(`body=${encodeURIComponent(data.body)}`);
  return `mailto:${data.to}${parts.length ? "?" + parts.join("&") : ""}`;
};

export const encodeSms = (data: SmsData): string => {
  return `SMSTO:${data.phone}:${data.message}`;
};
