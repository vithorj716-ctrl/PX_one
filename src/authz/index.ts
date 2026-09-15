// PXOne — ponto de entrada da camada de autorização (frontend).
export * from "./catalog";
export * from "./access";
export * from "./route-map";
export { AuthzProvider, useAuthz, ACCESS_QUERY_KEY } from "./authz-context";
export { getMyAccess, getUserAccess } from "./access.functions";
export {
  fetchMyEffectiveAccess,
  clearAuthorization,
  normalizeAccess,
  AccessLoadError,
  EMPTY_PAYLOAD,
  type EffectiveAccessPayload,
} from "./access-client";
