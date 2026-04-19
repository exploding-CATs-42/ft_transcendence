import { Route, Routes } from "react-router-dom";
import { lazy } from "react";

import "./styles/global.css";

// import { PrivateRoute, PublicRoute } from "./routes";
import { Layout } from "./components";

const HomePage = lazy(() => import("./pages/HomePage/HomePage.jsx"));
const ProfilePage = lazy(() => import("./pages/ProfilePage/ProfilePage.jsx"));
const GamePage = lazy(() => import("./pages/GamePage/GamePage.jsx"));
const NotFoundPage = lazy(() => import("./pages/NotFoundPage/NotFoundPage.js"));
const LoginPage = lazy(() => import("./pages/LoginPage/LoginPage.js"));

function App() {
  return (
    <Routes>
      <Route path="/" element={<Layout />}>
        <Route index element={<HomePage />} />
        <Route path="profile" element={<ProfilePage />}></Route>
        <Route path="game" element={<GamePage />}></Route>
        <Route path="login" element={<LoginPage />}></Route>
        <Route path="*" element={<NotFoundPage />} />
      </Route>
    </Routes>
  );
}

export default App;
