import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
const MeetingNotification = ({ data }) => {
  const [notificationData, setNotificationData] = useState(() => {
    // Retrieve notification data from localStorage
    const savedData = localStorage.getItem("notificationData");
    return savedData ? JSON.parse(savedData) : data;
  });

  useEffect(() => {
    // Save notification data to localStorage whenever it changes
    if (notificationData) {
      localStorage.setItem(
        "notificationData",
        JSON.stringify(notificationData)
      );
    }
  }, [notificationData]);

  const onJoin = () => {
    const roomId = notificationData.roomId;
    window.location.href = `/room_join/${roomId}`;
    setNotificationData(null);
    localStorage.removeItem("notificationData");
  };

  const onCancel = () => {
    // Clear notification data from state and localStorage
    setNotificationData(null);
    localStorage.removeItem("notificationData");
  };

  // If no notification data, return null (component won't render)
  if (!notificationData) return null;

  return (
    <div
      className="fixed notification top-40 right-4 bg-white shadow-lg rounded-lg p-[10px] flex items-center justify-between flex-col"
      style={{ width: "260px" }}
    >
      <div className="flex items-center w-full">
        <img
          src={notificationData?.item?.experienceImage}
          alt="Experience"
          className="w-16 h-16 rounded-md mr-4"
        />
        <div>
          <h3 className="text-lg font-semibold leading-none line-clamp-1">
            {notificationData?.item?.experienceName}
          </h3>
          <p className="text-gray-500 leading-none mt-[3px]">
            {notificationData?.item?.state}
          </p>
          <p className="text-gray-800 leading-none mt-[3px]">
            ${notificationData?.item?.totalPrice}
          </p>
        </div>
      </div>
      <div className="flex space-x-2 pl-20 w-full mt-[5px]">
        <button
          onClick={onCancel}
          className="bg-gray-300 text-black px-[10px] py-[6px] rounded-md leading-none text-sm"
        >
          Cancel
        </button>
        <button
          onClick={onJoin}
          className="bg-black text-white px-[10px] py-[6px] rounded-md leading-none text-sm"
        >
          Join
        </button>
      </div>
    </div>
  );
};

export default MeetingNotification;
