// Libraries
import { Route, Routes } from "react-router-dom";
import { lazy } from "react";
// Project level
// import { PrivateRoute, PublicRoute } from "routes";
import { Layout } from "components";
// Local level
import "./styles/global.css";

const HomePage = lazy(() => import("./pages/HomePage/HomePage.jsx"));
const ProfilePage = lazy(() => import("./pages/ProfilePage/ProfilePage.jsx"));
const LobbyPage = lazy(() => import("./pages/LobbyPage/LobbyPage"));
const GamePage = lazy(() => import("./pages/GamePage/GamePage.jsx"));
const NotFoundPage = lazy(() => import("./pages/NotFoundPage/NotFoundPage.js"));
const LoginPage = lazy(() => import("./pages/LoginPage/LoginPage"));
const RegisterPage = lazy(() => import("./pages/RegisterPage/RegisterPage"));
const ChatPage = lazy(() => import("./pages/ChatPage/ChatPage"));
const RulesPage = lazy(() => import("./pages/RulesPage/RulesPage"));

function App() {
  return (
    <Routes>
      <Route path="/" element={<Layout />}>
        <Route index element={<HomePage />} />
        <Route path="profile" element={<ProfilePage />} />
        <Route path="lobby" element={<LobbyPage />} />
        <Route path="game" element={<GamePage />} />
        <Route path="login" element={<LoginPage />} />
        <Route path="register" element={<RegisterPage />} />
        <Route path="chat" element={<ChatPage />} />
        <Route path="rules" element={<RulesPage />} />
        <Route path="*" element={<NotFoundPage />} />
      </Route>
    </Routes>
  );
}

export default App;
