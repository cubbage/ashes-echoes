export const SEED_WORKSPACE = {
  schemaVersion: "1.0",
  profile: {
    firstName: "Ayesha",
    timezone: "Asia/Karachi"
  },
  targets: [
    {
      id: "caprae-bd-2026",
      company: "Caprae Capital Partners",
      role: "Entry-level Business Development / M&A",
      stage: "Written screening → introductory interview",
      objective: "Show cold-call readiness, resilience, curiosity, and an intentional move into business development.",
      priorities: [
        "Answer the written screening clearly and truthfully.",
        "Connect phone-based sales experience to outbound business development.",
        "Be ready for a mock cold call after the introductory interview.",
        "Explain interest in an entry-level role and U.S. working hours."
      ],
      sourceSummary: ["Candidate-provided Caprae screening handbook"]
    },
    {
      id: "sdr-outbound-sales-pro",
      company: "Outbound Sales Pro",
      role: "Sales Development Representative",
      stage: "Interview preparation",
      objective: "Sound confident, coachable, concise, and calm on an outbound-sales interview and roleplay.",
      priorities: [
        "Explain the move from inbound reservations to outbound sales.",
        "Practise a concise cold-call opener and objections.",
        "Use specific Gray Langur evidence without memorizing speeches."
      ],
      sourceSummary: ["Candidate-provided SDR interview preparation"]
    }
  ],
  evidenceCards: [
    {
      id: "gray-langur-overview",
      title: "Gray Langur: phone-based reservations and sales",
      situation: "Remote Voice Reservations Agent, April 2023–May 2025, serving international tour customers; about 80% were U.S. clients.",
      action: "Handled high-volume inbound inquiries, bookings, changes, follow-ups, detailed questions, and tour coordination.",
      result: "Built practical experience in clear phone communication, follow-up discipline, objection handling, and customer trust.",
      proves: ["Phone confidence", "U.S. client communication", "Follow-up", "Sales foundation"],
      targetIds: ["caprae-bd-2026", "sdr-outbound-sales-pro"]
    },
    {
      id: "repeat-bookings",
      title: "15% increase in repeat bookings",
      situation: "Used post-trip feedback and sales trends to identify highly satisfied guests and referral opportunities.",
      action: "Reviewed feedback, followed up with guests, and asked what would make them likely to recommend Bhutan and Gray Langur to people they knew.",
      result: "Contributed to a 15% increase in repeat bookings.",
      proves: ["Initiative", "Data awareness", "Retention", "Follow-up discipline"],
      targetIds: ["caprae-bd-2026", "sdr-outbound-sales-pro"]
    },
    {
      id: "call-time",
      title: "20% lower call handling time",
      situation: "Prospects often asked recurring detail-heavy booking questions during calls.",
      action: "Created thorough email templates for repeat questions and set the expectation that callers would receive the detailed answer promptly after the call.",
      result: "Reduced average call handling time by 20% while maintaining conversion rates.",
      proves: ["Process improvement", "Customer communication", "Efficiency", "Commercial judgment"],
      targetIds: ["caprae-bd-2026", "sdr-outbound-sales-pro"]
    },
    {
      id: "group-booking",
      title: "Reassuring a stressed group organizer",
      situation: "A group organizer responsible for ten booked travelers was overwhelmed collecting details required to confirm a Bhutan trip.",
      action: "Listened for the real concern, explained the risks clearly, helped organize the information, and took on more of the coordination burden.",
      result: "The group was able to prepare for the trip with confidence, and the organizer felt supported rather than pressured.",
      proves: ["Listening", "Calm under pressure", "Persuasion", "Client trust"],
      targetIds: ["caprae-bd-2026", "sdr-outbound-sales-pro"]
    },
    {
      id: "customer-satisfaction",
      title: "90% customer satisfaction",
      situation: "Customer experience depended on accurate bookings, responsive communication, and thoughtful follow-up.",
      action: "Managed client questions and changes carefully, coordinated with vendors, and recorded customer feedback for improvement.",
      result: "Achieved a 90% customer satisfaction score based on post-call surveys.",
      proves: ["Service quality", "Reliability", "Relationship management"],
      targetIds: ["sdr-outbound-sales-pro"]
    }
  ],
  questions: [
    {
      id: "tell-me-about-yourself",
      targetIds: ["caprae-bd-2026", "sdr-outbound-sales-pro"],
      prompt: "Tell me about yourself.",
      timeLimitSeconds: 60,
      answerBullets: ["Start with 2+ years of phone-based reservations and sales work at Gray Langur.", "Mention mostly U.S. customers, follow-up, detailed customer questions, and sales results.", "Connect the science background to discipline and analytical thinking—not to sales expertise.", "End with the intentional move into performance-based business development or SDR work."],
      evidenceIds: ["gray-langur-overview", "repeat-bookings", "call-time"]
    },
    {
      id: "why-outbound",
      targetIds: ["caprae-bd-2026", "sdr-outbound-sales-pro"],
      prompt: "Your background is inbound reservations. Why should we believe you can do outbound?",
      timeLimitSeconds: 60,
      answerBullets: ["Acknowledge the distinction directly.", "Point to comfort starting conversations, asking questions, handling concerns, and following up.", "Say you are deliberately pursuing a performance-based role where activity, coaching, and repetition lead to improvement.", "Do not claim prior cold-calling experience that you do not have."],
      evidenceIds: ["gray-langur-overview", "group-booking"]
    },
    {
      id: "difficult-customer",
      targetIds: ["caprae-bd-2026", "sdr-outbound-sales-pro"],
      prompt: "Tell me about a difficult customer.",
      timeLimitSeconds: 60,
      answerBullets: ["Use the group organizer story.", "Make the customer’s actual concern specific.", "Spend most of the answer on what you did: listened, clarified risk, organized the process, and reassured her.", "End with the practical result and what it taught you."],
      evidenceIds: ["group-booking"]
    },
    {
      id: "why-caprae",
      targetIds: ["caprae-bd-2026"],
      prompt: "Why Caprae Capital?",
      timeLimitSeconds: 60,
      answerBullets: ["Connect Caprae’s stated emphasis on resilience, independent thinking, and learning a craft to your own goals.", "Explain that the entry-level business-development role is an intentional start, not a fallback.", "Connect Gray Langur phone work and follow-up discipline to the cold-calling foundation of the role.", "Avoid generic praise or pay as the main reason."],
      evidenceIds: ["gray-langur-overview", "repeat-bookings"]
    },
    {
      id: "handle-rejection",
      targetIds: ["caprae-bd-2026", "sdr-outbound-sales-pro"],
      prompt: "How do you handle rejection?",
      timeLimitSeconds: 30,
      answerBullets: ["Do not take a no personally.", "Focus on activity, improving the opener, asking better questions, and using feedback.", "Stay respectful: a no can mean timing or fit, not personal failure."],
      evidenceIds: []
    }
  ],
  challengePrompts: [
    { id: "challenge-specific", text: "What exactly did you do—not your team?", purpose: "Make the answer specific." },
    { id: "challenge-result", text: "How did you know your approach worked?", purpose: "Require evidence or an honest observation." },
    { id: "challenge-transfer", text: "Why does that prove you can succeed in this role?", purpose: "Connect experience to the target role." },
    { id: "challenge-reflect", text: "What would you do differently next time?", purpose: "Show coachability and judgment." }
  ],
  coldCallScenarios: [
    {
      id: "busy-prospect",
      targetIds: ["caprae-bd-2026", "sdr-outbound-sales-pro"],
      prospectLine: "I’m busy. What is this about?",
      objective: "Earn permission for one relevant discovery question.",
      coachBullets: ["Acknowledge the interruption without over-apologizing.", "State your reason for calling in one sentence.", "Ask a short question; do not launch into a long pitch."]
    },
    {
      id: "not-interested",
      targetIds: ["caprae-bd-2026", "sdr-outbound-sales-pro"],
      prospectLine: "Not interested.",
      objective: "Stay calm and ask one respectful clarifying question.",
      coachBullets: ["Do not argue or sound disappointed.", "Ask whether the priority is timing, fit, or an existing solution.", "Accept the answer professionally if there is no opening."]
    },
    {
      id: "send-email",
      targetIds: ["caprae-bd-2026", "sdr-outbound-sales-pro"],
      prospectLine: "Just send me an email.",
      objective: "Learn enough to make the email relevant or earn a brief follow-up.",
      coachBullets: ["Agree to send it.", "Ask one question about what would be useful in the email.", "Confirm the best next step before ending the call."]
    }
  ],
  practiceSessions: [],
  settings: { lastBackupAt: null }
};
