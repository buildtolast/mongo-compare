import { createContext, useContext, useState, ReactNode } from 'react'

interface TabsContextValue {
  activeTab: string
  setActiveTab: (tab: string) => void
}

const TabsContext = createContext<TabsContextValue | undefined>(undefined)

export function Tabs({
  children,
  defaultTab,
}: {
  children: ReactNode
  defaultTab: string
}) {
  const [activeTab, setActiveTab] = useState(defaultTab)

  return (
    <TabsContext.Provider value={{ activeTab, setActiveTab }}>
      {children}
    </TabsContext.Provider>
  )
}

export function TabList({ children }: { children: ReactNode }) {
  return <div className="flex border-b border-slate-700 space-x-1">{children}</div>
}

export function Tab({
  id,
  children,
  className = '',
}: {
  id: string
  children: ReactNode
  className?: string
}) {
  const context = useContext(TabsContext)
  if (!context) throw new Error('Tab must be used within Tabs')

  return (
    <button
      className={`px-4 py-2 text-sm font-medium rounded-t-lg transition-colors ${
        context.activeTab === id
          ? 'bg-slate-800 text-emerald-400 border-b-2 border-emerald-500'
          : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
      } ${className}`}
      onClick={() => context.setActiveTab(id)}
    >
      {children}
    </button>
  )
}

export function TabPanel({
  id,
  children,
}: {
  id: string
  children: ReactNode
}) {
  const context = useContext(TabsContext)
  if (!context) throw new Error('TabPanel must be used within Tabs')

  if (context.activeTab !== id) return null

  return <div className="py-4">{children}</div>
}
