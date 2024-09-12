import { useState, useEffect, useRef } from "react";
import EditDateCalendar from "../Calendar/EditDateCalendar";
import { bookingSlotsApi, updateBookingDateApi } from "@/utills/service/userSideService/userService/UserHomeService";
import toast from "react-hot-toast";
import { useParams } from "react-router-dom";
import Loader from "../Loader";
import { getLocalStorage } from "@/utills/LocalStorageUtills";

const DatePickerModal = ({ show, onClose, editdate }) => {
  const formatDate = (date) => {
    if (!date) return '';
    const d = new Date(date);
    return d.toISOString().split('T')[0]; 
  };
  const [selectedDate, setSelectedDate] = useState("");
  const [remainingSlots, setRemainingSlots] = useState([]);
  const [loader, setLoader] = useState(false);
  const modalRef = useRef();
  const params = useParams();

  useEffect(() => {
    if (editdate) {
      setSelectedDate(formatDate(editdate));
    }
  }, [editdate]);

  const bookingSlots = async (date) => {
    if (!date) return;

    const body = { bookingDate: date };
    setLoader(true);

    try {
      const response = await bookingSlotsApi(getLocalStorage("currentBooking"), body);
      if (response?.isSuccess) {
        const currentDate = new Date().toISOString().split("T")[0];
        const currentTime = new Date();

        const filteredSlots = response.remainingSlots.filter((slot) => {
          if (date === currentDate) {
            const [toHours, toMinutes] = slot.to.split(":").map(Number);
            const slotEndTime = new Date();
            slotEndTime.setHours(toHours, toMinutes, 0, 0);
            return slotEndTime > currentTime;
          }
          return true;
        });

        setRemainingSlots(filteredSlots);
      } else {
        toast.error("Failed to fetch booking slots.");
      }
    } catch (error) {
      console.error("Error fetching booking slots:", error);
    } finally {
      setLoader(false);
    }
  };

  const handleDateChange = (date) => {
    setSelectedDate(date);
  };

  const updateDateApi = async () => {
    const body = { newBookingDate: selectedDate };
    setLoader(true);

    try {
      const response = await updateBookingDateApi(params?.id, body);
      if (response?.isSuccess) {
        toast.success("Booking Date Updated Successfully");
        onClose();
      } else {
        toast.error("Failed to update booking date.");
      }
    } catch (error) {
      console.error("Error updating booking date:", error);
    } finally {
      setLoader(false);
    }
  };

  const handleClickOutside = (event) => {
    if (modalRef.current && !modalRef.current.contains(event.target)) {
      onClose();
    }
  };

  useEffect(() => {
    if (show) {
      document.addEventListener("mousedown", handleClickOutside);
      bookingSlots(selectedDate);
    } else {
      document.removeEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [show, selectedDate]);

  if (!show) return null;

  return (
    <>
      {loader && <Loader />}
      <div className="fixed flex items-end justify-center inset-0 bg-black bg-opacity-50 z-[99]">
        <div ref={modalRef} className="bg-white rounded-t-2xl px-7 shadow-lg w-full max-w-4xl xl:max-w-2xl lg:max-w-full p-3">
          <div className="flex justify-between items-center mb-4">
            <button className="focus:outline-none">
              <i className="fas fa-chevron-left"></i>
            </button>
            <span className="text-xl font-bold">Select Date</span>
            <button className="focus:outline-none">
              <i className="fas fa-chevron-right"></i>
            </button>
          </div>

          {/* Calendar Component */}
          <EditDateCalendar date={selectedDate} onDateChange={handleDateChange} />

          {/* Display available slots */}
          <div className="my-2">
            <div className="mb-2">
              <h3 className="text-lg font-semibold mb-2">Next availability:</h3>
              <div className="flex space-x-2">
                {remainingSlots.length > 0 ? (
                  remainingSlots.map((item, index) => (
                    <button key={index} className="p-3 text-black bg-gray-200 rounded-md md:p-2 md:px-2 md:text-sm">
                      {item?.from} - {item?.to}
                    </button>
                  ))
                ) : (
                  <span>No available slots</span>
                )}
              </div>
            </div>
          </div>

          {/* Selected Date Display */}
          <div className="mt-4">
            <label htmlFor="Date">Selected Date</label>
            <input type="text" id="Date" value={selectedDate} readOnly className="mt-2 w-full border rounded p-2" />
          </div>

          {/* Actions */}
          <div className="flex mt-4">
            <button onClick={onClose} className="border border-primaryColor-900 text-black font-semibold py-2 rounded mr-2 w-[50%]">
              Cancel
            </button>
            <button onClick={updateDateApi} className="bg-black text-white py-2 rounded w-[50%]">
              Save
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default DatePickerModal;
