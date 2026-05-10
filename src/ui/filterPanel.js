import { categories } from '../data/filters.js'
import { generateThumbnail } from '../engine/filterEngine.js'

const STORAGE_FAVS = 'fw_favs'
const STORAGE_RECENT = 'fw_recent'

export function initFilterPanel({ filters, onFilterSelect, getImage }) {
  const filterNav = document.querySelector('.filter-nav')
  const filterGrid = document.getElementById('filter-grid')
  const searchInput = document.getElementById('filter-search')
  const btnFavorites = document.getElementById('btn-favorites')
  const badgeCount = document.getElementById('badge-count')

  let currentCat = 'all'
  let selectedId = null
  let favorites = loadFavs()
  let showingFavs = false

  buildNav()

  function loadFavs() {
    try { return JSON.parse(localStorage.getItem(STORAGE_FAVS)) || [] } catch { return [] }
  }
  function saveFavs(ids) { localStorage.setItem(STORAGE_FAVS, JSON.stringify(ids)) }
  function loadRecent() {
    try { return JSON.parse(localStorage.getItem(STORAGE_RECENT)) || [] } catch { return [] }
  }
  function saveRecent(ids) { localStorage.setItem(STORAGE_RECENT, JSON.stringify(ids.slice(0, 50))) }

  function buildNav() {
    filterNav.innerHTML = ''
    const allBtn = doc('button', 'cat-chip active', `🔥 全部 (${filters.length})`)
    allBtn.dataset.cat = 'all'
    allBtn.onclick = () => { currentCat = 'all'; showingFavs = false; btnFavorites.classList.remove('active'); activateNav(allBtn); render() }
    filterNav.appendChild(allBtn)

    for (const cat of categories) {
      const n = filters.filter(f => f.category === cat.id).length
      const b = doc('button', 'cat-chip', `${cat.emoji} ${cat.name}`)
      b.dataset.cat = cat.id
      b.onclick = () => { currentCat = cat.id; showingFavs = false; btnFavorites.classList.remove('active'); activateNav(b); render() }
      filterNav.appendChild(b)
    }
  }

  function activateNav(el) { filterNav.querySelectorAll('.cat-chip').forEach(b => b.classList.remove('active')); el.classList.add('active') }

  searchInput.addEventListener('input', debounce(render, 200))

  btnFavorites.onclick = () => {
    showingFavs = !showingFavs
    btnFavorites.classList.toggle('active', showingFavs)
    if (showingFavs) { filterNav.querySelectorAll('.cat-chip').forEach(b => b.classList.remove('active')); currentCat = 'favorites' }
    else { currentCat = 'all'; filterNav.querySelector('[data-cat="all"]')?.classList.add('active') }
    render()
  }

  function getVisible() {
    let r = [...filters]
    if (showingFavs) r = r.filter(f => favorites.includes(f.id))
    else if (currentCat !== 'all') r = r.filter(f => f.category === currentCat)
    const q = searchInput.value.trim().toLowerCase()
    if (q) r = r.filter(f => f.name.toLowerCase().includes(q) || f.tags.some(t => t.toLowerCase().includes(q)) || f.category.includes(q))
    return r
  }

  function render() {
    filterGrid.innerHTML = ''
    const visible = getVisible()
    if (visible.length === 0) {
      filterGrid.innerHTML = '<div style="width:100%;padding:20px;text-align:center;color:var(--text2)">🔍 没有找到匹配的滤镜</div>'
      return
    }

    const img = getImage ? getImage() : null
    batchRender(visible, 0, img)
  }

  function batchRender(list, start, img) {
    const end = Math.min(start + 120, list.length)
    const frag = document.createDocumentFragment()
    for (let i = start; i < end; i++) {
      const card = buildCard(list[i], img)
      frag.appendChild(card)
    }
    filterGrid.appendChild(frag)
    if (end < list.length) {
      requestAnimationFrame(() => batchRender(list, end, img))
    }
  }

  function buildCard(filter, img) {
    const card = document.createElement('div')
    card.className = 'filter-card'
    card.dataset.fid = filter.id
    if (filter.id === selectedId) card.classList.add('selected')

    const canvas = document.createElement('canvas')
    canvas.width = 64, canvas.height = 64
    card.appendChild(canvas)

    if (favorites.includes(filter.id)) {
      const star = document.createElement('span')
      star.className = 'filter-card-fav'
      star.textContent = '⭐'
      card.appendChild(star)
    }

    const name = document.createElement('div')
    name.className = 'filter-card-name'
    name.textContent = filter.name
    card.appendChild(name)

    if (img) {
      const t = generateThumbnail(img, filter, 64, 64)
      const cctx = canvas.getContext('2d')
      cctx.drawImage(t, 0, 0, 64, 64)
    }

    card.onclick = () => {
      document.querySelectorAll('.filter-card').forEach(c => c.classList.remove('selected'))
      card.classList.add('selected')
      selectedId = filter.id
      const recent = loadRecent()
      if (!recent.includes(filter.id)) { recent.unshift(filter.id); saveRecent(recent) }
      onFilterSelect(filter)
    }

    card.ondblclick = (e) => {
      e.preventDefault()
      if (favorites.includes(filter.id)) favorites = favorites.filter(id => id !== filter.id)
      else favorites.push(filter.id)
      saveFavs(favorites)
      render()
    }

    return card
  }

  function refreshAllThumbnails(img) {
    const cards = filterGrid.querySelectorAll('.filter-card')
    for (const card of cards) {
      const fid = card.dataset.fid
      const filter = filters.find(f => f.id === fid)
      const canvas = card.querySelector('canvas')
      if (!canvas || !filter || !img) continue
      const t = generateThumbnail(img, filter, 64, 64)
      canvas.getContext('2d').drawImage(t, 0, 0, 64, 64)
    }
  }

  function selectById(id) {
    selectedId = id
    document.querySelectorAll('.filter-card').forEach(c => c.classList.toggle('selected', c.dataset.fid === id))
  }

  return { render, getVisible, refreshAllThumbnails, selectById }
}

function doc(tag, cls, text) {
  const el = document.createElement(tag)
  if (cls) el.className = cls
  if (text) el.textContent = text
  return el
}

function debounce(fn, d) { let t; return (...a) => { clearTimeout(t); t = setTimeout(() => fn(...a), d) } }