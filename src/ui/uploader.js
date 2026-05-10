import { loadImage } from '../utils/helpers.js'

export function initUploader({ onImageLoaded }) {
  const fileInput = document.getElementById('file-input')
  const btnUpload = document.getElementById('btn-upload')
  const dropZone = document.getElementById('empty-state')
  const loading = document.getElementById('loading')

  function trigger() { fileInput.click() }
  btnUpload.addEventListener('click', trigger)
  dropZone.addEventListener('click', trigger)

  fileInput.addEventListener('change', async (e) => {
    const file = e.target.files[0]
    if (!file) return
    await handle(file)
  })

  document.addEventListener('dragover', e => { e.preventDefault(); e.stopPropagation() })
  document.addEventListener('drop', async e => {
    e.preventDefault(); e.stopPropagation()
    const file = e.dataTransfer.files[0]
    if (!file) return
    await handle(file)
  })
  document.addEventListener('paste', async e => {
    const items = e.clipboardData?.items
    if (!items) return
    for (const item of items) {
      if (item.type.startsWith('image/')) {
        await handle(item.getAsFile())
        break
      }
    }
  })

  async function handle(file) {
    loading.classList.remove('hidden')
    try {
      const img = await loadImage(file)
      loading.classList.add('hidden')
      onImageLoaded(img)
    } catch (err) {
      loading.classList.add('hidden')
      showToast('❌ ' + (err.message || '加载失败'))
    }
  }
}

function showToast(msg) {
  const toast = document.getElementById('toast')
  toast.textContent = msg
  toast.classList.add('show')
  setTimeout(() => toast.classList.remove('show'), 2000)
}