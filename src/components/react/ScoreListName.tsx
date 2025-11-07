import { useStore } from "@nanostores/react";
import { selectedScenarioName } from "../../data/nanostore/stores";
import "../../styles/scoreListName.css";

const ScoreListNameComponent = () => {

  const selectedScenarioNAME = useStore(selectedScenarioName);

    return <p className="scenarioName">{selectedScenarioNAME}</p>;
};

export default ScoreListNameComponent;