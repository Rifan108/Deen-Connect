"use client"

import React from "react"
import Link from "next/link"

export default function Header() {
  return (
    <header className="border-b border-border bg-card/60 backdrop-blur-sm sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
        <Link href="/home" className="flex items-center gap-3 group">
          <div className="w-9 h-9 rounded-xl bg-[#123D32] dark:bg-[#174C3D] border border-[#C8A96B]/40 flex items-center justify-center text-[#C8A96B] font-serif font-bold text-sm">
            د
          </div>
          <div>
            <h1 className="text-xl font-serif font-medium text-foreground">Deen Connect</h1>
            <p className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground">Digital Sanctuary</p>
          </div>
        </Link>
        <div className="text-right">
          <p className="text-xs font-mono text-muted-foreground">
            {new Date().toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric", year: "numeric" })}
          </p>
        </div>
      </div>
    </header>
  )
}
