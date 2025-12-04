import { useStore } from "@nanostores/react";
import { selectedScenarioId, selectedScenarioName, verifiedChecked } from "../../../data/nanostores/stores";
import { useEffect, useState } from "react";

const ScoreList = () => {
    const selectedScenarioID = useStore(selectedScenarioId);
    const verifiedList = useStore(verifiedChecked);
    const scenarioName = useStore(selectedScenarioName);
    const [top50, setTop50] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const controller = new AbortController();
        const { signal } = controller;

        if (!selectedScenarioID) return;

        setLoading(true);
        setError(null);

        async function fetchLeaderboard() {
            try {
                if (verifiedList) {
                    // Fetch from your API
                    const response = await fetch('/api/scenarios/get-leaderboard', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify({ scenarioName }),
                        signal
                    });
                    
                    if (!response.ok) {
                        throw new Error(`API error: ${response.status} ${response.statusText}`);
                    }
                    
                    const data = await response.json();
                    
                    // Make sure data is an array
                    if (Array.isArray(data)) {
                        setTop50(data);
                    } else {
                        throw new Error('Invalid response format: expected array');
                    }
                } else {
                    // Fetch from external API
                    const link = `https://kovaaks.com/webapp-backend/leaderboard/scores/global?leaderboardId=${selectedScenarioID}&page=0&max=50`;
                    const response = await fetch(link, { signal });
                    
                    if (!response.ok) {
                        throw new Error(`External API error: ${response.status}`);
                    }
                    
                    const data = await response.json();

                    const newTop50 = data.data.slice(0, 50).map((item: any) => [
                        item.score,
                        item.steamAccountName,
                    ]);

                    setTop50(newTop50);
                }
            } catch (err: unknown) {
                // Type-safe error checking
                if (err instanceof Error && err.name === 'AbortError') {
                    // Aborted fetch, ignore
                    return;
                }
                
                if (err instanceof Error) {
                    console.error("Error fetching leaderboard:", err.message);
                    setError(err.message);
                } else {
                    console.error("Unknown error fetching leaderboard:", err);
                    setError('Unknown error occurred');
                }
                setTop50([]); // Clear data on error
            } finally {
                setLoading(false);
            }
        }

        fetchLeaderboard();
        return () => controller.abort();
    }, [selectedScenarioID, verifiedList, scenarioName]);

    if (loading) {
        return <div>Loading leaderboard...</div>;
    }

    if (error) {
        return <div>Error: {error}</div>;
    }

    if (top50.length === 0) {
        return (
            <div className="scoreList">
                <div>No leaderboard data available for this scenario.</div>
                <div>The table might not exist or is empty.</div>
            </div>
        );
    }

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

export default ScoreList;