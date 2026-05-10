import { applyFilterToOutput } from '../engine/filterEngine.js'
import { generateFilename } from '../utils/helpers.js'

export function initExport({ getImage, getFilter }) {
  const btnExport = document.getElementById('btn-export')
  const modal = document.getElementById('export-modal')
  const btnConfirm = document.getElementById('btn-confirm-export')
  const btnCancel = document.getElementById('btn-cancel-export')
  const exportQuality = document.getElementById('export-quality')
  const qualityLabel = document.getElementById('quality-label')
  const jpegRow = document.getElementById('jpeg-quality-row')
  const fmtBtns = document.querySelectorAll('.fmt-btn')

  let format = 'image/png'

  fmtBtns.forEach(b => {
    b.onclick = () => {
      fmtBtns.forEach(x => x.classList.remove('active'))
      b.classList.add('active')
      format = b.dataset.fmt
      jpegRow.classList.toggle('hidden', format !== 'image/jpeg')
    }
  })

  btnExport.onclick = () => {
    const img = getImage()
    const filter = getFilter()
    if (!img) return showToast('请先上传照片')
    if (!filter) return showToast('请先选择一个滤镜')
    modal.classList.remove('hidden')
  }

  btnCancel.onclick = () => modal.classList.add('hidden')
  modal.onclick = e => { if (e.target === modal) modal.classList.add('hidden') }

  exportQuality.oninput = () => { qualityLabel.textContent = exportQuality.value + '%' }

  btnConfirm.onclick = () => {
    const img = getImage()
    const filter = getFilter()
    if (!img || !filter) return

    try {
      const off = document.createElement('canvas')
      applyFilterToOutput(off, img, filter)

      const ext = format === 'image/jpeg' ? 'jpg' : 'png'
      const filename = generateFilename(filter.name || 'filter') + '.' + ext

      let dataUrl
      if (format === 'image/jpeg') {
        const jc = document.createElement('canvas')
        jc.width = off.width, jc.height = off.height
        const jctx = jc.getContext('2d')
        jctx.fillStyle = '#FFFFFF'
        jctx.fillRect(0, 0, jc.width, jc.height)
        jctx.drawImage(off, 0, 0)
        dataUrl = jc.toDataURL('image/jpeg', exportQuality.value / 100)
      } else {
        dataUrl = off.toDataURL('image/png')
      }

      const a = document.createElement('a')
      a.href = dataUrl; a.download = filename
      document.body.appendChild(a); a.click(); document.body.removeChild(a)

      modal.classList.add('hidden')
      showToast('✅ 已下载！分享到小红书/朋友圈吧~')
    } catch (err) {
      showToast('❌ 导出失败: ' + err.message)
    }
  }

  function enable() { btnExport.disabled = false }
  function disable() { btnExport.disabled = true }

  return { enable, disable }
}

function showToast(msg) {
  const t = document.getElementById('toast')
  t.textContent = msg; t.classList.add('show')
  setTimeout(() => t.classList.remove('show'), 2500)
}