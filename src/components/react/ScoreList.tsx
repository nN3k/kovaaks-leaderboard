import { useStore } from "@nanostores/react";
import { selectedScenarioId, selectedScenarioName } from "../../data/nanostore/stores";
import { useEffect, useState } from "react";

const ScoreList = () => {
  const selectedScenarioID = useStore(selectedScenarioId);
  const selectedScenarioNAME = useStore(selectedScenarioName);
  const [top50, setTop50] = useState<any[]>([]);

  useEffect(() => {
    if (!selectedScenarioId) return; // guard for initial empty value

    async function fetchLeaderboard() {
        try {
            const link = `https://kovaaks.com/webapp-backend/leaderboard/scores/global?leaderboardId=${selectedScenarioID}&page=0&max=50`;
            const response = await fetch(link);
            const data = await response.json();

            const newTop50 = data.data.slice(0, 50).map((item: any) => [
                item.score,
                item.steamAccountName,
            ]);

            setTop50(newTop50); // update React state so component re-renders
        } catch (err) {
            console.error("Error fetching leaderboard:", err);
        }
    }

    fetchLeaderboard();
    }, [selectedScenarioID]); // refetch when Nanostore value changes

  //----------Physical component----------
    return (
        <div>
            <p className="scenarioName">{selectedScenarioNAME}</p>
            <div className="scoreList">
                <table>
                    <thead>
                        <tr>
                            <th>Rank</th>
                            <th>Score</th>
                            <th>Player</th>
                        </tr>
                        </thead>
                        <tbody>
                        {top50.map(([score, player], index) => (
                            <tr key={index}>
                            <td>{index + 1}</td>
                            <td>{score}</td>
                            <td>{player}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};
//----------End of Physical component----------

export default ScoreList;
