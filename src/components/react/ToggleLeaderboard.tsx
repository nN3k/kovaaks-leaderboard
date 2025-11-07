import { useStore } from "@nanostores/react";
import "../../styles/toggleSwitch.css";
import { changeVerifiedChecked, verifiedChecked } from "../../data/nanostore/stores";

const ToggleLeaderboardComponent = () => {

    const checked = useStore(verifiedChecked);

    const handleChange = (e: any) => {
        changeVerifiedChecked(e.target.checked);
    }

    // Physical Component
    return (
        <div className="bundle">
            <p>VERIFIED:</p>
            <label className="switch">
                <input type="checkbox" checked={checked} onChange={handleChange}/>
                <span className="slider"></span>
            </label>
        </div>
    );
}

export default ToggleLeaderboardComponent;