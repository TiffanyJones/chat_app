import { doc, getDoc, onSnapshot, updateDoc } from "firebase/firestore";
import { createContext, useEffect, useState } from "react";
import { db, auth } from "../config/firebase";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

export const AppContext = createContext();

const AppContextProvider = (props) => {
  const navigate = useNavigate();
  const [userData, setUserData] = useState(null);
  const [chatData, setChatData] = useState(null);
  const [messagesId, setMessagesId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [chatUser, setChatUser] = useState(null);

  const loadUserData = async (uid) => {
    try {
      // Reference to the user's document in Firestore
      const userRef = doc(db, "users", uid);
      
      // Fetch the user document
      const userSnap = await getDoc(userRef);
      
      // Check if the user document exists
      if (userSnap.exists()) {
        const userData = userSnap.data();  // Get the user data
        
        // Update the state with the user data
        setUserData(userData);
  
        // Check if the user has an avatar and name, navigate accordingly
        if (userData.avatar && userData.name) {
          navigate('/chat');
        } else {
          navigate('/profile');
        }
  
        // Update the user's last seen time
        await updateDoc(userRef, {
          lastSeen: Date.now(),
        });
  
        // Set up an interval to periodically update the last seen time
        setInterval(async () => {
          if (auth.currentUser) {
            await updateDoc(userRef, {
              lastSeen: Date.now(),
            });
          }
        }, 60000);  // Update every 60 seconds
      } else {
        toast.error("User data not found.");
        navigate('/');  // Navigate back to login if no user data is found
      }
    } catch (error) {
      toast.error("Failed to load user data.");
    }
  };

  useEffect(() => {
    if (userData) {
      const chatsRef = doc(db, "chats", userData.id);
      const unSub = onSnapshot(chatsRef, async (res) => {
        const chatItems = res.data().chatData;
        const tempData = [];
        for (const item of chatItems) {
          const userRef = doc(db, "users", item.rId);
          const userSnap = await getDoc(userRef);
          const userData = userSnap.data();
          tempData.push({ ...item, userData });
        }
        setChatData(tempData.sort((a, b) => b.updatedAt - a.updatedAt));
      });
      return () => {
        unSub();
      };
    }
  }, [userData]);

  const value = {
    userData,
    setUserData,
    chatData,
    setChatData,
    loadUserData,
    messages, setMessages,
    messagesId, setMessagesId,
    chatUser, setChatUser
  };

  return (
    <AppContext.Provider value={value}>{props.children}</AppContext.Provider>
  );
};

export default AppContextProvider;
