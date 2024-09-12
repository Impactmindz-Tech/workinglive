import HeaderBack from "@/components/HeaderBack";
import MainFilterMenu from "@/components/UserMenuBar/MainFilterMenu";

function MainFilters() {
  return (
    <div className="container">
      <HeaderBack link="/user/dashboard" text="Filters" />
      {/* <UserSearch /> */}
      <div className="w-full sm:w-auto overflow-x-auto">
        <MainFilterMenu />
      </div>
    </div>
  );
}

export default MainFilters;
