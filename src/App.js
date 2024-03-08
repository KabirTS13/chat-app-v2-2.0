import React, { useRef, useState } from "react";
import './App.css';


import firebase from "firebase/compat/app";
import 'firebase/compat/firestore'; //To use database
import 'firebase/compat/auth'; //For user authentication


import {useAuthState} from "react-firebase-hooks/auth"; //Synchronize the authentication state of a Firebase Auth user with React
import {useCollectionData} from "react-firebase-hooks/firestore"; // Synchronize a Firestore query's data with React


firebase.initializeApp({
 apiKey: "AIzaSyBCI-ZsYez4XsdwNGPucjHdp1d1xNOSqtE",
 authDomain: "chat-app-v2-3b88c.firebaseapp.com",
 projectId: "chat-app-v2-3b88c",
 storageBucket: "chat-app-v2-3b88c.appspot.com",
 messagingSenderId: "1003149440751",
 appId: "1:1003149440751:web:38bdb251f352ad19bf8d1a"
})


const auth = firebase.auth();
const firestore = firebase.firestore();

function App() {


 const [user] = useAuthState(auth); //Allows us to know whether the user is logged in or not


 return (
   <div className="App">
     <header className="App-header">
       <h1>Orion | Chat and Interact</h1>
       <SignOut />
     </header>


     <section>
       {user ? <ChatRoom /> : <SignIn />}
     </section>
   </div>
 );
}


//Allows the user to sign in with google
function SignIn(){


 const signInWithGoogle = () => {
   const provider = new firebase.auth.GoogleAuthProvider();
   auth.signInWithPopup(provider);
 }


 return (
   <button onClick={signInWithGoogle}>Sign in with Google</button>
 )
}


//If there is a current user sign in, a signout option will be present.
function SignOut(){
 return auth.currentUser && (
   <button onClick={() => auth.signOut()}>Sign Out</button>
 )
}


function ChatMessage(props){
 const { text, uid, photoURL } = props.message;
 const messageClass = uid === auth.currentUser.uid ? "sent" : "received";

 return (
   <div className={`message ${messageClass}`}>
     <img src={photoURL} />
     <p>{text}</p>

   </div>
 )
}


function ChatRoom() {
 const messagesRef = firestore.collection("messages");
 const query = messagesRef.orderBy('timestamp').limit(25); //Holds all of the messages (max of 25) ordered by when they were created
 const [messages] = useCollectionData(query, {idField : 'id'}); //Contains the messages (and Uid) retrieved from the Firestore collection and updates in realtime


 const [formValue, setFormValue] = useState('');
 const scrollBottom = useRef();
 function checkLength(){
   if (formValue.length < 200) {
     return <button type="submit">Send</button>
   } else{
     return <p className="characterErrorMessage">Too many characters!</p>
   }
 }


 const sendMessage = async(e) =>{
   e.preventDefault();
   const {uid, photoURL} = auth.currentUser;


   await messagesRef.add({
     text: formValue,
     timestamp: firebase.firestore.FieldValue.serverTimestamp(),
     uid,
     photoURL
   })


   setFormValue("")
   scrollBottom.current.scrollTop = scrollBottom.current.scrollHeight;
 }
 return (
   <>
   <main ref={scrollBottom}>
     {messages && messages.map(msg => <ChatMessage key={msg.id} message={msg}/>)}
   </main>
    
     <form onSubmit={sendMessage}>
       <input value={formValue} onChange={(e) => setFormValue(e.target.value)}/>
       {checkLength()}
     </form>
  
   </>
 )


}




export default App;



