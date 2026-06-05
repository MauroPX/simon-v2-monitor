'use client'
import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export type ConnectionState = 'connecting' | 'live' | 'demo' | 'error' | 'stale'
export type DataSource = 'live' | 'demo'

const DEFAULT_LAYER_ORDER = ['vehicle-list', 'map', 'status-card']

interface AppStoreV2 {
  connectionState: ConnectionState
  dataSource: DataSource
  layerOrder: string[]
  setConnectionState: (state: ConnectionState) => void
  setDataSource: (source: DataSource) => void
  setLayerOrder: (order: string[]) => void
  reorderLayer: (from: number, to: number) => void
}

export const useAppStoreV2 = create<AppStoreV2>()(
  persist(
    (set) => ({
      connectionState: 'connecting',
      dataSource: 'demo',
      layerOrder: DEFAULT_LAYER_ORDER,

      setConnectionState: (connectionState) => set({ connectionState }),
      setDataSource: (dataSource) => set({ dataSource }),
      setLayerOrder: (layerOrder) => set({ layerOrder }),

      reorderLayer: (from, to) =>
        set(state => {
          const order = [...state.layerOrder]
          const [moved] = order.splice(from, 1)
          order.splice(to, 0, moved)
          return { layerOrder: order }
        }),
    }),
    {
      name: 'simon-v2-layers',
      partialize: (state) => ({ layerOrder: state.layerOrder }),
    }
  )
)
