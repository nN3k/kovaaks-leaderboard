import { useStore } from "@nanostores/react";
import { selectedScenarioId, selectedScenarioName, verifiedChecked } from "../../data/nanostores/stores";
import { useEffect, useState } from "react";

const ScoreList = () => {
    const selectedScenarioID = useStore(selectedScenarioId);
    const verifiedList = useStore(verifiedChecked);
    const [top50, setTop50] = useState<any[]>([]);

    useEffect(() => {
        const controller = new AbortController();
        const { signal } = controller;

        if (!selectedScenarioId) return; // guard for initial empty value

        if (verifiedList) {
            //TODO
            console.error("Verified List not implemented");
        } else {

            async function fetchLeaderboard() {
                try {
                    const link = `https://kovaaks.com/webapp-backend/leaderboard/scores/global?leaderboardId=${selectedScenarioID}&page=0&max=50`;
                    const response = await fetch(link, {signal});
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
            return () => controller.abort();
        }
    }, [selectedScenarioID]); // refetch when Nanostore value changes

  //----------Physical component----------
    return (
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
    );
};
//----------End of Physical component----------

export default ScoreList;
