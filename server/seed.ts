import { db } from "./db";
import { facts, quizQuestions, users, creatures, achievements, accessories } from "@shared/schema";
import { sql } from "drizzle-orm";

const retailFacts = [
  // PRODUCT FEATURES (100 facts)
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
  { category: "product_features", title: "RAM Importance", content: "8GB RAM is minimum for smooth multitasking; 16GB recommended for power users; 32GB+ for professional workloads.", difficulty: 2 },
  { category: "product_features", title: "USB-C Benefits", content: "USB-C is reversible, supports fast charging, data transfer up to 40Gbps, and can output video signals.", difficulty: 2 },
  { category: "product_features", title: "Bluetooth Versions", content: "Bluetooth 5.0+ offers 4x range, 2x speed, and 8x broadcast message capacity compared to Bluetooth 4.2.", difficulty: 3 },
  { category: "product_features", title: "Refresh Rate Explained", content: "Higher refresh rates (90Hz, 120Hz, 144Hz) provide smoother scrolling and better gaming experiences.", difficulty: 2 },
  { category: "product_features", title: "Camera Megapixels", content: "More megapixels mean larger prints, but sensor size and lens quality matter more for image quality.", difficulty: 2 },
  { category: "product_features", title: "Fast Charging", content: "Fast charging can provide 50% battery in 30 minutes; wireless charging is slower but more convenient.", difficulty: 2 },
  { category: "product_features", title: "HDR Technology", content: "HDR (High Dynamic Range) provides brighter highlights, deeper blacks, and more colors than SDR displays.", difficulty: 3 },
  { category: "product_features", title: "Noise Cancellation", content: "Active Noise Cancellation (ANC) uses microphones to create inverse sound waves, reducing ambient noise by up to 95%.", difficulty: 2 },
  { category: "product_features", title: "Graphics Cards", content: "Dedicated GPUs handle graphics processing, essential for gaming, video editing, and 3D rendering.", difficulty: 3 },
  { category: "product_features", title: "Thermal Management", content: "Laptops use heat pipes, fans, and vapor chambers to dissipate heat and maintain optimal performance.", difficulty: 3 },
  { category: "product_features", title: "Biometric Security", content: "Fingerprint and facial recognition provide secure, convenient authentication without passwords.", difficulty: 2 },
  { category: "product_features", title: "Smart TV Features", content: "Smart TVs include app stores, voice control, screen mirroring, and streaming service integration.", difficulty: 1 },
  { category: "product_features", title: "Soundbar Benefits", content: "Soundbars improve TV audio with virtual surround sound, dialogue enhancement, and wireless subwoofers.", difficulty: 2 },
  { category: "product_features", title: "Gaming Console Storage", content: "Game sizes can exceed 100GB; consider storage expansion options when selling gaming consoles.", difficulty: 2 },
  { category: "product_features", title: "Laptop Portability", content: "Ultrabooks under 3 lbs prioritize portability; gaming laptops 5+ lbs offer more power.", difficulty: 2 },
  { category: "product_features", title: "Monitor Response Time", content: "Lower response times (1-5ms) reduce motion blur, important for gaming and fast-paced content.", difficulty: 3 },
  { category: "product_features", title: "Mesh WiFi Systems", content: "Mesh WiFi eliminates dead zones by using multiple nodes to create seamless whole-home coverage.", difficulty: 2 },
  { category: "product_features", title: "NFC Technology", content: "NFC enables tap-to-pay, quick device pairing, and contactless data transfer within 4cm range.", difficulty: 2 },
  { category: "product_features", title: "eSIM Technology", content: "eSIM allows multiple phone plans on one device without physical SIM cards, ideal for travelers.", difficulty: 3 },
  { category: "product_features", title: "Folding Phone Benefits", content: "Foldable phones offer larger screens in pocket-sized devices, multitasking, and unique form factors.", difficulty: 3 },
  { category: "product_features", title: "Tablet vs Laptop", content: "Tablets excel at media consumption; laptops better for productivity and professional software.", difficulty: 1 },
  { category: "product_features", title: "Smart Watch Features", content: "Smartwatches track health metrics, receive notifications, make calls, and control smart home devices.", difficulty: 1 },
  { category: "product_features", title: "Fitness Tracker Sensors", content: "Heart rate, SpO2, accelerometer, and GPS sensors enable comprehensive health and fitness tracking.", difficulty: 2 },
  { category: "product_features", title: "True Wireless Earbuds", content: "No wires between earbuds; cases double as chargers; typically 4-8 hours battery plus case refills.", difficulty: 1 },
  { category: "product_features", title: "Keyboard Types", content: "Mechanical keyboards offer tactile feedback and durability; membrane keyboards are quieter and cheaper.", difficulty: 2 },
  { category: "product_features", title: "Mouse DPI", content: "Higher DPI means faster cursor movement; gaming mice offer adjustable DPI from 400-25,000+.", difficulty: 3 },
  { category: "product_features", title: "Webcam Quality", content: "1080p at 30fps is standard; 4K and 60fps webcams provide professional video quality.", difficulty: 2 },
  { category: "product_features", title: "Printer Types", content: "Inkjet for photos and occasional use; laser for high-volume text documents and lower cost per page.", difficulty: 2 },
  { category: "product_features", title: "Router Speeds", content: "AC routers support up to 1.9Gbps; AX (WiFi 6) routers support up to 9.6Gbps for future-proofing.", difficulty: 3 },
  { category: "product_features", title: "Smart Doorbell Features", content: "Video doorbells offer motion detection, two-way audio, night vision, and cloud storage for recordings.", difficulty: 2 },
  { category: "product_features", title: "Security Camera Types", content: "Indoor, outdoor, battery-powered, wired options with resolution from 1080p to 4K and local or cloud storage.", difficulty: 2 },
  { category: "product_features", title: "Smart Lock Benefits", content: "Keyless entry via app, code, or fingerprint with auto-lock, guest access, and activity logs.", difficulty: 2 },
  { category: "product_features", title: "Robot Vacuum Features", content: "Mapping, scheduling, auto-emptying, mopping, and voice control for hands-free floor cleaning.", difficulty: 2 },
  { category: "product_features", title: "Air Purifier HEPA", content: "True HEPA filters capture 99.97% of particles 0.3 microns or larger including dust, pollen, and pet dander.", difficulty: 2 },
  { category: "product_features", title: "Smart Thermostat Savings", content: "Smart thermostats can save 10-23% on heating/cooling bills through learning and scheduling.", difficulty: 2 },
  { category: "product_features", title: "VR Headset Specs", content: "Resolution, refresh rate, field of view, and tracking method determine VR experience quality.", difficulty: 3 },
  { category: "product_features", title: "Drone Regulations", content: "FAA requires registration for drones over 0.55 lbs; many areas have no-fly zones near airports.", difficulty: 3 },
  { category: "product_features", title: "Action Camera Features", content: "Waterproof, shock-resistant, with wide-angle lens, 4K video, and image stabilization for adventure content.", difficulty: 2 },
  { category: "product_features", title: "E-Reader Benefits", content: "E-ink displays are easy on eyes, battery lasts weeks, and devices hold thousands of books.", difficulty: 1 },
  { category: "product_features", title: "Portable Charger Capacity", content: "10,000mAh charges most phones 2-3 times; 20,000mAh can charge tablets and laptops.", difficulty: 2 },

  // SALES TECHNIQUES (100 facts)
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
  { category: "sales_techniques", title: "Upselling Strategy", content: "Recommend upgrades that genuinely benefit the customer: 'For $50 more, you get double the storage—a great value.'", difficulty: 2 },
  { category: "sales_techniques", title: "Trial Close", content: "Test buying readiness: 'How does this sound so far?' or 'Is this what you had in mind?'", difficulty: 2 },
  { category: "sales_techniques", title: "Overcoming Hesitation", content: "Address the real concern: 'What's holding you back?' often reveals the true objection.", difficulty: 2 },
  { category: "sales_techniques", title: "Social Proof", content: "Reference other customers: 'This model is our best seller' or 'Customers who bought this loved it.'", difficulty: 2 },
  { category: "sales_techniques", title: "Demonstration Power", content: "Let customers experience products hands-on; demonstrations increase purchase likelihood by 75%.", difficulty: 2 },
  { category: "sales_techniques", title: "Handling 'Too Expensive'", content: "Break down cost: 'Over two years, that's less than $1 per day for this level of performance.'", difficulty: 3 },
  { category: "sales_techniques", title: "The Three Yeses", content: "Get small agreements before asking for the sale: three yeses make the final yes more likely.", difficulty: 3 },
  { category: "sales_techniques", title: "Silence Strategy", content: "After presenting price, stay silent. The first to speak often loses negotiating position.", difficulty: 3 },
  { category: "sales_techniques", title: "Personalizing Benefits", content: "Tailor benefits to their situation: 'Since you mentioned working from home, the webcam quality matters.'", difficulty: 2 },
  { category: "sales_techniques", title: "Handling Competitor Comparison", content: "Focus on your strengths: 'Here's what makes us unique...' without disparaging competitors.", difficulty: 2 },
  { category: "sales_techniques", title: "Building Value Before Price", content: "Present all benefits and features before revealing price to maximize perceived value.", difficulty: 2 },
  { category: "sales_techniques", title: "The Feel-Felt-Found Method", content: "'I understand how you feel. Others have felt the same way. What they found was...'", difficulty: 2 },
  { category: "sales_techniques", title: "Qualifying Questions", content: "Determine budget, timeline, and decision-makers early to focus on appropriate solutions.", difficulty: 2 },
  { category: "sales_techniques", title: "Anchoring Strategy", content: "Show premium option first so mid-range seems more affordable by comparison.", difficulty: 3 },
  { category: "sales_techniques", title: "Limited Choice Technique", content: "Too many options cause paralysis; narrow to 2-3 choices based on customer needs.", difficulty: 2 },
  { category: "sales_techniques", title: "Reciprocity Principle", content: "Offer value first (information, help, samples) and customers feel inclined to give back.", difficulty: 2 },
  { category: "sales_techniques", title: "Handling 'I Need to Think'", content: "Ask: 'What specifically would you like to think about? I can provide more information.'", difficulty: 3 },
  { category: "sales_techniques", title: "Bundle Selling", content: "Package products together at a slight discount; increases average transaction value.", difficulty: 2 },
  { category: "sales_techniques", title: "Scarcity Technique", content: "'We only have 3 left at this price' creates urgency without pressure.", difficulty: 2 },
  { category: "sales_techniques", title: "Alternative Close", content: "'Would you prefer the 128GB or 256GB model?' assumes purchase while offering choice.", difficulty: 2 },
  { category: "sales_techniques", title: "Story Selling", content: "Share relevant customer success stories to illustrate product benefits in real scenarios.", difficulty: 2 },
  { category: "sales_techniques", title: "Handling Returns", content: "Turn returns into exchanges or upgrades; maintain positive relationship for future sales.", difficulty: 2 },
  { category: "sales_techniques", title: "Body Language Reading", content: "Crossed arms may signal resistance; leaning in shows interest; adjust approach accordingly.", difficulty: 2 },
  { category: "sales_techniques", title: "Mirror Technique", content: "Subtly match customer's tone and pace to build subconscious rapport.", difficulty: 2 },
  { category: "sales_techniques", title: "The Takeaway Close", content: "'Maybe this isn't the right fit for you' can increase desire through loss aversion.", difficulty: 3 },
  { category: "sales_techniques", title: "Value Stacking", content: "List all included items and benefits: 'You get the laptop, case, mouse, and 2-year warranty.'", difficulty: 2 },
  { category: "sales_techniques", title: "Handling Budget Constraints", content: "Offer financing options or entry-level alternatives without judgment.", difficulty: 2 },
  { category: "sales_techniques", title: "The Sharp Angle Close", content: "If customer asks 'Can you include X?', respond 'If I can, would you buy today?'", difficulty: 3 },
  { category: "sales_techniques", title: "Follow-Up Importance", content: "Follow up within 48 hours; 80% of sales require 5+ touchpoints.", difficulty: 2 },
  { category: "sales_techniques", title: "Objection Prevention", content: "Address common objections proactively before they're raised.", difficulty: 3 },
  { category: "sales_techniques", title: "Enthusiasm Transfer", content: "Your excitement about products is contagious; genuine enthusiasm sells.", difficulty: 1 },
  { category: "sales_techniques", title: "Time Sensitivity", content: "'The sale ends Sunday' creates deadline without high pressure.", difficulty: 2 },
  { category: "sales_techniques", title: "Summary Close", content: "Summarize all agreed points: 'So we have the laptop with extra RAM, case, and warranty—shall I ring that up?'", difficulty: 2 },
  { category: "sales_techniques", title: "The Ben Franklin Close", content: "List pros and cons together; seeing more pros than cons facilitates decision.", difficulty: 3 },
  { category: "sales_techniques", title: "Emotional Connection", content: "Connect purchase to emotions: 'Imagine sharing vacation photos on this beautiful screen.'", difficulty: 2 },
  { category: "sales_techniques", title: "Handling Technical Questions", content: "It's okay to say 'Great question—let me find out for you' rather than guessing.", difficulty: 1 },
  { category: "sales_techniques", title: "The Puppy Dog Close", content: "Let customers try before buying; like taking a puppy home, return rates drop.", difficulty: 3 },
  { category: "sales_techniques", title: "Referral Requests", content: "Ask satisfied customers: 'Who else do you know who might benefit from this?'", difficulty: 2 },
  { category: "sales_techniques", title: "Add-On Timing", content: "Suggest add-ons after main purchase decision, not before.", difficulty: 2 },
  { category: "sales_techniques", title: "The Columbo Close", content: "After apparent conclusion, 'Oh, one more thing...' for final upsell opportunity.", difficulty: 3 },

  // POLICIES (100 facts)
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
  { category: "policies", title: "Open Box Returns", content: "Open box items sold as-is with 15-day return window. Must include all original accessories.", difficulty: 2 },
  { category: "policies", title: "Restocking Fees", content: "Certain categories (drones, opened software) may incur 15% restocking fee upon return.", difficulty: 2 },
  { category: "policies", title: "Protection Plan Cancellation", content: "Protection plans can be cancelled within 30 days for full refund; after 30 days, prorated refund applies.", difficulty: 2 },
  { category: "policies", title: "In-Store Pickup", content: "Online orders ready for pickup within 2 hours. Unclaimed orders cancelled after 5 days.", difficulty: 1 },
  { category: "policies", title: "Price Adjustment Window", content: "If price drops within 14 days of purchase, we'll refund the difference with original receipt.", difficulty: 2 },
  { category: "policies", title: "Trade-In Program", content: "Trade in working devices for store credit. Value based on condition, age, and current market rates.", difficulty: 2 },
  { category: "policies", title: "Financing Terms", content: "0% APR financing available on purchases over $299 with approved credit. Regular APR applies to missed payments.", difficulty: 3 },
  { category: "policies", title: "Gift Card Policy", content: "Gift cards never expire and cannot be redeemed for cash except where required by law.", difficulty: 1 },
  { category: "policies", title: "Student Discounts", content: "Students get 10% off select items with valid student ID. Cannot combine with other promotions.", difficulty: 1 },
  { category: "policies", title: "Military Discount", content: "10% military discount with valid ID. Applies to active duty, veterans, and immediate family.", difficulty: 1 },
  { category: "policies", title: "Senior Discount", content: "Seniors 65+ receive 10% discount on Tuesdays. Valid ID required; excludes sale items.", difficulty: 1 },
  { category: "policies", title: "Delivery Timeframes", content: "Standard delivery 5-7 business days; express 2-3 days; next-day available in select areas for extra fee.", difficulty: 1 },
  { category: "policies", title: "Free Delivery Threshold", content: "Free standard delivery on orders over $35. Some oversized items may incur additional shipping charges.", difficulty: 1 },
  { category: "policies", title: "Installation Services", content: "Professional installation available for TVs, appliances, and smart home products. Fees vary by product.", difficulty: 2 },
  { category: "policies", title: "Data Transfer Services", content: "In-store data transfer from old to new device available. Backup customer data before proceeding.", difficulty: 2 },
  { category: "policies", title: "Device Setup Services", content: "Basic device setup included with purchase. Advanced configuration available for additional fee.", difficulty: 1 },
  { category: "policies", title: "Recycling Program", content: "We accept old electronics for recycling at no charge. Some items may qualify for trade-in credit.", difficulty: 1 },
  { category: "policies", title: "Accessibility Services", content: "Assistance available for customers with disabilities. Provide extra time and patience.", difficulty: 1 },
  { category: "policies", title: "Language Assistance", content: "Translation services available for non-English speaking customers. Use translation app if needed.", difficulty: 1 },
  { category: "policies", title: "Corporate Sales", content: "Business customers purchasing 5+ units qualify for volume discounts. Refer to business sales team.", difficulty: 2 },
  { category: "policies", title: "Tax Exemption", content: "Tax-exempt purchases require valid exemption certificate on file before transaction.", difficulty: 2 },
  { category: "policies", title: "Cash Handling", content: "Count cash twice before placing in register. No bills over $100 without manager verification.", difficulty: 1 },
  { category: "policies", title: "Check Acceptance", content: "Personal checks accepted with valid ID. Check must include phone number and local address.", difficulty: 1 },
  { category: "policies", title: "Credit Card Security", content: "Never manually enter card numbers. Report suspicious transactions to loss prevention immediately.", difficulty: 2 },
  { category: "policies", title: "Price Override Limits", content: "Associates can approve discounts up to $20. Larger adjustments require manager override.", difficulty: 2 },
  { category: "policies", title: "Coupon Stacking", content: "One manufacturer coupon and one store coupon per item. Multiple of same coupon not allowed.", difficulty: 2 },
  { category: "policies", title: "Competitor Coupons", content: "We do not accept competitor coupons. Price match policy applies instead.", difficulty: 1 },
  { category: "policies", title: "Digital Receipt Option", content: "Customers can opt for email receipts. Verify email address carefully before sending.", difficulty: 1 },
  { category: "policies", title: "Return Abuse Prevention", content: "Excessive returns may be flagged by system. Refer to manager if customer is denied return.", difficulty: 2 },
  { category: "policies", title: "Lost Receipt Returns", content: "Returns without receipt may receive lowest selling price in last 90 days as store credit.", difficulty: 2 },
  { category: "policies", title: "Defective Exchanges", content: "Defective products can be exchanged past return window during warranty period.", difficulty: 2 },
  { category: "policies", title: "Recall Procedures", content: "Check recall database weekly. Assist customers with recalled products per manufacturer guidelines.", difficulty: 2 },
  { category: "policies", title: "Clearance Item Returns", content: "Clearance items may be final sale. Check receipt and signage for specific return policies.", difficulty: 1 },
  { category: "policies", title: "Pre-Order Policy", content: "Pre-orders can be cancelled before ship date. Once shipped, standard return policy applies.", difficulty: 2 },
  { category: "policies", title: "Shipping Damage Claims", content: "Delivery damage must be reported within 48 hours with photos. File claim with carrier.", difficulty: 2 },
  { category: "policies", title: "International Returns", content: "Items purchased internationally cannot be returned to domestic stores.", difficulty: 2 },
  { category: "policies", title: "Subscription Cancellation", content: "Digital subscriptions can be cancelled anytime. No prorated refunds for unused time.", difficulty: 2 },
  { category: "policies", title: "Bundle Returns", content: "Bundled items must be returned together. Partial bundle returns may affect pricing.", difficulty: 2 },
  { category: "policies", title: "Seasonal Return Extension", content: "Holiday purchases (Nov 1 - Dec 31) can be returned through January 15.", difficulty: 1 },
  { category: "policies", title: "Final Sale Items", content: "Some categories are final sale: underwear, swimwear, earbuds, and software.", difficulty: 1 },

  // CUSTOMER SERVICE (100 facts)
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
  { category: "customer_service", title: "Phone Etiquette", content: "Answer within 3 rings, identify yourself and store, speak clearly, and never put customer on hold without asking.", difficulty: 1 },
  { category: "customer_service", title: "Email Response Time", content: "Respond to customer emails within 24 hours, even if just to acknowledge receipt and set expectations.", difficulty: 2 },
  { category: "customer_service", title: "Handling Angry Customers", content: "Stay calm, lower your voice, don't take it personally, and focus on finding a resolution.", difficulty: 2 },
  { category: "customer_service", title: "Exceeding Expectations", content: "Go slightly beyond what's expected: carry items to car, provide extra information, remember returning customers.", difficulty: 2 },
  { category: "customer_service", title: "Product Knowledge", content: "Know your products well enough to answer 90% of questions confidently. Look up what you don't know.", difficulty: 2 },
  { category: "customer_service", title: "Cultural Sensitivity", content: "Be aware of different cultural communication styles. Adjust approach while maintaining professionalism.", difficulty: 2 },
  { category: "customer_service", title: "Children in Store", content: "Acknowledge children with parents' permission. Offer to demonstrate kid-friendly products appropriately.", difficulty: 1 },
  { category: "customer_service", title: "Customer Privacy", content: "Never discuss customer information within earshot of others. Shield payment details from view.", difficulty: 2 },
  { category: "customer_service", title: "Service Recovery", content: "When things go wrong, the recovery can create more loyalty than if nothing went wrong.", difficulty: 2 },
  { category: "customer_service", title: "Active Engagement", content: "Walk customers to products rather than pointing. Stay engaged until they're comfortable.", difficulty: 1 },
  { category: "customer_service", title: "Handling Complaints", content: "Thank customers for feedback—complaints are opportunities to improve and retain customers.", difficulty: 2 },
  { category: "customer_service", title: "Queue Management", content: "If lines form, acknowledge waiting customers and call for backup. Consider line-busting with mobile POS.", difficulty: 2 },
  { category: "customer_service", title: "Wheelchair Accessibility", content: "Ensure aisles are clear. Speak directly to customers in wheelchairs, not companions.", difficulty: 1 },
  { category: "customer_service", title: "Hearing Impaired Customers", content: "Face customer directly, speak clearly (not louder), use visual aids and written communication.", difficulty: 2 },
  { category: "customer_service", title: "Visually Impaired Customers", content: "Identify yourself, describe products verbally, offer to guide through store, announce when you leave.", difficulty: 2 },
  { category: "customer_service", title: "Senior Customer Service", content: "Provide extra patience, clear explanations, and avoid rushing. Seniors often become loyal customers.", difficulty: 1 },
  { category: "customer_service", title: "Escalation Protocol", content: "Know when to involve a manager: repeated complaints, legal threats, or when you've exhausted options.", difficulty: 2 },
  { category: "customer_service", title: "First Contact Resolution", content: "Aim to resolve issues on first contact. Reduces customer effort and increases satisfaction.", difficulty: 2 },
  { category: "customer_service", title: "Apologizing Effectively", content: "Say 'I apologize' instead of 'I'm sorry you feel that way.' Take responsibility without blame.", difficulty: 2 },
  { category: "customer_service", title: "Setting Expectations", content: "Under-promise and over-deliver. Set realistic timelines, then beat them when possible.", difficulty: 2 },
  { category: "customer_service", title: "Remembering Regulars", content: "Note returning customers' preferences. Personal recognition builds strong customer relationships.", difficulty: 2 },
  { category: "customer_service", title: "Handling Difficult Questions", content: "If unsure, say 'Great question. Let me find the best answer for you' rather than guessing wrong.", difficulty: 1 },
  { category: "customer_service", title: "Team Handoffs", content: "When transferring customers to colleagues, provide context so customer doesn't repeat themselves.", difficulty: 2 },
  { category: "customer_service", title: "Omnichannel Service", content: "Online, phone, and in-store interactions should provide consistent service experience.", difficulty: 2 },
  { category: "customer_service", title: "Proactive Service", content: "Approach browsing customers before they ask for help. Anticipate needs.", difficulty: 1 },
  { category: "customer_service", title: "Non-Verbal Communication", content: "Maintain open posture, appropriate eye contact, and genuine smiles. Body language is 55% of message.", difficulty: 2 },
  { category: "customer_service", title: "Tone of Voice", content: "Tone accounts for 38% of communication. Keep voice pleasant, professional, and confident.", difficulty: 1 },
  { category: "customer_service", title: "Customer Effort Score", content: "Make interactions effortless. The easier you make it, the more loyal customers become.", difficulty: 2 },
  { category: "customer_service", title: "Personalization", content: "Use customer's name when appropriate. Personalized service feels more valuable.", difficulty: 1 },
  { category: "customer_service", title: "Technical Support Basics", content: "Start with simple solutions: restart device, check connections, update software. 80% of issues are simple.", difficulty: 2 },
  { category: "customer_service", title: "Managing Expectations", content: "Clearly explain what will happen next, when, and what customer needs to do.", difficulty: 2 },
  { category: "customer_service", title: "Service Attitude", content: "Treat every customer like they're the most important person—because to them, they are.", difficulty: 1 },
  { category: "customer_service", title: "Complaint Documentation", content: "Record complaints accurately. Details help resolve issues and identify patterns.", difficulty: 2 },
  { category: "customer_service", title: "Product Availability", content: "Check inventory before promising. Offer alternatives or order if item unavailable.", difficulty: 1 },
  { category: "customer_service", title: "Closing Sales Properly", content: "Review purchase, explain receipt, mention return policy, and thank customer warmly.", difficulty: 1 },
  { category: "customer_service", title: "Service Recovery Paradox", content: "Customers whose problems are solved well may become more loyal than those who never had issues.", difficulty: 2 },
  { category: "customer_service", title: "Avoiding Jargon", content: "Use simple language customers understand. Explain technical terms when necessary.", difficulty: 1 },
  { category: "customer_service", title: "Patience with Indecision", content: "Some customers need time. Provide information without pressure. Be available when needed.", difficulty: 1 },
  { category: "customer_service", title: "Store Cleanliness", content: "Clean, organized stores improve customer experience. Tidy your area throughout the day.", difficulty: 1 },
  { category: "customer_service", title: "Respecting Personal Space", content: "Maintain appropriate distance. Step back if customer seems uncomfortable.", difficulty: 1 },

  // Additional facts for variety
  { category: "product_features", title: "Monitor Panel Types", content: "IPS panels offer best color accuracy; VA panels have deep blacks; TN panels have fastest response times.", difficulty: 3 },
  { category: "product_features", title: "Laptop GPU Types", content: "Integrated graphics handle basic tasks; discrete GPUs (NVIDIA, AMD) required for gaming and creative work.", difficulty: 3 },
  { category: "product_features", title: "Smart Speaker Audio", content: "Larger speakers produce better bass; multi-room audio syncs music across your home.", difficulty: 2 },
  { category: "product_features", title: "Curved Monitor Benefits", content: "Curved monitors reduce eye strain and provide more immersive viewing for gaming and entertainment.", difficulty: 2 },
  { category: "product_features", title: "Laptop Keyboard Lighting", content: "Backlit keyboards help in low light; RGB keyboards offer customizable color zones for gamers.", difficulty: 1 },
  { category: "product_features", title: "Portable Speaker Features", content: "IPX7 waterproof rating means full submersion protection; party mode links multiple speakers.", difficulty: 2 },
  { category: "product_features", title: "Streaming Device Comparison", content: "Roku offers most apps; Fire TV integrates with Alexa; Apple TV works best with Apple devices.", difficulty: 2 },
  { category: "product_features", title: "External SSD Speeds", content: "USB 3.0 provides 5Gbps; Thunderbolt 3/USB4 reaches 40Gbps for professional workflows.", difficulty: 3 },
  { category: "product_features", title: "Smart Display Features", content: "Smart displays add visual interface to voice assistants: recipes, video calls, smart home control.", difficulty: 2 },
  { category: "product_features", title: "Gaming Monitor Features", content: "G-Sync/FreeSync eliminates screen tearing; 1ms response time prevents ghosting in fast games.", difficulty: 3 },

  { category: "sales_techniques", title: "Handling Group Decisions", content: "Identify the decision-maker in groups. Include all parties but focus presentation on the buyer.", difficulty: 3 },
  { category: "sales_techniques", title: "The Standstill Close", content: "When customer is stuck: 'We've covered a lot. What's the main thing preventing a decision today?'", difficulty: 3 },
  { category: "sales_techniques", title: "Building Trust Quickly", content: "Share relevant experience, acknowledge tradeoffs honestly, and recommend what you'd buy yourself.", difficulty: 2 },
  { category: "sales_techniques", title: "Price Presentation", content: "State price confidently without apologizing. Hesitation suggests even you think it's too high.", difficulty: 2 },
  { category: "sales_techniques", title: "The Question Close", content: "'What would it take for this to be the right choice for you?' reveals remaining objections.", difficulty: 3 },
  { category: "sales_techniques", title: "Timing Your Close", content: "Watch for buying signals: nodding, leaning forward, asking about details. Close when interest peaks.", difficulty: 3 },
  { category: "sales_techniques", title: "Seasonal Selling", content: "Tie products to seasons and events: back-to-school, holiday gifts, summer travel.", difficulty: 2 },
  { category: "sales_techniques", title: "Gift Selling Strategies", content: "Focus on recipient's needs and interests. Suggest gift cards when customer is unsure.", difficulty: 2 },
  { category: "sales_techniques", title: "Business Customer Focus", content: "Emphasize ROI, productivity gains, and reliability when selling to business customers.", difficulty: 2 },
  { category: "sales_techniques", title: "Tech-Hesitant Customers", content: "Simplify explanations, demonstrate ease of use, and emphasize support options.", difficulty: 2 },

  { category: "policies", title: "Break Schedule Compliance", content: "Take scheduled breaks. Overtime requires manager pre-approval except during peak periods.", difficulty: 1 },
  { category: "policies", title: "Dress Code Standards", content: "Branded apparel or professional attire required. Closed-toe shoes mandatory in warehouse areas.", difficulty: 1 },
  { category: "policies", title: "Social Media Policy", content: "Don't post about company, customers, or workplace on personal social media without approval.", difficulty: 2 },
  { category: "policies", title: "Incident Reporting", content: "Report accidents, injuries, and near-misses immediately. Complete incident form same day.", difficulty: 2 },
  { category: "policies", title: "Loss Prevention", content: "Watch for theft indicators: removing tags, concealment, frequent restroom trips with products.", difficulty: 2 },
  { category: "policies", title: "Emergency Procedures", content: "Know evacuation routes and assembly points. Follow instructions from management during emergencies.", difficulty: 1 },
  { category: "policies", title: "Food and Drink", content: "Beverages allowed in break room only. No food on sales floor.", difficulty: 1 },
  { category: "policies", title: "Cell Phone Policy", content: "Personal phones silent and out of sight during shifts. Use only on breaks.", difficulty: 1 },
  { category: "policies", title: "Attendance Policy", content: "Call in 2 hours before shift for absences. Three consecutive absences require documentation.", difficulty: 1 },
  { category: "policies", title: "Training Requirements", content: "Complete mandatory compliance training annually. New product training within 30 days of launch.", difficulty: 2 },

  { category: "customer_service", title: "Empowering Phrases", content: "'Let me take care of that for you' shows ownership. 'I'll make sure this gets resolved' builds trust.", difficulty: 1 },
  { category: "customer_service", title: "Managing Emotions", content: "If feeling frustrated, take a breath before responding. Stay professional under pressure.", difficulty: 2 },
  { category: "customer_service", title: "Survey Importance", content: "Customer surveys drive store ratings. Provide excellent service worthy of top scores.", difficulty: 2 },
  { category: "customer_service", title: "VIP Customer Treatment", content: "High-value customers get priority service. Know who your regulars are and their preferences.", difficulty: 2 },
  { category: "customer_service", title: "Feedback Response", content: "Thank customers for all feedback. Negative feedback helps improve; positive feedback motivates.", difficulty: 1 },
  { category: "customer_service", title: "Knowledge Gaps", content: "When you don't know, say 'I don't have that information, but I'll find someone who does.'", difficulty: 1 },
  { category: "customer_service", title: "Creating Moments", content: "Look for opportunities to create memorable positive experiences that customers will share.", difficulty: 2 },
  { category: "customer_service", title: "Long Wait Handling", content: "For extended waits, offer drinks, seating, or browsing suggestions. Update frequently.", difficulty: 2 },
  { category: "customer_service", title: "Rush Period Service", content: "During busy times, be efficient but not rushed. Quality doesn't drop with quantity.", difficulty: 2 },
  { category: "customer_service", title: "End of Day Energy", content: "Last customers deserve same energy as first. Maintain enthusiasm throughout shift.", difficulty: 1 },
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
  {
    question: "What RAM amount is recommended for power users?",
    options: ["4GB", "8GB", "16GB", "32GB"],
    correctAnswer: 2,
    explanation: "8GB is minimum for smooth multitasking; 16GB is recommended for power users; 32GB+ for professional workloads.",
    category: "product_features"
  },
  {
    question: "What is the trial close technique?",
    options: ["Offering a free trial", "Testing if customer is ready to buy", "Closing the store for a trial period", "Trying different products"],
    correctAnswer: 1,
    explanation: "A trial close tests buying readiness: 'How does this sound so far?' or 'Is this what you had in mind?'",
    category: "sales_techniques"
  },
  {
    question: "What is the price adjustment window typically?",
    options: ["7 days", "14 days", "30 days", "60 days"],
    correctAnswer: 1,
    explanation: "If the price drops within 14 days of purchase, we refund the difference with the original receipt.",
    category: "policies"
  },
  {
    question: "What percentage of communication is body language?",
    options: ["10%", "25%", "55%", "90%"],
    correctAnswer: 2,
    explanation: "Body language accounts for 55% of communication. Maintain open posture and appropriate eye contact.",
    category: "customer_service"
  },
  {
    question: "What is the anchoring strategy in sales?",
    options: ["Showing cheapest option first", "Showing premium option first", "Only showing one option", "Hiding the price"],
    correctAnswer: 1,
    explanation: "Show the premium option first so the mid-range seems more affordable by comparison.",
    category: "sales_techniques"
  },
  {
    question: "What WiFi standard offers up to 9.6 Gbps speeds?",
    options: ["WiFi 4", "WiFi 5", "WiFi 6/6E", "WiFi 3"],
    correctAnswer: 2,
    explanation: "WiFi 6E offers speeds up to 9.6 Gbps and operates on 2.4GHz, 5GHz, and 6GHz bands.",
    category: "product_features"
  },
  {
    question: "How should you handle a customer who is hesitant to decide?",
    options: ["Pressure them to buy now", "Ask what they'd like to think about", "Walk away immediately", "Offer a huge discount"],
    correctAnswer: 1,
    explanation: "Ask: 'What specifically would you like to think about? I can provide more information.'",
    category: "sales_techniques"
  },
  {
    question: "What should you do when you don't know the answer to a question?",
    options: ["Make up an answer", "Say 'I don't know' and walk away", "Say you'll find someone who knows", "Ignore the question"],
    correctAnswer: 2,
    explanation: "Say 'Great question. Let me find the best answer for you' rather than guessing wrong.",
    category: "customer_service"
  },
  {
    question: "What is the extended return window for holiday purchases?",
    options: ["December 31", "January 5", "January 15", "February 1"],
    correctAnswer: 2,
    explanation: "Holiday purchases (Nov 1 - Dec 31) can be returned through January 15.",
    category: "policies"
  },
  {
    question: "What does Active Noise Cancellation (ANC) do?",
    options: ["Makes music louder", "Uses inverse sound waves to reduce noise", "Blocks all sound completely", "Improves microphone quality"],
    correctAnswer: 1,
    explanation: "ANC uses microphones to create inverse sound waves, reducing ambient noise by up to 95%.",
    category: "product_features"
  },
];

export async function seedDatabase() {
  console.log("Starting database seed...");
  
  try {
    const existingFacts = await db.select().from(facts).limit(1);
    const existingAchievements = await db.select().from(achievements).limit(1);
    
    if (existingFacts.length > 0 && existingAchievements.length > 0) {
      console.log("Database already seeded, skipping...");
      return;
    }
    
    if (existingFacts.length > 0) {
      console.log("Facts already seeded, checking achievements...");
    }
    
    if (existingFacts.length === 0) {
      console.log("Inserting facts...");
      for (const fact of retailFacts) {
        await db.insert(facts).values(fact);
      }
      console.log(`Inserted ${retailFacts.length} facts`);
    }
    
    const existingQuizzes = await db.select().from(quizQuestions).limit(1);
    if (existingQuizzes.length === 0) {
      console.log("Inserting quiz questions...");
      for (const question of quizQuestionsData) {
        await db.insert(quizQuestions).values(question);
      }
      console.log(`Inserted ${quizQuestionsData.length} quiz questions`);
    }
    
    // Seed achievements
    const achievementsData = [
      { name: "First Steps", description: "Master your first fact", icon: "baby", requirement: "facts_1", category: "learning" },
      { name: "Getting Started", description: "Master 10 facts", icon: "star", requirement: "facts_10", category: "learning" },
      { name: "Knowledge Builder", description: "Master 50 facts", icon: "book-open", requirement: "facts_50", category: "learning" },
      { name: "Fact Expert", description: "Master 100 facts", icon: "trophy", requirement: "facts_100", category: "mastery" },
      { name: "Walking Encyclopedia", description: "Master 300 facts", icon: "library", requirement: "facts_300", category: "mastery" },
      { name: "Master Scholar", description: "Master 500 facts", icon: "crown", requirement: "facts_500", category: "mastery" },
      { name: "First Quiz", description: "Complete your first quiz", icon: "check-circle", requirement: "quiz_1", category: "learning" },
      { name: "Quiz Whiz", description: "Complete 10 quizzes", icon: "zap", requirement: "quiz_10", category: "learning" },
      { name: "Perfect Score", description: "Get 100% on a quiz", icon: "award", requirement: "quiz_perfect", category: "mastery" },
      { name: "Streak Starter", description: "Reach a 3-day streak", icon: "flame", requirement: "streak_3", category: "consistency" },
      { name: "Week Warrior", description: "Reach a 7-day streak", icon: "fire", requirement: "streak_7", category: "consistency" },
      { name: "Streak Champion", description: "Reach a 30-day streak", icon: "medal", requirement: "streak_30", category: "consistency" },
      { name: "Baby Buddy", description: "Hatch your first creature", icon: "egg", requirement: "stage_1", category: "evolution" },
      { name: "Toddler Time", description: "Evolve to Toddler stage", icon: "sprout", requirement: "stage_2", category: "evolution" },
      { name: "Teen Spirit", description: "Evolve to Teen stage", icon: "sparkles", requirement: "stage_3", category: "evolution" },
      { name: "All Grown Up", description: "Evolve to Adult stage", icon: "heart", requirement: "stage_4", category: "evolution" },
      { name: "Master Buddy", description: "Reach Master evolution", icon: "gem", requirement: "stage_5", category: "evolution" },
      { name: "Happy Buddy", description: "Keep creature at 100% happiness", icon: "smile", requirement: "happiness_100", category: "care" },
      { name: "Game Master", description: "Complete 10 Match games", icon: "gamepad", requirement: "minigame_10", category: "learning" },
    ];

    if (existingAchievements.length === 0) {
      for (const achievement of achievementsData) {
        await db.insert(achievements).values(achievement);
      }
      console.log(`Inserted ${achievementsData.length} achievements`);
    }
    
    // Seed accessories
    const existingAccessories = await db.select().from(accessories).limit(1);
    const accessoriesData = [
      // Hats
      { name: "Party Hat", description: "A colorful cone hat for celebrations", category: "hat", price: 25, icon: "party-popper", rarity: "common" },
      { name: "Wizard Hat", description: "A mystical purple wizard hat", category: "hat", price: 75, icon: "wand", rarity: "rare" },
      { name: "Crown", description: "A golden crown fit for royalty", category: "hat", price: 200, icon: "crown", rarity: "epic" },
      { name: "Halo", description: "A divine golden halo", category: "hat", price: 500, icon: "sparkles", rarity: "legendary" },
      { name: "Baseball Cap", description: "A casual sporty cap", category: "hat", price: 20, icon: "hard-hat", rarity: "common" },
      { name: "Top Hat", description: "A classy gentleman's top hat", category: "hat", price: 100, icon: "graduation-cap", rarity: "rare" },
      // Glasses
      { name: "Cool Shades", description: "Stylish dark sunglasses", category: "glasses", price: 30, icon: "sunglasses", rarity: "common" },
      { name: "Nerd Glasses", description: "Smart-looking round glasses", category: "glasses", price: 35, icon: "glasses", rarity: "common" },
      { name: "Star Glasses", description: "Fun star-shaped glasses", category: "glasses", price: 60, icon: "star", rarity: "rare" },
      { name: "Monocle", description: "A distinguished monocle", category: "glasses", price: 150, icon: "eye", rarity: "epic" },
      // Necklaces
      { name: "Heart Pendant", description: "A sweet heart-shaped necklace", category: "necklace", price: 40, icon: "heart", rarity: "common" },
      { name: "Star Charm", description: "A sparkling star necklace", category: "necklace", price: 50, icon: "star", rarity: "common" },
      { name: "Pearl Necklace", description: "Elegant string of pearls", category: "necklace", price: 120, icon: "circle", rarity: "rare" },
      { name: "Diamond Pendant", description: "A dazzling diamond necklace", category: "necklace", price: 300, icon: "gem", rarity: "epic" },
      // Backgrounds
      { name: "Meadow", description: "A peaceful grassy meadow", category: "background", price: 50, icon: "flower", rarity: "common" },
      { name: "Ocean", description: "A serene ocean view", category: "background", price: 50, icon: "waves", rarity: "common" },
      { name: "Space", description: "A cosmic starry background", category: "background", price: 100, icon: "rocket", rarity: "rare" },
      { name: "Rainbow", description: "A colorful rainbow paradise", category: "background", price: 150, icon: "rainbow", rarity: "rare" },
      { name: "Castle", description: "A majestic castle setting", category: "background", price: 250, icon: "castle", rarity: "epic" },
      { name: "Northern Lights", description: "Magical aurora borealis", category: "background", price: 400, icon: "sparkles", rarity: "legendary" },
    ];

    if (existingAccessories.length === 0) {
      for (const accessory of accessoriesData) {
        await db.insert(accessories).values(accessory);
      }
      console.log(`Inserted ${accessoriesData.length} accessories`);
    }
    
    console.log("Checking for demo user...");
    const existingUsers = await db.select().from(users).limit(1);
    
    if (existingUsers.length === 0) {
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
    } else {
      console.log("Demo user already exists, skipping...");
    }
    
    console.log("Database seed completed successfully!");
  } catch (error) {
    console.error("Error seeding database:", error);
    throw error;
  }
}
