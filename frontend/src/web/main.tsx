// Libraries
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
// Project level
import { AuthProvider } from "context";

import App from "./App";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <AuthProvider>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </AuthProvider>,
);
