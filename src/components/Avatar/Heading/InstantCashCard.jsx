export default function InstantCashCard({
  title,
  subTitle,
  titlePrice,
  subTitlePrice,
}) {
  return (
    <div className="flex justify-between my-2 items-center">
      <div className="left">
        <h1 className="text-grey-900 sm:text-base">{title}</h1>
        <p className="text-grey-800 sm:text-sm">{subTitle}</p>
      </div>
      <div className="text-right">
        <h1 className="text-grey-900 sm:text-base">{titlePrice}</h1>
        <p className="text-grey-800 sm:text-sm">{subTitlePrice}</p>
      </div>
    </div>
  );
}
