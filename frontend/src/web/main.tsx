// Libraries
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
// Project level
import { AuthProvider, SocketProvider } from "context";

import App from "./App";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <AuthProvider>
    <SocketProvider>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </SocketProvider>
  </AuthProvider>,
);
