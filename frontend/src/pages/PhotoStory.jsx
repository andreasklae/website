import { useState, useEffect, useRef } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useLanguage } from '../contexts/LanguageContext'
import { photographyStories } from '../utils/data.jsx'
import { getAssetPath } from '../utils/paths'
import ImageCarousel from '../components/ImageCarousel'

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
  }
}

// Inline highlights lists for the Stavern story (for reliable carousel)
const STORY_HIGHLIGHTS = {
  'stavern-sommer-2025': {
    'part-1': [
      'portfolio/photography/Stavern sommer 2025/photos/Part 1 - Cabin Days/Highlights/68209391-AA1C-4272-A78D-E2E7EC5CD546_1_105_c.jpeg',
      'portfolio/photography/Stavern sommer 2025/photos/Part 1 - Cabin Days/Highlights/23E90F2C-3975-432C-850C-CD6A49B74DDB_1_105_c.jpeg',
      'portfolio/photography/Stavern sommer 2025/photos/Part 1 - Cabin Days/Highlights/04CAB51D-54E2-4453-8D28-C36321A46635_1_105_c.jpeg'
    ],
    'part-2': [
      'portfolio/photography/Stavern sommer 2025/photos/Part 2 - Coastal Walks/highlights/1AAB2DEA-765F-466C-B563-895DDB2511CD_1_105_c.jpeg',
      'portfolio/photography/Stavern sommer 2025/photos/Part 2 - Coastal Walks/highlights/9B5C5D4B-1F85-41F4-9024-86BE25CD8598_1_105_c.jpeg',
      'portfolio/photography/Stavern sommer 2025/photos/Part 2 - Coastal Walks/highlights/0CF0A802-D8A2-44EC-80DB-8509AB5960DC_1_105_c.jpeg',
      'portfolio/photography/Stavern sommer 2025/photos/Part 2 - Coastal Walks/highlights/34CEC9DA-1E89-4166-A46F-59904B6CE428_1_105_c.jpeg'
    ],
    'part-3': [
      'portfolio/photography/Stavern sommer 2025/photos/Part 3 - Festival Day/highlights/1DD4F0E1-95E5-4AF9-9FAD-3F6AFE1E1AC6_1_105_c.jpeg',
      'portfolio/photography/Stavern sommer 2025/photos/Part 3 - Festival Day/highlights/CFE4E1E5-642D-4DCC-992D-FC3EF715BEA8_1_105_c.jpeg',
      'portfolio/photography/Stavern sommer 2025/photos/Part 3 - Festival Day/highlights/3A378108-010C-4944-AEED-66519AFCC108_1_105_c.jpeg',
      'portfolio/photography/Stavern sommer 2025/photos/Part 3 - Festival Day/highlights/284A1B7B-F731-4DCA-8735-A01FFC325FB4_1_105_c.jpeg'
    ],
    'part-4': [
      'portfolio/photography/Stavern sommer 2025/photos/Part 4 - The Walk Home/Highlights/1B28F38D-D879-4965-AAE1-F24967382940_1_105_c.jpeg',
      'portfolio/photography/Stavern sommer 2025/photos/Part 4 - The Walk Home/Highlights/0F072DF0-6376-47A4-9EA6-0F6E2709CE92_1_105_c.jpeg',
      'portfolio/photography/Stavern sommer 2025/photos/Part 4 - The Walk Home/Highlights/3CE8CF6A-912F-49D9-BC16-DCAEEDDE8158_1_105_c.jpeg'
    ]
  }
}

// Inline photo lists (truncated selection) for grid/Carousel
const STORY_PHOTOS = {
  'stavern-sommer-2025': {
    'part-1': [
      'portfolio/photography/Stavern sommer 2025/photos/Part 1 - Cabin Days/photos/36C2670B-C30D-4D87-BB90-E7CD71B16A7C_1_105_c.jpeg',
      'portfolio/photography/Stavern sommer 2025/photos/Part 1 - Cabin Days/photos/C6D44452-98EC-4E18-9B90-18C22BCDD5D5_1_105_c.jpeg',
      'portfolio/photography/Stavern sommer 2025/photos/Part 1 - Cabin Days/photos/0B1A03BD-DE20-42F1-BA70-8E6EAF5EEFDE_1_105_c.jpeg',
      'portfolio/photography/Stavern sommer 2025/photos/Part 1 - Cabin Days/photos/8387DE13-323C-491B-9158-FBAD48055A7D_1_105_c.jpeg',
      'portfolio/photography/Stavern sommer 2025/photos/Part 1 - Cabin Days/photos/4B798414-C3D1-482D-9D9C-2584BF93B280_1_105_c.jpeg',
      'portfolio/photography/Stavern sommer 2025/photos/Part 1 - Cabin Days/photos/A4D9CF78-274F-4B0D-A910-7DD965BC2FF9_1_105_c.jpeg',
      'portfolio/photography/Stavern sommer 2025/photos/Part 1 - Cabin Days/photos/69E96779-286E-4721-9BA4-B1EAA4013220_1_105_c.jpeg',
      'portfolio/photography/Stavern sommer 2025/photos/Part 1 - Cabin Days/photos/68209391-AA1C-4272-A78D-E2E7EC5CD546_1_105_c.jpeg',
      'portfolio/photography/Stavern sommer 2025/photos/Part 1 - Cabin Days/photos/76DE0E86-81B4-44DB-97F0-F6C3CA8767E3_1_105_c.jpeg',
      'portfolio/photography/Stavern sommer 2025/photos/Part 1 - Cabin Days/photos/4DC74B00-8910-4E1E-ABDC-7F0EB3B9D542_1_105_c.jpeg',
      'portfolio/photography/Stavern sommer 2025/photos/Part 1 - Cabin Days/photos/7E122CA0-9186-4DBB-8712-832FEDEA6D6C_1_105_c.jpeg',
      'portfolio/photography/Stavern sommer 2025/photos/Part 1 - Cabin Days/photos/4B76B7A4-7B9B-458D-9BF6-F900C46EC732_1_105_c.jpeg',
      'portfolio/photography/Stavern sommer 2025/photos/Part 1 - Cabin Days/photos/E76A815B-3184-41EB-B3CF-B1AC0DB71DFD_1_105_c.jpeg',
      'portfolio/photography/Stavern sommer 2025/photos/Part 1 - Cabin Days/photos/9B6AE445-97D0-4883-95A9-8DF54DDEA1F4_1_105_c.jpeg',
      'portfolio/photography/Stavern sommer 2025/photos/Part 1 - Cabin Days/photos/A65BAA11-F4E5-42CD-A331-B25D22BD0167_1_105_c.jpeg',
      'portfolio/photography/Stavern sommer 2025/photos/Part 1 - Cabin Days/photos/A6C954F8-E020-41EC-9DED-C93CA0F4898C_1_105_c.jpeg',
      'portfolio/photography/Stavern sommer 2025/photos/Part 1 - Cabin Days/photos/308D1B80-E1FF-49C8-80FE-1853D1E85D09_1_105_c.jpeg',
      'portfolio/photography/Stavern sommer 2025/photos/Part 1 - Cabin Days/photos/448B8EC5-023A-4510-83D8-130CF80B2E1A_1_105_c.jpeg',
      'portfolio/photography/Stavern sommer 2025/photos/Part 1 - Cabin Days/photos/23E90F2C-3975-432C-850C-CD6A49B74DDB_1_105_c.jpeg',
      'portfolio/photography/Stavern sommer 2025/photos/Part 1 - Cabin Days/photos/A8B139C6-5F54-4BB6-AFE7-A509E69C409F_1_105_c.jpeg',
      'portfolio/photography/Stavern sommer 2025/photos/Part 1 - Cabin Days/photos/83CB36C7-45A6-469F-AAC2-5A120345D5CD_1_105_c.jpeg',
      'portfolio/photography/Stavern sommer 2025/photos/Part 1 - Cabin Days/photos/04CAB51D-54E2-4453-8D28-C36321A46635_1_105_c.jpeg',
      'portfolio/photography/Stavern sommer 2025/photos/Part 1 - Cabin Days/photos/A79876F4-990E-426D-8EA3-8EA4828A49C2_1_105_c.jpeg',
      'portfolio/photography/Stavern sommer 2025/photos/Part 1 - Cabin Days/photos/9E5D08C9-28E3-4E10-898B-9487AA836CEC_1_105_c.jpeg'
    ],
    'part-2': [
      'portfolio/photography/Stavern sommer 2025/photos/Part 2 - Coastal Walks/photos/1B2A349F-7152-49BD-9211-BB1597A81266_1_105_c.jpeg',
      'portfolio/photography/Stavern sommer 2025/photos/Part 2 - Coastal Walks/photos/1CBE289C-3ED5-4299-BDB6-3E07A02D6C56_1_105_c.jpeg',
      'portfolio/photography/Stavern sommer 2025/photos/Part 2 - Coastal Walks/photos/5761386C-14E8-4166-BBDC-E776D9954B13_1_105_c.jpeg',
      'portfolio/photography/Stavern sommer 2025/photos/Part 2 - Coastal Walks/photos/6597D0A6-B584-4751-B10B-413362E89577_1_105_c.jpeg',
      'portfolio/photography/Stavern sommer 2025/photos/Part 2 - Coastal Walks/photos/56F9A293-2070-453D-BDDA-F4FF138C7DAB_1_105_c.jpeg',
      'portfolio/photography/Stavern sommer 2025/photos/Part 2 - Coastal Walks/photos/55D9B6AB-0C20-409B-B661-04876CBBB1D5_1_105_c.jpeg',
      'portfolio/photography/Stavern sommer 2025/photos/Part 2 - Coastal Walks/photos/1AAB2DEA-765F-466C-B563-895DDB2511CD_1_105_c.jpeg',
      'portfolio/photography/Stavern sommer 2025/photos/Part 2 - Coastal Walks/photos/C09B4991-B204-43EB-AEA9-B81240D8BB5A_1_105_c.jpeg',
      'portfolio/photography/Stavern sommer 2025/photos/Part 2 - Coastal Walks/photos/D61BF33E-A80C-47A8-B165-EB71D4A6BA63_1_105_c.jpeg',
      'portfolio/photography/Stavern sommer 2025/photos/Part 2 - Coastal Walks/photos/51D05D80-1B09-4AE7-9B05-EB8691E6A37F_1_105_c.jpeg',
      'portfolio/photography/Stavern sommer 2025/photos/Part 2 - Coastal Walks/photos/8C685ACA-22E9-4232-92FA-9D893029276D_1_105_c.jpeg',
      'portfolio/photography/Stavern sommer 2025/photos/Part 2 - Coastal Walks/photos/E9F3955D-555E-426F-846E-010955C1793D_1_105_c.jpeg',
      'portfolio/photography/Stavern sommer 2025/photos/Part 2 - Coastal Walks/photos/665C4967-1ADD-4FD5-AB22-ACE3219BF72A_1_105_c.jpeg',
      'portfolio/photography/Stavern sommer 2025/photos/Part 2 - Coastal Walks/photos/B2724FE7-19C2-46BC-908D-C2F8574AE429_1_105_c.jpeg',
      'portfolio/photography/Stavern sommer 2025/photos/Part 2 - Coastal Walks/photos/E8FC7C12-3388-4D83-A396-CC51A0E341C5_1_105_c.jpeg',
      'portfolio/photography/Stavern sommer 2025/photos/Part 2 - Coastal Walks/photos/2E3C3F4C-1345-4834-8F6C-8EB06C462D94_1_105_c.jpeg',
      'portfolio/photography/Stavern sommer 2025/photos/Part 2 - Coastal Walks/photos/D8C11CED-29C2-4EF9-B0EB-8195AA43789A_1_105_c.jpeg',
      'portfolio/photography/Stavern sommer 2025/photos/Part 2 - Coastal Walks/photos/7D336796-B944-40F8-BC4C-6CC3B39FE624_1_105_c.jpeg',
      'portfolio/photography/Stavern sommer 2025/photos/Part 2 - Coastal Walks/photos/16F98878-547E-49BC-ADD0-D3A63D5F942B_1_105_c.jpeg',
      'portfolio/photography/Stavern sommer 2025/photos/Part 2 - Coastal Walks/photos/B07B66A3-6670-470F-83DB-CB720B25B29F_1_105_c.jpeg',
      'portfolio/photography/Stavern sommer 2025/photos/Part 2 - Coastal Walks/photos/9B5C5D4B-1F85-41F4-9024-86BE25CD8598_1_105_c.jpeg',
      'portfolio/photography/Stavern sommer 2025/photos/Part 2 - Coastal Walks/photos/E31C244F-1C7D-4168-B7FD-ED0D6ECCB0C3_1_105_c.jpeg',
      'portfolio/photography/Stavern sommer 2025/photos/Part 2 - Coastal Walks/photos/33A83766-0229-416C-8ED8-D5924B4183D6_1_105_c.jpeg',
      'portfolio/photography/Stavern sommer 2025/photos/Part 2 - Coastal Walks/photos/7C4BBB45-73E7-4ACC-A244-000B394962CE_1_105_c.jpeg'
    ],
    'part-3': [
      'portfolio/photography/Stavern sommer 2025/photos/Part 3 - Festival Day/photos/F7A85B30-ED16-47EC-BE86-3F71C317BF31_1_105_c.jpeg',
      'portfolio/photography/Stavern sommer 2025/photos/Part 3 - Festival Day/photos/C06A41BA-F332-4ED4-84C4-9AB41348EF24_1_105_c.jpeg',
      'portfolio/photography/Stavern sommer 2025/photos/Part 3 - Festival Day/photos/F0ED4D76-966E-4C91-9270-A168A827E63A_1_105_c.jpeg',
      'portfolio/photography/Stavern sommer 2025/photos/Part 3 - Festival Day/photos/97E9474D-413C-4BEE-9D68-D2DE22212DEB_1_105_c.jpeg',
      'portfolio/photography/Stavern sommer 2025/photos/Part 3 - Festival Day/photos/B01A933B-3947-4599-AE58-A21AE4E8781B_1_105_c.jpeg',
      'portfolio/photography/Stavern sommer 2025/photos/Part 3 - Festival Day/photos/56691637-6EED-4E65-A39D-249192185136_1_105_c.jpeg',
      'portfolio/photography/Stavern sommer 2025/photos/Part 3 - Festival Day/photos/FCA56337-2597-492B-9064-EB40125CE683_1_105_c.jpeg',
      'portfolio/photography/Stavern sommer 2025/photos/Part 3 - Festival Day/photos/1DD4F0E1-95E5-4AF9-9FAD-3F6AFE1E1AC6_1_105_c.jpeg',
      'portfolio/photography/Stavern sommer 2025/photos/Part 3 - Festival Day/photos/DEC4D468-3AB5-43A1-A9CF-6A91C369A902_1_105_c.jpeg',
      'portfolio/photography/Stavern sommer 2025/photos/Part 3 - Festival Day/photos/1710A7EA-FC7A-4FCF-A9B4-209EFBD2743E_1_105_c.jpeg',
      'portfolio/photography/Stavern sommer 2025/photos/Part 3 - Festival Day/photos/CFE4E1E5-642D-4DCC-992D-FC3EF715BEA8_1_105_c.jpeg',
      'portfolio/photography/Stavern sommer 2025/photos/Part 3 - Festival Day/photos/3A378108-010C-4944-AEED-66519AFCC108_1_105_c.jpeg',
      'portfolio/photography/Stavern sommer 2025/photos/Part 3 - Festival Day/photos/CA9221C3-FC5F-443A-BB7C-F4D4ACAF789F_1_105_c.jpeg',
      'portfolio/photography/Stavern sommer 2025/photos/Part 3 - Festival Day/photos/284A1B7B-F731-4DCA-8735-A01FFC325FB4_1_105_c.jpeg',
      'portfolio/photography/Stavern sommer 2025/photos/Part 3 - Festival Day/photos/EDCFFCB3-8179-49E6-9BEA-69A22BD56D65_1_105_c.jpeg',
      'portfolio/photography/Stavern sommer 2025/photos/Part 3 - Festival Day/photos/1948EC91-6F65-4E19-A5B1-A554451FB419_1_105_c.jpeg',
      'portfolio/photography/Stavern sommer 2025/photos/Part 3 - Festival Day/photos/0C63D9C2-E5E0-48DC-B803-5F0755B56946_1_105_c.jpeg',
      'portfolio/photography/Stavern sommer 2025/photos/Part 3 - Festival Day/photos/321D7333-D3F7-4845-8420-485193194743_1_105_c.jpeg',
      'portfolio/photography/Stavern sommer 2025/photos/Part 3 - Festival Day/photos/BA406FE6-6622-4728-800A-3BDD06257BBC_1_105_c.jpeg',
      'portfolio/photography/Stavern sommer 2025/photos/Part 3 - Festival Day/photos/2A8F87AD-687F-4625-A2AA-96E0F836CFE4_1_105_c.jpeg'
    ],
    'part-4': [
      'portfolio/photography/Stavern sommer 2025/photos/Part 4 - The Walk Home/photos/2B0FC1AF-F365-4D86-AB12-99D79AE41685_1_105_c.jpeg',
      'portfolio/photography/Stavern sommer 2025/photos/Part 4 - The Walk Home/photos/3F508E4C-0363-4FF4-BC34-B4F025910D72_1_201_a.jpeg',
      'portfolio/photography/Stavern sommer 2025/photos/Part 4 - The Walk Home/photos/1B28F38D-D879-4965-AAE1-F24967382940_1_105_c.jpeg',
      'portfolio/photography/Stavern sommer 2025/photos/Part 4 - The Walk Home/photos/D9C2CBBC-46DF-45BC-B365-8D2A0DD8881E_1_105_c.jpeg',
      'portfolio/photography/Stavern sommer 2025/photos/Part 4 - The Walk Home/photos/B2DCC473-76D5-45C3-AC80-0A1DB30F6EDF_1_105_c.jpeg',
      'portfolio/photography/Stavern sommer 2025/photos/Part 4 - The Walk Home/photos/C612B5E1-066D-400F-A27D-38201042D935_1_105_c.jpeg',
      'portfolio/photography/Stavern sommer 2025/photos/Part 4 - The Walk Home/photos/06331420-1049-475F-9F4B-66A7604C3A8D_1_105_c.jpeg',
      'portfolio/photography/Stavern sommer 2025/photos/Part 4 - The Walk Home/photos/0F072DF0-6376-47A4-9EA6-0F6E2709CE92_1_105_c.jpeg',
      'portfolio/photography/Stavern sommer 2025/photos/Part 4 - The Walk Home/photos/69522BE0-365F-4DC0-9D85-60F9643AB01B_1_105_c.jpeg',
      'portfolio/photography/Stavern sommer 2025/photos/Part 4 - The Walk Home/photos/6BC0C5FC-1417-40F1-8D47-CF968E01511C_1_105_c.jpeg',
      'portfolio/photography/Stavern sommer 2025/photos/Part 4 - The Walk Home/photos/64DF19AC-1017-4F27-94E6-576DEDB602ED_1_105_c.jpeg',
      'portfolio/photography/Stavern sommer 2025/photos/Part 4 - The Walk Home/photos/3CE8CF6A-912F-49D9-BC16-DCAEEDDE8158_1_105_c.jpeg',
      'portfolio/photography/Stavern sommer 2025/photos/Part 4 - The Walk Home/photos/072D3785-FD27-429D-8724-8DE0A9C21695_1_105_c.jpeg'
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
        <img src={getAssetPath(images[index])} alt={`${title} ${index + 1}`} className="max-w-full max-h-full object-contain block" />
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
          <div key={i} className="aspect-square bg-white border border-black overflow-hidden cursor-pointer group" onClick={onOpen}>
            <img src={src} alt={`${title} ${i + 1}`} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
          </div>
        ))}
        {needsOverlay && (
          <button onClick={onOpen} className="relative aspect-square border border-black bg-white group">
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
  const [showCarousel, setShowCarousel] = useState(false)
  const [carouselData, setCarouselData] = useState({ images: [], title: '' })

  useEffect(() => {
    const s = photographyStories.find(s => s.id === storyId) || null
    setStory(s)
    setLoading(false)
  }, [storyId])

  const getPartContent = (s, p) => {
    const textMap = STORY_TEXT[s.id]?.[p.id]
    const description = textMap ? (language === 'no' ? textMap.no : textMap.en) : ''
    const highlights = (STORY_HIGHLIGHTS[s.id]?.[p.id] || []).map(getAssetPath)
    const photos = (STORY_PHOTOS[s.id]?.[p.id] || []).map(getAssetPath)
    return { description, highlights, photos }
  }

  const getHeroHighlights = (s) => {
    const all = (s?.parts || []).flatMap((p) => STORY_HIGHLIGHTS[s.id]?.[p.id] || [])
    return all || []
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
      {/* Back arrow (glass) */}
      <div className="fixed top-2 left-4 md:left-6 z-[1000] pointer-events-auto">
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="glass-bubble flex items-center gap-2 px-5 py-3 border"
          style={{ backgroundColor: 'rgba(255,255,255,0.5)', borderColor: 'rgba(255,255,255,0.3)', borderRadius: '9999px' }}
          aria-label={getText({ en: 'Go back', no: 'Tilbake' })}
          title={getText({ en: 'Go back', no: 'Tilbake' })}
        >
          <span aria-hidden className="text-black text-lg md:text-xl">←</span>
          <span className="hidden sm:inline text-black text-base md:text-lg">{getText({ en: 'Go back', no: 'Tilbake' })}</span>
        </button>
      </div>

      <div className="max-w-6xl mx-auto px-6 pt-24 md:pt-32 pb-16">
        {/* Header */}
        <header className="text-center select-none mb-10">
          <div className="border-y border-black py-4 mb-6">
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight px-2" style={{ fontFamily: 'Georgia, Cambria, \"Times New Roman\", Times, serif' }}>
              {getText(story.title).toUpperCase()}
            </h1>
          </div>
          <p className="text-lg md:text-xl italic" style={{ fontFamily: 'Georgia, Cambria, \"Times New Roman\", Times, serif' }}>
            {getText(story.description)}
          </p>
        </header>

        {/* Top-level highlights carousel (smaller; reuses photography style) */}
        <div className="mb-10">
          <HeroCarousel images={getHeroHighlights(story)} title={getText(story.title)} />
        </div>

        {/* Chapters label removed per request */}

        {/* Chapters — scroll through sections in order: title → highlights scroller → text → preview grid */}
        {story.parts.map((p, idx) => {
          const { description, highlights, photos } = getPartContent(story, p)
          return (
            <section key={p.id} className="mt-14">
              {/* Sticky stack keeps title + images visible; text below will not show during sequence */}
              {highlights && highlights.length > 0 && (
                <StickyImageStack
                  images={highlights}
                  chapterTitle={`${getText({ en: `Chapter ${idx + 1}: `, no: `Del ${idx + 1}: ` })}${getText(p.title)}`}
                />
              )}

              {/* Chapter text */}
              {description && (
                <div className="max-w-3xl mx-auto mt-12">
                  <AnimatedText>
                    <p className="text-2xl md:text-3xl leading-relaxed whitespace-pre-line" style={{ fontFamily: 'Georgia, Cambria, \"Times New Roman\", Times, serif' }}>
                      {description}
                    </p>
                  </AnimatedText>
                </div>
              )}

              {/* Preview grid: exactly 2 rows; last tile becomes +X overlay when more */}
              {photos && photos.length > 0 && (
                <div className="mt-8">
                  <PreviewGrid
                    photos={photos}
                    onOpen={() => { setCarouselData({ images: photos, title: `${getText(story.title)} - ${getText(p.title)}` }); setShowCarousel(true) }}
                    getText={getText}
                    title={getText(p.title)}
                  />
                </div>
              )}
            </section>
          )
        })}
      </div>

      {showCarousel && (
        <ImageCarousel images={carouselData.images} title={carouselData.title} onClose={() => setShowCarousel(false)} />
      )}
    </div>
  )
}

export default PhotoStory
