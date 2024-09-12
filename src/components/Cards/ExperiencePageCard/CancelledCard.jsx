import {
  formatDate,
  formatTime,
} from "@/constant/date-time-format/DateTimeFormat";
import { claimRefundApi } from "@/utills/service/userSideService/userService/UserHomeService";
import { useState } from "react";
import { getCurrencySymbol } from "@/constant/CurrencySign";

const CancelledCard = ({ item }) => {
  const [disablePay, setDisablePay] = useState(false);

  const claimRefund = async (item) => {
    try {
      setDisablePay(true)
      let res=await claimRefundApi({bookingId:item?.bookingId})
      // if(res?.isSuccess){
      //   console.log(res)
      // }
    } catch (error) {
      console.log(error)
    }
    finally{
      setDisablePay(false)
    }
  };
  return (
    <div className="p-4 sm:p-0 sm:mt-2">
      <div className="BoxShadowLessRounded pb-2">
        <div className="flex items-start gap-4 p-4 sm:flex-wrap">
          <div className="sm:w-[100%] ">
            <img
              src={item?.experienceImage}
              alt="cardImageRounded"
              className="w-30 h-[100px] sm:w-full object-cover sm:h-[200px] rounded-lg"
            />
          </div>
          <div className="w-[80%] sm:w-[100%]">
            <div className="flex justify-between">
              <div className="text-[#ff3544] bg-[#ffebec] pt-[4px] pb-[5px] px-[10px] rounded-full text-xs font-medium">
                Cancelled By: {item?.cancelledBy}
              </div>
            </div>
            <h2 className="text-lg font-bold pt-3 sm:text-sm">
              {item?.experienceName}, {item?.country}
            </h2>
            <div className="description flex gap-2 items-center sm:flex-wrap">
              <p className="text-xs text-black">
                {formatDate(item?.bookingDate)}
              </p>
              <li className="text-grey-800">
                <span className="text-black text-xs">
                  {formatTime(item?.bookingTime)} - {formatTime(item?.endTime)}
                </span>
              </li>
            </div>
          </div>
        </div>
        <div className="borderTopBottom flex justify-between m-auto w-[94%] py-2 text-grey-800">
          <div className="author  ">
            <b>Avatar</b>: {item?.avatarName}
          </div>
          <div className="font-bold">
            {getCurrencySymbol()}
            {item?.totalPrice}
          </div>
        </div>

        <button
          className={`flex justify-center items-center py-3 gap-2 rounded w-[94%] my-2 m-auto ${
            disablePay
              ? "bg-gray-400 text-gray-600"
              : "bg-backgroundFill-900 text-white"
          }`}
          onClick={() => claimRefund(item)}
        >
          Claim Refund
        </button>
      </div>
    </div>
  );
};

export default CancelledCard;
