export function checklistPoints(percent){return Math.round(Math.max(0,Math.min(100,Number(percent)||0))/10*10)/10}
export function uniformPenalty(consecutiveDays){const days=Math.max(0,Number(consecutiveDays)||0);return days}
export function calculateDailyScore({completionPercent=0,unaccounted=0,uniformViolations=[],inspectionPassed=true,submitted=true,bonus=0}){
  if(!submitted)return {base:0,penalties:0,bonus:0,total:0};
  const base=checklistPoints(completionPercent);
  const penalties=(Math.max(0,unaccounted)*5)+uniformViolations.reduce((n,d)=>n+uniformPenalty(d),0)+(inspectionPassed?0:10);
  return {base,penalties,bonus:Number(bonus)||0,total:Math.max(0,Math.round((base-penalties+(Number(bonus)||0))*10)/10)};
}
