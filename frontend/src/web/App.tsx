// Libraries
import { Route, Routes } from "react-router-dom";
import { lazy } from "react";
// Project level
import { PrivateRoute, AuthRoute } from "routes";
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
const AboutPage = lazy(() => import("./pages/AboutPage/AboutPage"));

function App() {
  return (
    <Routes>
      <Route path="/" element={<Layout />}>
        {/* Public routes */}
        <Route index element={<HomePage />} />
        <Route path="rules" element={<RulesPage />} />
        <Route path="about" element={<AboutPage />} />

        {/* Login/Register routes */}
        <Route element={<AuthRoute />}>
          <Route path="login" element={<LoginPage />} />
          <Route path="register" element={<RegisterPage />} />
        </Route>

        {/* Private routes */}
        <Route element={<PrivateRoute />}>
          <Route path="profile" element={<ProfilePage />} />
          <Route path="lobby" element={<LobbyPage />} />
          <Route path="game" element={<GamePage />} />
          <Route path="chat" element={<ChatPage />} />
        </Route>

        {/* Unknown routes */}
        <Route path="*" element={<NotFoundPage />} />
      </Route>
    </Routes>
  );
}

export default App;
