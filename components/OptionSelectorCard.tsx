"use client";
import { useState } from "react";
import Image from "next/image";
import { ChargerModule } from "@/constants/chargerOptions";
import AddToCartButton from "@/components/AddToCartButton";

export default function OptionSelectorCard({ module }: { module: ChargerModule }) {
  const [choice, setChoice] = useState<"Reman Exchange" | "Repair & Return">("Reman Exchange");
  const offer = module.offers.find((o) => o.label === choice)!;
  const image = choice === "Repair & Return" ? module.imgRepair : module.imgExchange;
  const [fw, setFw] = useState("");

  return (
    <div className="flex flex-col rounded-2xl bg-white shadow-lg p-6 gap-6">
      <Image
        src={image}
        alt={module.name}
        width={400}
        height={480}
        className="rounded-lg object-contain mx-auto"
        priority
      />

      {/* Radio selector */}
      <fieldset className="space-y-3">
        <legend className="sr-only">Choose option</legend>
        {module.offers.map((o) => (
          <label
            key={o.label}
            className={`flex items-start gap-3 p-3 rounded-lg border ${
              choice === o.label ? "border-primary-600 bg-neutral-50" : "border-gray-300"
            } cursor-pointer`}
          >
            <input
              type="radio"
              value={o.label}
              checked={choice === o.label}
              onChange={() => setChoice(o.label as any)}
              className="mt-1 h-4 w-4 text-primary-600"
            />
            <div>
              <p className="font-semibold">
                {o.label} – ${(o.price / 100).toFixed(0)}
                {o.coreInfo && (
                  <span className="text-sm font-normal text-gray-500"> {o.coreInfo}</span>
                )}
              </p>
              <p className="text-sm text-gray-600">{o.desc}</p>
            </div>
          </label>
        ))}
      </fieldset>

      {/* Firmware field */}
      <div className="flex flex-col gap-2">
        <label htmlFor={`fw-${module.id}`} className="text-sm font-medium">
          Firmware / Version <span className="text-gray-400">(optional)</span>
        </label>
        <input
          id={`fw-${module.id}`}
          value={fw}
          onChange={(e) => setFw(e.target.value)}
          placeholder="e.g. v2.12"
          className="rounded-lg border border-gray-300 p-2"
        />
      </div>

      <AddToCartButton
        sku={offer.sku}
        qty={1}
        meta={{ firmwareVersion: fw || "to-collect", moduleId: module.id, offer: choice }}
        className="w-full bg-primary-600 py-3 rounded-lg text-white font-semibold hover:bg-primary-700"
      >
        {choice === "Reman Exchange" ? "Buy & Ship Today →" : "Start Repair Order →"}
      </AddToCartButton>

      {offer.coreInfo && (
        <details className="rounded-md bg-neutral-50 p-4 text-sm">
          <summary className="cursor-pointer font-medium">How the core refund works</summary>
          <p className="mt-2">
            We pre-charge a refundable $350 deposit. Ship your old module back within 30 days using
            the prepaid label. Refund issued within 48 hours of arrival.
          </p>
        </details>
      )}
    </div>
  );
} 