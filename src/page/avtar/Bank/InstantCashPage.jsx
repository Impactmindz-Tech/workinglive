import AvatarBottomBtn from "@/components/Avatar/Button/AvatarBottomBtn";
import InstantCashCard from "@/components/Avatar/Heading/InstantCashCard";
import HeaderBack from "@/components/HeaderBack";
import Images from "@/constant/Images";
import { withdraw } from "@/utills/service/avtarService/HomeService";
import toast from "react-hot-toast";
import { getCurrencySymbol } from "@/constant/CurrencySign";

function InstantCashPage() {
  // Define the body data here if needed for the withdraw function
  const body = {
    // example data; replace with actual data
    amount: 230.4,
    currency: "USD",
    StripeId: "acct_1Prp8q2KmWNfTmjb",
  };

  const handleclick = async () => {
    try {
      const response = await withdraw(body);
    } catch (error) {
      // Handle errors from the API
      toast.error(
        error?.response?.data?.message || "An error occurred. Please try again."
      );
    }
  };

  return (
    <div className="container">
      <HeaderBack link="/avatar/profile" text={"Tour Cash Out"} />

      <div className="border-b pb-2">
        <InstantCashCard
          title="Analytics"
          subTitle="Batch pay"
          titlePrice={`${getCurrencySymbol()}106.76`}
          subTitlePrice={`${getCurrencySymbol()}106.76`}
        />
        <InstantCashCard
          title="Tips"
          subTitle="Final tips"
          titlePrice={`${getCurrencySymbol()}125.14`}
          subTitlePrice={`${getCurrencySymbol()}124.14`}
        />
        <InstantCashCard
          title="Instant Fee"
          subTitle="Cashout fee"
          titlePrice={`-${getCurrencySymbol()}0.50`}
          subTitlePrice={`-${getCurrencySymbol()}0.50`}
        />
        <InstantCashCard
          title="Total"
          subTitle=""
          titlePrice={`${getCurrencySymbol()}230.40`}
        />
      </div>

      <div className="flex items-center justify-between gap-5 my-5">
        <div className="img">
          <img src={Images.visa} alt="visa" />
        </div>
        <div className="flex-1 font-bold text-lg text-grey-900 sm:text-base">
          Visa...3498
        </div>

        <div className="font-bold underline underline-offset-4 cursor-pointer sm:text-base">
          Edit
        </div>
      </div>

      <div className="fixed bottom-6 left-0 w-full sm:bottom-[70px] md:bottom-[100px]">
        <div className="container">
          <div className="w-full flex justify-center">
            <button
              onClick={handleclick}
              className="font-bold lg:w-[90%] p-3 bg-backgroundFill-900 rounded-md text-white w-full"
            >
              Cash Out
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default InstantCashPage;
