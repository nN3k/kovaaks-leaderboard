export class KvKProfile {
    public steamId: number;
    public name: string;
    public country: string;

    constructor(steamId: number, name: string, country: string) {
        this.steamId = steamId;
        this.name = name;
        this.country = country;
    }
}

export function createKvKProfile(steamId: number, name: string, country: string = "/"): KvKProfile {
    let tempProfile = new KvKProfile(steamId, name, country);
    allKvKProfiles[steamId] = tempProfile;
    return tempProfile;
}

export function getKvKProfile(steamId: number): KvKProfile {
    console.log(allKvKProfiles[steamId]);
    return allKvKProfiles[steamId];
}

export function checkForUpdate(profile: KvKProfile, check_name: string, check_country:string) {
    if (profile.name != check_name) {profile.name = check_name}
    if (profile.country != check_country) {profile.country = check_country}
}

let allKvKProfiles: Record<number, KvKProfile> = {};
