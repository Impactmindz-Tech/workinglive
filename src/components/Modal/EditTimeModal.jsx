import { useEffect, useRef, useState } from "react";
import { updateBookingTimeApi } from "@/utills/service/userSideService/userService/UserHomeService";
import { useParams } from "react-router-dom";
import toast from "react-hot-toast";
import Loader from "../Loader";
import { formatTo24Hour } from "@/constant/date-time-format/DateTimeFormat";

const EditTimeModal = ({ show, onClose, startTime, editdate}) => {
  const modalRef = useRef();
  const params = useParams();
  const [selectedTime, setSelectedTime] = useState("");
  const [minTime, setMinTime] = useState("");
  const [loader, setLoader] = useState(false);

  // Handle clicking outside the modal to close it
  const handleClickOutside = (event) => {
    if (modalRef.current && !modalRef.current.contains(event.target)) {
      onClose();
    }
  };

  useEffect(() => {
    if (startTime) {
      setSelectedTime(formatTo24Hour(startTime ? startTime : ""));
    }

    // Set the minimum allowed time based on the current time
    const now = new Date();
    const hours = now.getHours();
    const minutes = now.getMinutes();
    const formattedMinTime = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
    setMinTime(formattedMinTime);
  }, [startTime]);

  useEffect(() => {
    if (show) {
      document.addEventListener("mousedown", handleClickOutside);
    } else {
      document.removeEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [show]);

  if (!show) return null;

  const handleTimeChange = (event) => {
    setSelectedTime(event.target.value);
  };

  const isPastTime = (time) => {
    const [hours, minutes] = time.split(":").map(Number);
    const selectedDateTime = new Date();
    selectedDateTime.setHours(hours, minutes, 0, 0);
    
    const now = new Date();
    return selectedDateTime < now;
  };

  const isToday = (date) => {
    const today = new Date().toISOString().split("T")[0];
    const editDate = new Date(date).toISOString().split("T")[0];
    
    return editDate === today;
  };
  
  const updateBookingTime = async () => {
    if (isToday(editdate) && isPastTime(selectedTime)) {
      toast.error("Selected time cannot be in the past.");
      return;
    }
    const body = {
      newBookingTime: selectedTime,
    };
    try {
      setLoader(true);
      const response = await updateBookingTimeApi(params?.id, body);
      if (response?.isSuccess) {
        toast.success("Booking Time Updated Successfully");
        onClose();
      } 
    } catch (error) {
      console.error("Error updating booking time:", error);

    } finally {
      setLoader(false);
    }
  };

  return (
    <>
      {loader && <Loader />}
      <div className="fixed flex items-end justify-center inset-0 bg-black bg-opacity-50 z-[99]">
        <div
          ref={modalRef}
          className="bg-white rounded-t-2xl px-7 shadow-lg w-full max-w-4xl xl:max-w-2xl lg:max-w-full pt-10 pb-5"
        >
          <div className="flex justify-between items-center mb-4">
            <button className="focus:outline-none">
              <i className="fas fa-chevron-left"></i>
            </button>
            <span className="text-xl font-bold">Select Time</span>
            <button className="focus:outline-none">
              <i className="fas fa-chevron-right"></i>
            </button>
          </div>

          <div className="flex justify-center py-4">
            <input
              type="time"
              className="outline-none border border-[#ccc] p-2 rounded-md w-full"
              value={selectedTime}
              min={minTime}  // Set the minimum time to prevent past times
              onChange={handleTimeChange}
            />
          </div>

          <div className="flex mt-4">
            <button
              onClick={onClose}
              className="border border-primaryColor-900 text-black font-semibold py-2 rounded mr-2 w-[50%]"
            >
              Cancel
            </button>
            <button
              onClick={updateBookingTime}
              className="bg-black text-white py-2 rounded w-[50%]"
            >
              Save
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default EditTimeModal;
