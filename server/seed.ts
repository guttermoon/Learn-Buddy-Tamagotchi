import { db } from "./db";
import { facts, quizQuestions, users, creatures } from "@shared/schema";
import { sql } from "drizzle-orm";

const retailFacts = [
  { category: "product_features", title: "Product Warranty Coverage", content: "All electronics come with a standard 1-year manufacturer warranty covering defects in materials and workmanship.", difficulty: 1 },
  { category: "product_features", title: "Extended Protection Plans", content: "Extended protection plans cover accidental damage, power surges, and mechanical failures beyond the manufacturer warranty.", difficulty: 2 },
  { category: "product_features", title: "Battery Life Standards", content: "Modern smartphones typically offer 4,500-5,000 mAh batteries providing 24-48 hours of normal usage between charges.", difficulty: 2 },
  { category: "product_features", title: "Screen Resolution Types", content: "HD (1280x720), Full HD (1920x1080), 4K (3840x2160), and 8K (7680x4320) are common display resolutions.", difficulty: 2 },
  { category: "product_features", title: "Wireless Connectivity", content: "WiFi 6E offers speeds up to 9.6 Gbps and operates on 2.4GHz, 5GHz, and 6GHz bands for better performance.", difficulty: 3 },
  { category: "product_features", title: "Smart Home Integration", content: "Most smart devices work with Alexa, Google Home, and Apple HomeKit for voice control and automation.", difficulty: 2 },
  { category: "product_features", title: "Water Resistance Ratings", content: "IP67 means dust-tight and can withstand immersion up to 1 meter. IP68 offers greater depth protection.", difficulty: 2 },
  { category: "product_features", title: "Processor Performance", content: "More cores allow better multitasking, while higher clock speeds improve single-task performance.", difficulty: 3 },
  { category: "product_features", title: "Storage Types", content: "SSD storage is 5-10x faster than HDD, more durable, and uses less power, but costs more per GB.", difficulty: 2 },
  { category: "product_features", title: "Display Technology", content: "OLED displays offer perfect blacks and vibrant colors, while LED/LCD provides better brightness for outdoor use.", difficulty: 2 },
  
  { category: "sales_techniques", title: "Active Listening", content: "Repeat back customer needs to confirm understanding: 'So you're looking for a laptop that's good for gaming and video editing?'", difficulty: 1 },
  { category: "sales_techniques", title: "Feature-Benefit Selling", content: "Always connect features to benefits: 'This has 16GB RAM, which means your apps will run smoothly without slowing down.'", difficulty: 2 },
  { category: "sales_techniques", title: "Open-Ended Questions", content: "Ask questions that require more than yes/no: 'What will you primarily use this device for?' to understand customer needs.", difficulty: 1 },
  { category: "sales_techniques", title: "Handling Price Objections", content: "Acknowledge the concern, then redirect to value: 'I understand budget is important. Let me show you why this investment pays off.'", difficulty: 3 },
  { category: "sales_techniques", title: "Creating Urgency", content: "Mention limited availability or promotions ending soon to encourage decision-making without being pushy.", difficulty: 2 },
  { category: "sales_techniques", title: "Cross-Selling Basics", content: "Suggest complementary items that enhance the main purchase: 'A case and screen protector will help protect your investment.'", difficulty: 1 },
  { category: "sales_techniques", title: "Building Rapport", content: "Find common ground and show genuine interest in the customer's needs before presenting products.", difficulty: 1 },
  { category: "sales_techniques", title: "Assumptive Close", content: "Guide the customer toward purchase by assuming the sale: 'Would you like me to check if we have this in stock?'", difficulty: 3 },
  { category: "sales_techniques", title: "Comparison Selling", content: "Present 2-3 options at different price points to help customers see value differences and make informed choices.", difficulty: 2 },
  { category: "sales_techniques", title: "Handling 'Just Looking'", content: "Respond with: 'Perfect! Let me know if you have any questions. I'm happy to share what's new or on sale today.'", difficulty: 1 },
  
  { category: "policies", title: "Standard Return Window", content: "Most products can be returned within 30 days of purchase with original receipt and packaging for a full refund.", difficulty: 1 },
  { category: "policies", title: "Price Match Guarantee", content: "We match competitor prices on identical items. Customer must provide proof of the lower price from an authorized retailer.", difficulty: 2 },
  { category: "policies", title: "Exchange Policy", content: "Opened items can be exchanged for the same item or store credit. Different items may require manager approval.", difficulty: 2 },
  { category: "policies", title: "Gift Receipt Returns", content: "Gift receipts allow returns for store credit only. The credit amount is based on the original purchase price.", difficulty: 1 },
  { category: "policies", title: "Damaged Product Policy", content: "Visibly damaged items at time of purchase should be reported immediately. We'll replace or refund without restocking fees.", difficulty: 2 },
  { category: "policies", title: "Layaway Terms", content: "Layaway requires 20% down payment with remaining balance due within 8 weeks. Cancellations receive store credit minus fees.", difficulty: 3 },
  { category: "policies", title: "Employee Discount Rules", content: "Employee discounts cannot be combined with other promotions or applied to sale items already discounted more than 20%.", difficulty: 2 },
  { category: "policies", title: "Reward Points Expiration", content: "Loyalty reward points expire 12 months after earning. Points can be redeemed in $5 increments once 500 points accumulated.", difficulty: 2 },
  { category: "policies", title: "Special Order Deposits", content: "Special orders require a 50% non-refundable deposit. Remaining balance due upon product arrival.", difficulty: 2 },
  { category: "policies", title: "Rain Check Policy", content: "If an advertised item is out of stock, we issue rain checks valid for 30 days at the sale price.", difficulty: 1 },
  
  { category: "customer_service", title: "Greeting Customers", content: "Greet every customer within 10 seconds of entering your area with eye contact, a smile, and a welcoming phrase.", difficulty: 1 },
  { category: "customer_service", title: "De-escalation Technique", content: "When customers are upset, listen without interrupting, acknowledge their frustration, and focus on solutions.", difficulty: 2 },
  { category: "customer_service", title: "Empathy Statements", content: "Use phrases like 'I understand how frustrating that must be' to show you care about the customer's experience.", difficulty: 1 },
  { category: "customer_service", title: "LAST Method", content: "Listen, Apologize, Solve, Thank - The four steps to handle any customer complaint effectively.", difficulty: 2 },
  { category: "customer_service", title: "Positive Language", content: "Replace 'I can't' with 'What I can do is...' to focus on solutions rather than limitations.", difficulty: 1 },
  { category: "customer_service", title: "Following Up", content: "After resolving an issue, follow up within 24-48 hours to ensure customer satisfaction and build loyalty.", difficulty: 2 },
  { category: "customer_service", title: "Handling Wait Times", content: "If a customer must wait, provide an estimated time, offer alternatives, and check back regularly with updates.", difficulty: 2 },
  { category: "customer_service", title: "Product Demonstration", content: "Show products in action rather than just describing features. Let customers interact and experience the benefits.", difficulty: 1 },
  { category: "customer_service", title: "Closing the Interaction", content: "Thank customers for their time, invite them to return, and ensure they know how to get help if needed.", difficulty: 1 },
  { category: "customer_service", title: "Managing Multiple Customers", content: "Acknowledge waiting customers with eye contact, brief greeting, and estimated wait time to maintain service quality.", difficulty: 2 },
];

const quizQuestionsData = [
  {
    question: "What is the standard return window for most products?",
    options: ["14 days", "30 days", "60 days", "90 days"],
    correctAnswer: 1,
    explanation: "Most products can be returned within 30 days of purchase with original receipt and packaging.",
    category: "policies"
  },
  {
    question: "What does IP67 water resistance rating mean?",
    options: ["Splash resistant only", "Can be submerged up to 1 meter", "Completely waterproof", "Rain resistant"],
    correctAnswer: 1,
    explanation: "IP67 means the device is dust-tight and can withstand immersion up to 1 meter for 30 minutes.",
    category: "product_features"
  },
  {
    question: "What is the LAST method in customer service?",
    options: ["Lead, Assist, Sell, Transfer", "Listen, Apologize, Solve, Thank", "Look, Ask, Suggest, Tell", "Learn, Apply, Share, Train"],
    correctAnswer: 1,
    explanation: "LAST stands for Listen, Apologize, Solve, Thank - the four steps to handle any customer complaint.",
    category: "customer_service"
  },
  {
    question: "When handling a price objection, you should first:",
    options: ["Offer a discount immediately", "Explain why the price is non-negotiable", "Acknowledge the concern and redirect to value", "Suggest a cheaper alternative"],
    correctAnswer: 2,
    explanation: "Always acknowledge the customer's concern first, then redirect the conversation to the product's value.",
    category: "sales_techniques"
  },
  {
    question: "How quickly should you greet a customer entering your area?",
    options: ["Within 30 seconds", "Within 10 seconds", "When they ask for help", "Within 1 minute"],
    correctAnswer: 1,
    explanation: "Greet every customer within 10 seconds with eye contact, a smile, and a welcoming phrase.",
    category: "customer_service"
  },
  {
    question: "What percentage down payment is required for layaway?",
    options: ["10%", "15%", "20%", "25%"],
    correctAnswer: 2,
    explanation: "Layaway requires a 20% down payment with the remaining balance due within 8 weeks.",
    category: "policies"
  },
  {
    question: "Which storage type is faster and more durable?",
    options: ["HDD", "SSD", "USB Flash Drive", "SD Card"],
    correctAnswer: 1,
    explanation: "SSD storage is 5-10x faster than HDD, more durable, uses less power, but costs more per GB.",
    category: "product_features"
  },
  {
    question: "What is feature-benefit selling?",
    options: ["Listing all product features", "Connecting features to customer benefits", "Focusing only on price", "Comparing to competitors"],
    correctAnswer: 1,
    explanation: "Feature-benefit selling connects product features to benefits: 'This has 16GB RAM, which means your apps will run smoothly.'",
    category: "sales_techniques"
  },
  {
    question: "How long are rain checks typically valid?",
    options: ["7 days", "14 days", "30 days", "60 days"],
    correctAnswer: 2,
    explanation: "Rain checks are valid for 30 days and allow customers to purchase out-of-stock advertised items at the sale price.",
    category: "policies"
  },
  {
    question: "What phrase should replace 'I can't do that'?",
    options: ["That's our policy", "Let me check with my manager", "What I can do is...", "Sorry, no exceptions"],
    correctAnswer: 2,
    explanation: "Use 'What I can do is...' to focus on solutions rather than limitations.",
    category: "customer_service"
  },
  {
    question: "When a customer says 'Just looking', you should:",
    options: ["Leave them alone immediately", "Follow them around the store", "Offer to share what's new or on sale", "Push for a sale anyway"],
    correctAnswer: 2,
    explanation: "Respond by letting them know you're available for questions and share relevant information about new items or sales.",
    category: "sales_techniques"
  },
  {
    question: "What technology offers perfect black levels in displays?",
    options: ["LED", "LCD", "OLED", "Plasma"],
    correctAnswer: 2,
    explanation: "OLED displays offer perfect blacks because each pixel produces its own light and can be turned completely off.",
    category: "product_features"
  },
  {
    question: "When should you follow up after resolving a customer issue?",
    options: ["Immediately", "Within 24-48 hours", "After a week", "Never, the issue is resolved"],
    correctAnswer: 1,
    explanation: "Follow up within 24-48 hours to ensure customer satisfaction and build loyalty.",
    category: "customer_service"
  },
  {
    question: "What is the assumptive close technique?",
    options: ["Assuming the customer will say no", "Guiding toward purchase by assuming the sale", "Assuming you know what they want", "Closing the store early"],
    correctAnswer: 1,
    explanation: "The assumptive close guides customers toward purchase: 'Would you like me to check if we have this in stock?'",
    category: "sales_techniques"
  },
  {
    question: "How many reward points are needed to redeem for $5?",
    options: ["100 points", "250 points", "500 points", "1000 points"],
    correctAnswer: 2,
    explanation: "Loyalty reward points can be redeemed in $5 increments once 500 points are accumulated.",
    category: "policies"
  },
];

export async function seedDatabase() {
  console.log("Starting database seed...");
  
  try {
    const existingFacts = await db.select().from(facts).limit(1);
    if (existingFacts.length > 0) {
      console.log("Database already seeded, skipping...");
      return;
    }
    
    console.log("Inserting facts...");
    for (const fact of retailFacts) {
      await db.insert(facts).values(fact);
    }
    console.log(`Inserted ${retailFacts.length} facts`);
    
    console.log("Inserting quiz questions...");
    for (const question of quizQuestionsData) {
      await db.insert(quizQuestions).values(question);
    }
    console.log(`Inserted ${quizQuestionsData.length} quiz questions`);
    
    console.log("Creating demo user...");
    const [demoUser] = await db.insert(users).values({
      username: "demo",
      password: "demo123",
      displayName: "Learning Champion",
      level: 1,
      xp: 0,
      totalFactsMastered: 0,
      currentStreak: 0,
      longestStreak: 0,
    }).returning();
    
    await db.insert(creatures).values({
      userId: demoUser.id,
      name: "Buddy",
      stage: 1,
      happiness: 100,
      health: "happy",
      personality: "curious",
    });
    
    console.log("Database seed completed successfully!");
  } catch (error) {
    console.error("Error seeding database:", error);
    throw error;
  }
}
