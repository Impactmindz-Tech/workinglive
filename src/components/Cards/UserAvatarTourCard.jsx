import Images from "@/constant/Images";
import { Link } from "react-router-dom";

export default function UserAvatarTourCard({ tour }) {
  const formattedAvgRating = tour.avgRating ? tour.avgRating.toFixed(2) : "N/A";

  return (
    <Link to={`/user/book-experience/${tour?._id}`}>
      <div className="">
        <div className="images w-full">
          <img
            src={tour.thumbnail || Images.cardImageRounded}
            alt={`${tour.name} image`}
            className="w-full rounded-md aspect-[1.4] object-cover"
          />
        </div>
        <div className="flex items-start justify-between my-2">
          <div className="left">
            <h1 className="sm:text-sm">{tour?.ExperienceName}</h1>
            <p className="text-[#ababab]">{tour?.country}</p>
          </div>

          <div className="flex gap-2 items-center mt-[2px] sm:mt-0">
            <img
              src={Images.star2}
              alt="star"
              className="w-[20px] sm:w-[14px]"
            />
            <h1 className="text-lg sm:text-sm">{formattedAvgRating}</h1>
          </div>
        </div>
      </div>
    </Link>
  );
}
