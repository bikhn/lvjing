import { applyFilter } from '../engine/filterEngine.js'
import { categories } from '../data/filters.js'

export function initPreview({ getImage }) {
  const canvasOriginal = document.getElementById('canvas-original')
  const canvasPreview = document.getElementById('canvas-preview')
  const emptyState = document.getElementById('empty-state')
  const paneInfo = document.getElementById('pane-info')
  const intensitySlider = document.getElementById('intensity-slider')
  const intensityValue = document.getElementById('intensity-value')
  const btnCompare = document.getElementById('btn-compare')
  const btnReset = document.getElementById('btn-reset')
  const originalPane = document.getElementById('original-pane')

  let currentFilter = null
  let intensity = 1.0
  let sideBySide = true

  function show() {
    emptyState.classList.add('fade-out')
  }

  function drawOriginal() {
    const img = getImage()
    if (!img) return
    const w = img.naturalWidth || img.width
    const h = img.naturalHeight || img.height
    canvasOriginal.width = w
    canvasOriginal.height = h
    canvasOriginal.getContext('2d').drawImage(img, 0, 0, w, h)
  }

  function applyCurrent() {
    const img = getImage()
    if (!img) return
    const w = img.naturalWidth || img.width
    const h = img.naturalHeight || img.height

    if (!currentFilter || intensity <= 0.01) {
      canvasPreview.width = w
      canvasPreview.height = h
      canvasPreview.getContext('2d').drawImage(img, 0, 0, w, h)
      updateInfo(null)
      return
    }
    applyFilter(canvasPreview, img, currentFilter, intensity)
    updateInfo(currentFilter)
  }

  function updateInfo(filter) {
    if (filter) {
      const cat = categories.find(c => c.id === filter.category)
      paneInfo.textContent = (cat ? cat.emoji + ' ' + cat.name + ' · ' : '') + filter.name
    } else {
      paneInfo.textContent = '原图'
    }
  }

  function setFilter(filter) {
    currentFilter = filter
    applyCurrent()
  }

  function setIntensity(val) {
    intensity = val
    intensityValue.textContent = Math.round(val * 100) + '%'
    applyCurrent()
  }

  intensitySlider.oninput = () => setIntensity(intensitySlider.value / 100)

  function toggleView() {
    sideBySide = !sideBySide
    if (sideBySide) {
      originalPane.classList.remove('hidden-pane')
      btnCompare.classList.add('active')
      drawOriginal()
    } else {
      originalPane.classList.add('hidden-pane')
      btnCompare.classList.remove('active')
    }
  }

  btnCompare.onclick = toggleView

  btnReset.onclick = () => {
    currentFilter = null
    intensity = 1.0
    intensitySlider.value = 100
    intensityValue.textContent = '100%'
    applyCurrent()
    paneInfo.textContent = '—'
    document.querySelectorAll('.filter-card').forEach(c => c.classList.remove('selected'))
  }

  document.addEventListener('keydown', (e) => {
    if (e.code === 'Space' && !e.target.matches('input,textarea')) {
      e.preventDefault()
      toggleView()
    }
  })

  function refresh(newImg) {
    drawOriginal()
    applyCurrent()
  }

  return { show, setFilter, setIntensity, applyCurrent, refresh, drawOriginal }
}