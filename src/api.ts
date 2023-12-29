import { fetchFunData, getRandomFunFact } from "./fun";
// ENCRYPTED DATA
import { encryptScore } from "./crypto";
import { encryptQuestions } from "./crypto";
import { decryptQuestions } from "./crypto";
import { decryptScore } from "./crypto";

const apiUrl = "https://opentdb.com/api.php";
let selectAmount: number = 0;
let selectDifficulty: string = "";
let selectedCategory: string = "";

const category = document.querySelector<HTMLButtonElement>("#category_span");
const difficulty = document.querySelector<HTMLElement>("#difficulty_span");
const question = document.querySelector<HTMLElement>("#question_span");
const questionOptions = document.querySelector<HTMLElement>(".question-options");
const totalQuestion = document.querySelector<HTMLElement>("#total-question");
const selectAmountElement = document.querySelector<HTMLOptionElement>("#selected_amount");

const checkBtn = document.querySelector<HTMLButtonElement>("#next-question");
const playAgainBtn = document.querySelector<HTMLButtonElement>("#play-again");

const result = document.querySelector<HTMLButtonElement>("#result") as HTMLElement;
const downloadResults = document.querySelector<HTMLButtonElement>("downloadReasult");

let currentCorrectAnswer: string = "";
let currentCorrectScore: number = 0;
let currentAskedCount: number = 0;
let currentTotalQuestion: number = 0;

// Generation New Quiz
const generateNewQuizBtn = document.querySelector<HTMLButtonElement>("#getDataButton");
if (generateNewQuizBtn) {
    generateNewQuizBtn.addEventListener("click", getData);
} else {
    console.error("Button with ID 'generateNewQuizBtn' not found");
}

// Provided an event listener attached to the DOMContentLoaded event
document.addEventListener("DOMContentLoaded", () => {
    getData();
    eventListeners();
    if (totalQuestion) {
        totalQuestion.textContent = String(currentTotalQuestion); // I add here String()
    }
});

// * Fetching data from Trivia * ------------------------------------------------------------------- START
// --- Main function ---

// export async function getData() {
//     try {
//         const apiEndpoint = buildApiEndpoint(); // Build Api Endpoints
//         const response = await fetchTriviaData(apiEndpoint); // Fetching data from Trivia App
//         hideDownloadResultButton(); // Download result button hede, display wnhen qiuz end
//         setQuizParameters(); // Quiz parameters display on screen
//         handleApiResponse(response); // Store questions in localStorage
//         clearOptionsAndResult(); // Clear existing options and result
//         resetQuestionCountAndScore(); // Reset question count and score
//         updateTotalQuestionCount(); // Update the total question count
//         setupQuizWithFunFacts(); // Fetch Fun Facts
//         fixBugWithButtonsDisplay(); // Fixing bug with generate new quiz and Next btn and Play Again btn
//     } catch (error) {
//         console.error(error);
//     }
// }

export function getData() {
    const apiEndpoint = buildApiEndpoint(); // Build Api Endpoints

    fetchTriviaData(apiEndpoint)
        .then((response) => {
            hideDownloadResultButton(); // Download result button hide, display when quiz ends
            setQuizParameters(); // Quiz parameters display on screen
            handleApiResponse(response); // Store questions in localStorage
            clearOptionsAndResult(); // Clear existing options and result
            resetQuestionCountAndScore(); // Reset question count and score
            updateTotalQuestionCount(); // Update the total question count
            setupQuizWithFunFacts(); // Fetch Fun Facts
            fixBugWithButtonsDisplay(); // Fixing bug with generate new quiz and Next btn and Play Again btn
        })
        .catch((error) => {
            console.error(error);
        });
}

// --- Main function ---

// -- Functions helpers --
// Download result button hede, display wnhen qiuz end
function hideDownloadResultButton() {
    if (downloadResults) {
        downloadResults.style.display = "none";
    }
}

// Quiz parameters display on screen

function setQuizParameters() {
    const selectDifficultyElement = document.querySelector<HTMLOptionElement>("#selected_difficulty");
    const selectedCategoryElement = document.querySelector<HTMLOptionElement>("#selected_category");

    if (selectDifficultyElement) {
        selectDifficulty = selectDifficultyElement.value;
    }

    if (selectedCategoryElement) {
        selectedCategory = selectedCategoryElement.value;
    }
}

// Build Api Endpoints
function buildApiEndpoint() {
    // I move the row below, from function setQuizParameters() to function buildApiEndpoint(), because there was a problem with updating the 'selectAmount' in UI
    selectAmount = Number(selectAmountElement?.value);
    const difficultyParam = selectDifficulty !== "any" ? `${selectDifficulty}` : "";
    const categoryParam = selectedCategory !== "any" ? `${selectedCategory}` : "";
    // Update the total number of questions
    currentTotalQuestion = Number(selectAmount);
    // console.log("selectedAmaunt", selectAmount);
    return `${apiUrl}?amount=${selectAmount}&category=${categoryParam}&difficulty=${difficultyParam}&type=multiple`;
}

// Fetching data from Trivia App
async function fetchTriviaData(apiEndpoint: string) {
    const response = await fetch(apiEndpoint);
    if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
    }
    return response.json();
}

// Store questions in localStorage
function handleApiResponse(data: SingleQuestion[]) {
    // console.log(data.results);
    // // ENCRYPTED DATA -  questions in LocalStorage
    encryptQuestions("questions", data);
    // localStorage.setItem("questions", JSON.stringify(data));
    localStorage.setItem("selectAmount", JSON.stringify(selectAmount));
    localStorage.setItem("selectDifficulty", JSON.stringify(selectDifficulty));
    localStorage.setItem("selectedCategory", JSON.stringify(selectedCategory));
}

// Clear existing options and result
function clearOptionsAndResult() {
    if (questionOptions) {
        questionOptions.innerHTML = "";
    }
    result.innerHTML = "";
}

// Reset question count and score
function resetQuestionCountAndScore() {
    currentAskedCount = 0;
    currentCorrectScore = 0;
}

// Update the total question count
function updateTotalQuestionCount() {
    if (totalQuestion) {
        totalQuestion.textContent = String(currentTotalQuestion);
    }
}

// Fetch Fun Facts
function setupQuizWithFunFacts() {
    const funDataPromise = fetchFunData();

    funDataPromise.then((funData) => {
        if (funData) {
            loadQuestions();
            displayRandomFunFact(funData);

            // const storedFunData = funData;

            const nextQuestionElelemnt = document.querySelector<HTMLButtonElement>("#next-question");
            nextQuestionElelemnt?.addEventListener("click", () => {
                // displayRandomFunFact(storedFunData);
                displayRandomFunFact(funData);
            });
        } else {
            // Handle the case where funData is undefined
            console.error("Failed to fetch fun data");
        }
    });
}

// Fixing bug with generate new quiz and Next btn and Play Again btn
function fixBugWithButtonsDisplay() {
    if (checkBtn) {
        checkBtn.style.display = "block";
    }
    if (playAgainBtn) {
        playAgainBtn.style.display = "none";
    }
}
// -- Functions helpers --
// * Fetching data from Trivia * ------------------------------------------------------------------- END

// Event listeners to Check Button and Play Again Btn
function eventListeners() {
    if (checkBtn) {
        checkBtn.addEventListener("click", checkAnswer);
    }
    if (playAgainBtn) {
        playAgainBtn.addEventListener("click", restartQuiz);
    }
}

// FunFacts random display function
function displayRandomFunFact(funData: FunData[]) {
    const funFactElement = document.querySelector<HTMLInputElement>(".fun-fatcs-p");
    const randomFunFact = getRandomFunFact(funData);
    if (funFactElement) {
        funFactElement.textContent = `"${randomFunFact}"`;
    }
}

// Load question from localStorage
// function loadQuestions() {
//     const storedQuestions = localStorage.getItem("questions");

//     if (storedQuestions) {
//         // console.log("Questions found in local storage");
//         const questions: LocalStorageQuestionsData = JSON.parse(storedQuestions);

//         // Check if there are more questions in the local storage
//         if (currentAskedCount < currentTotalQuestion) {
//             // console.log("log", questions.results[currentAskedCount]);

//             showQuestion(questions.results[currentAskedCount]);
//         } else {
//             // If no more questions in local storage, fetch new questions
//             getData();
//         }
//     } else {
//         console.log("No questions found in local storage. Fetching new questions");
//         getData();
//     }
// }

// Load question from localStorage
// ENCRYPTED DATA
function loadQuestions() {
    const storedEncryptedQuestions = localStorage.getItem("questions");

    if (storedEncryptedQuestions) {
        try {
            // Decrypt the questions
            const decryptedQuestions: LocalStorageQuestionsData = decryptQuestions("questions");

            // Check if there are more questions in the local storage
            if (currentAskedCount < currentTotalQuestion) {
                // console.log("log", decryptedQuestions);
                showQuestion(decryptedQuestions.results[currentAskedCount]);
            } else {
                // If no more questions in local storage, fetch new questions
                getData();
            }
        } catch (error) {
            console.error("Error decrypting questions:");
            // Handle decryption error, e.g., by fetching new questions
            getData();
        }
    } else {
        console.log("No questions found in local storage. Fetching new questions");
        getData();
    }
}

// Show question options on the screen ------------------------------------------------------------------- START
function showQuestion(data: SingleQuestion | undefined) {
    if (data) {
        currentCorrectAnswer = `${data.correct_answer}`;
        let incorrectAnswer = data.incorrect_answers;
        let optionsList = [...incorrectAnswer, currentCorrectAnswer];
        shuffleArray(optionsList);

        // use switch
        if (category) {
            category.textContent = `${data.category}`;
        }
        if (difficulty) {
            difficulty.textContent = `${data.difficulty}`;
        }
        if (question) {
            question.textContent = `${data.question}`;
        }

        // Clear existing options
        if (questionOptions) {
            questionOptions.innerHTML = "";
        }

        // Create and append new options/answers
        optionsList.forEach((option, index) => {
            const li = document.createElement("li");
            li.textContent = `${index + 1}. ${option}`;
            if (questionOptions) {
                questionOptions.appendChild(li);
            }
        });
        selectAnswers();
    }
}

// Helper function to shuffle an array with answers
function shuffleArray(array: string[]) {
    array.sort(() => Math.random() - 0.5);
}
// Show question options on the screen ------------------------------------------------------------------- END

// Adding class="selected" for the chosen element
function selectAnswers() {
    const answerElements = questionOptions?.querySelectorAll("li");

    answerElements?.forEach((answerElement) => {
        answerElement.addEventListener("click", () => {
            // Remove the "selected" class from all previously selected options
            answerElements.forEach((element) => {
                element.classList.remove("selected");
            });

            // Add the "selected" class to the clicked option
            answerElement.classList.add("selected");
        });
    });
}

// Answer checking
function checkAnswer() {
    const selectedOption = questionOptions?.querySelector("li.selected");

    if (selectedOption) {
        if (checkBtn) {
            checkBtn.disabled = true; // Disable the button to prevent multiple clicks
        }
        const selectedAnswer = selectedOption?.textContent?.replace(/^\d+\.\s/, "").trim();

        // console.log("Selected Answer:", selectedAnswer);
        // console.log("Correct Answer:", currentCorrectAnswer);

        if (selectedAnswer === currentCorrectAnswer) {
            currentCorrectScore++;
            showResult(true, `Correct Answer!`);
        } else {
            showResult(false, `Incorrect answer! The correct answer is: ${currentCorrectAnswer}`);
        }

        currentAskedCount++;
        checkCount();
        // Re-enable the button
        if (checkBtn) {
            checkBtn.disabled = false;
        }
    } else {
        showResult(false, `Please select an option!`);
    }
}

// export const checkAnswerNew = () => {
//     const selectedOption = questionOptions?.querySelector("li.selected");

//     if (selectedOption) {
//         if (checkBtn) {
//             checkBtn.disabled = true; // Disable the button to prevent multiple clicks
//         }
//         const selectedAnswer = selectedOption?.textContent?.replace(/^\d+\.\s/, "").trim();

//         // console.log("Selected Answer:", selectedAnswer);
//         // console.log("Correct Answer:", currentCorrectAnswer);

//         if (selectedAnswer === currentCorrectAnswer) {
//             currentCorrectScore++;
//             showResult(true, `Correct Answer!`);
//         } else {
//             showResult(false, `Incorrect answer! The correct answer is: ${currentCorrectAnswer}`);
//         }

//         currentAskedCount++;
//         checkCount();
//         // Re-enable the button
//         if (checkBtn) {
//             checkBtn.disabled = false;
//         }
//     } else {
//         showResult(false, `Please select an option!`);
//     }
// };

// Show result information
function showResult(isCorrect: boolean, message: string) {
    // console.log("showResult called");
    result.innerHTML = `<p><i class="fas ${isCorrect ? "fa-check" : "fa-times"}"></i>${message}</p>`;
}

// * Check count and end quiz if needed * -------------------------------------------------------------------  START
// --- Main function ---
function checkCount() {
    setCount();
    showCheckButton();

    if (isQuizComplete()) {
        handleQuizCompletion();
    } else {
        setTimeout(loadNextQuestion, 500);
    }
}
// --- Main function ---

// -- Functions helpers --
function showCheckButton() {
    if (checkBtn) {
        checkBtn.style.display = "block";
    }
}

function isQuizComplete() {
    return currentAskedCount === currentTotalQuestion;
}

function handleQuizCompletion() {
    const scoreMessage = getScoreMessage();
    result.innerHTML += scoreMessage;

    storeCurrentScore();
    showQuizOutcomeButtons();
}

// Function helpers on handleQuizCompletion
function getScoreMessage() {
    if (currentCorrectScore >= 7) {
        return `<p>Your score is ${currentCorrectScore}. <i class="fa-regular fa-face-grin-stars"></i>`;
    } else if (currentCorrectScore >= 4) {
        return `<p>Your score is ${currentCorrectScore}. <i class="fa-regular fa-face-smile-wink"></i></p>`;
    } else {
        return `<p>Your score is ${currentCorrectScore}. <i class="fa-regular fa-face-sad-tear"></i></i></p>`;
    }
}

function storeCurrentScore() {
    // Encrypt currentCorrectScore
    encryptScore("currentCorrectScore", JSON.stringify(currentCorrectScore));
    // localStorage.setItem("currentCorrectScore", JSON.stringify(currentCorrectScore));

    const wrongAnswers = selectAmount - currentCorrectScore;
    encryptScore("wrongAnswers", JSON.stringify(wrongAnswers));
    // localStorage.setItem("wrongAnswers", JSON.stringify(wrongAnswers));
}

function showQuizOutcomeButtons() {
    if (playAgainBtn) {
        playAgainBtn.style.display = "block";
    }
    if (checkBtn) {
        checkBtn.style.display = "none";
    }
    if (downloadResults) {
        downloadResults.style.display = "block";
    }
}
// Function helpers on handleQuizCompletion

function loadNextQuestion() {
    loadQuestions();
}
// -- Functions helpers --
// * Check count and end quiz if needed * -------------------------------------------------------------------  END

// Set count in the UI
function setCount() {
    if (totalQuestion) {
        totalQuestion.textContent = `${currentAskedCount}/${currentTotalQuestion}`;
    }
}

// * Restart the quiz * ------------------------------------------------------------------- START
// --- Main function ---
function restartQuiz() {
    resetQuizState();
    displayButtonsAfterRestart();
    setCount();
    getData();

    // Fetch new fun facts
    fetchFunData()
        .then((funData) => {
            if (funData) {
                // Update the stored fun data
                // const storedFunData = funData;

                // Display a random fun fact
                // displayRandomFunFact(storedFunData);
                displayRandomFunFact(funData);
            } else {
                console.error("Failed to fetch fun data");
            }
        })
        .catch((error) => {
            console.error(error);
        });

    hideDownloadResultButton();
    clearLocalStorage();
}

// --- Main function ---

// -- Functions helpers --
function resetQuizState() {
    currentCorrectScore = currentAskedCount = 0;
    if (playAgainBtn) {
        playAgainBtn.style.display = "none";
    }
    if (checkBtn) {
        checkBtn.style.display = "block";
        checkBtn.disabled = false;
    }
}

function displayButtonsAfterRestart() {
    if (downloadResults) {
        downloadResults.style.display = "none";
    }
}

function clearLocalStorage() {
    const keysToClear = ["question", "selectAmount", "selectDifficulty", "selectedCategory", "currentCorrectScore", "wrongAnswers"];

    keysToClear.forEach((key) => {
        localStorage.removeItem(key);
    });
}
// -- Functions helpers --
// * Restart the quiz * ------------------------------------------------------------------- END

// * Download function * ------------------------------------------------------------------- START
const worker = new Worker(new URL("./worker.ts", import.meta.url));

downloadResults?.addEventListener("click", () => {
    const selectAmountRaw = localStorage.getItem("selectAmount");
    const selectedCategoryRaw = localStorage.getItem("selectedCategory");
    const selectDifficultyRaw = localStorage.getItem("selectDifficulty");

    const selectAmount = selectAmountRaw ? JSON.parse(selectAmountRaw) : "0";
    const wrongAnswers = decryptScore("wrongAnswers");
    const selectedCategory = selectedCategoryRaw ? JSON.parse(selectedCategoryRaw) : "defaultCategory";
    const selectDifficulty = selectDifficultyRaw ? JSON.parse(selectDifficultyRaw) : "defaultDifficulty";
    const currentCorrectScore = decryptScore("currentCorrectScore");

    // const selectAmount = (JSON.parse(localStorage.getItem("selectAmount");
    // const wrongAnswers = JSON.parse(localStorage.getItem("wrongAnswers"));
    // const selectedCategory = JSON.parse(localStorage.getItem("selectedCategory"));
    // const selectDifficulty = JSON.parse(localStorage.getItem("selectDifficulty"));
    // const currentCorrectScore = JSON.parse(localStorage.getItem("currentCorrectScore"));

    worker.onmessage = (e) => {
        const blob = e.data;
        const link = document.createElement("a");
        link.href = URL.createObjectURL(blob);
        link.download = "QuizResults.zip";
        link.click();
    };
    worker.postMessage({
        currentCorrectScore,
        selectAmount,
        wrongAnswers,
        selectedCategory,
        selectDifficulty,
    });
});
// * Download function * ------------------------------------------------------------------- END
