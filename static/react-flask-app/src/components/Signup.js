import React from 'react';
 import TextField from '@mui/material/TextField';
 import LockIcon from '@mui/icons-material/Lock';
 import PersonIcon from '@mui/icons-material/Person';
 import { Button } from '@mui/material';
 import homeStyles from './Home.module.css'
 import login from './Login.module.css'
import "./global.css"
import {Link} from "react-router-dom";
import HomeIcon from "@mui/icons-material/Home";

 function Signup() {
    return (
        <>
            <div className={homeStyles.App}>
                <header>
                    <h1>Leak Test </h1>
                    <Link to="/home" style={{textDecoration: 'none'}}>
                        <HomeIcon style={{fontSize: 50, top: 6}}/>
                    </Link>
                </header>
                <div className={login.loginContainer}>
                    <h1>Login Here</h1>
                    <div className={login.Row}>
                        <PersonIcon/>
                        <TextField id="outlined-basic" label="Username" variant="outlined"/>
                    </div>
                    <div className={login.Row}>
                        <LockIcon/>
                        <TextField id="outlined-basic" label="Password" variant="outlined"/>
                    </div>
                    <div>
                        <Link to ="/">
                        <Button size='large'>Login</Button>
                        </Link>
                    </div>
                </div>
            </div>
        </>);
 }

export default Signup;