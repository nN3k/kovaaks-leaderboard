import { useEffect, useState } from "react";
import { changeScenarioSearchValue } from "../../data/nanostores/stores";
import "../../styles/searchBar.css";

const SearchBarComponent = () => {
    const [input, setInput] = useState("");
    const [debouncedInput, setDebouncedInput] = useState(input);
    const [loading, setLoading] = useState(false);

    // Debounce input by 500ms
    useEffect(() => {
        const handler = setTimeout(() => {
            setDebouncedInput(input);
        }, 500);
        return () => clearTimeout(handler);
    }, [input]);

    // Fetch scenarios when debounced input changes
    useEffect(() => {
        const controller = new AbortController();
        const { signal } = controller;

        // If input is empty, fetch default scenarios
        let scenario = debouncedInput.replace(" ", "+");
        if (scenario == "") {
            scenario = "pasu"
        }

        const fetchScenarios = async () => {
            try {
                setLoading(true);

                const response = await fetch(
                    `https://kovaaks.com/webapp-backend/scenario/popular?page=0&max=20&scenarioNameSearch=${scenario}`,
                    { signal }
                );

                if (!response.ok) throw new Error("Network response was not ok");

                const data = await response.json();
                const scenarios = [];

                for (let i = 0; i < 20; i++) {
                    try {
                        scenarios.push([
                            data.data[i].scenarioName,
                            data.data[i].counts.entries,
                            data.data[i].topScore.score,
                            data.data[i].leaderboardId,
                        ]);
                    } catch {
                        // ignore missing entries
                    }
                }

                changeScenarioSearchValue(scenarios);
                
            } catch (err: any) {
                if (err.name !== "AbortError") {
                    console.error("Fetch error:", err);
                }
            } finally {
                setLoading(false);
            }
        };

        fetchScenarios();
        return () => controller.abort();
    }, [debouncedInput]);

    // Handle typing
    const handleChange = (value: string) => {
        setInput(value);
    };

    // Physical Component
    return (
        <div className="searchBarContainer">
            <div className="searchInputWrapper">
                <input
                    className="scenarioSearchBar"
                    placeholder="Search Scenario..."
                    value={input}
                    onChange={(event) => handleChange(event.target.value)}
                />
                {loading && <div className="searchBarSpinner">|</div>}
            </div>
        </div>
    );
};

export default SearchBarComponent;
