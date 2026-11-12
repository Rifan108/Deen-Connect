"use client"

import React, { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { DollarSign, ShieldAlert, CheckCircle, Scale, Coins, Info } from "lucide-react"

interface ZakatType {
  name: string
  rate: number
  description: string
  icon: string
}

const ZAKAT_TYPES: Record<string, ZakatType> = {
  gold: { name: "Gold & Precious Metals", rate: 0.025, description: "Jewelry (investment), bullion, coins", icon: "✨" },
  silver: { name: "Silver", rate: 0.025, description: "Silver bars, silverware, coins", icon: "🪙" },
  cash: { name: "Cash & Bank Savings", rate: 0.025, description: "Checking, savings accounts, foreign currency", icon: "💵" },
  business: { name: "Business Merchandise & Stock", rate: 0.025, description: "Goods for sale, inventory at wholesale value", icon: "📦" },
  property: { name: "Investment Property Rental Income", rate: 0.025, description: "Net accumulated rental returns (not personal home)", icon: "🏛️" },
  crops: { name: "Agricultural Harvest", rate: 0.05, description: "Irrigated produce (5%), naturally watered (10%)", icon: "🌾" },
}

export default function ZakatCalculator() {
  const [nisabValue, setNisabValue] = useState<number>(85) // 85 grams of gold standard
  const [goldPrice, setGoldPrice] = useState<number>(78) // Current global approximate price per gram
  const [itemAmounts, setItemAmounts] = useState<Record<string, number>>({
    gold: 0,
    silver: 0,
    cash: 0,
    business: 0,
    property: 0,
    crops: 0,
  })

  const handleItemChange = (item: string, value: number) => {
    setItemAmounts((prev) => ({ ...prev, [item]: Math.max(0, value) }))
  }

  const nisabThreshold = nisabValue * goldPrice

  const totalDeclaredWealth = Object.values(itemAmounts).reduce((a, b) => a + b, 0)

  const calculateZakat = (amount: number, rate: number) => {
    if (totalDeclaredWealth < nisabThreshold) return 0
    return amount * rate
  }

  const zakatDue = Object.entries(itemAmounts).reduce((total, [key, amount]) => {
    const rate = ZAKAT_TYPES[key]?.rate || 0.025
    return total + calculateZakat(amount, rate)
  }, 0)

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Editorial Overview Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 border-b border-border">
        <div>
          <span className="text-[11px] font-mono uppercase tracking-widest text-muted-foreground">
            Third Pillar of Islam • Zakat
          </span>
          <h2 className="text-3xl font-serif text-foreground font-normal mt-0.5">
            Zakat Obligation Calculator
          </h2>
          <p className="text-xs text-muted-foreground mt-1 max-w-xl">
            Purify your annual wealth by calculating 2.5% of qualifying assets exceeding the lunar year Nisab threshold.
          </p>
        </div>

        <div className="p-3.5 rounded-2xl bg-card border border-border flex items-center gap-3">
          <Scale className="w-5 h-5 text-[#C8A96B]" />
          <div>
            <p className="text-[10px] font-mono uppercase text-muted-foreground">Gold Nisab Threshold</p>
            <p className="text-sm font-mono font-bold text-foreground">
              ${nisabThreshold.toLocaleString("en-US", { minimumFractionDigits: 2 })}
            </p>
          </div>
        </div>
      </div>

      {/* Main Tabs Container */}
      <Card className="border-border bg-card/60 backdrop-blur-sm rounded-3xl overflow-hidden shadow-xs">
        <Tabs defaultValue="wealth" className="w-full">
          <div className="border-b border-border px-6 pt-4 bg-muted/30">
            <TabsList className="bg-transparent border-0 gap-2 p-0 h-10">
              <TabsTrigger
                value="wealth"
                className="rounded-t-xl rounded-b-none border-b-2 border-transparent data-[state=active]:border-[#123D32] dark:data-[state=active]:border-[#C8A96B] data-[state=active]:bg-card text-xs font-medium px-4"
              >
                1. Declare Wealth
              </TabsTrigger>
              <TabsTrigger
                value="result"
                className="rounded-t-xl rounded-b-none border-b-2 border-transparent data-[state=active]:border-[#123D32] dark:data-[state=active]:border-[#C8A96B] data-[state=active]:bg-card text-xs font-medium px-4"
              >
                2. Calculation & Summary
              </TabsTrigger>
              <TabsTrigger
                value="settings"
                className="rounded-t-xl rounded-b-none border-b-2 border-transparent data-[state=active]:border-[#123D32] dark:data-[state=active]:border-[#C8A96B] data-[state=active]:bg-card text-xs font-medium px-4"
              >
                3. Nisab Standards
              </TabsTrigger>
            </TabsList>
          </div>

          {/* TAB 1: WEALTH ITEMS */}
          <TabsContent value="wealth" className="p-6 sm:p-8 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {Object.entries(ZAKAT_TYPES).map(([key, item]) => (
                <div
                  key={key}
                  className="p-4 rounded-2xl border border-border bg-background/50 space-y-2 hover:border-[#C8A96B]/50 transition"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-medium text-foreground flex items-center gap-1.5">
                      <span>{item.icon}</span>
                      {item.name}
                    </span>
                    <span className="text-[10px] font-mono text-[#C8A96B] font-bold">
                      {(item.rate * 100).toFixed(1)}%
                    </span>
                  </div>
                  <p className="text-[11px] text-muted-foreground">{item.description}</p>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-mono text-muted-foreground">
                      $
                    </span>
                    <Input
                      type="number"
                      min="0"
                      value={itemAmounts[key] || ""}
                      onChange={(e) => handleItemChange(key, Number(e.target.value))}
                      className="pl-7 text-xs font-mono rounded-xl bg-card border-border"
                      placeholder="0.00"
                    />
                  </div>
                </div>
              ))}
            </div>

            <div className="pt-4 border-t border-border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <p className="text-xs text-muted-foreground font-mono uppercase">Total Declared Assets</p>
                <p className="text-2xl font-serif font-light text-foreground">
                  ${totalDeclaredWealth.toLocaleString("en-US", { minimumFractionDigits: 2 })}
                </p>
              </div>

              <div className="flex items-center gap-2">
                {totalDeclaredWealth >= nisabThreshold ? (
                  <span className="px-3 py-1 rounded-full text-xs font-medium bg-[#123D32]/10 dark:bg-[#C8A96B]/20 text-[#123D32] dark:text-[#C8A96B] flex items-center gap-1.5">
                    <CheckCircle className="w-3.5 h-3.5" />
                    Exceeds Nisab • Zakat Obligatory
                  </span>
                ) : (
                  <span className="px-3 py-1 rounded-full text-xs font-medium bg-muted text-muted-foreground flex items-center gap-1.5">
                    <Info className="w-3.5 h-3.5" />
                    Below Nisab • No Zakat Due
                  </span>
                )}
              </div>
            </div>
          </TabsContent>

          {/* TAB 2: RESULT SUMMARY */}
          <TabsContent value="result" className="p-6 sm:p-8 space-y-6">
            <div className="p-8 rounded-3xl bg-gradient-to-br from-[#123D32] to-[#174C3D] dark:from-[#174C3D] dark:to-[#101A16] text-[#F7F5EF] space-y-3 shadow-lg">
              <span className="text-[10px] font-mono uppercase tracking-widest text-[#A9B9A7]">
                Annual Purified Obligation
              </span>
              <div className="text-5xl font-serif font-light text-[#F7F5EF] tracking-tight">
                ${zakatDue.toLocaleString("en-US", { minimumFractionDigits: 2 })}
              </div>
              <p className="text-xs text-[#A9B9A7] leading-relaxed max-w-lg">
                {zakatDue > 0
                  ? "May Allah purify your wealth, grant barakah to your family, and accept your giving. Zakat is the divine right of those in need."
                  : "Your total eligible assets do not currently reach the Nisab threshold ($" +
                    nisabThreshold.toFixed(2) +
                    "). Voluntary charity (Sadaqah) is always encouraged."}
              </p>
            </div>

            {/* Breakdown Table */}
            {zakatDue > 0 && (
              <div className="space-y-3">
                <h4 className="font-serif text-sm font-semibold text-foreground">
                  Itemized Distribution Breakdown
                </h4>
                <div className="rounded-2xl border border-border divide-y divide-border overflow-hidden bg-background/50">
                  {Object.entries(itemAmounts).map(([key, amount]) => {
                    const rate = ZAKAT_TYPES[key]?.rate || 0.025
                    const z = calculateZakat(amount, rate)
                    if (z <= 0) return null
                    return (
                      <div key={key} className="p-3.5 flex items-center justify-between text-xs">
                        <span className="font-medium text-foreground">{ZAKAT_TYPES[key]?.name}</span>
                        <div className="text-right font-mono">
                          <span className="text-muted-foreground mr-3">From ${amount.toLocaleString()}</span>
                          <span className="font-bold text-[#123D32] dark:text-[#C8A96B]">${z.toFixed(2)}</span>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            )}

            {/* Quranic Recipients of Zakat (Surah At-Tawbah 9:60) */}
            <div className="p-5 rounded-2xl border border-border bg-card space-y-2 text-xs">
              <span className="font-serif font-semibold text-foreground">
                The Eight Prescribed Categories (Surah At-Tawbah 9:60)
              </span>
              <p className="text-muted-foreground leading-relaxed text-[11px]">
                Zakat may only be disbursed to: 1. The impoverished (Al-Fuqara), 2. The destitute (Al-Masakin), 3. Those employed to administer it, 4. Those whose hearts are to be reconciled, 5. For freeing captives, 6. Those burdened with debt, 7. In the cause of Allah, and 8. The stranded wayfarer.
              </p>
            </div>
          </TabsContent>

          {/* TAB 3: SETTINGS */}
          <TabsContent value="settings" className="p-6 sm:p-8 space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-xs font-mono uppercase text-muted-foreground">
                  Gold Nisab Standard (grams)
                </label>
                <Input
                  type="number"
                  value={nisabValue}
                  onChange={(e) => setNisabValue(Number(e.target.value))}
                  className="rounded-xl border-border bg-card text-xs font-mono"
                />
                <p className="text-[11px] text-muted-foreground">
                  Classical standard: 85 grams of pure gold (approx. 20 dinars).
                </p>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-mono uppercase text-muted-foreground">
                  Gold Price per Gram ($ USD)
                </label>
                <Input
                  type="number"
                  value={goldPrice}
                  onChange={(e) => setGoldPrice(Number(e.target.value))}
                  className="rounded-xl border-border bg-card text-xs font-mono"
                />
                <p className="text-[11px] text-muted-foreground">
                  Update with your local spot market gold bullion rate.
                </p>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </Card>
    </div>
  )
}
