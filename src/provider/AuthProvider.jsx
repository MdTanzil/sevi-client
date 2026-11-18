import { createContext, useEffect, useState } from "react";
import PropTypes from "prop-types";
import {
    GoogleAuthProvider,
  createUserWithEmailAndPassword,
  getAuth,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut,
  updateProfile,
} from "firebase/auth";
import app from "../config/firrebase.config";
import useAxios from "../hooks/useAxios";

// auth context
export const AuthContext = createContext(null);

const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const auth = getAuth(app);
  const axios = useAxios();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        // User is signed in, see docs for a list of available properties
        // https://firebase.google.com/docs/reference/js/auth.user
        // const uid = user.uid;
        // ...
        setUser(user);
      } else {
        // User is signed out
        // ...
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [auth]);

  // registration  with email and password
  const register = (email, password) => {
    setLoading(false);
    return createUserWithEmailAndPassword(auth, email, password);
  };

  // login with email and password
  const login = (email, password) => {
    setLoading(false);
    return signInWithEmailAndPassword(auth, email, password);
  };

  //logout — clear the server JWT cookie first (best-effort, so a network
  // failure never blocks signing out), then sign out of Firebase.
  const logout = () => {
    setLoading(false);
    return axios
      .post("/logout")
      .catch(() => {})
      .then(() => signOut(auth));
  };
  // update user data
  const updateUserData = (displayName, url) => {
    setLoading(false)
    return updateProfile(auth.currentUser, {
      displayName: displayName,
      photoURL: url,
    });
  };


  // sign up with google popup
  const googleProvider = new GoogleAuthProvider();
  const signUpWithGoogle = ()=>{
    setLoading(false)
    return signInWithPopup(auth, googleProvider);
  }

  const data = {
    register,
    setUser,
    login,
    logout,
    user,
    loading,
    updateUserData,
    signUpWithGoogle,
  };

  return <AuthContext.Provider value={data}>{children}</AuthContext.Provider>;
};

AuthProvider.propTypes = {
  children: PropTypes.node,
};

export default AuthProvider;
