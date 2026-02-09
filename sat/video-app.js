// video-app.js - Video Library Application

let videos = [];
let watchedVideos = new Set();
let helpfulVideos = new Set();
let currentVideoId = null;

const activeFilters = {
    type: new Set(['all']),
    topics: new Set(['algebra', 'advanced-math', 'problem-solving', 'geometry']),
    difficulties: new Set(['easy', 'medium', 'hard']),
    progress: 'all',
    search: ''
};

// =========================================================
// LOAD VIDEOS FROM FIREBASE
// =========================================================

async function loadVideos() {
    try {
        const snapshot = await firebase.firestore()
            .collection('videos')
            .orderBy('uploadDate', 'desc')
            .get();

        videos = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

        console.log('✅ Loaded', videos.length, 'videos');
        renderVideos();
        updateStats();
    } catch (error) {
        console.error('❌ Error loading videos:', error);

        // If no videos in Firebase, show empty state
        const grid = document.getElementById('videoGrid');
        grid.innerHTML = `
            <div class="no-results">
                <h3>No videos yet!</h3>
                <p style="margin-top: 1rem;">Videos will appear here once you add them to Firebase.</p>
                <p style="margin-top: 0.5rem; font-size: 0.9rem;">Check the VIDEO_IMPLEMENTATION_GUIDE.md for instructions.</p>
            </div>
        `;
    }
}

// =========================================================
// LOAD USER'S WATCHED STATUS
// =========================================================

async function loadWatchedStatus() {
    if (!storage || !storage.user) return;

    try {
        const userDoc = await firebase.firestore()
            .collection('users')
            .doc(storage.user.uid)
            .get();

        const userData = userDoc.data();
        watchedVideos = new Set(userData?.watchedVideos || []);
        helpfulVideos = new Set(userData?.helpfulVideos || []);

        console.log('✅ Loaded watch status:', watchedVideos.size, 'watched');
    } catch (error) {
        console.error('❌ Error loading watched status:', error);
    }
}

// =========================================================
// FILTER VIDEOS
// =========================================================

function filterVideos() {
    return videos.filter(video => {
        // Type filter
        const typeMatch = activeFilters.type.has('all') ||
            activeFilters.type.has(video.type);

        // Topic filter
        const topicMatch = activeFilters.topics.has(video.topic);

        // Difficulty filter
        const difficultyMatch = activeFilters.difficulties.has(video.difficulty);

        // Progress filter
        let progressMatch = true;
        if (activeFilters.progress === 'watched') {
            progressMatch = watchedVideos.has(video.id);
        } else if (activeFilters.progress === 'unwatched') {
            progressMatch = !watchedVideos.has(video.id);
        }

        // Search filter
        const searchMatch = activeFilters.search === '' ||
            video.title.toLowerCase().includes(activeFilters.search.toLowerCase()) ||
            video.description.toLowerCase().includes(activeFilters.search.toLowerCase());

        return typeMatch && topicMatch && difficultyMatch && progressMatch && searchMatch;
    });
}

// =========================================================
// RENDER VIDEOS
// =========================================================

function renderVideos() {
    const grid = document.getElementById('videoGrid');
    const filtered = filterVideos();

    if (filtered.length === 0) {
        grid.innerHTML = '<div class="no-results">No videos match your filters. Try adjusting your selection.</div>';
        return;
    }

    grid.innerHTML = filtered.map(video => {
        const isWatched = watchedVideos.has(video.id);
        const thumbnail = video.thumbnail || `https://img.youtube.com/vi/${video.youtubeId}/maxresdefault.jpg`;
        const duration = formatDuration(video.duration);

        return `
            <div class="video-card" data-video-id="${video.id}">
                ${video.isPremium ? '<div class="premium-badge">Premium</div>' : ''}
                
                <div class="video-thumbnail">
                    <img src="${thumbnail}" alt="${video.title}" loading="lazy">
                    <div class="video-overlay">
                        <div class="play-button">▶</div>
                    </div>
                    <div class="video-duration-badge">${duration}</div>
                </div>

                <div class="video-card-body">
                    <h3 class="video-card-title">${video.title}</h3>
                    
                    <div class="video-card-meta">
                        <span class="badge badge-difficulty badge-${video.difficulty}">${video.difficulty}</span>
                        <span class="badge badge-type">${formatType(video.type)}</span>
                    </div>

                    <p class="video-card-description">${video.description}</p>

                    <div class="video-card-footer">
                        <span>${video.views || 0} views</span>
                        ${isWatched ? '<span class="watched-indicator">✓ Watched</span>' : ''}
                    </div>
                </div>
            </div>
        `;
    }).join('');

    // Add click handlers
    grid.querySelectorAll('.video-card').forEach(card => {
        card.addEventListener('click', () => {
            const videoId = card.dataset.videoId;
            openVideo(videoId);
        });
    });
}

// =========================================================
// FORMAT HELPERS
// =========================================================

function formatDuration(seconds) {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
}

function formatType(type) {
    const types = {
        'concept': 'Concept',
        'walkthrough': 'Walkthrough',
        'strategy': 'Strategy'
    };
    return types[type] || type;
}

// =========================================================
// OPEN VIDEO MODAL
// =========================================================

function openVideo(videoId) {
    const video = videos.find(v => v.id === videoId);
    if (!video) return;

    currentVideoId = videoId;
    const modal = document.getElementById('videoModal');
    modal.dataset.currentVideo = videoId;

    const player = document.getElementById('videoPlayer');

    // Set YouTube player
    player.src = `https://www.youtube.com/embed/${video.youtubeId}?autoplay=1`;

    // Populate info
    document.getElementById('videoTitle').textContent = video.title;
    document.getElementById('videoDescription').textContent = video.description;
    document.getElementById('videoDuration').textContent = formatDuration(video.duration);
    document.getElementById('videoViews').textContent = `${video.views || 0} views`;
    document.getElementById('helpfulCount').textContent = video.helpful || 0;

    const diffBadge = document.getElementById('videoDifficultyBadge');
    diffBadge.textContent = video.difficulty;
    diffBadge.className = `badge badge-difficulty badge-${video.difficulty}`;

    const typeBadge = document.getElementById('videoTypeBadge');
    typeBadge.textContent = formatType(video.type);
    typeBadge.className = 'badge badge-type';

    // Update watched button
    const watchedBtn = document.getElementById('markWatchedBtn');
    const watchedIcon = document.getElementById('watchedIcon');
    const isWatched = watchedVideos.has(videoId);
    watchedBtn.className = isWatched ? 'action-btn-small active' : 'action-btn-small';
    watchedIcon.textContent = isWatched ? '☑' : '☐';

    // Update helpful button
    const helpfulBtn = document.getElementById('helpfulBtn');
    const isHelpful = helpfulVideos.has(videoId);
    helpfulBtn.className = isHelpful ? 'action-btn-small helpful-btn active' : 'action-btn-small helpful-btn';

    // Show related content if available
    if (video.relatedProblems && video.relatedProblems.length > 0) {
        const section = document.getElementById('relatedProblemsSection');
        const list = document.getElementById('relatedProblemsList');
        section.style.display = 'block';
        list.innerHTML = video.relatedProblems.map(problemId => `
            <a href="index.html#${problemId}" class="related-item">
                <div class="related-item-title">Problem: ${problemId}</div>
                <div class="related-item-meta">Click to practice this problem</div>
            </a>
        `).join('');
    } else {
        document.getElementById('relatedProblemsSection').style.display = 'none';
    }

    if (video.relatedVideos && video.relatedVideos.length > 0) {
        const section = document.getElementById('relatedVideosSection');
        const list = document.getElementById('relatedVideosList');
        section.style.display = 'block';

        const relatedVids = video.relatedVideos
            .map(id => videos.find(v => v.id === id))
            .filter(v => v);

        list.innerHTML = relatedVids.map(vid => `
            <div class="related-item" data-video-id="${vid.id}">
                <div class="related-item-title">${vid.title}</div>
                <div class="related-item-meta">${formatType(vid.type)} • ${formatDuration(vid.duration)}</div>
            </div>
        `).join('');

        // Add click handlers for related videos
        list.querySelectorAll('.related-item').forEach(item => {
            item.addEventListener('click', () => {
                closeVideo();
                setTimeout(() => openVideo(item.dataset.videoId), 300);
            });
        });
    } else {
        document.getElementById('relatedVideosSection').style.display = 'none';
    }

    // Show modal
    modal.classList.add('active');

    // Increment view count
    incrementViews(videoId);
}

// =========================================================
// CLOSE VIDEO MODAL
// =========================================================

function closeVideo() {
    const modal = document.getElementById('videoModal');
    const player = document.getElementById('videoPlayer');

    player.src = '';
    modal.classList.remove('active');
    currentVideoId = null;
}

// =========================================================
// MARK AS WATCHED
// =========================================================

async function toggleWatched(videoId) {
    if (!storage || !storage.user) {
        alert('Please log in to track watched videos');
        return;
    }

    if (watchedVideos.has(videoId)) {
        watchedVideos.delete(videoId);
    } else {
        watchedVideos.add(videoId);
    }

    // Save to Firebase
    await firebase.firestore()
        .collection('users')
        .doc(storage.user.uid)
        .set({
            watchedVideos: Array.from(watchedVideos)
        }, { merge: true });

    renderVideos();
    updateStats();

    // Update button
    const watchedBtn = document.getElementById('markWatchedBtn');
    const watchedIcon = document.getElementById('watchedIcon');
    const isWatched = watchedVideos.has(videoId);
    watchedBtn.className = isWatched ? 'action-btn-small active' : 'action-btn-small';
    watchedIcon.textContent = isWatched ? '☑' : '☐';

    console.log('✅ Toggled watched:', videoId, isWatched ? 'watched' : 'unwatched');
}

// =========================================================
// MARK AS HELPFUL
// =========================================================

async function toggleHelpful(videoId) {
    if (!storage || !storage.user) {
        alert('Please log in to mark videos as helpful');
        return;
    }

    const wasHelpful = helpfulVideos.has(videoId);

    if (wasHelpful) {
        helpfulVideos.delete(videoId);
    } else {
        helpfulVideos.add(videoId);
    }

    // Save to Firebase
    await firebase.firestore()
        .collection('users')
        .doc(storage.user.uid)
        .set({
            helpfulVideos: Array.from(helpfulVideos)
        }, { merge: true });

    // Update count in Firebase
    const video = videos.find(v => v.id === videoId);
    const delta = helpfulVideos.has(videoId) ? 1 : -1;

    await firebase.firestore()
        .collection('videos')
        .doc(videoId)
        .update({
            helpful: (video.helpful || 0) + delta
        });

    // Update local
    video.helpful = (video.helpful || 0) + delta;

    // Update button
    const helpfulBtn = document.getElementById('helpfulBtn');
    const helpfulCount = document.getElementById('helpfulCount');
    const isHelpful = helpfulVideos.has(videoId);
    helpfulBtn.className = isHelpful ? 'action-btn-small helpful-btn active' : 'action-btn-small helpful-btn';
    helpfulCount.textContent = video.helpful;

    console.log('✅ Toggled helpful:', videoId, isHelpful ? 'helpful' : 'not helpful');
}

// =========================================================
// INCREMENT VIEWS
// =========================================================

async function incrementViews(videoId) {
    try {
        await firebase.firestore()
            .collection('videos')
            .doc(videoId)
            .update({
                views: firebase.firestore.FieldValue.increment(1)
            });

        // Update local
        const video = videos.find(v => v.id === videoId);
        if (video) video.views = (video.views || 0) + 1;
    } catch (error) {
        console.error('Error incrementing views:', error);
    }
}

// =========================================================
// UPDATE STATS
// =========================================================

function updateStats() {
    document.getElementById('totalVideos').textContent = videos.length;
    document.getElementById('watchedVideos').textContent = watchedVideos.size;

    // Calculate watch time
    const watchedVideosData = videos.filter(v => watchedVideos.has(v.id));
    const totalSeconds = watchedVideosData.reduce((sum, v) => sum + v.duration, 0);
    const minutes = Math.floor(totalSeconds / 60);
    document.getElementById('watchTime').textContent = minutes;
}

// =========================================================
// UPDATE USER UI
// =========================================================

function updateUserUI() {
    const userSection = document.getElementById('userSection');
    if (!userSection || !storage) return;

    if (storage.isLoggedIn && storage.user) {
        const user = storage.user;
        userSection.innerHTML = `
            <div class="user-info">
                ${user.photoURL ? `<img src="${user.photoURL}" alt="Profile" class="user-avatar">` : ''}
                <div>
                    <div class="user-email">${user.email}</div>
                    <div class="sync-status">☁️ Synced</div>
                </div>
            </div>
            <button class="logout-btn" onclick="storage.logout()">Logout</button>
        `;
    } else {
        userSection.innerHTML = `
            <button class="auth-btn" onclick="window.location.href='../shared/auth.html'">Login / Sign Up</button>
        `;
    }
}

// =========================================================
// EVENT LISTENERS
// =========================================================

document.addEventListener('DOMContentLoaded', async () => {
    console.log('🎬 Video Library initializing...');

    // ========== BACK TO TOP ==========
    const backToTopBtn = document.getElementById('backToTop');
    if (backToTopBtn) {
        window.addEventListener('scroll', () => {
            if (window.pageYOffset > 300) {
                backToTopBtn.classList.add('visible');
            } else {
                backToTopBtn.classList.remove('visible');
            }
        });

        backToTopBtn.addEventListener('click', () => {
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });
    }

    // ========== THEME TOGGLE ==========
    const themeToggle = document.getElementById('themeToggle');
    const themeIcon = document.querySelector('.theme-icon');

    if (themeToggle && themeIcon) {
        const savedTheme = localStorage.getItem('theme') || 'light';
        document.documentElement.setAttribute('data-theme', savedTheme);
        themeIcon.textContent = savedTheme === 'dark' ? '☀' : '☾';

        themeToggle.addEventListener('click', () => {
            const current = document.documentElement.getAttribute('data-theme');
            const next = current === 'dark' ? 'light' : 'dark';
            document.documentElement.setAttribute('data-theme', next);
            localStorage.setItem('theme', next);
            themeIcon.textContent = next === 'dark' ? '☀' : '☾';
        });
    }

    // ========== MODAL CONTROLS ==========
    document.getElementById('closeVideoModal').addEventListener('click', closeVideo);

    document.getElementById('videoModal').addEventListener('click', (e) => {
        if (e.target.id === 'videoModal') closeVideo();
    });

    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') closeVideo();
    });

    // ========== VIDEO ACTIONS ==========
    document.getElementById('markWatchedBtn').addEventListener('click', () => {
        if (currentVideoId) toggleWatched(currentVideoId);
    });

    document.getElementById('helpfulBtn').addEventListener('click', () => {
        if (currentVideoId) toggleHelpful(currentVideoId);
    });

    // ========== TYPE FILTERS ==========
    document.querySelectorAll('[data-type]').forEach(btn => {
        btn.addEventListener('click', () => {
            const type = btn.dataset.type;

            document.querySelectorAll('[data-type]').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');

            activeFilters.type = new Set([type]);
            renderVideos();
        });
    });

    // ========== TOPIC CHECKBOXES ==========
    document.querySelectorAll('[data-topic]').forEach(checkbox => {
        checkbox.addEventListener('change', (e) => {
            if (e.target.checked) {
                activeFilters.topics.add(e.target.dataset.topic);
            } else {
                activeFilters.topics.delete(e.target.dataset.topic);
            }
            renderVideos();
        });
    });

    // ========== DIFFICULTY FILTERS ==========
    document.querySelectorAll('[data-difficulty]').forEach(btn => {
        btn.addEventListener('click', () => {
            const diff = btn.dataset.difficulty;

            if (activeFilters.difficulties.has(diff)) {
                activeFilters.difficulties.delete(diff);
                btn.classList.remove('active');
            } else {
                activeFilters.difficulties.add(diff);
                btn.classList.add('active');
            }

            renderVideos();
        });
    });

    // ========== PROGRESS FILTERS ==========
    document.querySelectorAll('[data-progress]').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('[data-progress]').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');

            activeFilters.progress = btn.dataset.progress;
            renderVideos();
        });
    });

    // ========== SEARCH ==========
    document.getElementById('videoSearch').addEventListener('input', (e) => {
        activeFilters.search = e.target.value;
        renderVideos();
    });

    // ========== INITIALIZE ==========
    if (storage) {
        await storage.init();
        await loadWatchedStatus();
        updateUserUI();
    }

    await loadVideos();

    console.log('✅ Video Library ready!');
});