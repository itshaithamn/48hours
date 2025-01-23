import React, { useState } from 'react';
import {Button, GlobalStyles} from '@mui/material';
import HomeIcon from '@mui/icons-material/Home';
import './global.css'
import styles from './Home.module.css';
 import Navbar from './Navbar'

const Home = () => {
  return (
      <>
          <div className={styles.App}>
              <Navbar />
              <header>
                  <h1>Leak Test </h1>
                  <HomeIcon style={{fontSize: 50, top: 6}}/>
              </header>
              <div className={styles.divCta}>
                  <p className={styles.centeredText}>Discover the features of our leak tester <br/> and start testing
                      your system now.</p>
                  <div>
                      <Button style={{
                          fontSize: 30,                          color: 'white',
                          backgroundColor: '#282c34',
                          borderRadius: 15,
                          cursor: 'pointer',
                          margin: '2rem'
                      }}>Log In Here</Button>
                      <Button style={{
                          fontSize: 30,
                          color: 'white',
                          backgroundColor: '#282c34',
                          borderRadius: 15,
                          cursor: 'pointer',
                          margin: '2rem'
                      }}>Sign Up Here</Button>
                  </div>
              </div>
          </div>
      </>
  )
}

export default Home;