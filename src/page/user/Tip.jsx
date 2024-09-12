import BlackBottomButton from "@/components/Button/BlackBottomButton";
import HeaderBack from "@/components/HeaderBack";
import Loader from "@/components/Loader";
import ConfirmPaymentForm from "@/components/Payment Card/Confirm_Page_Payment";
import { sendTipPaypalApi, sendTipStripeApi } from "@/utills/service/userSideService/userService/UserHomeService";
import { useState } from "react";
import { useLocation } from "react-router-dom";
import { loadStripe } from "@stripe/stripe-js";
function Tip() {
  const [selectedMethod, setSelectedMethod] = useState("stripe");
  const [loader, setLoader] = useState(false);
  const location = useLocation();
  const [data, setData] = useState(location?.state);

  const handlecheckout = async () => {
    // Stripe Pay TIP
    if (selectedMethod == "stripe") {
      const stripe = await loadStripe(import.meta.env.VITE_APP_STRIPEKEY);
      const body = {
        avatarId: data.res.message.avatarId,
        bookingId: data.res.message.ExperienceId,
        tip: data.res.message.AmmountTip,
        paymentType: selectedMethod,
      };
      try {
        setLoader(true);
        let res = await sendTipStripeApi(body);

        if (res?.isSuccess) {
          const result = stripe.redirectToCheckout({
            sessionId: res.id,
          });
        }
      } catch (error) {
        console.log(error);
      } finally {
        setLoader(false);
      }
      // PayPal Pay TIP
    } else {
      const body = {
        avatarId: data.res.message.avatarId,
        bookingId: data.res.message.ExperienceId,
        tip: data.res.message.AmmountTip,
        paymentType: selectedMethod,
      };
      try {
        setLoader(true);
        let res = await sendTipPaypalApi(body);
        if (res?.isSuccess) {
          window.location.href = res.url;
        }
      } catch (error) {
        console.log(error);
      } finally {
        setLoader(false);
      }
    }
  };

  return (
    <>
      {loader && <Loader />}
      <div className="container">
        <HeaderBack link="/user/rate-tour" text={"Tip"} />
        <div className=" m-auto mt-5">
          <ConfirmPaymentForm setSelectedMethod={setSelectedMethod} selectedMethod={selectedMethod} />
          <div className="m-auto" onClick={() => handlecheckout()}>
            <BlackBottomButton link={"/user/tip"} text={"Pay"} />
          </div>
        </div>
      </div>
    </>
  );
}

export default Tip;
