import React, { useEffect, useState, useContext } from "react";
import "./ProfileUpdate.css";
import assets from "../../assets/assets";
import { onAuthStateChanged } from "firebase/auth";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { auth, db } from "../../config/firebase";
import { useNavigate } from "react-router-dom";
import upload from "../../lib/upload";
import { AppContext } from "../../context/AppContext";
import { toast } from "react-toastify";

const ProfileUpdate = () => {
  const navigate = useNavigate();
  const [image, setImage] = useState(false);
  const [name, setName] = useState("");
  const [bio, setBio] = useState("");
  const [uid, setUid] = useState("");
  const [prevImage, setPrevImg] = useState("");
  const { setUserData } = useContext(AppContext);

  const profileUpdate = async (event) => {
    event.preventDefault();
    try {
      if (!prevImage && !image) {
        return toast.error("Upload profile picture");
      }
      const docRef = doc(db, "users", uid);
      let imgUrl = prevImage;
  
      if (image) {
        imgUrl = await upload(image);
        setPrevImg(imgUrl);
      }
  
      await updateDoc(docRef, {
        avatar: imgUrl,
        bio: bio,
        name: name,
      });
  
      const snap = await getDoc(docRef);
      setUserData(snap.data());
  
      // Force re-render with updated data
      setPrevImg(imgUrl);
      navigate('/chat');
    } catch (error) {
      console.error(error);
      toast.error(error.message);
    }
  };
  
  useEffect(() => {
    onAuthStateChanged(auth, async (user) => {
      if (user) {
        setUid(user.uid);
        const docRef = doc(db, "users", user.uid);
        const docSnap = await getDoc(docRef);
        if (docSnap.data().name) {
          setName(docSnap.data().name);
        }
        if (docSnap.data().bio) {
          setBio(docSnap.data().bio);
        }
        if (docSnap.data().avatar) {
          setPrevImg(docSnap.data().avatar);
        }
      } else {
        navigate("/");
      }
    });
  }, [uid, navigate]);

  return (
    <div className="profile">
      <div className="profile-container">
        <form onSubmit={profileUpdate}>
          <h3>Profile Details</h3>
          <label htmlFor="avatar">
            <input
              onChange={(e) => setImage(e.target.files[0])}
              type="file"
              id="avatar"
              accept=".png, .jpg, .jpeg"
              hidden
            />
            <img
              src={image ? URL.createObjectURL(image) : assets.avatar_icon}
              alt=""
            />
            upload profile image
          </label>
          <input
            onChange={(e) => setName(e.target.value)}
            value={name}
            type="text"
            placeholder="Your name"
            required
          />
          <textarea
            onChange={(e) => setBio(e.target.value)}
            value={bio}
            placeholder="Write your profile bio"
          />
          <button type="submit"> Save </button>
        </form>
        <img
          className="profile-pic"
          src={
            image ? URL.createObjectURL(image) : prevImage || assets.logo_icon
          }
          alt="Profile"
        />
      </div>
    </div>
  );
};

export default ProfileUpdate;
