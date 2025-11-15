import { useEffect, useState } from "react";
import { steamId } from "../../data/nanostores/stores";

const InputSteamId = () => {
    const [input, setInput] = useState("");
    const [debouncedInput, setDebouncedInput] = useState(input);

    // Debounce input by 500ms
    useEffect(() => {
        const handler = setTimeout(() => {
            setDebouncedInput(input);
        }, 500);
        return () => clearTimeout(handler);
    }, [input]);

    // Fetch scenarios when debounced input changes
    useEffect(() => {
        // If input is empty, fetch default scenarios
        let steamID = debouncedInput.replace(" ", "");
        if (steamID == "") {
            steamID = "76561198397834476"
        }

        steamId.set(steamID);
                
    }, [debouncedInput]);

    // Handle typing
    const handleChange = (value: string) => {
        setInput(value);
    };

    // Physical Component
    return (
        <div>
            <div>
                <input
                    placeholder="Steam ID"
                    value={input}
                    onChange={(event) => handleChange(event.target.value)}
                />
            </div>
        </div>
    );
};

export default InputSteamId;
