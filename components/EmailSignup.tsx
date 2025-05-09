"use client";

import { useState } from "react";

export default function EmailSignup() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("loading");

    try {
      const response = await fetch("https://formspree.io/f/mrbqkjke", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ 
          email,
          _subject: 'New Fleet Signup'
        }),
      });

      if (response.ok) {
        setStatus("success");
        setEmail("");
      } else {
        setStatus("error");
      }
    } catch (error) {
      setStatus("error");
    }
  };

  return (
    <section className="bg-canyon-rust py-10 text-white text-center">
      <div className="max-w-xl mx-auto px-4">
        <h2 className="text-2xl font-semibold mb-3">
          Join the Flat Earth Fleet — Get Insider Access & Priority Service
        </h2>
        <p className="mb-5">
          Sign up to receive special access to bulk pricing, rental availability, and fleet-focused support from the Flat Earth Equipment crew.
        </p>
        <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Enter your email"
            required
            className="px-4 py-2 rounded-md text-black w-full sm:w-auto"
          />
          <button
            type="submit"
            disabled={status === "loading"}
            className="bg-white text-canyon-rust px-6 py-2 rounded-md font-semibold hover:bg-slate-100 transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {status === "loading" ? "Joining..." : "Join the Fleet"}
          </button>
        </form>
        {status === "success" && (
          <p className="mt-4 text-white/90">
            Thanks for joining! We'll be in touch with your fleet benefits.
          </p>
        )}
        {status === "error" && (
          <p className="mt-4 text-white/90">
            Something went wrong. Please try again.
          </p>
        )}
      </div>
    </section>
  );
} 