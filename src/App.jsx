import React,{useState} from "react";
import {BrowserRouter,Routes,Route} from "react-router-dom";
import Home from "./Home";
import Header from "./Header";
import Footer from "./Footer";

export default function App(){
  const [user, setUser] = useState(null);

  return(
    <BrowserRouter>
    <Header user={user}/>
    <Routes>
      <Route path="/" element={<Home/>}/>
    </Routes>
    <Footer />
    </BrowserRouter>
  );
}