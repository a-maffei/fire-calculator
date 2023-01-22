import "./App.css";
import { useEffect, useState } from "react";

function App() {
  /* UseState: to manage the state of the form and the state of our calculations
  UseEffect: perform logic each time the form re-renders and any of the values change in the form --> recalculate */

  /* Local Storage: somewhere in the web browser to store our state. We want the state to persist across browser sessions.
  Key-value pairs stored in the browser. With "getItem" we're going to get the value associated with the specified key. If not there, default value is provided */

  /* We store in a variable the initial value people will see upon visiting the page, either for the first time or not.
  If it's the first visit, it's a default value. If not, we'll get the value set from previous visit in the local storage with "get item" */

  const initialRetirementAge =
    Number(localStorage.getItem("retirementAge")) || 100;
  const initialTargetRetAmount =
    Number(localStorage.getItem("targetRetAmount")) || 0;
  const initialAnnualRetExp = Number(localStorage.getItem("annualRetExp")) || 0;
  const initialCurrentAge = Number(localStorage.getItem("currentAge")) || 35;
  const initialCurrentSavings =
    Number(localStorage.getItem("currentSavings")) || 10000;
  const initialContributions =
    Number(localStorage.getItem("contributions")) || 500;
  const initialContributionFreq =
    localStorage.getItem("contributionFreq") || "Monthly";
  const initialPreRetROR = Number(localStorage.getItem("preRetROR")) || 7;
  const initialPostRetROR = Number(localStorage.getItem("postRetROR")) || 7;
  const initialInflation = Number(localStorage.getItem("inflation")) || 2.9;

  /* We store the values set in the form and the two results of the calculations in a UseState */

  const [retirementAge, setRetirementAge] = useState(initialRetirementAge);
  const [targetRetAmount, setTargetRetAmount] = useState(
    initialTargetRetAmount
  );
  const [annualRetExp, setAnnualRetExp] = useState(initialAnnualRetExp);
  const [currentAge, setCurrentAge] = useState(initialCurrentAge);
  const [currentSavings, setCurrentSavings] = useState(initialCurrentSavings);
  const [contributions, setContributions] = useState(initialContributions);
  const [contributionFreq, setContributionFreq] = useState(
    initialContributionFreq
  );
  const [preRetROR, setPreRetROR] = useState(initialPreRetROR);
  const [postRetROR, setPostRetROR] = useState(initialPostRetROR);
  const [inflation, setInflation] = useState(initialInflation);

  /* We use the inbuilt method to format the Target Retirement Amount */

  const formatter = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "EUR",
    minimumFractionDigits: 2,
  });

  /* We create a function to calculate retirement age, which we'll call inside the UseEffect:
   1) calculate pre-retirement returns
   2) calculate annual contributions
   3) while the current balance is lower than the amount you need to retire
   > increase the current balance by adding one yearly contribution multiplied by pre-retirement returns
   > add one year to the "retirement age" variable
   4) the loop will stop when the current balance reaches the target balance */

  const calcRetirementAge = (updatedTargetRetAmt) => {
    const netPreRetReturn = (preRetROR - inflation) / 100;
    let currBalance = currentSavings;
    const annualCont =
      contributionFreq === "Annually" ? contributions : contributions * 12;
    let retAge = currentAge;

    while (currBalance < updatedTargetRetAmt) {
      currBalance = annualCont + currBalance * (1 + netPreRetReturn);
      retAge += 1;

      if (retAge > 200) break;
    }
    return retAge;
  };

  /* In the useEffect, we decide to watch [] all the variables we control in the form. If they change, we cue a re-render.
  The function called in the UE includes:
  - setting the updated values in their keys inside local storage
  - calculate amount needed to retire --> set state
  - calculate the retirement age via function above --> set state */

  useEffect(() => {
    localStorage.setItem("retirementAge", retirementAge);
    localStorage.setItem("targetRetAmount", targetRetAmount);
    localStorage.setItem("annualRetExp", annualRetExp);
    localStorage.setItem("currentAge", currentAge);
    localStorage.setItem("currentSavings", currentSavings);
    localStorage.setItem("contributions", contributions);
    localStorage.setItem("contributionFreq", contributionFreq);
    localStorage.setItem("preRetROR", preRetROR);
    localStorage.setItem("postRetROR", postRetROR);
    localStorage.setItem("inflation", inflation);

    let netPostRetReturn = (postRetROR - inflation) / 100;
    if (netPostRetReturn === 0) netPostRetReturn = 0.0000001;

    let updatedTargetRetAmt = annualRetExp / netPostRetReturn;

    setTargetRetAmount(updatedTargetRetAmt);

    const retAge = calcRetirementAge(updatedTargetRetAmt);

    setRetirementAge(retAge);
  }, [
    annualRetExp,
    currentAge,
    currentSavings,
    contributions,
    contributionFreq,
    postRetROR,
    preRetROR,
    inflation,
  ]);

  //Annual Retirement Expenses <= Target Retirement Amount * Net rate of Return
  // Target Retirement Amount >= Annual Retirement Expenses / Net rate of Return

  /* A most classic controlled form. The only values that don't involve event handler + setter are the ones that result from the calculations, so the two above. Those are set inside of the UseEffect, and merely displayed here as values within {}
  
  Each form input has:
  value = the useState value
  onChange = {(e) => setter(parseInt(e.target.value) || 0)}
  
  Explanation: parseInt = parses string into number. If empty string (no target value), that is falsy (NaN) and it could create errors, which we address with "|| 0"
  
  Number() --> expect to convert entire value from string to number;
  parseInt() --> converts only the number digits it finds within a string  */

  return (
    <div className="App">
      <h1>Financial Independence Calculator</h1>
      <h2>You can retire at age: {retirementAge} </h2>
      <div>Target retirement amount: {formatter.format(targetRetAmount)} </div>
      <form className="fire-calc-form">
        <label>
          Annual retirement expenses (today's dollars)
          <input
            type="number"
            value={annualRetExp}
            onChange={(e) => setAnnualRetExp(parseInt(e.target.value) || 0)}
          />
        </label>
        <label>
          Current age
          <input
            type="number"
            value={currentAge}
            onChange={(e) => setCurrentAge(parseInt(e.target.value) || 0)}
          />
        </label>
        <label>
          Current savings balance
          <input
            type="number"
            value={currentSavings}
            onChange={(e) => setCurrentSavings(parseInt(e.target.value) || 0)}
          />
        </label>
        <label>
          Regular contributions
          <input
            type="number"
            value={contributions}
            onChange={(e) => setContributions(parseInt(e.target.value) || 0)}
          />
        </label>
        <label>
          Contributions frequency
          <select onSelect={(e) => setContributionFreq(e.target.value)}>
            <option value="monthly">Monthly</option>
            <option value="annually">Annually</option>
          </select>
        </label>
        <div>
          <h2>Advanced</h2>
          <label>
            Pre-retirement rate of return
            <input
              type="number"
              value={preRetROR}
              onChange={(e) => setPreRetROR(parseInt(e.target.value) || 0)}
            />
          </label>
          <label>
            Post-retirement rate of return
            <input
              type="number"
              value={postRetROR}
              onChange={(e) => setPostRetROR(parseInt(e.target.value) || 100)}
            />
          </label>
          <label>
            Inflation
            <input
              type="number"
              value={inflation}
              onChange={(e) => setInflation(parseInt(e.target.value) || 0)}
            />
          </label>
        </div>
      </form>
    </div>
  );
}

export default App;
