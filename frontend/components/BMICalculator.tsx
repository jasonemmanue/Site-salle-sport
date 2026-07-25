"use client";

import { useState } from "react";

interface BMIResult {
  value: number;
  category: string;
  color: string;
  description: string;
}

function calculateBMI(weight: number, heightCm: number): BMIResult | null {
  if (weight <= 0 || heightCm <= 0) return null;

  const heightM = heightCm / 100;
  const bmi = weight / (heightM * heightM);

  if (bmi < 18.5) {
    return { value: bmi, category: "Sous-poids", color: "#3b82f6", description: "Un apport calorique plus important pourrait etre benefique." };
  } else if (bmi < 25) {
    return { value: bmi, category: "Normal", color: "#22c55e", description: "Votre poids est dans la plage ideale. Continuez ainsi !" };
  } else if (bmi < 30) {
    return { value: bmi, category: "Surpoids", color: "#f59e0b", description: "L'exercice regulier et une alimentation equilibree sont recommandes." };
  } else {
    return { value: bmi, category: "Obesite", color: "#ef4444", description: "Consultez un professionnel de sante pour un suivi personnalise." };
  }
}

export default function BMICalculator() {
  const [weight, setWeight] = useState("");
  const [height, setHeight] = useState("");
  const [result, setResult] = useState<BMIResult | null>(null);
  const [showResult, setShowResult] = useState(false);

  function handleCalculate() {
    const w = parseFloat(weight);
    const h = parseFloat(height);

    if (isNaN(w) || isNaN(h) || w <= 0 || h <= 0) return;

    const bmiResult = calculateBMI(w, h);
    setResult(bmiResult);
    setShowResult(false);
    // Trigger animation
    requestAnimationFrame(() => setShowResult(true));
  }

  function handleReset() {
    setWeight("");
    setHeight("");
    setResult(null);
    setShowResult(false);
  }

  // Gauge angle: BMI range 10-40 mapped to 0-180 degrees
  const gaugeAngle = result
    ? Math.min(180, Math.max(0, ((result.value - 10) / 30) * 180))
    : 0;

  return (
    <div className="rounded-2xl border border-dark-border bg-dark-card p-6 sm:p-8">
      {/* Header */}
      <div className="mb-6 text-center">
        <h3 className="text-2xl font-bold text-white">Calculateur IMC</h3>
        <p className="mt-1 text-sm text-dark-muted">
          Calculez votre Indice de Masse Corporelle
        </p>
      </div>

      {/* Inputs */}
      <div className="mb-6 grid grid-cols-2 gap-4">
        <div>
          <label className="mb-1 block text-sm font-medium text-white">
            Poids (kg)
          </label>
          <input
            type="number"
            value={weight}
            onChange={(e) => setWeight(e.target.value)}
            placeholder="75"
            min="20"
            max="300"
            className="w-full rounded-xl border border-dark-border bg-white/5 px-4 py-3 text-center text-lg font-semibold text-white placeholder-dark-muted outline-none transition-colors focus:border-primary focus:ring-1 focus:ring-primary"
          />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-white">
            Taille (cm)
          </label>
          <input
            type="number"
            value={height}
            onChange={(e) => setHeight(e.target.value)}
            placeholder="175"
            min="100"
            max="250"
            className="w-full rounded-xl border border-dark-border bg-white/5 px-4 py-3 text-center text-lg font-semibold text-white placeholder-dark-muted outline-none transition-colors focus:border-primary focus:ring-1 focus:ring-primary"
          />
        </div>
      </div>

      {/* Buttons */}
      <div className="mb-8 flex gap-3">
        <button
          onClick={handleCalculate}
          disabled={!weight || !height}
          className="flex-1 rounded-xl gradient-primary py-3 text-sm font-bold text-black transition-all hover:shadow-lg hover:shadow-primary/30 hover:scale-[1.02] disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:scale-100"
        >
          Calculer
        </button>
        {result && (
          <button
            onClick={handleReset}
            className="rounded-xl border border-dark-border px-4 py-3 text-sm font-medium text-dark-muted transition-colors hover:border-primary/40 hover:text-white"
          >
            Reinitialiser
          </button>
        )}
      </div>

      {/* Result */}
      {result && (
        <div
          className={`transition-all duration-500 ${
            showResult ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
          }`}
        >
          {/* Gauge */}
          <div className="relative mx-auto mb-6 h-32 w-56">
            <svg viewBox="0 0 200 110" className="w-full">
              {/* Background arc */}
              <path
                d="M 20 100 A 80 80 0 0 1 180 100"
                fill="none"
                stroke="#1a1a1a"
                strokeWidth="12"
                strokeLinecap="round"
              />
              {/* Color segments */}
              <path d="M 20 100 A 80 80 0 0 1 60 30" fill="none" stroke="#3b82f6" strokeWidth="12" strokeLinecap="round" opacity="0.4" />
              <path d="M 60 30 A 80 80 0 0 1 120 22" fill="none" stroke="#22c55e" strokeWidth="12" strokeLinecap="round" opacity="0.4" />
              <path d="M 120 22 A 80 80 0 0 1 160 50" fill="none" stroke="#f59e0b" strokeWidth="12" strokeLinecap="round" opacity="0.4" />
              <path d="M 160 50 A 80 80 0 0 1 180 100" fill="none" stroke="#ef4444" strokeWidth="12" strokeLinecap="round" opacity="0.4" />
              {/* Needle */}
              <line
                x1="100"
                y1="100"
                x2={100 + 65 * Math.cos((Math.PI * (180 - gaugeAngle)) / 180)}
                y2={100 - 65 * Math.sin((Math.PI * (180 - gaugeAngle)) / 180)}
                stroke={result.color}
                strokeWidth="3"
                strokeLinecap="round"
                className="transition-all duration-700"
              />
              {/* Center circle */}
              <circle cx="100" cy="100" r="6" fill={result.color} />
            </svg>
          </div>

          {/* BMI Value */}
          <div className="text-center">
            <p
              className="text-5xl font-black animate-count-up"
              style={{ color: result.color }}
            >
              {result.value.toFixed(1)}
            </p>
            <p
              className="mt-1 text-lg font-bold"
              style={{ color: result.color }}
            >
              {result.category}
            </p>
            <p className="mt-3 text-sm text-dark-muted max-w-xs mx-auto">
              {result.description}
            </p>
          </div>

          {/* Scale reference */}
          <div className="mt-6 grid grid-cols-4 gap-1 text-center text-xs">
            <div className="rounded-lg bg-blue-500/10 py-2 text-blue-400">
              <p className="font-semibold">&lt;18.5</p>
              <p>Sous-poids</p>
            </div>
            <div className="rounded-lg bg-green-500/10 py-2 text-green-400">
              <p className="font-semibold">18.5-24.9</p>
              <p>Normal</p>
            </div>
            <div className="rounded-lg bg-amber-500/10 py-2 text-amber-400">
              <p className="font-semibold">25-29.9</p>
              <p>Surpoids</p>
            </div>
            <div className="rounded-lg bg-red-500/10 py-2 text-red-400">
              <p className="font-semibold">&ge;30</p>
              <p>Obesite</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
