import PersonIcon from "@mui/icons-material/Person";
import { Box, Button, CardActions, CardContent, Input } from "@mui/material";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut
} from "firebase/auth";
import { doc, getDoc, setDoc } from "firebase/firestore";
import React, { useEffect, useState } from "react";
import { auth, firestoreDB } from "../firebase";
import Popup from "./Popup";

const Authorization = ({
  userLogged,
  defaultView,
  satelliteView,
  setUserId,
}) => {
  const [tab, setTab] = useState("login");
  const [login, setLogin] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [user, setUser] = useState(null);
  const [errorMessage, setErrorMessage] = useState(null);

  useEffect(() => {
    const userId = localStorage.getItem("ID");
    const fullNameLocal = localStorage.getItem("NAME");
    setFullName(fullNameLocal);
    if (userId) {
      userLogged(true);
      setUser(fullNameLocal);
      setUserId(userId);
    }
  }, []);

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
      setErrorMessage(null);
      await setDoc(doc(firestoreDB, "users", `${user?.user.uid}`), {
        id: `${user?.user.uid}`,
        fullName: fullName,
      });
    } catch (error) {
      setErrorMessage("Cannot register");
    }
    setLogin("");
    setPassword("");
  };

  const handleLogin = async () => {
    try {
      const user = await signInWithEmailAndPassword(auth, login, password);
      setUser(user);
      localStorage.setItem("ID", user?.user.uid);
      userLogged(true);
      setErrorMessage(null);
      const dataSnap = await getDoc(
        doc(firestoreDB, "users", `${user?.user.uid}`)
      );
      if (dataSnap.exists()) {
        setFullName(dataSnap.data().fullName);
        localStorage.setItem("NAME", dataSnap.data().fullName);
      }
    } catch (error) {
      console.log("ERROR", error);
      setErrorMessage("Invalid login/password");
    }
    setLogin("");
    setPassword("");
  };

  const handleLogout = async () => {
    await signOut(auth);
    localStorage.removeItem("ID");
    localStorage.removeItem("NAME");
    userLogged(false);
    setUser(null);
  };

  return (
    <Box
      sx={{
        ":hover": {
          background: "#b8baba",
          borderRadius: "4px",
        },
      }}
    >
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
            <Box sx={{ textAlign: "end", minWidth: "240px" }}>
              <Box sx={{ padding: "10px" }}>{fullName}</Box>
              <Box
                sx={{
                  padding: "20px 0",
                  textAlign: "center",
                  borderTop: "1px solid black",
                  borderBottom: "1px solid black",
                }}
              >
                <Box>Select a view:</Box>
                <Button onClick={defaultView}>Default</Button>
                <Button onClick={satelliteView}>Satellite</Button>
              </Box>
              <Button size="medium" onClick={handleLogout}>
                Logout
              </Button>
            </Box>
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
                  {tab === "register" && (
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

                {errorMessage && (
                  <Box sx={{ display: "flex", justifyContent: "center" }}>
                    {errorMessage}
                  </Box>
                )}
              </Box>
            </>
          )}
        </Box>
      </Popup>
    </Box>
  );
};

export default Authorization;
