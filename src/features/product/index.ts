// Screens
export {
  ProductMenuScreen,
  ProductManagementScreen,
  EditProductScreen,
  SupplierManagementScreen,
  LocationManagementScreen,
  CategoryManagementScreen,
} from './screens';

// Components
export { ProductCard, ProductApiCard, ProductFilterModal, ImageUploadSection } from './components';

// Hooks - Legacy
export { useProducts } from './hooks/useProducts';

// Hooks - New API Hooks
export {
  useProducts as useProductsAPI,
  PRODUCT_QUERY_KEYS,
} from './hooks/useProducts';
export { useProduct } from './hooks/useProduct';
export {
  useProductMutations,
  useCreateProduct,
  useUpdateProduct,
  useDeleteProduct,
} from './hooks/useProductMutations';
export {
  useCategories,
  CATEGORY_QUERY_KEYS,
} from './hooks/useCategories';
export { useCategory } from './hooks/useCategory';
export {
  useCategoryMutations,
  useCreateCategory,
  useUpdateCategory,
  useDeleteCategory,
} from './hooks/useCategoryMutations';

// Variation Hooks
export {
  useVariations,
  VARIATION_QUERY_KEYS,
} from './hooks/useVariations';
export { useVariation } from './hooks/useVariation';
export {
  useVariationMutations,
  useCreateVariation,
  useUpdateVariation,
  useDeleteVariation,
} from './hooks/useVariationMutations';

// Supplier Hooks
export {
  useSuppliers,
  SUPPLIER_QUERY_KEYS,
} from './hooks/useSuppliers';
export { useSupplier } from './hooks/useSupplier';
export {
  useSupplierMutations,
  useCreateSupplier,
  useUpdateSupplier,
  useDeleteSupplier,
} from './hooks/useSupplierMutations';

// Location Hooks
export {
  useLocations,
  LOCATION_QUERY_KEYS,
} from './hooks/useLocations';
export { useLocation } from './hooks/useLocation';
export {
  useLocationMutations,
  useCreateLocation,
  useUpdateLocation,
  useDeleteLocation,
} from './hooks/useLocationMutations';

// Services
export { productService } from './services/productService';
export { categoryService } from './services/categoryService';
export { variationService } from './services/variationService';
export { supplierService } from './services/supplierService';
export { locationService } from './services/locationService';

// Types - Legacy
export type {
  Product,
  ProductStatus,
  FilterOptions,
  ProductListParams,
  Category,
} from './types';

// Types - New API Types
export type {
  // Product Types
  ProductResponse,
  ProductCreateRequest,
  ProductUpdateRequest,
  ProductApiResponse,
  ProductListApiResponse,
  ProductFormData,
  ProductFormErrors,
  // Category Types
  CategoryResponse,
  CategoryCreateRequest,
  CategoryUpdateRequest,
  CategoryApiResponse,
  CategoryListApiResponse,
  CategoryFormData,
  CategoryFormErrors,
  // Variation Types
  Variation,
  VariationStatus,
  VariationResponse,
  VariationCreateRequest,
  VariationUpdateRequest,
  VariationApiResponse,
  VariationListApiResponse,
  VariationFormData,
  VariationFormErrors,
  // Instance Types
  ProductInstance,
  InstanceStatus,
  InstanceResponse,
  InstanceCreateRequest,
  InstanceUpdateRequest,
  InstanceApiResponse,
  InstanceListApiResponse,
  InstanceFormData,
  InstanceFormErrors,
  ProductDto,
  LocationDto,
  // Supplier Types
  Supplier,
  SupplierResponse,
  SupplierCreateRequest,
  SupplierUpdateRequest,
  SupplierApiResponse,
  SupplierListApiResponse,
  SupplierFormData,
  SupplierFormErrors,
  SupplierListParams,
  PageResponseSupplier,
  // Location Types
  Location,
  LocationResponse,
  LocationCreateRequest,
  LocationUpdateRequest,
  LocationApiResponse,
  LocationListApiResponse,
  LocationFormData,
  LocationFormErrors,
  LocationListParams,
  PageResponseLocation,
  // Common Types
  ApiResponse,
  PageResponseProduct,
  PageResponseCategory,
} from './types';
