import type { Locale } from "@/lib/i18n";

/** A content block, rendered generically by the article page. */
export type Block =
  | { type: "p"; text: string }
  | { type: "h2"; text: string }
  | { type: "ul"; items: string[] }
  | { type: "tip"; text: string };

export type ArticleContent = {
  title: string;
  description: string;
  minutes: number;
  updated: string; // ISO date
  body: Block[];
};

export type Article = {
  slug: string;
  en: ArticleContent;
  es: ArticleContent;
};

/**
 * Long-form, original articles for people who read comics and manga on
 * e-readers. Written to genuinely help (and, in doing so, to rank for the
 * searches that bring that audience in), not as filler.
 */
export const ARTICLES: Article[] = [
  {
    slug: "read-manga-on-kindle",
    en: {
      title: "How to read manga on a Kindle without the eye strain",
      description:
        "A practical guide to reading manga comfortably on a Kindle: the right file format, panel-by-panel conversion, reading direction, and the settings that actually matter on e-ink.",
      minutes: 6,
      updated: "2026-07-22",
      body: [
        {
          type: "p",
          text: "A Kindle is a wonderful way to read prose and a frustrating way to read manga — at least straight out of the box. Drop a raw scan onto the device and you get a full page shrunk to a 6-inch screen, with dialogue too small to read without pinching and zooming on every panel. The good news is that almost all of that pain comes from format, not from the hardware. With the pages prepared correctly, a basic Kindle is a genuinely great manga reader.",
        },
        {
          type: "p",
          text: "This guide walks through what actually makes manga readable on e-ink, and how to prepare a file so you never have to zoom again.",
        },
        {
          type: "h2",
          text: "Why raw manga looks bad on a Kindle",
        },
        {
          type: "p",
          text: "A manga page is designed for print — roughly A5 or B6 paper held in the hand. A Kindle Paperwhite screen is smaller and, crucially, has far fewer pixels than a printed page has ink. When the whole page is scaled down to fit, fine linework and small lettering fall below the size your eye can resolve. E-ink also refreshes slowly and has lower contrast than paper, which punishes tiny text further.",
        },
        {
          type: "p",
          text: "The fix is not a sharper screen. It is to stop showing the whole page at once.",
        },
        {
          type: "h2",
          text: "Panel-by-panel is the key",
        },
        {
          type: "p",
          text: "The single biggest improvement you can make is to split each page into its individual panels and show one panel (or a small group of related panels) per screen. Each panel then fills the display, dialogue becomes comfortably large, and you move through the story with the page-turn button instead of your fingertips. This is exactly what TomoRead's Smart conversion does automatically: it detects the panels, trims the empty margins, and rebuilds the comic so every panel is its own readable page.",
        },
        {
          type: "tip",
          text: "Good panel splitting never cuts through a speech balloon or a character. If a page can't be split cleanly, it is better to keep it whole than to slice it badly — a conservative converter leaves ambiguous pages intact.",
        },
        {
          type: "h2",
          text: "Right-to-left: don't skip this",
        },
        {
          type: "p",
          text: "Japanese manga is read right to left, both in panel order and page order. If you convert without telling the tool this, the panels will come out in the wrong sequence and the story will read as nonsense. In TomoRead, open Advanced options and enable “Manga reading order (right to left)”. For Korean manhwa, Chinese manhua and western comics, leave it off — those read left to right.",
        },
        {
          type: "h2",
          text: "The best file format for a Kindle",
        },
        {
          type: "p",
          text: "For a Kindle specifically, convert to EPUB (fixed-layout) or PDF. Fixed-layout EPUB is the format Amazon's own comic tooling produces, and it plays nicely with Send to Kindle. PDF is the most universal fallback and always works. If you use a comic reading app instead of the native reader, CBZ is the cleanest archive format. TomoRead can output any of these.",
        },
        {
          type: "h2",
          text: "Grayscale and contrast",
        },
        {
          type: "p",
          text: "A Kindle screen is grayscale, so there is no reason to carry colour data — it only makes files larger. Converting to optimized grayscale with a mild contrast boost makes blacks deeper and screentone cleaner on e-ink. When you pick the Kindle profile in TomoRead, this happens automatically at the right resolution for the device.",
        },
        {
          type: "h2",
          text: "Getting the file onto the device",
        },
        {
          type: "p",
          text: "Once you have an EPUB or PDF, the easiest route is Amazon's Send to Kindle: email it to your personal Kindle address, or use the Send to Kindle web page or desktop app. The file appears in your library over Wi-Fi within a minute or two. There's a fuller walkthrough in our guide on getting comics onto a Kindle, Kobo or Boox.",
        },
        {
          type: "h2",
          text: "A quick recipe",
        },
        {
          type: "ul",
          items: [
            "Upload your CBZ, CBR or PDF to TomoRead.",
            "Choose Smart conversion and the Kindle profile.",
            "For Japanese manga, enable right-to-left reading order.",
            "Output as EPUB (or PDF).",
            "Download and Send to Kindle.",
          ],
        },
        {
          type: "p",
          text: "That's it — panel-sized pages, readable text, correct order, no zooming. The same approach works for any small e-ink screen; only the device profile changes.",
        },
      ],
    },
    es: {
      title: "Cómo leer manga en un Kindle sin forzar la vista",
      description:
        "Guía práctica para leer manga cómodamente en un Kindle: el formato adecuado, la conversión viñeta a viñeta, el sentido de lectura y los ajustes que de verdad importan en tinta electrónica.",
      minutes: 6,
      updated: "2026-07-22",
      body: [
        {
          type: "p",
          text: "El Kindle es maravilloso para leer texto y frustrante para leer manga — al menos tal cual viene de fábrica. Metes un escaneo sin preparar y obtienes una página entera encogida a una pantalla de 6 pulgadas, con diálogos tan pequeños que hay que hacer zoom en cada viñeta. La buena noticia es que casi todo ese problema viene del formato, no del aparato. Con las páginas bien preparadas, un Kindle básico es un lector de manga estupendo.",
        },
        {
          type: "p",
          text: "Esta guía explica qué hace que el manga se lea bien en tinta electrónica y cómo preparar un archivo para no volver a hacer zoom.",
        },
        {
          type: "h2",
          text: "Por qué el manga sin preparar se ve mal en un Kindle",
        },
        {
          type: "p",
          text: "Una página de manga está diseñada para papel — más o menos tamaño A5 o B6 en la mano. La pantalla de un Kindle Paperwhite es más pequeña y, sobre todo, tiene muchos menos píxeles que tinta tiene una página impresa. Al reducir toda la página para que quepa, las líneas finas y las letras pequeñas quedan por debajo de lo que el ojo puede distinguir. La tinta electrónica, además, refresca despacio y tiene menos contraste que el papel, lo que castiga aún más el texto diminuto.",
        },
        {
          type: "p",
          text: "La solución no es una pantalla más nítida. Es dejar de mostrar la página entera de golpe.",
        },
        {
          type: "h2",
          text: "La clave es viñeta a viñeta",
        },
        {
          type: "p",
          text: "La mayor mejora que puedes hacer es dividir cada página en sus viñetas y mostrar una viñeta (o un grupo pequeño de viñetas relacionadas) por pantalla. Así cada viñeta llena la pantalla, el diálogo se vuelve cómodamente grande y avanzas con el botón de pasar página en lugar de con los dedos. Es exactamente lo que hace la conversión inteligente de TomoRead: detecta las viñetas, recorta los márgenes vacíos y reconstruye el cómic para que cada viñeta sea su propia página legible.",
        },
        {
          type: "tip",
          text: "Una buena división de viñetas nunca corta un globo de diálogo ni un personaje. Si una página no se puede dividir con limpieza, es mejor dejarla entera que partirla mal — un conversor prudente respeta las páginas ambiguas.",
        },
        {
          type: "h2",
          text: "Derecha a izquierda: no te lo saltes",
        },
        {
          type: "p",
          text: "El manga japonés se lee de derecha a izquierda, tanto en el orden de las viñetas como en el de las páginas. Si conviertes sin indicarlo, las viñetas saldrán en el orden equivocado y la historia no tendrá sentido. En TomoRead, abre Opciones avanzadas y activa «Orden de lectura de manga (derecha a izquierda)». Para el manhwa coreano, el manhua chino y los cómics occidentales, déjalo desactivado — esos se leen de izquierda a derecha.",
        },
        {
          type: "h2",
          text: "El mejor formato para un Kindle",
        },
        {
          type: "p",
          text: "Para un Kindle en concreto, convierte a EPUB (de diseño fijo) o PDF. El EPUB de diseño fijo es el formato que produce la propia herramienta de cómics de Amazon y funciona bien con Send to Kindle. El PDF es el comodín más universal y siempre funciona. Si usas una app de lectura de cómics en vez del lector nativo, el CBZ es el formato de archivo más limpio. TomoRead puede generar cualquiera de ellos.",
        },
        {
          type: "h2",
          text: "Escala de grises y contraste",
        },
        {
          type: "p",
          text: "La pantalla del Kindle es en escala de grises, así que no tiene sentido cargar datos de color — solo agranda el archivo. Convertir a escala de grises optimizada con un leve aumento de contraste hace los negros más profundos y la trama más limpia en tinta electrónica. Al elegir el perfil Kindle en TomoRead, esto ocurre solo, a la resolución correcta del dispositivo.",
        },
        {
          type: "h2",
          text: "Pasar el archivo al dispositivo",
        },
        {
          type: "p",
          text: "Cuando tengas el EPUB o el PDF, lo más fácil es Send to Kindle de Amazon: envíalo por correo a tu dirección personal de Kindle, o usa la página web o la app de escritorio de Send to Kindle. El archivo aparece en tu biblioteca por Wi-Fi en un par de minutos. Hay una explicación más completa en nuestra guía para pasar cómics a un Kindle, Kobo o Boox.",
        },
        {
          type: "h2",
          text: "Receta rápida",
        },
        {
          type: "ul",
          items: [
            "Sube tu CBZ, CBR o PDF a TomoRead.",
            "Elige conversión inteligente y el perfil Kindle.",
            "Para manga japonés, activa el orden de lectura derecha a izquierda.",
            "Genera un EPUB (o PDF).",
            "Descarga y usa Send to Kindle.",
          ],
        },
        {
          type: "p",
          text: "Listo — páginas del tamaño de la viñeta, texto legible, orden correcto y sin zoom. El mismo método sirve para cualquier pantalla pequeña de tinta electrónica; solo cambia el perfil del dispositivo.",
        },
      ],
    },
  },
  {
    slug: "comic-formats-explained",
    en: {
      title: "CBZ, CBR, EPUB or PDF: which comic format for your e-reader",
      description:
        "A plain-language comparison of the common comic and manga file formats — CBZ, CBR, EPUB, PDF and images — and which one to use for Kindle, Kobo, Boox and reading apps.",
      minutes: 5,
      updated: "2026-07-22",
      body: [
        {
          type: "p",
          text: "Comic files come in an alphabet soup of formats, and the differences matter more on an e-reader than on a computer. Here is what each one actually is, and when to use it.",
        },
        {
          type: "h2",
          text: "CBZ — the comic archive",
        },
        {
          type: "p",
          text: "A CBZ is simply a ZIP file full of images, renamed with a .cbz extension. The pages are ordered by filename. It is the de facto standard for digital comics because it is open, lossless, and trivially easy for apps to read. If you use a dedicated comic reader (like Panels, Chunky, KOReader or Tachiyomi-style apps), CBZ is usually the best choice.",
        },
        {
          type: "h2",
          text: "CBR — the same idea, different zipper",
        },
        {
          type: "p",
          text: "A CBR is the same concept but built on a RAR archive instead of ZIP. It reads identically, but RAR is a proprietary format, so some tools and servers can't open it. Many files that end in .cbr are actually ZIP archives that were simply renamed — TomoRead detects the real format by inspecting the file, not just its extension, so a mislabelled file still converts. If you're choosing, prefer CBZ over CBR; there's no quality benefit to CBR.",
        },
        {
          type: "h2",
          text: "EPUB — for e-reader libraries",
        },
        {
          type: "p",
          text: "EPUB is the native ebook format for Kobo, and it works on Kindle too. For comics you want fixed-layout EPUB, where each page is a full image at a set size, rather than reflowable text. This is the format that slots cleanly into a device's library with a cover and proper page turns. Choose EPUB when you want the comic to live alongside your books rather than in a separate app.",
        },
        {
          type: "h2",
          text: "PDF — the universal fallback",
        },
        {
          type: "p",
          text: "Everything opens a PDF. It's the safest choice if you're not sure what your device supports, or if you're reading on a phone or tablet. The downside is that PDFs have fixed page dimensions, so a PDF sized for a big screen can look small on a little one — which is exactly why converting with the right device profile matters. A PDF built for your specific screen is excellent; a generic one is mediocre.",
        },
        {
          type: "h2",
          text: "A folder of images",
        },
        {
          type: "p",
          text: "Sometimes you just want the numbered JPGs or PNGs — to re-order pages by hand, feed them into another tool, or archive them. TomoRead can output a ZIP of numbered images for exactly this.",
        },
        {
          type: "h2",
          text: "Quick recommendations",
        },
        {
          type: "ul",
          items: [
            "Kindle: EPUB (fixed-layout) or PDF.",
            "Kobo: EPUB (fixed-layout).",
            "Boox and other Android e-ink: CBZ in a comic app, or EPUB/PDF in the library.",
            "A comic reading app on any device: CBZ.",
            "Phone or tablet, no special app: PDF.",
          ],
        },
        {
          type: "tip",
          text: "Format only decides the container. Readability on a small screen comes from how the pages inside are sized and split — that's the job of Smart conversion, whichever format you pick.",
        },
      ],
    },
    es: {
      title: "CBZ, CBR, EPUB o PDF: qué formato de cómic para tu lector",
      description:
        "Comparación en lenguaje claro de los formatos de cómic y manga más comunes — CBZ, CBR, EPUB, PDF e imágenes — y cuál usar en Kindle, Kobo, Boox y apps de lectura.",
      minutes: 5,
      updated: "2026-07-22",
      body: [
        {
          type: "p",
          text: "Los archivos de cómic vienen en una sopa de letras de formatos, y las diferencias importan más en un lector electrónico que en un ordenador. Esto es lo que es cada uno y cuándo usarlo.",
        },
        {
          type: "h2",
          text: "CBZ — el archivo de cómic",
        },
        {
          type: "p",
          text: "Un CBZ es simplemente un archivo ZIP lleno de imágenes, renombrado con la extensión .cbz. Las páginas se ordenan por el nombre del archivo. Es el estándar de facto del cómic digital porque es abierto, sin pérdida y facilísimo de leer para las apps. Si usas un lector de cómics dedicado (como Panels, Chunky o KOReader), el CBZ suele ser la mejor opción.",
        },
        {
          type: "h2",
          text: "CBR — la misma idea, otra cremallera",
        },
        {
          type: "p",
          text: "Un CBR es el mismo concepto pero sobre un archivo RAR en vez de ZIP. Se lee igual, pero RAR es un formato propietario, así que algunas herramientas y servidores no pueden abrirlo. Muchos archivos que terminan en .cbr son en realidad ZIP renombrados — TomoRead detecta el formato real inspeccionando el archivo, no solo su extensión, así que un archivo mal etiquetado se convierte igual. Si puedes elegir, prefiere CBZ antes que CBR; el CBR no aporta ninguna ventaja de calidad.",
        },
        {
          type: "h2",
          text: "EPUB — para la biblioteca del lector",
        },
        {
          type: "p",
          text: "EPUB es el formato de libro nativo de Kobo, y también funciona en Kindle. Para cómics quieres EPUB de diseño fijo, donde cada página es una imagen completa a un tamaño definido, en lugar de texto reajustable. Es el formato que encaja limpiamente en la biblioteca del dispositivo, con portada y paso de página correcto. Elige EPUB cuando quieras que el cómic conviva con tus libros en vez de en una app aparte.",
        },
        {
          type: "h2",
          text: "PDF — el comodín universal",
        },
        {
          type: "p",
          text: "Todo abre un PDF. Es la opción más segura si no sabes qué admite tu dispositivo, o si lees en móvil o tableta. La pega es que los PDF tienen dimensiones de página fijas, así que un PDF pensado para una pantalla grande se ve pequeño en una chica — justo por eso importa convertir con el perfil de dispositivo correcto. Un PDF hecho para tu pantalla concreta es excelente; uno genérico es mediocre.",
        },
        {
          type: "h2",
          text: "Una carpeta de imágenes",
        },
        {
          type: "p",
          text: "A veces solo quieres los JPG o PNG numerados — para reordenar páginas a mano, meterlos en otra herramienta o archivarlos. TomoRead puede generar un ZIP de imágenes numeradas para exactamente esto.",
        },
        {
          type: "h2",
          text: "Recomendaciones rápidas",
        },
        {
          type: "ul",
          items: [
            "Kindle: EPUB (diseño fijo) o PDF.",
            "Kobo: EPUB (diseño fijo).",
            "Boox y otros e-ink Android: CBZ en una app de cómics, o EPUB/PDF en la biblioteca.",
            "Una app de lectura de cómics en cualquier dispositivo: CBZ.",
            "Móvil o tableta, sin app especial: PDF.",
          ],
        },
        {
          type: "tip",
          text: "El formato solo decide el contenedor. La legibilidad en una pantalla pequeña viene de cómo se dimensionan y dividen las páginas de dentro — ese es el trabajo de la conversión inteligente, elijas el formato que elijas.",
        },
      ],
    },
  },
  {
    slug: "best-settings-for-eink",
    en: {
      title: "The best settings to convert comics for e-ink readers",
      description:
        "How to choose resolution, grayscale, panel splitting and margins when converting comics and manga for Kindle, Kobo, Boox, PocketBook and other e-ink devices.",
      minutes: 5,
      updated: "2026-07-22",
      body: [
        {
          type: "p",
          text: "E-ink readers have their own rules. What looks great on a phone can look muddy on e-paper, and settings that seem minor make a visible difference. Here's how to get the most out of a conversion for an e-ink device.",
        },
        {
          type: "h2",
          text: "Match the resolution to the screen",
        },
        {
          type: "p",
          text: "Every e-reader has a fixed panel resolution — a Kindle Paperwhite is 1236×1648, a Kobo Clara is 1264×1680, a large Boox can be 1404×1872. There is no benefit to feeding it images larger than its screen: the device just downscales them, and your file is needlessly huge. There's no benefit to smaller images either — they look soft. The sweet spot is to render each page at the device's native resolution. Picking the matching device profile in TomoRead does this for you.",
        },
        {
          type: "h2",
          text: "Convert to grayscale",
        },
        {
          type: "p",
          text: "Standard e-ink is grayscale. Colour data in the file does nothing on screen except inflate the size and, occasionally, muddy the contrast. Converting to grayscale with a light auto-contrast pass gives cleaner blacks and crisper screentone. If you have one of the newer colour e-ink devices, this is the exception — keep colour there.",
        },
        {
          type: "h2",
          text: "Panel splitting: on for manga, optional for prose-heavy pages",
        },
        {
          type: "p",
          text: "Splitting pages into panels is the biggest readability win on small screens, and you'll want it on for almost all manga and comics. The exception is pages that are mostly a single splash image or heavy narration — those read fine whole, and a good converter will leave them alone rather than force a split.",
        },
        {
          type: "h2",
          text: "Trim the margins",
        },
        {
          type: "p",
          text: "Scanned pages often carry wide white (or black) borders. Trimming them before fitting the page to the screen means the actual artwork gets more of your limited pixels. It's a small setting with an outsized effect on perceived sharpness.",
        },
        {
          type: "h2",
          text: "Double-page spreads",
        },
        {
          type: "p",
          text: "A two-page spread scanned as one wide image is unreadable on a small portrait screen. Splitting it into two pages — in the correct reading order — fixes that. But a spread where the artwork flows across the fold (a single big illustration) should stay whole. The right behaviour is to split spreads with a clear central gutter and keep the panoramic ones intact.",
        },
        {
          type: "h2",
          text: "Quality vs file size",
        },
        {
          type: "p",
          text: "For e-ink, a JPEG quality around 82–88 is visually indistinguishable from maximum and produces far smaller files, which matters when you're sending dozens of chapters over Wi-Fi. If you're archiving rather than reading, you can push quality higher or keep PNG.",
        },
        {
          type: "tip",
          text: "If you're unsure, start with the Smart conversion defaults for your device profile. They already encode all of the above. Only reach for Advanced options when you want to override something specific — like reading direction for manga.",
        },
      ],
    },
    es: {
      title: "Los mejores ajustes para convertir cómics a lectores de tinta electrónica",
      description:
        "Cómo elegir resolución, escala de grises, división de viñetas y márgenes al convertir cómics y manga para Kindle, Kobo, Boox, PocketBook y otros dispositivos e-ink.",
      minutes: 5,
      updated: "2026-07-22",
      body: [
        {
          type: "p",
          text: "Los lectores de tinta electrónica tienen sus propias reglas. Lo que se ve genial en un móvil puede verse turbio en e-paper, y ajustes que parecen menores marcan una diferencia visible. Así sacas el máximo partido a una conversión para un dispositivo e-ink.",
        },
        {
          type: "h2",
          text: "Ajusta la resolución a la pantalla",
        },
        {
          type: "p",
          text: "Cada lector tiene una resolución de panel fija — un Kindle Paperwhite es 1236×1648, un Kobo Clara 1264×1680, un Boox grande puede ser 1404×1872. No hay ninguna ventaja en darle imágenes más grandes que su pantalla: el dispositivo las reduce y tu archivo pesa de más. Tampoco la hay en imágenes más pequeñas — se ven borrosas. El punto ideal es generar cada página a la resolución nativa del aparato. Elegir el perfil de dispositivo correspondiente en TomoRead lo hace por ti.",
        },
        {
          type: "h2",
          text: "Convierte a escala de grises",
        },
        {
          type: "p",
          text: "La tinta electrónica estándar es en escala de grises. Los datos de color del archivo no hacen nada en pantalla salvo inflar el tamaño y, a veces, ensuciar el contraste. Convertir a escala de grises con un ligero autocontraste da negros más limpios y trama más nítida. Si tienes uno de los nuevos dispositivos e-ink en color, esa es la excepción — mantén el color ahí.",
        },
        {
          type: "h2",
          text: "División de viñetas: activada para manga, opcional en páginas con mucho texto",
        },
        {
          type: "p",
          text: "Dividir las páginas en viñetas es la mayor mejora de legibilidad en pantallas pequeñas, y querrás tenerla activada para casi todo el manga y los cómics. La excepción son las páginas que son sobre todo una ilustración a toda página o mucha narración — esas se leen bien enteras, y un buen conversor las dejará en paz en lugar de forzar un corte.",
        },
        {
          type: "h2",
          text: "Recorta los márgenes",
        },
        {
          type: "p",
          text: "Las páginas escaneadas suelen llevar bordes blancos (o negros) anchos. Recortarlos antes de ajustar la página a la pantalla hace que el dibujo real reciba más de tus píxeles limitados. Es un ajuste pequeño con un efecto enorme en la nitidez percibida.",
        },
        {
          type: "h2",
          text: "Páginas dobles",
        },
        {
          type: "p",
          text: "Una página doble escaneada como una sola imagen ancha es ilegible en una pantalla vertical pequeña. Dividirla en dos páginas — en el orden de lectura correcto — lo soluciona. Pero una doble donde el dibujo cruza el pliegue (una sola gran ilustración) debe quedar entera. Lo correcto es dividir las dobles con una calle central clara y mantener enteras las panorámicas.",
        },
        {
          type: "h2",
          text: "Calidad frente a tamaño",
        },
        {
          type: "p",
          text: "Para tinta electrónica, una calidad JPEG en torno a 82–88 es visualmente indistinguible del máximo y produce archivos mucho más pequeños, algo que importa cuando envías decenas de capítulos por Wi-Fi. Si archivas en vez de leer, puedes subir la calidad o conservar PNG.",
        },
        {
          type: "tip",
          text: "Si dudas, empieza con los valores por defecto de la conversión inteligente para el perfil de tu dispositivo. Ya incorporan todo lo anterior. Recurre a Opciones avanzadas solo cuando quieras cambiar algo concreto — como el sentido de lectura del manga.",
        },
      ],
    },
  },
  {
    slug: "send-comics-to-kindle-kobo-boox",
    en: {
      title: "How to get comics onto your Kindle, Kobo or Boox",
      description:
        "Step-by-step ways to transfer converted comics and manga to a Kindle, Kobo or Boox e-reader — by email, cable, app or SD card.",
      minutes: 5,
      updated: "2026-07-22",
      body: [
        {
          type: "p",
          text: "You've converted a comic to the right format for your device. Now you need it on the device. Each e-reader ecosystem has its own easiest path — here are the reliable ones.",
        },
        {
          type: "h2",
          text: "Kindle: Send to Kindle",
        },
        {
          type: "p",
          text: "Amazon's Send to Kindle is the smoothest option. Use any of three routes: email the file to your personal @kindle.com address, drop it on the Send to Kindle web page, or use the Send to Kindle desktop app for Windows or Mac. It accepts PDF and EPUB. Within a minute or two the comic syncs to your Kindle over Wi-Fi and appears in your library with a cover.",
        },
        {
          type: "tip",
          text: "Find your Send to Kindle email address and approve your sender address in your Amazon account under “Preferences → Personal Document Settings”. Files from unapproved senders are silently dropped.",
        },
        {
          type: "h2",
          text: "Kindle: USB cable",
        },
        {
          type: "p",
          text: "If you prefer not to use email, connect the Kindle by USB, and it appears as a drive. Copy your PDF or EPUB into the “documents” folder, eject, and it shows up in your library. This also avoids any file-size limits on the email route.",
        },
        {
          type: "h2",
          text: "Kobo: USB or the SD card",
        },
        {
          type: "p",
          text: "Kobo readers mount as a plain USB drive. Copy your fixed-layout EPUB anywhere onto the device, eject safely, and the Kobo will index it into your library. Older Kobo models with a microSD slot can read files from the card too, which is handy for large collections.",
        },
        {
          type: "h2",
          text: "Boox and other Android e-ink readers",
        },
        {
          type: "p",
          text: "Boox devices run Android, so you have the most flexibility. Copy files over USB or via a cloud app, then open them in a comic reader such as a CBZ-friendly app, or in the built-in Neo Reader for PDF and EPUB. Because these screens are often larger, they handle whole pages better than a small Kindle — but panel splitting still helps on the compact models.",
        },
        {
          type: "h2",
          text: "PocketBook and the rest",
        },
        {
          type: "p",
          text: "Most other e-readers (PocketBook, Onyx, Tolino and so on) mount as USB drives and read PDF, EPUB and often CBZ directly. Copy the file across, and open it from the library. When in doubt, PDF built for your screen size is the most compatible.",
        },
        {
          type: "h2",
          text: "A note on file size",
        },
        {
          type: "p",
          text: "A full volume of manga split panel-by-panel can run to hundreds of pages. If you're emailing it and hit a size limit, convert a chapter at a time, or use the USB route which has no such cap. Converting to grayscale at the device's resolution already keeps files as small as they can reasonably be.",
        },
      ],
    },
    es: {
      title: "Cómo pasar cómics a tu Kindle, Kobo o Boox",
      description:
        "Formas paso a paso de transferir cómics y manga convertidos a un lector Kindle, Kobo o Boox — por correo, cable, app o tarjeta SD.",
      minutes: 5,
      updated: "2026-07-22",
      body: [
        {
          type: "p",
          text: "Ya has convertido un cómic al formato correcto para tu dispositivo. Ahora hay que meterlo en el aparato. Cada ecosistema de lector tiene su camino más fácil — estos son los fiables.",
        },
        {
          type: "h2",
          text: "Kindle: Send to Kindle",
        },
        {
          type: "p",
          text: "El Send to Kindle de Amazon es la opción más cómoda. Usa cualquiera de tres vías: envía el archivo por correo a tu dirección personal @kindle.com, súbelo en la página web de Send to Kindle, o usa la app de escritorio de Send to Kindle para Windows o Mac. Acepta PDF y EPUB. En un par de minutos el cómic se sincroniza con tu Kindle por Wi-Fi y aparece en tu biblioteca con portada.",
        },
        {
          type: "tip",
          text: "Encuentra tu dirección de correo de Send to Kindle y aprueba tu dirección remitente en tu cuenta de Amazon, en «Preferencias → Configuración de documentos personales». Los archivos de remitentes no aprobados se descartan sin avisar.",
        },
        {
          type: "h2",
          text: "Kindle: cable USB",
        },
        {
          type: "p",
          text: "Si prefieres no usar el correo, conecta el Kindle por USB y aparecerá como una unidad. Copia tu PDF o EPUB en la carpeta «documents», expúlsalo y aparecerá en tu biblioteca. Esto además evita cualquier límite de tamaño de la vía del correo.",
        },
        {
          type: "h2",
          text: "Kobo: USB o tarjeta SD",
        },
        {
          type: "p",
          text: "Los lectores Kobo se montan como una unidad USB normal. Copia tu EPUB de diseño fijo en cualquier parte del dispositivo, expúlsalo con seguridad y el Kobo lo indexará en tu biblioteca. Los modelos Kobo antiguos con ranura microSD también leen archivos desde la tarjeta, práctico para colecciones grandes.",
        },
        {
          type: "h2",
          text: "Boox y otros lectores e-ink con Android",
        },
        {
          type: "p",
          text: "Los dispositivos Boox corren Android, así que tienes la máxima flexibilidad. Copia archivos por USB o mediante una app en la nube, y ábrelos en un lector de cómics compatible con CBZ, o en el Neo Reader integrado para PDF y EPUB. Como estas pantallas suelen ser más grandes, manejan mejor las páginas enteras que un Kindle pequeño — pero la división de viñetas sigue ayudando en los modelos compactos.",
        },
        {
          type: "h2",
          text: "PocketBook y el resto",
        },
        {
          type: "p",
          text: "La mayoría de los demás lectores (PocketBook, Onyx, Tolino, etc.) se montan como unidades USB y leen PDF, EPUB y a menudo CBZ directamente. Copia el archivo y ábrelo desde la biblioteca. En caso de duda, un PDF hecho para el tamaño de tu pantalla es lo más compatible.",
        },
        {
          type: "h2",
          text: "Una nota sobre el tamaño",
        },
        {
          type: "p",
          text: "Un tomo completo de manga dividido viñeta a viñeta puede llegar a cientos de páginas. Si lo envías por correo y topas con un límite de tamaño, convierte un capítulo cada vez, o usa la vía USB que no tiene ese tope. Convertir a escala de grises a la resolución del dispositivo ya mantiene los archivos tan pequeños como es razonable.",
        },
      ],
    },
  },
];

export function getArticle(slug: string): Article | undefined {
  return ARTICLES.find((a) => a.slug === slug);
}

export function articleContent(a: Article, locale: Locale): ArticleContent {
  return locale === "es" ? a.es : a.en;
}
