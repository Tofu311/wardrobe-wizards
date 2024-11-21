// import reactLogo from "./assets/react.svg";
// import viteLogo from "/vite.svg";
// import "./App.css";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import LoginPage from "./pages/LoginPage";
import UserCloset from "./pages/UserCloset";
import Outfits from "./pages/Outfits";
import MyAccount from "./pages/MyAccount";

function App() {
  //const [count, setCount] = useState(0);

  // path ='/' to be changed to home page direct if user is logged in
  return (
    <Router>
      <Routes>
        <Route path="/" element={<LoginPage />} />
        <Route path="/closet" element={<UserCloset />} />
        <Route path="/outfits" element={<Outfits />} />
        <Route path="/account" element={<MyAccount />} />
      </Routes>
    </Router>
  );
}

export default App;
