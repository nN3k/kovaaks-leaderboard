import { db, Profile } from "astro:db";

const testButtonComponent = () => {

    const handleInsert = async (): Promise<void> => {
        console.log("clicked")
        await db.insert(Profile).values({
            steamId: 0,
            steamName: 'Seeded User',
            country: 'GER',
            isBanned: false,
        })
    }

    return (
        <div>
            <button onClick={handleInsert}>Test Button</button>
        </div>
    );
}

export default testButtonComponent;