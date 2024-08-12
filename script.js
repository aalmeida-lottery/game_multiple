/*
script.js

This file contains the JavaScript logic for the Lottery Quiz Game. 
It includes functions to fetch and display questions, handle user interactions, calculate scores, 
and manage the game flow.
*/


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

let currentQuestionIndex = 0;
let score = 0;
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

// initialize and start the game
function startGame() {
    fetch('./questions.json') // fetch questions from the json file
    .then(response => response.json())
    .then(data => {
        questions = selectRandomQuestions(data, 12); // select 12 random questions
        currentQuestionIndex = 0;
        score = 0;
        selectedAnswer = null;
        hasAnswered = false;
        nextButton.classList.add('hide'); // hide the next button initially
        nextButton.style.display = ''; // reset the next button display properly
        feedbackElement.classList.add('hide');
        feedbackElement.innerText = '';
        resultContainer.style.display = 'none';
        questionContainer.style.display = 'block';
        showQuestion(questions[currentQuestionIndex]); // display the question
        updateQuestionCounter(); // update the question counter
    })
    .catch(error => console.error('Error fetching questions:', error));
}

// update the question counter
function updateQuestionCounter() {
    questionCounter.innerText = `Question ${currentQuestionIndex + 1} of ${questions.length}`;
}


// display a question and the options to asnwer it
function showQuestion(question) {
    questionElement.innerText = question.question;
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

    // remove underline from previously selected answer
    Array.from(answerButtonsElement.children).forEach(btn => {
        btn.classList.remove('selected');
    });

    selectedAnswer = { button, selectedOption, correctAnswer };
    button.classList.add('selected'); // underline the selected answer
    nextButton.classList.remove('hide');
}

// show feedback for the answer selected
function showAnswerFeedback() {
    const { button, selectedOption, correctAnswer } = selectedAnswer;
    const currentQuestion = questions[currentQuestionIndex];  

    if (selectedOption === correctAnswer) {
        button.classList.add('correct');
        score++;
        if (currentQuestion.correct_explanation) {
            feedbackElement.innerText = currentQuestion.correct_explanation;
        } else {
            feedbackElement.innerText = 'Correct!';
        }
    } else {
        button.classList.add('incorrect');
        if (currentQuestion.incorrect_explanation) {
            feedbackElement.innerText = currentQuestion.incorrect_explanation;
        } else {
            feedbackElement.innerText = `Answer: ${correctAnswer}`;
        }
    }
    feedbackElement.classList.remove('hide');
    nextButton.innerText = 'Next';
    nextButton.classList.remove('hide');
    hasAnswered = true; // mark the question as answered after showing feedback
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
        showResult(); // show final result if all answers have been answered
    }
}

// show final result and handle the pass/fail
function showResult() {
    questionContainer.style.display = 'none';
    nextButton.classList.add('hide'); // ensure the Next button is hidden
    nextButton.style.display = 'none'; // ensure the Next button is hidden
    resultContainer.style.display = 'block';
    questionCounter.classList.add('hide-counter'); // hide question counter
    const percentage = (score / questions.length) * 100;
    scoreElement.innerText = `Your score: ${score}/${questions.length} (${percentage.toFixed(2)}%)`;
    if (percentage >= 80) {
        resultMessage.innerText = 'Congratulations, you passed!';
        // trigger confetti if player wins
        confetti({
            particleCount: 100,
            spread: 70,
            origin: { y: 0.6 }
        });
    } else {
        resultMessage.innerText = 'Sorry, you did not pass. \nYou need a score of 80% or higher to pass. \nBetter luck next time!';
    }
}

// event listener for the restart button to start the game again
restartButton.addEventListener('click', () => {
    startGame();
});

// initialize game on load
document.addEventListener('DOMContentLoaded', () => {
    startGame();
});

// event listener for the next button to handle the next question logic
nextButton.addEventListener('click', handleNextQuestion);
