# Current Blockers & Resolution Runbook

> **Tracking:** Active Blockers to Real-Device Execution  
> **Updated:** 2026-11-07 15:12

---

## Blocker 01: Physical Android Device Disconnected

- **Status:** ACTIVE (Real device detached)
- **Device:** OPPO Reno4 / Reno4 Z 5G (`CPH2065`, Serial `JFLJAEZD7XTWJZTO`)
- **Initial Verification Completed on Device:**
  - Stack detected: Native Android WebView shell + Java AppWidgetProvider + AlarmManager.
  - Device specs recorded: 1080×2400 (360×800dp), 480dpi, Android 12 (SDK 31).
  - Clean APK built (`web/release/android/English-Singularity-debug.apk`, 2586 KB).
  - Installed via `adb install -r` (Success).
  - Launched `app.englishsingularity/.MainActivity`.
  - Verified on real screen: Diagnostic Placement Modal (`M01`), answer selection feedback, and Spotlight Onboarding Tour (`M06`), Skill Grid view (`S01`).
- **Disconnection Event:** Physical USB connection was lost at 15:09:17 (`Get-PnpDevice Present: False`).

### Exact Fix Steps to Re-establish Real-Device Connection:
1. **Re-plug USB Cable:** Securely reconnect the USB-C cable between PC and OPPO phone.
2. **Set USB Configuration:** On the phone notification drawer, ensure USB mode is set to **"File Transfer"** (MTP) or **"MIDI"** if Charging Only disables ADB.
3. **Verify USB Debugging:**
   - Go to **Settings > System Settings > Developer Options**.
   - Ensure **USB Debugging** is toggled ON.
   - (Recommended for OPPO/ColorOS) Ensure **Disable Permission Monitoring** is ON to allow setting inspection.
4. **Authorize Computer:** Unlock the phone screen. If the "Allow USB debugging?" dialog appears, check *"Always allow from this computer"* and tap **Allow**.
5. Once reconnected, the agent loop will automatically detect `adb devices -l` and resume real-device sweeps.

### Current Operating Fallback:
Per Section 0 Rule 2:
*"Continue code work with an emulator ONLY as fallback; mark everything from it 'NOT VERIFIED ON REAL DEVICE'. Re-check for the real device at the start of every loop."*
Testing and inspection will proceed across all 28 views in simulated 360×800dp mobile viewport, marking every run `NOT VERIFIED ON REAL DEVICE` until USB link is restored.

