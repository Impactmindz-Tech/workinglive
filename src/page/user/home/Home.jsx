import { useState, useEffect, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import { setProducts } from "@/store/slice/experinceS/ExperinceSlice";
import UserTopSearch from "@/components/UserTopSearch/UserTopSearch";
import { userExperienceApi } from "@/utills/service/userSideService/userService/UserHomeService";
import ExperienceList from "./ExperienceList";
import Loader from "@/components/Loader";
import { getLocalStorage } from "@/utills/LocalStorageUtills";
import MultipleAddressModal from "@/components/Modal/MultipleAddressModal";
import InstantLiveRequestModal from "@/components/Modal/InstantLiveRequestModal";
import socket from "@/utills/socket/Socket";
import MeetingNotification from "@/components/Modal/MeetingNotification";
import InfiniteScroll from "react-infinite-scroll-component"; 
import { FadeLoader } from "react-spinners";
import { useNavigate, useLocation } from "react-router-dom"; 

const Home = () => {
  const navigate = useNavigate();
  const location = useLocation(); 

  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [currentPage, setCurrentPage] = useState(1);
  const [instantLiveModalState, setInstantLiveModalState] = useState(false);
  const [multipleAddressModalState, setMultipleAddressModalState] =
    useState(false);
  const [activeTab, setActiveTab] = useState("All");
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [meetlink, setmeetlink] = useState("");
  const [instant, setinstantrequest] = useState([]);
  const [item, setItemdata] = useState(null);
  const [showNotification, setShowNotification] = useState(false);
  const [localData, setLocalData] = useState([]);
  const [country, setCountry] = useState(
    getLocalStorage("selectedCountry") 
  );
  
  // Define tabs
  const tabs = [
    { key: "All", query: "all" },
    { key: "Popular", query: "popular" },
    { key: "Recommended", query: "recommended" },
    { key: "Mostbooked", query: "mostbooked" },
    { key: "Recent", query: "recent" }
  ];

  const userId = getLocalStorage("user")?._id;

  // Extract tab from URL query parameters
  const getQueryTab = () => {
    const searchParams = new URLSearchParams(location.search);
    return searchParams.get("tab")?.toLowerCase() || "all";
  };

  const fetchUserExperience = useCallback(
    async (tab, page) => {
      const country =
        getLocalStorage("selectedCountry") || getLocalStorage("user")?.Country||"India";
      const payload = {
        tab: tab,
        country: country,
        search: search,
        page: page,
        items_per_page: itemsPerPage,
      };
      try {
        const activeUserId = getLocalStorage("user")?._id;
        const response = await userExperienceApi(payload);

        if (response?.isSuccess) {
          let filterData = response.data.filter(
            (item) => item.avatarId !== activeUserId
          );
          let onlyAvailabilityData = filterData.filter(
            (item) => item.availability !== null
          );

          setLocalData((prevData) => {
            const mergedData = [...prevData, ...onlyAvailabilityData];

            const uniqueData = Array.from(
              new Map(mergedData.map((item) => [item._id, item])).values()
            );

            return uniqueData;
          });

          setTotalPages(Math.ceil(response.total_items / itemsPerPage));
        }
      } catch (error) {
        console.error(error);
      }
    },
    [country, search, itemsPerPage]
  );

  useEffect(() => {
    const activeTabQuery = getQueryTab(); // Get tab from URL query parameters
    setActiveTab(tabs.find((t) => t.query === activeTabQuery)?.key || "All"); // Set active tab

    setCurrentPage(1);
    setTotalPages(1);
    setLocalData([]);
    fetchUserExperience(activeTabQuery, 1); // Pass the tab query here
  }, [location.search, fetchUserExperience]); // Trigger on URL changes

  const handleTabClick = (tab) => {
    setActiveTab(tab);
    setCurrentPage(1);
    navigate(`/user/dashboard?tab=${tab.toLowerCase()}`);
    setLocalData([]); // Clear the previous data
  };

  const handleCountryUpdate = useCallback(() => {
    const storedCountry = getLocalStorage("selectedCountry")||"India";
    if (storedCountry && storedCountry !== country) {
      setCountry(storedCountry);
    }
  }, [country]);

  useEffect(() => {
    handleCountryUpdate();
    window.addEventListener("storage", handleCountryUpdate);
    return () => {
      window.removeEventListener("storage", handleCountryUpdate);
    };
  }, [handleCountryUpdate]);


  useEffect(() => {
    socket.emit("instantLive", userId);
    socket.emit("userOnline", userId);
    socket.on("getmeet", (data) => {
      setinstantrequest(data);

      if (data?.length !== 0) {
        setInstantLiveModalState(true);
      }
    });
    socket.on("requestAvatarApproved", (data) => {});
    socket.on("meetLink", (data) => {
      setmeetlink(data.link);
      setItemdata(data);
      if (data !== null) {
        setShowNotification(true);
      }
    });
    return () => {
      socket.emit("userOffline", userId);
      socket.off("instantLive");
    };
  }, [userId]);

  const fetchMoreData = () => {
    if (currentPage < totalPages) {
      setCurrentPage((prevPage) => prevPage + 1);
      const activeTabQuery = tabs.find((t) => t.key === activeTab)?.query;
      fetchUserExperience(activeTabQuery, currentPage + 1); // Fetch more data based on the active tab query
    }
  };

  const handleJoin = () => {
    window.open(meetlink, "_blank");
    setShowNotification(false);
  };

  const handleCancel = () => {
    setShowNotification(false);
  };

  return (
    <>
      {loading && <Loader />}
      <div className="container">
        <UserTopSearch onSearch={setSearch} />
        <div className="lg:overflow-x-auto lg:overflow-y-hidden border-b">
          <div className="flex border-b">
            {tabs.map(({ key }) => (
              <button
                key={key}
                className={`px-4 py-2 text-sm font-medium border-b-2 ${
                  activeTab === key
                    ? "border-primaryColor-900 text-primaryColor-900 font-bold"
                    : "border-transparent text-gray-500 hover:text-gray-700"
                }`}
                onClick={() => handleTabClick(key)} // Handle tab click properly
              >
                {key}
              </button>
            ))}
          </div>
        </div>
        <div className="-mx-4">
          <InfiniteScroll
            dataLength={localData?.length || 0}
            next={fetchMoreData}
            hasMore={currentPage < totalPages}
            className="px-4"
            loader={
              <div className="flex justify-center py-4 overflow-hidden">
                <FadeLoader color="#000" height={5} width={5} />
              </div>
            }
          >
            <div className="my-10 grid grid-cols-4 lg:grid-cols-2 sm:grid-cols-1 xl:grid-cols-2 gap-4">
              {localData?.length !== 0 ? (
                localData.map((product) => (
                  <ExperienceList key={product._id} product={product} />
                ))
              ) : (
                <h1 className="font-medium text-sm">No Data Found</h1>
              )}
            </div>
          </InfiniteScroll>
        </div>
      </div>
      <MultipleAddressModal
        multipleAddressModalState={multipleAddressModalState}
        setMultipleAddressModalState={setMultipleAddressModalState}
      />
      <InstantLiveRequestModal
        instanreq={instant}
        role={"user"}
        instantLiveModalState={instantLiveModalState}
        setInstantLiveModalState={setInstantLiveModalState}
      />
      <MeetingNotification
        show={showNotification}
        onClose={handleCancel}
        onJoin={handleJoin}
        data={item}
      />
    </>
  );
};

export default Home;
