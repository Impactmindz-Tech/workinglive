import MobileNavigation from "@/components/mobile_navigation/MobileNavigation";
import Images from "@/constant/Images";
import { getLocalStorage, setLocalStorage } from "@/utills/LocalStorageUtills";
import { useCallback, useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import { getAllcountryApi } from "@/utills/service/userSideService/userService/UserHomeService";

const MainLayout = ({ children }) => {
  const [userCountry, setUserCountry] = useState("India");
  const navigate = useNavigate();
  const [countrys, setCountrys] = useState([]);
  const [selectedCountry, setSelectedCountry] = useState(getLocalStorage("selectedCountry") || getLocalStorage("user")?.Country);
  const location = useLocation();
  const pathname = location?.pathname;
  const handleCountryChange = useCallback(
    (e) => {
      const selected = e.target.value;
      setSelectedCountry(selected);
      setUserCountry(selected);
      setLocalStorage("selectedCountry", selected);
      window.dispatchEvent(new Event("storage"));
    },
    [pathname]
  );

  const getAllcountry = async () => {
    try {
      const response = await getAllcountryApi({ country: selectedCountry });
      if (response?.isSuccess) {
        setCountrys(response?.data);
      }
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    getAllcountry();
  }, [pathname, selectedCountry]);

  // redirect if login
  useEffect(() => {
    if (getLocalStorage("user")) {
      let role = getLocalStorage("user").Activeprofile;
      if (role == "avatar") {
        navigate("/avatar/dashboard");
      } else {
        navigate("/user/dashboard");
      }
    }
  }, []);
  return (
    <div className="container px-4 sm:px-0 lg:max-w-full">
      <header className="flex justify-between px-4 items-center my-6">
        <div className="brand">
          <Link to="/">
            <img src={Images.AvatarWalk} alt="AvatarWalk" />
          </Link>
        </div>
        <div>
          <Link to="/auth/login" className="block bg-grey-900 py-3 px-4 text-white font-medium rounded-lg lg:py-2  lg:text-sm">
            <button>Become a Avatar</button>
          </Link>
        </div>
      </header>

      {pathname == "/" && (
        <div className="flex justify-between px-4 items-center my-6">
          <div className="">
            <LocationOnIcon />
            <select value={selectedCountry} onChange={handleCountryChange} style={{ border: "none", outline: "none", fontWeight: 500 }}>
              <option>Your Location</option>
              {countrys?.map((item, index) => (
                <option key={index} value={item}>
                  {item}
                </option>
              ))}
            </select>
          </div>

          <Link to="/auth/login" className="bg-[#ff5454] py-[7px] text-white rounded-lg px-4  sm:px-5">
            <button className="flex gap-1 items-center">
              {" "}
              <span className="text-[10px] animate-pulse">
                <img src={Images.hotsport} alt="hosport" />
              </span>
              Live
            </button>
          </Link>
        </div>
      )}
      <div className="lg:pb-10">{children}</div>
      <MobileNavigation role="user" />
    </div>
    // <div className="container px-4 sm:px-0 lg:max-w-full md:pb-[100px] sm:pb-[70px]">
    //   {/* <Header /> */}
    //   {children}
    //   <MobileNavigation role="user" />
    // </div>
  );
};

export default MainLayout;
