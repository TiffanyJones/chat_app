import React, { useContext, useState } from "react";
import "./LeftSideBar.css";
import assets from "../../assets/assets";
import { useNavigate } from "react-router-dom";
import {
  arrayUnion,
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  serverTimestamp,
  setDoc,
  updateDoc,
  where,
} from "firebase/firestore";
import { db, logout } from "../../config/firebase";
import { AppContext } from "../../context/AppContext";
import { toast } from "react-toastify";

const LeftSideBar = () => {
  const navigate = useNavigate(); 
  const { userData, chatData, setChatUser, setMessagesId, messagesId } = useContext(AppContext); 
  const [user, setUser] = useState(null); 
  const [showSearch, setShowSearch] = useState(false); 

 
  const inputHandler = async (e) => {
    try {
      const input = e.target.value; 

      if (input) {
        setShowSearch(true); 
        const userRef = collection(db, "users"); 
        const q = query(userRef, where("username", "==", input.toLowerCase())); 
        const querySnap = await getDocs(q); 

      
        if (!querySnap.empty && querySnap.docs[0].data().id !== userData.id) {
          let userExist = false;

        
          chatData.forEach((user) => {
            if (user.rId === querySnap.docs[0].data().id) {
              userExist = true;
            }
          });

                   if (!userExist) {
            setUser(querySnap.docs[0].data());
          } else {
            setUser(null); 
          }
        } else {
          setUser(null); 
        }
      } else {
        setShowSearch(false); 
      }
    } catch (error) {
      toast.error(error.message);
    }
  };

    const addChat = async () => {
        if (!user || !user.id) {
      return toast.error("User not found or invalid."); 
    }

   
    const chatExists = chatData.some(chat => chat.rId === user.id);
    if (chatExists) {
      return toast.info("Chat with this user already exists."); 
    }

    try {
      const messagesRef = collection(db, "messages");
      const chatsRef = collection(db, "chats"); 
      const newMessageRef = doc(messagesRef);
      await setDoc(newMessageRef, {
        createdAt: serverTimestamp(), 
        messages: [], 
      });

           await updateDoc(doc(chatsRef, user.id), {
        chatData: arrayUnion({
          messagesId: newMessageRef.id,
          lastMessage: "",
          rId: userData.id,
          messageSeen: true,
        }),
      });

           await updateDoc(doc(chatsRef, userData.id), {
        chatData: arrayUnion({
          messagesId: newMessageRef.id,
          lastMessage: "",
          rId: user.id,
          messageSeen: true,
        }),
      });

     
      await updateDoc(doc(chatsRef, user.id), {
        updatedAt: serverTimestamp()
      });

      await updateDoc(doc(chatsRef, userData.id), {
        updatedAt: serverTimestamp()
      });

      toast.success("Chat added successfully!"); 
      setShowSearch(false); 
    } catch (error) {
      toast.error(error.message);
      console.error(error); 
    }
  };

  const setChat = async (item) => {
    try {
      setMessagesId(item.messagesId); 
    setChatUser(item); 
    
    const userChatsRef = doc(db, 'chats', userData.id);
    const userChatsSnapshot = await getDoc(userChatsRef);
    const userChatData = userChatsSnapshot.data();
    const chatIndex = userChatData.chatData.findIndex((c) => c.messagesId === item.messagesId);

    if (chatIndex !== -1) {
      userChatData.chatData[chatIndex].messageSeen = true;
      await updateDoc(userChatsRef, {
        chatData: userChatData.chatData,
      });
    }
       
    } catch (error) {
      toast.error(error.message)
      
    }
  }

  return (
    <div className="ls">
      <div className="ls-top">
        <div className="ls-nav">
          <img src={assets.logo} className="logo" alt="" />
          <div className="menu">
            <img src={assets.menu_icon} alt="" /> 
            <div className="sub-menu">
              <p onClick={() => navigate("/profile")}>Edit Profile</p> 
              <hr />
              <p onClick={()=>logout()}>Logout</p> 
            </div>
          </div>
        </div>
        <div className="ls-search">
          <img src={assets.search_icon} alt="" />
          <input
            onChange={inputHandler} 
            type="text"
            placeholder="Search here..."
          />
        </div>
      </div>
      <div className="ls-list">
        {showSearch && user ? (
          <div onClick={addChat} className="friends add-user">
            <img src={user.avatar} alt="" />
            <p>{user.name}</p> 
          </div>
        ) : (
          chatData && chatData.length > 0 ? (
            chatData.map((item, index) => (
              <div onClick={() => setChat(item)} key={index} className={`friends ${item.messageSeen || item.messagesId === messagesId ? "" : "border"}`}
              >
                <img src={item.userData.avatar} alt="" />
                <div>
                  <p>{item.userData.name}</p> 
                  <span>{item.lastMessage}</span> 
                </div>
              </div>
            ))
          ) : (
            <p className="no-chat">No chats available</p> 
          )
        )}
      </div>
    </div>
  );
};

export default LeftSideBar;