import type { AppClient } from "../../api/appClient";

export type NewOffer = Parameters<AppClient['api']['offers']['post']>[0]
export type Offer = NonNullable<Awaited<ReturnType<AppClient['api']['offers']['post']>>['data']>

export type NewBundleOfOffer = Parameters<AppClient['api']['bundle-of-offer']['post']>[0]
export type BundleOfOffer = NonNullable<Awaited<ReturnType<AppClient['api']['bundle-of-offer']['post']>>['data']>

export type Bundle = NonNullable<Awaited<ReturnType<ReturnType<AppClient['api']['bundles']>['get']>>['data']>[0]
export type Product = NonNullable<Awaited<ReturnType<AppClient['api']['products']['get']>>['data']>[0]