"use server";

import { db } from "@/firebase/admin";

export async function submitExperience(data: {
  company: string;
  role: string;
  city: string;
  year: number;
  rounds: { name: string; description: string; questions: string[]; difficulty: string }[];
  difficulty: string;
  outcome: string;
  tips: string;
  submittedBy: string;
}) {
  const docRef = await db.collection("experiences").add({
    ...data,
    submittedAt: new Date().toISOString(),
  });
  return docRef.id;
}

export async function getExperiences(filters?: {
  company?: string;
  year?: number;
}): Promise<(Experience & { id: string })[]> {
  let query: FirebaseFirestore.Query = db.collection("experiences")
    .orderBy("submittedAt", "desc");

  if (filters?.company) {
    query = query.where("company", "==", filters.company);
  }
  if (filters?.year) {
    query = query.where("year", "==", filters.year);
  }

  const snapshot = await query.limit(50).get();
  return snapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data(),
  })) as (Experience & { id: string })[];
}

export async function getExperienceById(id: string): Promise<(Experience & { id: string }) | null> {
  const doc = await db.collection("experiences").doc(id).get();
  if (!doc.exists) return null;
  return { id: doc.id, ...doc.data() } as Experience & { id: string };
}

export async function getUniqueCompanies(): Promise<string[]> {
  const snapshot = await db.collection("experiences").get();
  const companies = new Set<string>();
  snapshot.docs.forEach(doc => {
    const data = doc.data();
    if (data.company) companies.add(data.company);
  });
  return Array.from(companies).sort();
}
