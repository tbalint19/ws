import type { AppClient } from "../../api/appClient";

export type NewOffer = Parameters<AppClient['api']['offers']['post']>[0]
export type Offer = NonNullable<Awaited<ReturnType<AppClient['api']['offers']['post']>>['data']>

export type NewBundleOfOffer = Parameters<AppClient['api']['bundle-of-offer']['post']>[0]
export type BundleOfOffer = NonNullable<Awaited<ReturnType<AppClient['api']['bundle-of-offer']['post']>>['data']>

export type Bundle = NonNullable<Awaited<ReturnType<ReturnType<AppClient['api']['bundles']>['get']>>['data']>[0]
export type Product = NonNullable<Awaited<ReturnType<AppClient['api']['products']['get']>>['data']>[0]

export type Location = NonNullable<Awaited<ReturnType<AppClient['api']['locations']['get']>>['data']>[0]
export type OfferOfLocation = NonNullable<Awaited<ReturnType<AppClient['api']['offer-of-location']['get']>>['data']>[0]['offer_of_location']

export type ProductProperty = NonNullable<Awaited<ReturnType<ReturnType<AppClient['api']['properites']>['get']>>['data']>[0]