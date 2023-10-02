function checkAnswers() {
    const questions = document.querySelectorAll('.question');

    let userAnswers = {
        'questions': []
    };

    questions.forEach((question, index) => {
        const questionText = question.querySelector('.question-header').textContent.split('.'[0])[1].trim();
        const type = question.getAttribute('data-type');
        let questionData = {
            'type': type,
            'question': questionText,
            'answers': []
        };

        if (type === 'text') {
            const answerText = question.querySelector('.text-answer input').value;
            questionData.answers.push({
                'answer': answerText,
            });
        } else {
            const answers = question.querySelectorAll('.answers div');
            answers.forEach((answer, index) => {
                const answerInput = answer.querySelector('input[type="radio"], input[type="checkbox"]');
                if (answerInput.checked) {
                    const answerText = answer.querySelector('label').textContent.trim();
                    questionData.answers.push({
                        'answer': answerText,
                    });
                }
            });
        }
        userAnswers.questions.push(questionData);
    });

    $.ajax({
        url: '/compare_answers',
        type: 'POST',
        contentType: 'application/json',
        data: JSON.stringify({name: localStorage.getItem("name"), surname:localStorage.getItem("surname"), userAnswers: userAnswers, quizUrl: window.location.href}),
        success: function (data) {
            alert(`Your score is ${data.score}/${Object.keys(data.results).length}`);

            data.results.forEach(function (result, index) {
                let questionElement = document.querySelector('.question:nth-child(' + (index + 1) + ')');
                if (result.status === "correct") {
                    if (questionElement.getAttribute('data-type') === 'text') {
                        let textInput = questionElement.querySelector('input[type="text"]');
                        if (textInput) {
                            textInput.classList.add('correct-answer');
                        }
                    }
                    else {
                        result.correct_answer.forEach(function (answer) {
                            let answerInput = questionElement.querySelector('input[value="' + answer + '"]');
                            if (answerInput) {
                                answerInput.parentElement.classList.add('correct-answer');
                            }
                        });
                    }
                }
                else {
                    if (questionElement.getAttribute('data-type') === 'text') {
                        let textInput = questionElement.querySelector('input[type="text"]');
                        if (textInput) {
                            textInput.classList.add('bad-answer');
                        }
                    }
                    else {
                        result.user_answer.forEach(function (answer) {
                            let answerInput = questionElement.querySelector('input[value="' + answer + '"]');
                            if (answerInput) {
                                answerInput.parentElement.classList.add('bad-answer');
                                if (result.correct_answer.indexOf(answer) !== -1) {
                                    answerInput.parentElement.classList.remove('bad-answer');
                                    answerInput.parentElement.classList.add('correct-answer');
                                }
                            }
                        });
                    }
                }
            });
        }
    });
}