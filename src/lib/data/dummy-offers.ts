/**
 * Dummy offers for demonstration and testing purposes
 *
 * These sample offers are used when no real data is available,
 * allowing users to explore the dashboard functionality with
 * realistic examples.
 */

import { Offer } from "@/types";

export const DUMMY_OFFERS: Offer[] = [
  {
    id: "1",
    title: "Senior Frontend Dev",
    description: "React, Next.js, $120k, Remote",
    price: 120000,
    location: "Remote",
    category: "Job",
  },
  {
    id: "2",
    title: "Full Stack Engineer",
    description: "Node.js, Vue, $130k, Hybrid NYC",
    price: 130000,
    location: "NYC",
    category: "Job",
  },
];
