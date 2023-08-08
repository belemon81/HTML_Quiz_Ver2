// TODO(you): Write the JavaScript necessary to complete the assignment. 

const introduction_page = document.querySelector('#introduction');
const attempt_page = document.querySelector('#attempt-quiz');
const review_page = document.querySelector('#review-quiz');
const header = document.querySelector('header');

header.scrollIntoView();
attempt_page.classList.add('hidden');
review_page.classList.add('hidden');
const button1 = introduction_page.querySelector('#btn-start');
button1.addEventListener('click', startQuiz);

async function startQuiz() {
    const response = await fetch("http://localhost:3000/attempts/", {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        }
    });
    const json = await response.json();
    onInit(json);
    introduction_page.classList.add('hidden');
    attempt_page.classList.remove('hidden');
    header.scrollIntoView();
}

function onInit(json) {
    const DATA = json;
    attempt_page.innerHTML = ''; 

    const form = document.createElement('form');
    form.id = DATA._id;
    form.method = 'POST';
    form.action = "http://localhost:3000/attempts";
    form.target = '_self';

    for (let i = 0; i < DATA.questions.length; i++) {
        const pack = document.createElement('div');
        pack.id = DATA.questions[i]._id; 

        const question_index = document.createElement('h2');
        question_index.textContent = 'Question ' + (i + 1) + ' of ' + DATA.questions.length;
        question_index.classList.add('question-index');

        const question_text = document.createElement('p');
        question_text.textContent = DATA.questions[i].text;
        question_text.classList.add('question-text');

        const question_list = document.createElement('div');
        question_list.classList.add('list');

        for (let j = 0; j < DATA.questions[i].answers.length; j++) {
            const label = document.createElement('label');
            label.classList.add('option');
            label.addEventListener('click', chooseAnswer);

            const input = document.createElement('input');
            input.type = 'radio';
            input.name = 'question ' + i;
            input.id = 'option' + i + '-' + j;
            input.value = DATA.questions[i].answers[j];

            const content = document.createElement('span');
            content.textContent = DATA.questions[i].answers[j];

            label.for = input.id;
            label.appendChild(input);
            label.appendChild(content);

            question_list.appendChild(label);
        }

        pack.appendChild(question_index);
        pack.appendChild(question_text);
        pack.appendChild(question_list);

        form.appendChild(pack);
    }

    const submit_box = document.createElement('div');
    submit_box.id = 'box-submit';

    const submit_input = document.createElement('input');
    submit_input.id = 'btn-submit';
    submit_input.type = 'submit';
    submit_input.value = 'Submit your answers ❯';
    attempt_page.addEventListener('submit', confirmSubmission);

    submit_box.appendChild(submit_input);

    form.appendChild(submit_box);

    attempt_page.appendChild(form);
}

function chooseAnswer(event) {
    const element = event.currentTarget;
    const input = element.querySelector('input');
    const name = input.name;
    const question_list = attempt_page.querySelectorAll('input[name="' + name + '"]');

    for (let question of question_list) {
        question = question.parentElement;
        question.classList.remove('option-selected');
    }
    element.classList.add('option-selected');
}

async function submitQuiz() {
    const userAnswers = {};
    const form = attempt_page.querySelector('form');
    const option_groups = form.querySelectorAll('.list');
    for (let group of option_groups) {
        const options = group.querySelectorAll('.option');
        for (let i = 0; i < options.length; i++) {
            if (options[i].classList.contains('option-selected')) {
                const pack = group.parentElement;
                userAnswers[pack.id] = i; 
                break;
            }
        }
    }

    const user_answers = {};
    user_answers.userAnswers = userAnswers;  

    const response = await fetch("http://localhost:3000/attempts/" + form.id + "/submit", {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(user_answers)
    });
    const json = await response.json();
    onSubmit(json);

    attempt_page.classList.add('hidden');
    review_page.classList.remove('hidden');
    header.scrollIntoView();
}

function confirmSubmission(event) {
    event.preventDefault();
    if (confirm('Are you sure want to finish this quiz?') === true) {
        submitQuiz();
    }
}

function onSubmit(json) {
    const DATA = json;
    review_page.innerHTML = '';
    const form = document.createElement('form');
    form.id = DATA._id;

    for (let i = 0; i < DATA.questions.length; i++) {
        const pack = document.createElement('div');
        pack.id = DATA.questions[i]._id; 

        const question_index = document.createElement('h2');
        question_index.textContent = 'Question ' + (i + 1) + ' of ' + DATA.questions.length;
        question_index.classList.add('question-index');

        const question_text = document.createElement('p');
        question_text.textContent = DATA.questions[i].text;
        question_text.classList.add('question-text');

        const question_list = document.createElement('div');
        question_list.classList.add('list');

        for (let j = 0; j < DATA.questions[i].answers.length; j++) {
            const label = document.createElement('label');
            label.classList.add('option');

            const input = document.createElement('input');
            input.type = 'radio';
            input.disabled = true;
            input.name = '$question ' + i;
            input.id = '$option' + i + '-' + j;
            input.value = DATA.questions[i].answers[j];

            const content = document.createElement('span');
            content.textContent = DATA.questions[i].answers[j];

            label.for = input.id;
            label.appendChild(input);
            label.appendChild(content);

            if (DATA.correctAnswers[pack.id] == j) {
                const option_correct = document.createElement('span');
                option_correct.classList.add('label');
                option_correct.textContent = 'Correct answer';
                label.appendChild(option_correct);
                label.classList.add('option-correct');
            }

            if ('userAnswers' in DATA && DATA.userAnswers[pack.id] !== 'undefined') {
                if (DATA.userAnswers[pack.id] == j) {
                    input.checked = true;
                    if (DATA.correctAnswers[pack.id] == j) {
                        label.classList.remove('option-correct');
                        label.classList.add('correct-answer');
                    } else {
                        const wrong_answer = document.createElement('span');
                        wrong_answer.classList.add('label');
                        wrong_answer.textContent = 'Your answer';
                        label.appendChild(wrong_answer);
                        label.classList.add('wrong-answer');
                    }
                }
            }
            question_list.appendChild(label);
        }
        pack.appendChild(question_index);
        pack.appendChild(question_text);
        pack.appendChild(question_list);

        form.appendChild(pack);
    }

    const box_result = document.createElement('div');
    box_result.id = 'box-result';

    const break_line = document.createElement('br');

    const heading = document.createElement('h2');
    heading.textContent = 'Result:';

    const score = document.createElement('p');
    score.id = 'score';
    score.textContent = DATA.score + '/' + DATA.questions.length;

    const percentage = document.createElement('p');
    const strong = document.createElement('strong');
    strong.textContent = (DATA.score / DATA.questions.length * 100) + '%';

    percentage.appendChild(strong);

    const score_text = document.createElement('p');
    score_text.textContent = DATA.scoreText;

    const try_again_btn = document.createElement('button');
    try_again_btn.id = 'btn-try-again';
    try_again_btn.textContent = 'Try again';
    review_page.addEventListener('submit', tryAgain);

    box_result.appendChild(break_line);
    box_result.appendChild(heading);
    box_result.appendChild(score);
    box_result.appendChild(percentage);
    box_result.appendChild(score_text);
    box_result.appendChild(try_again_btn);

    form.appendChild(box_result);

    review_page.appendChild(form);
}

function tryAgain(event) {
    event.preventDefault;
    review_page.classList.add('hidden');
    introduction_page.classList.remove('hidden');
    window.location.reload();
    header.scrollIntoView();
}