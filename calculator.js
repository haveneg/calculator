const Interpreter = require('calc-lang');
const interpreter = new Interpreter(); //sets up the calculator interpreter


let textinput = document.getElementById("textinput"); //main text input box
let result = 0; //main result variable

let numButtons = document.querySelectorAll(".num"); //number buttons
let operButtons = document.querySelectorAll(".oper"); //operator buttons


//initialize keys
let enterButton = document.getElementById("enter");
enterButton.addEventListener("click", main);

let clearButton = document.getElementById("clearButton");
clearButton.addEventListener("click", ac);

let delButton = document.getElementById("delButton");
delButton.addEventListener("click", del);

numButtons.forEach((button) => { //adds each number to the text box when it is clicked
    button.addEventListener("click", () => {
        textinput.value += button.value.trim();
    });
});

operButtons.forEach((button) => { //adds an operator to the text box when it is clicked
    button.addEventListener("click", () => {
        textinput.value += button.value.trim();
    });
});

document.addEventListener("keypress", (event) => { //uses the enter key to run the main function
    if (event.key == "enter") {
        main();
    }
})

function main() { //main function that interprets the expression and spits out an answer with the package
    
    result = interpreter.run(textinput.value); //runs the expression through  the interpreter
    textinput.value = result; //prints the result to the text box
}

function ac() {
    textinput.value = ""; //clears the text input box
}

function del() {
    textinput.value = textinput.value.slice(0, -1); //backspace for the text input box
}