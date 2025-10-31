// Game data - in a real implementation, this would be loaded from games.json
// For this example, we'll use a subset of the provided data
// Load games from external JSON file
let gamesData = { games: [] };

// Function to load games data
async function loadGamesData() {
    try {
        const response = await fetch('games.json');
        gamesData = await response.json();
        loadGames(); // Load the games after data is fetched
    } catch (error) {
        console.error('Error loading games data:', error);
        // Fallback to sample data if JSON file fails to load
        gamesData = {
            "games": [
                // Your sample games as fallback
            ]
        };
        loadGames();
    }
}

// Update the init function
function init() {
    loadGamesData(); // Changed from loadGames()
    setupEventListeners();
    updateFavoritesUI();
}

// DOM Elements
const gamesGrid = document.getElementById('gamesGrid');
const gamesSection = document.getElementById('gamesSection');
const gameFrameSection = document.getElementById('gameFrameSection');
const gameFrame = document.getElementById('gameFrame');
const currentGameName = document.getElementById('currentGameName');
const gameTitle = document.getElementById('gameTitle');
const gameDescription = document.getElementById('gameDescription');
const backToGames = document.getElementById('backToGames');
const fullscreenBtn = document.getElementById('fullscreenBtn');
const shareBtn = document.getElementById('shareBtn');
const favoriteBtn = document.getElementById('favoriteBtn');
const fullscreenOverlay = document.getElementById('fullscreenOverlay');
const fullscreenFrame = document.getElementById('fullscreenFrame');
const exitFullscreen = document.getElementById('exitFullscreen');
const searchInput = document.getElementById('searchInput');
const categoryFilter = document.getElementById('categoryFilter');
const sectionTitle = document.getElementById('sectionTitle');
const navButtons = document.querySelectorAll('.nav-btn');
const settingsBtn = document.getElementById('settingsBtn');
const settingsPanel = document.getElementById('settingsPanel');
const closeSettings = document.getElementById('closeSettings');
const themeOptions = document.querySelectorAll('.theme-option');
const applyCloak = document.getElementById('applyCloak');
const applyEmbed = document.getElementById('applyEmbed');
const starRating = document.querySelectorAll('.star-rating i');
const ratingValue = document.getElementById('ratingValue');
const submitRating = document.getElementById('submitRating');

// State
let currentGames = [];
let favorites = JSON.parse(localStorage.getItem('favorites')) || [];
let recentGames = JSON.parse(localStorage.getItem('recentGames')) || [];
let currentSection = 'home';
let currentGame = null;
let currentRating = 0;

// Initialize the application
function init() {
    loadGames();
    setupEventListeners();
    updateFavoritesUI();
}

// Load games based on current section and filters
function loadGames() {
    let games = [...gamesData.games];
    
    // Apply section filter
    switch(currentSection) {
        case 'new':
            games = games.filter(game => game.id > 480); // Assuming newer games have higher IDs
            sectionTitle.textContent = 'New Games';
            break;
        case 'trending':
            games = games.filter(game => game.featured);
            sectionTitle.textContent = 'Trending Games';
            break;
        case 'favorites':
            games = games.filter(game => favorites.includes(game.id));
            sectionTitle.textContent = 'Favorite Games';
            break;
        case 'recent':
            games = games.filter(game => recentGames.includes(game.id));
            sectionTitle.textContent = 'Recently Played';
            break;
        default:
            sectionTitle.textContent = 'All Games';
    }
    
    // Apply category filter
    const category = categoryFilter.value;
    if (category !== 'all') {
        games = games.filter(game => game.category === category);
    }
    
    // Apply search filter
    const searchTerm = searchInput.value.toLowerCase();
    if (searchTerm) {
        games = games.filter(game => 
            game.name.toLowerCase().includes(searchTerm) || 
            game.genre.toLowerCase().includes(searchTerm)
        );
    }
    
    currentGames = games;
    renderGames(games);
}

// Render games to the grid
function renderGames(games) {
    gamesGrid.innerHTML = '';
    
    if (games.length === 0) {
        gamesGrid.innerHTML = `
            <div class="no-games">
                <i class="fas fa-gamepad"></i>
                <h3>No games found</h3>
                <p>Try adjusting your filters or search terms</p>
            </div>
        `;
        return;
    }
    
    games.forEach(game => {
        const gameCard = document.createElement('div');
        gameCard.className = 'game-card';
        gameCard.innerHTML = `
            <div class="game-thumbnail">
                <i class="fas fa-gamepad"></i>
            </div>
            <div class="game-info">
                <h3 class="game-title">${game.name}</h3>
                <span class="game-category">${game.genre}</span>
            </div>
        `;
        
        gameCard.addEventListener('click', () => openGame(game));
        gamesGrid.appendChild(gameCard);
    });
}

// Open a game in the game frame
function openGame(game) {
    currentGame = game;
    
    // Update UI
    gamesSection.classList.remove('active');
    gameFrameSection.classList.add('active');
    currentGameName.textContent = game.name;
    gameTitle.textContent = game.name;
    gameDescription.textContent = game.about;
    gameFrame.src = game.link;
    
    // Add to recent games
    if (!recentGames.includes(game.id)) {
        recentGames.unshift(game.id);
        if (recentGames.length > 10) recentGames.pop();
        localStorage.setItem('recentGames', JSON.stringify(recentGames));
    }
    
    // Reset rating UI
    resetRatingUI();
    
    // Update favorite button
    updateFavoriteButton();
}

// Close game frame and return to games
function closeGame() {
    gamesSection.classList.add('active');
    gameFrameSection.classList.remove('active');
    gameFrame.src = '';
    currentGame = null;
}

// Toggle fullscreen mode
function toggleFullscreen() {
    fullscreenOverlay.classList.add('active');
    fullscreenFrame.src = gameFrame.src;
}

// Exit fullscreen mode
function exitFullscreenMode() {
    fullscreenOverlay.classList.remove('active');
    fullscreenFrame.src = '';
}

// Share game
function shareGame() {
    if (navigator.share) {
        navigator.share({
            title: currentGame.name,
            text: `Check out ${currentGame.name} on NiamVerse!`,
            url: window.location.href,
        })
        .catch(console.error);
    } else {
        // Fallback for browsers that don't support Web Share API
        navigator.clipboard.writeText(window.location.href)
            .then(() => alert('Game link copied to clipboard!'))
            .catch(console.error);
    }
}

// Toggle favorite
function toggleFavorite() {
    if (!currentGame) return;
    
    const index = favorites.indexOf(currentGame.id);
    if (index > -1) {
        favorites.splice(index, 1);
    } else {
        favorites.push(currentGame.id);
    }
    
    localStorage.setItem('favorites', JSON.stringify(favorites));
    updateFavoriteButton();
    
    if (currentSection === 'favorites') {
        loadGames();
    }
}

// Update favorite button UI
function updateFavoriteButton() {
    if (!currentGame) return;
    
    const isFavorite = favorites.includes(currentGame.id);
    favoriteBtn.innerHTML = isFavorite ? 
        '<i class="fas fa-heart"></i>' : 
        '<i class="far fa-heart"></i>';
}

// Update favorites UI globally
function updateFavoritesUI() {
    const favoriteBtns = document.querySelectorAll('.nav-btn[data-section="favorites"]');
    favoriteBtns.forEach(btn => {
        const badge = document.createElement('span');
        badge.className = 'favorite-badge';
        badge.textContent = favorites.length;
        btn.appendChild(badge);
    });
}

// Rating functionality
function setupRating() {
    starRating.forEach(star => {
        star.addEventListener('click', () => {
            const rating = parseInt(star.getAttribute('data-rating'));
            setRating(rating);
        });
        
        star.addEventListener('mouseover', () => {
            const rating = parseInt(star.getAttribute('data-rating'));
            highlightStars(rating);
        });
    });
    
    document.querySelector('.star-rating').addEventListener('mouseleave', () => {
        highlightStars(currentRating);
    });
}

function setRating(rating) {
    currentRating = rating;
    ratingValue.textContent = rating;
    highlightStars(rating);
}

function highlightStars(rating) {
    starRating.forEach(star => {
        const starRatingValue = parseInt(star.getAttribute('data-rating'));
        if (starRatingValue <= rating) {
            star.classList.add('fas', 'active');
            star.classList.remove('far');
        } else {
            star.classList.add('far');
            star.classList.remove('fas', 'active');
        }
    });
}

function resetRatingUI() {
    currentRating = 0;
    ratingValue.textContent = '0';
    highlightStars(0);
    document.getElementById('gameNotes').value = '';
}

function submitGameRating() {
    if (currentRating === 0) {
        alert('Please select a rating before submitting.');
        return;
    }
    
    const notes = document.getElementById('gameNotes').value;
    
    // In a real app, you would send this data to a server
    console.log('Rating submitted:', {
        game: currentGame.name,
        rating: currentRating,
        notes: notes
    });
    
    alert(`Thank you for rating ${currentGame.name}!`);
    resetRatingUI();
}

// Settings functionality
function openSettings() {
    settingsPanel.classList.add('active');
}

function closeSettings() {
    settingsPanel.classList.remove('active');
}

function changeTheme(theme) {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
    
    // Update active theme button
    themeOptions.forEach(option => {
        option.classList.remove('active');
        if (option.getAttribute('data-theme') === theme) {
            option.classList.add('active');
        }
    });
}

function applyTabCloak() {
    const title = document.getElementById('tabTitle').value || 'NiamVerse';
    const icon = document.getElementById('tabIcon').value || 'logo.png';
    
    document.title = title;
    
    // Update favicon
    let favicon = document.querySelector("link[rel*='icon']");
    if (!favicon) {
        favicon = document.createElement('link');
        favicon.rel = 'icon';
        document.head.appendChild(favicon);
    }
    favicon.href = icon;
    
    alert('Tab cloaking applied!');
}

function applyAboutBlankEmbed() {
    const url = document.getElementById('embedUrl').value;
    if (!url) {
        alert('Please enter a URL to embed.');
        return;
    }
    
    // This is a simplified version - in a real implementation, 
    // you would use more sophisticated techniques
    const newWindow = window.open('about:blank');
    if (newWindow) {
        newWindow.document.write(`
            <html>
                <head><title>Embedded Content</title></head>
                <body style="margin:0;padding:0;">
                    <iframe src="${url}" style="width:100%;height:100vh;border:none;"></iframe>
                </body>
            </html>
        `);
    }
}

// Event listeners setup
function setupEventListeners() {
    // Navigation
    backToGames.addEventListener('click', closeGame);
    navButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            const section = btn.getAttribute('data-section');
            if (section) {
                navButtons.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                currentSection = section;
                loadGames();
            }
        });
    });
    
    // Game controls
    fullscreenBtn.addEventListener('click', toggleFullscreen);
    shareBtn.addEventListener('click', shareGame);
    favoriteBtn.addEventListener('click', toggleFavorite);
    exitFullscreen.addEventListener('click', exitFullscreenMode);
    
    // Filters and search
    searchInput.addEventListener('input', loadGames);
    categoryFilter.addEventListener('change', loadGames);
    
    // Rating system
    setupRating();
    submitRating.addEventListener('click', submitGameRating);
    
    // Settings
    settingsBtn.addEventListener('click', openSettings);
    closeSettings.addEventListener('click', closeSettings);
    themeOptions.forEach(option => {
        option.addEventListener('click', () => {
            changeTheme(option.getAttribute('data-theme'));
        });
    });
    applyCloak.addEventListener('click', applyTabCloak);
    applyEmbed.addEventListener('click', applyAboutBlankEmbed);
    
    // Load saved theme
    const savedTheme = localStorage.getItem('theme') || 'default';
    changeTheme(savedTheme);
}

// Initialize the app when DOM is loaded
document.addEventListener('DOMContentLoaded', init);
