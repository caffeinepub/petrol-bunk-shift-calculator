import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import {
  Banknote,
  CheckCircle2,
  ChevronRight,
  Droplets,
  Flame,
  Fuel,
  RotateCcw,
  TrendingDown,
  TrendingUp,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useCallback, useState } from "react";

// ─── Types ───────────────────────────────────────────────────────────────────
interface FuelState {
  openPetrol: string;
  closePetrol: string;
  pricePetrol: string;
  openDiesel: string;
  closeDiesel: string;
  priceDiesel: string;
  discountDiesel: string;
}

interface OilState {
  openOil: string;
  extraChecked: boolean;
  extraOil: string;
  closeOil: string;
  priceOil: string;
}

interface CashState {
  counts: Record<number, string>;
  paytm: string;
  gpay: string;
  hppay: string;
  card: string;
  credit: string;
}

const DENOMS = [1, 2, 5, 10, 20, 50, 100, 200, 500] as const;

const initialFuel: FuelState = {
  openPetrol: "",
  closePetrol: "",
  pricePetrol: "",
  openDiesel: "",
  closeDiesel: "",
  priceDiesel: "",
  discountDiesel: "",
};
const initialOil: OilState = {
  openOil: "",
  extraChecked: false,
  extraOil: "",
  closeOil: "",
  priceOil: "",
};
const initialCash: CashState = {
  counts: Object.fromEntries(DENOMS.map((d) => [d, ""])),
  paytm: "",
  gpay: "",
  hppay: "",
  card: "",
  credit: "",
};

// ─── Helpers ─────────────────────────────────────────────────────────────────
const p = (v: string) => Number.parseFloat(v) || 0;
const fmt = (n: number) =>
  `₹${n.toLocaleString("en-IN", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
const fmtL = (n: number) =>
  `${n.toLocaleString("en-IN", {
    minimumFractionDigits: 3,
    maximumFractionDigits: 3,
  })} L`;

// ─── Sub-components ──────────────────────────────────────────────────────────
function SectionCard({
  icon,
  title,
  children,
}: { icon: React.ReactNode; title: string; children: React.ReactNode }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      className="rounded-xl border border-border bg-card shadow-lg overflow-hidden"
    >
      <div className="flex items-center gap-2.5 px-5 py-4 border-b border-border bg-muted/30">
        <div className="flex items-center justify-center w-7 h-7 rounded-md bg-accent/15 text-accent">
          {icon}
        </div>
        <span className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
          {title}
        </span>
      </div>
      <div className="p-5">{children}</div>
    </motion.div>
  );
}

function FieldInput({
  label,
  value,
  onChange,
  placeholder,
  prefix,
  id,
  labelExtra,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  prefix?: string;
  id?: string;
  labelExtra?: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-1">
      <label
        htmlFor={id}
        className="text-xs text-muted-foreground font-medium tracking-wide flex items-center gap-1.5"
      >
        {label}
        {labelExtra}
      </label>
      <div className="relative">
        {prefix && (
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm pointer-events-none">
            {prefix}
          </span>
        )}
        <input
          id={id}
          type="number"
          step="any"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder ?? "0.000"}
          className={`w-full h-9 rounded-lg border border-border bg-input text-foreground text-sm focus:outline-none focus:ring-1 focus:ring-ring transition-all placeholder:text-muted-foreground/50 ${prefix ? "pl-7 pr-3" : "px-3"}`}
        />
      </div>
    </div>
  );
}

function LiveBadge({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between px-3 py-2 rounded-lg bg-muted/40 border border-border/60">
      <span className="text-xs text-muted-foreground">{label}</span>
      <span className="text-sm font-semibold text-foreground">{value}</span>
    </div>
  );
}

function SummaryGroupLabel({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/60 mt-1">
      {children}
    </p>
  );
}

function SummaryRow({
  label,
  value,
  amber,
  large,
}: {
  label: string;
  value: string;
  amber?: boolean;
  large?: boolean;
}) {
  return (
    <div className="flex justify-between items-center">
      <span
        className={`text-sm ${amber ? "text-amber-400/80" : "text-muted-foreground"}`}
      >
        {label}
      </span>
      <span
        className={`font-semibold ${
          large
            ? "text-xl text-foreground"
            : amber
              ? "text-sm text-amber-400/80"
              : "text-sm text-foreground"
        }`}
      >
        {value}
      </span>
    </div>
  );
}

// ─── Main App ─────────────────────────────────────────────────────────────────
export default function App() {
  const [fuel, setFuel] = useState<FuelState>(initialFuel);
  const [oil, setOil] = useState<OilState>(initialOil);
  const [cash, setCash] = useState<CashState>(initialCash);

  // Fuel calcs — meters are cumulative, so closing > opening
  const petrolSold = p(fuel.closePetrol) - p(fuel.openPetrol);
  const petrolRev = petrolSold * p(fuel.pricePetrol);
  const dieselSold = p(fuel.closeDiesel) - p(fuel.openDiesel);
  const dieselDiscount = p(fuel.discountDiesel);
  const dieselRev = dieselSold * p(fuel.priceDiesel) - dieselDiscount;

  // Oil calcs
  const oilSold =
    p(oil.openOil) + (oil.extraChecked ? p(oil.extraOil) : 0) - p(oil.closeOil);
  const oilUnits = (oilSold * 1000) / 25;
  const oilRev = oilUnits * p(oil.priceOil);
  const oilRemaining = p(oil.closeOil);

  // Totals
  const totalExpected = petrolRev + dieselRev + oilRev;
  const totalCash = DENOMS.reduce((s, d) => s + d * p(cash.counts[d] ?? ""), 0);
  // Credit is NOT counted in totalCollected (pays later)
  const totalCollected =
    totalCash + p(cash.paytm) + p(cash.gpay) + p(cash.hppay) + p(cash.card);
  const diff = totalCollected - totalExpected;
  const creditAmount = p(cash.credit);

  const setFuelField = useCallback((field: keyof FuelState, val: string) => {
    setFuel((prev) => ({ ...prev, [field]: val }));
  }, []);

  const setOilField = useCallback(
    <K extends keyof OilState>(field: K, val: OilState[K]) => {
      setOil((prev) => ({ ...prev, [field]: val }));
    },
    [],
  );

  const handleReset = () => {
    setFuel(initialFuel);
    setOil(initialOil);
    setCash(initialCash);
  };

  return (
    <div className="min-h-screen flex flex-col">
      {/* Nav */}
      <header className="sticky top-0 z-50 border-b border-border/50 bg-background/80 backdrop-blur-md">
        <div className="max-w-6xl mx-auto px-4 h-14 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-accent/15 text-accent">
              <Flame className="w-4 h-4" />
            </div>
            <span className="font-bold text-foreground tracking-tight text-lg">
              FuelFlow
            </span>
          </div>
          <nav className="hidden sm:flex items-center gap-6">
            <span className="text-sm text-muted-foreground hover:text-foreground cursor-pointer transition-colors">
              Shifts
            </span>
            <span className="text-sm text-muted-foreground hover:text-foreground cursor-pointer transition-colors">
              Calculators
            </span>
            <span className="text-sm text-muted-foreground hover:text-foreground cursor-pointer transition-colors">
              Help
            </span>
          </nav>
        </div>
      </header>

      {/* Hero */}
      <div className="relative overflow-hidden border-b border-border/30">
        <div className="absolute inset-0 bg-gradient-to-br from-accent/8 via-transparent to-transparent pointer-events-none" />
        <div className="max-w-6xl mx-auto px-4 py-10 sm:py-14">
          <p className="text-xs font-bold uppercase tracking-widest text-accent mb-3">
            Petrol Bunk Shift Calculator
          </p>
          <h1 className="text-3xl sm:text-4xl font-bold text-foreground leading-tight mb-3">
            Calculate Your Shift
            <br />
            <span className="text-muted-foreground font-normal">
              in seconds.
            </span>
          </h1>
          <p className="text-muted-foreground text-sm max-w-md mb-6">
            Enter your opening and closing meter readings, oil quantities, and
            cash collection to instantly know if you're short, surplus, or
            spot-on.
          </p>
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <ChevronRight className="w-3 h-3 text-accent" />
            <span>All calculations happen locally — no data is stored</span>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="flex-1 max-w-6xl mx-auto w-full px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left column: inputs */}
          <div className="lg:col-span-2 flex flex-col gap-6">
            {/* Section 1: Fuel */}
            <SectionCard
              icon={<Fuel className="w-4 h-4" />}
              title="Fuel Readings"
            >
              <div className="space-y-5">
                {/* Petrol */}
                <div>
                  <p className="text-xs font-bold uppercase tracking-widest text-accent mb-3">
                    Petrol
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-3">
                    <FieldInput
                      id="open-petrol"
                      label="Opening (L)"
                      value={fuel.openPetrol}
                      onChange={(v) => setFuelField("openPetrol", v)}
                      placeholder="182225.440"
                    />
                    <FieldInput
                      id="close-petrol"
                      label="Closing (L)"
                      value={fuel.closePetrol}
                      onChange={(v) => setFuelField("closePetrol", v)}
                      placeholder="182100.000"
                    />
                    <FieldInput
                      id="price-petrol"
                      label="Price per Litre"
                      value={fuel.pricePetrol}
                      onChange={(v) => setFuelField("pricePetrol", v)}
                      prefix="₹"
                      placeholder="106.00"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <LiveBadge label="Petrol Sold" value={fmtL(petrolSold)} />
                    <LiveBadge label="Petrol Revenue" value={fmt(petrolRev)} />
                  </div>
                </div>

                <div className="h-px bg-border/50" />

                {/* Diesel */}
                <div>
                  <p className="text-xs font-bold uppercase tracking-widest text-accent mb-3">
                    Diesel
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 mb-3">
                    <FieldInput
                      id="open-diesel"
                      label="Opening (L)"
                      value={fuel.openDiesel}
                      onChange={(v) => setFuelField("openDiesel", v)}
                      placeholder="201668.040"
                    />
                    <FieldInput
                      id="close-diesel"
                      label="Closing (L)"
                      value={fuel.closeDiesel}
                      onChange={(v) => setFuelField("closeDiesel", v)}
                      placeholder="201550.000"
                    />
                    <FieldInput
                      id="price-diesel"
                      label="Price per Litre"
                      value={fuel.priceDiesel}
                      onChange={(v) => setFuelField("priceDiesel", v)}
                      prefix="₹"
                      placeholder="94.00"
                    />
                    <FieldInput
                      id="discount-diesel"
                      label="Discount Given (₹)"
                      value={fuel.discountDiesel}
                      onChange={(v) => setFuelField("discountDiesel", v)}
                      prefix="₹"
                      placeholder="0.00"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <LiveBadge label="Diesel Sold" value={fmtL(dieselSold)} />
                    <LiveBadge label="Diesel Revenue" value={fmt(dieselRev)} />
                  </div>
                </div>
              </div>
            </SectionCard>

            {/* Section 2: Oil */}
            <SectionCard
              icon={<Droplets className="w-4 h-4" />}
              title="Oil Quantity"
            >
              <div className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <FieldInput
                    id="open-oil"
                    label="Opening Oil (L)"
                    value={oil.openOil}
                    onChange={(v) => setOilField("openOil", v)}
                    placeholder="10.000"
                  />
                  <FieldInput
                    id="price-oil"
                    label="Price per 25ml"
                    value={oil.priceOil}
                    onChange={(v) => setOilField("priceOil", v)}
                    prefix="₹"
                    placeholder="10.00"
                  />
                </div>

                {/* Extra oil checkbox */}
                <div className="flex items-center gap-3 px-3 py-2.5 rounded-lg border border-border/60 bg-muted/20">
                  <Checkbox
                    id="extra-oil-check"
                    checked={oil.extraChecked}
                    onCheckedChange={(checked) =>
                      setOilField("extraChecked", !!checked)
                    }
                    data-ocid="oil.checkbox"
                    className="border-border data-[state=checked]:bg-accent data-[state=checked]:border-accent"
                  />
                  <Label
                    htmlFor="extra-oil-check"
                    className="text-sm text-foreground cursor-pointer"
                  >
                    Took extra oil from inventory?
                  </Label>
                </div>

                <AnimatePresence>
                  {oil.extraChecked && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.2 }}
                      className="overflow-hidden"
                    >
                      <FieldInput
                        id="extra-oil"
                        label="Extra Oil Taken (L)"
                        value={oil.extraOil}
                        onChange={(v) => setOilField("extraOil", v)}
                        placeholder="2.000"
                      />
                    </motion.div>
                  )}
                </AnimatePresence>

                <FieldInput
                  id="close-oil"
                  label="Closing Oil (L)"
                  value={oil.closeOil}
                  onChange={(v) => setOilField("closeOil", v)}
                  placeholder="8.500"
                />

                <div className="grid grid-cols-2 gap-2">
                  <LiveBadge label="Oil Sold" value={fmtL(oilSold)} />
                  <LiveBadge label="Units (25ml)" value={oilUnits.toFixed(0)} />
                  <LiveBadge label="Oil Revenue" value={fmt(oilRev)} />
                  <LiveBadge label="Oil Remaining" value={fmtL(oilRemaining)} />
                </div>
              </div>
            </SectionCard>

            {/* Section 3: Cash Collection */}
            <SectionCard
              icon={<Banknote className="w-4 h-4" />}
              title="Cash Collection"
            >
              <div className="space-y-4">
                {/* Denomination inputs */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {DENOMS.map((denom) => {
                    const count = cash.counts[denom] ?? "";
                    const sub = denom * p(count);
                    return (
                      <div key={denom} className="flex items-center gap-3">
                        <div className="flex items-center justify-center min-w-[52px] h-9 rounded-lg bg-accent/10 border border-accent/20 text-accent text-sm font-bold">
                          ₹{denom}
                        </div>
                        <input
                          type="number"
                          min="0"
                          step="1"
                          value={count}
                          onChange={(e) =>
                            setCash((prev) => ({
                              ...prev,
                              counts: {
                                ...prev.counts,
                                [denom]: e.target.value,
                              },
                            }))
                          }
                          placeholder="0"
                          className="flex-1 h-9 rounded-lg border border-border bg-input text-foreground text-sm px-3 focus:outline-none focus:ring-1 focus:ring-ring transition-all placeholder:text-muted-foreground/50"
                          data-ocid={`cash.input.${DENOMS.indexOf(denom) + 1}`}
                        />
                        <div className="min-w-[80px] text-right text-sm font-semibold text-foreground">
                          {fmt(sub)}
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Total cash from denominations */}
                <div className="flex items-center justify-between px-3 py-2 rounded-lg bg-muted/40 border border-border/60">
                  <span className="text-xs text-muted-foreground">
                    Total Cash (Notes)
                  </span>
                  <span className="text-sm font-semibold text-foreground">
                    {fmt(totalCash)}
                  </span>
                </div>

                <div className="h-px bg-border/50" />

                {/* I'll Receive Cash On */}
                <div>
                  <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-3">
                    I'll Receive Cash On
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <FieldInput
                      id="paytm"
                      label="PayTM"
                      value={cash.paytm}
                      onChange={(v) =>
                        setCash((prev) => ({ ...prev, paytm: v }))
                      }
                      prefix="₹"
                      placeholder="0.00"
                    />
                    <FieldInput
                      id="gpay"
                      label="GPay"
                      value={cash.gpay}
                      onChange={(v) =>
                        setCash((prev) => ({ ...prev, gpay: v }))
                      }
                      prefix="₹"
                      placeholder="0.00"
                    />
                    <FieldInput
                      id="hppay"
                      label="HPPAY"
                      value={cash.hppay}
                      onChange={(v) =>
                        setCash((prev) => ({ ...prev, hppay: v }))
                      }
                      prefix="₹"
                      placeholder="0.00"
                    />
                    <FieldInput
                      id="card"
                      label="Card"
                      value={cash.card}
                      onChange={(v) =>
                        setCash((prev) => ({ ...prev, card: v }))
                      }
                      prefix="₹"
                      placeholder="0.00"
                    />
                    <FieldInput
                      id="credit"
                      label="Credit"
                      labelExtra={
                        <span className="text-[10px] text-amber-400/80 font-normal">
                          (pays later)
                        </span>
                      }
                      value={cash.credit}
                      onChange={(v) =>
                        setCash((prev) => ({ ...prev, credit: v }))
                      }
                      prefix="₹"
                      placeholder="0.00"
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between px-4 py-3 rounded-xl border border-accent/30 bg-accent/5">
                  <span className="text-sm font-medium text-muted-foreground">
                    Total Collected
                  </span>
                  <span className="text-lg font-bold text-accent">
                    {fmt(totalCollected)}
                  </span>
                </div>
              </div>
            </SectionCard>
          </div>

          {/* Right column: summary + result */}
          <div className="flex flex-col gap-6">
            <div className="lg:sticky lg:top-[4.5rem]">
              <SectionCard
                icon={<Fuel className="w-4 h-4" />}
                title="Shift Summary"
              >
                <div className="space-y-2">
                  {/* PETROL TOTAL */}
                  <SummaryGroupLabel>Petrol Total</SummaryGroupLabel>
                  <SummaryRow label="Litres Sold" value={fmtL(petrolSold)} />
                  <SummaryRow label="Total Revenue" value={fmt(petrolRev)} />

                  <div className="h-px bg-border/60 my-1" />

                  {/* DIESEL TOTAL */}
                  <SummaryGroupLabel>Diesel Total</SummaryGroupLabel>
                  <SummaryRow label="Litres Sold" value={fmtL(dieselSold)} />
                  <SummaryRow label="Total Revenue" value={fmt(dieselRev)} />
                  {dieselDiscount > 0 && (
                    <SummaryRow
                      label="Discount Given"
                      value={`-${fmt(dieselDiscount)}`}
                      amber
                    />
                  )}

                  <div className="h-px bg-border/60 my-1" />

                  {/* OIL */}
                  <SummaryGroupLabel>Oil</SummaryGroupLabel>
                  <SummaryRow label="Total Oil Sold" value={fmtL(oilSold)} />
                  <SummaryRow label="Total Oil Revenue" value={fmt(oilRev)} />
                  <SummaryRow
                    label="Total Oil Left"
                    value={fmtL(oilRemaining)}
                  />

                  <div className="h-px bg-border/60 my-1" />

                  {/* TOTAL EXPECTED */}
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-bold text-foreground">
                      Total Expected
                    </span>
                    <span className="text-xl font-bold text-foreground">
                      {fmt(totalExpected)}
                    </span>
                  </div>

                  <div className="h-px bg-border/60 my-1" />

                  {/* TOTAL COLLECTED */}
                  <SummaryRow
                    label="Total Collected"
                    value={fmt(totalCollected)}
                  />
                  {creditAmount > 0 && (
                    <SummaryRow
                      label="Credit (Pending)"
                      value={fmt(creditAmount)}
                      amber
                    />
                  )}

                  {/* Result */}
                  <AnimatePresence mode="wait">
                    {diff === 0 && totalCollected > 0 ? (
                      <motion.div
                        key="correct"
                        initial={{ opacity: 0, scale: 0.96 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.96 }}
                        className="flex items-center gap-2 p-3 rounded-xl border border-[oklch(0.55_0.18_200)] bg-[oklch(0.22_0.06_200)]"
                        data-ocid="result.success_state"
                      >
                        <CheckCircle2 className="w-5 h-5 text-[oklch(0.70_0.18_200)] shrink-0" />
                        <div>
                          <p className="text-xs text-[oklch(0.70_0.18_200)] font-bold uppercase tracking-wide">
                            Correct Amount
                          </p>
                          <p className="text-lg font-bold text-[oklch(0.85_0.12_200)]">
                            ✓ Balanced
                          </p>
                        </div>
                      </motion.div>
                    ) : diff > 0 && totalCollected > 0 ? (
                      <motion.div
                        key="surplus"
                        initial={{ opacity: 0, scale: 0.96 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.96 }}
                        className="flex items-center gap-2 p-3 rounded-xl border border-[oklch(0.45_0.14_155)] bg-[oklch(0.22_0.06_155)]"
                        data-ocid="result.success_state"
                      >
                        <TrendingUp className="w-5 h-5 text-[oklch(0.71_0.18_155)] shrink-0" />
                        <div>
                          <p className="text-xs text-[oklch(0.65_0.18_155)] font-bold uppercase tracking-wide">
                            Surplus
                          </p>
                          <p className="text-lg font-bold text-[oklch(0.85_0.15_155)]">
                            {fmt(diff)}
                          </p>
                        </div>
                      </motion.div>
                    ) : diff < 0 && totalCollected > 0 ? (
                      <motion.div
                        key="shortage"
                        initial={{ opacity: 0, scale: 0.96 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.96 }}
                        className="flex items-center gap-2 p-3 rounded-xl border border-[oklch(0.40_0.14_22)] bg-[oklch(0.20_0.06_22)]"
                        data-ocid="result.error_state"
                      >
                        <TrendingDown className="w-5 h-5 text-[oklch(0.62_0.20_22)] shrink-0" />
                        <div>
                          <p className="text-xs text-[oklch(0.62_0.20_22)] font-bold uppercase tracking-wide">
                            Shortage
                          </p>
                          <p className="text-lg font-bold text-[oklch(0.80_0.18_22)]">
                            {fmt(Math.abs(diff))}
                          </p>
                        </div>
                      </motion.div>
                    ) : (
                      <motion.div
                        key="idle"
                        className="flex items-center justify-center p-3 rounded-xl border border-border/40 bg-muted/20"
                        data-ocid="result.loading_state"
                      >
                        <p className="text-xs text-muted-foreground">
                          Enter values to see result
                        </p>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleReset}
                    className="w-full mt-1 border-border text-muted-foreground hover:text-foreground hover:border-foreground/30 gap-2"
                    data-ocid="app.delete_button"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    Reset All
                  </Button>
                </div>
              </SectionCard>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-border/30 py-5 mt-8">
        <div className="max-w-6xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <div className="flex items-center gap-2 text-muted-foreground text-sm">
            <Flame className="w-3.5 h-3.5 text-accent" />
            <span>FuelFlow — Petrol Bunk Shift Calculator</span>
          </div>
          <p className="text-xs text-muted-foreground">
            © {new Date().getFullYear()}. Built with ♥ using{" "}
            <a
              href={`https://caffeine.ai?utm_source=caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(window.location.hostname)}`}
              target="_blank"
              rel="noreferrer"
              className="hover:text-foreground transition-colors"
            >
              caffeine.ai
            </a>
          </p>
        </div>
      </footer>
    </div>
  );
}
