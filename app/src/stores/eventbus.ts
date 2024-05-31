import { writable, type Writable } from "svelte/store"
import type { Bundle, BundleOfOffer, Offer } from "../api/types/output"
type Mapping = {
  UPDATED_OFFER: BundleOfOffer
  EDIT_OFFER: Offer
  OPEN_OFFER: { offer: Offer, bundle: Bundle }
  BUNDLE_OF_OFFER_AMOUNT_PATCHED: BundleOfOffer
  BUNDLE_OF_OFFER_AMOUNT_DELETED: BundleOfOffer
}

type GlobalEvent<T extends keyof Mapping> = {
  type: T
  payload: Mapping[T]
}

export type EventBus = {
  publish: <T extends keyof Mapping>(type: T, payload: Mapping[T]) => void
  subscribe: <T extends keyof Mapping>(eventType: T, cb: (payload: Mapping[T]) => void) => void
}

const isEventOfType = <T extends keyof Mapping>(event: undefined | GlobalEvent<keyof Mapping>, type: T): event is GlobalEvent<T> => {
  return !!event && event.type === type;
}

export const createGlobalEventBus = (): EventBus => {

  const store = writable<GlobalEvent<keyof Mapping>>()

  const publish = <T extends keyof Mapping>(type: T, payload: Mapping[T]) => store.set({ type, payload })

  const subscribe = <T extends keyof Mapping>(eventType: T, cb: (payload: Mapping[T]) => void) => {
    store.subscribe(nativeEvent => {
      if (isEventOfType(nativeEvent, eventType)) {
        cb(nativeEvent.payload)
      }
    })
  }

  return { publish, subscribe }
}
