import { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { useLocation, useNavigate } from "react-router-dom";
import BookedCard from "@/components/Avatar/Card/ExperiencePageCards/BookedCard";
import CancelCard from "@/components/Avatar/Card/ExperiencePageCards/CancelCard";
import CompletedCard from "@/components/Avatar/Card/ExperiencePageCards/CompletedCard";
import OffersCard from "@/components/Avatar/Card/OffersCard";
import RequestedCard from "@/components/Avatar/Card/RequestCard";
import Loader from "@/components/Loader";
import { getRequestsApi } from "@/utills/service/avtarService/AddExperienceService";

const ExperiencePage = () => {
  const dispatch = useDispatch();
  const location = useLocation();
  const navigate = useNavigate();
  
  const tabs = ["Offers", "Requested", "Booked", "Completed", "Cancelled"];

  const [activeTab, setActiveTab] = useState("Requested");
  const [loading, setLoading] = useState(false);
  const [experienceStatus, setExperienceStatus] = useState(null);

 
  const getRequests = async (tab) => {
    setLoading(true);
    try {
      const response = await getRequestsApi(tab);
      if (response?.isSuccess) {
        setExperienceStatus(response); 
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };


  const handleTabClick = (tab) => {
    setActiveTab(tab); 
    navigate(`/avatar/experience?tab=${tab.toLowerCase()}`);
  };

  
  useEffect(() => {
    const searchParams = new URLSearchParams(location.search); 
    const tabFromUrl = searchParams.get("tab") || "requested"; 
    const capitalizedTab = tabFromUrl.charAt(0).toUpperCase() + tabFromUrl.slice(1);

    if (tabs.includes(capitalizedTab)) {
      setActiveTab(capitalizedTab); 
      getRequests(capitalizedTab); 
    } else {
      navigate("/avatar/experience?tab=requested");
    }
  }, [location.search]); 

  return (
    <>
      {loading && <Loader />} 
      <div className="">
        <div className="p-4 ">
          {/* Tab Navigation */}
          <div className="lg:overflow-x-auto lg:overflow-y-hidden border-b">
            <div className="flex border-b">
              {tabs.map((tab) => (
                <button
                  key={tab}
                  className={`px-4 py-2 text-sm font-medium border-b-2 ${
                    activeTab === tab
                      ? "border-primaryColor-900 text-primaryColor-900 font-bold"
                      : "border-transparent text-gray-500 hover:text-gray-700"
                  }`}
                  onClick={() => handleTabClick(tab)} // Update the active tab on click
                >
                  {tab}
                </button>
              ))}
            </div>
          </div>

          {/* Content Section */}
          <div className="my-5 grid grid-cols-3 md:grid-cols-1 xl:grid-cols-2 2xl:grid-cols-3 gap-4">
            {/* Render cards based on the experience data */}
            {experienceStatus?.data?.length > 0 ? (
              experienceStatus?.data?.map((item) => {
                const key = item?.expid || item?.id || Math.random(); // Generate a unique key

                switch (item?.status) {
                  case "Requested":
                    return <RequestedCard key={key} item={item} getRequests={getRequests} role="avatar" />;
                  case "Booked":
                    return <BookedCard key={key} item={item} role="avatar" />;
                  case "Completed":
                    return <CompletedCard key={key} item={item} role="avatar" />;
                  case "Cancelled":
                    return <CancelCard key={key} item={item} role="avatar" />;
                  case "Offers":
                    return <OffersCard key={key} item={item} />;
                  default:
                    return null;
                }
              })
            ) : (
              <h1 className="font-medium text-sm">No data found</h1> // Handle empty data case
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default ExperiencePage;
