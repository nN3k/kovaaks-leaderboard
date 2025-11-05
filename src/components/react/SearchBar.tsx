import { Component, useEffect, useState } from "react";
import { changeScenarioSearchValue } from "../../data/nanostore/stores";
import "../../styles/searchBar.css"

const searchBarComponent = () => {
    const [input, setInput] = useState("");
    let scenarios = [];
    

    const fetchScenarios = (scenario: string) => {
        fetch("https://kovaaks.com/webapp-backend/scenario/popular?page=0&max=60&scenarioNameSearch="+scenario)
        .then(response => response.json())
        .then(data => {
            // Structure: [NAME, ENTRIES, HIGHSCORE, ID]
            scenarios = [];
            for (let i = 0; i < 60; i++) {
                try {
                    scenarios.push([data.data[i].scenarioName, data.data[i].counts.entries, data.data[i].topScore.score, data.data[i].leaderboardId]);
                } catch {}
            }
            changeScenarioSearchValue(scenarios);
        });
    }


    const handleChange = (value: string) => {
        //updates value in physical componant (allows change)
        setInput(value);

        //fetch scenario
        if (value != "" && value != null) {
            let scenario: string = value.replace(" ", "+")
            fetchScenarios(scenario);
        }
    }


    //----------Physical component----------
    return (
        <input className="scenarioSearchBar" placeholder = "Search Scenario..." value = {input}
        onChange = {(event) => handleChange(event.target.value)}
        />
    );
    //----------End of Physical component----------
};

export default searchBarComponent;