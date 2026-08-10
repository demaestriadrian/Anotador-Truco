/**
 * Genera los iconos PNG de la PWA a partir de una unica fuente.
 *
 * Uso:  pnpm icons
 *
 * Fuente (en orden de prioridad):
 *   1. assets/icon-source.png  -> el icono definitivo, cuando este disponible.
 *      Se asume arte "full-bleed" (ocupa todo el cuadrado), asi que la variante
 *      maskable se genera achicando el arte al 80% y rellenando con el verde del
 *      paño, para respetar la zona segura de los iconos adaptativos de Android.
 *   2. public/icons/icon.svg   -> el provisorio del repo. Ya trae el arte dentro
 *      de la zona segura, por eso NO se le agrega padding extra.
 *
 * Los PNG resultantes se commitean al repo: el build de produccion (y el de
 * Cloudflare Pages) no ejecuta este script, asi que `sharp` nunca corre en CI.
 */

import { existsSync } from 'node:fs'
import { mkdir, stat } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import sharp from 'sharp'

const RAIZ = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const FUENTE_DEFINITIVA = path.join(RAIZ, 'assets', 'icon-source.png')
const FUENTE_PROVISORIA = path.join(RAIZ, 'public', 'icons', 'icon.svg')
const DIR_SALIDA = path.join(RAIZ, 'public', 'icons')

/** Verde del paño: mismo valor que `html` en src/ui/styles/index.css */
const VERDE_PAÑO = '#106138'
/** Proporcion del lado que ocupa el arte dentro de un icono maskable */
const ZONA_SEGURA = 0.8
/** Lado del render intermedio: se rasteriza grande una sola vez y de ahi se reduce */
const LADO_MASTER = 1024

const TRANSPARENTE = { r: 0, g: 0, b: 0, alpha: 0 }

const usaFuenteDefinitiva = existsSync(FUENTE_DEFINITIVA)
const fuente = usaFuenteDefinitiva ? FUENTE_DEFINITIVA : FUENTE_PROVISORIA

/**
 * Render maestro a 1024x1024. Para el SVG se sube la densidad para que librsvg
 * rasterice a ese tamaño en vez de escalar un bitmap chico (que saldria borroso).
 */
async function renderMaestro () {
  return sharp(fuente, { density: 144 })
    .resize(LADO_MASTER, LADO_MASTER, { fit: 'contain', background: TRANSPARENTE })
    .png()
    .toBuffer()
}

/** Icono comun (`purpose: "any"`): el arte escalado tal cual. */
async function generarSimple (maestro, lado, archivo) {
  await sharp(maestro)
    .resize(lado, lado, { fit: 'contain', background: TRANSPARENTE })
    .png()
    .toFile(path.join(DIR_SALIDA, archivo))
}

/**
 * Icono maskable: sin transparencia y con el arte dentro de la zona segura.
 *
 * El arte SIEMPRE se achica al 80% y se rellena alrededor. Android recorta los
 * iconos adaptativos con mascaras arbitrarias (circulo, squircle, gota) y solo
 * garantiza que sobreviva el circulo central del 80%: un arte full-bleed pierde
 * las esquinas. Se asume fuente full-bleed porque es lo normal en un icono de
 * app; si algun dia el arte ya viniera con su propio margen, bajar ZONA_SEGURA
 * en vez de tocar esta funcion.
 *
 * El relleno usa `extendWith: 'copy'` (replica los pixeles del borde) en vez de
 * un color plano: el fondo del arte es un degradado, asi que un relleno liso
 * dibujaria un marco visible alrededor del dibujo.
 */
async function generarMaskable (maestro, lado, archivo) {
  const ladoArte = Math.round(lado * ZONA_SEGURA)
  const margen = Math.round((lado - ladoArte) / 2)

  const arte = await sharp(maestro)
    .resize(ladoArte, ladoArte, { fit: 'contain', background: TRANSPARENTE })
    .flatten({ background: VERDE_PAÑO })
    .png()
    .toBuffer()

  await sharp(arte)
    .extend({ top: margen, bottom: lado - ladoArte - margen, left: margen, right: lado - ladoArte - margen, extendWith: 'copy' })
    .png()
    .toFile(path.join(DIR_SALIDA, archivo))
}

/** apple-touch-icon: iOS no soporta canal alfa, hay que aplanar el fondo. */
async function generarApple (maestro, lado, archivo) {
  await sharp(maestro)
    .resize(lado, lado, { fit: 'contain', background: TRANSPARENTE })
    .flatten({ background: VERDE_PAÑO })
    .png()
    .toFile(path.join(DIR_SALIDA, archivo))
}

async function main () {
  await mkdir(DIR_SALIDA, { recursive: true })

  const maestro = await renderMaestro()

  await generarSimple(maestro, 192, 'pwa-192.png')
  await generarSimple(maestro, 512, 'pwa-512.png')
  await generarMaskable(maestro, 512, 'maskable-512.png')
  await generarApple(maestro, 180, 'apple-touch-icon.png')
  await generarSimple(maestro, 32, 'favicon-32.png')
  await generarSimple(maestro, 16, 'favicon-16.png')

  console.log(`Iconos generados desde ${path.relative(RAIZ, fuente)}`)
  for (const archivo of ['pwa-192.png', 'pwa-512.png', 'maskable-512.png', 'apple-touch-icon.png', 'favicon-32.png', 'favicon-16.png']) {
    const ruta = path.join(DIR_SALIDA, archivo)
    const { width, height } = await sharp(ruta).metadata()
    const { size } = await stat(ruta)
    console.log(`  public/icons/${archivo.padEnd(21)} ${String(width).padStart(4)}x${String(height).padEnd(4)} ${(size / 1024).toFixed(1)} KB`)
  }
}

main().catch((error) => {
  console.error(error)
  process.exit(1)
})
