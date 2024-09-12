import { useEffect, useState } from "react";
import NotificationCard from "@/components/Cards/NotificationCard";
import HeaderBack from "@/components/HeaderBack";
import Images from "@/constant/Images";
import { getNotificationApi, notificationApi } from "@/utills/service/userSideService/userService/UserHomeService";
import toast from "react-hot-toast";
import Loader from "@/components/Loader";

function Notification() {
  const [messageState, setMessageState] = useState(false);
  const [approvedTourState, setApprovedTourState] = useState(false);
  const [cancelledTourState, setCancelledTourState] = useState(false);
  const [newTourState, setNewTourState] = useState(false);
  const [supportState, setSupportState] = useState(false);
  const [loader, setLoader] = useState(false);

  const getNotification = async () => {
    setLoader(true);
    try {
      const res = await getNotificationApi();
      if (res?.isSuccess) {
        const { Message, Approvedtour, CancelledTour, NewTour, Support } = res.data;
        setMessageState(Message);
        setApprovedTourState(Approvedtour);
        setCancelledTourState(CancelledTour);
        setNewTourState(NewTour);
        setSupportState(Support);
      }
    } catch (error) {
      console.log("Error fetching notifications:", error);
    } finally {
      setLoader(false);
    }
  };

  const handleToggleState = async (stateName, newState) => {
    switch (stateName) {
      case "Message":
        setMessageState(newState);
        break;
      case "Approved Tour":
        setApprovedTourState(newState);
        break;
      case "Cancelled Tours":
        setCancelledTourState(newState);
        break;
      case "New Tour in Your Area":
        setNewTourState(newState);
        break;
      case "Support":
        setSupportState(newState);
        break;
      default:
        console.error("Unknown stateName:", stateName);
        return;
    }

    const body = {
      Message: stateName === "Message" ? newState : messageState,
      Approvedtour: stateName === "Approved Tour" ? newState : approvedTourState,
      CancelledTour: stateName === "Cancelled Tours" ? newState : cancelledTourState,
      NewTour: stateName === "New Tour in Your Area" ? newState : newTourState,
      Support: stateName === "Support" ? newState : supportState,
    };
    console.log(body);
    setLoader(true);
    try {
      const response = await notificationApi(body);
      if (response?.isSuccess) {
        toast.success("Notification setting updated successfully");
      }
    } catch (error) {
      console.error("Error updating notification states:", error);
    } finally {
      setLoader(false);
    }
  };

  useEffect(() => {
    getNotification();
  }, []);

  return (
    <>
      {loader && <Loader />}
      <div className="container">
        <HeaderBack link="/user/profile" text={"Notifications"} />
        <div className="containts">
          <NotificationCard icon={Images.multiMessages} title={"Message"} stateValue={messageState} onToggle={(newState) => handleToggleState("Message", newState)} />
          <NotificationCard icon={Images.correct} title={"Approved Tour"} stateValue={approvedTourState} onToggle={(newState) => handleToggleState("Approved Tour", newState)} />
          <NotificationCard icon={Images.closeCircle} title={"Cancelled Tours"} stateValue={cancelledTourState} onToggle={(newState) => handleToggleState("Cancelled Tours", newState)} />
          <NotificationCard icon={Images.locationNew} title={"New Tour in Your Area"} stateValue={newTourState} onToggle={(newState) => handleToggleState("New Tour in Your Area", newState)} />
          <NotificationCard icon={Images.support} title={"Support"} stateValue={supportState} onToggle={(newState) => handleToggleState("Support", newState)} />
        </div>
      </div>
    </>
  );
}

export default Notification;
