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
  const navigate = useNavigate(); // Hook to navigate programmatically
  const { userData, chatData, setChatUser, setMessagesId, messagesId } = useContext(AppContext); // Get userData and chatData from context
  const [user, setUser] = useState(null); // State to store the searched user
  const [showSearch, setShowSearch] = useState(false); // State to toggle search results display

  // Handles the input changes in the search field
  const inputHandler = async (e) => {
    try {
      const input = e.target.value; // Get the input value

      if (input) {
        setShowSearch(true); // Show search results if there's input
        const userRef = collection(db, "users"); // Reference to 'users' collection
        const q = query(userRef, where("username", "==", input.toLowerCase())); // Query for matching usernames
        const querySnap = await getDocs(q); // Execute the query

        // Check if results are found and the user is not the current user
        if (!querySnap.empty && querySnap.docs[0].data().id !== userData.id) {
          let userExist = false;

          // Check if the user already exists in chatData
          chatData.forEach((user) => {
            if (user.rId === querySnap.docs[0].data().id) {
              userExist = true;
            }
          });

          // If the user does not exist in chatData, set the user state
          if (!userExist) {
            setUser(querySnap.docs[0].data());
          } else {
            setUser(null); // Clear the user state if user exists in chatData
          }
        } else {
          setUser(null); // No results or user is the current user, clear the user state
        }
      } else {
        setShowSearch(false); // Hide search results if input is cleared
      }
    } catch (error) {
      toast.error(error.message); // Show error message if something goes wrong
    }
  };

  // Handles adding a new chat between the current user and the selected user
  const addChat = async () => {
    // Check if the selected user is valid
    if (!user || !user.id) {
      return toast.error("User not found or invalid."); // Show error if user is invalid
    }

    // Check if a chat already exists with the selected user
    const chatExists = chatData.some(chat => chat.rId === user.id);
    if (chatExists) {
      return toast.info("Chat with this user already exists."); // Notify user that chat already exists
    }

    try {
      const messagesRef = collection(db, "messages"); // Reference to 'messages' collection
      const chatsRef = collection(db, "chats"); // Reference to 'chats' collection

      // Create a new document for the message
      const newMessageRef = doc(messagesRef);
      await setDoc(newMessageRef, {
        createdAt: serverTimestamp(), // Set creation timestamp
        messages: [], // Initialize with an empty array for messages
      });

      // Add the new chat data to the selected user's document without updatedAt
      await updateDoc(doc(chatsRef, user.id), {
        chatData: arrayUnion({
          messagesId: newMessageRef.id,
          lastMessage: "",
          rId: userData.id,
          messageSeen: true,
        }),
      });

      // Add the new chat data to the current user's document without updatedAt
      await updateDoc(doc(chatsRef, userData.id), {
        chatData: arrayUnion({
          messagesId: newMessageRef.id,
          lastMessage: "",
          rId: user.id,
          messageSeen: true,
        }),
      });

      // Update the updatedAt timestamp separately for both users
      await updateDoc(doc(chatsRef, user.id), {
        updatedAt: serverTimestamp()
      });

      await updateDoc(doc(chatsRef, userData.id), {
        updatedAt: serverTimestamp()
      });

      toast.success("Chat added successfully!"); // Notify success
      setShowSearch(false); // Hide search results after adding the chat
    } catch (error) {
      toast.error(error.message); // Show error message if something goes wrong
      console.error(error); // Log error to the console
    }
  };

  // Handles selecting an existing chat from the list
  const setChat = async (item) => {
    try {
      setMessagesId(item.messagesId); // Set the selected chat's messagesId
    setChatUser(item); // Set the selected chat user

    // Mark the message as seen
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
          <img src={assets.logo} className="logo" alt="" /> {/* Logo */}
          <div className="menu">
            <img src={assets.menu_icon} alt="" /> {/* Menu icon */}
            <div className="sub-menu">
              <p onClick={() => navigate("/profile")}>Edit Profile</p> {/* Navigate to profile */}
              <hr />
              <p onClick={()=>logout()}>Logout</p> {/* Placeholder for logout */}
            </div>
          </div>
        </div>
        <div className="ls-search">
          <img src={assets.search_icon} alt="" /> {/* Search icon */}
          <input
            onChange={inputHandler} // Handle input changes
            type="text"
            placeholder="Search here..."
          />
        </div>
      </div>
      <div className="ls-list">
        {showSearch && user ? (
          <div onClick={addChat} className="friends add-user">
            <img src={user.avatar} alt="" /> {/* User avatar */}
            <p>{user.name}</p> {/* User name */}
          </div>
        ) : (
          chatData && chatData.length > 0 ? (
            chatData.map((item, index) => (
              <div onClick={() => setChat(item)} key={index} className={`friends ${item.messageSeen || item.messagesId === messagesId ? "" : "border"}`}
              >
                <img src={item.userData.avatar} alt="" /> {/* Profile image */}
                <div>
                  <p>{item.userData.name}</p> {/* Profile name */}
                  <span>{item.lastMessage}</span> {/* Chat message */}
                </div>
              </div>
            ))
          ) : (
            <p>No chats available</p> // Placeholder for no chats scenario
          )
        )}
      </div>
    </div>
  );
};

export default LeftSideBar;