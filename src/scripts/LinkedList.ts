import { createKvKProfile, type KvKProfile } from "./KvKProfile";


const defaultVod = "https://www.youtube.com/watch?v=DNaYTktyk8Y";

export class ListNode {
    public profile: KvKProfile;
    public next: ListNode | null;
    public prev: ListNode | null;
    
    public score: number;
    public vod: string;
    
    public sense: number;
    public fov: number;
    public fovScaling: string;
    public avgFps: number;
    public accuracy: number;

    constructor(profile: KvKProfile, score: number, sense: number, fov: number, fovScaling: string, avgFps: number, accuracy: number, vod: string) {
        this.profile = profile;
        this.next = null;
        this.prev = null;
        this.score = score;
        this.sense = sense;
        this.fov = fov;
        this.fovScaling = fovScaling;
        this.avgFps = avgFps;
        this.accuracy = accuracy/1000;

        if (vod.includes("https://www.youtube.com/watch?v=")) {
            //https://youtu.be/d56mG7DezGs?si=uWAEQJWJiNox7J7i
            //https://www.youtube.com/watch?v=d56mG7DezGs
            //https://www.youtube.com/watch?v=GxmfcnU3feo
            //https://youtu.be/GxmfcnU3feo?si=aInYtJYwtn75gyts
            let temp = vod.split("?v=");
            this.vod = temp[1];
        } else if (vod.includes("https://youtu.be/")) {
            let temp = vod.split("?");
            let temp2 = temp[0].split("be/");
            this.vod = temp2[1];
        }
        else {
            throw new Error("Invaild VOD link");
        }
    }
}

class LinkedList {
    public head = new ListNode(createKvKProfile(-1, "head", "-1"), -1, -1, -1, "-1", -1, 1000, defaultVod);
    public tail = new ListNode(createKvKProfile(-2, "tail", "-2"), -2, -2, -2, "-2", -2, 1000, defaultVod);

    public scenario: string;
    public scenarioId: number;


    private size = 0;

    constructor(scenario: string, scenarioId: number) {
        this.head.next = this.tail;
        this.tail.prev = this.head;
        this.scenario = scenario;
        this.scenarioId = scenarioId; 
}

    public addItem(node: ListNode): void {
        if (this.head.next != null && this.head.next != this.tail) {
            node.next = this.head.next;
            this.head.next.prev = node;
        }
        this.head.next = node;
        node.prev = this.head;
        if (this.size == 0) {
            this.tail.prev = node;
            node.next = this.tail;
        }
    }

    public async verifyScore(profile: KvKProfile, score: number): Promise<boolean> {
        const link = "https://kovaaks.com/webapp-backend/leaderboard/scores/global?leaderboardId="+this.scenarioId+"&page=0&max=50";
        const response = await fetch(link);
        const topList = await response.json();

        for (let i = 0; i < 50; i++) {
            if (topList.data[i].steamId === profile.steamId && topList.data[i].score === score) {
                return true;
            }
        }
        return false;
    }

    public addItemAt(node: ListNode, pos: number): void {
        if (this.size == 0) {
            this.addItem(node);
        } else if (pos == 1) {
            node.next = this.head.next;
            node.prev = this.head;
            if (this.head.next != null) {
                this.head.next.prev = node;
                this.head.next = node;
            } else {throw "error adding item to list"}
            
        } else {

            let currentNode = this.head;
            for (let i = 1; i <= pos; i++) {
                if (currentNode.next != null && currentNode.next != this.tail) {
                    currentNode = currentNode.next;
                } else {
                    currentNode.next = node;
                    node.prev = currentNode;
                    return;
                }
            }
            node.next = currentNode;
            node.prev = currentNode.prev;

            if (currentNode.prev != null) {
                currentNode.prev.next = node;
            }
            currentNode.prev = node;
        }
        this.size++;
    }

    public removeNode(position: number): void {
        let currentNode = this.head;
        let prev = this.head;
        let next = this.head;

        for (let i = 0; 0 <= position; i++) {
            if (currentNode.next != null && currentNode.next != this.tail) {
                currentNode = currentNode.next;
            } else { break; }
        }

        if (currentNode.prev != null) {
            prev = currentNode.prev;
        }
        if (currentNode.next != null) {
            next = currentNode.next;
        }

        prev.next = next;
        next.prev = prev;

        this.size--;
    }

    public evaluatePos(score: number): number {
        let pos = 1;
        let currentNode = this.head;
        
        // Get position on leaderboard
        while (currentNode.next !== null && currentNode.next != this.tail) {
            pos++;
            if (currentNode.next.score < score) {
                break;
            }
            currentNode = currentNode.next;
        }
        return pos;
    }

    public async updateList(profile: KvKProfile, score: number, sense: number, fov: number, fovScaling: string, avgFps: number, accuracy: number) {
        const isVerified = await this.verifyScore(profile, score);
        if (!isVerified) {
            return;
        }

        let entryExists = false;
        let oldPos = 0;
        let currentNode = this.head;

        let node = new ListNode(profile, score, sense, fov, fovScaling, avgFps, accuracy, defaultVod);

        if (this.size == 0) {
            this.addItemAt(node, 1);
            return;
        }

        // Check is profile has entry and get old position
        while (currentNode.next != null && currentNode.next != this.tail) {
            oldPos++;
            if (currentNode.next.profile == profile) {
                entryExists = true;
                break;
            }
            currentNode = currentNode.next;
        }

        if (currentNode !== this.head) {
            if (entryExists) {
                this.removeNode(oldPos);
            }
            this.addItemAt(node, this.evaluatePos(score));
        } else {
            console.log("ERROR");
        }
    }
}