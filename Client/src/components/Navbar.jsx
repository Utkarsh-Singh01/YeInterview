import React, { useState } from "react";
import { motion } from "motion/react";
import { FaRobot, FaUserAstronaut } from "react-icons/fa6";
import { HiOutlineLogout } from "react-icons/hi";
import { BsCoin } from "react-icons/bs";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import axios from "axios";
import { ServerUrl } from "../App";
import { setUserData } from "../redux/userSlice";
import AuthModel from "./AuthModel";

function Navbar() {
  const { userData } = useSelector((state) => state.user);
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const [showCreditPopup, setShowCreditPopup] = useState(false);
  const [showUserPopup, setShowUserPopup] = useState(false);
  const [showAuth, setShowAuth] = useState(false);

  const handleLogout = async () => {
    try {
      await axios.get(`${ServerUrl}/api/auth/logout`, {
        withCredentials: true,
      });

      dispatch(setUserData(null));
      setShowUserPopup(false);
      setShowCreditPopup(false);
      navigate("/");
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <div className="bg-[#f3f3f3] flex justify-center px-4 pt-6">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-6xl flex items-center justify-between bg-white rounded-[24px] shadow-sm border border-gray-200 px-8 py-4 relative"
      >
        <div
          onClick={() => navigate("/")}
          className="flex items-center gap-3 cursor-pointer"
        >
          <div className="bg-emerald-500 text-white p-2 rounded-lg">
            <FaRobot size={18} />
          </div>

          <h1 className="font-semibold hidden md:block text-lg">
            YeInterview.AI
          </h1>
        </div>

        <div className="flex items-center gap-6 relative">
          <div className="relative">
            <button
              type="button"
              onClick={() => {
                if (!userData) {
                  setShowAuth(true);
                  return;
                }

                setShowCreditPopup(!showCreditPopup);
                setShowUserPopup(false);
              }}
              className="flex items-center gap-2 bg-gray-100 px-4 py-4 rounded-full text-md hover:bg-gray-200 transition-colors duration-300 cursor-pointer"
            >
              <BsCoin size={20} />
              <span>{userData?.credits || 0}</span>
            </button>

            {showCreditPopup && (
              <div className="absolute right-0 top-12 w-64 bg-white rounded-2xl shadow-xl p-5 z-50 border border-gray-100">
                <p className="text-sm text-gray-600 mb-4">
                  Need more credits? Upgrade your plan and unlock more AI
                  interview practice.
                </p>

                <button
                  type="button"
                  onClick={() => {
                    setShowCreditPopup(false);
                    navigate("/pricing");
                  }}
                  className="w-full flex items-center justify-center gap-3 py-3 bg-black text-white rounded-full shadow-md cursor-pointer"
                >
                  Buy more Credits
                </button>
              </div>
            )}
          </div>

          <div className="relative">
            <button
              type="button"
              onClick={() => {
                if (!userData) {
                  setShowAuth(true);
                  return;
                }

                setShowUserPopup(!showUserPopup);
                setShowCreditPopup(false);
              }}
              className="w-9 h-9 bg-emerald-400 text-white rounded-full flex items-center justify-center font-semibold cursor-pointer"
            >
              {userData ? (
                userData?.name?.slice(0, 1).toUpperCase()
              ) : (
                <FaUserAstronaut size={16} />
              )}
            </button>

            {showUserPopup && (
              <div className="absolute right-0 mt-3 w-48 bg-white rounded-lg shadow-xl p-4 z-50 border border-gray-200">
                <p className="text-md text-emerald-500 font-medium mb-1">
                  {userData?.name || "User"}
                </p>

                <button
                  type="button"
                  onClick={() => {
                    setShowUserPopup(false);
                    navigate("/history");
                  }}
                  className="w-full text-left flex items-center gap-2 py-2 px-3 rounded hover:bg-gray-100 transition-colors duration-300 cursor-pointer"
                >
                  Interview History
                </button>

                <button
                  type="button"
                  onClick={handleLogout}
                  className="w-full text-left flex items-center gap-2 py-2 px-3 rounded hover:bg-red-400 hover:text-white transition-colors duration-300 cursor-pointer"
                >
                  <HiOutlineLogout size={16} />
                  Logout
                </button>
              </div>
            )}
          </div>
        </div>
      </motion.div>

      {showAuth && <AuthModel onClose={() => setShowAuth(false)} />}
    </div>
  );
}

export default Navbar;