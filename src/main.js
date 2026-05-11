import './styles/main.css'
import allFilters, { categories } from './data/filters.js'
import { createSampleImage, applyFilter } from './engine/filterEngine.js'
import { initUploader } from './ui/uploader.js'
import { initFilterPanel } from './ui/filterPanel.js'
import { initPreview } from './ui/preview.js'
import { initExport } from './ui/export.js'

const state = {
  image: null,
  currentFilter: null,
}

const preview = initPreview({
  getImage: () => state.image,
})

const exportMod = initExport({
  getImage: () => state.image,
  getFilter: () => state.currentFilter,
  getIntensity: () => document.getElementById('intensity-slider').value / 100,
})

const filterPanel = initFilterPanel({
  filters: allFilters,
  getImage: () => state.image,
  onFilterSelect: (filter) => {
    state.currentFilter = filter
    preview.setFilter(filter)
    exportMod.enable()
  },
})

function loadSampleImage() {
  const sampleImage = createSampleImage(600, 800)
  const sampleImg = new Image()
  sampleImg.src = sampleImage.toDataURL()
  sampleImg.onload = () => {
    state.image = sampleImg
    preview.show()
    preview.drawOriginal()

    const defaultFilter = allFilters.find(f => f.category === 'korean') || allFilters[0]
    state.currentFilter = defaultFilter
    preview.setFilter(defaultFilter)
    filterPanel.selectById(defaultFilter.id)
    filterPanel.render()
    setTimeout(() => filterPanel.refreshAllThumbnails(sampleImg), 100)
    exportMod.enable()
  }
}

loadSampleImage()

initUploader({
  onImageLoaded: (img) => {
    state.image = img
    preview.show()
    preview.drawOriginal()
    preview.setFilter(state.currentFilter || allFilters[0])
    filterPanel.render()
    requestAnimationFrame(() => {
      requestAnimationFrame(() => filterPanel.refreshAllThumbnails(img))
    })
    exportMod.enable()
  },
})

const btnShare = document.getElementById('btn-share')
btnShare.onclick = async () => {
  if (!state.image || !state.currentFilter) {
    showToast('请先选择一个滤镜效果')
    return
  }
  try {
    const exportCanvas = document.createElement('canvas')
    const intensity = document.getElementById('intensity-slider').value / 100
    applyFilter(exportCanvas, state.image, state.currentFilter, intensity)
    const blob = await new Promise(r => exportCanvas.toBlob(r, 'image/png'))
    if (blob) {
      await navigator.clipboard.write([
        new ClipboardItem({ 'image/png': blob })
      ])
      showToast('📋 已复制到剪贴板！去小红书/朋友圈粘贴分享吧~')
    }
  } catch {
    showToast('💡 请使用导出功能下载后分享')
  }
}

document.addEventListener('keydown', (e) => {
  if (e.target.matches('input, textarea')) return
  if (e.key === 'ArrowLeft' || e.key === 'ArrowRight') {
    const visible = filterPanel.getVisible()
    if (!visible.length) return
    const idx = visible.findIndex(f => f.id === state.currentFilter?.id)
    const next = e.key === 'ArrowLeft'
      ? (idx <= 0 ? visible.length - 1 : idx - 1)
      : (idx >= visible.length - 1 ? 0 : idx + 1)
    const f = visible[next]
    if (f) {
      state.currentFilter = f
      preview.setFilter(f)
      filterPanel.selectById(f.id)
    }
  }
})

function showToast(msg) {
  const t = document.getElementById('toast')
  t.textContent = msg; t.classList.add('show')
  setTimeout(() => t.classList.remove('show'), 2500)
}

console.log(`✨ 滤镜工坊已就绪 · ${allFilters.length} 个滤镜 · ${categories.length} 个分类`)
console.log('🖱 点击分类标签浏览 | ⌨ ←→ 切换滤镜 | 空格 切换视图 | 双击 收藏')