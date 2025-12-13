import { changeSelectedScenarioId, changeSelectedScenarioName, scenarioSearchValue, selectedScenarioEntries } from "../../data/nanostores/stores";
import { useStore } from "@nanostores/react";
import "../../styles/lists.css"


const scenarioListComponent = () => {

    const scenarios = useStore(scenarioSearchValue);

    const displayClickedLeaderboard = (e: any) => {
        changeSelectedScenarioName(e.target.parentNode.children[0].innerText);
        changeSelectedScenarioId(e.target.id);
        selectedScenarioEntries.set(e.target.parentNode.children[1].innerText);
    }


    return(
        <div className="listContainer">
            <table>
                <thead>
                    <tr>
                        <th>Name</th>
                        <th>Entries</th>
                        <th>Highscore</th>
                    </tr>
                </thead>
                <tbody>
                    {scenarios.map((scenario, index) => (
                        <tr key={index} id={scenario[3]} className={scenario[0]} onClick={(e) => displayClickedLeaderboard(e)}>
                            <td id={scenario[3]}>{scenario[0]}</td>
                            <td id={scenario[3]}>{scenario[1]}</td>
                            <td id={scenario[3]}>{scenario[2]}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );

};

export default scenarioListComponent;