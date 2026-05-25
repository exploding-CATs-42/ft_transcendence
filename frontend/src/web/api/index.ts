import users from "./users/users";
import games from "./games/games";
//import your api endpoint group here

export default { games, users }; //end then export it within this default object

//this way you will be able to use api in your code like :
//import api from "api"
//api.users.login({email: "user@example.com", password: "qwerty123"})
