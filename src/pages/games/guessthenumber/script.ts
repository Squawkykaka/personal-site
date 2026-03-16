import { getUser } from "./firebase";

let loginSection = document.getElementById("LoginSection") as HTMLElement;
let lobbySection = document.getElementById("LobbySection") as HTMLElement;
let createlobbyElement = document.getElementById("createLobby") as HTMLButtonElement;
let joinlobbyElement = document.getElementById("joinLobby") as HTMLButtonElement;
let signupFormElement = document.getElementById("signupForm") as HTMLFormElement;

createlobbyElement.onclick = (event) => {
  event.preventDefault();
  signupFormElement.hidden = false;
  let user = getUser();
  if (user) {
    loginSection.hidden = true;
    lobbySection.hidden = false;
  } else {
    loginSection.hidden = false;
    lobbySection.hidden = true;
  }
};
