import auth from "./auth/auth";
import games from "./games/games";
//import your api endpoint group here

export default { auth, games }; //end then export it within this default object

//this way you will be able to use api in your code like :
//import api from "api"
//api.auth.login({email: "user@example.com", password: "qwerty123"})
