import HeaderBack from "@/components/HeaderBack";
import { formatTime } from "@/constant/date-time-format/DateTimeFormat";
import Images from "@/constant/Images";
import { Drawer } from "@mui/material";
import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import moment from "moment";
import { loadStripe } from "@stripe/stripe-js";
import { checkout } from "@/utills/service/userSideService/userService/UserHomeService";
import { getCurrencySymbol } from "@/constant/CurrencySign";

function PaymentPage({ setPayemntDetails, payemntDetails, tourDetails }) {
  const [disableStart, setDisableStart] = useState(true);
  const [disableCancel, setDisableCancel] = useState(false);
  const [countdown, setCountdown] = useState("");
  const [totalCharges, setTotalCharges] = useState(0);
  // const tourDetails = useSelector((state) => state.avatar.tourDetails);

  const [role, setRole] = useState({
    paypal: true,
    applePay: false,
    mastercard: false,
  });

  const changeSelectedState = (name) => {
    if (name == "paypal") {
      setRole({
        mastercard: false,
        applePay: false,
        stripe: false,
        paypal: true,
      });
    } else if (name == "mastercard") {
      setRole({
        mastercard: true,
        applePay: false,
        stripe: false,
        paypal: false,
      });
    } else if (name == "stripe") {
      setRole({
        mastercard: false,
        applePay: false,
        paypal: false,
        stripe: true,
      });
    } else {
      setRole({
        mastercard: false,
        applePay: true,
        paypal: false,
        stripe: false,
      });
    }
  };

  useEffect(() => {
    if (!tourDetails?.endTime) return;

    const targetTime = moment(tourDetails?.endTime, "YYYY-MM-DDTHH:mm:ss");

    const updateTimer = () => {
      const now = moment();
      const diff = targetTime.diff(now);

      if (diff <= 0) {
        setCountdown("00:00:00");
        setDisableStart(false);
        setDisableCancel(true);
        clearInterval(timerInterval);
      } else {
        const duration = moment.duration(diff);
        const hours = Math.floor(duration.asHours());
        const minutes = duration.minutes();
        const seconds = duration.seconds();
        setCountdown(
          `${hours.toString().padStart(2, "0")} : ${minutes
            .toString()
            .padStart(2, "0")} : ${seconds.toString().padStart(2, "0")}`
        );
        // calculate charges
        const totalMinutes = hours * 60 + minutes;
        const charges = totalMinutes * tourDetails?.ExpId?.AmountsperMinute;
        setTotalCharges(charges.toFixed(2));
      }
    };

    const timerInterval = setInterval(updateTimer, 1000);

    // Initial update
    updateTimer();

    // Clean up interval on component unmount
    return () => clearInterval(timerInterval);
  }, [tourDetails?.endTime]);

  const handlecheckout = async () => {
    if (role === "stripe") {
      const stripe = await loadStripe(import.meta.env.VITE_APP_STRIPEKEY);
      let body = {
        bookingId: tourDetails?.expId,
        avatarId: tourDetails?.avatarId,
        // price: total + percentage,
        product: tourDetails?.ExpId.ExperienceName,
        productId: tourDetails?.packageIds,
        Adminfee: tourDetails?.Adminfee,
        paymentType: "stripe",
      };
      try {
        setLoader(true);
        let senddata = await checkout(body);
        const result = stripe.redirectToCheckout({
          sessionId: senddata.id,
        });
      } catch (err) {
        console.log(err);
      } finally {
        setLoader(false);
      }
    }
  };

  return (
    <Drawer
      anchor="right"
      open={payemntDetails}
      onClose={() => setPayemntDetails(false)}
    >
      <div className="container px-10 py-10 sm:py-6 min-lg:w-[40vw] sm:w-[280px] sm:max-w-none sm:px-4">
        <header className="flex items-center mt-2">
          <div
            className="border cursor-pointer border-[#cccccc] w-[50px] h-[50px] sm:w-[36px] sm:h-[36px] p-2 rounded-full flex items-center justify-center"
            onClick={() => setPayemntDetails(false)}
          >
            <img
              src={Images.arrowLeft}
              alt="arrowLeft icon"
              className="cursor-pointer"
            />
          </div>
          <div className="flex-1 flex justify-center 2xl:text-lg font-bold 4xl:text-xl">
            {"Payment"}
          </div>
        </header>

        <div className="mt-5 rounded-lg p-5 bg-[#add8e650] sm:p-3">
          <h1 className="sm:text-base">
            <span className="font-normal">Experience Name:</span>{" "}
            {tourDetails?.ExpId?.ExperienceName}
          </h1>
          <h1 className="sm:text-base">
            <span className="font-normal">Avatar Name:</span>{" "}
            {tourDetails?.ExpId?.avatarName}
          </h1>
          <h1 className="sm:text-base">
            <span className="font-normal">Amounts per Minute:</span>{" "}
            {tourDetails?.ExpId?.AmountsperMinute}
          </h1>
          <h1 className="sm:text-base">
            <span className="font-normal">end Time:</span>{" "}
            {formatTime(tourDetails?.endTime)}
          </h1>
          <h1 className="sm:text-base">
            <span className="font-normal">Booking Time:</span>{" "}
            {formatTime(tourDetails?.BookingTime)}
          </h1>
          <h1 className="sm:text-base">
            <span className="font-normal">Remaning Time:</span> {countdown}
          </h1>
          <h1 className="sm:text-base">
            <span className="font-normal">Total charges:</span>{" "}
            {getCurrencySymbol()} {totalCharges}
          </h1>
        </div>
        <div className="flex flex-col gap-5 pt-5 sm:gap-2">
          <div
            className={`cursor-pointer ${role.paypal ? "border border-grey-900" : "border border-[#ccc]"
              } flex items-center gap-2  p-5 rounded-3xl relative sm:p-3 sm:rounded-lg text-sm`}
            onClick={() => changeSelectedState("paypal")}
          >
            <img className="w-10 sm:w-6" src={Images.paypal} alt="paypal" />
            <span className="text-primaryColor-900 font-bold">PayPal</span>

            {role.paypal && (
              <div className="tick bg-[#757575] rounded-full p-1 absolute right-5">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-6 w-6 text-white sm:w-4 sm:h-4"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              </div>
            )}
          </div>
          <div
            className={`cursor-pointer ${role.stripe ? "border border-grey-900" : "border border-[#ccc]"
              } flex items-center gap-2  p-5 rounded-3xl relative sm:p-3 sm:rounded-lg text-sm`}
            onClick={() => changeSelectedState("stripe")}
          >
            <img className="w-10 sm:w-6" src={Images.paypal} alt="paypal" />
            <span className="text-primaryColor-900 font-bold">Stripe</span>

            {role.stripe && (
              <div className="tick bg-[#757575] rounded-full p-1 absolute right-5">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-6 w-6 text-white sm:w-4 sm:h-4"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              </div>
            )}
          </div>

          <div
            className={`cursor-pointer ${role.applePay ? "border border-grey-900" : "border border-[#ccc]"
              } flex items-center gap-2  p-5 rounded-3xl relative sm:p-3 sm:rounded-lg text-sm`}
            onClick={() => changeSelectedState("applePay")}
          >
            <img className="w-10 sm:w-6" src={Images.applePay} alt="applePay" />
            <span className="text-primaryColor-900 font-bold">Apple Pay</span>
            {role.applePay && (
              <div className="tick bg-[#757575] rounded-full p-1 absolute right-5">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-6 w-6 text-white sm:w-4 sm:h-4"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              </div>
            )}
          </div>

          <div
            className={`cursor-pointer ${role.mastercard
                ? "border border-grey-900"
                : "border border-[#ccc]"
              } flex items-center gap-2 p-5 rounded-3xl relative  sm:p-3 sm:rounded-lg text-sm`}
            onClick={() => changeSelectedState("mastercard")}
          >
            <img
              className="w-10 sm:w-6"
              src={Images.mastercard}
              alt="mastercard"
            />
            <span className="text-primaryColor-900 font-bold">
              **** **** **** 6918
            </span>

            {role.mastercard && (
              <div className="tick bg-[#757575] rounded-full p-1 absolute right-5">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-6 w-6 text-white sm:w-4 sm:h-4"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              </div>
            )}
          </div>

          <div onClick={handlecheckout}>
            <button className="cursor-pointer w-full border border-primaryColor-900 p-4 text-center text-grey-900 mt-8 rounded-xl font-bold sm:p-3 sm:rounded-lg sm:text-sm">
              Add New Card
            </button>
          </div>
        </div>
      </div>
    </Drawer>
  );
}

export default PaymentPage;
