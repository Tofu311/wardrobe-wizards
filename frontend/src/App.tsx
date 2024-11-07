import { useState } from "react";
import { useNavigate } from "react-router-dom";
// import reactLogo from "./assets/react.svg";
// import viteLogo from "/vite.svg";
// import "./App.css";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import LoginPage from "../pages/LoginPage";
import { Button } from "./components/ui/button";
function App() {
  //const [count, setCount] = useState(0);

  // path ='/' to be changed to home page direct if user is logged in
  return (
    <Router>
      <Routes>
        <Route path="/" element={<LoginPage />} />
        <Route
          path="/closet"
          element={
            <div>
              <h2 className="text-3xl">Closet</h2>
              <Button
                onClick={() => {
                  window.location.href = "/";
                }}
              >
                Sign Out
              </Button>
            </div>
          }
        />
      </Routes>
    </Router>
  );
}

export default App;
