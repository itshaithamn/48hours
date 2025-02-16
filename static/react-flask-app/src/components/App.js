import React from 'react';
import {Route, Routes} from "react-router-dom";
import Home from "./Home";
import Login from './Login';
import Signup from "./Signup";
import Scene from './Scene';

function App()  {

  return (
      <>
          <div>
          <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/Login" element={<Login />} />
              <Route path="/Signup" element={<Signup />} />
              <Route path="/Scene" element={<Scene />} />
              <Route path="/Home" element={<Home />} />
              <Route path="/login" element={<Login />} />
              <Route path="/scene" element={<Scene />} />
              <Route path="/home" element={<Home />} />
              <Route path="*" element={<h1>404 - Page Not Found</h1>} />
          </Routes>
          </div>
      </>
  );
}

export default App;
