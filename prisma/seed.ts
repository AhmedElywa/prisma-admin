import { PrismaClient } from "@/prisma-client";

const prisma = new PrismaClient();

async function main() {
	// Clear existing data
	await prisma.post.deleteMany();
	await prisma.profile.deleteMany();
	await prisma.user.deleteMany();
	await prisma.category.deleteMany();
	await prisma.tag.deleteMany();

	// Create categories
	const techCategory = await prisma.category.create({
		data: { name: "Technology" },
	});

	const lifeCategory = await prisma.category.create({
		data: { name: "Lifestyle" },
	});

	// Create tags
	const jsTag = await prisma.tag.create({
		data: { name: "JavaScript" },
	});

	const tsTag = await prisma.tag.create({
		data: { name: "TypeScript" },
	});

	// Create users
	const alice = await prisma.user.create({
		data: {
			email: "alice@example.com",
			name: "Alice",
			password: "password123", // In production, this should be hashed
			settings: {
				theme: "dark",
				notifications: {
					email: true,
					push: false,
				},
				language: "en",
			},
			profile: {
				create: {
					bio: "Full-stack developer",
					avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Alice",
				},
			},
			posts: {
				create: [
					{
						title: "Getting Started with Next.js 15",
						content: "Next.js 15 brings exciting new features...",
						published: true,
						metadata: {
							readTime: 5,
							views: 1234,
							likes: 42,
						},
						category: { connect: { id: techCategory.id } },
						tags: { connect: [{ id: jsTag.id }, { id: tsTag.id }] },
					},
					{
						title: "Building Admin Interfaces with PalJS",
						content: "PalJS makes it easy to build admin interfaces...",
						published: true,
						category: { connect: { id: techCategory.id } },
						tags: { connect: [{ id: tsTag.id }] },
					},
				],
			},
		},
	});

	const bob = await prisma.user.create({
		data: {
			email: "bob@example.com",
			name: "Bob",
			password: "password123",
			settings: {
				theme: "light",
				notifications: {
					email: false,
					push: true,
				},
				language: "en",
				preferences: {
					dashboard: "compact",
				},
			},
			profile: {
				create: {
					bio: "UI/UX Designer",
					avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Bob",
				},
			},
			posts: {
				create: [
					{
						title: "Design Systems in 2024",
						content: "Modern design systems are evolving...",
						published: false,
						category: { connect: { id: techCategory.id } },
					},
				],
			},
		},
	});

	console.log({ alice, bob });
}

main()
	.then(async () => {
		await prisma.$disconnect();
	})
	.catch(async (e) => {
		console.error(e);
		await prisma.$disconnect();
		process.exit(1);
	});
