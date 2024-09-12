import { addAddressApi } from "@/utills/service/authService";
import { useState, useEffect } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import toast from "react-hot-toast";
import Loader from "@/components/Loader";
import Image from "../../constant/Images";
import { useGeolocated } from "react-geolocated";
import Dropdown from "@/components/statecitycountry/DropDown";

const Address = () => {
  const [countries, setCountries] = useState([]);
  const [states, setStates] = useState([]);
  const [cities, setCities] = useState([]);
  const [selectedCountry, setSelectedCountry] = useState(null);
  const [selectedState, setSelectedState] = useState(null);
  const [selectedCity, setSelectedCity] = useState(null);

  const [loader, setLoader] = useState(false);

  const [zipCode, setZipCode] = useState("");
  const navigate = useNavigate();
  const params = useParams();

  const { coords, getPosition, isGeolocationAvailable, isGeolocationEnabled } = useGeolocated({
    positionOptions: { enableHighAccuracy: false },
    userDecisionTimeout: 5000,
    watchPosition: false,
    suppressLocationOnMount: true,
    onError: (error) => {
      setLoader(false);
      if (error.code === 1) {
        toast("Please allow location permissions in your browser.", {
          duration: 4000,
        });
      } else {
        toast("Error fetching location. Please try again.", {
          duration: 4000,
        });
      }
    },
  });

  const addAddress = async () => {
    const id = params?.id;

    if (!selectedCountry || !selectedCountry.name) {
      toast.error("Please Select Country");
      return;
    }

    if (!selectedState || !selectedState.name) {
      toast.error("Please Select State");
      return;
    }

    if (!selectedCity) {
      toast.error("Please Select City");
      return;
    }

    const data = {
      country: selectedCountry.name,
      State: selectedState?.name,
      city: selectedCity,
      zipCode,
    };

    try {
      setLoader(true);
      const response = await addAddressApi(id, data);
      if (response?.isSuccess) {
        toast.success(response?.message);
        navigate("/user/dashboard");
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoader(false);
    }
  };

  const getLocationFromLatLong = async (lat, lng) => {
    const apiUrl = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&addressdetails=1`;
    try {
      const response = await fetch(apiUrl);
      const data = await response.json();
      if (data && data.address) {
        const { country, city, city_district, postcode } = data.address;
        const userId = params?.id;
        const payload = {
          country: country,
          State: city,
          city: city_district,
          zipCode: postcode,
        };

        try {
          setLoader(true);

          const response = await addAddressApi(userId, payload);
          if (response?.isSuccess) {
            toast.success(response?.message);
            navigate("/user/dashboard");
          }
        } catch (error) {
          console.error(error);
        } finally {
          setLoader(false);
        }
      } else {
        toast.error("Unable to fetch location details.");
      }
    } catch (error) {
      console.error("Geocoding error: ", error);
      toast.error("Error fetching location details.");
    }
  };

  const getCurrentLocation = async () => {
    if (!isGeolocationAvailable) {
      toast.error("Geolocation is not supported by your browser.");
      return;
    }

    if (!isGeolocationEnabled) {
      toast.error("Geolocation is disabled. Please enable it in your browser settings.");
      return;
    }

    setLoader(true);
    getPosition();
  };

  useEffect(() => {
    if (coords && coords.latitude && coords.longitude) {
      getLocationFromLatLong(coords.latitude, coords.longitude);
    }
  }, [coords]);

  useEffect(() => {
    fetch("/countries.json")
      .then((response) => response.json())
      .then((data) => {
        const countryList = data.map((country) => ({
          name: country.name,
          code: country.isoCode,
        }));
        setCountries(countryList);
      })
      .catch((error) => console.error("Error fetching countries:", error));
  }, []);

  useEffect(() => {
    if (selectedCountry) {
      fetch("/states.json")
        .then((response) => response.json())
        .then((data) => {
          const filteredStates = data.filter((state) => state.countryCode === selectedCountry.code);
          setStates(
            filteredStates.map((state) => ({
              name: state.name,
              code: state.isoCode,
            }))
          );
          setSelectedState(null);
          setSelectedCity(null);
          setCities([]);
        })
        .catch((error) => console.error("Error fetching states:", error));
    } else {
      setStates([]);
      setCities([]);
      setSelectedState(null);
      setSelectedCity(null);
    }
  }, [selectedCountry]);

  useEffect(() => {
    if (selectedState) {
      fetch("/cities.json")
        .then((response) => response.json())
        .then((data) => {
          const filteredCities = data.filter((city) => city.stateCode === selectedState.code && city.countryCode === selectedCountry.code);
          setCities(
            filteredCities.map((city) => ({
              name: city.name,
            }))
          );
          setSelectedCity(null);
        })
        .catch((error) => console.error("Error fetching cities:", error));
    } else {
      setCities([]);
      setSelectedCity(null);
    }
  }, [selectedState, selectedCountry]);

  return (
    <>
      {loader && <Loader />}
      <div className="w-[50%] mx-auto lg:max-w-full">
        <div className="py-1 "></div>
        <div className="flex flex-col gap-2 my-3 gap-y-4 relative">
          <h1 className="text-textMainColor-900 font-medium">Address</h1>
          <div className="flex flex-col gap-2 my-3">
            <div className="flex flex-col gap-2 my-3">
              <label htmlFor="exp-name" className="font-semibold">
                Country
              </label>
              <Dropdown
                data={countries.map((c) => c.name)}
                selectedValue={selectedCountry?.name || ""}
                onChange={(name) => {
                  const country = countries.find((c) => c.name === name);
                  setSelectedCountry(country || null);
                }}
                placeholder="Select Country"
              />

              <label htmlFor="exp-name" className="font-semibold">
                State
              </label>
              <Dropdown
                data={states.map((s) => s.name)}
                selectedValue={selectedState?.name || ""}
                onChange={(name) => {
                  const state = states.find((s) => s.name === name);
                  setSelectedState(state || null);
                }}
                placeholder="Select State"
                disabled={!selectedCountry}
              />

              <label htmlFor="exp-name" className="font-semibold">
                City
              </label>
              <Dropdown data={cities.map((c) => c.name)} selectedValue={selectedCity || ""} onChange={setSelectedCity} placeholder="Select City" disabled={!selectedState} />
            </div>

            <div className="flex flex-col gap-y-1">
              <label htmlFor="zipcode" className="text-primaryColor-900">
                Zip Code
              </label>
              <input type="number" name="zipcode" value={zipCode} onChange={(e) => setZipCode(e.target.value)} id="zipcode" className="input" placeholder="93940" />
            </div>

            <div className="use-current-location flex gap-x-2 items-center leading-none cursor-pointer" onClick={getCurrentLocation}>
              <img src={Image.iconCurrentLocation} alt="Use current location" />
              Use current location
            </div>
          </div>

          <p className="w-full cursor-pointer text-center mt-20 my-2 underline text-primaryColor-900">
            <Link to="/user/dashboard">Skip</Link>
          </p>

          <div onClick={addAddress}>
            <button className="cursor-pointer w-full bg-primaryColor-900 p-4 text-center text-white mt-2 rounded-xl">Done</button>
          </div>
        </div>
      </div>
    </>
  );
};

export default Address;
