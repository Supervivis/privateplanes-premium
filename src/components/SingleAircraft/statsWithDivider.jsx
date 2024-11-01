const StatsWithDivider = ({ 
  statOneTitle, statOneContent, 
  statTwoTitle, statTwoContent,
  statThreeTitle, statThreeContent,
  statFourTitle, statFourContent,
  statFiveTitle, statFiveContent,
  statSixTitle, statSixContent,
  statSevenTitle, statSevenContent,
  statEightTitle, statEightContent
}) => {

  const statComponent = (title, content) => {
    return (
      <div className="flex justify-between">
        <p>{title}</p>
        <p className="text-right md:text-left">{content}</p>
      </div>
    )
  }

  return (
    <div className="grid md:grid-cols-2 w-full">
      <div className="md:pr-6 py-6 md:border-r-2 border-[#DEDEDE] flex flex-col gap-4">
        {statOneTitle && statComponent(statOneTitle, statOneContent)}
        {statTwoTitle && statComponent(statTwoTitle, statTwoContent)}
        {statThreeTitle && statComponent(statThreeTitle, statThreeContent)}
        {statFourTitle && statComponent(statFourTitle, statFourContent)}
      </div>

      <div className="md:pl-6 py-6 flex flex-col gap-4">
        {statFiveTitle && statComponent(statFiveTitle, statFiveContent)}
        {statSixTitle && statComponent(statSixTitle, statSixContent)}
        {statSevenTitle && statComponent(statSevenTitle, statSevenContent)}
        {statEightTitle  && statComponent(statEightTitle, statEightContent)}
      </div>
    </div>
  );
};

export default StatsWithDivider;
