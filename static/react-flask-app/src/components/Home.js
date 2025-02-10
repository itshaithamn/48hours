import React from 'react';
import { Link } from 'react-router-dom';
import {Button} from '@mui/material';
import HomeIcon from '@mui/icons-material/Home';
import './global.css'
import homeStyles from './Home.module.css';

const Home = () => {
    const sendData = async () => {
    const data = { key1: "value1", key2: "value2" };  // Example data

    try {
        const response = await fetch('http://127.0.0.1:5000/receive_data', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });

        const result = await response.json();
        console.log("Server Response:", result);
    } catch (error) {
        console.error("Error sending data:", error);
    }};


  return (
      <>
          <div className={homeStyles.App}>
              <header>
                  <h1>Leak Test </h1>
                  <Link to="/Home"  style={{ textDecoration: 'none' }}>
                    <HomeIcon style={{fontSize: 50, top: 6}}/>
                  </Link>
              </header>
              <div className={homeStyles.divCta}>
                  <p className={homeStyles.centeredText}>Discover the features of our leak tester <br/> and start testing your system now.</p>
                  <div>
                      <Link to="/Login" style={{textDecoration: 'none'}}>
                          <Button style={{
                              fontSize: 30, color: 'white',
                              backgroundColor: '#282c34',
                              borderRadius: 15,
                              cursor: 'pointer',
                              margin: '2rem'
                          }}>Log In Here</Button>
                      </Link>
                  </div>
              </div>
          </div>
      </>
  )
}

export default Home;