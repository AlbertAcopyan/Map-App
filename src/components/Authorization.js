import PersonIcon from "@mui/icons-material/Person";
import { Box, Button, CardActions, CardContent, Input } from "@mui/material";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
} from "firebase/auth";
import React, { useEffect, useState } from "react";
import { auth } from "../firebase";
import Popup from "./Popup";

const Authorization = ({ userLogged }) => {
  const [tab, setTab] = useState("login");
  const [login, setLogin] = useState("");
  const [password, setPassword] = useState("");
  const [user, setUser] = useState(null);
  const [errorMessage, setErrorMessage] = useState(false);
  const [fullName, setFullName] = useState("");

  const handleLoginTab = () => {
    setTab("login");
  };

  const handleRegisterTab = () => {
    setTab("register");
  };

  const handleRegister = async () => {
    try {
      const user = await createUserWithEmailAndPassword(auth, login, password);
      setUser(user);
      localStorage.setItem("ID", user?.user.uid);
      localStorage.setItem("NAME", fullName);
      setErrorMessage(false);
    } catch (error) {
      setErrorMessage(true);
    }
    setFullName("");
    setLogin("");
    setPassword("");
  };

  const handleLogin = async () => {
    try {
      const user = await signInWithEmailAndPassword(auth, login, password);
      setUser(user);
      localStorage.setItem("ID", user?.user.uid);
      userLogged();
      setErrorMessage(false);
    } catch (error) {
      setErrorMessage(true);
    }
    setLogin("");
    setPassword("");
  };

  const handleLogout = async () => {
    await signOut(auth);

    localStorage.removeItem("ID");
    localStorage.removeItem("NAME");
    setUser(null);
  };

  // useEffect(() => {
  //   localStorage.setItem("ID", user?.uid);
  //   console.log(123456);
  //   console.log(user);
  // }, [user]);

  return (
    <Popup
      variant="text"
      sx={{
        width: "40px",
        heigth: "30px",
        background: "#fff",
        color: "black",
      }}
      icon={<PersonIcon />}
    >
      <Box>
        {user ? (
          <>
            <Box>logged in as </Box>
            <Button size="medium" onClick={handleLogout}>
              Logout
            </Button>
          </>
        ) : (
          <>
            <Box
              sx={{
                display: "flex",
                justifyContent: "space-around",
                minWidth: "350px",
              }}
            >
              <Button sx={{ width: "100%" }} onClick={handleLoginTab}>
                Login
              </Button>
              <Button sx={{ width: "100%" }} onClick={handleRegisterTab}>
                Register
              </Button>
            </Box>
            <Box
              component="form"
              sx={{
                padding: "20px",
              }}
              autoComplete="off"
            >
              <CardContent
                sx={{
                  display: "flex",
                  flexDirection: "column",
                }}
              >
                {tab === "register" ? (
                  <Input
                    placeholder="Full name"
                    sx={{
                      height: "40px",
                      padding: "10px",
                      marginBottom: "10px",
                    }}
                    onChange={(e) => setFullName(e.target.value)}
                    value={fullName}
                  />
                ) : (
                  ""
                )}
                <Input
                  placeholder="Login"
                  sx={{
                    height: "40px",
                    padding: "10px",
                    marginBottom: "10px",
                  }}
                  onChange={(e) => setLogin(e.target.value)}
                  value={login}
                />
                <Input
                  placeholder="Password"
                  type="password"
                  sx={{
                    height: "50px",
                    padding: "10px",
                  }}
                  onChange={(e) => setPassword(e.target.value)}
                  value={password}
                />
              </CardContent>
              <CardActions
                sx={{
                  justifyContent: "center",
                }}
              >
                {tab === "login" ? (
                  <Button size="medium" onClick={handleLogin}>
                    Login
                  </Button>
                ) : (
                  <Button size="medium" onClick={handleRegister}>
                    Register
                  </Button>
                )}
              </CardActions>

              {errorMessage ? (
                <Box sx={{ display: "flex", justifyContent: "center" }}>
                  Something went wrong!
                </Box>
              ) : (
                ""
              )}
            </Box>
          </>
        )}
      </Box>
    </Popup>
  );
};

export default Authorization;
