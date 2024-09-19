// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore, setDoc, doc } from "firebase/firestore";
import { createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut } from "firebase/auth";
import { toast } from "react-toastify";


const firebaseConfig = {
    apiKey: "AIzaSyC4sKRZQETdLvSOn_QM1PFU0bPxG7NzvZ4",
    authDomain: "final-chat-app-50e13.firebaseapp.com",
    projectId: "final-chat-app-50e13",
    storageBucket: "final-chat-app-50e13.appspot.com",
    messagingSenderId: "169294147364",
    appId: "1:169294147364:web:39df74bcd7733ba6b34db1",
    measurementId: "G-WW91L9DD02"
  };

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

const signup = async (username, email, password) => {
    try{
        const res = await createUserWithEmailAndPassword(auth,email,password);
        const user = res.user;
        await setDoc(doc(db, "users", user.uid), {
            id: user.uid,
            username: username.toLowerCase(),
            email,
            name: "",
            avatar: "",
            bio: "Hey there, I am using chat app",
            lastSeen: Date.now(),
          });
          await setDoc(doc(db, "chats", user.uid), {
            chatData: [],
          });
          toast.success("Account created successfully!");
        } catch (error) {
          console.error(error);
          toast.error(error.code.split('/')[1].split('-').join(" "));
        }
      };

      const login = async (email, password) => {
        try{
          await signInWithEmailAndPassword(auth, email, password);
        }catch (error){
          console.error(error);
         toast.error(error.code.split('/')[1].split('-').join(" "));
        }
      }

      const logout = async () => {
        try {
          await signOut(auth) 
        }catch (error) {
          console.error(error);
          toast.error(error.code.split('/')[1].split('-').join(" "));
        }
      }
      
      export { signup, login, logout, auth, db};
 
      
   