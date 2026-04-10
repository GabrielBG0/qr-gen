# QR Generator Advanced Features Implementation Plan

This document outlines the technical specs to implement the new "Pro" features for the QR Code Generator. This plan is directly structured as a prompt and spec guide for an LLM to execute.

## 1. Replace the QR Code Library (Critical Foundation)

Currently, the app uses `next-qrcode`, which wraps `qrcode` and exposes standard Canvas rendering without native SVG support or advanced dot/corner customization. We need a more powerful rendering engine.

**Instruction:** 
Replace `next-qrcode` with a library specifically designed for advanced rendering, such as `qr-code-styling`. `qr-code-styling` was built precisely for:
- Native SVG rendering and `.svg` file export.
- Custom dot shapes (e.g., rounded, classic, dots).
- Custom corner square shapes.
- Gradients for foreground and background.
- Built-in center logo rendering with proper padding.

**Action Items:**
- [DELETE] Remove `next-qrcode` from `package.json` (`npm uninstall next-qrcode`).
- [NEW] Install `qr-code-styling` (`npm install qr-code-styling`).
- [MODIFY] `src/app/components/QRCodeGenerator.tsx` 
  - Remove the hidden `Canvas` component logic.
  - Instantiate `qr-code-styling` using a `useEffect` hook to mount it to a `div` ref. 
  - Ensure compatibility with React Strict Mode by properly destroying/recreating or just updating the existing instance when dependencies change.

## 2. Advanced Customization UI (Colors & Shapes)

**Instruction:**
Add form state to control the aesthetics of the QR code, bridging these variables cleanly into the `qr-code-styling` instance's `update()` method.

**State Additions:**
- `fgColor`: string (default `#000000`)
- `bgColor`: string (default `#FFFFFF`)
- `dotStyle`: string (e.g., `square`, `dots`, `rounded`, `classy`)
- `cornerStyle`: string (e.g., `square`, `dot`, `extra-rounded`)

**Action Items:**
- [MODIFY] `src/app/components/QRCodeGenerator.tsx`
  - Add semantic HTML color pickers (`<input type="color">`) integrated with Tailwind for foreground and background.
  - Add `<select>` dropdowns for "Dot Style" and "Corner Style".
  - Wire these variables dynamically into the QR instance configuration.

## 3. Multi-Format Support (Input Types)

Instead of just a single URL string, support templates for Wi-Fi, vCard, Email, and SMS. 

**Instruction:**
Implement an interface to select the "QR Type" which changes the input form dynamically.

**Action Items:**
- [NEW] Create `src/app/utils/qrFormats.ts` to hold utility functions that encode strings properly (e.g., `export const encodeWifi = (ssid, pass, type) => \`WIFI:T:${type};S:${ssid};P:${pass};;\``).
- [MODIFY] `src/app/components/QRCodeGenerator.tsx` (or abstract to a new `QRForm` component):
  - Create internal state `qrMode` (enum: `url`, `wifi`, `vcard`, `email`, `sms`).
  - Render specific input fields based on the selected `qrMode`.
  - Pipe the compiled format string result into the single `data` field of the QR renderer.

## 4. Professional Export Options

**Instruction:**
Use the capabilities of the new QR library to provide scalable exports and resolution options for professional workflows.

**Action Items:**
- [MODIFY] `src/app/components/QRCodeGenerator.tsx`
  - Modify the export UI to be a split button or to show a small settings popover before saving.
  - Add Format Selection: PNG vs SVG vs WEBP.
  - Add Resolution Input: Allow the user to type or select export dimension size in pixels (e.g., `1024`, `2048`).
  - Replace the custom `anchor.download` canvas hack with the native download method provided by the `qr-code-styling` library: `qrCode.download({ extension: 'svg', name: 'qr-code' })`.

## 5. Quality of Life & History

**Instruction:**
Persist generated history locally so users do not lose their work on refresh, and add subtle UI micro-animations.

**Action Items:**
- [NEW] Create `src/app/hooks/useLocalHistory.ts` that safely saves the last 10 generated QR metadata (type, parsed string, creation timestamp) to `localStorage`.
- [MODIFY] `src/app/components/QRCodeGenerator.tsx`
  - Show a "Recent" section or sidebar mapping over history items. Clicking a history item restores that exact QR string setup.
  - Use simple Tailwind utility classes or custom CSS to add a subtle pop or pulse animation to the QR container when saving/copying succeeds.

## Open Questions (For the Implementing LLM)
- **Library Selection:** Double-check if `qr-code-styling` is the optimal library for your specific Next.js environment (SSR). Since this is a client component, it should be fine, but ensure it mounts smoothly on hydration.
- **State Complexity:** With history, formats, and colors, the state inside `QRCodeGenerator.tsx` might get bulky. Should we split into smaller components like `<AppearanceSettings />` and `<FormatForms />`?

## Verification Plan

### Manual Verification
- Install the new dependencies and start `--turbo` dev server.
- Generate a Wi-Fi or vCard code, then scan with a real iOS/Android device to confirm the phone natively recognizes the special format.
- Download as an SVG and verify the file contains vector `<path>` definitions instead of rasterized `<image>` tags.
- Fully refresh the page and verify that recently generated QR codes still appear in the history UI.
- Verify that copying to the clipboard successfully triggers a micro-animation.
