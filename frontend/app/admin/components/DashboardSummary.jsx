const DashboardSummary = ({ data }) => {
  const cards = [
    {
      title: "Total Resources",
      value: data.totalResources,
      color: "text-blue-400",
    },
    {
      title: "Pending Proposals",
      value: data.pendingProposals,
      color: "text-yellow-400",
    },
    {
      title: "Approved Requests",
      value: data.approvedRequests,
      color: "text-green-400",
    },
    {
      title: "Rejected Requests",
      value: data.rejectedRequests,
      color: "text-red-400",
    },
    {
      title: "Current Occupancy",
      value: data.currentOccupancy,
      color: "text-purple-400",
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
      {cards.map((card, index) => (
        <div
          key={index}
          className="bg-gray-900 p-4 rounded-lg border border-gray-700"
        >
          <h3 className="text-sm text-gray-400 mb-2">{card.title}</h3>
          <p className={`text-2xl font-bold ${card.color}`}>{card.value}</p>
        </div>
      ))}
    </div>
  );
};

export default DashboardSummary;
