const mongoose = require("mongoose");
const Community = require("./models/Community");

require("dotenv").config();
const connectDB = require("./config/db");

const communities = [
  {
    name: "Frontend Engineers",
    slug: "frontend-engineers",
    description: "React, Vue, Angular, CSS, HTML — everything that users see and interact with.",
    icon: "/icons/front-end-programming.png",
    color: "#61dafb",
  },
  {
    name: "Backend Builders",
    slug: "backend-builders",
    description: "Node.js, Django, Spring Boot, databases, APIs — powering the web from behind.",
    icon: "/icons/backend.png",
    color: "#68a063",
  },
  {
    name: "Full Stack Developers",
    slug: "full-stack-developers",
    description: "End-to-end builders who master both frontend and backend development.",
    icon: "/icons/web-development.png",
    color: "#a855f7",
  },
  {
    name: "DSA Grind",
    slug: "dsa-grind",
    description: "Data structures, algorithms, leetcode problems and competitive programming.",
    icon: "/icons/DSA.png",
    color: "#f59e0b",
  },
  {
    name: "DevOps & Cloud",
    slug: "devops-cloud",
    description: "Docker, Kubernetes, AWS, CI/CD pipelines, infrastructure as code.",
    icon: "/icons/cloud-server.png",
    color: "#38bdf8",
  },
  {
    name: "AI / Machine Learning",
    slug: "ai-ml",
    description: "Machine learning, deep learning, LLMs, computer vision and AI tools.",
    icon: "/icons/artificial-intelligence.png",
    color: "#ec4899",
  },
  {
    name: "Open Source",
    slug: "open-source",
    description: "Contribute to open source, discover projects, and build in public.",
    icon: "/icons/open-source.png",
    color: "#22c55e",
  },
  {
    name: "Interview Prep",
    slug: "interview-prep",
    description: "System design, behaviorals, coding rounds — ace your tech interviews.",
    icon: "/icons/interview.png",
    color: "#ef4444",
  },
  {
    name: "Project Showcase",
    slug: "project-showcase",
    description: "Show off your side projects, get feedback, and inspire other developers.",
    icon: "/icons/projects.png",
    color: "#f97316",
  },
  {
    name: "Web3 & Blockchain",
    slug: "web3-blockchain",
    description: "Solidity, DeFi, NFTs, smart contracts and decentralized applications.",
    icon: "/icons/blockchain.png",
    color: "#8b5cf6",
  },
];

const seed = async () => {
  await connectDB();
  console.log("🌱 Seeding communities...");
  for (const c of communities) {
    await Community.findOneAndUpdate({ slug: c.slug }, c, {
      upsert: true,
      new: true,
    });
    console.log(`✅ ${c.name}`);
  }
  console.log("🎉 Communities seeded successfully!");
  process.exit(0);
};

seed().catch((err) => {
  console.error("❌ Seed failed:", err);
  process.exit(1);
});
