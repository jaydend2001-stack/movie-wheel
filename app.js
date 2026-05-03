const STORAGE_KEY = 'oliviaJaydenMovieWheel.v1';
const colors = ['#f6c453', '#6ee7b7', '#93c5fd', '#c4b5fd', '#fca5a5', '#f9a8d4', '#fdba74', '#a7f3d0'];

const movieForm = document.getElementById('movieForm');
const titleInput = document.getElementById('titleInput');
const genreInput = document.getElementById('genreInput');
const addedByInput = document.getElementById('addedByInput');
const posterInput = document.getElementById('posterInput');
const notesInput = document.getElementById('notesInput');
const genreFilter = document.getElementById('genreFilter');
const clearFilter = document.getElementById('clearFilter');
const movieList = document.getElementById('movieList');
const listCount = document.getElementById('listCount');
const wheelCount = document.getElementById('wheelCount');
const spinButton = document.getElementById('spinButton');
const canvas = document.getElementById('wheelCanvas');
const ctx = canvas.getContext('2d');
const winnerBox = document.getElementById('winnerBox');
const exportButton = document.getElementById('exportButton');
const importInput = document.getElementById('importInput');
const template = document.getElementById('movieCardTemplate');

let movies = loadMovies();
let currentRotation = 0;

function loadMovies() {
  const saved = localStorage.getItem(STORAGE_KEY);
  if (saved) return JSON.parse(saved);
  return [
    { id: crypto.randomUUID(), title: 'The Princess Bride', genres: ['Comedy', 'Adventure'], addedBy: 'Both', poster: '', notes: 'Starter example. Delete or replace it.' },
    { id: crypto.randomUUID(), title: 'Knives Out', genres: ['Mystery', 'Comedy'], addedBy: 'Jayden', poster: '', notes: '' },
    { id: crypto.randomUUID(), title: 'La La Land', genres: ['Musical', 'Romance'], addedBy: 'Olivia', poster: '', notes: '' }
  ];
}

function saveMovies() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(movies));
}

function getFilteredMovies() {
  const selected = genreFilter.value;
  if (selected === 'all') return movies;
  return movies.filter(movie => movie.genres.includes(selected));
}

function getAllGenres() {
  return [...new Set(movies.flatMap(movie => movie.genres))].sort((a, b) => a.localeCompare(b));
}

function renderGenreFilter() {
  const selected = genreFilter.value;
  genreFilter.innerHTML = '<option value="all">All genres</option>';
  getAllGenres().forEach(genre => {
    const option = document.createElement('option');
    option.value = genre;
    option.textContent = genre;
    genreFilter.appendChild(option);
  });
  genreFilter.value = getAllGenres().includes(selected) ? selected : 'all';
}

function renderList() {
  const filtered = getFilteredMovies();
  movieList.innerHTML = '';
  listCount.textContent = `${filtered.length} of ${movies.length} movie${movies.length === 1 ? '' : 's'} shown`;

  if (!filtered.length) {
    movieList.innerHTML = '<p class="meta">No movies match this filter.</p>';
    return;
  }

  filtered.forEach(movie => {
    const card = template.content.cloneNode(true);
    const article = card.querySelector('.movie-card');
    const poster = card.querySelector('.poster');
    const title = card.querySelector('h3');
    const meta = card.querySelector('.meta');
    const notes = card.querySelector('.notes');
    const genres = card.querySelector('.genres');
    const deleteButton = card.querySelector('.delete-button');

    title.textContent = movie.title;
    meta.textContent = `Added by ${movie.addedBy}`;
    notes.textContent = movie.notes || '';

    if (movie.poster) {
      const img = document.createElement('img');
      img.src = movie.poster;
      img.alt = `${movie.title} poster`;
      poster.appendChild(img);
    } else {
      poster.textContent = movie.title.split(' ').map(word => word[0]).join('').slice(0, 3).toUpperCase();
    }

    movie.genres.forEach(genre => {
      const pill = document.createElement('span');
      pill.className = 'genre-pill';
      pill.textContent = genre;
      genres.appendChild(pill);
    });

    deleteButton.addEventListener('click', () => {
      movies = movies.filter(item => item.id !== movie.id);
      saveMovies();
      render();
    });

    movieList.appendChild(article);
  });
}

function drawWheel() {
  const filtered = getFilteredMovies();
  const radius = canvas.width / 2;
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  ctx.save();
  ctx.translate(radius, radius);

  if (!filtered.length) {
    ctx.beginPath();
    ctx.arc(0, 0, radius - 10, 0, Math.PI * 2);
    ctx.fillStyle = '#20212b';
    ctx.fill();
    ctx.fillStyle = '#a7a8b5';
    ctx.font = 'bold 28px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('Add or filter movies', 0, 0);
    ctx.restore();
    wheelCount.textContent = '0 movies available';
    return;
  }

  const slice = (Math.PI * 2) / filtered.length;
  filtered.forEach((movie, index) => {
    const start = index * slice - Math.PI / 2;
    const end = start + slice;
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.arc(0, 0, radius - 10, start, end);
    ctx.closePath();
    ctx.fillStyle = colors[index % colors.length];
    ctx.fill();
    ctx.strokeStyle = 'rgba(16,16,20,.5)';
    ctx.lineWidth = 3;
    ctx.stroke();

    ctx.save();
    ctx.rotate(start + slice / 2);
    ctx.textAlign = 'right';
    ctx.fillStyle = '#101014';
    ctx.font = 'bold 18px sans-serif';
    const label = movie.title.length > 24 ? `${movie.title.slice(0, 22)}…` : movie.title;
    ctx.fillText(label, radius - 32, 7);
    ctx.restore();
  });

  ctx.beginPath();
  ctx.arc(0, 0, 48, 0, Math.PI * 2);
  ctx.fillStyle = '#101014';
  ctx.fill();
  ctx.fillStyle = '#f5f5f7';
  ctx.font = 'bold 16px sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('SPIN', 0, 5);
  ctx.restore();

  wheelCount.textContent = `${filtered.length} movie${filtered.length === 1 ? '' : 's'} available`;
}

function render() {
  renderGenreFilter();
  renderList();
  drawWheel();
}

movieForm.addEventListener('submit', event => {
  event.preventDefault();
  const genres = genreInput.value.split(',').map(g => g.trim()).filter(Boolean).map(g => g[0].toUpperCase() + g.slice(1));
  movies.push({
    id: crypto.randomUUID(),
    title: titleInput.value.trim(),
    genres,
    addedBy: addedByInput.value,
    poster: posterInput.value.trim(),
    notes: notesInput.value.trim()
  });
  saveMovies();
  movieForm.reset();
  addedByInput.value = 'Jayden';
  winnerBox.classList.add('hidden');
  render();
});

genreFilter.addEventListener('change', () => {
  winnerBox.classList.add('hidden');
  renderList();
  drawWheel();
});

clearFilter.addEventListener('click', () => {
  genreFilter.value = 'all';
  winnerBox.classList.add('hidden');
  renderList();
  drawWheel();
});

spinButton.addEventListener('click', () => {
  const filtered = getFilteredMovies();
  if (!filtered.length || spinButton.disabled) return;

  spinButton.disabled = true;
  winnerBox.classList.add('hidden');
  const winnerIndex = Math.floor(Math.random() * filtered.length);
  const sliceDegrees = 360 / filtered.length;
  const targetMiddle = winnerIndex * sliceDegrees + sliceDegrees / 2;
  const extraSpins = 6 * 360;
  const finalRotation = currentRotation + extraSpins + (360 - targetMiddle);
  currentRotation = finalRotation;
  canvas.style.transform = `rotate(${finalRotation}deg)`;

  setTimeout(() => {
    const winner = filtered[winnerIndex];
    winnerBox.innerHTML = `<strong>Tonight's pick: ${winner.title}</strong><br><span>${winner.genres.join(', ')} • Added by ${winner.addedBy}</span>`;
    winnerBox.classList.remove('hidden');
    spinButton.disabled = false;
  }, 4100);
});

exportButton.addEventListener('click', () => {
  const blob = new Blob([JSON.stringify(movies, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'movie-wheel-list.json';
  a.click();
  URL.revokeObjectURL(url);
});

importInput.addEventListener('change', event => {
  const file = event.target.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = () => {
    try {
      const imported = JSON.parse(reader.result);
      if (!Array.isArray(imported)) throw new Error('Invalid file');
      movies = imported.map(movie => ({
        id: movie.id || crypto.randomUUID(),
        title: movie.title || 'Untitled Movie',
        genres: Array.isArray(movie.genres) ? movie.genres : ['Other'],
        addedBy: movie.addedBy || 'Both',
        poster: movie.poster || '',
        notes: movie.notes || ''
      }));
      saveMovies();
      render();
    } catch {
      alert('That JSON file was not a valid movie list export.');
    }
  };
  reader.readAsText(file);
  importInput.value = '';
});

render();
