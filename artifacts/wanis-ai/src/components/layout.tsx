import * as React from "react"
import { Link, useLocation } from "wouter"
import { Home, HeartPulse, Users, BookOpen, Shield, MessageCircle } from "lucide-react"
import { cn } from "@/lib/utils"

const navItems = [
  { name: "Home", href: "/", icon: Home },
  { name: "Check-in", href: "/check-in", icon: HeartPulse },
  { name: "Family", href: "/family", icon: Users },
  { name: "Memory", href: "/memory", icon: BookOpen },
  { name: "Companion", href: "/companion", icon: MessageCircle },
  { name: "Guardian", href: "/guardian", icon: Shield, guardian: true },
]

export function Navigation() {
  const [location] = useLocation()
  
  return (
    <>
      {/* Mobile Bottom Tab Bar */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 h-[80px] bg-background border-t border-border z-50 px-2 pb-safe flex justify-around items-center">
        {navItems.map((item) => {
          const isActive = location === item.href || (item.href !== "/" && location.startsWith(item.href))
          const isGuardian = item.guardian
          
          return (
            <Link 
              key={item.name} 
              href={item.href}
              className={cn(
                "flex flex-col items-center justify-center w-full h-full min-h-[48px] gap-1 transition-colors relative",
                isActive 
                  ? (isGuardian ? "text-primary" : "text-primary") // guardian theme variable will apply
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              <item.icon className={cn("w-6 h-6", isActive && isGuardian && "text-[#2F6D4F]")} />
              <span className="text-[10px] font-medium">{item.name}</span>
              {isActive && (
                <span className={cn(
                  "absolute top-1 w-1.5 h-1.5 rounded-full",
                  isGuardian ? "bg-[#2F6D4F]" : "bg-primary"
                )} />
              )}
            </Link>
          )
        })}
      </div>

      {/* Desktop Sidebar */}
      <div className="hidden md:flex w-64 flex-col fixed inset-y-0 left-0 bg-card border-r border-border z-50">
        <div className="p-6">
          <h1 className="text-2xl font-serif font-bold text-foreground">Wanis</h1>
        </div>
        <nav className="flex-1 px-4 space-y-2">
          {navItems.map((item) => {
            const isActive = location === item.href || (item.href !== "/" && location.startsWith(item.href))
            const isGuardian = item.guardian
            
            return (
              <Link
                key={item.name}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 px-4 py-3 rounded-xl transition-colors min-h-[48px]",
                  isActive
                    ? (isGuardian ? "bg-[#2F6D4F]/10 text-[#2F6D4F] font-medium" : "bg-primary/10 text-primary font-medium")
                    : "text-foreground/70 hover:bg-black/5 hover:text-foreground"
                )}
              >
                <item.icon className={cn("w-5 h-5", isActive && isGuardian && "text-[#2F6D4F]")} />
                <span className="text-base">{item.name}</span>
              </Link>
            )
          })}
        </nav>
      </div>
    </>
  )
}
