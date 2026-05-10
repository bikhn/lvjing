function cssFilterString(css) {
  const parts = []
  if (css.brightness !== 1) parts.push(`brightness(${css.brightness})`)
  if (css.contrast !== 1) parts.push(`contrast(${css.contrast})`)
  if (css.saturation !== 1) parts.push(`saturate(${css.saturation})`)
  if (css.sepia) parts.push(`sepia(${css.sepia})`)
  if (css.hueRotate) parts.push(`hue-rotate(${css.hueRotate}deg)`)
  if (css.blur) parts.push(`blur(${css.blur}px)`)
  return parts.join(' ')
}

function applyVignette(ctx, w, h, vignette) {
  if (!vignette || !vignette.intensity) return
  const { intensity, feather = 0.5 } = vignette
  const cx = w / 2, cy = h / 2
  const maxDist = Math.sqrt(cx * cx + cy * cy)
  const innerRadius = maxDist * (1 - feather)
  const fadeWidth = maxDist * feather

  const imageData = ctx.getImageData(0, 0, w, h)
  const data = imageData.data
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const dx = x - cx, dy = y - cy
      const dist = Math.sqrt(dx * dx + dy * dy)
      let factor = 1
      if (dist > innerRadius) {
        factor = fadeWidth > 0
          ? 1 - ((dist - innerRadius) / fadeWidth) * intensity
          : 1 - intensity
        factor = Math.max(1 - intensity, Math.min(1, factor))
      }
      if (factor < 1) {
        const i = (y * w + x) * 4
        data[i] = Math.round(data[i] * factor)
        data[i + 1] = Math.round(data[i + 1] * factor)
        data[i + 2] = Math.round(data[i + 2] * factor)
      }
    }
  }
  ctx.putImageData(imageData, 0, 0)
}

function applyOverlay(ctx, w, h, overlay) {
  if (!overlay) return
  if (overlay.type === 'color' && overlay.color) {
    ctx.fillStyle = overlay.color
    ctx.fillRect(0, 0, w, h)
  }
  if (overlay.type === 'grain' || overlay.grainIntensity > 0) {
    const imageData = ctx.getImageData(0, 0, w, h)
    const data = imageData.data
    const intensity = overlay.grainIntensity || 0.05
    for (let i = 0; i < data.length; i += 4) {
      const noise = (Math.random() * 2 - 1) * intensity * 255
      data[i] = Math.min(255, Math.max(0, data[i] + noise))
      data[i + 1] = Math.min(255, Math.max(0, data[i + 1] + noise))
      data[i + 2] = Math.min(255, Math.max(0, data[i + 2] + noise))
    }
    ctx.putImageData(imageData, 0, 0)
  }
}

export function applyFilter(canvas, img, filter, intensity = 1.0) {
  const w = img.naturalWidth || img.width
  const h = img.naturalHeight || img.height
  canvas.width = w
  canvas.height = h
  const ctx = canvas.getContext('2d')
  ctx.clearRect(0, 0, w, h)

  if (intensity <= 0.01) {
    ctx.drawImage(img, 0, 0, w, h)
    return
  }

  const css = filter.css
  const adjustedCSS = {}
  const b = css.brightness, c = css.contrast, s = css.saturation, sp = css.sepia, hr = css.hueRotate

  adjustedCSS.brightness = +(1 + (b - 1) * intensity).toFixed(3)
  adjustedCSS.contrast = +(1 + (c - 1) * intensity).toFixed(3)
  adjustedCSS.saturation = +(1 + (s - 1) * intensity).toFixed(3)
  adjustedCSS.sepia = +(sp * intensity).toFixed(3)
  adjustedCSS.hueRotate = Math.round(hr * intensity)
  adjustedCSS.blur = 0

  ctx.filter = cssFilterString(adjustedCSS) || 'none'
  ctx.drawImage(img, 0, 0, w, h)
  ctx.filter = 'none'

  if (filter.vignette) {
    const sc = { ...filter.vignette, intensity: filter.vignette.intensity * intensity }
    if (sc.intensity > 0.005) applyVignette(ctx, w, h, sc)
  }
  if (filter.overlay) {
    applyOverlay(ctx, w, h, filter.overlay)
  }
}

export function applyFilterToOutput(canvas, img, filter) {
  applyFilter(canvas, img, filter, 1.0)
}

export function generateThumbnail(img, filter, w, h) {
  const canvas = document.createElement('canvas')
  canvas.width = w, canvas.height = h
  const ctx = canvas.getContext('2d')

  if (!filter || !filter.css) {
    ctx.drawImage(img, 0, 0, w, h)
    return canvas
  }

  const css = filter.css
  ctx.filter = cssFilterString({
    brightness: css.brightness, contrast: css.contrast,
    saturation: css.saturation, sepia: css.sepia,
    hueRotate: css.hueRotate, blur: 0
  }) || 'none'
  ctx.drawImage(img, 0, 0, w, h)
  ctx.filter = 'none'

  if (filter.vignette) applyVignette(ctx, w, h, filter.vignette)
  if (filter.overlay) applyOverlay(ctx, w, h, filter.overlay)

  return canvas
}

export function createSampleImage(w = 600, h = 800) {
  const c = document.createElement('canvas')
  c.width = w, c.height = h
  const ctx = c.getContext('2d')

  const sky = ctx.createLinearGradient(0,0,0,h*.45)
  sky.addColorStop(0,'#4a90d9'); sky.addColorStop(.4,'#87ceeb'); sky.addColorStop(1,'#e0f0ff')
  ctx.fillStyle=sky; ctx.fillRect(0,0,w,h*.45)

  ctx.fillStyle='#fff'; ctx.beginPath(); ctx.arc(w*.7,h*.12,42,0,Math.PI*2); ctx.fill()
  ctx.fillStyle='rgba(255,255,200,.35)'; ctx.beginPath(); ctx.arc(w*.7,h*.12,55,0,Math.PI*2); ctx.fill()

  const mtGrad=ctx.createLinearGradient(0,h*.42,0,h*.48)
  mtGrad.addColorStop(0,'#6b8e6b'); mtGrad.addColorStop(.5,'#4a7a4a'); mtGrad.addColorStop(1,'#3d603d')
  ctx.fillStyle=mtGrad; ctx.beginPath(); ctx.moveTo(0,h*.45)
  ctx.quadraticCurveTo(w*.25,h*.3,w*.5,h*.4)
  ctx.quadraticCurveTo(w*.75,h*.5,w,h*.35)
  ctx.lineTo(w,h*.48); ctx.lineTo(0,h*.48); ctx.fill()

  ctx.fillStyle='#8fbc8f'; ctx.beginPath(); ctx.moveTo(0,h*.45)
  ctx.quadraticCurveTo(w*.25,h*.33,w*.5,h*.41)
  ctx.quadraticCurveTo(w*.75,h*.48,w,h*.38)
  ctx.lineTo(w,h*.42); ctx.lineTo(0,h*.42); ctx.fill()

  const snow=ctx.createLinearGradient(0,h*.35,0,h*.42)
  snow.addColorStop(0,'#ffffff'); snow.addColorStop(.7,'#e8e8f0'); snow.addColorStop(1,'#c8c8d8')
  ctx.fillStyle=snow; ctx.beginPath(); ctx.moveTo(w*.35,h*.34)
  ctx.quadraticCurveTo(w*.4,h*.32,w*.45,h*.33)
  ctx.quadraticCurveTo(w*.5,h*.35,w*.55,h*.34)
  ctx.quadraticCurveTo(w*.6,h*.33,w*.65,h*.35)
  ctx.lineTo(w*.65,h*.37)
  ctx.quadraticCurveTo(w*.6,h*.36,w*.55,h*.37)
  ctx.quadraticCurveTo(w*.5,h*.38,w*.45,h*.36)
  ctx.quadraticCurveTo(w*.4,h*.35,w*.35,h*.37)
  ctx.fill()

  const fieldGrad=ctx.createLinearGradient(0,h*.48,0,h)
  fieldGrad.addColorStop(0,'#7ec87e'); fieldGrad.addColorStop(.3,'#5daa5d'); fieldGrad.addColorStop(.7,'#c8a05a'); fieldGrad.addColorStop(1,'#b8954a')
  ctx.fillStyle=fieldGrad; ctx.fillRect(0,h*.48,w,h*.52)

  ctx.fillStyle='#8fd48f'; ctx.beginPath(); ctx.moveTo(0,h*.48)
  ctx.quadraticCurveTo(w*.2,h*.46,w*.4,h*.5); ctx.quadraticCurveTo(w*.6,h*.45,w*.8,h*.49)
  ctx.quadraticCurveTo(w*.9,h*.47,w,h*.48); ctx.lineTo(w,h*.52); ctx.lineTo(0,h*.52); ctx.fill()

  ctx.strokeStyle='#2e5e2e'; ctx.lineWidth=14; ctx.beginPath(); ctx.moveTo(w*.05,h*.95); ctx.lineTo(w*.95,h*.95); ctx.stroke()

  ctx.fillStyle='#5a4030'
  ctx.fillRect(w*.25,h*.52,50,60)
  ctx.fillRect(w*.55,h*.55,55,55)
  ctx.fillStyle='#6b5040'; ctx.fillRect(w*.35,h*.6,55,50)
  ctx.fillStyle='#e8c880'; ctx.fillRect(w*.24,h*.5,52,10)
  ctx.fillStyle='#d4a860'; ctx.fillRect(w*.54,h*.53,57,10)
  ctx.fillStyle='#ddc070'; ctx.fillRect(w*.34,h*.58,57,10)

  ctx.fillStyle='#3a3a3a'; ctx.beginPath()
  ctx.moveTo(w*.35,h*.7);ctx.lineTo(w*.38,h*.66);ctx.lineTo(w*.41,h*.72)
  ctx.fill()
  ctx.fillStyle='#4a4a4a'; ctx.beginPath()
  ctx.moveTo(w*.6,h*.68);ctx.lineTo(w*.63,h*.64);ctx.lineTo(w*.66,h*.7)
  ctx.fill()

  ctx.fillStyle='#6b8e6b'; ctx.beginPath();ctx.arc(w*.15,h*.2,32,0,Math.PI*2);ctx.fill()
  ctx.fillStyle='#5a7a5a'; ctx.beginPath();ctx.arc(w*.15,h*.2,26,0,Math.PI*2);ctx.fill()
  ctx.fillStyle='#4a6a4a'; ctx.beginPath();ctx.arc(w*.15,h*.2,18,0,Math.PI*2);ctx.fill()

  ctx.fillStyle='#8fb88f'; ctx.beginPath();ctx.arc(w*.78,h*.22,28,0,Math.PI*2);ctx.fill()
  ctx.fillStyle='#7aaf7a'; ctx.beginPath();ctx.arc(w*.78,h*.22,22,0,Math.PI*2);ctx.fill()
  ctx.fillStyle='#6a9f6a'; ctx.beginPath();ctx.arc(w*.78,h*.22,15,0,Math.PI*2);ctx.fill()

  ctx.fillStyle='#5a4a30'; ctx.fillRect(0,h*.52,w,4)

  const frg=ctx.createRadialGradient(w*.2,h*.9,0,w*.2,h*.9,60)
  frg.addColorStop(0,'rgba(255,255,100,.5)'); frg.addColorStop(.5,'rgba(255,200,50,.2)'); frg.addColorStop(1,'rgba(255,150,0,0)')
  ctx.fillStyle=frg; ctx.fillRect(0,0,w,h)

  ctx.fillStyle='#fff'; ctx.font='bold 24px sans-serif'; ctx.textAlign='center'
  ctx.fillText('滤镜工坊',w/2,h*.85)
  ctx.font='12px sans-serif'; ctx.fillStyle='rgba(255,255,255,.7)'
  ctx.fillText('点击下方滤镜预览效果',w/2,h*.88)

  return c
}