import { handleBookingRequestApi } from "@/utills/service/avtarService/AddExperienceService";
import { Button } from "@mui/material";
import moment from "moment";
import Images from "@/constant/Images.js";
import {
  formatDate,
  formatTime,
} from "@/constant/date-time-format/DateTimeFormat";
import React, { useEffect, useState } from "react";
import { initClient } from "../../../meetConfig/googleCalender.js";
import { useNavigate, useLocation } from "react-router-dom";
import { useDispatch } from "react-redux";
import { getCurrencySymbol } from "@/constant/CurrencySign.jsx";
import Loader from "@/components/Loader.jsx";

const RequestedCard = ({ item, getRequests, role }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [loader, setLoader] = useState(false);
  const [userId, setUserID] = useState("");
  const [avId, setAvId] = useState("");
  const [isSignedIn, setIsSignedIn] = useState(false);
  const [meetLink, setMeetLink] = useState("");
  const [startTime, setStartTime] = useState("");
  const [countdown, setCountdown] = useState("");
  const [meetActive, setMeetActive] = useState(false);
  const [activeButtonDisable, setActiveButtonDisable] = useState(false);
  const dispatch = useDispatch();

  const updateSignInStatus = (isSignedIn) => {
    setIsSignedIn(isSignedIn);
  };

  useEffect(() => {
    initClient(updateSignInStatus);
  }, []);

  // Countdown timer for the meeting
  useEffect(() => {
    if (startTime) {
      const interval = setInterval(() => {
        const now = moment();
        const meetingStart = moment(startTime);
        const diff = meetingStart.diff(now);

        if (diff <= 0) {
          clearInterval(interval);
          setCountdown("Let's start the Meeting");
          setMeetActive(true);
        } else {
          const hours = Math.floor(diff / 3600000);
          const minutes = Math.floor((diff % 3600000) / 60000);
          const seconds = Math.floor((diff % 60000) / 1000);
          setCountdown(`${hours} : ${minutes} : ${seconds}`);
        }
      }, 1000);

      return () => clearInterval(interval); // Cleanup interval on unmount
    }
  }, [startTime]);

  const acceptOffer = async (status, item) => {
    const body = { action: status };
    const reqdata = {
      userId: item?.userId,
      startTime: item?.bookingTime,
      ReqId: item?.reqId,
      endTime: item?.endTime,
    };

    const newData = { ...body, reqdata };

    setUserID(item?.userId);
    setAvId(item?.avatarId);

    try {
      setLoader(true);
      const response = await handleBookingRequestApi(item?.reqId, body);
      if (response?.isSuccess) {
        const targetTab = status === "accept" ? "booked" : "cancelled";
        navigate(`/avatar/experience?tab=${targetTab}`);
        setActiveButtonDisable(true);
        getRequests("Requested");
      }
    } catch (error) {
      console.log(error);
    } finally {
      setLoader(false);
    }
  };

  return (
    <>
      {loader && <Loader />}
      <section>
        <div>
          <div className="BoxShadowLessRounded pb-2">
            <div className="flex gap-4 sm:gap-0 p-4 sm:flex-wrap sm:items-stretch sm:p-2">
              <div className="w-[30%] relative">
                <img
                  src={item?.experienceImage}
                  alt="cardImageRounded"
                  className="w-full object-cover h-full rounded-lg"
                />
                {role === "avatar" && (
                  <div className="absolute bottom-2 right-1 px-2 rounded-full font-bold bg-white text-sm">
                    {getCurrencySymbol()}
                    {item?.totalPrice}
                  </div>
                )}
              </div>

              <div className="w-[70%] sm:pl-3">
                {location.pathname === "/user/experience" && (
                  <div className="flex justify-between">
                    <div className="text-[#f5c00a] bg-[#fff9e6] pt-[4px] pb-[5px] px-[10px] rounded-full text-xs font-medium">
                      {item?.status}
                    </div>
                  </div>
                )}

                <div className="flex justify-between items-center gap-2 py-1 sm:py-[2px] text-xs">
                  <div className="icon">
                    <img
                      src={Images?.location}
                      alt="location"
                      className="w-3 h-3"
                    />
                  </div>
                  <div className="flex-1">
                    {item?.city && `${item?.city},`} {item?.country}
                  </div>
                </div>

                <div className="flex justify-between items-center gap-2 py-1 sm:py-[2px] text-xs">
                  <div className="icon">
                    <img
                      src={Images.calendarIcon}
                      alt="calendarIcon"
                      className="w-3 h-3"
                    />
                  </div>
                  <div className="flex-1">{formatDate(item?.bookingDate)}</div>
                </div>

                <div className="flex items-center gap-2 py-1 sm:py-[2px] text-xs">
                  <div className="icon">
                    <img
                      src={Images.clock}
                      alt="calendarIcon"
                      className="w-3 h-3"
                    />
                  </div>
                  <div className="flex-1">
                    {formatTime(item?.bookingTime)} -{" "}
                    {formatTime(item?.endTime)}
                  </div>
                </div>
                {role === "avatar" && (
                  <div className="flex justify-between pt-2 text-grey-800">
                    <button
                      disabled={activeButtonDisable}
                      className={`border border-primaryColor-900 text-black ${
                        !activeButtonDisable ? "opacity-1" : "opacity-[0.5]"
                      } font-semibold py-1 rounded mr-2 w-[50%] text-sm sm:text-xs`}
                      onClick={() => acceptOffer("reject", item)}
                    >
                      Cancel
                    </button>
                    <button
                      disabled={activeButtonDisable}
                      className={`border border-primaryColor-900 text-white bg-black ${
                        !activeButtonDisable ? "opacity-1" : "opacity-[0.5]"
                      } font-semibold py-1 rounded mr-2 w-[50%] text-sm sm:text-xs`}
                      onClick={() => acceptOffer("accept", item)}
                    >
                      Accept
                    </button>
                  </div>
                )}
              </div>

              {location.pathname === "/user/experience" && (
                <div className="flex justify-between ps-3 pe-3 border-t border-[#F1F1F1] pt-2 pb-1">
                  <p className="text-[#aaaaab] font-semibold">
                    Avatar:{" "}
                    <span className="font-normal">{item?.avatarName}</span>
                  </p>
                  <p className="text-[#aaaaab] font-semibold">
                    {getCurrencySymbol()}
                    {item?.totalPrice}
                  </p>
                </div>
              )}

              {meetActive && meetLink && (
                <a
                  href={meetLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-backgroundFill-900 text-white flex justify-center items-center py-3 gap-2 rounded w-1/2 mt-3 lg:w-[97%] lg:m-1 ms-auto me-auto"
                >
                  <div className="text">{countdown}</div>
                </a>
              )}
            </div>
          </div>
        </div>
      </section>
    </>
  );
};

export default RequestedCard;
