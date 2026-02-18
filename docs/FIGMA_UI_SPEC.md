# Kalkulačka výdělků kurýrů – Figma UI spec

Use this spec to recreate the app UI in Figma so you can iterate on visuals. All values match the current implementation (Tailwind / app styles).

---

## 1. Color palette

| Role | Hex | Usage |
|------|-----|--------|
| **Background (page)** | `#12171D` | Body, page background |
| **Card / input fill** | `#1A1F26` | Card background, input background, secondary button bg |
| **Card hover** | `#1A1F26` | Secondary button hover (slightly lighter in code: same) |
| **Border** | `#2A2F36` | Card border, input border, dividers |
| **Focus ring** | `#4A5568` | Input/checkbox focus outline |
| **Text primary** | `#FFFFFF` | Headings, primary labels, key numbers |
| **Text secondary** | `#B0B5BA` | Subtitle, descriptions, secondary labels |
| **Text muted** | `#8A8F94` | Captions, “n=”, italic reason text |
| **Link / accent** | `#E5E7EB` | Link default; hover = white |
| **Primary button** | Fill `#FFFFFF`, text `#12171D` | “Vypočítat”, “Zpět”, “Sdílet” (when not copied) |
| **Primary button hover** | Fill `#E5E7EB` | Same text color |
| **Error** | `#F87171` (Tailwind red-400) | Validation messages |

---

## 2. Typography

- **Fonts (Google Fonts)**  
  - **Body / UI:** Inter, 400 + 500  
  - **Headings:** Space Grotesk, 400 + 500  

- **Styles**

| Element | Font | Weight | Size | Line height | Color |
|---------|------|--------|------|-------------|--------|
| Page title (h1) | Space Grotesk | 500 | 30px | normal | #FFFFFF |
| Subtitle | Inter | 400 | 16px | normal | #B0B5BA |
| Section title (h2) | Space Grotesk | 500 | 20px | normal | #FFFFFF |
| Card title (h3) | Inter | 500 | 16px | normal | #FFFFFF |
| Label | Inter | 500 | 14px | normal | #FFFFFF |
| Body | Inter | 400 | 14px | normal | #B0B5BA |
| Body small | Inter | 400 | 12px | normal | #8A8F94 or #B0B5BA |
| Link | Inter | 400 | 14px | normal | #E5E7EB, underline |
| Error | Inter | 400 | 14px | normal | #F87171 |
| Button | Inter | 500 | 16px (base) | normal | per button |

---

## 3. Spacing & layout

- **Page:** Centered column, max width **672px** (max-w-2xl = 42rem).  
- **Card:** Padding **32px** (p-8); border radius **8px** (rounded-lg).  
- **Section spacing:**  
  - Between form sections / blocks: **24px** (space-y-6).  
  - Between content sections on výsledek: **32px** (space-y-8).  
  - Between cards in a group: **12px** (space-y-3).  
- **Label ↔ input:** **8px** (mb-2).  
- **Error below field:** **4px** (mt-1).  
- **Divider:** 1px, color `#2A2F36`; spacing above content after divider **24px** (pt-6) or **16px** (pt-4).  
- **Gap between checkbox and label:** **12px** (gap-3).  
- **Button padding:** **12px 24px** (py-3 px-6).  
- **Input padding:** **8px 16px** (py-2 px-4).

---

## 4. Components (for Figma)

### 4.1 Page shell (all pages)

- **Outer:** Full viewport, background `#12171D`, flex center, padding 16px.
- **Container:** Width 100%, max 672px.
- **Card:**  
  - Background `#1A1F26`, border 1px `#2A2F36`, radius 8px, padding 32px, shadow (subtle).  
  - **Header:** Title (h1) + optional subtitle; 24px margin below (mb-6).  
  - **Divider:** 1px `#2A2F36`, then 24px padding top for content.

### 4.2 Form – text input / select

- **Label:** 14px, weight 500, #FFFFFF, 8px below label before field.
- **Field:**  
  - Height ~40px (or auto with py-2), full width.  
  - Background `#12171D`, border 1px `#2A2F36`, radius 8px.  
  - Padding 8px 16px.  
  - Text 14px, #FFFFFF.  
  - Focus: 2px ring `#4A5568`, no border change.
- **Error:** 14px, #F87171, 4px below field.

### 4.3 Checkbox + label

- Checkbox: 20×20px, border `#2A2F36`, background `#12171D`, accent `#4A5568`, radius 4px.
- Label: 14px, #B0B5BA, with inline link (#E5E7EB, underline).  
- 12px horizontal gap between checkbox and label; align start for multi-line.

### 4.4 Primary button

- Background #FFFFFF, text #12171D, 500 weight, 16px, padding 12px 24px, radius 8px.  
- Hover: background #E5E7EB.

### 4.5 Secondary button (e.g. “Sdílet”)

- Background #12171D, border 1px #2A2F36, text #FFFFFF, 500 weight, padding 12px 24px, radius 8px.  
- Hover: background #1A1F26.

### 4.6 Stat card (výsledek – “Vaše statistiky” / benchmark blocks)

- Background `#12171D`, border 1px `#2A2F36`, radius 8px.  
- Padding: **24px** (p-6) for main stat block, **20px** (p-5) for smaller cards.  
- Title (h2/h3): 20px or 16px, #FFFFFF, 16px or 8px below.  
- Rows: label left #B0B5BA, value right #FFFFFF (medium/large).  
- Optional divider inside: 1px #2A2F36, 12px padding top.

### 4.7 Recommendation card

- Same as stat card (p-5, rounded-lg, border #2A2F36).  
- Title (h3) #FFFFFF, 8px mb.  
- Description 14px #B0B5BA, 8px mb.  
- Reason 12px #8A8F94, italic.

### 4.8 Link

- Color #E5E7EB, underline, underline-offset 2px.  
- Hover: #FFFFFF.

---

## 5. Screens to build in Figma

1. **Kalkulacka (form)**  
   PageShell + title “Kalkulačka výdělků kurýrů” + subtitle.  
   Fields (in order): E-mail, Město (dropdown), Platforma (dropdown), Odpracované hodiny, Počet doručení, Výdělek za týden (CZK).  
   One consent checkbox with link “Zásad ochrany osobních údajů”.  
   Primary button “Vypočítat”.

2. **Výsledek**  
   PageShell + title “Výsledky výpočtu” + subtitle “Město • Platforma”.  
   One “Vaše statistiky” card (hodinová sazba, výdělek na doručení, měsíční odhad).  
   Short note text.  
   Section “Doporučení” with 3 recommendation cards.  
   Section “Benchmark” with 3 placeholder blocks (e.g. “Celkem”, “Město”, “Platforma”).  
   Footer: primary “Zpět” + secondary “Sdílet”.

3. **Privacy**  
   PageShell + title “Zásady ochrany osobních údajů” + subtitle.  
   Sections: Úvod, Shromažďovaná data, Účel, Použití, Uchovávání, Vaše práva, Kontaktní informace, Změny.  
   Body text #B0B5BA, section headings #FFFFFF (Space Grotesk).  
   Primary button “Zpět na kalkulačku”.

---

## 6. Optional: import from dev

- **Screenshots:** Run the app (`npm run dev`), open `/`, `/vysledek?h=40&d=80&e=12000&c=Praha&p=Wolt&b=1`, and `/privacy`; capture full-page screenshots and place them in Figma as references.
- **Figma Dev Mode:** After building frames in Figma, use Dev Mode to compare with this spec and with the live app for spacing and colors.

If you want, the next step can be a small “Figma” section in the main README that links to this file and to any Figma file URL you add later.
