// State
let currentQuizCards = [];
let currentCardIndex = 0;
let correctAnswers = 0;
let quizMode = 0;

// Tab switching
function switchTab(tab) {
    const quizContent = document.getElementById('quiz-content');
    const referenceContent = document.getElementById('reference-content');
    const tabQuiz = document.getElementById('tab-quiz');
    const tabReference = document.getElementById('tab-reference');

    if (tab === 'quiz') {
        quizContent.classList.remove('hidden');
        referenceContent.classList.add('hidden');
        tabQuiz.classList.add('active');
        tabReference.classList.remove('active');
    } else {
        quizContent.classList.add('hidden');
        referenceContent.classList.remove('hidden');
        tabQuiz.classList.remove('active');
        tabReference.classList.add('active');
        renderReferenceCards();
    }
}

// Shuffle array
function shuffleArray(array) {
    const newArray = [...array];
    for (let i = newArray.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
    }
    return newArray;
}

// Start quiz
function startQuiz(mode) {
    quizMode = mode;
    currentCardIndex = 0;
    correctAnswers = 0;

    // Get random cards
    const shuffled = shuffleArray(cardsData);
    currentQuizCards = shuffled.slice(0, mode);

    // Show quiz game
    document.getElementById('mode-selection').classList.add('hidden');
    document.getElementById('quiz-game').classList.remove('hidden');
    document.getElementById('quiz-results').classList.add('hidden');

    // Update progress info
    document.getElementById('total-cards').textContent = mode;

    showCurrentCard();
}

// Show current card
function showCurrentCard() {
    const card = currentQuizCards[currentCardIndex];
    const suitClass = (card.suit === '♥' || card.suit === '♦') ? 'suit-red' : 'suit-black';

    // Update card display
    document.getElementById('card-suit').className = `text-6xl md:text-8xl mb-2 ${suitClass}`;
    document.getElementById('card-suit').textContent = card.suit;
    document.getElementById('card-rank').textContent = card.rank;
    document.getElementById('card-title').textContent = card.title;

    // Update progress
    document.getElementById('current-card-num').textContent = currentCardIndex + 1;
    document.getElementById('correct-count').textContent = correctAnswers;
    document.getElementById('progress-fill').style.width = `${((currentCardIndex) / quizMode) * 100}%`;

    // Hide detail card
    document.getElementById('detail-card').classList.add('hidden');

    // Generate options
    generateOptions(card);
}

// Generate answer options
function generateOptions(correctCard) {
    const optionsContainer = document.getElementById('options-container');
    optionsContainer.innerHTML = '';

    // Get 3 random distractors
    const otherCards = cardsData.filter(c => c.id !== correctCard.id);
    const distractors = shuffleArray(otherCards).slice(0, 3);

    // Combine and shuffle
    const options = shuffleArray([correctCard, ...distractors]);

    // Create buttons
    options.forEach(option => {
        const btn = document.createElement('button');
        btn.className = 'btn-option p-4 rounded-xl text-left text-sm md:text-base';
        btn.textContent = option.short;
        btn.onclick = () => selectOption(option, correctCard, btn);
        optionsContainer.appendChild(btn);
    });
}

// Select option
function selectOption(selected, correct, btn) {
    const buttons = document.querySelectorAll('.btn-option');
    buttons.forEach(b => b.disabled = true);

    if (selected.id === correct.id) {
        btn.classList.add('correct');
        correctAnswers++;
    } else {
        btn.classList.add('incorrect');
        // Highlight correct answer
        buttons.forEach(b => {
            if (b.textContent === correct.short) {
                b.classList.add('correct');
            }
        });
    }

    // Show detail card
    const detailCard = document.getElementById('detail-card');
    const detailText = document.getElementById('detail-text');
    detailText.innerHTML = `
        <strong class="gold-text">${correct.title}</strong><br><br>
        <span class="text-gray-400">Прямое:</span> ${correct.upright.meaning}<br><br>
        <span class="text-gray-400">Перевёрнутое:</span> ${correct.reversed.meaning}
    `;
    detailCard.classList.remove('hidden');

    // Update correct count
    document.getElementById('correct-count').textContent = correctAnswers;
}

// Next card
function nextCard() {
    currentCardIndex++;

    if (currentCardIndex >= quizMode) {
        showResults();
    } else {
        showCurrentCard();
    }
}

// Show results
function showResults() {
    document.getElementById('quiz-game').classList.add('hidden');
    document.getElementById('quiz-results').classList.remove('hidden');

    const percentage = Math.round((correctAnswers / quizMode) * 100);
    document.getElementById('final-score').textContent = percentage;
    document.getElementById('final-correct').textContent = correctAnswers;
    document.getElementById('final-total').textContent = quizMode;

    const resultsIcon = document.getElementById('results-icon');
    const resultsTitle = document.getElementById('results-title');
    const resultsMessage = document.getElementById('results-message');

    if (percentage === 100) {
        resultsIcon.textContent = '🎉';
        resultsTitle.textContent = 'Мастер Карт!';
        resultsMessage.textContent = 'Идеальный результат! Вы полностью освоили значения карт!';
        // Launch confetti
        launchConfetti();
    } else if (percentage >= 90) {
        resultsIcon.textContent = '⭐';
        resultsTitle.textContent = 'Отличный знаток!';
        resultsMessage.textContent = 'Превосходный результат! Вы отлично знаете значения карт.';
    } else {
        resultsIcon.textContent = '📚';
        resultsTitle.textContent = 'Продолжайте учиться!';
        resultsMessage.textContent = 'Хороший результат! Практикуйтесь ещё, чтобы стать мастером.';
    }
}

// Launch confetti
function launchConfetti() {
    const duration = 3000;
    const end = Date.now() + duration;

    (function frame() {
        confetti({
            particleCount: 5,
            angle: 60,
            spread: 55,
            origin: { x: 0 },
            colors: ['#d4af37', '#f4d875', '#2ecc71']
        });
        confetti({
            particleCount: 5,
            angle: 120,
            spread: 55,
            origin: { x: 1 },
            colors: ['#d4af37', '#f4d875', '#2ecc71']
        });

        if (Date.now() < end) {
            requestAnimationFrame(frame);
        }
    }());
}

// Back to mode selection
function backToModes() {
    document.getElementById('quiz-results').classList.add('hidden');
    document.getElementById('mode-selection').classList.remove('hidden');
}

// Render reference cards
function renderReferenceCards(filteredCards = null) {
    const cardsToRender = filteredCards || cardsData;
    const grid = document.getElementById('cards-grid');
    const noResults = document.getElementById('no-results');

    grid.innerHTML = '';

    if (cardsToRender.length === 0) {
        noResults.classList.remove('hidden');
        return;
    }

    noResults.classList.add('hidden');

    cardsToRender.forEach(card => {
        const suitClass = (card.suit === '♥' || card.suit === '♦') ? 'suit-red' : 'suit-black';
        const cardEl = document.createElement('div');
        cardEl.className = 'card p-4';
        cardEl.innerHTML = `
            <div class="flex items-center justify-between mb-3">
                <div class="flex items-center gap-2">
                    <span class="text-2xl ${suitClass}">${card.suit}</span>
                    <span class="font-display text-lg gold-text">${card.rank}</span>
                </div>
                <span class="text-xs text-gray-500">${card.suitName}</span>
            </div>
            <h3 class="font-medium text-sm mb-3">${card.title}</h3>
            <div class="space-y-2 text-xs">
                <div>
                    <span class="text-gray-400">Прямое:</span>
                    <p class="text-gray-300 leading-relaxed">${card.upright.meaning}</p>
                </div>
                <div>
                    <span class="text-gray-400">Перевёрнутое:</span>
                    <p class="text-gray-300 leading-relaxed">${card.reversed.meaning}</p>
                </div>
            </div>
        `;
        grid.appendChild(cardEl);
    });
}

// Filter cards in reference
function filterCards() {
    const searchTerm = document.getElementById('search-input').value.toLowerCase();
    
    if (!searchTerm) {
        renderReferenceCards();
        return;
    }

    const filtered = cardsData.filter(card => {
        const searchFields = [
            card.title.toLowerCase(),
            card.suitName.toLowerCase(),
            card.rank.toLowerCase(),
            card.short.toLowerCase(),
            card.upright.meaning.toLowerCase(),
            card.reversed.meaning.toLowerCase()
        ];
        return searchFields.some(field => field.includes(searchTerm));
    });

    renderReferenceCards(filtered);
}

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    renderReferenceCards();
});
