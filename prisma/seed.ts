import bycryptjs from 'bcryptjs';
import { PrismaClient } from '@prisma/client';


const prisma = new PrismaClient();

async function main() {
  // Create admin user
  const adminPassword = await bycryptjs.hash('admin123', 10);
  const admin = await prisma.user.upsert({
    where: { email: 'admin@example.com' },
    update: {},
    create: {
      email: 'admin@example.com',
      name: 'Admin User',
      username: 'admin',
      passwordHash: adminPassword,
      isVerified: true,
    },
  });

  // Create regular user
  const userPassword = await bycryptjs.hash('user123', 10);
  const user = await prisma.user.upsert({
    where: { email: 'user@example.com' },
    update: {},
    create: {
      email: 'user@example.com',
      name: 'Regular User',
      username: 'user',
      passwordHash: userPassword,
      isVerified: true,
    },
  });

  // Create tags
  const tags = [
    'science',
    'technology',
    'history',
    'psychology',
    'philosophy',
    'art',
    'literature',
    'mathematics',
    'biology',
    'physics',
  ];

  for (const tagName of tags) {
    await prisma.tag.upsert({
      where: { name: tagName },
      update: {},
      create: { name: tagName },
    });
  }

  // Get tag IDs
  const tagRecords = await prisma.tag.findMany({
    where: { name: { in: tags } },
  });
  const tagMap = tagRecords.reduce((acc, tag) => {
    acc[tag.name] = tag.id;
    return acc;
  }, {} as Record<string, string>);

  // Create sample posts
  const posts = [
    {
      content: 'Did you know that octopuses have three hearts? Two pump blood through the gills, while the third pumps it through the body.',
      postType: 'fact',
      userId: user.id,
      tags: ['science', 'biology'],
    },
    {
      content: 'The Great Barrier Reef is the largest living structure on Earth, stretching over 2,300 kilometers and visible from space.',
      postType: 'fact',
      userId: user.id,
      tags: ['science', 'biology'],
    },
    {
      content: 'Why do we dream? Is there a scientific consensus on the purpose of dreams?',
      postType: 'question',
      userId: admin.id,
      tags: ['psychology', 'science'],
    },
    {
      content: 'The printing press, invented by Johannes Gutenberg around 1440, revolutionized how knowledge spread through society by making books affordable and accessible to the masses.',
      postType: 'lesson',
      userId: admin.id,
      tags: ['history', 'technology'],
    },
  ];

  for (const postData of posts) {
    const post = await prisma.post.create({
      data: {
        content: postData.content,
        postType: postData.postType as any,
        userId: postData.userId,
      },
    });

    // Connect tags to post
    for (const tagName of postData.tags) {
      await prisma.postTag.create({
        data: {
          postId: post.id,
          tagId: tagMap[tagName],
        },
      });
    }

    // Add some votes
    if (postData.postType === 'fact') {
      await prisma.vote.create({
        data: {
          userId: admin.id,
          postId: post.id,
          voteType: 'upvote',
        },
      });
    }
  }

  console.log('Database has been seeded!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });