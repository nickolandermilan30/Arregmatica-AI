import React from "react";
import { X, FileText } from "lucide-react"; 
import userdp from "../../assets/userdp.png";
import "./FriendDetail.css"; // custom CSS for hiding scrollbar

const FriendDetail = ({ user, onClose }) => {
  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 backdrop-blur-sm bg-black/60">
      <div className="bg-white rounded-2xl shadow-xl w-[550px] max-h-[85vh] relative flex flex-col">
        
        {/* Close Button (Top Right) */}
        <button 
          onClick={onClose} 
          className="absolute top-3 right-3 p-2 rounded-full hover:bg-gray-200 transition"
        >
          <X size={22} />
        </button>

        {/* Scrollable Content */}
        <div className="overflow-y-auto flex-1 pb-32 hide-scrollbar">
          {/* Cover Section */}
          <div className="w-full h-44 bg-[#1DA1F2] relative rounded-t-2xl" />

          {/* Profile Header (Avatar + Name + Email) */}
          <div className="flex items-center gap-5 px-6 -mt-14">
            {/* Avatar */}
            <div className="relative">
              <img
                src={user.avatar || userdp}
                alt={user.username}
                className="w-28 h-28 rounded-full border-4 border-white object-cover shadow-md"
              />
              {/* Online Dot */}
              <span className="absolute bottom-2 right-2 w-5 h-5 bg-green-500 border-2 border-white rounded-full"></span>
            </div>

            {/* Name + Email */}
            <div className="mt-14">
              <h2 className="text-2xl font-bold text-gray-900 break-words">{user.username}</h2>
              <p className="text-sm text-gray-600 break-words">{user.email}</p>
            </div>
          </div>

          {/* Info Section */}
          <div className="mt-8 px-6">
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-gray-50 border rounded-lg p-4 shadow-sm overflow-hidden">
                <p className="text-xs text-gray-500">UID</p>
                <p className="font-semibold text-gray-800 break-words">{user.uid}</p>
              </div>

              <div className="bg-gray-50 border rounded-lg p-4 shadow-sm overflow-hidden">
                <p className="text-xs text-gray-500">Account Created</p>
                <p className="font-semibold text-gray-800 break-words">{user.accountCreated}</p>
              </div>

              <div className="bg-gray-50 border rounded-lg p-4 shadow-sm overflow-hidden col-span-2">
                <p className="text-xs text-gray-500">Last Sign In</p>
                <p className="font-semibold text-gray-800 break-words">{user.lastSignIn}</p>
              </div>
            </div>
          </div>

          {/* No Posts Section */}
          <div className="flex flex-col items-center justify-center text-gray-500 mt-20 mb-6">
            <FileText size={40} className="mb-2 text-gray-400" />
            <p className="text-lg font-medium">No posts yet</p>
          </div>
        </div>

        {/* Fixed Close Button (Bottom Full Width) */}
        <div className="absolute bottom-0 left-0 right-0 bg-white border-t p-4">
          <button
            onClick={onClose}
            className="w-full flex items-center justify-center gap-2 py-3 bg-red-500 text-white rounded-lg shadow hover:bg-red-600 transition"
          >
            <X size={18} /> Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default FriendDetail;
