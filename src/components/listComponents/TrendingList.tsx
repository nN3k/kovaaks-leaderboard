import { set } from "astro:schema";
import { useEffect, useState } from "react";
import config from "../../data/config.json";
import "../../styles/lists.css";
import icon from "../../assets/astro.svg"

const TrendingListComponent = () => {
    const trendingUrl = `https://kovaaks.com/webapp-backend/scenario/trending`;

    const [scenarios, setScenarios] = useState<any[]>([]);

    const playScenario = (event: any) => {
        const parsedScenarioName = event.target.parentNode.children[0].innerText.replace(/ /g, "%20");
        window.open(config.play_scenarios_url + parsedScenarioName, '_self');
    }


    useEffect(() => {
        const fetchTrendingScenarios = async () => {
            try {
                const response = await fetch(trendingUrl);
                const data = await response.json();
                const newScenarios = data.slice(0, 10).map((item: any) => [
                    item.scenarioName,
                    item.steamAccountName,
                    item.new === true ? `NEW` : item.entries,
                ]);
                setScenarios(newScenarios);
            } catch (error) {
                return (
                    <div>Error fetching trending scenarios</div>
                );
            }
        };
    
        fetchTrendingScenarios();
    }, []);

    return (
        <div className="listContainer">
            <table>
                <thead>
                    <tr>
                        <th>Name</th>
                        <th>Author</th>
                        <th>Entries</th>
                        <th></th>
                    </tr>
                </thead>
                <tbody>
                    {scenarios.map(([name, author, entries], key) => (
                        <tr key={key} onClick={(e)=>playScenario(e)}>
                            <td>{name}</td>
                            <td>{author}</td>
                            <td>{entries}</td>
                            <td> <img src={icon.src}/> </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}
export default TrendingListComponent;