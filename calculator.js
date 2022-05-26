let textinput = document.getElementById("textinput");
let NoN = 0;
let result = 0;
let num1 = 0;
let num2 = 0;
let oper = "";

let numButtons = document.querySelectorAll(".num");
let operButtons = document.querySelectorAll(".oper");

numButtons.forEach((button) => {
    button.addEventListener("click", () => {
        textinput.value += button.value.trim();
    });
});

operButtons.forEach((button) => {
    button.addEventListener("click", () => {
        textinput.value += button.value.trim();
    });
});

function main() {
    result = 0;
    num1 = 0;
    num2 = 0;
    oper = "";
    let inputArray = textinput.value.split("");
    let currentString = "";
    for (let i=0;i<inputArray.length;i++) {
        if (inputArray[i] !== "+" && inputArray[i] !== "-" && inputArray[i] !== "*" && inputArray[i] !== "/") {
            currentString += inputArray[i];
        } else {
            if (NoN == 0) {
                num1 = Number(currentString);
            }
            oper = inputArray[i];
            currentString = "";
            NoN = 1;
        }
    }
    NoN = 0;
    num2 = Number(currentString);
    
    if (oper == "+") {
        result = num1 + num2;
    } else if (oper == "-") {
        result = num1-num2;
    } else if (oper == "*") {
        result = num1 * num2;
    } else if (oper == "/") {
        result = num1/num2;
    }
    textinput.value = result;
}

function ac() {
    textinput.value = "";
}

function del() {
    textinput.value = textinput.value.slice(0, -1);
}