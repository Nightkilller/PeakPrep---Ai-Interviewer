"use client";

import { useState } from "react";
import Navbar from "@/components/Navbar";
import { getCompanyLogo } from "@/lib/utils";

type Internship = {
  id: number;
  company: string;
  logo: string;
  role: string;
  location: string;
  stipend: string;
  duration: string;
  deadline: string;
  skills: string[];
  category: "tech" | "product" | "data" | "design";
  link: string;
  type: "Remote" | "On-site" | "Hybrid";
  openings: number;
};

const internships: Internship[] = [
  {
    id: 1,
    company: "Google",
    logo: "google.com",
    role: "STEP Intern – Software Engineering",
    location: "Bangalore, India",
    stipend: "₹80,000 – ₹1,20,000/mo",
    duration: "10–12 weeks",
    deadline: "2026-07-15",
    skills: ["DSA", "Python", "System Design", "Problem Solving"],
    category: "tech",
    link: "https://careers.google.com/jobs/results/?q=STEP%20intern",
    type: "Hybrid",
    openings: 50,
  },
  {
    id: 2,
    company: "Microsoft",
    logo: "microsoft.com",
    role: "SWE Intern – Azure Cloud",
    location: "Hyderabad, India",
    stipend: "₹75,000 – ₹1,00,000/mo",
    duration: "12 weeks",
    deadline: "2026-06-30",
    skills: ["C++", "Cloud Computing", "REST APIs", "Azure"],
    category: "tech",
    link: "https://careers.microsoft.com/us/en/search-results?keywords=intern",
    type: "Hybrid",
    openings: 80,
  },
  {
    id: 3,
    company: "Amazon",
    logo: "amazon.com",
    role: "SDE Intern",
    location: "Bangalore, India",
    stipend: "₹80,000 – ₹1,10,000/mo",
    duration: "8–12 weeks",
    deadline: "2026-08-01",
    skills: ["Java", "DSA", "OOP", "Distributed Systems"],
    category: "tech",
    link: "https://www.amazon.jobs/en/search?category=software-development&is_intern=1",
    type: "On-site",
    openings: 120,
  },
  {
    id: 4,
    company: "Flipkart",
    logo: "flipkart.com",
    role: "Backend Engineering Intern",
    location: "Bangalore, India",
    stipend: "₹50,000 – ₹80,000/mo",
    duration: "6 months",
    deadline: "2026-06-15",
    skills: ["Java", "Spring Boot", "Microservices", "SQL"],
    category: "tech",
    link: "https://www.flipkartcareers.com/#!/listing",
    type: "Hybrid",
    openings: 30,
  },
  {
    id: 5,
    company: "Razorpay",
    logo: "razorpay.com",
    role: "Product Intern",
    location: "Bangalore, India",
    stipend: "₹40,000 – ₹60,000/mo",
    duration: "3 months",
    deadline: "2026-07-01",
    skills: ["Product Thinking", "SQL", "Analytics", "Wireframing"],
    category: "product",
    link: "https://razorpay.com/jobs/",
    type: "Hybrid",
    openings: 10,
  },
  {
    id: 6,
    company: "Swiggy",
    logo: "swiggy.com",
    role: "Data Science Intern",
    location: "Bangalore, India",
    stipend: "₹50,000 – ₹70,000/mo",
    duration: "6 months",
    deadline: "2026-07-20",
    skills: ["Python", "ML", "Pandas", "SQL", "Statistics"],
    category: "data",
    link: "https://careers.swiggy.com/",
    type: "Hybrid",
    openings: 15,
  },
  {
    id: 13,
    company: "ISRO",
    logo: "isro.gov.in",
    role: "Research Intern - Space Tech",
    location: "Bangalore, India",
    stipend: "Unpaid / Academic Credit",
    duration: "4–6 months",
    deadline: "2026-05-30",
    skills: ["C++", "Python", "Data Processing", "Aerospace"],
    category: "tech",
    link: "https://www.isro.gov.in/InternshipAndProjects.html",
    type: "On-site",
    openings: 50,
  },
  {
    id: 14,
    company: "NITI Aayog",
    logo: "niti.gov.in",
    role: "Data Analytics Intern",
    location: "New Delhi, India",
    stipend: "Unpaid",
    duration: "6 weeks – 6 months",
    deadline: "Open all year",
    skills: ["Data Analysis", "Policy Research", "Excel", "Python"],
    category: "data",
    link: "https://niti.gov.in/internship",
    type: "Hybrid",
    openings: 30,
  },
  {
    id: 15,
    company: "DRDO",
    logo: "drdo.gov.in",
    role: "Student Intern - Defense R&D",
    location: "Pune, India",
    stipend: "₹10,000 – ₹15,000/mo",
    duration: "8 weeks",
    deadline: "2026-06-10",
    skills: ["Embedded Systems", "C", "Machine Learning", "Robotics"],
    category: "tech",
    link: "https://www.drdo.gov.in/careers",
    type: "On-site",
    openings: 20,
  },
  {
    id: 7,
    company: "Zomato",
    logo: "zomato.com",
    role: "Frontend Engineering Intern",
    location: "Gurugram, India",
    stipend: "₹45,000 – ₹60,000/mo",
    duration: "4 months",
    deadline: "2026-06-25",
    skills: ["React", "TypeScript", "CSS", "REST APIs"],
    category: "tech",
    link: "https://www.zomato.com/careers",
    type: "On-site",
    openings: 20,
  },
  {
    id: 8,
    company: "PhonePe",
    logo: "phonepe.com",
    role: "ML Engineering Intern",
    location: "Bangalore, India",
    stipend: "₹60,000 – ₹85,000/mo",
    duration: "6 months",
    deadline: "2026-08-10",
    skills: ["Python", "TensorFlow", "Deep Learning", "NLP"],
    category: "data",
    link: "https://www.phonepe.com/careers/",
    type: "Hybrid",
    openings: 8,
  },
  {
    id: 9,
    company: "Figma",
    logo: "figma.com",
    role: "Product Design Intern",
    location: "Remote (Global)",
    stipend: "$5,000 – $7,000/mo",
    duration: "12 weeks",
    deadline: "2026-09-01",
    skills: ["UI/UX", "Figma", "Design Systems", "Prototyping"],
    category: "design",
    link: "https://www.figma.com/careers/",
    type: "Remote",
    openings: 12,
  },
  {
    id: 10,
    company: "Goldman Sachs",
    logo: "goldmansachs.com",
    role: "Technology Analyst Intern",
    location: "Bangalore, India",
    stipend: "₹1,00,000 – ₹1,50,000/mo",
    duration: "10 weeks",
    deadline: "2026-07-30",
    skills: ["Java", "Python", "DSA", "Financial Systems"],
    category: "tech",
    link: "https://www.goldmansachs.com/careers/students/programs/india/summer-analyst.html",
    type: "On-site",
    openings: 40,
  },
  {
    id: 11,
    company: "Uber",
    logo: "uber.com",
    role: "Backend Engineering Intern",
    location: "Hyderabad, India",
    stipend: "₹70,000 – ₹1,00,000/mo",
    duration: "12 weeks",
    deadline: "2026-08-15",
    skills: ["Go", "Microservices", "Kafka", "System Design"],
    category: "tech",
    link: "https://www.uber.com/us/en/careers/",
    type: "Hybrid",
    openings: 25,
  },
  {
    id: 12,
    company: "Cred",
    logo: "cred.club",
    role: "Mobile Dev Intern (iOS/Android)",
    location: "Bangalore, India",
    stipend: "₹50,000 – ₹75,000/mo",
    duration: "6 months",
    deadline: "2026-06-20",
    skills: ["Swift", "Kotlin", "React Native", "UI Design"],
    category: "tech",
    link: "https://careers.cred.club/",
    type: "On-site",
    openings: 10,
  },
];

const categories = [
  { key: "all", label: "All" },
  { key: "tech", label: "Engineering" },
  { key: "product", label: "Product" },
  { key: "data", label: "Data / ML" },
  { key: "design", label: "Design" },
];

function getDaysLeft(deadline: string): number {
  const diff = new Date(deadline).getTime() - Date.now();
  return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
}

export default function InternshipsPage() {
  const [filter, setFilter] = useState("all");
  const [search, setSearch] = useState("");

  const filtered = internships.filter((i) => {
    const matchesCat = filter === "all" || i.category === filter;
    const matchesSearch =
      i.company.toLowerCase().includes(search.toLowerCase()) ||
      i.role.toLowerCase().includes(search.toLowerCase()) ||
      i.skills.some((s) => s.toLowerCase().includes(search.toLowerCase()));
    return matchesCat && matchesSearch;
  });

  return (
    <div className="min-h-screen bg-[#f5f0e8] noise-bg grid-bg">
      <Navbar />

      <main className="max-w-7xl mx-auto px-6 pt-28 pb-16">
        {/* Header */}
        <div className="mb-10">
          <h1 className="text-4xl font-bold text-[#1a1a1a] mb-2">
            Upcoming <span className="text-[#16a34a]">Internships</span>
          </h1>
          <p className="text-[#6b6b6b] text-sm max-w-xl">
            Curated list of the best upcoming internship opportunities. Apply
            early, practice with PeakPrep, and land your dream role.
          </p>
        </div>

        {/* Filters + Search */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-8">
          <div className="flex gap-2 flex-wrap">
            {categories.map((cat) => (
              <button
                key={cat.key}
                onClick={() => setFilter(cat.key)}
                className={`px-4 py-2 rounded-lg text-xs font-bold border transition-all ${
                  filter === cat.key
                    ? "bg-[#16a34a] text-white border-[#16a34a]"
                    : "bg-white text-[#6b6b6b] border-[#1a1a1a]/10 hover:border-[#16a34a]/40"
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>
          <div className="relative w-full md:w-72">
            <svg
              className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#999]"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
            <input
              type="text"
              placeholder="Search company, role, skill..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-white border border-[#1a1a1a]/10 rounded-lg text-sm text-[#1a1a1a] placeholder:text-[#999] focus:outline-none focus:border-[#16a34a]/50 transition"
            />
          </div>
        </div>

        {/* Count */}
        <p className="text-xs text-[#999] mb-4 font-mono">
          {filtered.length} internship{filtered.length !== 1 ? "s" : ""} found
        </p>

        {/* Internship Cards */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filtered.map((intern) => {
            const daysLeft = getDaysLeft(intern.deadline);
            const isUrgent = daysLeft <= 14;

            return (
              <div
                key={intern.id}
                className="bg-white rounded-2xl border border-[#1a1a1a]/8 p-6 flex flex-col justify-between hover:shadow-lg hover:border-[#16a34a]/20 transition-all duration-300 group"
              >
                {/* Top */}
                <div>
                  {/* Company Header */}
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-11 h-11 rounded-xl border border-[#e5e5e5] bg-[#fafafa] flex items-center justify-center shrink-0 overflow-hidden">
                        <img
                          src={getCompanyLogo(intern.company)}
                          alt={intern.company}
                          className="w-6 h-6 object-contain"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = `https://ui-avatars.com/api/?name=${intern.company}&background=16a34a&color=fff&rounded=true&bold=true&size=48`;
                          }}
                        />
                      </div>
                      <div>
                        <h3 className="font-bold text-[#1a1a1a] text-sm leading-tight">
                          {intern.company}
                        </h3>
                        <p className="text-[10px] text-[#999] uppercase tracking-wider">
                          {intern.type} · {intern.openings} openings
                        </p>
                      </div>
                    </div>
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        isUrgent
                          ? "bg-red-50 text-red-500 border border-red-200"
                          : "bg-[#16a34a]/10 text-[#16a34a] border border-[#16a34a]/20"
                      }`}
                    >
                      {isUrgent
                        ? `${daysLeft}d left!`
                        : `${daysLeft} days left`}
                    </span>
                  </div>

                  {/* Role */}
                  <h4 className="font-semibold text-[#1a1a1a] text-[15px] mb-3 leading-snug">
                    {intern.role}
                  </h4>

                  {/* Details Grid */}
                  <div className="grid grid-cols-2 gap-y-2 gap-x-4 mb-4">
                    <div className="flex items-center gap-1.5">
                      <svg className="w-3.5 h-3.5 text-[#999]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                      <span className="text-xs text-[#6b6b6b]">{intern.location}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <svg className="w-3.5 h-3.5 text-[#999]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <span className="text-xs text-[#6b6b6b]">{intern.stipend}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <svg className="w-3.5 h-3.5 text-[#999]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <span className="text-xs text-[#6b6b6b]">{intern.duration}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <svg className="w-3.5 h-3.5 text-[#999]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      <span className="text-xs text-[#6b6b6b]">
                        Deadline: {new Date(intern.deadline).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}
                      </span>
                    </div>
                  </div>

                  {/* Skills */}
                  <div className="flex flex-wrap gap-1.5 mb-5">
                    {intern.skills.map((skill) => (
                      <span
                        key={skill}
                        className="px-2.5 py-1 bg-[#f5f0e8] text-[#6b6b6b] text-[10px] font-bold rounded-md border border-[#1a1a1a]/5"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>

                {/* CTA */}
                <a
                  href={intern.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full flex items-center justify-center gap-2 py-3 bg-[#1a1a1a] text-white text-xs font-bold rounded-xl hover:bg-[#16a34a] transition-colors duration-300 group-hover:bg-[#16a34a]"
                >
                  Apply Now
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                  </svg>
                </a>
              </div>
            );
          })}
        </div>

        {/* Empty State */}
        {filtered.length === 0 && (
          <div className="text-center py-20">
            <p className="text-5xl mb-4">🔍</p>
            <h3 className="text-lg font-bold text-[#1a1a1a] mb-2">No internships found</h3>
            <p className="text-sm text-[#999]">
              Try changing the filter or searching with different keywords.
            </p>
          </div>
        )}

        {/* Bottom CTA */}
        <div className="mt-16 bg-white rounded-2xl border border-[#1a1a1a]/8 p-8 text-center">
          <h3 className="text-xl font-bold text-[#1a1a1a] mb-2">
            Not ready yet? <span className="text-[#16a34a]">Practice first.</span>
          </h3>
          <p className="text-sm text-[#6b6b6b] mb-6 max-w-md mx-auto">
            Take a mock interview on PeakPrep before applying. Our AI will tell you exactly what to improve.
          </p>
          <a
            href="/setup"
            className="inline-flex items-center gap-2 px-8 py-3 bg-[#16a34a] text-white text-sm font-bold rounded-xl hover:bg-[#15803d] transition-colors"
          >
            Start Mock Interview
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
            </svg>
          </a>
        </div>
      </main>
    </div>
  );
}
