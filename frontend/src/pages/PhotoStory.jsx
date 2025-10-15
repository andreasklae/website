import { useState, useEffect, useRef } from 'react'
import { createPortal } from 'react-dom'
import { useParams, useNavigate } from 'react-router-dom'
import { useLanguage } from '../contexts/LanguageContext'
import { photographyStories } from '../utils/data.jsx'
import LanguageToggle from '../components/LanguageToggle'
import { getAssetPath } from '../utils/paths'
import JournalEntry from '../components/JournalEntry'
import ImageCarousel from '../components/ImageCarousel'
import PhotoCarousel from '../components/PhotoCarousel'

// Hardcoded text extracted from story.md for clarity and language control
const STORY_TEXT = {
  'stavern-sommer-2025': {
    'part-1': {
      en: `Long Norwegian summer days with late sunsets. We barbecued for dinner, swapped stories, and watched the evening light linger over the sea. The evenings were always filled by laughter, fueled by nostalgia and friendship (and some drinks of course). Familiar, and exactly what a cabin summer should feel like.`,
      no: `Lange Norske skjærgårds sommerdager med sene solnedganger. Vi grillet til middag, delte historier og så kveldlyset henge over sjøen. Kveldene var alltid fylt med latter, nostalgi og vennskap (og drikke såklart). Akkurat slik en hyttesommer skal være.`
    },
    'part-2': {
      en: `We wandered along worn paths and smooth rocks, swimming when the sun came out and playing volleyball when the wind allowed. Dinner were always followed by walks, chasing the kind of sunsets that make you forget the time, but remember the moment.`,
      no: `Vi vandret langs stier og svaberg, badet når sola kom og spilte volleyball når vinden tillot det. Middag ble alltid etterfulgt av gåturer i vakre solnedganger som fikk oss til å glemme tiden, men huske øyeblikket.`
    },
    'part-3': {
      en: `Saturday was noise and color. We partied at Stavernfestivalen. Music in every direction, glitter in the air, and a shared smiling buzz where everyone seemed to be having a great time. Friends, crowds, and moments that only exist when nobody’s looking at the watch.`,
      no: `Lørdagen var lyd og farger. Vi festet på Stavernfestivalen. Musikk fra alle kanter, glitter i lufta og en felles god stemning der alle så ut til å kose seg. Venner, folkemengder og øyeblikk som bare finnes når ingen ser på klokka.`
    },
    'part-4': {
      en: `I left the main road and followed a field that caught my eye. A doe leapt across the grass and vanished, I chased it and suddenly found myself standing in the middle of the field among golden tall straws, soft light, and a warm silence. I kept to the field for a while, then met up with my friends again and walked the rest of the way together.`,
      no: `Jeg forlot hovedveien og fulgte et jorde jeg fikk øye på. Et rådyr hoppet gjennom gresset og forsvant, og plutselig sto jeg midt i åkeren bland gylne, høye strå. mildt lys og en varm stillhet. Jeg holdt meg i jordet en stund, før jeg møtte vennene mine igjen og gikk resten av veien sammen.`
    }
  },
  'portugal-2025': {
    'part-1': {
      en: `We started the trip in Ericeira, where we stayed at a surf camp from the 3rd to the 7th of June. The camp had this flowing rhythm where people came and went — some only stayed for a few days, others for weeks — but everyone we met was warm, friendly, and social. Our days settled into a pattern of surf lessons in the morning and afternoon, with evenings spent hanging out, drinking, and talking with whoever was around. None of us became great surfers overnight, but the process of learning — falling, trying again, slowly getting the hang of it — was its own fun.

One evening we ended up at a rooftop party above a surf shop. The place was packed, people spilling out in every direction, and a live band kept the energy high. It was one of those nights where it felt like everyone there was sharing the same wave of excitement, even far from the ocean.`,
      no: `Vi startet turen i Ericeira, hvor vi bodde på en surfecamp fra 3. til 7. juni. Campen hadde en flytende rytme der folk kom og gikk — noen var bare innom i noen dager, andre ble i ukevis — men alle vi møtte var varme, vennlige og sosiale. Dagene fant formen med surfetimer morgen og ettermiddag, og kveldene gikk med til å henge, drikke og prate med dem som var rundt. Ingen av oss ble gode surfere over natten, men selve læringen — å falle, prøve igjen, sakte få taket på det — var en glede i seg selv.

En kveld havnet vi på en takfest over en surfebutikk. Det var stappfullt, folk i alle retninger, og et liveband holdt energien oppe. En sånn kveld der det føltes som om alle delte den samme bølgen av begeistring — selv langt fra havet.`
    },
    'part-2': {
      en: `On the 8th and 9th we moved into the city, trading the waves for winding streets and viewpoints. Lisbon was all about miradouros — we hopped between them, pausing for beers or lunch while taking in views over the city. We ate amazing food, wandered through the neighborhoods, and let ourselves get lost in the atmosphere. One night we went out to party, moving between bars, clubs, and streets full of people. It wasn’t about a single venue but about soaking up the city’s energy as a whole.`,
      no: `8. og 9. dro vi inn til byen, byttet bølger med svingete gater og utsiktspunkter. Lisboa handlet om miradouros — vi hoppet fra sted til sted, stoppet for øl eller lunsj mens vi så utover byen. Vi spiste nydelig mat, vandret gjennom nabolagene og lot oss gå litt vill i stemningen. En kveld dro vi ut for å feste, mellom barer, klubber og folketette gater. Det handlet ikke om ett sted, men om å suge til seg byens energi.`
    },
    'part-3': {
      en: `From the 10th to the 12th we stayed in Caparica, in a small house literally on the beach. It felt almost too good to be true: the house came with a surfboard, a JBL partybox, a grill, and even a complimentary bottle of red wine. Our days were spent swimming, surfing, tanning, and drinking at a beach bar.

We got to know the neighbor next door, whose grandfather had built the house and passed it down through the family. He appreciated that we stopped to chat, and one day he even gave us a bag of charcoal to use for the grill. Later, local fishermen came ashore and sold us fresh fish straight from their boats. We grilled it outside as the sun dropped lower, salt still in the air from the waves.`,
      no: `Fra 10. til 12. bodde vi i Caparica, i et lite hus bokstavelig talt på stranden. Det føltes nesten for godt til å være sant: huset kom med surfebrett, JBL partyboks, grill og til og med en flaske rødvin. Dagene gikk med til bading, surfing, soling og en drink på strandbaren.

Vi ble kjent med naboen ved siden av, hvis bestefar hadde bygget huset og latt det gå i arv i familien. Han satte pris på at vi stoppet for å prate, og en dag ga han oss til og med en pose grillkull. Senere kom lokale fiskere inn og solgte fersk fisk rett fra båtene. Vi grillet ute mens sola sank, og saltet fra bølgene hang fortsatt i lufta.`
    },
    'part-4': {
      en: `Caparica also became the setting for one of the best nights of the trip. We invited friends who were staying elsewhere to come over for dinner. Everyone brought food and drinks, and we cooked together on the grill in the sand. It wasn’t carefully planned — just a spontaneous gathering sparked by being in a place that begged to be shared. The house turned into a meeting point, laughter spilling out to the beach as we ate, drank, and enjoyed the night.`,
      no: `Caparica ble også rammen for en av turens beste kvelder. Vi inviterte venner som bodde andre steder til middag. Alle tok med mat og drikke, og vi lagde mat sammen på grillen i sanden. Det var ikke nøye planlagt — bare en spontan samling, født av et sted som ba om å deles. Huset ble et samlingspunkt, med latter som rant ut på stranden mens vi spiste, drakk og nøt kvelden.`
    },
    'part-5': {
      en: `The west coast location gave us front-row seats to sunsets over the Atlantic. Each evening the sky shifted from orange to purple as we ate dinner with the waves as background music. On the last night, when the sun was hanging just above the horizon, I walked along the beach with a friend. The light was low, the air calm, and the day seemed to stretch endlessly before fading into night. It was the perfect ending to a trip that had been adventurous, social, and filled with moments that felt almost too spontaneous to be real.`,
      no: `Vestkysten gav oss første rad til solnedganger over Atlanteren. Hver kveld skiftet himmelen fra oransje til lilla mens vi spiste middag med bølgene som bakgrunnsmusikk. Den siste kvelden, da solen hang like over horisonten, gikk jeg langs stranden med en venn. Lyset var lavt, luften rolig, og dagen virket å strekke seg uendelig før den tonet ut i natt. En perfekt avslutning på en tur som var eventyrlig, sosial og full av øyeblikk som nesten var for spontane til å være virkelige.`
    }
  },
  'semester-in-berlin': {
    'part-1': {
      en: `We left Oslo with a car full of luggage and expectations. The plan was improvised but generous: a night on a friend’s couch in Copenhagen, another on a borrowed floor in Berlin, then a quick detour through the Dutch countryside to collect the boxes my roommate had stashed with his uncle. The autobahn was the part everyone warns you about, and they’re right. There’s a moment when you press the accelerator and you realise how small your car feels among trucks and low, sleek sedans eating the asphalt. It was both exhilarating and faintly terrifying, a reminder that distance isn’t only kilometres but the speed you dare to hold. When we finally rolled back into Berlin, the car was heavier but our shoulders loosened. The apartment was empty and echoing, but it was ours. We carried in the suitcases, then the half-forgotten belongings from the Dutch attic, and suddenly the journey settled. After nights on borrowed beds, unfurling a mattress in our own place felt like the true arrival.`,
      no: `Vi dro fra Oslo med bilen full av bagasje og forventninger. Planen var improvisert, men god: en natt på en kompis sin sofa i København, en natt på et lånt gulv i Berlin, og deretter en tur innom Nederland for å hente eiendelene romkameraten min hadde lagret hos onkelen sin. Autobahnen er den delen alle advarer deg om, og de har rett. Det øyeblikket du gasser og kjenner hvor liten bilen føles mellom trailere og lave, raske biler som sluker asfalt, det er både spennende og litt skremmende. Avstand handler ikke bare om kilometer, men om farten du tør å holde. Da vi omsider rullet tilbake inn i Berlin, var bilen tyngre, men skuldrene lettere. Leiligheten var tom, men den var vår. Vi bar inn koffertene, deretter de halvglemte tingene fra loftet i Nederland, og plutselig falt ting på plass. Etter netter på lånte madrasser føltes det å legge seg sin egen seng som den ekte ankomsten.`
    },
    'part-2': {
      en: `September in Berlin meant trading car keys for bike locks. The city opened up on two wheels: canals glinting in the morning, graffiti blinking by in layers, kebab stands perfuming the air. From Maybachufer we pushed off each day, tracing the canal before diving into Neukölln and Kreuzberg neighbourhoods. The ride was its own education. You learn the city by tracing its arteries, crossing canals, following bike lanes that seem to lead straight into new worlds. Every turn introduced someone unforgettable: a painter hauling canvases, a goth riding backwards on a bike, a saxophonist rehearsing to the traffic. In Berlin you’re never the strangest person on the street, and that realisation felt oddly comforting.`,
      no: `September i Berlin betydde å bytte bilnøkler mot sykkellås. Byen åpnet seg på to hjul: kanaler som glitret om morgenen, graffiti som blinket forbi, kebabsjapper som parfymerte luften. Fra Maybachufer trillet vi ut hver dag, fulgte kanalen før vi dykket inn i Neukölln og Kreuzberg. Sykkelturene var alltid lærerrike. Du lærer byen gjennom å følge pulsårene, krysse kanalene og ta sykkelstier som ser ut til å lede inn i nye verdener. Hver sving introduserte noen uforglemmelige: en maler som drasset med seg lerreter, en goth som syklet baklengs, en saksofonist som øvde i trafikken. I Berlin er du aldri den merkeligste på gata, og den erkjennelsen var overraskende beroligende.`
    },
    'part-3': {
      en: `The nights started at our Maybachufer apartment, where friends crowded in our living room, music spilling from a small speaker as beer pong and laughter blurred together. We biked out into Neukölln and Kreuzberg, drifting between bars that felt more like living rooms. Candles on mismatched tables, bartenders who remembered your name, conversations that lasted until the wax ran out. In the clubs, phones stayed in pockets; their cameras were stickered. The effect was immediate. People danced to be present, not for social media points. By sunrise we’d be back by the canal, watching the sky fade from charcoal to violet to gold. We’d sit by the water with our feet swinging above it and watch the city change gears. Berlin quietly shifting back into day.`,
      no: `Kveldene startet i leiligheten på Maybachufer, der venner fylte stua, musikk rant ut av en liten høyttaler og beer pong komplimentert av latter. Vi syklet videre til Neukölln og Kreuzberg, og hoppet mellom barer som føltes mer som stuer. Stearinlys på  bordene, bartendere som husket navnet ditt, samtaler som varte til stearinlyset var tomt. I klubbene ble mobilene i lommene og kameraene var teipet. Effekten var umiddelbar. Folk danset for å være til stede, ikke for sosiale medier. Ved soloppgang satt vi igjen ved kanalen, så himmelen gå fra kullsvart til fiolett til oransje. Vi lot beina dingle over vannet og så byen skifte gir. Berlin gled stille tilbake til dag.`
    },
    'part-4': {
      en: `Spreepark was a rumour before it became a destination. An abandoned amusement park. People said the ferris wheel still creaked in the wind even though the ticket booths had been empty for years. One clear afternoon me and a couple friends followed the story and slipped through a gap in the fence. City noise fell away, replaced by the hush that settles over places designed for joy but abandoned to time. The rides stood frozen mid-laugh—swan boats stranded in dry grass, roller-coaster tracks tangled in ivy, the ferris wheel creaking faintly above us. It felt eerie and playful at once, like stepping into the ghost of a childhood memory. We wandered quietly, half afraid to break the spell, imagining the echoes of laughter that once filled the air. When we climbed back through the fence, the noise of Berlin returned, but something of that silence stayed with us—a reminder that even the forgotten parts of the city never really sleep.`,
      no: `Spreepark var et rykte før det ble en destinasjon. En forlatt fornøyelsespark der pariserhjulet visstnok fortsatt knirket i vinden selv om billettlukene hadde vært tomme i årevis. En ettermiddag fulgte vi historien og smatt gjennom et hull i gjerdet. Bystøyen forsvant, erstattet av stillheten som legger seg over steder bygd for glede, men forlatt av tid. Karusellene sto fast midt i latteren, båter på tørt gress, berg-og-dalbaneskinner kvelt av eføy, pariserhjulet som knirket svakt over oss. Det var rart og lekent på samme tid, som et spøkelse av et barndomsminne. Vi vandret sakte og stille, halvveis redde for å bryte stemningen, og forestilte oss ekkoet av latter som en gang fylte lufta. Da vi klatret tilbake gjennom gjerdet, kom bylydene tilbake, men noe av stemningen vedvarte. En påminnelse om at selv de glemte delene av byen aldri helt sover.`
    }
  }
}

// Inline highlights lists for the Stavern story (for reliable carousel)
const STORY_HIGHLIGHTS = {
  'stavern-sommer-2025': {
    'part-1': [
      'portfolio/photography/Stavern sommer 2025/chapters/Part 1 - Cabin Days/photos/68209391-AA1C-4272-A78D-E2E7EC5CD546_1_105_c.jpeg',
      'portfolio/photography/Stavern sommer 2025/chapters/Part 1 - Cabin Days/photos/23E90F2C-3975-432C-850C-CD6A49B74DDB_1_105_c.jpeg',
      'portfolio/photography/Stavern sommer 2025/chapters/Part 1 - Cabin Days/photos/04CAB51D-54E2-4453-8D28-C36321A46635_1_105_c.jpeg'
    ],
    'part-2': [
      'portfolio/photography/Stavern sommer 2025/chapters/Part 2 - Coastal Walks/photos/1AAB2DEA-765F-466C-B563-895DDB2511CD_1_105_c.jpeg',
      'portfolio/photography/Stavern sommer 2025/chapters/Part 2 - Coastal Walks/photos/9B5C5D4B-1F85-41F4-9024-86BE25CD8598_1_105_c.jpeg',
      'portfolio/photography/Stavern sommer 2025/chapters/Part 2 - Coastal Walks/photos/0CF0A802-D8A2-44EC-80DB-8509AB5960DC_1_105_c.jpeg',
      'portfolio/photography/Stavern sommer 2025/chapters/Part 2 - Coastal Walks/photos/34CEC9DA-1E89-4166-A46F-59904B6CE428_1_105_c.jpeg'
    ],
    'part-3': [
      'portfolio/photography/Stavern sommer 2025/chapters/Part 3 - Festival Day/photos/1DD4F0E1-95E5-4AF9-9FAD-3F6AFE1E1AC6_1_105_c.jpeg',
      'portfolio/photography/Stavern sommer 2025/chapters/Part 3 - Festival Day/photos/CFE4E1E5-642D-4DCC-992D-FC3EF715BEA8_1_105_c.jpeg',
      'portfolio/photography/Stavern sommer 2025/chapters/Part 3 - Festival Day/photos/3A378108-010C-4944-AEED-66519AFCC108_1_105_c.jpeg',
      'portfolio/photography/Stavern sommer 2025/chapters/Part 3 - Festival Day/photos/284A1B7B-F731-4DCA-8735-A01FFC325FB4_1_105_c.jpeg'
    ],
    'part-4': [
      'portfolio/photography/Stavern sommer 2025/chapters/Part 4 - The Walk Home/photos/1B28F38D-D879-4965-AAE1-F24967382940_1_105_c.jpeg',
      'portfolio/photography/Stavern sommer 2025/chapters/Part 4 - The Walk Home/photos/0F072DF0-6376-47A4-9EA6-0F6E2709CE92_1_105_c.jpeg',
      'portfolio/photography/Stavern sommer 2025/chapters/Part 4 - The Walk Home/photos/3CE8CF6A-912F-49D9-BC16-DCAEEDDE8158_1_105_c.jpeg'
    ]
  },
  'semester-in-berlin': {
    'part-1': [
      'portfolio/photography/Semester in Berlin/Chapters/Chapter 1 - The drive down/Photos/IMG_1251.JPG',
      'portfolio/photography/Semester in Berlin/Chapters/Chapter 1 - The drive down/Photos/IMG_1624.jpg',
      'portfolio/photography/Semester in Berlin/Chapters/Chapter 1 - The drive down/Photos/IMG_1647.jpg'
    ],
    'part-2': [
      'portfolio/photography/Semester in Berlin/Chapters/Chapter 2 - The city/Photos/IMG_1630.jpg',
      'portfolio/photography/Semester in Berlin/Chapters/Chapter 2 - The city/Photos/IMG_1636.jpg',
      'portfolio/photography/Semester in Berlin/Chapters/Chapter 2 - The city/Photos/IMG_2696.jpg',
      'portfolio/photography/Semester in Berlin/Chapters/Chapter 2 - The city/Photos/IMG_3841.jpg'
    ],
    'part-3': [
      'portfolio/photography/Semester in Berlin/Chapters/Chapter 3 - Nightlife/Photos/IMG_1977.JPG',
      'portfolio/photography/Semester in Berlin/Chapters/Chapter 3 - Nightlife/Photos/IMG_2169.JPG',
      'portfolio/photography/Semester in Berlin/Chapters/Chapter 3 - Nightlife/Photos/IMG_2905.JPG'
    ],
    'part-4': [
      'portfolio/photography/Semester in Berlin/Chapters/Chapter 4 - Abandoned amusement park/Photos/IMG_2980.JPG',
      'portfolio/photography/Semester in Berlin/Chapters/Chapter 4 - Abandoned amusement park/Photos/IMG_3849.jpg'
    ]
  }
}

// Inline photo lists (truncated selection) for grid/Carousel
const STORY_PHOTOS = {
  'stavern-sommer-2025': {
    'part-1': [
      'portfolio/photography/Stavern sommer 2025/chapters/Part 1 - Cabin Days/photos/36C2670B-C30D-4D87-BB90-E7CD71B16A7C_1_105_c.jpeg',
      'portfolio/photography/Stavern sommer 2025/chapters/Part 1 - Cabin Days/photos/C6D44452-98EC-4E18-9B90-18C22BCDD5D5_1_105_c.jpeg',
      'portfolio/photography/Stavern sommer 2025/chapters/Part 1 - Cabin Days/photos/0B1A03BD-DE20-42F1-BA70-8E6EAF5EEFDE_1_105_c.jpeg',
      'portfolio/photography/Stavern sommer 2025/chapters/Part 1 - Cabin Days/photos/8387DE13-323C-491B-9158-FBAD48055A7D_1_105_c.jpeg',
      'portfolio/photography/Stavern sommer 2025/chapters/Part 1 - Cabin Days/photos/4B798414-C3D1-482D-9D9C-2584BF93B280_1_105_c.jpeg',
      'portfolio/photography/Stavern sommer 2025/chapters/Part 1 - Cabin Days/photos/A4D9CF78-274F-4B0D-A910-7DD965BC2FF9_1_105_c.jpeg',
      'portfolio/photography/Stavern sommer 2025/chapters/Part 1 - Cabin Days/photos/69E96779-286E-4721-9BA4-B1EAA4013220_1_105_c.jpeg',
      'portfolio/photography/Stavern sommer 2025/chapters/Part 1 - Cabin Days/photos/68209391-AA1C-4272-A78D-E2E7EC5CD546_1_105_c.jpeg',
      'portfolio/photography/Stavern sommer 2025/chapters/Part 1 - Cabin Days/photos/76DE0E86-81B4-44DB-97F0-F6C3CA8767E3_1_105_c.jpeg',
      'portfolio/photography/Stavern sommer 2025/chapters/Part 1 - Cabin Days/photos/4DC74B00-8910-4E1E-ABDC-7F0EB3B9D542_1_105_c.jpeg',
      'portfolio/photography/Stavern sommer 2025/chapters/Part 1 - Cabin Days/photos/7E122CA0-9186-4DBB-8712-832FEDEA6D6C_1_105_c.jpeg',
      'portfolio/photography/Stavern sommer 2025/chapters/Part 1 - Cabin Days/photos/4B76B7A4-7B9B-458D-9BF6-F900C46EC732_1_105_c.jpeg',
      'portfolio/photography/Stavern sommer 2025/chapters/Part 1 - Cabin Days/photos/E76A815B-3184-41EB-B3CF-B1AC0DB71DFD_1_105_c.jpeg',
      'portfolio/photography/Stavern sommer 2025/chapters/Part 1 - Cabin Days/photos/9B6AE445-97D0-4883-95A9-8DF54DDEA1F4_1_105_c.jpeg',
      'portfolio/photography/Stavern sommer 2025/chapters/Part 1 - Cabin Days/photos/A65BAA11-F4E5-42CD-A331-B25D22BD0167_1_105_c.jpeg',
      'portfolio/photography/Stavern sommer 2025/chapters/Part 1 - Cabin Days/photos/A6C954F8-E020-41EC-9DED-C93CA0F4898C_1_105_c.jpeg',
      'portfolio/photography/Stavern sommer 2025/chapters/Part 1 - Cabin Days/photos/308D1B80-E1FF-49C8-80FE-1853D1E85D09_1_105_c.jpeg',
      'portfolio/photography/Stavern sommer 2025/chapters/Part 1 - Cabin Days/photos/448B8EC5-023A-4510-83D8-130CF80B2E1A_1_105_c.jpeg',
      'portfolio/photography/Stavern sommer 2025/chapters/Part 1 - Cabin Days/photos/23E90F2C-3975-432C-850C-CD6A49B74DDB_1_105_c.jpeg',
      'portfolio/photography/Stavern sommer 2025/chapters/Part 1 - Cabin Days/photos/A8B139C6-5F54-4BB6-AFE7-A509E69C409F_1_105_c.jpeg',
      'portfolio/photography/Stavern sommer 2025/chapters/Part 1 - Cabin Days/photos/83CB36C7-45A6-469F-AAC2-5A120345D5CD_1_105_c.jpeg',
      'portfolio/photography/Stavern sommer 2025/chapters/Part 1 - Cabin Days/photos/04CAB51D-54E2-4453-8D28-C36321A46635_1_105_c.jpeg',
      'portfolio/photography/Stavern sommer 2025/chapters/Part 1 - Cabin Days/photos/A79876F4-990E-426D-8EA3-8EA4828A49C2_1_105_c.jpeg',
      'portfolio/photography/Stavern sommer 2025/chapters/Part 1 - Cabin Days/photos/9E5D08C9-28E3-4E10-898B-9487AA836CEC_1_105_c.jpeg'
    ],
    'part-2': [
      'portfolio/photography/Stavern sommer 2025/chapters/Part 2 - Coastal Walks/photos/1B2A349F-7152-49BD-9211-BB1597A81266_1_105_c.jpeg',
      'portfolio/photography/Stavern sommer 2025/chapters/Part 2 - Coastal Walks/photos/1CBE289C-3ED5-4299-BDB6-3E07A02D6C56_1_105_c.jpeg',
      'portfolio/photography/Stavern sommer 2025/chapters/Part 2 - Coastal Walks/photos/5761386C-14E8-4166-BBDC-E776D9954B13_1_105_c.jpeg',
      'portfolio/photography/Stavern sommer 2025/chapters/Part 2 - Coastal Walks/photos/6597D0A6-B584-4751-B10B-413362E89577_1_105_c.jpeg',
      'portfolio/photography/Stavern sommer 2025/chapters/Part 2 - Coastal Walks/photos/56F9A293-2070-453D-BDDA-F4FF138C7DAB_1_105_c.jpeg',
      'portfolio/photography/Stavern sommer 2025/chapters/Part 2 - Coastal Walks/photos/55D9B6AB-0C20-409B-B661-04876CBBB1D5_1_105_c.jpeg',
      'portfolio/photography/Stavern sommer 2025/chapters/Part 2 - Coastal Walks/photos/1AAB2DEA-765F-466C-B563-895DDB2511CD_1_105_c.jpeg',
      'portfolio/photography/Stavern sommer 2025/chapters/Part 2 - Coastal Walks/photos/C09B4991-B204-43EB-AEA9-B81240D8BB5A_1_105_c.jpeg',
      'portfolio/photography/Stavern sommer 2025/chapters/Part 2 - Coastal Walks/photos/D61BF33E-A80C-47A8-B165-EB71D4A6BA63_1_105_c.jpeg',
      'portfolio/photography/Stavern sommer 2025/chapters/Part 2 - Coastal Walks/photos/51D05D80-1B09-4AE7-9B05-EB8691E6A37F_1_105_c.jpeg',
      'portfolio/photography/Stavern sommer 2025/chapters/Part 2 - Coastal Walks/photos/8C685ACA-22E9-4232-92FA-9D893029276D_1_105_c.jpeg',
      'portfolio/photography/Stavern sommer 2025/chapters/Part 2 - Coastal Walks/photos/E9F3955D-555E-426F-846E-010955C1793D_1_105_c.jpeg',
      'portfolio/photography/Stavern sommer 2025/chapters/Part 2 - Coastal Walks/photos/665C4967-1ADD-4FD5-AB22-ACE3219BF72A_1_105_c.jpeg',
      'portfolio/photography/Stavern sommer 2025/chapters/Part 2 - Coastal Walks/photos/B2724FE7-19C2-46BC-908D-C2F8574AE429_1_105_c.jpeg',
      'portfolio/photography/Stavern sommer 2025/chapters/Part 2 - Coastal Walks/photos/E8FC7C12-3388-4D83-A396-CC51A0E341C5_1_105_c.jpeg',
      'portfolio/photography/Stavern sommer 2025/chapters/Part 2 - Coastal Walks/photos/2E3C3F4C-1345-4834-8F6C-8EB06C462D94_1_105_c.jpeg',
      'portfolio/photography/Stavern sommer 2025/chapters/Part 2 - Coastal Walks/photos/D8C11CED-29C2-4EF9-B0EB-8195AA43789A_1_105_c.jpeg',
      'portfolio/photography/Stavern sommer 2025/chapters/Part 2 - Coastal Walks/photos/7D336796-B944-40F8-BC4C-6CC3B39FE624_1_105_c.jpeg',
      'portfolio/photography/Stavern sommer 2025/chapters/Part 2 - Coastal Walks/photos/16F98878-547E-49BC-ADD0-D3A63D5F942B_1_105_c.jpeg',
      'portfolio/photography/Stavern sommer 2025/chapters/Part 2 - Coastal Walks/photos/B07B66A3-6670-470F-83DB-CB720B25B29F_1_105_c.jpeg',
      'portfolio/photography/Stavern sommer 2025/chapters/Part 2 - Coastal Walks/photos/9B5C5D4B-1F85-41F4-9024-86BE25CD8598_1_105_c.jpeg',
      'portfolio/photography/Stavern sommer 2025/chapters/Part 2 - Coastal Walks/photos/E31C244F-1C7D-4168-B7FD-ED0D6ECCB0C3_1_105_c.jpeg',
      'portfolio/photography/Stavern sommer 2025/chapters/Part 2 - Coastal Walks/photos/33A83766-0229-416C-8ED8-D5924B4183D6_1_105_c.jpeg',
      'portfolio/photography/Stavern sommer 2025/chapters/Part 2 - Coastal Walks/photos/7C4BBB45-73E7-4ACC-A244-000B394962CE_1_105_c.jpeg'
    ],
    'part-3': [
      'portfolio/photography/Stavern sommer 2025/chapters/Part 3 - Festival Day/photos/F7A85B30-ED16-47EC-BE86-3F71C317BF31_1_105_c.jpeg',
      'portfolio/photography/Stavern sommer 2025/chapters/Part 3 - Festival Day/photos/C06A41BA-F332-4ED4-84C4-9AB41348EF24_1_105_c.jpeg',
      'portfolio/photography/Stavern sommer 2025/chapters/Part 3 - Festival Day/photos/F0ED4D76-966E-4C91-9270-A168A827E63A_1_105_c.jpeg',
      'portfolio/photography/Stavern sommer 2025/chapters/Part 3 - Festival Day/photos/97E9474D-413C-4BEE-9D68-D2DE22212DEB_1_105_c.jpeg',
      'portfolio/photography/Stavern sommer 2025/chapters/Part 3 - Festival Day/photos/B01A933B-3947-4599-AE58-A21AE4E8781B_1_105_c.jpeg',
      'portfolio/photography/Stavern sommer 2025/chapters/Part 3 - Festival Day/photos/56691637-6EED-4E65-A39D-249192185136_1_105_c.jpeg',
      'portfolio/photography/Stavern sommer 2025/chapters/Part 3 - Festival Day/photos/FCA56337-2597-492B-9064-EB40125CE683_1_105_c.jpeg',
      'portfolio/photography/Stavern sommer 2025/chapters/Part 3 - Festival Day/photos/1DD4F0E1-95E5-4AF9-9FAD-3F6AFE1E1AC6_1_105_c.jpeg',
      'portfolio/photography/Stavern sommer 2025/chapters/Part 3 - Festival Day/photos/DEC4D468-3AB5-43A1-A9CF-6A91C369A902_1_105_c.jpeg',
      'portfolio/photography/Stavern sommer 2025/chapters/Part 3 - Festival Day/photos/1710A7EA-FC7A-4FCF-A9B4-209EFBD2743E_1_105_c.jpeg',
      'portfolio/photography/Stavern sommer 2025/chapters/Part 3 - Festival Day/photos/CFE4E1E5-642D-4DCC-992D-FC3EF715BEA8_1_105_c.jpeg',
      'portfolio/photography/Stavern sommer 2025/chapters/Part 3 - Festival Day/photos/3A378108-010C-4944-AEED-66519AFCC108_1_105_c.jpeg',
      'portfolio/photography/Stavern sommer 2025/chapters/Part 3 - Festival Day/photos/CA9221C3-FC5F-443A-BB7C-F4D4ACAF789F_1_105_c.jpeg',
      'portfolio/photography/Stavern sommer 2025/chapters/Part 3 - Festival Day/photos/284A1B7B-F731-4DCA-8735-A01FFC325FB4_1_105_c.jpeg',
      'portfolio/photography/Stavern sommer 2025/chapters/Part 3 - Festival Day/photos/EDCFFCB3-8179-49E6-9BEA-69A22BD56D65_1_105_c.jpeg',
      'portfolio/photography/Stavern sommer 2025/chapters/Part 3 - Festival Day/photos/1948EC91-6F65-4E19-A5B1-A554451FB419_1_105_c.jpeg',
      'portfolio/photography/Stavern sommer 2025/chapters/Part 3 - Festival Day/photos/0C63D9C2-E5E0-48DC-B803-5F0755B56946_1_105_c.jpeg',
      'portfolio/photography/Stavern sommer 2025/chapters/Part 3 - Festival Day/photos/321D7333-D3F7-4845-8420-485193194743_1_105_c.jpeg',
      'portfolio/photography/Stavern sommer 2025/chapters/Part 3 - Festival Day/photos/BA406FE6-6622-4728-800A-3BDD06257BBC_1_105_c.jpeg',
      'portfolio/photography/Stavern sommer 2025/chapters/Part 3 - Festival Day/photos/2A8F87AD-687F-4625-A2AA-96E0F836CFE4_1_105_c.jpeg'
    ],
    'part-4': [
      'portfolio/photography/Stavern sommer 2025/chapters/Part 4 - The Walk Home/photos/2B0FC1AF-F365-4D86-AB12-99D79AE41685_1_105_c.jpeg',
      'portfolio/photography/Stavern sommer 2025/chapters/Part 4 - The Walk Home/photos/3F508E4C-0363-4FF4-BC34-B4F025910D72_1_201_a.jpeg',
      'portfolio/photography/Stavern sommer 2025/chapters/Part 4 - The Walk Home/photos/1B28F38D-D879-4965-AAE1-F24967382940_1_105_c.jpeg',
      'portfolio/photography/Stavern sommer 2025/chapters/Part 4 - The Walk Home/photos/D9C2CBBC-46DF-45BC-B365-8D2A0DD8881E_1_105_c.jpeg',
      'portfolio/photography/Stavern sommer 2025/chapters/Part 4 - The Walk Home/photos/B2DCC473-76D5-45C3-AC80-0A1DB30F6EDF_1_105_c.jpeg',
      'portfolio/photography/Stavern sommer 2025/chapters/Part 4 - The Walk Home/photos/C612B5E1-066D-400F-A27D-38201042D935_1_105_c.jpeg',
      'portfolio/photography/Stavern sommer 2025/chapters/Part 4 - The Walk Home/photos/06331420-1049-475F-9F4B-66A7604C3A8D_1_105_c.jpeg',
      'portfolio/photography/Stavern sommer 2025/chapters/Part 4 - The Walk Home/photos/0F072DF0-6376-47A4-9EA6-0F6E2709CE92_1_105_c.jpeg',
      'portfolio/photography/Stavern sommer 2025/chapters/Part 4 - The Walk Home/photos/69522BE0-365F-4DC0-9D85-60F9643AB01B_1_105_c.jpeg',
      'portfolio/photography/Stavern sommer 2025/chapters/Part 4 - The Walk Home/photos/6BC0C5FC-1417-40F1-8D47-CF968E01511C_1_105_c.jpeg',
      'portfolio/photography/Stavern sommer 2025/chapters/Part 4 - The Walk Home/photos/64DF19AC-1017-4F27-94E6-576DEDB602ED_1_105_c.jpeg',
      'portfolio/photography/Stavern sommer 2025/chapters/Part 4 - The Walk Home/photos/3CE8CF6A-912F-49D9-BC16-DCAEEDDE8158_1_105_c.jpeg',
      'portfolio/photography/Stavern sommer 2025/chapters/Part 4 - The Walk Home/photos/072D3785-FD27-429D-8724-8DE0A9C21695_1_105_c.jpeg'
    ]
  },
  'portugal-2025': {
    'part-1': [
      'portfolio/photography/Portugal 2025/chapters/Chapter 1 - Surf Camp/photos/IMG_5011.JPG',
      'portfolio/photography/Portugal 2025/chapters/Chapter 1 - Surf Camp/photos/R1-09750-0003.JPG',
      'portfolio/photography/Portugal 2025/chapters/Chapter 1 - Surf Camp/photos/R1-09750-0004.jpg',
      'portfolio/photography/Portugal 2025/chapters/Chapter 1 - Surf Camp/photos/R1-09750-0008.JPG',
      'portfolio/photography/Portugal 2025/chapters/Chapter 1 - Surf Camp/photos/R1-09750-0010.jpg',
      'portfolio/photography/Portugal 2025/chapters/Chapter 1 - Surf Camp/photos/R1-09750-0011.JPG',
      'portfolio/photography/Portugal 2025/chapters/Chapter 1 - Surf Camp/photos/R1-09750-0013.jpg',
      'portfolio/photography/Portugal 2025/chapters/Chapter 1 - Surf Camp/photos/R1-09750-0014.jpg',
      'portfolio/photography/Portugal 2025/chapters/Chapter 1 - Surf Camp/photos/R1-09750-0016.jpg',
      'portfolio/photography/Portugal 2025/chapters/Chapter 1 - Surf Camp/photos/R1-09750-0020.jpg',
      'portfolio/photography/Portugal 2025/chapters/Chapter 1 - Surf Camp/photos/R1-09750-0021.jpg',
      'portfolio/photography/Portugal 2025/chapters/Chapter 1 - Surf Camp/photos/R1-09750-0022.jpg',
      'portfolio/photography/Portugal 2025/chapters/Chapter 1 - Surf Camp/photos/R1-09750-0024.jpg',
      'portfolio/photography/Portugal 2025/chapters/Chapter 1 - Surf Camp/photos/R1-09750-0025.jpg',
      'portfolio/photography/Portugal 2025/chapters/Chapter 1 - Surf Camp/photos/R1-09750-0026.jpg',
      'portfolio/photography/Portugal 2025/chapters/Chapter 1 - Surf Camp/photos/R1-09750-0027.jpg',
      'portfolio/photography/Portugal 2025/chapters/Chapter 1 - Surf Camp/photos/R1-09750-0028.jpg',
      'portfolio/photography/Portugal 2025/chapters/Chapter 1 - Surf Camp/photos/R1-09750-0029.jpg',
      'portfolio/photography/Portugal 2025/chapters/Chapter 1 - Surf Camp/photos/R1-09750-0030.JPG',
      'portfolio/photography/Portugal 2025/chapters/Chapter 1 - Surf Camp/photos/R1-09750-0031.jpg',
      'portfolio/photography/Portugal 2025/chapters/Chapter 1 - Surf Camp/photos/R1-09750-0032.JPG',
      'portfolio/photography/Portugal 2025/chapters/Chapter 1 - Surf Camp/photos/R1-09750-0034.jpg',
      'portfolio/photography/Portugal 2025/chapters/Chapter 1 - Surf Camp/photos/R1-09750-0037.jpg',
      'portfolio/photography/Portugal 2025/chapters/Chapter 1 - Surf Camp/photos/R1-09751-001A.JPG',
      'portfolio/photography/Portugal 2025/chapters/Chapter 1 - Surf Camp/photos/R1-09751-002A.JPG',
      'portfolio/photography/Portugal 2025/chapters/Chapter 1 - Surf Camp/photos/R1-09751-003A.jpg',
      'portfolio/photography/Portugal 2025/chapters/Chapter 1 - Surf Camp/photos/R1-09751-004A.JPG',
      'portfolio/photography/Portugal 2025/chapters/Chapter 1 - Surf Camp/photos/R1-09751-005A.JPG',
      'portfolio/photography/Portugal 2025/chapters/Chapter 1 - Surf Camp/photos/R1-09751-007A.JPG',
      'portfolio/photography/Portugal 2025/chapters/Chapter 1 - Surf Camp/photos/R1-09751-008A.jpg',
      'portfolio/photography/Portugal 2025/chapters/Chapter 1 - Surf Camp/photos/R1-09751-010A.JPG',
      'portfolio/photography/Portugal 2025/chapters/Chapter 1 - Surf Camp/photos/R1-09751-011A.jpg',
      'portfolio/photography/Portugal 2025/chapters/Chapter 1 - Surf Camp/photos/R1-09751-012A.jpg',
      'portfolio/photography/Portugal 2025/chapters/Chapter 1 - Surf Camp/photos/R1-09751-015A.jpg',
      'portfolio/photography/Portugal 2025/chapters/Chapter 1 - Surf Camp/photos/R1-09751-017A.jpg',
      'portfolio/photography/Portugal 2025/chapters/Chapter 1 - Surf Camp/photos/R1-09751-018A.jpg',
      'portfolio/photography/Portugal 2025/chapters/Chapter 1 - Surf Camp/photos/R1-09751-019A.jpg',
      'portfolio/photography/Portugal 2025/chapters/Chapter 1 - Surf Camp/photos/R1-09751-025A.JPG'
    ],
    'part-2': [
      'portfolio/photography/Portugal 2025/chapters/Chapter 2 - Lisbon/photos/R1-09748-0003.jpg',
      'portfolio/photography/Portugal 2025/chapters/Chapter 2 - Lisbon/photos/R1-09748-0004.JPG',
      'portfolio/photography/Portugal 2025/chapters/Chapter 2 - Lisbon/photos/R1-09748-0005.jpg',
      'portfolio/photography/Portugal 2025/chapters/Chapter 2 - Lisbon/photos/R1-09748-0007.jpg',
      'portfolio/photography/Portugal 2025/chapters/Chapter 2 - Lisbon/photos/R1-09748-0009.jpg',
      'portfolio/photography/Portugal 2025/chapters/Chapter 2 - Lisbon/photos/R1-09748-0010.jpg',
      'portfolio/photography/Portugal 2025/chapters/Chapter 2 - Lisbon/photos/R1-09748-0011.jpg',
      'portfolio/photography/Portugal 2025/chapters/Chapter 2 - Lisbon/photos/R1-09748-0012.JPG',
      'portfolio/photography/Portugal 2025/chapters/Chapter 2 - Lisbon/photos/R1-09748-0013.jpg',
      'portfolio/photography/Portugal 2025/chapters/Chapter 2 - Lisbon/photos/R1-09748-0014.jpg'
    ],
    'part-3': [
      'portfolio/photography/Portugal 2025/chapters/Chapter 3 - The beach house/photos/R1-09748-0015.jpg',
      'portfolio/photography/Portugal 2025/chapters/Chapter 3 - The beach house/photos/R1-09748-0017.JPG',
      'portfolio/photography/Portugal 2025/chapters/Chapter 3 - The beach house/photos/R1-09748-0019.jpg',
      'portfolio/photography/Portugal 2025/chapters/Chapter 3 - The beach house/photos/R1-09748-0020.jpg',
      'portfolio/photography/Portugal 2025/chapters/Chapter 3 - The beach house/photos/R1-09748-0021.jpg',
      'portfolio/photography/Portugal 2025/chapters/Chapter 3 - The beach house/photos/R1-09748-0026.JPG',
      'portfolio/photography/Portugal 2025/chapters/Chapter 3 - The beach house/photos/R1-09748-0027.JPG',
      'portfolio/photography/Portugal 2025/chapters/Chapter 3 - The beach house/photos/R1-09748-0028.jpg',
      'portfolio/photography/Portugal 2025/chapters/Chapter 3 - The beach house/photos/R1-09749-023A.JPG',
      'portfolio/photography/Portugal 2025/chapters/Chapter 3 - The beach house/photos/R1-09749-024A.jpg',
      'portfolio/photography/Portugal 2025/chapters/Chapter 3 - The beach house/photos/R1-09749-028A.jpg',
      'portfolio/photography/Portugal 2025/chapters/Chapter 3 - The beach house/photos/R1-09749-033A.JPG',
      'portfolio/photography/Portugal 2025/chapters/Chapter 3 - The beach house/photos/R1-09749-035A.jpg',
      'portfolio/photography/Portugal 2025/chapters/Chapter 3 - The beach house/photos/h.jpg'
    ],
    'part-4': [
      'portfolio/photography/Portugal 2025/chapters/Chapter 4 - Dinner parties/photos/R1-09748-0022.JPG',
      'portfolio/photography/Portugal 2025/chapters/Chapter 4 - Dinner parties/photos/R1-09748-0025.JPG',
      'portfolio/photography/Portugal 2025/chapters/Chapter 4 - Dinner parties/photos/R1-09748-0034.JPG',
      'portfolio/photography/Portugal 2025/chapters/Chapter 4 - Dinner parties/photos/R1-09748-0035.jpg',
      'portfolio/photography/Portugal 2025/chapters/Chapter 4 - Dinner parties/photos/R1-09749-001A.JPG',
      'portfolio/photography/Portugal 2025/chapters/Chapter 4 - Dinner parties/photos/R1-09749-003A.JPG',
      'portfolio/photography/Portugal 2025/chapters/Chapter 4 - Dinner parties/photos/R1-09749-004A.jpg',
      'portfolio/photography/Portugal 2025/chapters/Chapter 4 - Dinner parties/photos/R1-09749-005A.jpg',
      'portfolio/photography/Portugal 2025/chapters/Chapter 4 - Dinner parties/photos/R1-09749-006A.JPG',
      'portfolio/photography/Portugal 2025/chapters/Chapter 4 - Dinner parties/photos/R1-09749-007A.JPG',
      'portfolio/photography/Portugal 2025/chapters/Chapter 4 - Dinner parties/photos/R1-09749-008A.jpg',
      'portfolio/photography/Portugal 2025/chapters/Chapter 4 - Dinner parties/photos/R1-09749-009A.JPG',
      'portfolio/photography/Portugal 2025/chapters/Chapter 4 - Dinner parties/photos/R1-09749-011A.jpg'
    ],
    'part-5': [
      'portfolio/photography/Portugal 2025/chapters/Chapter 5 - Sunset walks/photos/R1-09749-014A.jpg',
      'portfolio/photography/Portugal 2025/chapters/Chapter 5 - Sunset walks/photos/R1-09749-015A.jpg',
      'portfolio/photography/Portugal 2025/chapters/Chapter 5 - Sunset walks/photos/R1-09749-016A.JPG',
      'portfolio/photography/Portugal 2025/chapters/Chapter 5 - Sunset walks/photos/R1-09749-017A.JPG',
      'portfolio/photography/Portugal 2025/chapters/Chapter 5 - Sunset walks/photos/R1-09749-018A.JPG',
      'portfolio/photography/Portugal 2025/chapters/Chapter 5 - Sunset walks/photos/R1-09749-019A.JPG',
      'portfolio/photography/Portugal 2025/chapters/Chapter 5 - Sunset walks/photos/R1-09749-020A.jpg',
      'portfolio/photography/Portugal 2025/chapters/Chapter 5 - Sunset walks/photos/R1-09749-021A.JPG',
      'portfolio/photography/Portugal 2025/chapters/Chapter 5 - Sunset walks/photos/R1-09749-022A.jpg'
    ]
  },
  'semester-in-berlin': {
    'part-1': [
      'portfolio/photography/Semester in Berlin/Chapters/Chapter 1 - The drive down/Photos/IMG_1251.JPG',
      'portfolio/photography/Semester in Berlin/Chapters/Chapter 1 - The drive down/Photos/IMG_1616.jpg',
      'portfolio/photography/Semester in Berlin/Chapters/Chapter 1 - The drive down/Photos/IMG_1622.JPG',
      'portfolio/photography/Semester in Berlin/Chapters/Chapter 1 - The drive down/Photos/IMG_1624.jpg',
      'portfolio/photography/Semester in Berlin/Chapters/Chapter 1 - The drive down/Photos/IMG_1629.jpg',
      'portfolio/photography/Semester in Berlin/Chapters/Chapter 1 - The drive down/Photos/IMG_1631.JPG',
      'portfolio/photography/Semester in Berlin/Chapters/Chapter 1 - The drive down/Photos/IMG_1635.jpg',
      'portfolio/photography/Semester in Berlin/Chapters/Chapter 1 - The drive down/Photos/IMG_1643.JPG',
      'portfolio/photography/Semester in Berlin/Chapters/Chapter 1 - The drive down/Photos/IMG_1645.JPG',
      'portfolio/photography/Semester in Berlin/Chapters/Chapter 1 - The drive down/Photos/IMG_1647.jpg',
      'portfolio/photography/Semester in Berlin/Chapters/Chapter 1 - The drive down/Photos/IMG_1649.jpg',
      'portfolio/photography/Semester in Berlin/Chapters/Chapter 1 - The drive down/Photos/IMG_AB1F61659F17-2.jpeg'
    ],
    'part-2': [
      'portfolio/photography/Semester in Berlin/Chapters/Chapter 2 - The city/Photos/IMG_1485.JPG',
      'portfolio/photography/Semester in Berlin/Chapters/Chapter 2 - The city/Photos/IMG_1617 2.JPG',
      'portfolio/photography/Semester in Berlin/Chapters/Chapter 2 - The city/Photos/IMG_1619.jpg',
      'portfolio/photography/Semester in Berlin/Chapters/Chapter 2 - The city/Photos/IMG_1621.jpg',
      'portfolio/photography/Semester in Berlin/Chapters/Chapter 2 - The city/Photos/IMG_1628.jpg',
      'portfolio/photography/Semester in Berlin/Chapters/Chapter 2 - The city/Photos/IMG_1630.jpg',
      'portfolio/photography/Semester in Berlin/Chapters/Chapter 2 - The city/Photos/IMG_1634.jpg',
      'portfolio/photography/Semester in Berlin/Chapters/Chapter 2 - The city/Photos/IMG_1636.jpg',
      'portfolio/photography/Semester in Berlin/Chapters/Chapter 2 - The city/Photos/IMG_1638.jpg',
      'portfolio/photography/Semester in Berlin/Chapters/Chapter 2 - The city/Photos/IMG_1639.jpg',
      'portfolio/photography/Semester in Berlin/Chapters/Chapter 2 - The city/Photos/IMG_1640.JPG',
      'portfolio/photography/Semester in Berlin/Chapters/Chapter 2 - The city/Photos/IMG_1642.JPG',
      'portfolio/photography/Semester in Berlin/Chapters/Chapter 2 - The city/Photos/IMG_1648.jpg',
      'portfolio/photography/Semester in Berlin/Chapters/Chapter 2 - The city/Photos/IMG_1650.jpg',
      'portfolio/photography/Semester in Berlin/Chapters/Chapter 2 - The city/Photos/IMG_1699.JPG',
      'portfolio/photography/Semester in Berlin/Chapters/Chapter 2 - The city/Photos/IMG_1707.JPG',
      'portfolio/photography/Semester in Berlin/Chapters/Chapter 2 - The city/Photos/IMG_1727.JPG',
      'portfolio/photography/Semester in Berlin/Chapters/Chapter 2 - The city/Photos/IMG_1829.JPG',
      'portfolio/photography/Semester in Berlin/Chapters/Chapter 2 - The city/Photos/IMG_1931.JPG',
      'portfolio/photography/Semester in Berlin/Chapters/Chapter 2 - The city/Photos/IMG_2268.JPG',
      'portfolio/photography/Semester in Berlin/Chapters/Chapter 2 - The city/Photos/IMG_2679.jpg',
      'portfolio/photography/Semester in Berlin/Chapters/Chapter 2 - The city/Photos/IMG_2680.jpg',
      'portfolio/photography/Semester in Berlin/Chapters/Chapter 2 - The city/Photos/IMG_2682.jpg',
      'portfolio/photography/Semester in Berlin/Chapters/Chapter 2 - The city/Photos/IMG_2683.jpg',
      'portfolio/photography/Semester in Berlin/Chapters/Chapter 2 - The city/Photos/IMG_2684 2.jpg',
      'portfolio/photography/Semester in Berlin/Chapters/Chapter 2 - The city/Photos/IMG_2690.jpg',
      'portfolio/photography/Semester in Berlin/Chapters/Chapter 2 - The city/Photos/IMG_2695.jpg',
      'portfolio/photography/Semester in Berlin/Chapters/Chapter 2 - The city/Photos/IMG_2696.jpg',
      'portfolio/photography/Semester in Berlin/Chapters/Chapter 2 - The city/Photos/IMG_2699.jpg',
      'portfolio/photography/Semester in Berlin/Chapters/Chapter 2 - The city/Photos/IMG_2720.JPG',
      'portfolio/photography/Semester in Berlin/Chapters/Chapter 2 - The city/Photos/IMG_28E5A6AFF4A2-1.jpeg',
      'portfolio/photography/Semester in Berlin/Chapters/Chapter 2 - The city/Photos/IMG_2918.JPG',
      'portfolio/photography/Semester in Berlin/Chapters/Chapter 2 - The city/Photos/IMG_2930.JPG',
      'portfolio/photography/Semester in Berlin/Chapters/Chapter 2 - The city/Photos/IMG_3058.JPG',
      'portfolio/photography/Semester in Berlin/Chapters/Chapter 2 - The city/Photos/IMG_3841.jpg',
      'portfolio/photography/Semester in Berlin/Chapters/Chapter 2 - The city/Photos/IMG_3844.jpg',
      'portfolio/photography/Semester in Berlin/Chapters/Chapter 2 - The city/Photos/IMG_3855.jpg',
      'portfolio/photography/Semester in Berlin/Chapters/Chapter 2 - The city/Photos/IMG_3860.jpg',
      'portfolio/photography/Semester in Berlin/Chapters/Chapter 2 - The city/Photos/IMG_3861.jpg',
      'portfolio/photography/Semester in Berlin/Chapters/Chapter 2 - The city/Photos/IMG_3953.JPG',
      'portfolio/photography/Semester in Berlin/Chapters/Chapter 2 - The city/Photos/IMG_4664.JPG',
      'portfolio/photography/Semester in Berlin/Chapters/Chapter 2 - The city/Photos/IMG_4686.JPG',
      'portfolio/photography/Semester in Berlin/Chapters/Chapter 2 - The city/Photos/IMG_4708.JPG'
    ],
    'part-3': [
      'portfolio/photography/Semester in Berlin/Chapters/Chapter 3 - Nightlife/Photos/308449c8-525f-41d5-ad63-b92b5ccbbe4b.JPG',
      'portfolio/photography/Semester in Berlin/Chapters/Chapter 3 - Nightlife/Photos/IMG_1977.JPG',
      'portfolio/photography/Semester in Berlin/Chapters/Chapter 3 - Nightlife/Photos/IMG_1989.JPG',
      'portfolio/photography/Semester in Berlin/Chapters/Chapter 3 - Nightlife/Photos/IMG_2164.JPG',
      'portfolio/photography/Semester in Berlin/Chapters/Chapter 3 - Nightlife/Photos/IMG_2166.JPG',
      'portfolio/photography/Semester in Berlin/Chapters/Chapter 3 - Nightlife/Photos/IMG_2169.JPG',
      'portfolio/photography/Semester in Berlin/Chapters/Chapter 3 - Nightlife/Photos/IMG_2170.JPG',
      'portfolio/photography/Semester in Berlin/Chapters/Chapter 3 - Nightlife/Photos/IMG_2905.JPG',
      'portfolio/photography/Semester in Berlin/Chapters/Chapter 3 - Nightlife/Photos/IMG_3936.JPG',
      'portfolio/photography/Semester in Berlin/Chapters/Chapter 3 - Nightlife/Photos/IMG_3963.JPG',
      'portfolio/photography/Semester in Berlin/Chapters/Chapter 3 - Nightlife/Photos/Skjermbilde 2025-09-19 kl. 18.44.08.jpg'
    ],
    'part-4': [
      'portfolio/photography/Semester in Berlin/Chapters/Chapter 4 - Abandoned amusement park/Photos/IMG_2980.JPG',
      'portfolio/photography/Semester in Berlin/Chapters/Chapter 4 - Abandoned amusement park/Photos/IMG_3028.JPG',
      'portfolio/photography/Semester in Berlin/Chapters/Chapter 4 - Abandoned amusement park/Photos/IMG_3846.JPG',
      'portfolio/photography/Semester in Berlin/Chapters/Chapter 4 - Abandoned amusement park/Photos/IMG_3847.JPG',
      'portfolio/photography/Semester in Berlin/Chapters/Chapter 4 - Abandoned amusement park/Photos/IMG_3849.jpg'
    ]
  }
}

// Top hero carousel reusing the photography page style
function HeroCarousel({ images, title }) {
  const [index, setIndex] = useState(0)
  const [progress, setProgress] = useState(0)
  const [autoPlay, setAutoPlay] = useState(true)
  const touchStartX = useRef(null)
  const previous = () => { setProgress(0); setIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1)) }
  const next = () => { setProgress(0); setIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1)) }
  useEffect(() => { if (index >= images.length) setIndex(0) }, [images.length, index])
  useEffect(() => {
    if (!images.length) return
    if (!autoPlay) return
    const DURATION = 5000
    const startAt = performance.now() - progress * DURATION
    const tick = () => {
      const now = performance.now()
      const p = Math.min(1, (now - startAt) / DURATION)
      setProgress(p)
      if (p >= 1) {
        setProgress(0)
        setIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1))
      }
    }
    const id = setInterval(tick, 100)
    return () => clearInterval(id)
  }, [index, images.length, autoPlay])

  if (!images || images.length === 0) return null
  return (
    <div className="relative border border-black bg-white select-none p-2 sm:p-3">
      {/* Progress bars */}
      <div className="absolute top-0 left-0 right-0 z-20 p-3 flex gap-1 pointer-events-none">
        {images.map((_, i) => {
          const w = i < index ? 1 : i === index ? progress : 0
          return (
            <div key={i} className="flex-1 h-1 bg-black/20">
              <div className="h-full bg-black" style={{ width: `${Math.max(0, Math.min(1, w)) * 100}%`, transition: 'width 100ms linear' }} />
            </div>
          )
        })}
      </div>
      <div
        className="w-full h-[55vh] sm:h-[55vh] md:h-[60vh] flex items-center justify-center overflow-hidden"
        onTouchStart={(e) => (touchStartX.current = e.changedTouches?.[0]?.clientX ?? null)}
        onTouchEnd={(e) => {
          const endX = e.changedTouches?.[0]?.clientX ?? null
          if (touchStartX.current == null || endX == null) return
          const dx = endX - touchStartX.current
          if (Math.abs(dx) > 40) {
            if (dx < 0) next()
            else previous()
          }
          touchStartX.current = null
        }}
      >
        <img
          src={(images[index] && (images[index].startsWith('/') || images[index].startsWith('http')))
            ? images[index]
            : getAssetPath(images[index])}
          alt={`${title} ${index + 1}`}
          className="max-w-full max-h-full object-contain block"
        />
      </div>
      {images.length > 1 && (
        <>
          <button onClick={previous} aria-label="Previous image" className="absolute left-0 top-1/2 -translate-y-1/2 h-full px-4 text-3xl md:text-4xl hover:bg-black/5 z-30">‹</button>
          <button onClick={next} aria-label="Next image" className="absolute right-0 top-1/2 -translate-y-1/2 h-full px-4 text-3xl md:text-4xl hover:bg-black/5 z-30">›</button>
        </>
      )}
    </div>
  )
}

// Scroll-controlled image stack: locks when fully in view, animates current up+fade, next fade-in
function ImageStackScroller({ images, title, height = '80vh' }) {
  const ref = useRef(null)
  const [pos, setPos] = useState(0) // float in [0, images.length-1]
  const posRef = useRef(0)
  const [enabled, setEnabled] = useState(false) // only when fully in viewport
  const touchY = useRef(null)

  const clamp = (v, min, max) => Math.max(min, Math.min(max, v))

  // Determine if box is fully within viewport
  const checkEnabled = () => {
    const el = ref.current
    if (!el) return setEnabled(false)
    const r = el.getBoundingClientRect()
    const fullyVisible = r.top >= 0 && r.bottom <= (window.innerHeight || document.documentElement.clientHeight)
    setEnabled(!!fullyVisible)
  }

  useEffect(() => {
    checkEnabled()
    window.addEventListener('scroll', checkEnabled, { passive: true })
    window.addEventListener('resize', checkEnabled)
    return () => {
      window.removeEventListener('scroll', checkEnabled)
      window.removeEventListener('resize', checkEnabled)
    }
  }, [])

  useEffect(() => { posRef.current = pos }, [pos])

  useEffect(() => {
    const el = ref.current
    if (!el) return

    const onWheel = (e) => {
      if (!enabled) return
      const total = Math.max(1, (images?.length || 1) - 1)
      const curPos = posRef.current
      const atStart = curPos <= 0
      const atEnd = curPos >= total
      const goingDown = e.deltaY > 0
      // If at boundary and trying to go further, let page scroll
      if ((goingDown && atEnd) || (!goingDown && atStart)) return
      e.preventDefault()
      const SPEED = 1 / 800 // pixels per image transition
      setPos((p) => clamp(p + e.deltaY * SPEED, 0, total))
    }
    const onTouchStart = (e) => {
      if (!enabled) return
      touchY.current = e.changedTouches?.[0]?.clientY ?? null
    }
    const onTouchMove = (e) => {
      if (!enabled) return
      if (touchY.current == null) return
      const y = e.changedTouches?.[0]?.clientY ?? null
      if (y == null) return
      const dy = touchY.current - y // positive when moving finger up (scroll down)
      const total = Math.max(1, (images?.length || 1) - 1)
      const curPos = posRef.current
      const atStart = curPos <= 0
      const atEnd = curPos >= total
      const goingDown = dy > 0
      // If at boundary and trying to go further, let page scroll
      if (!((goingDown && atEnd) || (!goingDown && atStart))) {
        e.preventDefault()
        const SPEED_T = 1 / 600
        setPos((p) => clamp(p + dy * SPEED_T, 0, total))
      }
      touchY.current = y
    }
    const opts = { passive: false }
    el.addEventListener('wheel', onWheel, opts)
    el.addEventListener('touchstart', onTouchStart, opts)
    el.addEventListener('touchmove', onTouchMove, opts)
    return () => {
      el.removeEventListener('wheel', onWheel, opts)
      el.removeEventListener('touchstart', onTouchStart, opts)
      el.removeEventListener('touchmove', onTouchMove, opts)
    }
  }, [enabled, images?.length])

  if (!images || images.length === 0) return null
  const idx = Math.floor(pos)
  const total = Math.max(1, images.length - 1)
  const t = clamp(pos - idx, 0, 1)
  const cur = idx
  const next = Math.min(idx + 1, images.length - 1)

  return (
    <div ref={ref} className="relative overflow-hidden" style={{ height, touchAction: enabled ? 'none' : 'auto' }}>
      {/* current image: moves up and fades out */}
      <img
        src={images[cur]}
        alt={`${title} ${cur + 1}`}
        className="absolute inset-0 w-full h-full object-cover will-change-transform"
        style={{ transform: `translateY(${-t * 20}%)`, opacity: 1 - t, transition: 'transform 20ms linear, opacity 20ms linear', backgroundColor: '#fff' }}
      />
      {/* next image: fades in */}
      {next !== cur && (
        <img
          src={images[next]}
          alt={`${title} ${next + 1}`}
          className="absolute inset-0 w-full h-full object-cover"
          style={{ opacity: t, transition: 'opacity 20ms linear', backgroundColor: '#fff' }}
        />
      )}
      {/* instruction overlay only when enabled? keep invisible UI-free */}
      <div className="absolute inset-x-0 bottom-0 h-10 pointer-events-none bg-gradient-to-t from-white/70 to-transparent" />
    </div>
  )
}

// Sticky image stack that keeps chapter title visible and drives transitions from page scroll
function StickyImageStack({ images, chapterTitle }) {
  const containerRef = useRef(null)
  const stageRef = useRef(null)
  const [enabled, setEnabled] = useState(false)
  const [pos, setPos] = useState(0)
  const posRef = useRef(0)
  const prevOverflow = useRef('')
  const touchY = useRef(null)
  const clamp = (v, a, b) => Math.max(a, Math.min(b, v))

  const N = images?.length || 0
  useEffect(() => { posRef.current = pos }, [pos])

  // Determine if the sticky box is fully in view to enable internal scrolling
  useEffect(() => {
    const onCheck = () => {
      const el = containerRef.current
      if (!el) return setEnabled(false)
      const r = el.getBoundingClientRect()
      const vh = window.innerHeight || document.documentElement.clientHeight
      const fullyVisible = r.top >= -6 && r.bottom <= vh + 6
      setEnabled(fullyVisible)
    }
    onCheck()
    window.addEventListener('scroll', onCheck, { passive: true })
    window.addEventListener('resize', onCheck)
    return () => {
      window.removeEventListener('scroll', onCheck)
      window.removeEventListener('resize', onCheck)
    }
  }, [])

  // Lock body scroll while enabled
  useEffect(() => {
    if (enabled) {
      prevOverflow.current = document.body.style.overflow
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = prevOverflow.current || ''
    }
    return () => { document.body.style.overflow = prevOverflow.current || '' }
  }, [enabled])

  // Handle wheel/touch to move between images; let page scroll at edges
  useEffect(() => {
    const el = stageRef.current
    if (!el) return
    const total = Math.max(1, (N || 1) - 1)

    const onWheel = (e) => {
      if (!enabled) return
      const cur = posRef.current
      const atStart = cur <= 0
      const atEnd = cur >= total
      const goingDown = e.deltaY > 0
      if ((goingDown && atEnd) || (!goingDown && atStart)) {
        // release body scroll to continue page
        document.body.style.overflow = prevOverflow.current || ''
        return
      }
      e.preventDefault()
      const SPEED = 1 / 700
      setPos((p) => clamp(p + e.deltaY * SPEED, 0, total))
    }
    const onTouchStart = (e) => { if (enabled) touchY.current = e.changedTouches?.[0]?.clientY ?? null }
    const onTouchMove = (e) => {
      if (!enabled) return
      if (touchY.current == null) return
      const y = e.changedTouches?.[0]?.clientY ?? null
      if (y == null) return
      const dy = touchY.current - y
      const cur = posRef.current
      const atStart = cur <= 0
      const atEnd = cur >= total
      const goingDown = dy > 0
      if (!((goingDown && atEnd) || (!goingDown && atStart))) {
        e.preventDefault()
        const SPEED_T = 1 / 500
        setPos((p) => clamp(p + dy * SPEED_T, 0, total))
      } else {
        // release body scroll to continue page
        document.body.style.overflow = prevOverflow.current || ''
      }
      touchY.current = y
    }
    const opts = { passive: false }
    el.addEventListener('wheel', onWheel, opts)
    el.addEventListener('touchstart', onTouchStart, opts)
    el.addEventListener('touchmove', onTouchMove, opts)
    return () => {
      el.removeEventListener('wheel', onWheel, opts)
      el.removeEventListener('touchstart', onTouchStart, opts)
      el.removeEventListener('touchmove', onTouchMove, opts)
    }
  }, [enabled, N])

  if (!images || images.length === 0) return null
  const idx = Math.floor(pos)
  const total = Math.max(1, images.length - 1)
  const t = clamp(pos - idx, 0, 1)
  const cur = idx
  const nxt = Math.min(idx + 1, images.length - 1)

  const fadeOutStart = 0.35
  const fadeInStart = 0.55
  const curOpacity = t < fadeOutStart ? 1 : 1 - (t - fadeOutStart) / (1 - fadeOutStart)
  const nxtOpacity = t < fadeInStart ? 0 : (t - fadeInStart) / (1 - fadeInStart)

  return (
    <div ref={containerRef} className="relative" style={{ height: '100vh' }}>
      <div className="sticky top-0 h-screen bg-white">
        {/* Chapter title pinned at top */}
        <div className="text-center py-6">
          <h2 className="text-4xl md:text-5xl font-extrabold tracking-tight" style={{ fontFamily: 'Georgia, Cambria, \"Times New Roman\", Times, serif' }}>
            {chapterTitle}
          </h2>
        </div>
        {/* Stage fills viewport, images overlay */}
        <div ref={stageRef} className="relative" style={{ height: 'calc(100vh - 88px)' }}>
          <div className="absolute inset-0 flex items-center justify-center" style={{ zIndex: 2, transform: `translateY(${-t * 100}%)`, opacity: curOpacity, transition: 'transform 40ms linear, opacity 40ms linear' }}>
            <img src={images[cur]} alt={`${chapterTitle} ${cur + 1}`} className="max-w-full max-h-full object-contain" />
          </div>
          {nxt !== cur && (
            <div className="absolute inset-0 flex items-center justify-center" style={{ zIndex: 1, opacity: nxtOpacity, transition: 'opacity 40ms linear' }}>
              <img src={images[nxt]} alt={`${chapterTitle} ${nxt + 1}`} className="max-w-full max-h-full object-contain" />
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

// Animated text block (slide-up + fade-in/out) with consistent spacing
function AnimatedText({ children }) {
  const ref = useRef(null)
  const [visible, setVisible] = useState(false)
  useEffect(() => {
    const el = ref.current
    if (!el) return
    const obs = new IntersectionObserver(([entry]) => setVisible(entry.isIntersecting), { threshold: 0.2 })
    obs.observe(el)
    return () => obs.disconnect()
  }, [])
  return (
    <div
      ref={ref}
      className="transition-all duration-500"
      style={{ transform: visible ? 'translateY(0)' : 'translateY(16px)', opacity: visible ? 1 : 0 }}
    >
      {children}
    </div>
  )
}

// Generic fade-and-rise on enter/leave for sections
function AnimatedIn({ children }) {
  const ref = useRef(null)
  const [visible, setVisible] = useState(false)
  useEffect(() => {
    const el = ref.current
    if (!el) return
    const obs = new IntersectionObserver(([entry]) => setVisible(entry.isIntersecting), { threshold: 0.15 })
    obs.observe(el)
    return () => obs.disconnect()
  }, [])
  return (
    <div
      ref={ref}
      className="transition-all duration-500"
      style={{ transform: visible ? 'translateY(0)' : 'translateY(16px)', opacity: visible ? 1 : 0 }}
    >
      {children}
    </div>
  )
}

// Best-effort sort by date encoded in filename; fallback to name
function sortPhotosByNameDate(list = []) {
  const parse = (src) => {
    try {
      const name = String(src).split('/').pop() || ''
      const m = name.match(/(20\d{2})[-_]?([01]\d)[-_]?([0-3]\d)(?:[-_]?([0-2]\d)([0-5]\d)([0-5]\d))?/)
      if (!m) return 0
      const [_, y, mo, d, h = '00', mi = '00', s = '00'] = m
      const dt = new Date(Number(y), Number(mo) - 1, Number(d), Number(h), Number(mi), Number(s))
      return dt.getTime() || 0
    } catch { return 0 }
  }
  return [...list].sort((a, b) => {
    const da = parse(a)
    const db = parse(b)
    if (da && db) return da - db
    if (da) return -1
    if (db) return 1
    return String(a).localeCompare(String(b))
  })
}

// Event-driven, locked body scroll highlights scroller with pinned title
function ChapterHighlightsScroller({ images, chapterTitle }) {
  const wrapRef = useRef(null)
  const stageRef = useRef(null)
  const [enabled, setEnabled] = useState(false)
  const [pos, setPos] = useState(0)
  const posRef = useRef(0)
  const prevOverflow = useRef('')
  const touchY = useRef(null)
  const clamp = (v, a, b) => Math.max(a, Math.min(b, v))

  const checkEnabled = () => {
    const el = wrapRef.current
    if (!el) return setEnabled(false)
    const r = el.getBoundingClientRect()
    const vh = window.innerHeight || document.documentElement.clientHeight
    const fully = r.top >= -4 && r.bottom <= vh + 4
    const engaged = r.top <= 0 && r.bottom >= vh
    setEnabled(fully || engaged)
  }

  useEffect(() => {
    checkEnabled()
    window.addEventListener('scroll', checkEnabled, { passive: true })
    window.addEventListener('resize', checkEnabled)
    return () => {
      window.removeEventListener('scroll', checkEnabled)
      window.removeEventListener('resize', checkEnabled)
    }
  }, [])

  useEffect(() => { posRef.current = pos }, [pos])

  useEffect(() => {
    if (enabled) {
      prevOverflow.current = document.body.style.overflow
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = prevOverflow.current || ''
    }
    return () => { document.body.style.overflow = prevOverflow.current || '' }
  }, [enabled])

  useEffect(() => {
    const el = stageRef.current
    if (!el) return
    const total = Math.max(1, (images?.length || 1) - 1)
    const onWheel = (e) => {
      if (!enabled) return
      const cur = posRef.current
      const atStart = cur <= 0
      const atEnd = cur >= total
      const goingDown = e.deltaY > 0
      if ((goingDown && atEnd) || (!goingDown && atStart)) {
        // allow page to continue scrolling past edges
        document.body.style.overflow = prevOverflow.current || ''
        return
      }
      e.preventDefault()
      const SPEED = 1 / 120
      setPos((p) => clamp(p + e.deltaY * SPEED, 0, total))
    }
    const onTouchStart = (e) => { if (enabled) touchY.current = e.changedTouches?.[0]?.clientY ?? null }
    const onTouchMove = (e) => {
      if (!enabled) return
      if (touchY.current == null) return
      const y = e.changedTouches?.[0]?.clientY ?? null
      if (y == null) return
      const dy = touchY.current - y
      const cur = posRef.current
      const atStart = cur <= 0
      const atEnd = cur >= total
      const goingDown = dy > 0
      if (!((goingDown && atEnd) || (!goingDown && atStart))) {
        e.preventDefault()
        const SPEED_T = 1 / 180
        setPos((p) => clamp(p + dy * SPEED_T, 0, total))
      } else {
        document.body.style.overflow = prevOverflow.current || ''
      }
      touchY.current = y
    }
    const opts = { passive: false }
    el.addEventListener('wheel', onWheel, opts)
    el.addEventListener('touchstart', onTouchStart, opts)
    el.addEventListener('touchmove', onTouchMove, opts)
    return () => {
      el.removeEventListener('wheel', onWheel, opts)
      el.removeEventListener('touchstart', onTouchStart, opts)
      el.removeEventListener('touchmove', onTouchMove, opts)
    }
  }, [enabled, images?.length])

  if (!images || images.length === 0) return null
  const idx = Math.floor(pos)
  const total = Math.max(1, images.length - 1)
  const t = clamp(pos - idx, 0, 1)
  const cur = idx
  const next = Math.min(idx + 1, images.length - 1)

  const fadeOutStart = 0.35
  const fadeInStart = 0.55
  const curOpacity = t < fadeOutStart ? 1 : 1 - (t - fadeOutStart) / (1 - fadeOutStart)
  const nextOpacity = t < fadeInStart ? 0 : (t - fadeInStart) / (1 - fadeInStart)

  return (
    <div ref={wrapRef} className="relative" style={{ height: '100vh' }}>
      <div className="sticky top-0 h-screen bg-white">
        <div className="text-center py-6">
          <h2 className="text-4xl md:text-5xl font-extrabold tracking-tight" style={{ fontFamily: 'Georgia, Cambria, \"Times New Roman\", Times, serif' }}>
            {chapterTitle}
          </h2>
        </div>
        <div ref={stageRef} className="relative" style={{ height: 'calc(100vh - 88px)' }}>
          <div className="absolute inset-0 flex items-center justify-center" style={{ zIndex: 2, transform: `translateY(${-t * 100}%)`, opacity: curOpacity, transition: 'transform 30ms linear, opacity 30ms linear' }}>
            <img src={images[cur]} alt={`${chapterTitle} ${cur + 1}`} className="max-w-full max-h-full object-contain" />
          </div>
          {next !== cur && (
            <div className="absolute inset-0 flex items-center justify-center" style={{ zIndex: 1, opacity: nextOpacity, transition: 'opacity 30ms linear' }}>
              <img src={images[next]} alt={`${chapterTitle} ${next + 1}`} className="max-w-full max-h-full object-contain" />
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
// Responsive 2-row preview grid with +X overlay on last tile
function useColumns() {
  const [cols, setCols] = useState(() => {
    if (typeof window === 'undefined') return 2
    const w = window.innerWidth
    if (w < 768) return 2
    if (w < 1024) return 4
    return 6
  })
  useEffect(() => {
    const onResize = () => {
      const w = window.innerWidth
      setCols(w < 768 ? 2 : w < 1024 ? 4 : 6)
    }
    window.addEventListener('resize', onResize)
    return () => window.removeEventListener('resize', onResize)
  }, [])
  return cols
}

function PreviewGrid({ photos, onOpen, getText, title }) {
  const cols = useColumns()
  const frames = Math.max(2, cols * 2)
  const needsOverlay = photos.length > frames
  const visible = needsOverlay ? photos.slice(0, frames - 1) : photos.slice(0, frames)

  return (
    <div>
      <div className={`grid gap-4`} style={{ gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))` }}>
        {visible.map((src, i) => (
          <div
            key={i}
            className="aspect-square bg-white border border-black overflow-hidden cursor-pointer group"
            onClick={() => onOpen(i)}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') onOpen(i) }}
          >
            <img src={src} alt={`${title} ${i + 1}`} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
          </div>
        ))}
        {needsOverlay && (
          <button onClick={() => onOpen(frames - 1)} className="relative aspect-square border border-black bg-white group" type="button">
            <img src={photos[frames - 1]} alt={`${title} more`} className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-gray-200/70 flex items-center justify-center">
              <span className="text-xl md:text-2xl font-bold text-black">+{photos.length - (frames - 1)}</span>
            </div>
          </button>
        )}
      </div>
    </div>
  )
}

const PhotoStory = () => {
  const { storyId } = useParams()
  const navigate = useNavigate()
  const { getText, language } = useLanguage()

  const [story, setStory] = useState(null)
  const [loading, setLoading] = useState(true)
  const [content, setContent] = useState(null)
  const [contentLoading, setContentLoading] = useState(true)
  const [showCarousel, setShowCarousel] = useState(false)
  const [carouselData, setCarouselData] = useState({ images: [], title: '' })

  useEffect(() => {
    const s = photographyStories.find(s => s.id === storyId) || null
    setStory(s)
    setLoading(false)
  }, [storyId])

  useEffect(() => {
    const load = async () => {
      try {
        setContentLoading(true)
        const res = await fetch(getAssetPath(`content/photography/stories/${storyId}.json`), { cache: 'no-store' })
        if (!res.ok) throw new Error('no json')
        const data = await res.json()
        setContent(data)
      } catch {
        setContent(null)
      } finally {
        setContentLoading(false)
      }
    }
    load()
  }, [storyId])

  const resolvePartContent = (s, p) => {
    if (content) {
      const ch = (content.chapters || []).find((c) => c.id === p.id)
      const description = ch?.text ? (language === 'no' ? ch.text.no : ch.text.en) : ''
      const photos = (ch?.gallery || []).map(getAssetPath)
      return { description, highlights: [], photos }
    }
    const textMap = STORY_TEXT[s.id]?.[p.id]
    const description = textMap ? (language === 'no' ? textMap.no : textMap.en) : ''
    const photos = (STORY_PHOTOS[s.id]?.[p.id] || []).map(getAssetPath)
    return { description, highlights: [], photos }
  }

  const getHeroHighlights = (s) => {
    if (!s) return []
    if (content && Array.isArray(content.highlights)) {
      return content.highlights.map(getAssetPath)
    }
    // Prefer story-level Highlights folder when available (e.g., 1.jpeg..10.jpeg)
    if (s.id === 'stavern-sommer-2025') {
      const base = 'portfolio/photography/Stavern sommer 2025/Highlights'
      const files = Array.from({ length: 10 }, (_, i) => `${base}/${i + 1}.jpeg`)
      return files.map(getAssetPath)
    }
    if (s.id === 'portugal-2025') {
      const base = 'portfolio/photography/Portugal 2025/Highlights'
      const files = [
        `${base}/R1-09749-033A.JPG`,
        `${base}/R1-09749-019A.JPG`,
        `${base}/R1-09748-0026.JPG`,
        `${base}/R1-09748-0011.jpg`,
        `${base}/R1-09749-020A.jpg`,
        `${base}/R1-09748-0013.jpg`,
      ]
      return files.map(getAssetPath)
    }
    const all = (s?.parts || []).flatMap((p) => STORY_HIGHLIGHTS[s.id]?.[p.id] || [])
    return all.map(getAssetPath)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-white text-black flex items-center justify-center font-serif">
        <div className="text-black/70">Loading…</div>
      </div>
    )
  }

  if (!story) {
    return (
      <div className="min-h-screen bg-white text-black flex items-center justify-center font-serif">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4" style={{ fontFamily: 'Georgia, Cambria, \"Times New Roman\", Times, serif' }}>
            {getText({ en: 'Story not found', no: 'Historie ikke funnet' })}
          </h1>
          <button onClick={() => navigate('/photography')} className="underline">
            {getText({ en: 'Back to Photography', no: 'Tilbake til foto' })}
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white text-black animate-page-enter font-serif">
      {/* Top controls bar: Back + Language toggle (portal to body so it's truly sticky) */}
      {createPortal(
        <div className="fixed top-0 left-0 right-0 z-[2000] pointer-events-none">
          <div className="flex items-center justify-between gap-2 px-4 md:px-6 pt-2">
            <div className="pointer-events-auto">
              <button
                type="button"
                onClick={() => navigate(-1)}
                className="glass-bubble flex items-center gap-2 px-5 py-3 border"
                style={{ backgroundColor: 'rgba(255,255,255,0.6)', borderColor: 'rgba(0,0,0,0.15)', borderRadius: '9999px' }}
                aria-label={getText({ en: 'Go back', no: 'Tilbake' })}
                title={getText({ en: 'Go back', no: 'Tilbake' })}
              >
                <span aria-hidden className="text-black text-lg md:text-xl">←</span>
                <span className="hidden sm:inline text-black text-base md:text-lg">{getText({ en: 'Go back', no: 'Tilbake' })}</span>
              </button>
            </div>
            <div className="pointer-events-auto">
              <LanguageToggle />
            </div>
          </div>
        </div>,
        document.body
      )}

      <div className="max-w-6xl mx-auto px-6 pt-24 md:pt-32 pb-16">
        {(() => {
          const display = content
            ? {
                ...story,
                title: content.title,
                description: content.description,
                parts: (content.chapters || []).map((ch) => ({ id: ch.id, title: ch.title, photos: '' }))
              }
            : story
          const getChapterHero = content
            ? ((s, p) => {
                const ch = (content.chapters || []).find((c) => c.id === p.id)
                if (!ch?.mainImage) return null
                return { main: getAssetPath(ch.mainImage), extras: [] }
              })
            : ((s, p) => {
                if (s?.id === 'portugal-2025' && p?.id === 'part-1') {
                  const chapterRoot = (p.photos || '').replace(/photos\/?$/i, '')
                  const main = chapterRoot ? getAssetPath(`${chapterRoot}Main.JPG`) : null
                  return { main, extras: [] }
                }
                return null
              })
          const meta = content ? { dates: content.dates, camera: content.camera } : null
          return (
            <JournalEntry
              story={display}
              getText={getText}
              getHeroImages={getHeroHighlights}
              getPartContent={(s, p) => {
                const { description, photos } = resolvePartContent(s, p)
                return { description, photos }
              }}
              getChapterHero={getChapterHero}
              meta={meta}
              onOpenGallery={(images, title, startIndex = 0) => {
                setCarouselData({ images, title, startIndex: Math.max(0, Math.min(startIndex, (images?.length || 1) - 1)) })
                setShowCarousel(true)
              }}
            />
          )
        })()}
      </div>

      {showCarousel && (
        <ImageCarousel
          images={carouselData.images}
          title={carouselData.title}
          startIndex={Math.max(0, Math.min((carouselData.startIndex ?? 0), (carouselData.images?.length || 1) - 1))}
          onClose={() => setShowCarousel(false)}
        />
      )}
    </div>
  )
}

export default PhotoStory
