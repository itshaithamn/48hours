import React from 'react';
import {Route, Routes} from "react-router-dom";
import Playground from "./Playground";
import Home from "./Home";


function App()  {

  return (
      <>
          <div>
              <Routes>
                  <Route path='/playground' element={<Playground />} />
                  <Route path='/' element={<Home />} />
              </Routes>
          </div>
      </>
  );
}

export default App;