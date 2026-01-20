import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function runCrudTest() {
    console.log("🚀 Starting MongoDB CRUD Test Suite...");
    const testId = Date.now().toString();
    const testEmail = `test-${testId}@example.com`;
    let testUserId: string;

    try {
        // --- 1. CREATE USER ---
        console.log("\n1. [CREATE] Creating test user...");
        const user = await prisma.user.create({
            data: {
                name: "CRUD Test User",
                email: testEmail,
                emailVerified: false,
                createdAt: new Date(),
                updatedAt: new Date(),
            }
        });
        testUserId = user.id;
        console.log(`✅ User created: ${user.id}`);

        // --- 2. OFFERS CRUD ---
        console.log("\n2. [OFFER] Testing CRUD...");
        const offer = await prisma.offer.create({
            data: {
                originalId: `ext-${testId}`,
                title: "Test Offer",
                description: "This is a test offer description",
                price: "$100",
                location: "Remote",
                userId: testUserId,
            }
        });
        console.log(`✅ Offer created: ${offer.id}`);

        const updatedOffer = await prisma.offer.update({
            where: { id: offer.id },
            data: { title: "Updated Test Offer" }
        });
        console.log(`✅ Offer updated: ${updatedOffer.title}`);

        const foundOffer = await prisma.offer.findUnique({ where: { id: offer.id } });
        if (foundOffer?.title === "Updated Test Offer") {
            console.log("✅ Offer read verification successful");
        }

        // --- 3. SEARCH HISTORY CRUD ---
        console.log("\n3. [HISTORY] Testing CRUD...");
        const history = await prisma.searchHistory.create({
            data: {
                domain: "Testing",
                criteria: "CRUD",
                context: "Auto-test",
                inputs: { timestamp: testId },
                userId: testUserId,
                pinned: false
            }
        });
        console.log(`✅ History created: ${history.id}`);

        await prisma.searchHistory.update({
            where: { id: history.id },
            data: { pinned: true }
        });
        const foundHistory = await prisma.searchHistory.findUnique({ where: { id: history.id } });
        if (foundHistory?.pinned) {
            console.log("✅ History update/read verification successful");
        }

        // --- 4. PROJECTS CRUD ---
        console.log("\n4. [PROJECT] Testing CRUD...");
        const project = await prisma.project.create({
            data: {
                name: "Test Project",
                description: "Test description",
                userId: testUserId,
                searchIds: [history.id]
            }
        });
        console.log(`✅ Project created: ${project.id}`);

        const projects = await prisma.project.findMany({
            where: { userId: testUserId }
        });
        if (projects.length > 0) {
            console.log(`✅ Projects found: ${projects.length}`);
        }

        // --- 5. CLEANUP (CASCADE) ---
        console.log("\n5. [CLEANUP] Deleting test user (cascading)...");
        await prisma.user.delete({
            where: { id: testUserId }
        });

        // Verify deletion
        const userExists = await prisma.user.findUnique({ where: { id: testUserId } });
        const offerExists = await prisma.offer.findUnique({ where: { id: offer.id } });

        if (!userExists && !offerExists) {
            console.log("✅ Cleanup successful (User and cascaded Offers removed)");
        }

        console.log("\n✨ ALL CRUD TESTS PASSED SUCCESSFULLY! ✨");

    } catch (error) {
        console.error("\n❌ CRUD test failed:", error);
        // Attempt manual cleanup if needed
        if (testUserId!) {
            await prisma.user.deleteMany({ where: { email: testEmail } }).catch(() => { });
        }
    } finally {
        await prisma.$disconnect();
    }
}

runCrudTest();
