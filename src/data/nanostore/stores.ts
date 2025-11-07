import { atom } from "nanostores";


//------scenarioSearchValue----------------
//value = array of results
export const scenarioSearchValue = atom<any[]>([]);

export function changeScenarioSearchValue(value: any[]) {
  scenarioSearchValue.set(value);
}
//-----End of scenarioSearchValue----------


//-----scenarioSearchBarValue--------------
export const scenarioSearchBarValue = atom<string>("");

export function changeScenarioSearchBarValue(value: string) {
  scenarioSearchBarValue.set(value);
}
//-----End of scenarioSearchBarValue-------


//-----selectedScenario--------------------
export const selectedScenarioId = atom<number>(605);
export const selectedScenarioName = atom<string>("Pasu Voltaic Easy");

export function changeSelectedScenarioId(scenarioId: number) {
  selectedScenarioId.set(scenarioId);
}
export function changeSelectedScenarioName(scenarioName: string) {
  selectedScenarioName.set(scenarioName);
}
//-----End of selectedScenario-------------


//-----VerifiedToggle----------------------
export const verifiedChecked = atom(false);

export function changeVerifiedChecked(checked: boolean) {
  verifiedChecked.set(checked);
}
//-----End of VerifiedToggle---------------
