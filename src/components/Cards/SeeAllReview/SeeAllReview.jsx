import Images from "@/constant/Images";

const SeeAllReview = ({ overallRating, cleanlinessRating, accuracyRating }) => {
  // Calculate percentage for each rating
  const ratingCounts = {
    5: overallRating[5] || 0,
    4: overallRating[4] || 0,
    3: overallRating[3] || 0,
    2: overallRating[2] || 0,
    1: overallRating[1] || 0,
  };

  const totalReviews = Object.values(ratingCounts).reduce(
    (acc, count) => acc + count,
    0
  );

  const calculateWidth = (rating) =>
    totalReviews > 0 ? (ratingCounts[rating] / totalReviews) * 100 : 0;

  return (
    <div className="mx-auto bg-white BoxShadow rounded-lg p-6 flex flex-wrap sm:gap-0 sm:rounded-lg sm:p-2">
      <div className="w-[45%] sm:w-[40%] border-r border-gray-100 pr-7 sm:pr-[10px]">
        <h2 className="text-lg font-medium mb-2 pl-3 lg:text-sm text-grey-800 sm:pl-[2px]">
          Overall Rating
        </h2>
        <div className="space-y-2 sm:space-y-[4px]">
          {[5, 4, 3, 2, 1].map((rating) => (
            <div className="flex items-center" key={rating}>
              <span className="w-6 text-right mr-2 text-grey-800 sm:w-[12px] sm:mr-[5px] sm:leading-none">
                {rating}
              </span>
              <div className="w-full bg-gray-200 rounded-full h-2 sm:h-[4px]">
                <div
                  className="bg-gray-800 h-2 rounded-full sm:h-[4px]"
                  style={{ width: `${calculateWidth(rating)}%` }}
                ></div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Cleanliness */}
      <div className="flex w-[55%] sm:w-[60%] 4xl:justify-center">
        <div className="w-[50%] flex lg:items-center items-center border-r border-gray-100 px-8 flex-col sm:px-2 justify-center">
          <div className="w-16 h-16 bg-gray-100 flex items-center justify-center rounded-lg mb-2 sm:w-10 sm:h-10 sm:rounded-md">
            <img src={Images.Cleanliness} alt="Cleanliness" />
          </div>
          <h2 className="text-lg font-medium text-grey-800 sm:text-sm">
            Cleanliness
          </h2>
          <p className="text-xl font-semibold text-grey-700 sm:text-sm">
            {cleanlinessRating}
          </p>
        </div>
        {/* Accuracy */}
        <div className="w-[50%] flex items-center justify-center border-gray-100 px-8 flex-col sm:px-2">
          <div className="w-16 h-16 bg-gray-100 flex items-center justify-center rounded-lg mb-2 sm:w-10 sm:h-10 sm:rounded-md">
            <img src={Images.correct} alt="correct icon" />
          </div>
          <h2 className="text-lg font-medium text-grey-800 sm:text-sm">
            Accuracy
          </h2>
          <p className="text-xl font-semibold text-grey-700 sm:text-sm">
            {accuracyRating}
          </p>
        </div>
      </div>
    </div>
  );
};

export default SeeAllReview;
