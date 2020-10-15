import './home.css';
import * as aria from '../../utils/aria.js';

const logInScreenElements = {
    username: {
        elementType: "input",
        type: "text", 
        classList: "authentication-input",
        id: 'authentication-username',
        attributes: {
            title: "username",
            placeholder: "Enter Username",
            maxlength: 15
        }
    },
    password: {
        elementType: "input",
        type: "password",
        classList: "authentication-input",
        id: "authentication-password",
        attributes: {
            title: "password",
            placeholder: "Enter Password",
            maxlength: 15
        }
    },
    submit: {
        elementType: "button",
        type: "button",
        classList: "authentication-button",
        id: "authentication-submit",
        text: "Submit",
        clickCallback: ()=>{
            let usernameVal = document.getElementById("authentication-input").value;
            let password = document.getElementById("authentication-password").value;
            let postOptions = {
                url: "this/will/be/a/auth/URL",
                data: {
                    user: usernameVal,
                    pw: password
                }
            };

            // postOptions --send
            console.log(postOptions);
        }
    },
    create: {
        elementType: "a",
        classList: "login-link",
        text: "Create User",
        clickCallback: ()=>{

        }
        

    }
}

const BuildLogInScreen = ()=>{
    let app = document.getElementById("app");
    let logInElements = document.createElement("section")

    Object.keys(logInScreenElements).map(el=>{
        let elOptions = logInScreenElements[el];
        let node = document.createElement(elOptions.elementType);
        node.type = elOptions.type;
        node.classList = elOptions.classList;
        node.id = elOptions.id;
        if (elOptions.attributes) {
            Object.keys(elOptions.attributes).map(attr=>{
                let value = elOptions.attributes[attr];
                node.setAttribute(attr, value);
    
            });
        }
        node.text =  elOptions.text ? elOptions.text : undefined;

        if (elOptions.clickCallback) node.onclick = () => elOptions.clickCallback();

        logInElements.appendChild(node);
    })

    app.append(logInElements);
}

export default class LogIn{
    constructor(){
        this.render();
    }

    render(){
        BuildLogInScreen();
    }
}