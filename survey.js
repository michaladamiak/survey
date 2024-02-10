const API_KEY = '';

const submitButton = document.querySelector('#submit');
const outputElement = document.querySelector('.output');
const inputElement = document.querySelector('input');
const info = document.querySelector('.info');

let category = '';
let subcategores = '';
let stage = 'category';
let selectedCategories = [];
let numberOfQuestions = 0;
let answers = [];
let history = [];

function nextStage() {
    switch (stage) {
        case 'category':
            category = inputElement.value;
            inputElement.value = '';
            info.innerHTML = 'Provide subcategories separated by commas.';
            stage = 'subcategory';
            break;
        case 'subcategory':
            subcategories = inputElement.value;
            inputElement.value = '';
            info.innerHTML = 'Provide number of questions for a survey and select desired categories.';
            const subcategoriesList = subcategories.split(", ");
            subcategoriesList.forEach(sub => {
                addSubcategory(sub);
            });
            stage = 'survey';
            break;
        case 'survey':
            if (selectedCategories.length>0 && !isNaN(inputElement.value)) {
                numberOfQuestions = inputElement.value;
                inputElement.value = '';
                outputElement.innerHTML = '';
                info.innerHTML = 'Generating questions...';
                history.push({role: "system", content: `You are researcher that wants to get deep understanding of certain people by asking them complex questions. Create a survey containing a list of questions in area of ${category}. Take into account topics such as: ${selectedCategories}. As an answer provide only one list of exactly ${numberOfQuestions} questions without dividing them into subcategories. Skip the introduction. Separate each question with ; sign.`})
                getQuestions();
                stage = 'questions';
            }
            break;
        case 'questions':
            answers.push(inputElement.value)
            history.push({role: "user", content: inputElement.value});
            inputElement.value = '';
            if(listOfQuestions.length > 0){
                info.innerHTML = listOfQuestions.shift();
                history.push({role: "assistant", content: info.innerHTML});
            } else {
                info.innerHTML = 'Generating result...';
                history.push({role: "system", content: `Based on users answers create their detailed description in area of selected category. Try to incorporate some valuable advice. Addres them drictly. Description should use around 150 completion_tokens.`})
                stage = 'result';
                getQuestions();
            }
            break;
    }
}

function addSubcategory(text) {
    let p = document.createElement("p");
    p.innerHTML = text;
    outputElement.append(p);
    p.addEventListener('click', () => {
        if(selectedCategories.includes(p.innerHTML)) {
            selectedCategories = selectedCategories.filter(item => item !== p.innerHTML)
            p.style.background = "#ffffff80";
        } else {
            selectedCategories.push(p.innerHTML);
            p.style.background = "#00a6ff";
        }
    })
}

submitButton.addEventListener('click', () => {
    if (inputElement.value != '') {
        nextStage();
    }
})

inputElement.addEventListener("keydown", (event) => {
    if (event.key === "Enter" && inputElement.value != '') {
      nextStage();
    }
  });

async function getQuestions() {

    const options = {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${API_KEY}`,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            model: "gpt-4",
            messages: history
        })
    }
    try {
        const response = await fetch('https://api.openai.com/v1/chat/completions', options)
        const data = await response.json()
        if (stage=='result') {
            info.innerHTML = '';
            outputElement.innerHTML = data.choices[0].message.content;
        } else {
            listOfQuestions = data.choices[0].message.content.split(";");
            info.innerHTML = listOfQuestions[0];
            history.push({role: "assistant", content: info.innerHTML});
            listOfQuestions.shift();
        }
    }
    catch (error) {
        console.error(error)
    }
}