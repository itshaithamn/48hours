import React, { useState} from 'react';
 import TextField from '@mui/material/TextField';
 import LockIcon from '@mui/icons-material/Lock';
 import PersonIcon from '@mui/icons-material/Person';
 import { Button } from '@mui/material';
 import homeStyles from './Home.module.css'
 import login from './Login.module.css'
import "./global.css"
import {Link, useNavigate} from "react-router-dom";
import HomeIcon from "@mui/icons-material/Home";

 function Signup() {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [password_confirm, setPassword_confirm] = useState("");
    const [error, setError] = useState("");
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            const response = await fetch("http://127.0.0.1:5000/register", {
                method: "POST",
                headers: {"Content-Type": "application/json"},
                body: JSON.stringify({username, password, password_confirm}),
            });

            const data = await response.json();

            if (response.ok) {
                alert("Registration successful!");
                navigate("/home"); // Go back to home on Success
            } else {
                setError(data.message || "Invalid Credentials");
            }

        } catch (error) {
            setError("Error connecting to the server");
            console.error("Error:", error)
        }
    }



     return (
        <>
            <div className={homeStyles.App}>
                <header>
                    <h1>Spl@sh</h1>
                    <Link to="/home" style={{textDecoration: 'none'}}>
                        <HomeIcon style={{fontSize: 50, top: 6}}/>
                    </Link>
                </header>


                <div className={login.loginContainer}>
                    <h1>Sign Up Here</h1>
                    <form onSubmit={handleSubmit}>
                        <div className={login.Row}>
                            <PersonIcon />
                            <TextField
                                id="username"
                                required
                                label="Username"
                                variant="outlined"
                                value={username}
                                onChange={(e)=>setUsername(e.target.value)}
                            />
                        </div>

                        <div className={login.Row}>
                            <LockIcon />
                            <TextField
                                id="password"
                                type="password"
                                required
                                label="Password"
                                variant="outlined"
                                value={password}
                                onChange={(e)=> setPassword(e.target.value)}
                            />
                        </div>

                        <div className={login.Row}>
                            <LockIcon />
                            <TextField
                                id="password_confirm"
                                type="password"
                                required
                                label="Retype Password"
                                variant="outlined"
                                value={password_confirm}
                                onChange={(e)=> setPassword_confirm(e.target.value)}
                            />
                        </div>

                        <Button type="submit" size="large">Login</Button>

                        {error && <p style={{ color: "red" }}>{error}</p>}
                    </form>
                </div>
            </div>
        </>);
 }

export default Signup;