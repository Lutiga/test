// Game State
let selectedLevel = null;
let currentQuestionIndex = 0;
let correctAnswers = 0;
const totalQuestions = 10;
let questions = [];

// DOM Elements
const homeScreen = document.getElementById('home-screen');
const quizScreen = document.getElementById('quiz-screen');
const resultScreen = document.getElementById('result-screen');
const levelSelector = document.getElementById('level-selector');
const startBtn = document.getElementById('start-btn');

const qNum1 = document.getElementById('q-num1');
const qNum2 = document.getElementById('q-num2');
const optionsGrid = document.getElementById('options-grid');
const progressBar = document.getElementById('progress-bar');
const progressText = document.getElementById('progress-text');
const feedbackEmoji = document.getElementById('feedback-emoji');

const finalScoreEl = document.getElementById('final-score');
const resultMessage = document.getElementById('result-message');
const retryBtn = document.getElementById('retry-btn');
const homeBtn = document.getElementById('home-btn');

// Initialize App
function init() {
    createLevelButtons();
    startBtn.addEventListener('click', startGame);
    retryBtn.addEventListener('click', () => { selectedLevel ? startGame() : showScreen(homeScreen); });
    homeBtn.addEventListener('click', () => {
        selectedLevel = null;
        updateStartButton();
        document.querySelectorAll('.level-btn').forEach(b => b.classList.remove('selected'));
        showScreen(homeScreen);
    });
}

// Home Screen Logic
function createLevelButtons() {
    levelSelector.innerHTML = '';
    for (let i = 2; i <= 9; i++) {
        const btn = document.createElement('button');
        btn.classList.add('level-btn');
        btn.textContent = `${i}단`;
        btn.addEventListener('click', () => {
            // Deselect all
            document.querySelectorAll('.level-btn').forEach(b => b.classList.remove('selected'));
            // Select current
            btn.classList.add('selected');
            selectedLevel = i;
            updateStartButton();
        });
        levelSelector.appendChild(btn);
    }
}

function updateStartButton() {
    if (selectedLevel) {
        startBtn.textContent = `${selectedLevel}단 출발! 🚀`;
        startBtn.disabled = false;
    } else {
        startBtn.textContent = '도전 할 단을 선택하세요!';
        startBtn.disabled = true;
    }
}

// Game Logic
function startGame() {
    currentQuestionIndex = 0;
    correctAnswers = 0;
    generateQuestions();
    showScreen(quizScreen);
    loadQuestion();
}

function generateQuestions() {
    questions = [];
    // Generate an array 1 to 9
    let multipliers = [1, 2, 3, 4, 5, 6, 7, 8, 9];
    // Shuffle
    multipliers.sort(() => Math.random() - 0.5);
    
    // We need 10 questions, so we duplicate one random multiplier
    multipliers.push(Math.floor(Math.random() * 9) + 1);
    multipliers.sort(() => Math.random() - 0.5);

    for (let i = 0; i < totalQuestions; i++) {
        const m = multipliers[i];
        const correct = selectedLevel * m;
        
        // Generate wrong answers
        let options = new Set([correct]);
        while (options.size < 4) {
            // Generate plausible wrong answers
            let offset = Math.floor(Math.random() * 5) + 1; // 1 to 5
            let isAdd = Math.random() > 0.5;
            let wrong = isAdd ? correct + offset : correct - offset;
            
            // Also sometimes use a different multiplier
            if (options.size === 2 && Math.random() > 0.5) {
                let wrongMultiplier = (m % 9) + 1;
                wrong = selectedLevel * wrongMultiplier;
            }

            if (wrong > 0 && wrong !== correct) {
                options.add(wrong);
            }
        }

        const optionsArray = Array.from(options).sort(() => Math.random() - 0.5);
        
        questions.push({
            num1: selectedLevel,
            num2: m,
            correctAnswer: correct,
            options: optionsArray
        });
    }
}

function loadQuestion() {
    const q = questions[currentQuestionIndex];
    qNum1.textContent = q.num1;
    qNum2.textContent = q.num2;
    
    // Re-trigger bounce animation
    const qContainer = document.getElementById('question-container');
    qContainer.style.animation = 'none';
    qContainer.offsetHeight; // trigger reflow
    qContainer.style.animation = null;

    // Update Progress
    const progressPerc = ((currentQuestionIndex) / totalQuestions) * 100;
    progressBar.style.width = `${progressPerc}%`;
    progressText.textContent = `${currentQuestionIndex + 1} / ${totalQuestions}`;

    // Render Options
    optionsGrid.innerHTML = '';
    const colorClasses = ['opt-color-1', 'opt-color-2', 'opt-color-3', 'opt-color-4'];
    
    q.options.forEach((opt, idx) => {
        const btn = document.createElement('button');
        btn.classList.add('jelly-btn', 'option-btn', colorClasses[idx % 4]);
        btn.textContent = opt;
        btn.addEventListener('click', () => handleAnswer(opt, q.correctAnswer));
        optionsGrid.appendChild(btn);
    });
}

function handleAnswer(selected, correct) {
    // Disable buttons to prevent double click
    document.querySelectorAll('.option-btn').forEach(btn => btn.disabled = true);

    // Update Progress Bar right after an answer
    const progressPerc = ((currentQuestionIndex + 1) / totalQuestions) * 100;
    progressBar.style.width = `${progressPerc}%`;

    if (selected === correct) {
        // Correct
        correctAnswers++;
        feedbackEmoji.textContent = '🎉';
        feedbackEmoji.classList.remove('anim-pop');
        void feedbackEmoji.offsetWidth; // trigger reflow
        feedbackEmoji.classList.add('anim-pop');
        
        // Confetti
        confetti({
            particleCount: 100,
            spread: 70,
            origin: { y: 0.6 },
            colors: ['#FF5A5F', '#08D9D6', '#FFC93C', '#8FE968']
        });

        setTimeout(nextQuestion, 1200);
    } else {
        // Wrong
        feedbackEmoji.textContent = '😅';
        feedbackEmoji.classList.remove('anim-pop');
        void feedbackEmoji.offsetWidth;
        feedbackEmoji.classList.add('anim-pop');
        
        quizScreen.classList.add('anim-shake');
        setTimeout(() => {
            quizScreen.classList.remove('anim-shake');
        }, 500);

        setTimeout(nextQuestion, 1200);
    }
}

function nextQuestion() {
    currentQuestionIndex++;
    if (currentQuestionIndex < totalQuestions) {
        loadQuestion();
    } else {
        showResult();
    }
}

// Result Screen Logic
function showResult() {
    setTimeout(() => {
        const score = Math.round((correctAnswers / totalQuestions) * 100);
        finalScoreEl.textContent = score;
        
        if (score === 100) {
            resultMessage.innerHTML = '우주 최고 천재! 🚀<br>완벽해요!';
            fireBigConfetti();
        } else if (score >= 80) {
            resultMessage.innerHTML = '정말 대단해요! ⭐️<br>조금만 더 하면 100점!';
        } else if (score >= 50) {
            resultMessage.innerHTML = '참 잘했어요! 😊<br>계속 연습해봐요!';
        } else {
            resultMessage.innerHTML = '포기하지 마세요! 💪<br>할 수 있어요!';
        }

        showScreen(resultScreen);
    }, 500);
}

function fireBigConfetti() {
    var duration = 3 * 1000;
    var animationEnd = Date.now() + duration;
    var defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 0 };

    function randomInRange(min, max) {
      return Math.random() * (max - min) + min;
    }

    var interval = setInterval(function() {
      var timeLeft = animationEnd - Date.now();

      if (timeLeft <= 0) {
        return clearInterval(interval);
      }

      var particleCount = 50 * (timeLeft / duration);
      confetti(Object.assign({}, defaults, { particleCount,
        origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 }
      }));
      confetti(Object.assign({}, defaults, { particleCount,
        origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 }
      }));
    }, 250);
}

// Utils
function showScreen(screenEl) {
    document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
    screenEl.classList.add('active');
}

// Start
window.onload = init;
