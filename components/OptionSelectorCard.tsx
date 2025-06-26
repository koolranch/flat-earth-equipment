"use client";
import { useState } from "react";
import Image from "next/image";
import { ChargerModule } from "../constants/chargerOptions";
import AddToCartButton from "./AddToCartButton";
import InfoTooltip from "./InfoTooltip";

const CORE_DEPOSIT = 35000; // cents ($350)

function formatUsd(cents: number) {
  return `$${(cents / 100).toLocaleString(undefined, { minimumFractionDigits: 0 })}`;
}

type Locale = 'en' | 'es';

export default function OptionSelectorCard({ module, locale = 'en' }: { module: ChargerModule; locale?: Locale }) {
  const [choice, setChoice] = useState<"Reman Exchange" | "Repair & Return">("Repair & Return");
  const offer = module.offers.find((o) => o.label === choice)!;
  const image = choice === "Repair & Return" ? module.imgRepair : module.imgExchange;
  const [fw, setFw] = useState("");

  const t = {
    en: {
      chooseOption: "Choose option",
      buyShipToday: "Buy & Ship Today →",
      startRepairOrder: "Start Repair Order →", 
      coreRefundTitle: "How the core refund works",
      coreRefundDesc: "We pre-charge a refundable $350 deposit. Ship your old module back within 30 days using the prepaid label. Refund issued within 48 hours of arrival."
    },
    es: {
      chooseOption: "Elegir opción",
      buyShipToday: "Comprar y Enviar Hoy →",
      startRepairOrder: "Iniciar Orden de Reparación →",
      coreRefundTitle: "Cómo funciona el reembolso del núcleo",
      coreRefundDesc: "Cobramos por adelantado un depósito reembolsable de $350. Envíe su módulo usado de vuelta dentro de 30 días usando la etiqueta prepagada. Reembolso emitido dentro de 48 horas de llegada."
    }
  }[locale];

  return (
    <div className="flex flex-col rounded-2xl bg-white shadow-lg p-6 gap-6">
      <Image
        src={image}
        alt={module.title}
        width={400}
        height={480}
        className="rounded-lg object-contain mx-auto"
        priority
      />

      {/* Brand + Part Number Line */}
      <div className="text-center space-y-1">
        <p className="text-sm text-gray-500 font-medium">
          {module.brand} • {module.partNumber}
        </p>
      </div>

      {/* Radio selector */}
      <fieldset className="space-y-3">
        <legend className="sr-only">{t.chooseOption}</legend>
        {module.offers.map((o) => (
          <label
            key={o.label}
            className={`flex items-start gap-3 p-3 rounded-lg border ${
              choice === o.label ? "border-canyon-rust bg-orange-50" : "border-gray-300"
            } cursor-pointer`}
          >
            <input
              type="radio"
              value={o.label}
              checked={choice === o.label}
              onChange={() => setChoice(o.label as any)}
              className="mt-1 h-4 w-4 text-canyon-rust"
            />
            <div className="flex-1">
              <p className="font-semibold">
                {o.label} – ${(o.price / 100).toFixed(2).replace('.00', '')}
                {o.coreInfo && (
                  <span className="text-sm font-normal text-gray-500"> {o.coreInfo}</span>
                )}
                <span className="text-sm font-normal text-green-600"> + FREE SHIPPING</span>
              </p>
              <p className="text-sm text-gray-600">{o.desc}</p>
              {/** ★ Core-deposit math */}
              {o.label === "Reman Exchange" && (
                <p className="text-xs text-primary-700 font-medium">
                  Net cost after core refund&nbsp;=&nbsp;
                  {formatUsd(o.price)}
                </p>
              )}
            </div>
          </label>
        ))}
      </fieldset>

      {/* Firmware field with InfoTooltip */}
      <div className="flex flex-col gap-2">
        <label
          htmlFor={`fw-${module.id}`}
          className="text-sm font-medium flex items-center gap-1"
        >
          Firmware / Version
          <InfoTooltip content="Unsure? Leave blank—our team will confirm by email before shipping." />
          <span className="text-gray-400">(optional)</span>
        </label>
        <input
          id={`fw-${module.id}`}
          value={fw}
          onChange={(e) => setFw(e.target.value)}
          placeholder="e.g. v2.12"
          className="rounded-lg border border-gray-300 p-2"
        />
      </div>

      {/* ★ Compare accordion */}
      <details className="rounded-md bg-neutral-50 p-4 text-sm">
        <summary className="cursor-pointer font-medium">Compare options</summary>
        <table className="mt-3 w-full text-xs">
          <thead>
            <tr className="[&>th]:text-left [&>th]:py-1">
              <th></th><th>Reman Exchange</th><th>Repair & Return</th>
            </tr>
          </thead>
          <tbody className="[&>tr>*]:py-1">
            <tr><td>Up-front&nbsp;cost</td><td>{formatUsd(74900)}</td><td>{formatUsd(60000)}</td></tr>
            <tr><td>Core&nbsp;deposit</td><td>{formatUsd(CORE_DEPOSIT)} (refunded)</td><td>None</td></tr>
            <tr><td>Ship out</td><td>Today (order ≤ 3 PM&nbsp;EST)</td><td>After we refurbish</td></tr>
            <tr><td>Total&nbsp;turn-around</td><td>1-3 days (ground)</td><td>3-5 business days</td></tr>
          </tbody>
        </table>
      </details>

      <AddToCartButton
        sku={offer.sku}
        qty={1}
        price={offer.price}
        meta={{ firmwareVersion: fw || "to-collect", moduleId: module.id, offer: choice }}
        className="w-full bg-canyon-rust py-3 rounded-lg text-white font-semibold hover:bg-canyon-rust/90"
      >
        {choice === "Reman Exchange" ? t.buyShipToday : t.startRepairOrder}
      </AddToCartButton>

      {offer.coreInfo && (
        <details className="rounded-md bg-neutral-50 p-4 text-sm">
          <summary className="cursor-pointer font-medium">{t.coreRefundTitle}</summary>
          <p className="mt-2">
            {t.coreRefundDesc}
          </p>
        </details>
      )}
    </div>
  );
} 