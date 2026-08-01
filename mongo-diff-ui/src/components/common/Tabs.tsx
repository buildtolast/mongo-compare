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
  return <div className="flex border-b border-[var(--border)] space-x-1">{children}</div>
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
          ? 'bg-[var(--panel)] text-[var(--accent)] border-b-2 border-[var(--accent)]'
          : 'text-[var(--text-muted)] hover:text-[var(--text-2)] hover:bg-[var(--panel)]'
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
