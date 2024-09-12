import TitleHeading from "@/components/Avatar/Heading/TitleHeading";
import { createOfferValidation } from "@/utills/formvalidation/FormValidation";
import { createOfferApi } from "@/utills/service/userSideService/OfferService";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { getCurrencySymbol } from "@/constant/CurrencySign";
import { useState, useEffect } from "react";
import toast from "react-hot-toast";
import Loader from "@/components/Loader";
import Dropdown from "@/components/statecitycountry/DropDown";

function Offers() {
  const [countries, setCountries] = useState([]);
  const [states, setStates] = useState([]);
  const [cities, setCities] = useState([]);
  const [selectedCountry, setSelectedCountry] = useState(null);
  const [selectedState, setSelectedState] = useState(null);
  const [selectedCity, setSelectedCity] = useState(null);
  const [error, setError] = useState({ country: false });

  const [loader, setLoader] = useState(false);

  const navigate = useNavigate();
  const {
    handleSubmit,
    register,
    formState: { errors },
  } = useForm({ resolver: yupResolver(createOfferValidation) });

  const onSubmit = async (formData) => {
    setError({ country: false });
    if (!selectedCountry || !selectedCountry.name) {
      setError({ country: true });
      return;
    }
    let body = {
      ...formData,
      Country: selectedCountry.name,
      City: selectedCity || "",
      State: selectedState?.name || "",
    };
    try {
      setLoader(true);
      const response = await createOfferApi(body);
      if (response?.isSuccess) {
        toast.success(response?.message);
        navigate("/user/offer-success");
      }
    } catch (error) {
      console.log(error);
    } finally {
      setLoader(false);
    }
  };

  // State country City

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
      <div className="container">
        <TitleHeading title={"Create Offer"} />
        <div className="forms">
          <form onSubmit={handleSubmit(onSubmit)} noValidate>
            <div className="flex gap-2 lg:flex-col lg:gap-0">
              <div className="mb-2 flex-1">
                <label htmlFor="Title" className="font-semibold">
                  Title
                </label>
                <input type="text" name="Title" id="Title" placeholder="Eg. shikara hotel, india" className="input my-1" {...register("Title")} />
                <p className="text-[red] sm:text-sm">{errors?.Title?.message}</p>
              </div>

              <div className="flex-1">
                <label htmlFor="price" className="font-semibold">
                  Price
                </label>
                <input type="number" name="price" id="price" placeholder={`Eg. ${getCurrencySymbol()}10`} className="input my-1" {...register("price")} />
                <p className="text-[red] sm:text-sm">{errors?.price?.message}</p>
              </div>
            </div>
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
              {error.country && <p className="text-danger font-medium">Please Select Country</p>}

              {/* State Dropdown */}
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

              {/* City Dropdown */}
              <label htmlFor="exp-name" className="font-semibold">
                City
              </label>
              <Dropdown data={cities.map((c) => c.name)} selectedValue={selectedCity || ""} onChange={setSelectedCity} placeholder="Select City" disabled={!selectedState} />
            </div>

            <div className="flex gap-2 lg:flex-col lg:gap-0">
              <div className="flex-1">
                <label htmlFor="ZipCode" className="font-semibold">
                  Zipcode
                </label>
                <input type="text" name="ZipCode" id="ZipCode" placeholder="93940" className="input my-1" {...register("ZipCode")} />
                <p className="text-[red] sm:text-sm">{errors?.ZipCode?.message}</p>
              </div>
              <div className="flex-1">
                <label htmlFor="Minutes" className="font-semibold">
                  Minutes
                </label>
                <input type="number" name="Minutes" id="Minutes" placeholder="Eg. 15" className="input my-1" {...register("Minutes")} />
                <p className="text-[red] sm:text-sm">{errors?.Minutes?.message}</p>
              </div>
            </div>

            <div>
              <label htmlFor="Notes" className="font-semibold">
                Notes
              </label>
              <textarea name="Notes" rows={5} id="Notes" className="input my-1 resize-none" placeholder="Tell the avatar what tour would you like" {...register("Notes")}></textarea>
              <p className="text-[red] sm:text-sm">{errors?.Notes?.message}</p>
            </div>

            <div className="my-2">
              <button className="w-full my-6 rounded-md bottom-1 m-auto left-0 right-0 p-3 cursor-pointer bg-backgroundFill-900 text-white text-center">Submit</button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
}

export default Offers;
