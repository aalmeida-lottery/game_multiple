// global variables and DOM elements references
let questions = [];
const questionContainer = document.getElementById('question-container');
const questionElement = document.getElementById('question');
const answerButtonsElement = document.getElementById('answer-buttons');
const nextButton = document.getElementById('next-btn');
const resultContainer = document.getElementById('result-container');
const scoreElement = document.getElementById('score');
const resultMessage = document.getElementById('result-message');
const restartButton = document.getElementById('restart-btn');
const feedbackElement = document.getElementById('feedback');
const questionCounter = document.getElementById('question-counter');
const playerSetup = document.getElementById('player-setup');
const numPlayersSelect = document.getElementById('num-players');
const playerInputs = document.querySelectorAll('#player-names input');
const startGameButton = document.getElementById('start-game-btn');

let currentQuestionIndex = 0;
let currentPlayerIndex = 0;
let players = [];
let selectedAnswer = null;
let hasAnswered = false;

// function to shuffle an array in random order
function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
}

// function to select a specific number of random questions from the pool 
function selectRandomQuestions(allQuestions, numQuestions) {
    const shuffled = shuffleArray([...allQuestions]);
    return shuffled.slice(0, numQuestions);
}

// event listener to show/hide player name inputs based on number of players
numPlayersSelect.addEventListener('change', function() {
    const numPlayers = parseInt(this.value);
    playerInputs.forEach((input, index) => {
        input.style.display = index < numPlayers ? 'block' : 'none';
    });
});

// initialize and start the game
function startGame() {
    const numPlayers = parseInt(numPlayersSelect.value);
    players = [];
    for (let i = 0; i < numPlayers; i++) {
        const playerName = playerInputs[i].value || `Player ${i + 1}`;
        players.push({ name: playerName, score: 0 });
    }
    
    playerSetup.style.display = 'none';
    questionContainer.style.display = 'block';
    
    fetch('./questions.json')
    .then(response => response.json())
    .then(data => {
        questions = selectRandomQuestions(data, 12);
        currentQuestionIndex = 0;
        currentPlayerIndex = 0;
        selectedAnswer = null;
        hasAnswered = false;
        nextButton.classList.add('hide');
        feedbackElement.classList.add('hide');
        feedbackElement.innerText = '';
        resultContainer.style.display = 'none';
        showQuestion(questions[currentQuestionIndex]);
        updateQuestionCounter();
    })
    .catch(error => console.error('Error fetching questions:', error));
}

// update the question counter
function updateQuestionCounter() {
    questionCounter.innerText = `Question ${currentQuestionIndex + 1} of ${questions.length}`;
}

// display a question and the options to answer it
function showQuestion(question) {
    const currentPlayer = players[currentPlayerIndex];
    questionElement.innerText = `${currentPlayer.name}'s turn: ${question.question}`;
    answerButtonsElement.innerHTML = '';
    question.options.forEach(option => {
        const button = document.createElement('button');
        button.innerText = option;
        button.classList.add('btn');
        button.addEventListener('click', () => selectAnswer(button, option, question.answer));
        answerButtonsElement.appendChild(button);
    });
    nextButton.classList.add('hide');
    feedbackElement.classList.add('hide');
    feedbackElement.innerText = '';
    hasAnswered = false;
}

// handle the answer selected
function selectAnswer(button, selectedOption, correctAnswer) {
    if (hasAnswered) return;

    Array.from(answerButtonsElement.children).forEach(btn => {
        btn.classList.remove('selected');
    });

    selectedAnswer = { button, selectedOption, correctAnswer };
    button.classList.add('selected');
    nextButton.classList.remove('hide');
}

// show feedback for the answer selected
function showAnswerFeedback() {
    const { button, selectedOption, correctAnswer } = selectedAnswer;
    const currentQuestion = questions[currentQuestionIndex];
    const currentPlayer = players[currentPlayerIndex];

    if (selectedOption === correctAnswer) {
        button.classList.add('correct');
        currentPlayer.score++;
        feedbackElement.innerText = currentQuestion.correct_explanation ? currentQuestion.correct_explanation : 'Correct!';
    } else {
        button.classList.add('incorrect');
        feedbackElement.innerText = currentQuestion.incorrect_explanation ? currentQuestion.incorrect_explanation : `Answer: ${correctAnswer}`;
    }

    feedbackElement.classList.remove('hide');
    nextButton.innerText = 'Next';
    nextButton.classList.remove('hide');
    hasAnswered = true;
}

// handle the "Next" button click
function handleNextQuestion() {
    if (!hasAnswered) {
        showAnswerFeedback();
    } else {
        proceedToNextQuestion();
    }
}

// move to the next question or show the result if it was the last question
function proceedToNextQuestion() {
    if (currentQuestionIndex < questions.length - 1) {
        currentPlayerIndex = (currentPlayerIndex + 1) % players.length;
        currentQuestionIndex++;
        selectedAnswer = null;
        hasAnswered = false;
        showQuestion(questions[currentQuestionIndex]);
        nextButton.classList.add('hide');
        feedbackElement.classList.add('hide');
        feedbackElement.innerText = '';
        nextButton.innerText = 'Submit';
        updateQuestionCounter();
    } else {
        showResult();
    }
}

// show final result and handle the pass/fail
function showResult() {
    questionContainer.style.display = 'none';
    nextButton.classList.add('hide');
    nextButton.style.display = 'none';
    resultContainer.style.display = 'block';
    questionCounter.classList.add('hide-counter');

    let winner = players[0];
    players.forEach(player => {
        if (player.score > winner.score) {
            winner = player;
        }
    });

    scoreElement.innerText = `Winner: ${winner.name} with a score of ${winner.score}`;
    resultMessage.innerText = players.map(p => `${p.name}: ${p.score}`).join('\n');

    if ((winner.score / questions.length) * 100 >= 80) {
        confetti({
            particleCount: 100,
            spread: 70,
            origin: { y: 0.6 }
        });
    } else {
        resultMessage.innerText += '\nBetter luck next time!';
    }
}

// event listener for the restart button to start the game again
restartButton.addEventListener('click', () => {
    playerSetup.style.display = 'block';
    questionContainer.style.display = 'none';
    resultContainer.style.display = 'none';
    scoreElement.innerText = '';
    resultMessage.innerText = '';
    playerInputs.forEach(input => input.value = '');
});

// initialize game setup on load
document.addEventListener('DOMContentLoaded', () => {
    playerSetup.style.display = 'block';
    questionContainer.style.display = 'none';
    resultContainer.style.display = 'none';
});

// event listener for the start game button to initialize game
startGameButton.addEventListener('click', startGame);

// event listener for the next button to handle the next question logic
nextButton.addEventListener('click', handleNextQuestion);
