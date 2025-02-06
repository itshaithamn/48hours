import React from 'react';
 import Box from '@mui/material/Box'; 
 import TextField from '@mui/material/TextField'; 
 import LockIcon from '@mui/icons-material/Lock'; 
 import PersonIcon from '@mui/icons-material/Person'; 
 import { Button } from '@mui/material'; 
 import homeStyles from './Home.module.css'
 import login from './Login.module.css'
 
 function Login() {   
    return (    
        <div className={homeStyles.App}>
         <div className={login.logincontainer}>    
      <h1>Login here</h1>     
       <div className={login.Row}>       
         <PersonIcon/>        
          <TextField id="outlined-basic" label="Username" variant="outlined" />    
              </div>      
                <div className={login.Row}>  
                       <LockIcon/>        
                        <TextField id="outlined-basic" label="Password" variant="outlined" />       
                          </div>         <Button size='large' 
                                   >Login</Button>   
                  </div>  
                  </div>
                           ); } 
                           
                            export default Login;