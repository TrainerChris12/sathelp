// video-sidebar.js - FIXED VERSION with multi-topic support and filter dropdowns

let sidebarVideos = [];
let watchedVideos = new Set();
let collapsedSections = new Set();

// Video-specific filters (independent from problem filters)
let selectedVideoTopic = null;  // null = "auto" (use first checked)
let selectedVideoDifficulty = null;  // null = "auto" (use first active)

// =========================================================
// INITIALIZATION
// =========================================================

function initVideoSidebar() {
    console.log('📹 Initializing video sidebar...');

    // Load watched videos
    loadWatchedVideos();

    // Add filter dropdowns to header
    addVideoFilterDropdowns();

    // Load initial videos
    updateVideoSidebar();

    // Attach filter change listeners
    attachSidebarFilterListeners();

    console.log('✅ Video sidebar initialized');
}

// =========================================================
// ADD FILTER DROPDOWNS TO HEADER
// =========================================================

function addVideoFilterDropdowns() {
    const filterDisplay = document.getElementById('currentFilterDisplay');
    if (!filterDisplay) return;

    // Replace static display with dropdowns
    filterDisplay.innerHTML = `
        <div class="video-filter-controls">
            <div class="video-filter-group">
                <label class="video-filter-label">Topic:</label>
                <select class="video-filter-select" id="videoTopicFilter">
                    <option value="auto">Auto (Follow Filters)</option>
                    <option value="linear-equations-one-variable">Linear Equations</option>
                    <option value="linear-functions">Linear Functions</option>
                    <option value="linear-equations-two-variables">Linear Equations (2 vars)</option>
                    <option value="systems-linear-equations">Systems of Equations</option>
                    <option value="linear-inequalities">Linear Inequalities</option>
                    <option value="nonlinear-functions">Nonlinear Functions</option>
                    <option value="nonlinear-equations">Nonlinear Equations</option>
                    <option value="equivalent-expressions">Equivalent Expressions</option>
                    <option value="ratios-rates">Ratios & Rates</option>
                    <option value="percentages">Percentages</option>
                    <option value="one-variable-data">One-Variable Data</option>
                    <option value="two-variable-data">Two-Variable Data</option>
                    <option value="probability">Probability</option>
                    <option value="inference">Inference</option>
                    <option value="statistical-claims">Statistical Claims</option>
                    <option value="area-volume">Area & Volume</option>
                    <option value="lines-angles-triangles">Lines & Triangles</option>
                    <option value="right-triangles">Right Triangles</option>
                    <option value="circles">Circles</option>
                </select>
            </div>
            
            <div class="video-filter-group">
                <label class="video-filter-label">Level:</label>
                <select class="video-filter-select" id="videoDifficultyFilter">
                    <option value="auto">Auto (Follow Filters)</option>
                    <option value="easy">Easy</option>
                    <option value="medium">Medium</option>
                    <option value="hard">Hard</option>
                </select>
            </div>
        </div>
    `;

    // Add event listeners
    const topicFilter = document.getElementById('videoTopicFilter');
    const difficultyFilter = document.getElementById('videoDifficultyFilter');

    if (topicFilter) {
        topicFilter.addEventListener('change', (e) => {
            if (e.target.value === 'auto') {
                selectedVideoTopic = null;
            } else {
                selectedVideoTopic = subskillToDisplayName(e.target.value);
            }
            updateVideoSidebar();
        });
    }

    if (difficultyFilter) {
        difficultyFilter.addEventListener('change', (e) => {
            if (e.target.value === 'auto') {
                selectedVideoDifficulty = null;
            } else {
                const val = e.target.value;
                selectedVideoDifficulty = val.charAt(0).toUpperCase() + val.slice(1);
            }
            updateVideoSidebar();
        });
    }
}

// =========================================================
// UPDATE SIDEBAR
// =========================================================

async function updateVideoSidebar() {
    console.log('📹 Updating video sidebar...');

    // Load videos from Firebase for ALL checked topics and difficulties (or selected filters)
    await loadSidebarVideosMultiple();

    // Render videos
    renderSidebarVideos();
}

// =========================================================
// GET CURRENT FILTERS
// =========================================================

function getAllCheckedTopics() {
    const checkedSubskills = document.querySelectorAll('.subskill-checkbox input:checked');
    const topics = [];

    checkedSubskills.forEach(checkbox => {
        const subskill = checkbox.dataset.subskill;
        topics.push(subskill);
    });

    // If nothing selected, return empty array (will show "no filters" message)
    return topics;
}

function getAllActiveDifficulties() {
    const activeBtns = document.querySelectorAll('.filter-btn[data-difficulty].active');
    const difficulties = [];

    activeBtns.forEach(btn => {
        difficulties.push(btn.dataset.difficulty);
    });

    // If nothing selected, return empty array
    return difficulties;
}

function subskillToDisplayName(slug) {
    const names = {
        'linear-equations-one-variable': 'Linear Equations',
        'linear-functions': 'Linear Functions',
        'linear-equations-two-variables': 'Linear Equations (Two Variables)',
        'systems-linear-equations': 'Systems of Equations',
        'linear-inequalities': 'Linear Inequalities',
        'nonlinear-functions': 'Nonlinear Functions',
        'nonlinear-equations': 'Nonlinear Equations',
        'equivalent-expressions': 'Equivalent Expressions',
        'ratios-rates': 'Ratios & Rates',
        'percentages': 'Percentages',
        'one-variable-data': 'One-Variable Data',
        'two-variable-data': 'Two-Variable Data',
        'probability': 'Probability',
        'inference': 'Inference',
        'statistical-claims': 'Statistical Claims',
        'area-volume': 'Area & Volume',
        'lines-angles-triangles': 'Lines & Triangles',
        'right-triangles': 'Right Triangles',
        'circles': 'Circles'
    };

    return names[slug] || slug.replace(/-/g, ' ');
}

function displayNameToSubskill(displayName) {
    const reverseMap = {
        'Linear Equations': 'linear-equations-one-variable',
        'Linear Functions': 'linear-functions',
        'Linear Equations (Two Variables)': 'linear-equations-two-variables',
        'Systems of Equations': 'systems-linear-equations',
        'Linear Inequalities': 'linear-inequalities',
        'Nonlinear Functions': 'nonlinear-functions',
        'Nonlinear Equations': 'nonlinear-equations',
        'Equivalent Expressions': 'equivalent-expressions',
        'Ratios & Rates': 'ratios-rates',
        'Percentages': 'percentages',
        'One-Variable Data': 'one-variable-data',
        'Two-Variable Data': 'two-variable-data',
        'Probability': 'probability',
        'Inference': 'inference',
        'Statistical Claims': 'statistical-claims',
        'Area & Volume': 'area-volume',
        'Lines & Triangles': 'lines-angles-triangles',
        'Right Triangles': 'right-triangles',
        'Circles': 'circles'
    };

    return reverseMap[displayName] || displayName.toLowerCase().replace(/ /g, '-');
}

// =========================================================
// LOAD VIDEOS FROM FIREBASE (MULTIPLE TOPICS/DIFFICULTIES)
// =========================================================

async function loadSidebarVideosMultiple() {
    try {
        let topicsToQuery = [];
        let difficultiesToQuery = [];

        // Determine which topics to query
        if (selectedVideoTopic) {
            // User manually selected a topic
            topicsToQuery = [displayNameToSubskill(selectedVideoTopic)];
        } else {
            // Auto mode - use all checked topics
            topicsToQuery = getAllCheckedTopics();
        }

        // Determine which difficulties to query
        if (selectedVideoDifficulty) {
            // User manually selected difficulty
            difficultiesToQuery = [selectedVideoDifficulty.toLowerCase()];
        } else {
            // Auto mode - use all active difficulties
            difficultiesToQuery = getAllActiveDifficulties();
        }

        // Handle no filters selected
        if (topicsToQuery.length === 0 || difficultiesToQuery.length === 0) {
            console.log('⚠️ No topics or difficulties selected');
            sidebarVideos = [];
            return;
        }

        console.log('🔍 Querying videos for:', {
            topics: topicsToQuery,
            difficulties: difficultiesToQuery
        });

        // Query Firebase for all combinations
        const allVideos = [];
        const seenIds = new Set(); // Prevent duplicates

        for (const topic of topicsToQuery) {
            for (const difficulty of difficultiesToQuery) {
                try {
                    const snapshot = await firebase.firestore()
                        .collection('videos')
                        .where('topic', '==', topic)
                        .where('difficulty', '==', difficulty)
                        .orderBy('order', 'asc')
                        .get();

                    snapshot.docs.forEach(doc => {
                        if (!seenIds.has(doc.id)) {
                            const video = { id: doc.id, ...doc.data() };
                            allVideos.push(video);
                            seenIds.add(doc.id);
                        }
                    });
                } catch (queryError) {
                    console.warn(`Query failed for ${topic}-${difficulty}:`, queryError.message);
                    // Continue with other queries even if one fails
                }
            }
        }

        sidebarVideos = allVideos;

        console.log(`✅ Loaded ${sidebarVideos.length} videos for sidebar`);

    } catch (error) {
        console.error('❌ Error loading sidebar videos:', error);
        sidebarVideos = [];
    }
}

// =========================================================
// RENDER VIDEOS
// =========================================================

function renderSidebarVideos() {
    const container = document.getElementById('videoSidebarContent');

    if (!container) {
        console.warn('Video sidebar content container not found');
        return;
    }

    if (sidebarVideos.length === 0) {
        showSidebarEmpty();
        return;
    }

    // Group videos by type
    const grouped = groupSidebarVideosByType(sidebarVideos);

    let html = '';

    // Render each section
    if (grouped.concept && grouped.concept.length > 0) {
        html += renderVideoSection('Concepts', 'concept', grouped.concept);
    }

    if (grouped['how-to'] && grouped['how-to'].length > 0) {
        html += renderVideoSection('How-To Guides', 'how-to', grouped['how-to']);
    }

    if (grouped.example && grouped.example.length > 0) {
        html += renderVideoSection('Worked Examples', 'example', grouped.example);
    }

    if (grouped.strategy && grouped.strategy.length > 0) {
        html += renderVideoSection('Strategies', 'strategy', grouped.strategy);
    }

    container.innerHTML = html;

    // Attach event listeners
    attachSidebarVideoHandlers();
    attachSectionCollapseHandlers();
}

function groupSidebarVideosByType(videos) {
    const grouped = {};

    videos.forEach(video => {
        const type = video.type || 'how-to';
        if (!grouped[type]) {
            grouped[type] = [];
        }
        grouped[type].push(video);
    });

    return grouped;
}

function renderVideoSection(title, typeKey, videos) {
    const isCollapsed = collapsedSections.has(typeKey);

    return `
        <div class="video-section ${isCollapsed ? 'collapsed' : ''}" data-section="${typeKey}">
            <div class="video-section-header" data-section-toggle="${typeKey}">
                <span class="video-section-icon">▼</span>
                ${title}
                <span class="video-section-count">${videos.length}</span>
            </div>
            
            <div class="video-section-list">
                ${videos.map(video => renderSidebarVideoCard(video)).join('')}
            </div>
        </div>
    `;
}

function renderSidebarVideoCard(video) {
    const isWatched = watchedVideos.has(video.id);
    const thumbnail = video.thumbnail || `https://img.youtube.com/vi/${video.youtubeId}/mqdefault.jpg`;
    const typeBadge = getVideoTypeLabel(video.type);

    return `
        <div class="sidebar-video-card ${isWatched ? 'watched' : ''}" data-video-id="${video.id}">
            <div class="sidebar-video-thumb">
                <img src="${thumbnail}" alt="${video.title}" loading="lazy">
                <div class="sidebar-video-play">▶</div>
            </div>
            
            <div class="sidebar-video-info">
                <div class="sidebar-video-title">${video.title}</div>
                <div class="sidebar-video-meta">
                    <span class="sidebar-video-duration">⏱ ${formatDuration(video.duration)}</span>
                    <span class="sidebar-video-badge ${video.type}">${typeBadge}</span>
                    ${isWatched ? '<span class="sidebar-video-watched">✓ Watched</span>' : ''}
                </div>
            </div>
        </div>
    `;
}

// =========================================================
// EMPTY STATE
// =========================================================

function showSidebarEmpty() {
    const container = document.getElementById('videoSidebarContent');

    if (!container) return;

    const topicFilter = document.getElementById('videoTopicFilter');
    const diffFilter = document.getElementById('videoDifficultyFilter');

    // Check if no filters are selected
    const checkedTopics = getAllCheckedTopics();
    const activeDiffs = getAllActiveDifficulties();

    let message = '';
    let title = 'No videos yet';

    if (checkedTopics.length === 0 || activeDiffs.length === 0) {
        // No filters selected
        title = 'No filters selected';
        if (checkedTopics.length === 0) {
            message = 'Please select at least one <strong>topic</strong> from the filters on the left.';
        } else if (activeDiffs.length === 0) {
            message = 'Please select at least one <strong>difficulty level</strong> from the filters on the left.';
        }
    } else if (topicFilter && diffFilter) {
        // Filters selected but no videos
        const topicText = topicFilter.options[topicFilter.selectedIndex].text;
        const diffText = diffFilter.options[diffFilter.selectedIndex].text;

        if (topicText !== 'Auto (Follow Filters)' || diffText !== 'Auto (Follow Filters)') {
            message = `No videos yet for <strong>${topicText}</strong> at <strong>${diffText}</strong> level.`;
        } else {
            message = 'Videos are being created for your selected topics. Check back soon!';
        }
    } else {
        message = 'Videos are being created. Check back soon!';
    }

    container.innerHTML = `
        <div class="video-sidebar-empty">
            <div class="video-empty-icon">🎬</div>
            <div class="video-empty-title">${title}</div>
            <p class="video-empty-message">${message}</p>
        </div>
    `;
}

// =========================================================
// EVENT HANDLERS
// =========================================================

function attachSidebarVideoHandlers() {
    document.querySelectorAll('.sidebar-video-card').forEach(card => {
        card.addEventListener('click', () => {
            const videoId = card.dataset.videoId;
            openSidebarVideo(videoId);
        });
    });
}

function attachSectionCollapseHandlers() {
    document.querySelectorAll('[data-section-toggle]').forEach(header => {
        header.addEventListener('click', () => {
            const sectionKey = header.dataset.sectionToggle;
            toggleSectionCollapse(sectionKey);
        });
    });
}

function toggleSectionCollapse(sectionKey) {
    const section = document.querySelector(`.video-section[data-section="${sectionKey}"]`);

    if (!section) return;

    if (collapsedSections.has(sectionKey)) {
        collapsedSections.delete(sectionKey);
        section.classList.remove('collapsed');
    } else {
        collapsedSections.add(sectionKey);
        section.classList.add('collapsed');
    }

    // Save to localStorage
    localStorage.setItem('collapsedVideoSections', JSON.stringify([...collapsedSections]));
}

function openSidebarVideo(videoId) {
    const video = sidebarVideos.find(v => v.id === videoId);

    if (!video) {
        console.error('Video not found:', videoId);
        return;
    }

    console.log('🎬 Opening sidebar video:', video.title);

    // Use existing video modal if available
    if (typeof openVideo === 'function') {
        openVideo(videoId);
    } else {
        openSimpleSidebarVideoModal(video);
    }
}

function openSimpleSidebarVideoModal(video) {
    // Create simple modal if it doesn't exist
    let modal = document.getElementById('sidebarVideoModal');

    if (!modal) {
        modal = document.createElement('div');
        modal.id = 'sidebarVideoModal';
        modal.className = 'content-modal';
        modal.innerHTML = `
            <div class="modal-content" style="max-width: 900px;">
                <button class="modal-close" onclick="closeSidebarVideoModal()">×</button>
                <div class="video-player-wrapper" style="padding-top: 56.25%; position: relative; background: #000; border-radius: 12px; overflow: hidden;">
                    <iframe id="sidebarVideoPlayer" 
                            style="position: absolute; top: 0; left: 0; width: 100%; height: 100%;"
                            frameborder="0" 
                            allowfullscreen
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture">
                    </iframe>
                </div>
                <div style="padding: 2rem;">
                    <h2 id="sidebarVideoTitle" style="margin-bottom: 1rem;"></h2>
                    <button class="action-btn" onclick="markSidebarVideoWatched()">
                        <span id="sidebarWatchedIcon">☐</span> Mark as Watched
                    </button>
                </div>
            </div>
        `;
        document.body.appendChild(modal);

        // Close on overlay click
        modal.addEventListener('click', (e) => {
            if (e.target === modal) closeSidebarVideoModal();
        });
    }

    // Set current video
    window.currentSidebarVideo = video;

    // Update content
    document.getElementById('sidebarVideoPlayer').src =
        `https://www.youtube.com/embed/${video.youtubeId}?autoplay=1`;
    document.getElementById('sidebarVideoTitle').textContent = video.title;

    const isWatched = watchedVideos.has(video.id);
    document.getElementById('sidebarWatchedIcon').textContent = isWatched ? '☑' : '☐';

    // Show modal
    modal.classList.add('active');
    modal.style.display = 'flex';
    modal.style.position = 'fixed';
    modal.style.top = '0';
    modal.style.left = '0';
    modal.style.right = '0';
    modal.style.bottom = '0';
    modal.style.background = 'rgba(0,0,0,0.9)';
    modal.style.alignItems = 'center';
    modal.style.justifyContent = 'center';
    modal.style.zIndex = '10000';
}

function closeSidebarVideoModal() {
    const modal = document.getElementById('sidebarVideoModal');
    if (modal) {
        modal.classList.remove('active');
        modal.style.display = 'none';
        document.getElementById('sidebarVideoPlayer').src = '';
    }
}

function markSidebarVideoWatched() {
    if (!window.currentSidebarVideo) return;

    const videoId = window.currentSidebarVideo.id;

    if (watchedVideos.has(videoId)) {
        watchedVideos.delete(videoId);
    } else {
        watchedVideos.add(videoId);
    }

    // Save
    saveWatchedVideos();

    // Update UI
    const icon = document.getElementById('sidebarWatchedIcon');
    if (icon) {
        icon.textContent = watchedVideos.has(videoId) ? '☑' : '☐';
    }

    // Re-render sidebar
    renderSidebarVideos();
}

// =========================================================
// WATCHED VIDEOS TRACKING
// =========================================================

function loadWatchedVideos() {
    const stored = localStorage.getItem('watchedVideos');
    if (stored) {
        try {
            watchedVideos = new Set(JSON.parse(stored));
        } catch (e) {
            watchedVideos = new Set();
        }
    }

    // Also load collapsed sections
    const storedCollapsed = localStorage.getItem('collapsedVideoSections');
    if (storedCollapsed) {
        try {
            collapsedSections = new Set(JSON.parse(storedCollapsed));
        } catch (e) {
            collapsedSections = new Set();
        }
    }
}

function saveWatchedVideos() {
    localStorage.setItem('watchedVideos', JSON.stringify([...watchedVideos]));
}

// =========================================================
// FILTER CHANGE LISTENERS
// =========================================================

function attachSidebarFilterListeners() {
    // Difficulty buttons
    document.querySelectorAll('.filter-btn[data-difficulty]').forEach(btn => {
        btn.addEventListener('click', () => {
            // Only update if in auto mode
            if (!selectedVideoDifficulty) {
                setTimeout(updateVideoSidebar, 100);
            }
        });
    });

    // Subskill checkboxes
    document.querySelectorAll('.subskill-checkbox input').forEach(checkbox => {
        checkbox.addEventListener('change', () => {
            // Only update if in auto mode
            if (!selectedVideoTopic) {
                setTimeout(updateVideoSidebar, 100);
            }
        });
    });
}

// =========================================================
// UTILITY FUNCTIONS
// =========================================================

function formatDuration(seconds) {
    if (!seconds) return '0:00';
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
}

function getVideoTypeLabel(type) {
    const types = {
        'concept': 'Concept',
        'how-to': 'How-To',
        'example': 'Example',
        'strategy': 'Strategy'
    };
    return types[type] || 'Video';
}

// =========================================================
// INITIALIZE ON PAGE LOAD
// =========================================================

document.addEventListener('DOMContentLoaded', () => {
    console.log('📹 Video sidebar script loaded');

    // Wait for Firebase and other scripts to load
    setTimeout(() => {
        initVideoSidebar();
    }, 1000);
});

// Export for use in other scripts
window.updateVideoSidebar = updateVideoSidebar;
window.markSidebarVideoWatched = markSidebarVideoWatched;
window.closeSidebarVideoModal = closeSidebarVideoModal;