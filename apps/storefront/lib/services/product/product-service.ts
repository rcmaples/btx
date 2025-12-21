import {
  getProducts,
  getProductBySlug,
  getFilterOptions,
  getProductsClient,
  getProductBySlugClient,
  getFilterOptionsClient,
} from '../sanity/queries';
import type {
  ProductService,
  ProductFilters,
  Product,
  FilterOptions,
} from '@/lib/types';

class ProductServiceImpl implements ProductService {
  // Server-side methods (use sanityFetch with Next.js cache)
  async getProducts(
    filters?: ProductFilters,
    isMember?: boolean
  ): Promise<Product[]> {
    return getProducts({
      roastLevel: filters?.roastLevel,
      origin: filters?.origin,
      processMethod: filters?.processMethod,
      bestFor: filters?.bestFor,
      isMember: isMember || false,
      exclusiveOnly: filters?.exclusiveOnly,
    });
  }

  async getProductBySlug(slug: string): Promise<Product | null> {
    return getProductBySlug(slug);
  }

  async getFilterOptions(): Promise<FilterOptions> {
    return getFilterOptions();
  }

  // Client-safe methods (use clientFetch without Next.js cache)
  async getProductsClient(
    filters?: ProductFilters,
    isMember?: boolean
  ): Promise<Product[]> {
    return getProductsClient({
      roastLevel: filters?.roastLevel,
      origin: filters?.origin,
      processMethod: filters?.processMethod,
      bestFor: filters?.bestFor,
      isMember: isMember || false,
      exclusiveOnly: filters?.exclusiveOnly,
    });
  }

  async getProductBySlugClient(slug: string): Promise<Product | null> {
    return getProductBySlugClient(slug);
  }

  async getFilterOptionsClient(): Promise<FilterOptions> {
    return getFilterOptionsClient();
  }
}

export const productService = new ProductServiceImpl();
