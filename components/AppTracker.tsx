"use client";

import { useEffect } from "react";

const CURRENT_APP_VERSION = "1.0.6"; // Jab naya release karein, yeh badal dein

export default function AppTracker() {
  useEffect(() => {
    try {
      // 1. Har device ke liye unique ID generate & save karein
      let deviceId = localStorage.getItem("hisabpro_tracker_device_id");
      if (!deviceId) {
        deviceId = "DEV_" + Math.random().toString(36).substring(2, 9).toUpperCase();
        localStorage.setItem("hisabpro_tracker_device_id", deviceId);
      }

      // 2. Dukan ka naam nikaalein (agar set hai toh, warna 'New Store')
      let businessName = "Not Set";
      const savedBusinesses = localStorage.getItem("hisabpro_businesses");
      const savedBusiness = localStorage.getItem("hisabpro_business");

      if (savedBusinesses) {
        try {
          const list = JSON.parse(savedBusinesses);
          if (Array.isArray(list) && list.length > 0 && list[0]?.businessName) {
            businessName = list[0].businessName;
          }
        } catch {}
      } else if (savedBusiness) {
        try {
          const single = JSON.parse(savedBusiness);
          if (single?.businessName) businessName = single.businessName;
        } catch {}
      }

      // 3. Roz-roz baar-baar sheet ko spam na kare (har 6 ghante me 1 baar ping karega)
      const lastPing = localStorage.getItem("hisabpro_last_ping_time");
      const now = Date.now();
      if (lastPing && now - Number(lastPing) < 6 * 60 * 60 * 1000) {
        return; // 6 ghante ke andar already report ho chuka hai
      }

      // 4. Form Silent Submit URL
      const formUrl = `https://docs.google.com/forms/d/e/1FAIpQLSeX8cBddMUfla4KnUFrT8OLWQPLfVwmWDTOY3jL3EoPHVRIbA/formResponse?entry.1388543195=${encodeURIComponent(
        deviceId
      )}&entry.2095568272=${encodeURIComponent(
        CURRENT_APP_VERSION
      )}&entry.1177986148=${encodeURIComponent(businessName)}&submit=Submit`;

      // 5. Silent Send (Bina page freeze kiye background me bhejega)
      fetch(formUrl, {
        method: "POST",
        mode: "no-cors",
      }).then(() => {
        localStorage.setItem("hisabpro_last_ping_time", String(now));
      }).catch(() => {
        // Offline hai toh quietly skip karega
      });
    } catch {
      // Safe error handling
    }
  }, []);

  return null;
}
