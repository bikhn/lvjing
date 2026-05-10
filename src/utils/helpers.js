export function debounce(fn, delay = 100) {
  let timer
  return function (...args) {
    clearTimeout(timer)
    timer = setTimeout(() => fn.apply(this, args), delay)
  }
}

export function throttle(fn, limit = 16) {
  let lastCall = 0
  return function (...args) {
    const now = performance.now()
    if (now - lastCall >= limit) {
      lastCall = now
      fn.apply(this, args)
    }
  }
}

export function loadImage(file) {
  return new Promise((resolve, reject) => {
    if (!file.type.match(/^image\/(jpeg|png|webp)$/)) {
      reject(new Error('不支持的图片格式，请使用 JPG/PNG/WebP'))
      return
    }
    if (file.size > 20 * 1024 * 1024) {
      reject(new Error('图片过大，请选择 20MB 以下的文件'))
      return
    }
    const reader = new FileReader()
    reader.onload = (e) => {
      const img = new Image()
      img.onload = () => resolve(img)
      img.onerror = () => reject(new Error('图片加载失败'))
      img.src = e.target.result
    }
    reader.onerror = () => reject(new Error('文件读取失败'))
    reader.readAsDataURL(file)
  })
}

export function clamp(val, min, max) {
  return Math.max(min, Math.min(max, val))
}

export function generateFilename(prefix = 'filter') {
  const now = new Date()
  const ts = `${now.getFullYear()}${String(now.getMonth()+1).padStart(2,'0')}${String(now.getDate()).padStart(2,'0')}_${String(now.getHours()).padStart(2,'0')}${String(now.getMinutes()).padStart(2,'0')}${String(now.getSeconds()).padStart(2,'0')}`
  return `${prefix}_${ts}`
}

export function limitImageSize(img, maxSize = 4000) {
  let { width, height } = img
  if (Math.max(width, height) > maxSize) {
    const ratio = maxSize / Math.max(width, height)
    width = Math.round(width * ratio)
    height = Math.round(height * ratio)
  }
  return { width, height }
}