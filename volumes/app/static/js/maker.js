$(document).ready(function () {
    // Get references to various elements in the HTML document.
    const questionTypeSelect = document.getElementById("question-type");
    const addQuestionButton = document.getElementById("add-question");
    const questionsContainer = document.getElementById("questions-container");
    const generateButton = document.getElementById('generate-button');
    let questionCounter = 0;

    // Add an event listener to the "Add Question" button.
    addQuestionButton.addEventListener("click", addQuestion);

    // Add an event listener to the "Generate" button.
    generateButton.addEventListener('click', function(event) {
        // Prevent the default form submission behavior.
        event.preventDefault();

        // Call your JavaScript function here.
        generateFile();

        // Submit the form programmatically.
        document.getElementById('quiz-form').submit();
    });

    // Function to add a new question.
    function addQuestion() {
        // Determine the selected question type.
        const selectedType = questionTypeSelect.value;
        questionCounter++;

        // Create a new question element based on the selected type.
        const questionElement = document.createElement("div");
        questionElement.classList.add("question");
        questionElement.setAttribute('data-type', selectedType);

        // For multiple-choice questions, create the HTML structure.
        // Allow adding multiple answers and removing questions.
        // Also, add event listeners for answer addition and removal.
        if (selectedType === "unique" || selectedType === "multiple") {
            const questionText = selectedType === "unique" ? "Single answer :" : "Multiple answer :";
            questionElement.innerHTML = `
                <div class="question-header">
                    <div style="display:flex;">
                        <span class="question-number">${questionCounter}.</span>
                        <label style="margin-left: 10px;">${questionText}</label>
                    </div>
                    <input type="text" placeholder="Question" required>
                    <button type="button" class="add-answer">Add an answer</button>
                </div>
                <div class="answers"></div>
                <a href="#" class="remove-question"><i class="bi bi-trash" style="color: red;"></i></a>
            `;
            
            const answersContainer = questionElement.querySelector(".answers");

            const addAnswerButton = questionElement.querySelector(".add-answer");         
            addAnswerButton.addEventListener("click", addAnswer);

            function addAnswer() {
                const answerDiv = document.createElement("div");
                const answerLabel = String.fromCharCode(65 + answersContainer.childElementCount);
                answerDiv.innerHTML = `
                    <input type="text" placeholder="Answer ${answerLabel}" required>
                    <input type="${selectedType === "unique" ? "radio" : "checkbox"}" name="question-${questionCounter}">
                    <button type="button" class="remove-answer">-</button>
                `;

                const removeAnswerButton = answerDiv.querySelector(".remove-answer");
                removeAnswerButton.addEventListener("click", function () {
                    answerDiv.remove();
                });

                answersContainer.appendChild(answerDiv);
            }

            const removeQuestionButton = questionElement.querySelector(".remove-question");
            removeQuestionButton.addEventListener("click", function () {
                questionElement.remove();
                updateQuestionNumbers();
                questionCounter--;
            });
        }

        // For text-based questions, create the HTML structure.
        // Allow specifying a correct answer and removing questions.
        // Also, add event listeners for question removal.
        if (selectedType === "text") {
            questionElement.innerHTML = `
                <div class="question-header">
                    <div style="display:flex;">
                        <span class="question-number">${questionCounter}.</span>
                        <label style="margin-left: 10px;">Text answer :</label>
                    </div>
                    <input type="text" placeholder="Question" required>
                </div>
                <div class="text-answer">
                    <label>Correct Answer :</label>
                    <input type="text" placeholder="Correct Answer" required>
                </div>
                <a href="#" class="remove-question"><i class="bi bi-trash" style="color: red;"></i></a>
            `;

            const removeQuestionButton = questionElement.querySelector(".remove-question");
            removeQuestionButton.addEventListener("click", function () {
                questionElement.remove();
                updateQuestionNumbers();
                questionCounter--;
            });
        }

        // Append the question element to the questions container.
        questionsContainer.appendChild(questionElement);

        // Update question numbers
        function updateQuestionNumbers() {
            const questionNumbers = questionsContainer.querySelectorAll('.question-number');
            questionNumbers.forEach((number, index) => {
                number.textContent = index + 1 + ".";
            });
        }

        // Make questions draggable and add drag-and-drop functionality.
        function makeDraggable() {
            const draggableQuestions = Array.from(questionsContainer.querySelectorAll('.question'));

            draggableQuestions.forEach(question => {
                question.draggable = true;
                question.addEventListener('dragstart', () => {
                    question.classList.add('dragging');
                });
                question.addEventListener('dragend', () => {
                    question.classList.remove('dragging');
                    updateQuestionNumbers();
                });
            });

            questionsContainer.addEventListener('dragover', e => {
                e.preventDefault();
                const afterElement = getDragAfterElement(questionsContainer, e.clientY);
                const draggable = document.querySelector('.dragging');
                if (afterElement == null) {
                    questionsContainer.appendChild(draggable);
                } else {
                    questionsContainer.insertBefore(draggable, afterElement);
                }
            });

            function getDragAfterElement(container, y) {
                const draggableElements = [...container.querySelectorAll('.question:not(.dragging)')];
                return draggableElements.reduce((closest, child) => {
                    const box = child.getBoundingClientRect();
                    const offset = y - box.top - box.height / 2;
                    if (offset < 0 && offset > closest.offset) {
                        return { offset, element: child };
                    } else {
                        return closest;
                    }
                }, { offset: Number.NEGATIVE_INFINITY }).element;
            }
        }
        // Call the makeDraggable function to set up drag-and-drop functionality.
        makeDraggable();
    }

    // Function to generate a JSON and HTML file with question and answer.
    function generateFile() {
        const questions = document.querySelectorAll('.question');
        if (questions.length === 0) {
            alert("Add question before generate quiz.");
            return;
        }

        // Function to create the quiz JSON data.
        function createQuizJSON() {
            let quizData = {
                'questions': []
            };

            questions.forEach((question, index) => {
                const questionText = question.querySelector('.question-header input').value;
                const type = question.getAttribute('data-type');
                let questionData = {
                    'type': type,
                    'question': questionText,
                    'answers': []
                };

                if (type === 'text') {
                    const correctAnswer = question.querySelector('.text-answer input').value;
                    questionData.answers.push({
                        'answer': correctAnswer,
                        'isCorrect': true
                    });
                } else {
                    const answers = question.querySelectorAll('.answers div');
                    answers.forEach((answer, answerIndex) => {
                        const answerText = answer.querySelector('input[type="text"]').value;
                        const isCorrect = answer.querySelector('input[type="radio"], input[type="checkbox"]').checked;
                        questionData.answers.push({
                            'answer': answerText,
                            'isCorrect': isCorrect
                        });
                    });
                }
                quizData.questions.push(questionData);
            });
            return quizData;
        }

        // Get the quiz JSON data.
        const quizData = createQuizJSON();
        $('#quiz-json-data').val(JSON.stringify(quizData));

        // Function to create the quiz HTML data.
        function createQuizHTML() {
            let htmlContent = `
                <!DOCTYPE html>
                <html lang="en">
                <head>
                    <meta charset="UTF-8">
                    <meta name="viewport" content="width=device-width, initial-scale=1.0">
                    <title>Quiz</title>
                    <link rel="stylesheet" href="static/css/quiz.css" media="screen">
                    <script src="static/plugins/jquery/jquery.js"></script>
                    <script src="static/js/quiz.js"></script>
                </head>
                <body>
                <form id="quiz">
            `;

            questions.forEach((question, index) => {
                const questionText = question.querySelector('.question-header input').value;
                const type = question.getAttribute('data-type');
                htmlContent += `
                    <div class="question" data-type="${type}">
                        <div class="question-header">${index + 1}. ${questionText}</div>
                `;

                if (type === 'text') {
                    htmlContent += `
                        <div class="text-answer">
                            <input type="text" name="question-${index}-answer">
                        </div>
                    `;
                } else {
                    htmlContent += '<div class="answers">';
                    const answers = question.querySelectorAll('.answers div');
                    answers.forEach((answer, answerIndex) => {
                        const answerText = answer.querySelector('input[type="text"]').value;
                        htmlContent += `
                            <div>
                                <label>
                                    <input type="${type === 'unique' ? 'radio' : 'checkbox'}" name="question-${index}-answers" value="${answerText}">
                                    ${answerText}
                                </label>
                            </div>
                        `;
                    });
                    htmlContent += '</div>';
                }
                htmlContent += '</div>';
            });

            htmlContent += `
                    </form>
                    <button type="button" onclick="checkAnswers()">Send</button>
                </body>
                </html>
            `;
            return htmlContent;
        }

        // Get the quiz HTML data.
        const htmlContent = createQuizHTML();
        $('#quiz-html-data').val(htmlContent);
    }
});