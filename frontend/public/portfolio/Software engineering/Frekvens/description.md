link: https://frekvenscollective.com/

## Description (en)

Frekvens is an Oslo underground DJ collective, and this site is their public face: who they are, who plays with them, and where to show up next. I built it so the story reads clearly in both Norwegian and English, with space for the core team, a living roster of DJs, and individual event pages with posters, photo galleries, and links out to tickets or Resident Advisor when that is how a night is announced.

Day-to-day content stays maintainable without a heavy CMS. Team profiles live in JSON; events are described in bilingual JSON too, and a small script rebuilds gallery lists from folders before you run dev or ship a build. The lineup you see on the site is pulled straight from a shared Google Sheet the collective can edit, using public CSV export from the browser (no Apps Script). Instagram on the page is a normal embed; there is an optional script to fetch posts via the Graph API if you configure credentials and run it yourself.

Visually it stays in a dark, red-accented lane that fits club culture. The hero uses a custom OGL shader (“threads”) for drifting lines behind the wordmark; elsewhere the stack is familiar React 18 and TypeScript on Vite, React Router for separate home, people, events, and event-detail routes, Tailwind and Framer Motion for layout and motion, plus carousel and UI pieces in a shadcn-style setup. It deploys to GitHub Pages from Actions, with a custom domain and the usual SPA fallback so deep links keep working.

## Description (no)

Frekvens er et undergrunns-DJ-kollektiv i Oslo, og denne siden er deres offentlige ansikt: hvem de er, hvem som spiller med dem, og hvor du kan møte dem neste gang. Jeg bygde den slik at fortellingen fungerer på både norsk og engelsk, med plass til kjerneteam, en levende DJ-roster og egne arrangementsider med plakater, bildegallerier og lenker til billetter eller Resident Advisor når det er slik kvelden annonseres.

Innholdet skal være enkelt å holde i hevd uten et tungt CMS. Teamprofiler ligger i JSON; arrangementer beskrives også i tospråklig JSON, og et lite skript bygger opp gallerilister fra mapper før du kjører dev eller produksjonsbygg. Oppstillingen du ser på siden hentes fra et delt Google-ark kollektivet kan redigere, via offentlig CSV-eksport i nettleseren (uten Apps Script). Instagram på siden er et vanlig innbygg; det finnes et valgfritt skript for å hente innlegg via Graph API hvis du setter miljøvariabler og kjører det manuelt.

Visuelt ligger den i et mørkt, rødaksentert uttrykk som passer klubbkultur. Heroen bruker en egen OGL-shader («tråder») med drivende linjer bak ordmerket; ellers er stacken kjent React 18 og TypeScript på Vite, React Router for forsiden, folk, arrangementer og detaljsider, Tailwind og Framer Motion for layout og bevegelse, pluss karusell og UI-komponenter i shadcn-stil. Den publiseres til GitHub Pages med GitHub Actions, eget domene og vanlig SPA-fallback slik at dype lenker fortsatt fungerer.
