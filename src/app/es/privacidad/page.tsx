import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacidad",
  description:
    "Política de privacidad de PanelFlow: los archivos se convierten en memoria, nunca se guardan, y no existen cuentas ni bases de datos.",
  alternates: {
    canonical: "/es/privacidad",
    languages: { en: "/privacy", es: "/es/privacidad" },
  },
};

export default function PrivacidadPage() {
  return (
    <article className="mx-auto max-w-3xl px-4 py-12">
      <h1 className="font-display text-3xl sm:text-4xl">Privacidad</h1>
      <p className="mt-3 text-ink-soft">
        La versión corta: tus archivos nunca se guardan, y no sabemos quién
        eres.
      </p>

      <div className="mt-8 space-y-8 text-sm sm:text-base leading-relaxed">
        <section className="panel p-5">
          <h2 className="font-display text-xl">Tus archivos</h2>
          <ul className="mt-3 list-disc pl-5 space-y-2">
            <li>
              Los archivos subidos se procesan{" "}
              <strong>íntegramente en memoria</strong> en una función sin
              estado.
            </li>
            <li>
              El archivo convertido se envía directo a tu navegador. Cuando la
              petición termina — o si falla — todo rastro del original y del
              resultado se descarta automáticamente.
            </li>
            <li>
              Nunca leemos, indexamos, registramos ni analizamos el contenido
              de tus documentos.
            </li>
            <li>
              No hay carpeta de subidas ni almacenamiento temporal que
              sobreviva a la petición, y no tenemos forma de recuperar un
              archivo después de la conversión.
            </li>
          </ul>
        </section>

        <section className="panel p-5">
          <h2 className="font-display text-xl">Tu identidad</h2>
          <ul className="mt-3 list-disc pl-5 space-y-2">
            <li>Sin cuentas, sin registro, sin inicio de sesión.</li>
            <li>
              Sin base de datos de ningún tipo — no guardamos historial de
              conversiones, ni metadatos, ni registros de usuarios.
            </li>
            <li>
              Nuestro proveedor de alojamiento puede conservar brevemente
              registros técnicos anónimos (códigos de estado, tiempos) por
              salud operativa; nunca incluyen el contenido de los archivos.
            </li>
          </ul>
        </section>

        <section className="panel p-5">
          <h2 className="font-display text-xl">Publicidad</h2>
          <p className="mt-3">
            PanelFlow se financia con Google AdSense, limitado a dos banners
            discretos. Google puede usar cookies para servir anuncios;
            consulta las{" "}
            <a
              className="underline text-accent"
              href="https://policies.google.com/technologies/ads?hl=es"
              rel="noopener noreferrer"
              target="_blank"
            >
              políticas de publicidad de Google
            </a>{" "}
            para más detalles y opciones de exclusión. Nunca mostramos
            ventanas emergentes, intersticiales ni vídeo con reproducción
            automática.
          </p>
        </section>

        <section className="panel p-5">
          <h2 className="font-display text-xl">
            Tu contenido, tus derechos
          </h2>
          <p className="mt-3">
            Convierte solo archivos que te pertenezcan o que tengas derecho a
            usar. PanelFlow es una herramienta de formato, como una
            fotocopiadora: lo que introduces es responsabilidad tuya, y lo que
            sale te pertenece.
          </p>
        </section>
      </div>
    </article>
  );
}
