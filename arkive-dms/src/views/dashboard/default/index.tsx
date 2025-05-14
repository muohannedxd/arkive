import MiniCalendar from "components/calendar/MiniCalendar";
import WeeklyRevenue from "views/dashboard/default/components/WeeklyRevenue";
import TotalSpent from "views/dashboard/default/components/TotalSpent";
import PieChartCard from "views/dashboard/default/components/PieChartCard";
import { IoMdHome } from "react-icons/io";
import { IoDocuments } from "react-icons/io5";
import { MdBarChart, MdDashboard } from "react-icons/md";

import Widget from "components/widget/Widget";
import ComplexTable from "views/dashboard/default/components/ComplexTable";
import tableDataComplex from "./variables/tableDataComplex";

const Dashboard = () => {
  return (
    <div className="mt-3 mb-6">
      {/* Card widget */}

      <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-3 3xl:grid-cols-6">
        <Widget
          icon={<MdBarChart className="h-7 w-7" />}
          title={"Earnings"}
          subtitle={"$340.5"}
        />
        <Widget
          icon={<IoDocuments className="h-6 w-6" />}
          title={"Spend this month"}
          subtitle={"$642.39"}
        />
        <Widget
          icon={<MdBarChart className="h-7 w-7" />}
          title={"Sales"}
          subtitle={"$574.34"}
        />
        <Widget
          icon={<MdDashboard className="h-6 w-6" />}
          title={"Your Balance"}
          subtitle={"$1,000"}
        />
        <Widget
          icon={<MdBarChart className="h-7 w-7" />}
          title={"New Tasks"}
          subtitle={"145"}
        />
        <Widget
          icon={<IoMdHome className="h-6 w-6" />}
          title={"Total Projects"}
          subtitle={"$2433"}
        />
      </div>

      {/* Charts */}

      {
        <div className="mt-5 grid grid-cols-1 gap-5 md:grid-cols-2">
          <TotalSpent />
          <WeeklyRevenue />
        </div>
      }

      {/* Tables & Charts */}

      <div className="mt-5 grid grid-cols-1 gap-5 xl:grid-cols-2">
        {/* Calendar & Pie Chart */}

        {
          <div className="grid grid-cols-1 gap-5 rounded-[20px] md:grid-cols-2">
            <PieChartCard />
            <MiniCalendar />
          </div>
        }

        {/* Complex Table */}

        <ComplexTable tableData={tableDataComplex} />

      </div>
    </div>
  );
};

export default Dashboard;
