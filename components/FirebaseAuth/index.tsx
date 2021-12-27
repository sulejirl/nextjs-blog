import React, { useState, useEffect } from "react";
// Firebase.
import firebase from "firebase/compat/app";
import "firebase/compat/auth";
import StyledFirebaseAuth from "react-firebaseui/StyledFirebaseAuth";


// Get the Firebase config from the auto generated file.

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_DOMAIN,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID,
};
// Instantiate a Firebase app.
const firebaseApp = firebase.initializeApp(firebaseConfig);

/**
 * The Splash Page containing the login UI.
 */
const FirebaseUi = () => {
  const [isSignedIn, setIsSignedIn] = useState(false);
  const uiConfig = {
    signInFlow: "popup",
    signInOptions: [
      firebase.auth.GoogleAuthProvider.PROVIDER_ID,
      firebase.auth.EmailAuthProvider.PROVIDER_ID,
    ],
    callbacks: {
      signInSuccessWithAuthResult: () => false,
    },
  };
  useEffect(() => {
    const observer = firebase.auth().onAuthStateChanged((user) => {
      setIsSignedIn(!!user);
    });
    return () => {
      observer();
    };
  }, []);
  const name = firebaseApp.auth().currentUser?.displayName || "";
  return (
    <div >
      {isSignedIn !== undefined && !isSignedIn && (
        <div>
          <StyledFirebaseAuth
            className={"firebaseUi"}
            uiConfig={uiConfig}
            firebaseAuth={firebaseApp.auth()}
          />
        </div>
      )}
      {isSignedIn && (
        <div className={"signedIn"}>
          Hello{" "}
          {name}
          . You are now signed In!
          <a className={"button"} onClick={() => firebaseApp.auth().signOut()}>
            Sign-out
          </a>
        </div>
      )}
    </div>
  );
};

export default FirebaseUi;
